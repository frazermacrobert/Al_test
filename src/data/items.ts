import { ItemDefinition } from '../engine/types';

export const ITEM_DEFINITIONS: ItemDefinition[] = [
  {
    id: 'prepared_meal',
    name: 'Prepared Meal',
    icon: 'M3 10h10M4 7h8a1 1 0 011 1v2H3V8a1 1 0 011-1zM6 7V5M10 7V5',
    description: 'A warm meal from the kitchen. Someone in the house might appreciate it.',
  },
  {
    id: 'vintage_wine',
    name: 'Vintage Wine',
    icon: 'M6 2h4v3l1 3v4a2 2 0 01-2 2H7a2 2 0 01-2-2V8l1-3V2',
    description: 'A bottle from the cellar, dated the year the fifth child was born.',
  },
  {
    id: 'dried_herbs',
    name: 'Dried Herbs',
    icon: 'M8 14V6M5 4c1 2 3 3 3 3M11 4c-1 2-3 3-3 3M4 8c2 0 3-1 4-2M12 8c-2 0-3-1-4-2',
    description: 'Fragrant herbs gathered from the garden. Useful for medicine or experiment.',
  },
  {
    id: 'brass_key',
    name: 'Brass Key',
    icon: 'M5 8a3 3 0 116 0 3 3 0 01-6 0zM10 8h4M12 6v4M14 7v2',
    description: 'A small brass key, warm to the touch. It fits several locks in the house.',
  },
  {
    id: 'old_photograph',
    name: 'Old Photograph',
    icon: 'M3 4h10v8H3V4zM3 9l3-2 2 1 3-3 2 2M5 7a1 1 0 110-2 1 1 0 010 2',
    description: 'A sepia photograph showing five figures. The fifth face is unclear.',
  },
  {
    id: 'sheet_music',
    name: 'Sheet Music',
    icon: 'M4 3v10M4 5h6v-2M10 3v8M7 7a2 2 0 11-4 0M13 9a2 2 0 11-4 0',
    description: 'Handwritten music. The melody is unfamiliar but the notation is precise.',
  },
  {
    id: 'silver_bell',
    name: 'Silver Bell',
    icon: 'M8 2v2M5 4a5 5 0 0110 0l-1 6H4L3 4M7 12h2M6 14h4',
    description: 'A silver service bell. Ring it and someone — or something — will answer.',
  },
  {
    id: 'candelabra',
    name: 'Candelabra',
    icon: 'M8 14V8M5 14h6M4 4v4h2V4M8 2v6M12 4v4h-2V4M4 4h2M10 4h2',
    description: 'A heavy branched candlestick. Its light reaches further than it should.',
  },
  {
    id: 'iron_key',
    name: 'Iron Key',
    icon: 'M4 8a4 4 0 118 0 4 4 0 01-8 0zM11 8h3M13 6v4',
    description: 'Cold and heavy. This key opens doors that were meant to stay closed.',
  },
];

const ITEM_MAP = new Map<string, ItemDefinition>();
ITEM_DEFINITIONS.forEach(i => ITEM_MAP.set(i.id, i));

export function getItemDefinition(id: string): ItemDefinition | undefined {
  return ITEM_MAP.get(id);
}
