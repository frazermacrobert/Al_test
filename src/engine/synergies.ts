import { SynergyId, PlacedRoom, RoomId, Direction } from './types';
import { getSynergyDefinitions } from '../data/synergies';
import { getNeighbour, isInBounds } from './grid';

export function detectSynergies(
  grid: (RoomId | null)[][],
  placedRooms: PlacedRoom[]
): SynergyId[] {
  const synergies = getSynergyDefinitions();
  const active: SynergyId[] = [];
  const placedIds = new Set(placedRooms.map(r => r.roomId));

  for (const syn of synergies) {
    const allPresent = syn.requiredRooms.every(id => placedIds.has(id));
    if (!allPresent) continue;

    if (syn.conditionType === 'set') {
      active.push(syn.id);
      continue;
    }

    if (syn.conditionType === 'adjacency') {
      if (areAnyAdjacent(syn.requiredRooms, placedRooms, grid)) {
        active.push(syn.id);
      }
      continue;
    }
  }

  return active;
}

function areAnyAdjacent(
  roomIds: RoomId[],
  placedRooms: PlacedRoom[],
  grid: (RoomId | null)[][]
): boolean {
  const positions = new Map<RoomId, { row: number; col: number }>();
  for (const pr of placedRooms) {
    if (roomIds.includes(pr.roomId)) {
      positions.set(pr.roomId, pr.position);
    }
  }

  for (const [id, pos] of positions) {
    for (const dir of ['N', 'S', 'E', 'W'] as Direction[]) {
      const np = getNeighbour(pos, dir);
      if (!isInBounds(np)) continue;
      const neighborId = grid[np.row][np.col];
      if (neighborId && roomIds.includes(neighborId) && neighborId !== id) {
        return true;
      }
    }
  }
  return false;
}
