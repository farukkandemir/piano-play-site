/**
 * Copy and content for "02 · Listen" (docs/spec.md §5 item 4), plus the
 * chapter bar that stays pinned from the hero to Listen.
 */

export type ChapterId = 'try' | 'choose' | 'listen';

export const listen = {
  label: '02 · Listen',
  title: 'Hear it before you play it.',
  line: 'A real grand piano plays the passage, and every note lights up as it sounds.',
} as const;

/** Pinned chapter bar. `href` targets: #try (TryItHero.astro), #choose (Choose.astro), #listen (Listen.astro). */
export const chapterBar = {
  ariaLabel: 'Chapters',
  items: [
    { id: 'try', label: 'Try', href: '#try' },
    { id: 'choose', label: 'Choose', href: '#choose' },
    { id: 'listen', label: 'Listen', href: '#listen' },
  ] as { id: ChapterId; label: string; href: string }[],
};

/**
 * The phone around the practice screen.
 *
 * Apple's official landscape iPhone bezel (Apple Design Resources, under
 * Apple's licence) must be downloaded by the owner. To switch to it:
 *   1. save it as src/assets/images/iphone-bezel-landscape.png
 *   2. set `useImage: true` below
 *   3. set `screenInsets` to where the screen sits inside the PNG, as
 *      percentages of the PNG's width/height, and `screenRadius` as a
 *      percentage of the PNG's width.
 * Until then a neutral placeholder is drawn (Paper frame A9B-0 / A9C-0:
 * 964×462 ink frame, radius 64, 16 px border; screen 932×430, radius 50).
 * The phone is never tilted, shadowed or animated; only the screen moves.
 */
export const bezel = {
  useImage: false,
  file: 'iphone-bezel-landscape.png',
  screenInsets: { top: 3.46, right: 1.66, bottom: 3.46, left: 1.66 }, // % (placeholder geometry)
  screenRadius: 5.19, // % of phone width
  placeholder: { width: 964, height: 462, border: 16, radius: 64, screenRadius: 50 },
};

/** Practice screen header (the app's title bar). */
export const practice = {
  title: 'Ode to Joy',
  composer: 'Ludwig van Beethoven',
  firstBar: 5, // bars 5–7 of the melody; the measure number above the staff
  barsTotal: 16,
  /** {bar} is filled in live as the cursor crosses a barline. */
  subtitle: '{composer} · Bar {bar} of {total}',
  tools: ['Wait', 'Loop', 'Restart'],
};

/**
 * The passage: one quarter note per step in the right hand; the left hand
 * holds a whole note from the first beat of each bar. `dur` is in steps
 * (1 = quarter, 4 = whole). Listen plays one step every --step-ms (900 ms).
 */
export type Note = { pitch: string; hand: 'rh' | 'lh'; dur: 1 | 2 | 4 };
export type Step = Note[];

const rh = (pitch: string): Note => ({ pitch, hand: 'rh', dur: 1 });
const lh = (pitch: string): Note => ({ pitch, hand: 'lh', dur: 4 });

export const bars: Step[][] = [
  [[rh('E4'), lh('C3')], [rh('E4')], [rh('F4')], [rh('G4')]],
  [[rh('G4'), lh('G3')], [rh('F4')], [rh('E4')], [rh('D4')]],
  [[rh('C4'), lh('C3')], [rh('C4')], [rh('D4')], [rh('E4')]],
];

/** On-screen keyboard range: 28 white keys, C2 to B5 (as in Paper). */
export const keyboard = { lowest: 'C2', whiteKeys: 28 };

/** Text equivalent for the phone (which is decorative). */
export const a11y = {
  screenDescription:
    'The piano.play practice screen: three bars of Ode to Joy on a grand staff, above an on-screen piano keyboard. A cursor moves through the passage note by note, each note lights up as it sounds, and the matching keys light up, blue for the right hand and orange for the left.',
};
