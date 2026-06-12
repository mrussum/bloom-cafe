// src/game/gameState.ts
// Bloom — The Fluffy Bunny Café
// Zustand store with AsyncStorage persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { BASE_INGREDIENTS } from './recipes';
import { attemptMerge, findEmptyCell, hasAvailableMerges } from './mergeEngine';
import {
  chooseRescueItem,
  chooseSmartSpawn,
  createBaseItem,
  findClearableCell,
} from './spawner';
import { cafeRepairReadiness, nextCafeStage } from './cafe';
import type { Grid, GridItem, ItemCategory, ItemTier } from './types';

const ROWS = 5;
const COLS = 4;
const XP_PER_LEVEL = 100;

// Brigadier reappears after this many merges since his last visit —
// progress-gated, never clock-gated (no manipulative real-time timers).
export const BRIGADIER_COOLDOWN = 3;

function makeEmptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array<GridItem | null>(COLS).fill(null));
}

function makeInitialGrid(): Grid {
  const grid = makeEmptyGrid();
  BASE_INGREDIENTS.slice(0, 4).forEach((ing, i) => {
    const r = Math.floor(i / COLS);
    const c = i % COLS;
    grid[r][c] = {
      id: uuidv4(),
      type: ing.id,
      tier: ing.tier as ItemTier,
      category: ing.category as ItemCategory,
      emoji: ing.emoji,
      assetKey: ing.id,
      isNew: false,
      isLocked: false,
    };
  });
  return grid;
}

