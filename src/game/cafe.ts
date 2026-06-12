// src/game/cafe.ts
// Bloom — The Fluffy Bunny Café
// Café progression — Alo's repairs gate cafeLevel upgrades. Pure data + helpers.
// Each stage is unlocked by the player's progress (level reached and/or a dish
// discovered); "repairing" advances cafeLevel and plays an Alo story beat.

import { lookupType } from './spawner';

export interface CafeStage {
  level: number; // the cafeLevel this repair brings you TO
  id: string;
  title: string; // what Alo fixes — shown as the card heading
  description: string; // a sentence of flavour for the repair
  requires: {
    playerLevel?: number; // minimum player level
    dish?: string; // a recipe output that must be discovered first
  };
  npcTrigger: string; // Alo dialogue beat played on completion
}

// Repairs from cafeLevel 1 → 6. Each leans on Alo (practical, toolbelt) and
// threads through the family: the garden wall is Brigadier's, the window
// corner is Linda's table.
export const CAFE_STAGES: CafeStage[] = [
  {
    level: 2,
    id: 'front_door',
    title: 'Unstick the Front Door',
    description: "Alo planes down the door that's caught on the frame for years.",
    requires: { playerLevel: 2 },
    npcTrigger: 'cafe_repair_door',
  },
  {
    level: 3,
    id: 'display_counter',
    title: 'Rebuild the Display Counter',
    description: 'The wobbly counter gets braced and levelled — proper solid.',
    requires: { playerLevel: 4, dish: 'cambridge_scone' },
    npcTrigger: 'cafe_repair_counter',
  },
  {
    level: 4,
    id: 'coffee_machine',
    title: 'Fix the Coffee Machine',
    description: "The ancient machine coughs back to life under Alo's hands.",
    requires: { playerLevel: 6, dish: 'custard_tart' },
    npcTrigger: 'cafe_repair_coffee',
  },
  {
    level: 5,
    id: 'garden_wall',
    title: 'Restore the Garden Wall',
    description: "Alo rebuilds the wall Brigadier watches from — feathers and all.",
    requires: { playerLevel: 9, dish: 'saffron_buns' },
    npcTrigger: 'cafe_repair_wall',
  },
  {
    level: 6,
    id: 'window_table',
    title: 'Reopen the Window Table',
    description: "The window corner is cleared so Linda's table fits there again.",
    requires: { playerLevel: 12, dish: 'celebration_cake' },
    npcTrigger: 'cafe_repair_window',
  },
];

/** The repair that would take the café from its current level to the next. */
export function nextCafeStage(cafeLevel: number): CafeStage | null {
  return CAFE_STAGES.find((s) => s.level === cafeLevel + 1) ?? null;
}

export interface CafeReadiness {
  ready: boolean;
  needs: string[]; // human-readable list of what's still required
}

export function cafeRepairReadiness(
  stage: CafeStage,
  state: { level: number; discoveredRecipes: string[] },
): CafeReadiness {
  const needs: string[] = [];
  if (stage.requires.playerLevel && state.level < stage.requires.playerLevel) {
    needs.push(`Reach Lv ${stage.requires.playerLevel}`);
  }
  if (stage.requires.dish && !state.discoveredRecipes.includes(stage.requires.dish)) {
    const info = lookupType(stage.requires.dish);
    needs.push(`Make ${info?.name ?? stage.requires.dish}`);
  }
  return { ready: needs.length === 0, needs };
}
