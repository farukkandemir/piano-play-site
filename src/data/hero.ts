/**
 * Landing page hero: copy and the chords drawn on the grand staff.
 *
 * Staff geometry is in SVG user units and matches the Paper frame
 * "D · The music room" (hero, 1440 × 384): staff space 22, treble lines at
 * y 60–148, bass lines at y 236–324, barlines at x 160, 600, 1000.
 */
export const hero = {
  headline: 'That piece you always wanted to play.',
  sub: 'Connect your piano, open any piece, and practise at your own pace.',
  staffDescription:
    'Illustration: a grand staff with three bars of piano chords. A cursor steps from chord to chord and each chord turns plum as it is played.',
};

export type Stem = 'up' | 'down' | 'none';

export interface Chord {
  /** Centre of the note heads. */
  x: number;
  /** Treble note-head centres (y), top first. */
  treble: number[];
  trebleStem: Stem;
  /** Bass note-head centres (y). */
  bass: number[];
  bassStem: Stem;
}

export const staff = {
  width: 1440,
  height: 384,
  space: 22,
  trebleTop: 60,
  bassTop: 236,
  lineWidth: 1.3,
  barlines: [160, 600, 1000],
  /** The clefs sit on their own line: G line (treble), F line (bass). */
  trebleClef: { x: 176, y: 126 },
  bassClef: { x: 181, y: 258 },
  head: { rx: 13.64, ry: 9.68, angle: -20, hollowStroke: 2.6 },
  stem: { dx: 12.76, gap: 3, length: 69.6, width: 2 },
  cursor: { width: 80, top: 30, height: 324, radius: 12 },
  /** Index of the chord the cursor rests on in the still frame (as in Paper). */
  still: 3,
};

export const chords: Chord[] = [
  // Bar 1
  { x: 300, treble: [115, 137], trebleStem: 'up', bass: [291], bassStem: 'up' },
  { x: 410, treble: [104, 126], trebleStem: 'up', bass: [], bassStem: 'none' },
  { x: 520, treble: [93, 115], trebleStem: 'up', bass: [269], bassStem: 'down' },
  // Bar 2
  { x: 680, treble: [104, 126], trebleStem: 'up', bass: [280], bassStem: 'down' },
  { x: 790, treble: [115, 137], trebleStem: 'up', bass: [], bassStem: 'none' },
  { x: 900, treble: [126, 148], trebleStem: 'up', bass: [291], bassStem: 'up' },
  // Bar 3
  { x: 1100, treble: [115, 137], trebleStem: 'up', bass: [280], bassStem: 'down' },
  { x: 1230, treble: [104, 126], trebleStem: 'none', bass: [], bassStem: 'none' },
  { x: 1380, treble: [93, 115], trebleStem: 'up', bass: [269], bassStem: 'down' },
];
