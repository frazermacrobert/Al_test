import { create } from 'zustand';
import {
  GameState, Phase, RoomId, Position, MysteryCompletionEvent,
  ENTRANCE_ROW, ENTRANCE_COL, STARTING_ACTIONS, DRAFTS_PER_NIGHT,
} from './types';
import { createEmptyGrid, validatePlacement } from './grid';
import { buildDraftPool, drawHand, removeFromPool } from './draft';
import { detectSynergies } from './synergies';
import { getSynergyDefinitions } from '../data/synergies';
import { getRoomDefinition, getPrototypeRoomIds } from '../data/rooms';
import { getClue, getMystery, MYSTERIES } from '../data/mysteries';
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

  enterRoom: (roomId: RoomId) => void;
  exitRoom: () => void;
  performInteraction: (interactionId: string) => { error?: string; mysteryCompleted?: MysteryCompletionEvent } | null;

  endNight: () => void;

  setPhase: (phase: Phase) => void;
  openCasebook: () => void;
  closeCasebook: () => void;
  save: () => void;
}

interface StoreExtras {
  previousPhase: Phase | null;
  pendingMysteryCompletion: MysteryCompletionEvent | null;
  dismissMysteryCompletion: () => void;
}

type Store = GameState & GameActions & StoreExtras;

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
    casebook: {
      evidence: [],
      mysteryProgress: {},
      completedMysteries: [],
      connections: [],
    },
    unlockedRooms: [],
    discoveredSynergies: [],
    activeSynergies: [],
    architectCatalogue: getPrototypeRoomIds(),
    seed: Date.now(),
    saveVersion: 1,
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

  dismissMysteryCompletion: () => set({ pendingMysteryCompletion: null }),

  newGame: () => {
    clearSave();
    set({ ...createInitialState(), previousPhase: null, pendingMysteryCompletion: null });
  },

  loadSavedGame: () => {
    const saved = loadGame();
    if (saved) {
      set({ ...saved, previousPhase: null, pendingMysteryCompletion: null });
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
    const pool = buildDraftPool(state.architectCatalogue, ['entrance_hall'], rng);
    const hand = drawHand(pool, ['entrance_hall']);

    const nightObjective = getNightObjective(nightNumber);

    let silver = 1;
    let candles = 0;
    let keys = 0;

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
      silver,
      candles,
      keys,
      actions: STARTING_ACTIONS,
      activeSynergies: [],
      seed: state.seed,
      previousPhase: null,
      pendingMysteryCompletion: null,
    });
  },

  selectDraft: (roomId: RoomId) => {
    const state = get();
    if (state.draftsRemaining <= 0) return;
    if (!state.currentHand.includes(roomId)) return;
    set({ currentHand: [roomId] });
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
    set({ phase: 'exploration', currentHand: [] });
  },

  enterRoom: (roomId: RoomId) => {
    const state = get();
    const roomStates = { ...state.roomStates };
    if (!roomStates[roomId]) {
      roomStates[roomId] = { visited: false, completedInteractions: [], discoveredClues: [] };
    }
    roomStates[roomId] = { ...roomStates[roomId], visited: true };
    set({ phase: 'room', currentRoom: roomId, roomStates });
  },

  exitRoom: () => {
    set({ phase: 'exploration', currentRoom: null });
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
    if ((cost.actions ?? 0) > state.actions) return { error: 'Not enough Actions.' };
    if ((cost.silver ?? 0) > state.silver) return { error: 'Not enough Silver.' };
    if ((cost.candles ?? 0) > state.candles) return { error: 'Not enough Candles.' };
    if ((cost.keys ?? 0) > state.keys) return { error: 'Not enough Keys.' };

    if (interaction.condition) {
      const cond = interaction.condition;
      switch (cond.type) {
        case 'hasClue':
          if (!state.casebook.evidence.includes(cond.value as string))
            return { error: 'You lack a required clue.' };
          break;
        case 'nightMin':
          if (state.nightNumber < (cond.value as number))
            return { error: 'Not yet. The house isn\'t ready.' };
          break;
      }
    }

    const newActions = state.actions - (cost.actions ?? 0);
    const newSilver = state.silver - (cost.silver ?? 0);
    const newCandles = state.candles - (cost.candles ?? 0);
    const newKeys = state.keys - (cost.keys ?? 0);

    const roomStates = { ...state.roomStates };
    const roomState = { ...roomStates[state.currentRoom]! };
    roomState.completedInteractions = [...roomState.completedInteractions, interactionId];

    let casebook = { ...state.casebook };
    let silver = newSilver;
    let candles = newCandles;
    let keys = newKeys;
    let unlockedRooms = [...state.unlockedRooms];

    const outcome = interaction.outcome;
    if (outcome.type === 'resource') {
      switch (outcome.resourceType) {
        case 'silver': silver += outcome.amount ?? 0; break;
        case 'candles': candles += outcome.amount ?? 0; break;
        case 'keys': keys += outcome.amount ?? 0; break;
      }
    }

    let mysteryCompleted: MysteryCompletionEvent | null = null;

    if (outcome.type === 'clue' && outcome.clueId) {
      if (!casebook.evidence.includes(outcome.clueId)) {
        casebook = {
          ...casebook,
          evidence: [...casebook.evidence, outcome.clueId],
        };
        roomState.discoveredClues = [...roomState.discoveredClues, outcome.clueId];

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
      roomStates,
      casebook,
      unlockedRooms,
      pendingMysteryCompletion: mysteryCompleted,
    });

    if (mysteryCompleted) {
      return { mysteryCompleted };
    }
    return null;
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
