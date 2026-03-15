// src/game/types.ts
// Bloom — The Fluffy Bunny Café
// All shared TypeScript interfaces

export type ItemCategory =
  | 'herb'
  | 'vegetable'
  | 'pastry'
  | 'sauce'
  | 'preserve'
  | 'spice'
  | 'dough'
  | 'dish'
  | 'signature'
  | 'special'
  | 'legendary'
  | 'dairy'
  | 'dry'
  | 'fruit'
  | 'rare';

export type ItemTier = 1 | 2 | 3 | 4 | 5 | 6;

export interface GridItem {
  id: string;
  type: string;
  tier: ItemTier;
  category: ItemCategory;
  emoji: string;
  assetKey: string;
  isNew: boolean;
  isLocked: boolean;
}

export type Grid = (GridItem | null)[][];

export interface MergeResult {
  newGrid: Grid;
  mergedItem: GridItem;
  clearedPositions: [number, number][];
  newItemPosition: [number, number];
  xpGained: number;
  storyTrigger?: string;
}

// Re-exported from data files — import from here for convenience
export type { Recipe } from './recipes';
export type { DialogueBeat, DialogueLine } from './npcs';
