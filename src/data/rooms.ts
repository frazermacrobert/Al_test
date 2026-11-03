import { RoomDefinition } from '../engine/types';

export const ROOM_DEFINITIONS: RoomDefinition[] = [
  {
    id: 'entrance_hall',
    name: 'Entrance Hall',
    description: 'The grand foyer of Ashcombe House. A chandelier hangs motionless above cracked marble tiles.',
    flavour: 'The front door is locked from the inside. You don\'t remember locking it.',
    rarity: 'common',
    doors: { N: true, S: false, E: true, W: true },
    tags: ['domestic', 'starting'],
    category: 'functional',
    interactions: [
      {
        id: 'entrance_inspect_chandelier',
        label: 'Look up at the chandelier',
        description: 'A vast iron chandelier, unlit. The candles have melted into shapes that look deliberate.',
        type: 'inspect',
        cost: {},
        outcome: {
          type: 'narrative',
          text: 'Forty-seven candles, each melted at a different angle. If you squint, the wax trails form something like a family tree.',
        },
        repeatable: false,
      },
      {
        id: 'entrance_inspect_tiles',
        label: 'Examine the floor tiles',
        description: 'The marble tiles are cracked in a pattern that doesn\'t look accidental.',
        type: 'inspect',
        cost: {},
        outcome: {
          type: 'narrative',
          text: 'The cracks radiate from a single point near the umbrella stand. As if something heavy was dropped here, once, with great conviction.',
        },
        repeatable: false,
      },
      {
        id: 'entrance_search_coatstand',
        label: 'Search the coat stand',
        description: 'A brass coat stand holds garments that haven\'t been worn in decades.',
        type: 'search',
        cost: { actions: 1 },
        outcome: {
          type: 'resource',
          resourceType: 'keys',
          amount: 1,
          text: 'In the pocket of a moth-eaten overcoat, you find a small brass key. It\'s warm, which is unusual for brass that nobody has touched.',
        },
        repeatable: false,
      },
    ],
  },
  {
    id: 'library',
    name: 'Library',
    description: 'Floor-to-ceiling shelves packed with leather-bound volumes. Some books appear to have been reshelved recently.',
    flavour: 'The catalogue system makes perfect sense until you notice the entries dated next year.',
    rarity: 'common',
    doors: { N: true, S: true, E: false, W: true },
    tags: ['intellectual', 'domestic'],
    category: 'discovery',
    interactions: [
      {
        id: 'library_inspect_shelves',
        label: 'Browse the shelves',
        description: 'Thousands of books, meticulously organised by a system you almost understand.',
        type: 'inspect',
        cost: {},
        outcome: {
          type: 'narrative',
          text: 'The Ashcombe collection spans architecture, botany, astronomy, and an entire shelf simply labelled "Apologies." Several books have been removed and not returned.',
        },
        repeatable: false,
      },
      {
        id: 'library_search_desk',
        label: 'Investigate the reading desk',
        description: 'An open book lies on the desk, a magnifying glass resting on the page.',
        type: 'search',
        cost: { actions: 1 },
        outcome: {
          type: 'clue',
          clueId: 'clue_family_register',
          text: 'A family register, handwritten. Four names under "Ashcombe Household." But the dining table in the brief seats five. Someone has been carefully erased from the record.',
        },
        repeatable: false,
      },
      {
        id: 'library_search_catalogue',
        label: 'Check the missing books',
        description: 'The catalogue has gaps. Something was removed deliberately.',
        type: 'search',
        cost: { actions: 1 },
        outcome: {
          type: 'resource',
          resourceType: 'silver',
          amount: 2,
          text: 'Behind where the missing books should be, someone has hidden a small velvet pouch containing two silver coins. Each is stamped with a floor plan.',
        },
        repeatable: false,
      },
    ],
  },
  {
    id: 'study',
    name: 'Study',
    description: 'A private study with a heavy oak desk, a cold fireplace, and walls lined with framed correspondence.',
    flavour: 'The ink in the pen is still wet. The chair is still warm.',
    rarity: 'common',
    doors: { N: false, S: true, E: true, W: false },
    tags: ['intellectual', 'domestic'],
    category: 'discovery',
    interactions: [
      {
        id: 'study_inspect_desk',
        label: 'Glance at the desk',
        description: 'Papers scattered in haste. A letter half-written, mid-sentence.',
        type: 'inspect',
        cost: {},
        outcome: {
          type: 'narrative',
          text: '"My dearest, by the time you read this I will have already—" The sentence ends there. The pen rolled off the page.',
        },
        repeatable: false,
      },
      {
        id: 'study_search_fireplace',
        label: 'Sift through the fireplace ash',
        description: 'The fireplace is cold but the ash is fresh. Something was burned recently.',
        type: 'search',
        cost: { actions: 1 },
        outcome: {
          type: 'clue',
          clueId: 'clue_burned_letter',
          text: 'A fragment survives: "...the fifth chair must never be empty. If the child returns, the house will remember what we—" The rest is ash.',
        },
        repeatable: false,
      },
      {
        id: 'study_search_drawer',
        label: 'Open the locked drawer',
        description: 'A desk drawer, locked. It rattles when you shake it.',
        type: 'search',
        cost: { actions: 1, keys: 1 },
        outcome: {
          type: 'resource',
          resourceType: 'candles',
          amount: 2,
          text: 'Two candles made of unusual dark wax, and a note: "Use these only when the house goes quiet. They see what ordinary light cannot."',
        },
        repeatable: false,
      },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    description: 'A vast kitchen with copper pots, a wood-burning stove, and a pantry that seems better stocked than an abandoned house should be.',
    flavour: 'The kettle is warm. You haven\'t lit the stove.',
    rarity: 'common',
    doors: { N: true, S: false, E: true, W: false },
    tags: ['domestic', 'functional'],
    category: 'functional',
    interactions: [
      {
        id: 'kitchen_inspect_stove',
        label: 'Check the stove',
        description: 'A cast-iron range, still faintly warm. Dinner was prepared here not long ago.',
        type: 'inspect',
        cost: {},
        outcome: {
          type: 'narrative',
          text: 'The stove has five burners. A pot on each. Whatever was cooked here was meant for more people than live in this house. Or ever did.',
        },
        repeatable: false,
      },
      {
        id: 'kitchen_gather',
        label: 'Gather provisions',
        description: 'The pantry has supplies. Enough to trade for useful things.',
        type: 'search',
        cost: { actions: 1 },
        outcome: {
          type: 'resource',
          resourceType: 'silver',
          amount: 2,
          text: 'You find tea, preserves, and — oddly — fresh bread. In the flour tin, someone has hidden coins. The house provides, it seems.',
        },
        repeatable: true,
      },
    ],
  },
  {
    id: 'portrait_gallery',
    name: 'Portrait Gallery',
    description: 'A long corridor of portraits. Four Ashcombes stare from gilt frames. A fifth frame holds only a dark rectangle.',
    flavour: 'Their eyes follow you. You\'re almost certain this isn\'t a metaphor.',
    rarity: 'unusual',
    doors: { N: true, S: true, E: false, W: false },
    tags: ['unsettling', 'discovery'],
    category: 'discovery',
    interactions: [
      {
        id: 'gallery_inspect_portraits',
        label: 'Study the family portraits',
        description: 'Four portraits in ornate frames: stern, kind, distant, secretive.',
        type: 'inspect',
        cost: {},
        outcome: {
          type: 'narrative',
          text: 'Lord Ashcombe, rigid and unamused. Lady Ashcombe, smiling at something outside the frame. Edgar, the eldest son, looking away. Helena, the youngest daughter, staring directly at you with an expression you can\'t quite name.',
        },
        repeatable: false,
      },
      {
        id: 'gallery_search_empty_frame',
        label: 'Examine the empty frame',
        description: 'The fifth frame. Something was here. Recently.',
        type: 'search',
        cost: { actions: 1 },
        outcome: {
          type: 'clue',
          clueId: 'clue_missing_portrait',
          text: 'The backing paper has a faint impression: a small figure, a child, standing in a room you don\'t recognise. On the frame\'s edge, scratched into the gilt: "NOT FORGOTTEN."',
        },
        repeatable: false,
      },
      {
        id: 'gallery_search_behind',
        label: 'Look behind the portraits',
        description: 'Victorian houses sometimes hide things behind their portraits.',
        type: 'search',
        cost: { actions: 1 },
        outcome: {
          type: 'clue',
          clueId: 'clue_hidden_dates',
          text: 'Behind Lord Ashcombe\'s portrait, pencilled dates: construction records for six different versions of this house. The last entry is dated three years from now.',
        },
        repeatable: false,
      },
    ],
  },
  {
    id: 'nursery',
    name: 'Nursery',
    description: 'A child\'s nursery, perfectly preserved. A music box plays when nobody winds it. Toys are arranged in patterns that feel significant.',
    flavour: 'This room is warm when every other room is cold.',
    rarity: 'unusual',
    doors: { N: false, S: true, E: true, W: true },
    tags: ['unsettling', 'story'],
    category: 'story',
    interactions: [
      {
        id: 'nursery_inspect_toys',
        label: 'Look at the toys',
        description: 'Wooden toys arranged in a careful circle on the floor.',
        type: 'inspect',
        cost: {},
        outcome: {
          type: 'narrative',
          text: 'Five wooden figures: a father, a mother, a boy, a girl, and a smaller figure with no face. They\'re arranged around a tiny wooden house. The faceless one is inside it.',
        },
        repeatable: false,
      },
      {
        id: 'nursery_search_musicbox',
        label: 'Wind the music box',
        description: 'A delicate silver music box. It was playing when you entered. It stopped when you looked at it.',
        type: 'search',
        cost: { actions: 1, candles: 1 },
        outcome: {
          type: 'clue',
          clueId: 'clue_music_box_tune',
          text: 'By candlelight, you see words engraved inside the lid: "For our fifth, who the house keeps safe." The tune is a lullaby you almost remember from someone else\'s childhood.',
        },
        repeatable: false,
      },
      {
        id: 'nursery_search_drawings',
        label: 'Examine the drawings on the wall',
        description: 'Children\'s drawings pinned to the wall. Crayon houses, stick figures, something less innocent.',
        type: 'search',
        cost: { actions: 1 },
        outcome: {
          type: 'clue',
          clueId: 'clue_child_drawings',
          text: 'Dozens of drawings of the same house, drawn from inside. Each one shows the rooms in a different arrangement. In every drawing, a small figure stands in a room that doesn\'t exist yet. The last drawing shows all the rooms connected. The figure is smiling.',
        },
        repeatable: false,
      },
    ],
  },
];

const ROOM_MAP = new Map<string, RoomDefinition>();
ROOM_DEFINITIONS.forEach(r => ROOM_MAP.set(r.id, r));

export function getRoomDefinition(id: string): RoomDefinition | undefined {
  return ROOM_MAP.get(id);
}

export function getPrototypeRoomIds(): string[] {
  return ROOM_DEFINITIONS.map(r => r.id);
}
