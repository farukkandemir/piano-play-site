/**
 * 02 · Listen / 03 · Play, and the chapter bar.
 *
 * Listen: the cursor steps through the passage (one step per --step-ms), each
 * note turns plum as it sounds and its key lights in the hand's colour. Loops
 * calmly; paused off screen and while the tab is hidden.
 * Play: the keyboard wakes up (pointer, touch, computer keys). The keys of the
 * current step are lit; pressing all of them turns the notes plum and moves the
 * cursor on. A wrong key flashes and nudges the sheet (flash only under
 * reduced motion). Silent. The phone itself never moves.
 * Chapters are tracked with IntersectionObserver on a line across the middle
 * of the viewport; the chapter bar shows while #choose or this section is on screen.
 */
import { a11y, computerKeys } from '../data/listenPlay';

type Hand = 'rh' | 'lh';
type Note = [pitch: string, hand: Hand, dur: number];
type Chapter = 'choose' | 'listen' | 'play';

const END_REST_MS = 1400; // after the last note
const FADE_MS = 600; // notes return to ink, cursor fades
const ADVANCE_MS = 140; // beat between the right note and the cursor moving on

export function startListenPlay(): void {
  const root = document.querySelector<HTMLElement>('[data-listen-play]');
  const ps = root?.querySelector<HTMLElement>('[data-practice]');
  if (!root || !ps) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const xs = ps.dataset.xs!.split(',').map(Number);
  const barOf = ps.dataset.bars!.split(',').map(Number);
  const steps: Note[][] = JSON.parse(ps.dataset.steps!);
  const subTpl = ps.dataset.subtitle!;
  const firstBar = Number(ps.dataset.firstBar);
  const sub = ps.querySelector('[data-subtitle-text]')!;
  const cursor = ps.querySelector<SVGRectElement>('.cursor')!;
  const sheet = ps.querySelector<HTMLElement>('.sheet')!;
  const keysEl = ps.querySelector<HTMLElement>('[data-keys]')!;
  const keys = [...keysEl.querySelectorAll<HTMLButtonElement>('.key')];
  const keyOf = new Map(keys.map((k) => [k.dataset.note!, k]));
  const status = root.querySelector<HTMLElement>('[data-status]')!;
  const stepMs = parseFloat(getComputedStyle(root).getPropertyValue('--step-ms')) || 900;
  const notesAt = (s: number, pitch?: string) =>
    ps.querySelectorAll(`.note[data-step="${s}"]${pitch ? `[data-pitch="${pitch}"]` : ''}`);

  let mode: 'listen' | 'play' = 'listen';
  let inView = false;
  let step = 0;
  let timer = 0;
  let next: (() => void) | null = null;
  let need = new Set<string>();
  let busy = false;

  /* ---------- drawing ---------- */
  const setCursor = (s: number) => {
    cursor.style.setProperty('--cx', String(xs[s] - xs[0]));
    sub.textContent = subTpl.replace('{bar}', String(firstBar + barOf[s]));
  };
  const light = (notes: Note[]) => {
    keys.forEach((k) => k.removeAttribute('data-lit'));
    for (const [p, h] of notes) keyOf.get(p)?.setAttribute('data-lit', h);
  };
  const unplay = () => ps.querySelectorAll('.note.is-played').forEach((n) => n.classList.remove('is-played'));
  const reset = () => {
    clearTimeout(timer);
    next = null;
    busy = false;
    unplay();
    step = 0;
    setCursor(0);
    light([]);
    cursor.classList.remove('is-hidden');
  };
  /** Rest, fade back to ink, return the (hidden) cursor to the start, then `then()`. */
  const loopBack = (then: () => void) =>
    after(() => {
      light([]);
      unplay();
      cursor.classList.add('is-hidden');
      after(() => {
        step = 0;
        setCursor(0);
        cursor.classList.remove('is-hidden');
        then();
      }, FADE_MS);
    }, END_REST_MS);

  /* ---------- timing (pausable) ---------- */
  const running = () => inView && !document.hidden;
  function after(fn: () => void, ms: number) {
    next = fn;
    clearTimeout(timer);
    if (running())
      timer = window.setTimeout(() => {
        next = null;
        fn();
      }, ms);
  }
  const sync = () => {
    clearTimeout(timer);
    if (running() && next) after(next, stepMs / 2);
  };

  /* ---------- Listen ---------- */
  const sounding = (s: number) => steps.flatMap((notes, t) => (t <= s ? notes.filter((n) => t + n[2] > s) : []));
  const listenStep = () => {
    setCursor(step);
    light(sounding(step));
    notesAt(step).forEach((n) => n.classList.add('is-played'));
    if (step < steps.length - 1) {
      step++;
      after(listenStep, stepMs);
    } else loopBack(() => after(listenStep, stepMs / 2));
  };

  /* ---------- Play ---------- */
  const label = (p: string) => keyOf.get(p)?.getAttribute('aria-label') ?? p;
  const say = (msg: string) => {
    status.textContent = '';
    window.setTimeout(() => (status.textContent = msg), 60);
  };
  const target = (prefix = '') => {
    need = new Set(steps[step].map((n) => n[0]));
    light(steps[step]);
    setCursor(step);
    const focusInKeys = keysEl.contains(document.activeElement);
    keys.forEach((k) => (k.tabIndex = -1));
    const first = keyOf.get(steps[step][0][0]);
    if (first) {
      first.tabIndex = 0;
      if (focusInKeys) first.focus({ preventScroll: true });
    }
    say(prefix + a11y.play([...need].map(label).join(' and ')));
  };
  const flash = (k: HTMLElement, cls: string, ms: number) => {
    k.classList.add(cls);
    window.setTimeout(() => k.classList.remove(cls), ms);
  };
  const press = (note: string) => {
    const k = keyOf.get(note);
    if (mode !== 'play' || busy || !k) return;
    flash(k, 'is-down', 150);
    if (need.delete(note)) {
      k.removeAttribute('data-lit');
      notesAt(step, note).forEach((n) => n.classList.add('is-played'));
      if (need.size) return;
      busy = true;
      window.setTimeout(() => {
        busy = false;
        if (mode !== 'play') return;
        if (step < steps.length - 1) {
          step++;
          target(`${a11y.correct}. `);
        } else {
          busy = true;
          say(a11y.done);
          loopBack(() => {
            busy = false;
            target();
          });
        }
      }, ADVANCE_MS);
    } else if (!steps[step].some((n) => n[0] === note)) {
      flash(k, 'is-wrong', 260);
      if (!reduce.matches)
        sheet.animate(
          [0, -4, 4, -2, 0].map((x) => ({ transform: `translateX(${x}px)` })),
          { duration: 320, easing: 'ease-out' },
        );
      say(`${a11y.wrong}. ${a11y.play([...need].map(label).join(' and '))}`);
    }
  };

  keysEl.addEventListener('pointerdown', (e) => {
    const k = (e.target as Element).closest<HTMLElement>('.key');
    if (!k || e.button > 0) return;
    let note = k.dataset.note!;
    // Keys are small on phones: a touch just beside a lit key counts as that key.
    if (e.pointerType === 'touch' && !need.has(note))
      for (const p of need) {
        const r = keyOf.get(p)!.getBoundingClientRect();
        const slop = Math.max(0, (28 - r.width) / 2);
        if (e.clientX > r.left - slop && e.clientX < r.right + slop) note = p;
      }
    press(note);
  });
  keysEl.addEventListener('click', (e) => {
    const k = (e.target as Element).closest<HTMLElement>('.key');
    if (k && e.detail === 0) press(k.dataset.note!); // Enter / Space on a focused key
  });
  keysEl.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    const i = keys.indexOf(document.activeElement as HTMLButtonElement);
    if (!d || i < 0) return;
    e.preventDefault();
    keys[Math.min(keys.length - 1, Math.max(0, i + d))].focus();
  });
  document.addEventListener('keydown', (e) => {
    if (mode !== 'play' || !inView || e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    const t = e.target as HTMLElement;
    if (t.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    const note = computerKeys[e.code];
    if (!note) return;
    e.preventDefault();
    press(note);
  });

  /* ---------- chapters ---------- */
  const setMode = (m: 'listen' | 'play') => {
    if (m === mode) return;
    mode = m;
    root.dataset.chapter = m;
    reset();
    keysEl.inert = m === 'listen';
    if (m === 'play') target();
    else {
      need.clear();
      status.textContent = '';
      after(listenStep, stepMs / 2);
    }
  };

  const bar = document.querySelector<HTMLElement>('[data-chapter-bar]');
  const links = bar ? [...bar.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]')] : [];
  const choose = document.getElementById('choose');
  const setChapter = (c: Chapter) => {
    links.forEach((a) => (a.dataset.chapterLink === c ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    setMode(c === 'play' ? 'play' : 'listen');
  };
  const centre = new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting) setChapter(((e.target as HTMLElement).dataset.chapterMark as Chapter) ?? 'choose');
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  if (choose) centre.observe(choose);
  root.querySelectorAll('[data-chapter-mark]').forEach((m) => centre.observe(m));

  // The bar shows only while Choose or Listen/Play fills the middle of the
  // viewport, so it never sits over the hero or the ending.
  const inBand = new Set<Element>();
  if (bar) bar.hidden = false;
  const band = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.isIntersecting ? inBand.add(e.target) : inBand.delete(e.target);
      bar?.classList.toggle('is-shown', inBand.size > 0);
    },
    { rootMargin: '-35% 0px -35% 0px' },
  );
  band.observe(root);
  if (choose) band.observe(choose);

  const seen = new IntersectionObserver((entries) => {
    for (const e of entries)
      if (inView !== e.isIntersecting) {
        inView = e.isIntersecting;
        sync();
      }
  });
  seen.observe(root);
  document.addEventListener('visibilitychange', sync);

  keysEl.inert = true;
  root.dataset.chapter = 'listen';
  reset();
  after(listenStep, stepMs / 2);
}
