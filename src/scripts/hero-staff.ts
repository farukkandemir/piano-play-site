/**
 * Hero staff motion: the cursor steps chord to chord, each chord turns plum as
 * it is reached (CSS does the moving and colouring; this only flips classes and
 * --cx). After the last chord it rests, fades back to ink and starts over.
 * Paused off screen and while the tab is hidden; off for reduced motion.
 */
const PAUSE_MS = 2400; // rest after the last chord
const FADE_MS = 600; // cursor fades out, chords return to ink
const RETURN_MS = 1600; // cursor (hidden) and pan travel back to the first chord

export function startHeroStaff(): void {
  const root = document.querySelector<HTMLElement>('[data-hero-staff]');
  if (!root || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const stage = root.querySelector<HTMLElement>('.stage')!;
  const chords = [...root.querySelectorAll<SVGGElement>('.chord')];
  const step = parseFloat(getComputedStyle(root).getPropertyValue('--step-ms')) || 900;
  let i = chords.findIndex((c) => c.classList.contains('is-current'));

  let timer = 0;
  let next: (() => void) | null = null;
  let wait = 0;
  let inView = false;

  const schedule = (fn: () => void, ms: number) => {
    next = fn;
    wait = ms;
    if (inView && !document.hidden) timer = window.setTimeout(run, ms);
  };
  const run = () => {
    const fn = next;
    next = null;
    fn?.();
  };
  const sync = () => {
    clearTimeout(timer);
    if (inView && !document.hidden && next) timer = window.setTimeout(run, wait);
  };

  const moveTo = (n: number) => {
    chords[i]?.classList.remove('is-current');
    i = n;
    stage.style.setProperty('--cx', `${chords[n].dataset.x}px`);
    chords[n].classList.add('is-played', 'is-current');
  };

  const tick = () => {
    if (i < chords.length - 1) {
      moveTo(i + 1);
      schedule(tick, step);
    } else {
      schedule(reset, PAUSE_MS);
    }
  };

  const reset = () => {
    root.classList.add('is-resetting');
    chords.forEach((c) => c.classList.remove('is-played', 'is-current'));
    schedule(() => {
      i = 0;
      stage.style.setProperty('--cx', `${chords[0].dataset.x}px`);
      schedule(() => {
        root.classList.remove('is-resetting');
        moveTo(0);
        schedule(tick, step);
      }, RETURN_MS);
    }, FADE_MS);
  };

  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    sync();
  }).observe(root);
  document.addEventListener('visibilitychange', sync);

  schedule(tick, step);
}
