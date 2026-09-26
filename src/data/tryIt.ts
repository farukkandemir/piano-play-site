/**
 * Landing page hero "Try it: Für Elise". The music flows to you: the staff
 * glides left under a fixed playhead at the centre of the page, and a small
 * drawn keyboard sits beneath it. Copy, the melody as drawn, the keyboard
 * ranges and the computer keys all live here; the components
 * (src/components/home/TryIt*.astro) and the script (src/scripts/try-it.ts)
 * read from this file.
 */

export const tryIt = {
  label: 'Try it',
  headline: 'Play the first notes of Für Elise.',
  sub: 'The sheet waits for you. Tap the glowing key, or use your keyboard.',
  // DRAFT: end-state copy is pending the owner's sign-off.
  doneHeadline: 'That’s piano.play.',
  doneSub: 'Now imagine it on your own piano.',
  playAgain: 'Play again',
  sound: { on: 'Sound on', off: 'Sound off' },
  staffDescription:
    'Sheet music, treble clef: the opening of Für Elise. E, D sharp, E, D sharp, E, B, D, C, A. The note to play next sits at the centre, under a soft band.',
  keyboardLabel: 'Piano keyboard',
  status: {
    next: (name: string) => `Next note: ${name}`,
    correct: 'Correct',
    wrong: 'Not quite',
    done: 'Done',
  },
};

/**
 * Staff geometry in SVG user units, drawn for desktop (1 unit = 1 px, staff
 * space 22). Phones scale it down with --k in TryItStaff.astro. `pos` counts
 * staff steps (a line or a space) up from the bottom line, E4 = 0, so
 * y = bottom - pos * space / 2. `x` is the position along the moving tape;
 * the script glides the tape so the current note's x sits at the playhead.
 */
export const staff = {
  /** Tape width (clef to the last note, plus a little air). */
  width: 1300,
  height: 176,
  space: 22,
  top: 40,
  lineWidth: 1.5,
  barWidth: 1.6,
  barlines: [390, 1130],
  clef: { x: 20 }, // placed on the G line
  head: { rx: 12.8, ry: 9.2, angle: -20 },
  stem: { dx: 11.4, width: 2.2, upLength: 76 },
  beam: { height: 8.5, gap: 5 },
  ring: { r: 17, width: 1.5 },
  /** The quiet band marking "now", centred on the page. */
  playhead: { width: 56, top: 12, height: 150, radius: 18 },
  /** Where the tape rests when the phrase is done: the middle of the phrase. */
  doneX: 700,
};

export type Pitch = string; // 'E5', 'D#5'

export interface MelodyNote {
  pitch: Pitch;
  /** Spoken name for the live status ("D sharp"). */
  name: string;
  /** Staff steps above the bottom line (E4 = 0). */
  pos: number;
  x: number;
  accidental?: 'sharp';
  /** Index into `beams`, or undefined for an unbeamed note (stem up). */
  beam?: number;
}

/**
 * Pickup E5 D♯5 | E5 D♯5 E5 B4 D5 C5 | A4, in 3/8. Sixteenths, as in the
 * score: two beams per group, stems down. `bottom` is the lower edge of the
 * lower beam (staff bottom line is at 128).
 */
export const beams: { bottom: number; lines: 1 | 2 }[] = [
  { bottom: 154, lines: 2 },
  { bottom: 154, lines: 2 },
  { bottom: 160, lines: 2 },
];

export const melody: MelodyNote[] = [
  { pitch: 'E5', name: 'E', pos: 7, x: 200, beam: 0 },
  { pitch: 'D#5', name: 'D sharp', pos: 6, x: 320, accidental: 'sharp', beam: 0 },
  { pitch: 'E5', name: 'E', pos: 7, x: 460, beam: 1 },
  { pitch: 'D#5', name: 'D sharp', pos: 6, x: 580, accidental: 'sharp', beam: 1 },
  { pitch: 'E5', name: 'E', pos: 7, x: 700, beam: 1 },
  { pitch: 'B4', name: 'B', pos: 4, x: 820, beam: 2 },
  { pitch: 'D5', name: 'D', pos: 6, x: 940, beam: 2 },
  { pitch: 'C5', name: 'C', pos: 5, x: 1060, beam: 2 },
  { pitch: 'A4', name: 'A', pos: 3, x: 1200 },
];

/**
 * Keyboard ranges (MIDI numbers, both ends white keys), centred under the
 * playhead. Desktop G4–A5 (9 white keys); phones G4–F5 (7).
 */
export const keyboard = {
  full: { low: 67, high: 81 },
  sm: { low: 67, high: 77 },
};

/**
 * Computer keys by KeyboardEvent.code (physical position, any layout). The
 * melody sits on the home row; the row above holds the black keys.
 *   A S D F G H J K L  →  G4 A4 B4 C5 D5 E5 F5 G5 A5
 *   W E   T Y   I O    →  G♯4 A♯4  C♯5 D♯5  F♯5 G♯5
 */
export const computerKeys: Record<string, Pitch> = {
  KeyA: 'G4', KeyS: 'A4', KeyD: 'B4', KeyF: 'C5', KeyG: 'D5', KeyH: 'E5', KeyJ: 'F5', KeyK: 'G5', KeyL: 'A5',
  KeyW: 'G#4', KeyE: 'A#4', KeyT: 'C#5', KeyY: 'D#5', KeyI: 'F#5', KeyO: 'G#5',
};
