import { Mystery, Clue } from '../engine/types';

export const CLUES: Clue[] = [
  {
    id: 'clue_family_register',
    mysteryId: 'fifth_place_setting',
    title: 'The Family Register',
    description: 'A handwritten register listing four Ashcombe household members. The dining table seats five.',
    sourceRoom: 'library',
  },
  {
    id: 'clue_burned_letter',
    mysteryId: 'fifth_place_setting',
    title: 'The Burned Letter',
    description: 'A fragment of a letter mentioning "the fifth chair" and "the child."',
    sourceRoom: 'study',
  },
  {
    id: 'clue_missing_portrait',
    mysteryId: 'missing_portrait',
    title: 'The Empty Frame',
    description: 'An impression of a child in a room that doesn\'t exist. "NOT FORGOTTEN" scratched into the gilt.',
    sourceRoom: 'portrait_gallery',
  },
  {
    id: 'clue_hidden_dates',
    mysteryId: 'missing_portrait',
    title: 'The Construction Dates',
    description: 'Six versions of this house have been built. The last is dated three years from now.',
    sourceRoom: 'portrait_gallery',
  },
  {
    id: 'clue_music_box_tune',
    mysteryId: 'fifth_place_setting',
    title: 'The Music Box Inscription',
    description: '"For our fifth, who the house keeps safe." A lullaby from someone else\'s memory.',
    sourceRoom: 'nursery',
  },
  {
    id: 'clue_child_drawings',
    mysteryId: 'fifth_place_setting',
    title: 'The Nursery Drawings',
    description: 'Drawings of the house in different arrangements. A small figure always stands in a room that doesn\'t exist yet.',
    sourceRoom: 'nursery',
  },
];

export const MYSTERIES: Mystery[] = [
  {
    id: 'fifth_place_setting',
    title: 'The Fifth Place Setting',
    question: 'Who is the unrecorded fifth member of the Ashcombe household?',
    description: 'The dining table is set for five. The register lists four. Someone has been erased — or hasn\'t arrived yet.',
    clueIds: ['clue_family_register', 'clue_burned_letter', 'clue_music_box_tune', 'clue_child_drawings'],
    requiredClues: 3,
    resolution: 'The Ashcombes had a fifth child — or will have one. The house was built to keep them safe, or to bring them into being. The nursery exists for someone who hasn\'t been born in any version of this timeline.',
    reward: {
      type: 'unlockRoom',
      value: 'sealed_bedroom',
      description: 'The Sealed Bedroom is now available in the draft.',
    },
  },
  {
    id: 'missing_portrait',
    title: 'The Missing Portrait',
    question: 'Whose portrait was removed, and why?',
    description: 'An empty frame in the gallery. A portrait removed recently from a house abandoned long ago.',
    clueIds: ['clue_missing_portrait', 'clue_hidden_dates'],
    requiredClues: 2,
    resolution: 'The portrait depicted the fifth child — the one the family tried to erase from the records. It was removed not to hide them, but because the portrait kept changing. The child in the painting aged.',
    reward: {
      type: 'upgrade',
      value: 'gallery_insight',
      description: 'The Portrait Gallery now reveals one additional clue per visit.',
    },
  },
];

const CLUE_MAP = new Map<string, Clue>();
CLUES.forEach(c => CLUE_MAP.set(c.id, c));

const MYSTERY_MAP = new Map<string, Mystery>();
MYSTERIES.forEach(m => MYSTERY_MAP.set(m.id, m));

export function getClue(id: string): Clue | undefined {
  return CLUE_MAP.get(id);
}

export function getMystery(id: string): Mystery | undefined {
  return MYSTERY_MAP.get(id);
}
