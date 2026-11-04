import { Mystery, Clue, ClueId } from '../engine/types';

export const CLUES: Clue[] = [
  // Mystery 1: The Fifth Place Setting
  { id: 'family_register', mysteryId: 'fifth_place_setting', title: 'The Family Register', description: 'The register lists only four names, but the coat stand has five hooks.', sourceRoom: 'library' },
  { id: 'servants_gossip', mysteryId: 'fifth_place_setting', title: 'Servants\' Gossip', description: '"There was a fifth, ma\'am. We don\'t speak the name, but the house sets the plate."', sourceRoom: 'servants_quarters' },
  { id: 'hidden_toybox', mysteryId: 'fifth_place_setting', title: 'The Hidden Toybox', description: 'A cat leads you to toys belonging to a child not in any family record.', sourceRoom: 'nursery' },
  { id: 'lullaby_cipher', mysteryId: 'fifth_place_setting', title: 'The Lullaby Cipher', description: 'The music box plays a lullaby with a name hidden in the melody: E-L-A-R-A.', sourceRoom: 'nursery' },
  { id: 'fifth_face', mysteryId: 'fifth_place_setting', title: 'The Fifth Face', description: 'The photograph shows five children. The fifth face has been scratched out.', sourceRoom: 'portrait_gallery' },
  { id: 'baptism_record', mysteryId: 'fifth_place_setting', title: 'The Baptism Record', description: 'A baptism for "Elara Ashcombe" — the date falls between the twins.', sourceRoom: 'chapel' },
  { id: 'family_tableau', mysteryId: 'fifth_place_setting', title: 'The Family Tableau', description: 'Every landscape painting shows the same child at a window — in a room that doesn\'t exist.', sourceRoom: 'drawing_room' },
  { id: 'family_fortune', mysteryId: 'fifth_place_setting', title: 'The Family Fortune', description: 'Payments to a specialist in "unusual children." The last note reads: "For the permanent arrangement."', sourceRoom: 'vault' },
  { id: 'hidden_dates', mysteryId: 'fifth_place_setting', title: 'The Hidden Dates', description: 'Cross-referencing the nursery toys with the gallery portraits reveals a gap — dates that belong to no recorded child.', sourceRoom: 'portrait_gallery' },

  // Mystery 2: The Missing Portrait
  { id: 'removed_portrait', mysteryId: 'missing_portrait', title: 'The Removed Portrait', description: 'The wall behind the empty frame is a different shade — recently uncovered.', sourceRoom: 'portrait_gallery' },
  { id: 'unsigned_letter', mysteryId: 'missing_portrait', title: 'The Unsigned Letter', description: '"Remove the portrait before anyone sees. What it shows cannot be explained."', sourceRoom: 'study' },
  { id: 'hidden_will', mysteryId: 'missing_portrait', title: 'The Hidden Will', description: 'A will leaving everything to "the child the portrait remembers."', sourceRoom: 'study' },
  { id: 'ballroom_whisper', mysteryId: 'missing_portrait', title: 'The Ballroom Whisper', description: '"I was there the night the portrait changed. It showed something that hadn\'t happened yet."', sourceRoom: 'ballroom' },
  { id: 'patient_record', mysteryId: 'missing_portrait', title: 'The Patient Record', description: 'Medical notes: "Patient insists the portrait predicted the fire three days before it happened."', sourceRoom: 'infirmary' },
  { id: 'childs_diary', mysteryId: 'missing_portrait', title: 'The Child\'s Diary', description: '"I didn\'t make the portrait change. I saw it. The house listens to me. Father says that\'s why I have to stay."', sourceRoom: 'sealed_bedroom' },
  { id: 'portrait_original', mysteryId: 'missing_portrait', title: 'The Original Portrait', description: 'The portrait they "burned" — showing Elara merging with the architecture itself.', sourceRoom: 'sealed_bedroom' },

  // Mystery 3: The Living Architecture
  { id: 'cellar_markings', mysteryId: 'living_architecture', title: 'The Cellar Markings', description: 'Tally marks on the cellar wall. Hundreds of them. Each one a different night.', sourceRoom: 'wine_cellar' },
  { id: 'pressed_flower', mysteryId: 'living_architecture', title: 'The Pressed Flower', description: 'A flower that shouldn\'t exist — it matches the wallpaper pattern exactly.', sourceRoom: 'conservatory' },
  { id: 'star_alignment', mysteryId: 'living_architecture', title: 'The Star Alignment', description: 'The star charts show the house\'s floorplan shifting to match astronomical patterns.', sourceRoom: 'observatory' },
  { id: 'spirit_testimony', mysteryId: 'living_architecture', title: 'The Spirit\'s Testimony', description: '"The house is alive. It was built to contain something. It rearranges to keep it hidden."', sourceRoom: 'seance_room' },
  { id: 'housekeeper_confession', mysteryId: 'living_architecture', title: 'The Housekeeper\'s Confession', description: '"I\'ve served forty years. The house is different every morning. It\'s looking for something."', sourceRoom: 'housekeepers_office' },
  { id: 'foundation_truth', mysteryId: 'living_architecture', title: 'The Foundation Truth', description: 'The foundation stones pulse with warmth. They are not stone.', sourceRoom: 'catacombs' },
  { id: 'architects_confession', mysteryId: 'living_architecture', title: 'The Architect\'s Confession', description: '"I did not design this house. It designed itself through me."', sourceRoom: 'the_archive' },
  { id: 'hidden_letters', mysteryId: 'living_architecture', title: 'The Hidden Letters', description: '"I\'m not locked in anymore. I\'m everywhere now. The house IS me."', sourceRoom: 'sealed_bedroom' },
  { id: 'prisoner_marks', mysteryId: 'living_architecture', title: 'The Prisoner\'s Marks', description: 'Floorplans carved into stone before architecture existed. Including this house.', sourceRoom: 'dungeon' },
  { id: 'final_truth', mysteryId: 'living_architecture', title: 'The Final Truth', description: 'Elara\'s floorplan — the one the house has been trying to build for forty years.', sourceRoom: 'the_archive' },
];

