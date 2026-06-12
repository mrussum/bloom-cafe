// src/game/friendship.ts
// Bloom — The Fluffy Bunny Café
// Trixie's friendship gates which ingredient *categories* the pantry offers.
// You start with herbs & dry goods; discovering recipes (cooking with Trixie)
// grows the friendship, and each new level opens another category. Pure data.

import { SPAWNABLE_INGREDIENTS } from './spawner';
import type { ItemCategory } from './types';

export interface FriendshipTier {
  level: number;
  threshold: number; // friendship points needed to REACH this level
  unlocksCategory: ItemCategory | null; // the category opened at this level
  blurb: string; // short label for UI ("The dairy shelf")
  npcTrigger?: string; // Trixie dialogue beat played on reaching it
}

// Categories you have from the very start (level 1).
const STARTER_CATEGORIES: ItemCategory[] = ['herb', 'dry'];

export const FRIENDSHIP_TIERS: FriendshipTier[] = [
  { level: 1, threshold: 0, unlocksCategory: null, blurb: 'Herbs & dry goods' },
  {
    level: 2,
    threshold: 3,
    unlocksCategory: 'dairy',
    blurb: 'The dairy shelf',
    npcTrigger: 'trixie_friend_dairy',
  },
  {
    level: 3,
    threshold: 7,
    unlocksCategory: 'vegetable',
    blurb: 'Fresh veg',
    npcTrigger: 'trixie_friend_veg',
  },
  {
    level: 4,
    threshold: 12,
    unlocksCategory: 'fruit',
    blurb: 'The fruit bowl',
    npcTrigger: 'trixie_friend_fruit',
  },
];

/** Friendship level for a given number of points. */
export function friendshipLevelFor(points: number): number {
  let level = 1;
  for (const tier of FRIENDSHIP_TIERS) {
    if (points >= tier.threshold) level = tier.level;
  }
  return level;
}

/** The next tier above the current level (or null if maxed). */
export function nextFriendshipTier(level: number): FriendshipTier | null {
  return FRIENDSHIP_TIERS.find((t) => t.level === level + 1) ?? null;
}

/** The Trixie beat to play when a given level is reached (if any). */
export function friendshipTierTrigger(level: number): string | undefined {
  return FRIENDSHIP_TIERS.find((t) => t.level === level)?.npcTrigger;
}

/** Set of unlocked ingredient categories at a friendship level. */
export function unlockedCategories(level: number): Set<string> {
  const set = new Set<string>(STARTER_CATEGORIES);
  for (const tier of FRIENDSHIP_TIERS) {
    if (tier.level <= level && tier.unlocksCategory) set.add(tier.unlocksCategory);
  }
  return set;
}

/** Spawnable ingredient ids available at a friendship level. */
export function unlockedIngredientIds(level: number): string[] {
  const cats = unlockedCategories(level);
  return SPAWNABLE_INGREDIENTS.filter((i) => cats.has(i.category)).map((i) => i.id);
}