interface GameState {
  grid: Grid;
  xp: number;
  level: number;
  cafeLevel: number;
  discoveredRecipes: string[];
  pendingStoryTrigger: string | null;
  lastMergePosition: [number, number] | null;
  // mergeCount paces the Brigadier (and seeds future stats)
  mergeCount: number;
  lastBrigadierMerge: number;
  // userId is session-only — managed by Supabase auth, not persisted here
  userId: string | null;
  // hasRemovedAds is persisted — survives app restarts
  hasRemovedAds: boolean;
  // audio prefs — persisted
  soundEnabled: boolean;
  musicEnabled: boolean;
  mergeItems: (fromPos: [number, number], toPos: [number, number]) => boolean;
  spawnItem: (item: GridItem) => boolean;
  spawnBase: (ingredientId: string) => boolean;
  autoSpawn: () => boolean;
  summonBrigadier: () => boolean;
  ensurePlayable: () => boolean;
  repairCafe: () => boolean;
  clearStoryTrigger: () => void;
  setUserId: (id: string) => void;
  setHasRemovedAds: (val: boolean) => void;
  setSoundEnabled: (val: boolean) => void;
  setMusicEnabled: (val: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      grid: makeInitialGrid(),
      xp: 0,
      level: 1,
      cafeLevel: 1,
      discoveredRecipes: [],
      pendingStoryTrigger: null,
      lastMergePosition: null,
      mergeCount: 0,
      lastBrigadierMerge: 0,
      userId: null,
      hasRemovedAds: false,
      soundEnabled: true,
      musicEnabled: true,

      mergeItems: (fromPos, toPos) => {
        const { grid, xp, discoveredRecipes, mergeCount } = get();
        const result = attemptMerge(grid, fromPos, toPos);
        if (!result) return false;

        const newXp = xp + result.xpGained;
        const newDiscovered = discoveredRecipes.includes(result.mergedItem.type)
          ? discoveredRecipes
          : [...discoveredRecipes, result.mergedItem.type];

        set({
          grid: result.newGrid,
          xp: newXp,
          level: Math.floor(newXp / XP_PER_LEVEL) + 1,
          discoveredRecipes: newDiscovered,
          pendingStoryTrigger: result.storyTrigger ?? null,
          lastMergePosition: result.newItemPosition,
          mergeCount: mergeCount + 1,
        });
        return true;
      },

      spawnItem: (item) => {
        const { grid } = get();
        const pos = findEmptyCell(grid);
        if (!pos) return false;
        const [r, c] = pos;
        const newGrid: Grid = grid.map((row) => [...row]);
        newGrid[r][c] = { ...item, id: uuidv4(), isNew: true };
        set({ grid: newGrid, lastMergePosition: pos });
        return true;
      },

      // Pantry tap — spawn a specific base ingredient.
      spawnBase: (ingredientId) => {
        const item = createBaseItem(ingredientId);
        if (!item) return false;
        return get().spawnItem(item);
      },

      // "Box of bits" — spawn a smart, mergeable-weighted base ingredient.
      autoSpawn: () => {
        const { grid } = get();
        if (!findEmptyCell(grid)) return false;
        return get().spawnItem(chooseSmartSpawn(grid));
      },

      // Brigadier visits: drops rare saffron + a wordless flavour beat.
      summonBrigadier: () => {
        const { grid, mergeCount } = get();
        const saffron = createBaseItem('saffron');
        const pos = findEmptyCell(grid);
        if (!saffron || !pos) return false;
        const [r, c] = pos;
        const newGrid: Grid = grid.map((row) => [...row]);
        newGrid[r][c] = saffron;
        set({
          grid: newGrid,
          lastMergePosition: pos,
          pendingStoryTrigger: 'brigadier_visit',
          lastBrigadierMerge: mergeCount,
        });
        return true;
      },

      // Session-loop safety net: if nothing on the grid can merge, top it up
      // with a guaranteed-helpful ingredient so the player always has a move.
      ensurePlayable: () => {
        const { grid } = get();
        if (hasAvailableMerges(grid)) return false;

        const rescue = chooseRescueItem(grid);
        const newGrid: Grid = grid.map((row) => [...row]);
        let pos = findEmptyCell(grid);
        if (!pos) {
          // Full grid with no merges — free one low-tier cell to break the deadlock.
          pos = findClearableCell(grid);
          if (!pos) return false;
        }
        newGrid[pos[0]][pos[1]] = { ...rescue, isNew: true };
        set({ grid: newGrid, lastMergePosition: pos });
        return true;
      },

      // Alo repairs the café — advances cafeLevel and plays his story beat.
      // Only succeeds when the next stage's requirements are met.
      repairCafe: () => {
        const { cafeLevel, level, discoveredRecipes } = get();
        const stage = nextCafeStage(cafeLevel);
        if (!stage) return false;
        if (!cafeRepairReadiness(stage, { level, discoveredRecipes }).ready) return false;
        set({ cafeLevel: stage.level, pendingStoryTrigger: stage.npcTrigger });
        return true;
      },

      clearStoryTrigger: () => set({ pendingStoryTrigger: null }),

      setUserId: (id) => set({ userId: id }),

      setHasRemovedAds: (val) => set({ hasRemovedAds: val }),

      setSoundEnabled: (val) => set({ soundEnabled: val }),

      setMusicEnabled: (val) => set({ musicEnabled: val }),

      resetGame: () =>
        set({
          grid: makeInitialGrid(),
          xp: 0,
          level: 1,
          cafeLevel: 1,
          discoveredRecipes: [],
          pendingStoryTrigger: null,
          lastMergePosition: null,
          mergeCount: 0,
          lastBrigadierMerge: 0,
        }),
    }),
    {
      name: 'bloom-game-state',
      storage: createJSONStorage(() => AsyncStorage),
      // userId is derived from Supabase auth on each launch — don't persist it
      partialize: (state) => ({
        grid: state.grid,
        xp: state.xp,
        level: state.level,
        cafeLevel: state.cafeLevel,
        discoveredRecipes: state.discoveredRecipes,
        pendingStoryTrigger: state.pendingStoryTrigger,
        lastMergePosition: state.lastMergePosition,
        mergeCount: state.mergeCount,
        lastBrigadierMerge: state.lastBrigadierMerge,
        hasRemovedAds: state.hasRemovedAds, // persisted — survives restarts
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        // userId intentionally excluded — managed by Supabase auth
      }),
    },
  ),
);
