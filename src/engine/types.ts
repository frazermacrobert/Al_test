export type RoomId = string;
export type SynergyId = string;
export type ClueId = string;
export type MysteryId = string;

export type Direction = 'N' | 'S' | 'E' | 'W';

export type Rarity = 'common' | 'unusual' | 'rare' | 'exceptional' | 'forbidden';

export type Phase = 'title' | 'invitation' | 'construction' | 'exploration' | 'room' | 'dawn' | 'casebook';

export interface MysteryCompletionEvent {
  mysteryId: MysteryId;
  title: string;
  resolution: string;
  reward?: MysteryReward;
}

export interface Position {
  row: number;
  col: number;
}

export interface DoorConfig {
  N: boolean;
  S: boolean;
  E: boolean;
  W: boolean;
}

export interface InteractionCost {
  actions?: number;
  silver?: number;
  candles?: number;
  keys?: number;
}

export interface InteractionOutcome {
  type: 'resource' | 'clue' | 'event' | 'narrative';
  resourceType?: 'silver' | 'candles' | 'keys';
  amount?: number;
  clueId?: ClueId;
  text: string;
}

export interface RoomInteraction {
  id: string;
  label: string;
  description: string;
  type: 'inspect' | 'search' | 'special';
  cost: InteractionCost;
  condition?: InteractionCondition;
  outcome: InteractionOutcome;
  repeatable: boolean;
}

export interface InteractionCondition {
  type: 'hasClue' | 'hasResource' | 'nightMin' | 'synergyActive' | 'roomPlaced';
  value: string | number;
}

export interface RoomDefinition {
  id: RoomId;
  name: string;
  description: string;
  flavour: string;
  rarity: Rarity;
  doors: DoorConfig;
  tags: string[];
  interactions: RoomInteraction[];
  category: 'functional' | 'discovery' | 'story';
}

export interface PlacedRoom {
  roomId: RoomId;
  position: Position;
}

export interface RoomInstanceState {
  visited: boolean;
  completedInteractions: string[];
  discoveredClues: ClueId[];
}

export interface Clue {
  id: ClueId;
  mysteryId: MysteryId;
  title: string;
  description: string;
  sourceRoom: RoomId;
}

export interface Mystery {
  id: MysteryId;
  title: string;
  question: string;
  description: string;
  clueIds: ClueId[];
  requiredClues: number;
  resolution: string;
  reward?: MysteryReward;
}

export interface MysteryReward {
  type: 'unlockRoom' | 'upgrade' | 'item';
  value: string;
  description: string;
}

export interface SynergyDefinition {
  id: SynergyId;
  name: string;
  description: string;
  requiredRooms: RoomId[];
  conditionType: 'adjacency' | 'set' | 'sequence';
  effect: SynergyEffect;
}

export interface SynergyEffect {
  type: 'resource' | 'draft' | 'clue' | 'action';
  description: string;
  resourceType?: 'silver' | 'candles' | 'keys' | 'actions';
  amount?: number;
  clueId?: ClueId;
}

export interface NightObjective {
  title: string;
  description: string;
  flavour: string;
  optional?: {
    title: string;
    description: string;
  };
}

export interface Casebook {
  evidence: ClueId[];
  mysteryProgress: Record<MysteryId, ClueId[]>;
  completedMysteries: MysteryId[];
  connections: string[];
}

export interface GameState {
  nightNumber: number;
  phase: Phase;
  nightObjective: NightObjective | null;

  grid: (RoomId | null)[][];
  placedRooms: PlacedRoom[];

  draftPool: RoomId[];
  currentHand: RoomId[];
  draftsRemaining: number;

  currentRoom: RoomId | null;
  roomStates: Record<RoomId, RoomInstanceState>;

  silver: number;
  candles: number;
  keys: number;
  actions: number;

  casebook: Casebook;
  unlockedRooms: RoomId[];
  discoveredSynergies: SynergyId[];
  activeSynergies: SynergyId[];
  architectCatalogue: RoomId[];

  seed: number;
  saveVersion: number;
}

export const GRID_SIZE = 6;
export const ENTRANCE_ROW = 5;
export const ENTRANCE_COL = 2;
export const STARTING_ACTIONS = 3;
export const DRAFTS_PER_NIGHT = 5;
export const HAND_SIZE = 3;
