import type { ImageMetadata } from 'astro';
import clairDeLune from '../assets/covers/clair-de-lune-easy.webp';
import gymnopedie from '../assets/covers/gymnopedie-1.webp';
import bachPrelude from '../assets/covers/bach-prelude-c.webp';
import furElise from '../assets/covers/fur-elise.webp';
import chopinNocturne from '../assets/covers/chopin-nocturne-op9-2.webp';
import liebestraum from '../assets/covers/liszt-liebestraum-3.webp';

export interface Piece {
  /** Catalog id in the app (`assets/catalog/covers/<id>.webp`). */
  id: string;
  title: string;
  composer: string;
  image: ImageMetadata;
}

/** Chapter 1 · Choose (Paper: "D · The music room" → "Chapter 1 · Choose"). */
export const choose = {
  label: '01 · Choose',
  title: 'Any piece you want.',
  body: 'Bring your own sheet music from MuseScore, or start with free pieces from Bach to Satie. Each one gets a painted cover.',
  pieces: [
    { id: 'clair-de-lune-easy', title: 'Clair de Lune', composer: 'Debussy', image: clairDeLune },
    { id: 'gymnopedie-1', title: 'Gymnopédie No. 1', composer: 'Satie', image: gymnopedie },
    { id: 'bach-prelude-c', title: 'Prelude in C', composer: 'Bach', image: bachPrelude },
    { id: 'fur-elise', title: 'Für Elise', composer: 'Beethoven', image: furElise },
    { id: 'chopin-nocturne-op9-2', title: 'Nocturne Op. 9 No. 2', composer: 'Chopin', image: chopinNocturne },
    { id: 'liszt-liebestraum-3', title: 'Liebestraum No. 3', composer: 'Liszt', image: liebestraum },
  ] satisfies Piece[],
} as const;
