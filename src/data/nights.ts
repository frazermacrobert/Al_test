import { NightObjective } from '../engine/types';

export const NIGHT_OBJECTIVES: NightObjective[] = [
  {
    title: 'A House Reintroduced',
    description: 'Explore at least two rooms and learn what the house offers.',
    flavour: 'The house settles around you. Floorboards creak in welcome — or warning.',
    optional: {
      title: 'Build the Scholarly Wing',
      description: 'Place the Library and Study adjacent to each other.',
    },
  },
  {
    title: 'The Provident Heir',
    description: 'Gather at least 3 Silver from the house\'s hidden caches.',
    flavour: 'Money moves strangely here. Coins appear in flour tins and coat pockets, as if the house wants you well-funded.',
    optional: {
      title: 'Domestic Harmony',
      description: 'Place the Kitchen adjacent to the Entrance Hall.',
    },
  },
  {
    title: 'Five Seats, Four Names',
    description: 'Find at least one clue about the fifth place setting.',
    flavour: 'Someone set the table for five. The family register lists four. Count again.',
    optional: {
      title: 'The Memory Wing',
      description: 'Place both the Nursery and Portrait Gallery in the same mansion.',
    },
  },
  {
    title: 'What the Portraits Know',
    description: 'Visit the Portrait Gallery and uncover what the empty frame conceals.',
    flavour: 'Four faces watch from gilt frames. The fifth frame holds only darkness — and an impression.',
    optional: {
      title: 'A Thorough Search',
      description: 'Spend all three of your Actions this night.',
    },
  },
  {
    title: 'Behind Closed Doors',
    description: 'Use a Key to unlock a hidden interaction.',
    flavour: 'The house has locked rooms. Locked drawers. Locked memories. You have a key that\'s warm to the touch.',
    optional: {
      title: 'The Candlelit Investigation',
      description: 'Spend a Candle on a supernatural search.',
    },
  },
];

export function getNightObjective(nightNumber: number): NightObjective {
  const index = (nightNumber - 1) % NIGHT_OBJECTIVES.length;
  return NIGHT_OBJECTIVES[index];
}
