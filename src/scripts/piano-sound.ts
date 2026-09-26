/**
 * Sampled piano for the hero: Salamander Grand Piano V3 (Alexander Holm,
 * CC BY 3.0), one velocity layer, a stereo sample every minor third from F#4
 * to C6 (public/sounds/piano, made by scripts/extract-samples.py). Other notes
 * are the nearest sample pitched by playbackRate.
 *
 * preload() fetches and decodes the samples (same origin, no AudioContext
 * needed); unlock() creates/resumes the AudioContext and must run inside a
 * user gesture. Nothing plays before unlock(). Striking a key that is still
 * ringing releases it over 60 ms; at most 8 voices sound at once.
 */

const ROOT0 = 66; // F#4; roots every 3 semitones
const FILES = ['fs4', 'a4', 'c5', 'ds5', 'fs5', 'a5', 'c6'];
const RELEASE = 0.06;
const MAX_VOICES = 8;
const WAIT_MS = 150;

type Voice = { midi: number; src: AudioBufferSourceNode; gain: GainNode };

let ctx: AudioContext | undefined;
let out: GainNode;
let decoder: BaseAudioContext | undefined;
const bufs: (AudioBuffer | undefined)[] = [];
const offsets: number[] = [];
const loads: (Promise<void> | undefined)[] = [];
const voices: Voice[] = [];

/** Seconds of leading silence (e.g. AAC priming a browser did not trim), minus 1 ms. */
function onset(b: AudioBuffer): number {
  const n = Math.min(b.length, b.sampleRate * 0.2);
  const chans = Array.from({ length: b.numberOfChannels }, (_, c) => b.getChannelData(c));
  for (let i = 0; i < n; i++) {
    if (chans.some((d) => Math.abs(d[i]) > 0.003)) return Math.max(0, i / b.sampleRate - 0.001);
  }
  return 0;
}

function load(i: number): Promise<void> {
  return (loads[i] ||= fetch(`/sounds/piano/${FILES[i]}.m4a`)
    .then((r) => {
      if (!r.ok) throw r.status;
      return r.arrayBuffer();
    })
    .then((data) => {
      decoder ||= ctx || new OfflineAudioContext(2, 1, 44100);
      return decoder.decodeAudioData(data);
    })
    .then((b) => {
      offsets[i] = onset(b);
      bufs[i] = b;
    })
    .catch(() => {
      loads[i] = undefined; // let a later call retry
    }));
}

/** Start fetching and decoding every sample (idempotent). */
export function preload(): void {
  try {
    FILES.forEach((_, i) => load(i));
  } catch {}
}

/** Create (first time) and resume the audio context. Call inside a user gesture. */
export function unlock(): void {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC({ latencyHint: 'interactive' });
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12;
    comp.knee.value = 12;
    comp.ratio.value = 3;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;
    out = ctx.createGain();
    out.gain.value = 0.8;
    out.connect(comp).connect(ctx.destination);

    // iOS: playing one silent sample inside the gesture unlocks output.
    const s = ctx.createBufferSource();
    s.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    s.connect(ctx.destination);
    s.start();
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  preload();
}

export const ready = (): boolean => !!ctx;

function release(v: Voice, t: number): void {
  voices.splice(voices.indexOf(v), 1);
  const g = v.gain.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(0, t + RELEASE);
  try {
    v.src.stop(t + RELEASE + 0.01);
  } catch {}
}

function start(midi: number, i: number): void {
  const c = ctx!;
  const t = c.currentTime;
  voices.filter((v) => v.midi === midi).forEach((v) => release(v, t));
  while (voices.length >= MAX_VOICES) release(voices[0], t);

  const src = c.createBufferSource();
  src.buffer = bufs[i]!;
  src.playbackRate.value = 2 ** ((midi - ROOT0 - 3 * i) / 12);
  const gain = c.createGain();
  src.connect(gain).connect(out);
  src.start(t, offsets[i]);
  const v: Voice = { midi, src, gain };
  voices.push(v);
  src.onended = () => {
    gain.disconnect();
    const k = voices.indexOf(v);
    if (k >= 0) voices.splice(k, 1);
  };
}

/** Strike a note (MIDI number). No-op until unlock() has run. */
export function play(midi: number): void {
  if (!ctx) return;
  const i = Math.min(FILES.length - 1, Math.max(0, Math.round((midi - ROOT0) / 3)));
  if (bufs[i]) return start(midi, i);
  const asked = performance.now();
  load(i).then(() => {
    if (bufs[i] && performance.now() - asked <= WAIT_MS) start(midi, i);
  });
}
