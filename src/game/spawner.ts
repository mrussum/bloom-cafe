// src/game/spawner.ts
// Bloom — The Fluffy Bunny Café
// Pure, immutable spawning + progression helpers — no React, no side effects.
// "Weighted by what's mergeable" so the player rarely gets a useless drop,
// and a session-loop safety net so they can never reach a true dead end.

import { v4 as uuidv4 } from 'uuid';
import { BASE_INGREDIENTS, RECIPES } from './recipes';
import type { Recipe } from './recipes';
import type { Grid, GridItem, ItemCategory, ItemTier } from './types';

// Ingredients the pantry / spawner may produce. Saffron is Brigadier-only.
export const SPAWNABLE_INGREDIENTS = BASE_INGREDIENTS.filter((i) => !i.brigadierOnly);

// Bonus weight applied when spawning an ingredient would immediately enable a merge.
const PAIRING_BONUS = 4;

// ── Type lookup (emoji + name) for any item type on the grid ──────────────
const TYPE_INFO: Record<string, { emoji: string; name: string }> = {};
for (const b of BASE_INGREDIENTS) TYPE_INFO[b.id] = { emoji: b.emoji, name: b.displayName };
for (const r of RECIPES) TYPE_INFO[r.output] = { emoji: r.emoji, name: r.displayName };

export function lookupType(type: string): { emoji: string; name: string } | undefined {
  return TYPE_INFO[type];
}

// ── Item construction ─────────────────────────────────────────────────────
export function createBaseItem(ingredientId: string): GridItem | null {
  const ing = BASE_INGREDIENTS.find((i) => i.id === ingredientId);
  if (!ing) return null;
  return {
    id: uuidv4(),
    type: ing.id,
    tier: ing.tier as ItemTier,
    category: ing.category as ItemCategory,
    emoji: ing.emoji,
    assetKey: ing.id,
    isNew: true,
    isLocked: false,
  };
}

function isSpawnableBase(type: string): boolean {
  return SPAWNABLE_INGREDIENTS.some((i) => i.id === type);
}

function typeCounts(grid: Grid): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of grid) {
    for (const cell of row) {
      if (cell) counts[cell.type] = (counts[cell.type] ?? 0) + 1;
    }
  }
  return counts;
}

// ── Smart spawn — weighted toward ingredients that complete a pending merge ─
export function chooseSmartSpawn(grid: Grid, rng: () => number = Math.random): GridItem {
  const counts = typeCounts(grid);
  const present = new Set(Object.keys(counts));

  const weighted = SPAWNABLE_INGREDIENTS.map((ing) => {
    let weight = 1; // every spawnable ingredient always has a baseline chance
    for (const recipe of RECIPES) {
      const [a, b] = recipe.inputs;
      if (a === ing.id && b === ing.id) {
        // a self-pairing recipe (e.g. basil + basil) — one already down completes it
        if ((counts[ing.id] ?? 0) >= 1) weight += PAIRING_BONUS;
      } else if (a === ing.id && present.has(b)) {
        weight += PAIRING_BONUS;
      } else if (b === ing.id && present.has(a)) {
        weight += PAIRING_BONUS;
      }
    }
    return { id: ing.id, weight };
  });

  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = rng() * total;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return createBaseItem(w.id)!;
  }
  return createBaseItem(weighted[weighted.length - 1].id)!;
}

// ── Rescue spawn — guarantees a merge becomes available (session-loop net) ──
// Returns a base ingredient that, once placed, makes at least one merge
// possible. Picks the partner of something already on the grid where it can;
// otherwise seeds a self-pairing ingredient so two consecutive rescues form a
// pair (the caller fires this until hasAvailableMerges is satisfied).
export function chooseRescueItem(grid: Grid): GridItem {
  const counts = typeCounts(grid);
  const present = new Set(Object.keys(counts));

  for (const recipe of RECIPES) {
    const [a, b] = recipe.inputs;
    if (present.has(a) && isSpawnableBase(b) && (a !== b || (counts[a] ?? 0) >= 1)) {
      return createBaseItem(b)!;
    }
    if (present.has(b) && isSpawnableBase(a) && (a !== b || (counts[b] ?? 0) >= 1)) {
      return createBaseItem(a)!;
    }
  }

  // Nothing on the grid pairs with a base ingredient — seed a self-pairing one.
  const seed =
    SPAWNABLE_INGREDIENTS.find((ing) =>
      RECIPES.some((r) => r.inputs[0] === ing.id && r.inputs[1] === ing.id),
    ) ?? SPAWNABLE_INGREDIENTS[0];
  return createBaseItem(seed.id)!;
}

// First removable (lowest-tier) cell — used only to break a full-grid deadlock.
export function findClearableCell(grid: Grid): [number, number] | null {
  let fallback: [number, number] | null = null;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      if (!cell) continue;
      if (cell.tier === 1) return [r, c];
      if (!fallback) fallback = [r, c];
    }
  }
  return fallback;
}

// ── Progression helpers ────────────────────────────────────────────────────
export function recipeProgress(discovered: string[]): { found: number; total: number } {
  const outputs = new Set(RECIPES.map((r) => r.output));
  const found = discovered.filter((d) => outputs.has(d)).length;
  return { found, total: RECIPES.length };
}

function isObtainable(type: string, discovered: string[]): boolean {
  return isSpawnableBase(type) || discovered.includes(type);
}

// Suggests the next recipe to aim for: prefers something craftable right now
// (both inputs already obtainable), else the lowest-tier undiscovered recipe.
export function getNextGoal(discovered: string[]): Recipe | null {
  const undiscovered = RECIPES.filter((r) => !discovered.includes(r.output));
  if (undiscovered.length === 0) return null;

  const actionable = undiscovered.filter((r) =>
    r.inputs.every((i) => isObtainable(i, discovered)),
  );
  const pool = actionable.length > 0 ? actionable : undiscovered;
  return [...pool].sort((a, b) => a.outputTier - b.outputTier)[0] ?? null;
}
