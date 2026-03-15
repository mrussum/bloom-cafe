// src/game/recipes.ts
// Bloom — The Fluffy Bunny Café
// Full recipe tree — Tiers 1–6

export interface Recipe {
  inputs: [string, string];
  output: string;
  outputTier: number;
  outputCategory: string;
  emoji: string;
  displayName: string;
  npcTrigger?: string;
}

export const RECIPES: Recipe[] = [

  // ═══════════════════════════════════════
  // TIER 2 — Prepared Basics
  // ═══════════════════════════════════════
  { inputs: ['basil', 'basil'], output: 'herb_oil', outputTier: 2, outputCategory: 'herb', emoji: '🫙', displayName: 'Basil Oil' },
  { inputs: ['tomato', 'tomato'], output: 'ripe_tomato', outputTier: 2, outputCategory: 'vegetable', emoji: '🍅', displayName: 'Slow Tomato' },
  { inputs: ['flour', 'butter'], output: 'shortcrust', outputTier: 2, outputCategory: 'pastry', emoji: '🫓', displayName: 'Shortcrust Pastry', npcTrigger: 'trixie_pastry_lesson_1' },
  { inputs: ['egg', 'milk'], output: 'custard', outputTier: 2, outputCategory: 'sauce', emoji: '🍮', displayName: 'Proper Custard', npcTrigger: 'alo_custard_memory' },
  { inputs: ['lemon', 'egg'], output: 'lemon_curd', outputTier: 2, outputCategory: 'preserve', emoji: '🍋', displayName: 'Lemon Curd', npcTrigger: 'linda_lemon_memory' },
  { inputs: ['lavender', 'sugar'], output: 'lavender_sugar', outputTier: 2, outputCategory: 'spice', emoji: '💜', displayName: 'Lavender Sugar' },
  { inputs: ['butter', 'flour'], output: 'butter_pastry', outputTier: 2, outputCategory: 'pastry', emoji: '🥐', displayName: 'Rough Puff' },
  { inputs: ['saffron', 'milk'], output: 'saffron_milk', outputTier: 2, outputCategory: 'sauce', emoji: '🌺', displayName: 'Saffron Milk', npcTrigger: 'linda_saffron_wonder' },

  // ═══════════════════════════════════════
  // TIER 3 — Café Staples
  // ═══════════════════════════════════════
  { inputs: ['herb_oil', 'ripe_tomato'], output: 'tomato_sauce', outputTier: 3, outputCategory: 'sauce', emoji: '🍝', displayName: "Rowan's Tomato Sauce" },
  { inputs: ['shortcrust', 'lemon_curd'], output: 'lemon_tart_base', outputTier: 3, outputCategory: 'dish', emoji: '🥧', displayName: 'Lemon Tart Shell', npcTrigger: 'trixie_first_attempt' },
  { inputs: ['butter_pastry', 'custard'], output: 'custard_tart', outputTier: 3, outputCategory: 'dish', emoji: '🥮', displayName: 'Cambridge Custard Tart', npcTrigger: 'linda_custard_tart_story' },
  { inputs: ['lavender_sugar', 'custard'], output: 'lavender_cream', outputTier: 3, outputCategory: 'sauce', emoji: '🫧', displayName: 'Lavender Cream' },
  { inputs: ['saffron_milk', 'flour'], output: 'saffron_bun_dough', outputTier: 3, outputCategory: 'dough', emoji: '🌀', displayName: 'Saffron Dough', npcTrigger: 'brigadier_saffron_watch' },
  { inputs: ['herb_oil', 'flour'], output: 'herb_focaccia', outputTier: 3, outputCategory: 'dish', emoji: '🍞', displayName: 'Herb Focaccia', npcTrigger: 'alo_focaccia_nod' },
  { inputs: ['butter_pastry', 'milk'], output: 'cambridge_scone', outputTier: 3, outputCategory: 'dish', emoji: '🫐', displayName: 'Proper Scone', npcTrigger: 'trixie_scone_spreadsheet' },
  { inputs: ['lemon_curd', 'butter_pastry'], output: 'lemon_drizzle', outputTier: 3, outputCategory: 'dish', emoji: '🍰', displayName: 'Lemon Drizzle Cake' },

  // ═══════════════════════════════════════
  // TIER 4 — Signature Dishes
  // ═══════════════════════════════════════
  { inputs: ['tomato_sauce', 'herb_focaccia'], output: 'friday_pizza', outputTier: 4, outputCategory: 'signature', emoji: '🍕', displayName: "Mum's Friday Pizza", npcTrigger: 'linda_friday_pizza_memory' },
  { inputs: ['saffron_bun_dough', 'lavender_cream'], output: 'saffron_buns', outputTier: 4, outputCategory: 'signature', emoji: '🌟', displayName: "Brigadier's Saffron Buns", npcTrigger: 'brigadier_saffron_buns' },
  { inputs: ['lavender_sugar', 'shortcrust'], output: 'lavender_shortbread', outputTier: 4, outputCategory: 'signature', emoji: '🍪', displayName: "Trixie's Lavender Shortbread", npcTrigger: 'trixie_first_success' },
  { inputs: ['herb_focaccia', 'ripe_tomato'], output: 'alo_bacon_sandwich', outputTier: 4, outputCategory: 'signature', emoji: '🥪', displayName: "Alo's Bacon Sandwich", npcTrigger: 'alo_birthday' },
  { inputs: ['custard_tart', 'butter_pastry'], output: 'custard_slice', outputTier: 4, outputCategory: 'signature', emoji: '🍮', displayName: "Linda's Custard Slice", npcTrigger: 'linda_recipe_card' },
  { inputs: ['lemon_tart_base', 'lavender_cream'], output: 'garden_lemon_tart', outputTier: 4, outputCategory: 'signature', emoji: '🥧', displayName: 'Walled Garden Lemon Tart' },

  // ═══════════════════════════════════════
  // TIER 5 — Special Occasions
  // ═══════════════════════════════════════
  { inputs: ['custard_slice', 'lemon_drizzle'], output: 'celebration_cake', outputTier: 5, outputCategory: 'special', emoji: '🎂', displayName: "The Fluffy Bunny Birthday Cake", npcTrigger: 'linda_cafe_birthday' },
  { inputs: ['saffron_buns', 'lavender_shortbread'], output: 'brigadier_offering', outputTier: 5, outputCategory: 'special', emoji: '🌺', displayName: 'The Mystery Plate', npcTrigger: 'brigadier_gift_return' },
  { inputs: ['cambridge_scone', 'celebration_cake'], output: 'neighbourhood_bake', outputTier: 5, outputCategory: 'special', emoji: '🧁', displayName: 'Croft Community Bake', npcTrigger: 'neighbourhood_event' },

  // ═══════════════════════════════════════
  // TIER 6 — Legendary
  // ═══════════════════════════════════════
  { inputs: ['brigadier_offering', 'saffron_buns'], output: 'golden_bun', outputTier: 6, outputCategory: 'legendary', emoji: '👑', displayName: 'The Golden Bun', npcTrigger: 'golden_bun_debut' },
  { inputs: ['friday_pizza', 'celebration_cake'], output: 'lindas_table', outputTier: 6, outputCategory: 'legendary', emoji: '🐰', displayName: "Linda's Table", npcTrigger: 'linda_at_the_table' },
];

export const BASE_INGREDIENTS = [
  { id: 'basil', emoji: '🌿', displayName: 'Basil', tier: 1, category: 'herb' },
  { id: 'tomato', emoji: '🍅', displayName: 'Tomato', tier: 1, category: 'vegetable' },
  { id: 'flour', emoji: '🌾', displayName: 'Plain Flour', tier: 1, category: 'dry' },
  { id: 'butter', emoji: '🧈', displayName: 'Butter', tier: 1, category: 'dairy' },
  { id: 'egg', emoji: '🥚', displayName: 'Fresh Egg', tier: 1, category: 'dairy' },
  { id: 'milk', emoji: '🥛', displayName: 'Milk', tier: 1, category: 'dairy' },
  { id: 'lavender', emoji: '💜', displayName: 'Lavender', tier: 1, category: 'herb' },
  { id: 'lemon', emoji: '🍋', displayName: 'Lemon', tier: 1, category: 'fruit' },
  { id: 'sugar', emoji: '🍚', displayName: 'Caster Sugar', tier: 1, category: 'dry' },
  { id: 'saffron', emoji: '🌺', displayName: 'Saffron', tier: 1, category: 'rare', brigadierOnly: true },
];