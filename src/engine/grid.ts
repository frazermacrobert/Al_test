import { Position, Direction, DoorConfig, PlacedRoom, RoomId, GRID_SIZE } from './types';
import { getRoomDefinition } from '../data/rooms';

const OPPOSITE: Record<Direction, Direction> = { N: 'S', S: 'N', E: 'W', W: 'E' };

const DIRECTION_OFFSET: Record<Direction, Position> = {
  N: { row: -1, col: 0 },
  S: { row: 1, col: 0 },
  E: { row: 0, col: 1 },
  W: { row: 0, col: -1 },
};

export function isInBounds(pos: Position): boolean {
  return pos.row >= 0 && pos.row < GRID_SIZE && pos.col >= 0 && pos.col < GRID_SIZE;
}

export function getNeighbour(pos: Position, dir: Direction): Position {
  const offset = DIRECTION_OFFSET[dir];
  return { row: pos.row + offset.row, col: pos.col + offset.col };
}

export function getAdjacentPlacedRooms(
  pos: Position,
  grid: (RoomId | null)[][]
): { direction: Direction; roomId: RoomId; position: Position }[] {
  const results: { direction: Direction; roomId: RoomId; position: Position }[] = [];
  for (const dir of ['N', 'S', 'E', 'W'] as Direction[]) {
    const np = getNeighbour(pos, dir);
    if (isInBounds(np) && grid[np.row][np.col] !== null) {
      results.push({ direction: dir, roomId: grid[np.row][np.col]!, position: np });
    }
  }
  return results;
}

export interface PlacementValidation {
  valid: boolean;
  reason?: string;
}

export function validatePlacement(
  roomId: RoomId,
  pos: Position,
  grid: (RoomId | null)[][],
  placedRooms: PlacedRoom[]
): PlacementValidation {
  if (!isInBounds(pos)) {
    return { valid: false, reason: 'Outside the mansion grounds.' };
  }

  if (grid[pos.row][pos.col] !== null) {
    return { valid: false, reason: 'A room already occupies this space.' };
  }

  const roomDef = getRoomDefinition(roomId);
  if (!roomDef) {
    return { valid: false, reason: 'Unknown room.' };
  }

  if (placedRooms.length === 0) {
    return { valid: true };
  }

  const adjacent = getAdjacentPlacedRooms(pos, grid);
  if (adjacent.length === 0) {
    return { valid: false, reason: 'Must be adjacent to an existing room.' };
  }

  let hasConnection = false;

  for (const adj of adjacent) {
    const adjDef = getRoomDefinition(adj.roomId);
    if (!adjDef) continue;

    const myDoor = roomDef.doors[adj.direction];
    const theirDoor = adjDef.doors[OPPOSITE[adj.direction]];

    if (myDoor && theirDoor) {
      hasConnection = true;
    }
  }

  if (!hasConnection) {
    return { valid: false, reason: 'No matching doors connect to adjacent rooms.' };
  }

  return { valid: true };
}

export function isGridConnected(grid: (RoomId | null)[][], placedRooms: PlacedRoom[]): boolean {
  if (placedRooms.length <= 1) return true;

  const visited = new Set<string>();
  const start = placedRooms[0].position;
  const queue: Position[] = [start];
  visited.add(`${start.row},${start.col}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentRoomId = grid[current.row][current.col];
    if (!currentRoomId) continue;
    const currentDef = getRoomDefinition(currentRoomId);
    if (!currentDef) continue;

    for (const dir of ['N', 'S', 'E', 'W'] as Direction[]) {
      if (!currentDef.doors[dir]) continue;
      const np = getNeighbour(current, dir);
      const key = `${np.row},${np.col}`;
      if (!isInBounds(np) || visited.has(key)) continue;
      const neighborId = grid[np.row][np.col];
      if (!neighborId) continue;
      const neighborDef = getRoomDefinition(neighborId);
      if (!neighborDef || !neighborDef.doors[OPPOSITE[dir]]) continue;
      visited.add(key);
      queue.push(np);
    }
  }

  return visited.size === placedRooms.length;
}

export function getConnectedRooms(
  roomId: RoomId,
  grid: (RoomId | null)[][],
  placedRooms: PlacedRoom[]
): RoomId[] {
  const room = placedRooms.find(r => r.roomId === roomId);
  if (!room) return [];
  const def = getRoomDefinition(roomId);
  if (!def) return [];

  const connected: RoomId[] = [];
  for (const dir of ['N', 'S', 'E', 'W'] as Direction[]) {
    if (!def.doors[dir]) continue;
    const np = getNeighbour(room.position, dir);
    if (!isInBounds(np)) continue;
    const neighborId = grid[np.row][np.col];
    if (!neighborId) continue;
    const neighborDef = getRoomDefinition(neighborId);
    if (neighborDef && neighborDef.doors[OPPOSITE[dir]]) {
      connected.push(neighborId);
    }
  }
  return connected;
}

export function hasAnyValidPlacement(
  roomIds: RoomId[],
  grid: (RoomId | null)[][],
  placedRooms: PlacedRoom[]
): boolean {
  for (const roomId of roomIds) {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (validatePlacement(roomId, { row, col }, grid, placedRooms).valid) {
          return true;
        }
      }
    }
  }
  return false;
}

export function createEmptyGrid(): (RoomId | null)[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}
