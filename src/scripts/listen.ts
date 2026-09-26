/**
 * 02 · Listen, and the chapter bar.
 *
 * Listen: the cursor steps through the passage (one step per --step-ms), each
 * note turns plum as it sounds and its key lights in the hand's colour. Loops
 * calmly; paused off screen and while the tab is hidden.
 * Chapter bar: it shows while the hero, #choose or #listen fills the middle
 * band of the viewport, but over the hero only once the visitor has scrolled
 * past its top 40%, so it never covers the first view or the ending. The
 * current chapter is Try while the hero is in the band, otherwise the section
 * on a line across the middle of the viewport.
 */

type Note = [pitch: string, hand: 'rh' | 'lh', dur: number];

const END_REST_MS = 1400; // after the last note
const FADE_MS = 600; // notes return to ink, cursor fades

export function startListen(): void {
  const root = document.querySelector<HTMLElement>('[data-listen]');
  const ps = root?.querySelector<HTMLElement>('[data-practice]');
  if (!root || !ps) return;

  const xs = ps.dataset.xs!.split(',').map(Number);
  const barOf = ps.dataset.bars!.split(',').map(Number);
  const steps: Note[][] = JSON.parse(ps.dataset.steps!);
  const subTpl = ps.dataset.subtitle!;
  const firstBar = Number(ps.dataset.firstBar);
  const sub = ps.querySelector('[data-subtitle-text]')!;
  const cursor = ps.querySelector<SVGRectElement>('.cursor')!;
  const keys = [...ps.querySelectorAll<HTMLElement>('.key')];
  const keyOf = new Map(keys.map((k) => [k.dataset.note!, k]));
  const stepMs = parseFloat(getComputedStyle(root).getPropertyValue('--step-ms')) || 900;

  let inView = false;
  let step = 0;
  let timer = 0;
  let next: (() => void) | null = null;

  /* ---------- drawing ---------- */
  const setCursor = (s: number) => {
    cursor.style.setProperty('--cx', String(xs[s] - xs[0]));
    sub.textContent = subTpl.replace('{bar}', String(firstBar + barOf[s]));
  };
  const light = (notes: Note[]) => {
    keys.forEach((k) => k.removeAttribute('data-lit'));
    for (const [p, h] of notes) keyOf.get(p)?.setAttribute('data-lit', h);
  };

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

  /* ---------- the loop ---------- */
  // Every note sounding on step s (the left hand holds across steps).
  const sounding = (s: number) => steps.flatMap((notes, t) => (t <= s ? notes.filter((n) => t + n[2] > s) : []));
  const listenStep = () => {
    setCursor(step);
    light(sounding(step));
    ps.querySelectorAll(`.note[data-step="${step}"]`).forEach((n) => n.classList.add('is-played'));
    if (step < steps.length - 1) {
      step++;
      after(listenStep, stepMs);
    } else
      // Rest, fade back to ink, return the (hidden) cursor to the start, go again.
      after(() => {
        light([]);
        ps.querySelectorAll('.note.is-played').forEach((n) => n.classList.remove('is-played'));
        cursor.classList.add('is-hidden');
        after(() => {
          step = 0;
          setCursor(0);
          cursor.classList.remove('is-hidden');
          after(listenStep, stepMs / 2);
        }, FADE_MS);
      }, END_REST_MS);
  };

  new IntersectionObserver((entries) => {
    for (const e of entries)
      if (inView !== e.isIntersecting) {
        inView = e.isIntersecting;
        sync();
      }
  }).observe(root);
  document.addEventListener('visibilitychange', sync);
  setCursor(0);
  after(listenStep, stepMs / 2);

  /* ---------- chapter bar ---------- */
  const bar = document.querySelector<HTMLElement>('[data-chapter-bar]');
  if (!bar) return;
  const links = [...bar.querySelectorAll<HTMLAnchorElement>('[data-chapter-link]')];
  const sections = links.map((a) => document.getElementById(a.dataset.chapterLink!)).filter((s) => s !== null);
  const hero = document.getElementById('try');

  const inBand = new Set<Element>();
  let centre = 'try'; // the chapter on the middle line of the viewport
  const pastHeroTop = () => !hero || hero.getBoundingClientRect().top < -0.4 * hero.offsetHeight;
  const update = () => {
    const onHero = hero !== null && inBand.has(hero);
    const current = onHero ? 'try' : centre;
    bar.classList.toggle('is-shown', inBand.size > 0 && (!onHero || pastHeroTop()));
    links.forEach((a) => (a.dataset.chapterLink === current ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  };
  const line = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) centre = e.target.id;
      update();
    },
    { rootMargin: '-50% 0px -50% 0px' },
  );
  const band = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.isIntersecting ? inBand.add(e.target) : inBand.delete(e.target);
      update();
    },
    { rootMargin: '-35% 0px -35% 0px' },
  );
  for (const s of sections) {
    line.observe(s);
    band.observe(s);
  }
  // Only while the hero is in the band does the scroll position matter.
  addEventListener('scroll', () => hero && inBand.has(hero) && update(), { passive: true });
  bar.hidden = false;
}
