import { RoomId, Rarity, HAND_SIZE } from './types';
import { getRoomDefinition } from '../data/rooms';
import { shuffle } from './rng';

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 40,
  uncommon: 25,
  rare: 15,
  exceptional: 8,
  forbidden: 3,
};

export function buildDraftPool(
  availableRooms: RoomId[],
  excludeIds: RoomId[],
  rng: () => number
): RoomId[] {
  const excluded = new Set(excludeIds);
  const candidates = availableRooms.filter(id => !excluded.has(id));

  const weighted: { id: RoomId; weight: number }[] = candidates.map(id => {
    const def = getRoomDefinition(id);
    const weight = def ? RARITY_WEIGHTS[def.rarity] : 10;
    return { id, weight };
  });

  const expanded: RoomId[] = [];
  for (const { id, weight } of weighted) {
    const count = Math.max(1, Math.round(weight / 10));
    for (let i = 0; i < count; i++) expanded.push(id);
  }

  return shuffle(expanded, rng);
}

export function drawHand(pool: RoomId[], placedIds: RoomId[]): RoomId[] {
  const placed = new Set(placedIds);
  const seen = new Set<RoomId>();
  const hand: RoomId[] = [];

  for (const id of pool) {
    if (placed.has(id) || seen.has(id)) continue;
    seen.add(id);
    hand.push(id);
    if (hand.length >= HAND_SIZE) break;
  }

  return hand;
}

export function removeFromPool(pool: RoomId[], chosen: RoomId): RoomId[] {
  let removed = false;
  return pool.filter(id => {
    if (!removed && id === chosen) {
      removed = true;
      return false;
    }
    return true;
  });
}
