import { SynergyDefinition } from '../engine/types';

export const SYNERGY_DEFINITIONS: SynergyDefinition[] = [
  {
    id: 'scholarly_wing',
    name: 'The Scholarly Wing',
    description: 'The Library and Study together form a research suite. Knowledge flows more freely.',
    requiredRooms: ['library', 'study'],
    conditionType: 'adjacency',
    effect: {
      type: 'action',
      description: '+1 Action when both rooms are placed adjacent.',
      resourceType: 'actions',
      amount: 1,
    },
  },
  {
    id: 'domestic_quarter',
    name: 'The Domestic Quarter',
    description: 'The Kitchen and Entrance Hall together make the house feel lived-in. Provisions come easier.',
    requiredRooms: ['kitchen', 'entrance_hall'],
    conditionType: 'adjacency',
    effect: {
      type: 'resource',
      description: 'Start the night with +1 Silver.',
      resourceType: 'silver',
      amount: 1,
    },
  },
  {
    id: 'memory_wing',
    name: 'The Memory Wing',
    description: 'The Nursery and Portrait Gallery resonate. Something about the absent child becomes clearer.',
    requiredRooms: ['nursery', 'portrait_gallery'],
    conditionType: 'set',
    effect: {
      type: 'clue',
      description: 'A hidden connection between the child and the family becomes visible.',
      clueId: 'clue_hidden_dates',
    },
  },
];

export function getSynergyDefinitions(): SynergyDefinition[] {
  return SYNERGY_DEFINITIONS;
}
