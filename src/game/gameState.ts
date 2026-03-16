// src/game/gameState.ts
// Bloom — The Fluffy Bunny Café
// Zustand store with AsyncStorage persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { BASE_INGREDIENTS } from './recipes';
import { attemptMerge, findEmptyCell } from './mergeEngine';
import type { Grid, GridItem, ItemCategory, ItemTier } from './types';

const ROWS = 5;
const COLS = 4;
const XP_PER_LEVEL = 100;

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
  // userId is session-only — managed by Supabase auth, not persisted here
  userId: string | null;
  // hasRemovedAds is persisted — survives app restarts
  hasRemovedAds: boolean;
  mergeItems: (fromPos: [number, number], toPos: [number, number]) => boolean;
  spawnItem: (item: GridItem) => boolean;
  clearStoryTrigger: () => void;
  setUserId: (id: string) => void;
  setHasRemovedAds: (val: boolean) => void;
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
      userId: null,
      hasRemovedAds: false,

      mergeItems: (fromPos, toPos) => {
        const { grid, xp, discoveredRecipes } = get();
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
        set({ grid: newGrid });
        return true;
      },

      clearStoryTrigger: () => set({ pendingStoryTrigger: null }),

      setUserId: (id) => set({ userId: id }),

      setHasRemovedAds: (val) => set({ hasRemovedAds: val }),

      resetGame: () =>
        set({
          grid: makeInitialGrid(),
          xp: 0,
          level: 1,
          cafeLevel: 1,
          discoveredRecipes: [],
          pendingStoryTrigger: null,
          lastMergePosition: null,
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
        hasRemovedAds: state.hasRemovedAds, // persisted — survives restarts
        // userId intentionally excluded — managed by Supabase auth
      }),
    },
  ),
);
