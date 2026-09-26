/**
 * Hero "Try it: Für Elise", Wait Mode. The music flows to you: the current
 * note sits in a fixed band at the centre and the staff (a "tape") glides left
 * after each right note (CSS transition on --x, TryItStaff.astro).
 * Right key: the key dips, a thread of plum light rises from it to the note,
 * the note blooms plum, the music glides on. Wrong key: the key dips and a
 * faint thread rises partway and fades. Every press sounds, right or wrong.
 * After the last note the phrase settles in the centre and ripples once, the
 * copy crossfades and "Play again" appears. Reduced motion: no glide, thread,
 * ring or breathing; colours change at once.
 * Input: pointer (mouse, touch, pen), focused key + Enter/Space, and computer
 * keys (src/data/tryIt.ts) while the hero is on screen.
 */
import { computerKeys, melody, staff, tryIt } from '../data/tryIt';
import { play, preload, unlock } from './piano-sound';

const STORE = 'pp-sound';
const OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function startTryIt(): void {
  const root = document.querySelector<HTMLElement>('[data-try-it]');
  if (!root) return;
  const $ = <T extends Element>(s: string) => root.querySelector<T>(s)!;

  const staffEl = $<HTMLElement>('[data-try-staff]');
  const tape = $<SVGSVGElement>('[data-tape]');
  const notes = [...tape.querySelectorAll<SVGGElement>('.note')];
  const kb = $<HTMLElement>('[data-try-keys]');
  const keys = [...kb.querySelectorAll<HTMLButtonElement>('button')];
  const keyOf = new Map(keys.map((k) => [k.dataset.note!, k]));
  const status = $<HTMLElement>('[data-status]');
  const after = $<HTMLElement>('[data-after]');
  const soundBtn = $<HTMLButtonElement>('[data-sound]');
  const threads = $<SVGSVGElement>('[data-threads]');
  const grad = $<SVGElement>('[data-grad]');
  const starts = root.querySelectorAll('[data-start]');
  const dones = root.querySelectorAll<HTMLElement>('[data-done]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const moving = () => !reduce.matches;

  dones[0].textContent = root.dataset.doneHeadline!;
  dones[1].textContent = root.dataset.doneSub!;

  let i = 0;
  let done = false;
  let inView = false;
  let seen = false;
  let loaded = false;
  let timer = 0;
  let sound = true;
  try {
    sound = localStorage.getItem(STORE) !== 'off';
  } catch {}

  /* ---------- sound ---------- */
  const load = () => {
    if (loaded || !sound) return;
    loaded = true;
    const idle = window.requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 300));
    idle(() => preload(), { timeout: 4000 });
  };
  const showSound = () => {
    soundBtn.setAttribute('aria-pressed', String(sound));
    soundBtn.setAttribute('aria-label', sound ? tryIt.sound.on : tryIt.sound.off);
  };
  soundBtn.hidden = false;
  showSound();
  soundBtn.addEventListener('click', () => {
    sound = !sound;
    try {
      localStorage.setItem(STORE, sound ? 'on' : 'off');
    } catch {}
    if (sound) {
      unlock();
      if (seen) load();
    }
    showSound();
  });
  // iOS lets audio start only on a completed touch: resume there too.
  const wake = () => sound && unlock();
  root.addEventListener('touchend', wake, { passive: true });
  root.addEventListener('pointerup', wake);

  /* ---------- drawing ---------- */
  const say = (msg: string) => {
    status.textContent = '';
    window.setTimeout(() => (status.textContent = msg), 60);
  };
  const next = () => tryIt.status.next(melody[i].name);
  const glide = (x: number) => tape.style.setProperty('--x', String(x));

  const dip = (k: HTMLElement, ok: boolean) => {
    const black = k.classList.contains('key--black');
    k.style.setProperty('--press', ok ? 'var(--color-accent)' : 'var(--color-ink-faint)');
    k.querySelector('.press')!.animate([{ opacity: black ? 0.9 : ok ? 0.16 : 0.3 }, { opacity: 0 }], {
      duration: 420,
      easing: 'ease-out',
    });
    if (moving())
      k.animate([{ transform: 'none' }, { transform: 'translateY(2px)', offset: 0.3 }, { transform: 'none' }], {
        duration: 220,
        easing: OUT,
      });
  };

  /** A thread of light from the key's top to the note in the playhead. */
  const thread = (k: HTMLElement, ok: boolean) => {
    if (!moving()) return;
    const box = root.getBoundingClientRect();
    const kr = k.getBoundingClientRect();
    const sr = staffEl.getBoundingClientRect();
    const hr = notes[i].querySelector('.head')!.getBoundingClientRect();
    const x0 = kr.left + kr.width / 2 - box.left;
    const y0 = kr.top - box.top - 4;
    const x1 = sr.left + sr.width / 2 - box.left;
    const y1 = hr.bottom - box.top + 8;
    const m = (y0 + y1) / 2;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', `M${x0} ${y0}C${x0} ${m} ${x1} ${m} ${x1} ${y1}`);
    p.setAttribute('pathLength', '1');
    if (ok) {
      grad.setAttribute('y1', String(y0));
      grad.setAttribute('y2', String(y1));
    } else p.classList.add('is-miss');
    threads.append(p);
    p.animate(
      ok
        ? [
            { strokeDashoffset: 1, opacity: 1, easing: OUT },
            { strokeDashoffset: 0, opacity: 1, offset: 0.4, easing: 'ease' },
            { strokeDashoffset: 0, opacity: 0 },
          ]
        : [
            { strokeDashoffset: 1, opacity: 0.9, easing: OUT },
            { strokeDashoffset: 0.62, opacity: 0.9, offset: 0.5, easing: 'ease' },
            { strokeDashoffset: 0.62, opacity: 0 },
          ],
      { duration: ok ? 560 : 350 },
    ).onfinish = () => p.remove();
  };

  const ring = (n: SVGGElement, delay: number, from = 0.8, to = 0.7) =>
    n.querySelector('.ring')!.animate(
      [
        { opacity: to, transform: `scale(${from})` },
        { opacity: 0, transform: 'scale(2)' },
      ],
      { duration: 520, delay, easing: OUT },
    );

  /* ---------- state ---------- */
  const target = () => {
    const pitch = done ? '' : melody[i].pitch;
    const focusIn = kb.contains(document.activeElement);
    for (const k of keys) {
      const lit = k.dataset.note === pitch;
      k.toggleAttribute('data-lit', lit);
      if (!done) k.tabIndex = lit ? 0 : -1;
      if (lit && focusIn) k.focus({ preventScroll: true });
    }
  };

  const setDone = (d: boolean) => {
    done = d;
    root.classList.toggle('is-done', d);
    starts.forEach((s) => s.toggleAttribute('aria-hidden', d));
    dones.forEach((s) => s.setAttribute('aria-hidden', String(!d)));
    after.inert = !d;
  };

  const press = (pitch: string) => {
    const k = keyOf.get(pitch);
    if (!k) return;
    if (sound) {
      unlock();
      play(Number(k.dataset.midi));
    }
    if (done) return dip(k, true);
    const ok = pitch === melody[i].pitch;
    dip(k, ok);
    thread(k, ok);
    if (!ok) return say(`${tryIt.status.wrong}. ${next()}`);

    notes[i].classList.add('is-played');
    if (moving()) ring(notes[i], 140);
    i++;
    if (i < melody.length) {
      glide(melody[i].x);
      target();
      say(`${tryIt.status.correct}. ${next()}`);
      return;
    }
    // The last note: the phrase settles in the middle and ripples once.
    setDone(true);
    target();
    say(tryIt.status.done);
    timer = window.setTimeout(() => {
      glide(staff.doneX);
      if (moving()) notes.forEach((n, j) => ring(n, 700 + j * 70, 0.9, 0.45));
    }, 420);
  };

  const reset = () => {
    const focusAgain = after.contains(document.activeElement);
    window.clearTimeout(timer);
    notes.forEach((n) => n.classList.remove('is-played'));
    i = 0;
    setDone(false);
    glide(melody[0].x);
    target();
    if (focusAgain) keyOf.get(melody[0].pitch)!.focus({ preventScroll: true });
    say(next());
  };
  $<HTMLButtonElement>('[data-again]').addEventListener('click', reset);

  /* ---------- input ---------- */
  const keyFrom = (e: Event) => (e.target as Element).closest<HTMLButtonElement>('button');
  kb.addEventListener('pointerdown', (e) => {
    const k = keyFrom(e);
    if (k && e.button <= 0) press(k.dataset.note!);
  });
  kb.addEventListener('click', (e) => {
    const k = keyFrom(e);
    if (k && e.detail === 0) press(k.dataset.note!); // Enter / Space on a focused key
  });
  kb.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    const visible = keys.filter((k) => k.offsetParent !== null);
    const at = visible.indexOf(document.activeElement as HTMLButtonElement);
    if (!d || at < 0) return;
    e.preventDefault();
    visible[Math.min(visible.length - 1, Math.max(0, at + d))].focus();
  });
  document.addEventListener('keydown', (e) => {
    if (!inView || e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    const t = e.target as HTMLElement;
    if (t.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    const pitch = computerKeys[e.code];
    if (!pitch) return;
    e.preventDefault();
    press(pitch);
  });

  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    if (inView) {
      seen = true;
      load();
    }
  }).observe(root);

  keys.forEach((k) => (k.disabled = false));
  root.classList.add('is-live');
  target();
}
