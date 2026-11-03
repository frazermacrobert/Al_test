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
  {
    title: 'The House Rearranges',
    description: 'Discover a synergy between two rooms.',
    flavour: 'The rooms are not random. The house remembers which rooms belong together, and rewards those who listen.',
    optional: {
      title: 'An Efficient Evening',
      description: 'Complete all interactions in a single room.',
    },
  },
  {
    title: 'Deeper Corridors',
    description: 'Visit at least four rooms and search for hidden passages.',
    flavour: 'Tonight the house feels larger. Corridors stretch. Rooms multiply. The architecture breathes.',
    optional: {
      title: 'Generous Architecture',
      description: 'Earn resources from at least two different synergies.',
    },
  },
  {
    title: 'The Child\'s Trail',
    description: 'Find clues connected to the fifth child\'s story.',
    flavour: 'In the quiet hours, small footprints appear in the dust. They lead deeper into the house. They always have.',
    optional: {
      title: 'A Complete Map',
      description: 'Place all five draft rooms with valid door connections.',
    },
  },
];

export function getNightObjective(nightNumber: number): NightObjective {
  const index = (nightNumber - 1) % NIGHT_OBJECTIVES.length;
  return NIGHT_OBJECTIVES[index];
}