export const MYSTERIES: Mystery[] = [
  {
    id: 'fifth_place_setting',
    title: 'The Fifth Place Setting',
    question: 'Who is the missing fifth member of the Ashcombe family?',
    description: 'The dining table is set for five. The family register lists four. Someone is missing from the record — but not from the house.',
    clueIds: ['family_register', 'servants_gossip', 'hidden_toybox', 'lullaby_cipher', 'fifth_face', 'baptism_record', 'family_tableau', 'family_fortune', 'hidden_dates'],
    requiredClues: 3,
    resolution: 'The fifth child was Elara. Born between the twins, hidden from the register after the incident in the nursery. The house remembers her — it sets her place every night.',
    reward: {
      type: 'unlockTier',
      value: '2',
      description: 'New rooms emerge from the house\'s depths. The Ballroom, Infirmary, Bell Tower, Billiard Room, and Greenhouse now appear in your drafts.',
    },
  },
  {
    id: 'missing_portrait',
    title: 'The Missing Portrait',
    question: 'Why was one portrait removed from the gallery?',
    description: 'Four portraits hang in the gallery. The fifth frame holds only darkness — and an impression of something that was recently there.',
    clueIds: ['removed_portrait', 'unsigned_letter', 'hidden_will', 'ballroom_whisper', 'patient_record', 'childs_diary', 'portrait_original'],
    requiredClues: 3,
    resolution: 'The portrait showed the family as they would become, not as they were. After Elara\'s disappearance, it changed — showing five empty chairs. They burned it. The frame remains because the house won\'t let them remove it.',
    reward: {
      type: 'unlockTier',
      value: '3',
      description: 'Deeper rooms reveal themselves. The Vault, Observatory, Séance Room, Hidden Passage, and Housekeeper\'s Office now appear in your drafts.',
    },
  },
  {
    id: 'living_architecture',
    title: 'The Living Architecture',
    question: 'Why does the house rearrange itself every night?',
    description: 'Every night the rooms shift. The corridors lengthen. The architecture breathes. Something about this house is alive.',
    clueIds: ['cellar_markings', 'pressed_flower', 'star_alignment', 'spirit_testimony', 'housekeeper_confession', 'foundation_truth', 'architects_confession', 'hidden_letters', 'prisoner_marks', 'final_truth'],
    requiredClues: 4,
    resolution: 'The house is searching. Every night it rearranges its rooms, trying to find the configuration that opens the passage to where Elara is hidden. It has been trying for forty years. Tonight, with your help, it finally succeeded.',
    reward: {
      type: 'unlockTier',
      value: '4',
      description: 'The house reveals its deepest secrets. The Sealed Bedroom, Dungeon, Clocktower, Catacombs, and Archive now appear in your drafts.',
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
