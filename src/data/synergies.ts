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
      clueId: 'hidden_dates',
    },
  },
  {
    id: 'entertainment_wing',
    name: 'The Entertainment Wing',
    description: 'The Music Room and Ballroom recall grander times. The house rewards celebration.',
    requiredRooms: ['music_room', 'ballroom'],
    conditionType: 'adjacency',
    effect: {
      type: 'resource',
      description: '+2 Silver from the echoes of old galas.',
      resourceType: 'silver',
      amount: 2,
    },
  },
  {
    id: 'below_stairs',
    name: 'Below Stairs',
    description: 'The Servants\' Quarters and Kitchen are connected. The staff knew every secret passage.',
    requiredRooms: ['servants_quarters', 'kitchen'],
    conditionType: 'adjacency',
    effect: {
      type: 'action',
      description: '+1 Action from servant efficiency.',
      resourceType: 'actions',
      amount: 1,
    },
  },
  {
    id: 'natural_philosophy',
    name: 'Natural Philosophy',
    description: 'The Observatory and Conservatory together form a centre of inquiry. Light reveals more.',
    requiredRooms: ['observatory', 'conservatory'],
    conditionType: 'set',
    effect: {
      type: 'resource',
      description: '+2 Candles from combining starlight and herbalism.',
      resourceType: 'candles',
      amount: 2,
    },
  },
];

export function getSynergyDefinitions(): SynergyDefinition[] {
  return SYNERGY_DEFINITIONS;
}
