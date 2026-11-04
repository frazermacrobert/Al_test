import { create } from 'zustand';
import {
  GameState, Phase, RoomId, ItemId, Position, MysteryCompletionEvent,
  ENTRANCE_ROW, ENTRANCE_COL, STARTING_ACTIONS, DRAFTS_PER_NIGHT, MAX_INVENTORY,
} from './types';
import { createEmptyGrid, validatePlacement, findPathCost } from './grid';
import { buildDraftPool, drawHand, removeFromPool } from './draft';
import { detectSynergies } from './synergies';
import { getSynergyDefinitions } from '../data/synergies';
import { getRoomDefinition, getPrototypeRoomIds, getRoomsByTier } from '../data/rooms';
import { getClue, MYSTERIES } from '../data/mysteries';
import { getNightObjective } from '../data/nights';
import { createRng } from './rng';
import { saveGame, loadGame, clearSave } from './persistence';

interface GameActions {
  newGame: () => void;
  loadSavedGame: () => boolean;

  startNight: () => void;
  selectDraft: (roomId: RoomId) => void;
  placeRoom: (roomId: RoomId, pos: Position) => string | null;
  finishConstruction: () => void;

  skipRoom: () => void;
  moveToRoom: (roomId: RoomId) => string | null;
  enterRoom: (roomId: RoomId) => void;
  exitRoom: () => void;
  performInteraction: (interactionId: string) => InteractionResult | null;
  pickUpItem: (itemId: ItemId) => boolean;
  dropItem: (itemId: ItemId) => void;

  endNight: () => void;

  setPhase: (phase: Phase) => void;
  openCasebook: () => void;
  closeCasebook: () => void;
  save: () => void;
}

interface InteractionResult {
  error?: string;
  mysteryCompleted?: MysteryCompletionEvent;
  itemGained?: ItemId;
  clueGained?: string;
}

interface StoreExtras {
  previousPhase: Phase | null;
  pendingMysteryCompletion: MysteryCompletionEvent | null;
  lastInteractionText: string | null;
  dismissMysteryCompletion: () => void;
}

type Store = GameState & GameActions & StoreExtras;

function getStartingResources(nightNumber: number) {
  let silver = 1;
  let candles = 1;
  let keys = 0;
  let actions = STARTING_ACTIONS;

  if (nightNumber >= 3) silver += 1;
  if (nightNumber >= 5) { candles += 1; actions += 1; }
  if (nightNumber >= 7) { silver += 1; keys += 1; }
  if (nightNumber >= 9) actions += 1;

  return { silver, candles, keys, actions };
}

function getMaxTier(completedMysteries: string[]): number {
  let tier = 1;
  if (completedMysteries.includes('fifth_place_setting')) tier = 2;
  if (completedMysteries.includes('missing_portrait')) tier = 3;
  if (completedMysteries.includes('living_architecture')) tier = 4;
  return tier;
}

function createInitialState(): GameState {
  return {
    nightNumber: 0,
    phase: 'title',
    nightObjective: null,
    grid: createEmptyGrid(),
    placedRooms: [],
    draftPool: [],
    currentHand: [],
    draftsRemaining: DRAFTS_PER_NIGHT,
    currentRoom: null,
    roomStates: {},
    silver: 0,
    candles: 0,
    keys: 0,
    actions: STARTING_ACTIONS,
    inventory: [],
    casebook: {
      evidence: [],
      mysteryProgress: {},
      completedMysteries: [],
      connections: [],
    },
    unlockedRooms: [],
    unlockedTiers: [1],
    visitedRoomIds: [],
    discoveredSynergies: [],
    activeSynergies: [],
    architectCatalogue: getPrototypeRoomIds(),
    seed: Date.now(),
    saveVersion: 2,
  };
}

function checkMysteryCompletion(casebook: GameState['casebook']): MysteryCompletionEvent | null {
  for (const mystery of MYSTERIES) {
    if (casebook.completedMysteries.includes(mystery.id)) continue;
    const progress = casebook.mysteryProgress[mystery.id] ?? [];
    if (progress.length >= mystery.requiredClues) {
      return {
        mysteryId: mystery.id,
        title: mystery.title,
        resolution: mystery.resolution,
        reward: mystery.reward,
      };
    }
  }
  return null;
}

