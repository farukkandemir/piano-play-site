/**
 * Copy and content for "02 · Listen / 03 · Play" (docs/spec.md §5 item 4),
 * plus the chapter bar that stays pinned from Choose to Play.
 */

export type ChapterId = 'choose' | 'listen' | 'play';

export const chapters = {
  listen: {
    id: 'listen',
    label: '02 · Listen',
    title: 'Hear it before you play it.',
    line: 'A real grand piano plays the passage, and every note lights up as it sounds.',
  },
  // DRAFT: Play copy is pending the owner's sign-off (spec §10 item 4).
  play: {
    id: 'play',
    label: '03 · Play',
    title: 'Your piano listens.',
    line: 'The sheet waits until you play the right notes, then moves on.',
  },
} as const;

/** Pinned chapter bar. `href` targets: #choose (Choose.astro), #listen and #play (ListenPlay.astro). */
export const chapterBar = {
  ariaLabel: 'Chapters',
  items: [
    { id: 'choose', label: 'Choose', href: '#choose' },
    { id: 'listen', label: 'Listen', href: '#listen' },
    { id: 'play', label: 'Play', href: '#play' },
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
 * (1 = quarter, 4 = whole). Listen plays one step every --step-ms (900 ms);
 * Play waits until every note that starts on the step has been pressed.
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

/**
 * Computer keys for Play, by KeyboardEvent.code (physical position, so it
 * works on any layout). Home row = white keys from C4, the row above = black
 * keys, the bottom row = white keys from C3. Other keys play nothing.
 *   A S D F G H J K L ; '   →  C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5
 *   W E   T Y U   O P       →  C#4 D#4  F#4 G#4 A#4  C#5 D#5
 *   Z X C V B N M           →  C3 D3 E3 F3 G3 A3 B3
 */
export const computerKeys: Record<string, string> = {
  KeyA: 'C4', KeyS: 'D4', KeyD: 'E4', KeyF: 'F4', KeyG: 'G4', KeyH: 'A4', KeyJ: 'B4',
  KeyK: 'C5', KeyL: 'D5', Semicolon: 'E5', Quote: 'F5',
  KeyW: 'C#4', KeyE: 'D#4', KeyT: 'F#4', KeyY: 'G#4', KeyU: 'A#4', KeyO: 'C#5', KeyP: 'D#5',
  KeyZ: 'C3', KeyX: 'D3', KeyC: 'E3', KeyV: 'F3', KeyB: 'G3', KeyN: 'A3', KeyM: 'B3',
};

/** Text equivalents and screen-reader messages. */
export const a11y = {
  screenDescription:
    'The piano.play practice screen: three bars of Ode to Joy on a grand staff, above an on-screen piano keyboard. In Listen, a cursor moves note by note and the matching keys light up, blue for the right hand and orange for the left.',
  playHint:
    'Try it: play the highlighted keys with your mouse or finger, or with your computer keyboard (A S D F G H J for C to B, Z X C V B N M an octave lower).',
  keyboardLabel: 'Piano keyboard',
  play: (notes: string) => `Play ${notes}`,
  correct: 'Correct',
  wrong: 'Not quite',
  done: 'Well played. Starting again.',
};
