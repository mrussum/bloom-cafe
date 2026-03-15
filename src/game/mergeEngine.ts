// src/game/mergeEngine.ts
// Bloom — The Fluffy Bunny Café
// Pure, immutable merge logic — no side effects, no React

import { v4 as uuidv4 } from 'uuid';
import { RECIPES } from './recipes';
import type { Grid, GridItem, ItemCategory, ItemTier, MergeResult } from './types';

export function findEmptyCell(grid: Grid): [number, number] | null {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === null) return [r, c];
    }
  }
  return null;
}

export function attemptMerge(
  grid: Grid,
  fromPos: [number, number],
  toPos: [number, number],
): MergeResult | null {
  const [fr, fc] = fromPos;
  const [tr, tc] = toPos;

  if (fr === tr && fc === tc) return null;

  const fromItem = grid[fr][fc];
  const toItem = grid[tr][tc];

  if (!fromItem || !toItem) return null;

  const recipe = RECIPES.find(
    (r) =>
      (r.inputs[0] === fromItem.type && r.inputs[1] === toItem.type) ||
      (r.inputs[0] === toItem.type && r.inputs[1] === fromItem.type),
  );

  if (!recipe) return null;

  const mergedItem: GridItem = {
    id: uuidv4(),
    type: recipe.output,
    tier: recipe.outputTier as ItemTier,
    category: recipe.outputCategory as ItemCategory,
    emoji: recipe.emoji,
    assetKey: recipe.output,
    isNew: true,
    isLocked: false,
  };

  const newGrid: Grid = grid.map((row) => [...row]);
  newGrid[fr][fc] = null;
  newGrid[tr][tc] = mergedItem;

  return {
    newGrid,
    mergedItem,
    clearedPositions: [
      [fr, fc],
      [tr, tc],
    ],
    newItemPosition: [tr, tc],
    xpGained: recipe.outputTier * 10,
    storyTrigger: recipe.npcTrigger,
  };
}

export function hasAvailableMerges(grid: Grid): boolean {
  const items = grid.flat().filter((item): item is GridItem => item !== null);

  for (const recipe of RECIPES) {
    const [a, b] = recipe.inputs;
    if (a === b) {
      if (items.filter((item) => item.type === a).length >= 2) return true;
    } else {
      if (items.some((item) => item.type === a) && items.some((item) => item.type === b))
        return true;
    }
  }

  return false;
}