export const useGameStore = create<Store>((set, get) => ({
  ...createInitialState(),
  previousPhase: null,
  pendingMysteryCompletion: null,
  lastInteractionText: null,

  dismissMysteryCompletion: () => set({ pendingMysteryCompletion: null }),

  newGame: () => {
    clearSave();
    set({
      ...createInitialState(),
      previousPhase: null,
      pendingMysteryCompletion: null,
      lastInteractionText: null,
    });
  },

  loadSavedGame: () => {
    const saved = loadGame();
    if (saved) {
      set({
        ...saved,
        inventory: saved.inventory ?? [],
        unlockedTiers: saved.unlockedTiers ?? [1],
        visitedRoomIds: saved.visitedRoomIds ?? [],
        previousPhase: null,
        pendingMysteryCompletion: null,
        lastInteractionText: null,
      });
      return true;
    }
    return false;
  },

  startNight: () => {
    const state = get();
    const nightNumber = state.nightNumber + 1;
    const seed = state.seed + nightNumber;
    const rng = createRng(seed);

    const grid = createEmptyGrid();
    grid[ENTRANCE_ROW][ENTRANCE_COL] = 'entrance_hall';

    const placedRooms = [{ roomId: 'entrance_hall', position: { row: ENTRANCE_ROW, col: ENTRANCE_COL } }];

    const maxTier = getMaxTier(state.casebook.completedMysteries);
    const tierRooms = getRoomsByTier(maxTier);
    const catalogue = [
      ...tierRooms,
      ...state.unlockedRooms.filter(r => !tierRooms.includes(r)),
    ];

    const pool = buildDraftPool(catalogue, ['entrance_hall'], rng);
    const hand = drawHand(pool, ['entrance_hall']);

    const nightObjective = getNightObjective(nightNumber);
    const resources = getStartingResources(nightNumber);

    set({
      nightNumber,
      phase: 'invitation',
      nightObjective,
      grid,
      placedRooms,
      draftPool: pool,
      currentHand: hand,
      draftsRemaining: DRAFTS_PER_NIGHT,
      currentRoom: null,
      roomStates: {},
      ...resources,
      inventory: [],
      activeSynergies: [],
      seed: state.seed,
      previousPhase: null,
      pendingMysteryCompletion: null,
      lastInteractionText: null,
    });
  },

  selectDraft: (roomId: RoomId) => {
    const state = get();
    if (state.draftsRemaining <= 0) return;
    if (!state.currentHand.includes(roomId)) return;
    set({ currentHand: [roomId] });
  },

  skipRoom: () => {
    const state = get();
    if (state.draftsRemaining <= 0) return;
    const newDrafts = state.draftsRemaining - 1;
    const nextHand = newDrafts > 0
      ? drawHand(state.draftPool, state.placedRooms.map(r => r.roomId))
      : [];
    set({
      draftsRemaining: newDrafts,
      currentHand: nextHand,
    });
  },

  placeRoom: (roomId: RoomId, pos: Position) => {
    const state = get();
    const validation = validatePlacement(roomId, pos, state.grid, state.placedRooms);
    if (!validation.valid) return validation.reason ?? 'Invalid placement.';

    const newGrid = state.grid.map(row => [...row]);
    newGrid[pos.row][pos.col] = roomId;
    const newPlaced = [...state.placedRooms, { roomId, position: pos }];
    const newPool = removeFromPool(state.draftPool, roomId);
    const newDrafts = state.draftsRemaining - 1;

    const activeSynergies = detectSynergies(newGrid, newPlaced);
    const newSynergies = activeSynergies.filter(
      s => !state.discoveredSynergies.includes(s) && !state.activeSynergies.includes(s)
    );

    let silver = state.silver;
    let candles = state.candles;
    let keys = state.keys;
    let actions = state.actions;

    for (const synId of newSynergies) {
      const syn = getSynergyDefinitions().find(s => s.id === synId);
      if (!syn) continue;
      if (syn.effect.type === 'resource') {
        switch (syn.effect.resourceType) {
          case 'silver': silver += syn.effect.amount ?? 0; break;
          case 'candles': candles += syn.effect.amount ?? 0; break;
          case 'keys': keys += syn.effect.amount ?? 0; break;
        }
      }
      if (syn.effect.type === 'action') {
        actions += syn.effect.amount ?? 0;
      }
    }

    const nextHand = newDrafts > 0
      ? drawHand(newPool, newPlaced.map(r => r.roomId))
      : [];

    set({
      grid: newGrid,
      placedRooms: newPlaced,
      draftPool: newPool,
      currentHand: nextHand,
      draftsRemaining: newDrafts,
      activeSynergies,
      discoveredSynergies: [
        ...state.discoveredSynergies,
        ...newSynergies.filter(s => !state.discoveredSynergies.includes(s)),
      ],
      silver,
      candles,
      keys,
      actions,
    });

    return null;
  },

  finishConstruction: () => {
    set({ phase: 'exploration', currentHand: [], currentRoom: 'entrance_hall' });
    const state = get();
    const roomStates = { ...state.roomStates };
    if (!roomStates['entrance_hall']) {
      roomStates['entrance_hall'] = { visited: false, completedInteractions: [], discoveredClues: [] };
    }
    set({ roomStates });
  },

  moveToRoom: (roomId: RoomId) => {
    const state = get();
    if (!state.currentRoom) return 'You are not in a room.';
    if (state.currentRoom === roomId) return null;

    const cost = findPathCost(state.currentRoom, roomId, state.grid, state.placedRooms);
    if (cost === null) return 'No path to that room.';
    if (cost > state.actions) return `Not enough actions. Need ${cost}, have ${state.actions}.`;

    const roomStates = { ...state.roomStates };
    if (!roomStates[roomId]) {
      roomStates[roomId] = { visited: false, completedInteractions: [], discoveredClues: [] };
    }
    roomStates[roomId] = { ...roomStates[roomId], visited: true };

    const visitedRoomIds = state.visitedRoomIds.includes(roomId)
      ? state.visitedRoomIds
      : [...state.visitedRoomIds, roomId];

    set({
      currentRoom: roomId,
      actions: state.actions - cost,
      roomStates,
      visitedRoomIds,
    });

    return null;
  },

  enterRoom: (roomId: RoomId) => {
    const state = get();

    if (state.phase === 'exploration') {
      if (state.currentRoom === roomId) {
        set({ phase: 'room' });
        return;
      }
      const error = get().moveToRoom(roomId);
      if (error) return;
      set({ phase: 'room' });
      return;
    }

    const roomStates = { ...state.roomStates };
    if (!roomStates[roomId]) {
      roomStates[roomId] = { visited: false, completedInteractions: [], discoveredClues: [] };
    }
    roomStates[roomId] = { ...roomStates[roomId], visited: true };
    set({ phase: 'room', currentRoom: roomId, roomStates });
  },

  exitRoom: () => {
    set({ phase: 'exploration', lastInteractionText: null });
  },

  performInteraction: (interactionId: string) => {
    const state = get();
    if (!state.currentRoom) return { error: 'No room selected.' };

    const roomDef = getRoomDefinition(state.currentRoom);
    if (!roomDef) return { error: 'Unknown room.' };

    const interaction = roomDef.interactions.find(i => i.id === interactionId);
    if (!interaction) return { error: 'Unknown interaction.' };

    const rs = state.roomStates[state.currentRoom];
    if (rs?.completedInteractions.includes(interactionId) && !interaction.repeatable) {
      return { error: 'Already completed.' };
    }

    const cost = interaction.cost;
    if ((cost.actions ?? 0) > state.actions) return { error: 'Not enough actions.' };
    if ((cost.silver ?? 0) > state.silver) return { error: 'Not enough silver.' };
    if ((cost.candles ?? 0) > state.candles) return { error: 'Not enough candles.' };
    if ((cost.keys ?? 0) > state.keys) return { error: 'Not enough keys.' };

    if (interaction.condition) {
      const cond = interaction.condition;
      switch (cond.type) {
        case 'hasClue':
          if (!state.casebook.evidence.includes(cond.value as string))
            return { error: 'You lack a required clue.' };
          break;
        case 'hasItem':
          if (!state.inventory.includes(cond.value as string))
            return { error: `Requires: ${cond.value}` };
          break;
        case 'nightMin':
          if (state.nightNumber < (cond.value as number))
            return { error: 'Not yet. The house isn\'t ready.' };
          break;
      }
    }

    let newActions = state.actions - (cost.actions ?? 0);
    let silver = state.silver - (cost.silver ?? 0);
    let candles = state.candles - (cost.candles ?? 0);
    let keys = state.keys - (cost.keys ?? 0);

    const roomStates = { ...state.roomStates };
    const roomState = { ...roomStates[state.currentRoom]! };
    roomState.completedInteractions = [...roomState.completedInteractions, interactionId];

    let casebook = { ...state.casebook };
    let unlockedRooms = [...state.unlockedRooms];
    let unlockedTiers = [...state.unlockedTiers];
    let inventory = [...state.inventory];
    let itemGained: ItemId | undefined;
    let clueGained: string | undefined;

    const outcome = interaction.outcome;

    if (outcome.type === 'resource') {
      switch (outcome.resourceType) {
        case 'silver': silver += outcome.amount ?? 0; break;
        case 'candles': candles += outcome.amount ?? 0; break;
        case 'keys': keys += outcome.amount ?? 0; break;
      }
    }

    if (outcome.type === 'item' && outcome.itemId) {
      if (inventory.length < MAX_INVENTORY) {
        inventory = [...inventory, outcome.itemId];
        itemGained = outcome.itemId;
      }
      // If consuming an item via condition, remove it
      if (interaction.condition?.type === 'hasItem') {
        inventory = inventory.filter(i => i !== interaction.condition!.value);
      }
    }

    let mysteryCompleted: MysteryCompletionEvent | null = null;

    if (outcome.type === 'clue' && outcome.clueId) {
      // If consuming an item via condition, remove it
      if (interaction.condition?.type === 'hasItem') {
        inventory = inventory.filter(i => i !== interaction.condition!.value);
      }

      if (!casebook.evidence.includes(outcome.clueId)) {
        casebook = {
          ...casebook,
          evidence: [...casebook.evidence, outcome.clueId],
        };
        roomState.discoveredClues = [...roomState.discoveredClues, outcome.clueId];
        clueGained = outcome.clueId;

        const clue = getClue(outcome.clueId);
        if (clue) {
          const progress = { ...casebook.mysteryProgress };
          const mysteryClues = progress[clue.mysteryId] ?? [];
          if (!mysteryClues.includes(outcome.clueId)) {
            progress[clue.mysteryId] = [...mysteryClues, outcome.clueId];
          }
          casebook = { ...casebook, mysteryProgress: progress };

          mysteryCompleted = checkMysteryCompletion(casebook);
          if (mysteryCompleted) {
            casebook = {
              ...casebook,
              completedMysteries: [...casebook.completedMysteries, mysteryCompleted.mysteryId],
            };
            if (mysteryCompleted.reward?.type === 'unlockTier') {
              const tierNum = parseInt(mysteryCompleted.reward.value);
              if (!isNaN(tierNum) && !unlockedTiers.includes(tierNum)) {
                unlockedTiers = [...unlockedTiers, tierNum];
              }
            }
            if (mysteryCompleted.reward?.type === 'unlockRoom') {
              const newRoom = mysteryCompleted.reward.value;
              if (!unlockedRooms.includes(newRoom)) {
                unlockedRooms = [...unlockedRooms, newRoom];
              }
            }
          }
        }
      }
    }

    roomStates[state.currentRoom] = roomState;

    set({
      actions: newActions,
      silver,
      candles,
      keys,
      inventory,
      roomStates,
      casebook,
      unlockedRooms,
      unlockedTiers,
      pendingMysteryCompletion: mysteryCompleted,
      lastInteractionText: outcome.text,
    });

    if (mysteryCompleted) {
      return { mysteryCompleted, itemGained, clueGained };
    }
    return itemGained || clueGained ? { itemGained, clueGained } : null;
  },

  pickUpItem: (itemId: ItemId) => {
    const state = get();
    if (state.inventory.length >= MAX_INVENTORY) return false;
    if (state.inventory.includes(itemId)) return false;
    set({ inventory: [...state.inventory, itemId] });
    return true;
  },

  dropItem: (itemId: ItemId) => {
    const state = get();
    set({ inventory: state.inventory.filter(i => i !== itemId) });
  },

  endNight: () => {
    set({ phase: 'dawn' });
    setTimeout(() => saveGame({ ...get() }), 0);
  },

  setPhase: (phase: Phase) => set({ phase }),

  openCasebook: () => {
    const state = get();
    set({ previousPhase: state.phase, phase: 'casebook' });
  },

  closeCasebook: () => {
    const state = get();
    const returnTo = state.previousPhase ?? 'exploration';
    set({ phase: returnTo, previousPhase: null });
  },

  save: () => {
    saveGame(get());
  },
}));
