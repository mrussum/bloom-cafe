// src/game/npcs.ts
// Bloom — NPC dialogue triggered by recipe merges

export interface DialogueLine {
  speaker: 'linda' | 'alo' | 'trixie' | 'brigadier' | 'rowan';
  text: string;
  isAction?: boolean;
}

export interface DialogueBeat {
  id: string;
  character: 'linda' | 'alo' | 'trixie' | 'brigadier' | 'rowan';
  lines: DialogueLine[];
}

export const DIALOGUE_BEATS: DialogueBeat[] = [

  // ═══════════════════
  // TRIXIE
  // ═══════════════════
  {
    id: 'trixie_pastry_lesson_1',
    character: 'trixie',
    lines: [
      { speaker: 'trixie', text: "Okay. I'm watching. I have notes." },
      { speaker: 'rowan', text: "You don't need notes for pastry." },
      { speaker: 'trixie', text: "Rowan. I have a spreadsheet." },
    ]
  },
  {
    id: 'trixie_first_attempt',
    character: 'trixie',
    lines: [
      { speaker: 'trixie', text: "So. It's a bit... flat." },
      { speaker: 'rowan', text: "It's very flat." },
      { speaker: 'trixie', text: "I'm updating the spreadsheet." },
    ]
  },
  {
    id: 'trixie_scone_spreadsheet',
    character: 'trixie',
    lines: [
      { speaker: 'trixie', text: "I've cross-referenced twelve scone recipes. Cream first. Always. This is settled science." },
      { speaker: 'rowan', text: "...It's actually very thorough." },
      { speaker: 'trixie', text: "Tab three has citations." },
    ]
  },
  {
    id: 'trixie_first_success',
    character: 'trixie',
    lines: [
      { speaker: 'trixie', text: "[from the kitchen] ROWAN—", isAction: true },
      { speaker: 'rowan', text: "Are you okay?!" },
      { speaker: 'trixie', text: "They're PERFECT. Come and look at them RIGHT NOW." },
      { speaker: 'rowan', text: "You made those." },
      { speaker: 'trixie', text: "...I made those." },
    ]
  },

  // ═══════════════════
  // ALO
  // ═══════════════════
  {
    id: 'alo_custard_memory',
    character: 'alo',
    lines: [
      { speaker: 'alo', text: "Mum used to make that on Sundays." },
      { speaker: 'rowan', text: "I know." },
      { speaker: 'alo', text: "...Yeah." },
    ]
  },
  {
    id: 'alo_focaccia_nod',
    character: 'alo',
    lines: [
      { speaker: 'alo', text: "[takes a piece without asking, chews, nods once]", isAction: true },
      { speaker: 'rowan', text: "Well?" },
      { speaker: 'alo', text: "It's alright." },
      { speaker: 'rowan', text: "That's the best review I've ever had from you." },
      { speaker: 'alo', text: "Don't push it." },
    ]
  },
  {
    id: 'alo_birthday',
    character: 'alo',
    lines: [
      { speaker: 'alo', text: "You didn't have to do this." },
      { speaker: 'rowan', text: "I know." },
      { speaker: 'alo', text: "I didn't even tell you it was my birthday." },
      { speaker: 'rowan', text: "I know that too." },
    ]
  },
  {
    id: 'alo_return_talk',
    character: 'alo',
    lines: [
      { speaker: 'alo', text: "You look like yourself now." },
      { speaker: 'rowan', text: "...Yeah?" },
      { speaker: 'alo', text: "When you left you didn't quite. Now you do." },
      { speaker: 'alo', text: "Anyway. The grease trap needs cleaning." },
      { speaker: 'rowan', text: "[pause]", isAction: true },
      { speaker: 'rowan', text: "Thanks, Alo." },
    ]
  },

  // ── Alo's café repairs (gate cafeLevel upgrades) ──
  {
    id: 'cafe_repair_door',
    character: 'alo',
    lines: [
      { speaker: 'alo', text: "Door's been sticking for years. Two minutes with a plane." },
      { speaker: 'rowan', text: "You knew the whole time?" },
      { speaker: 'alo', text: "Someone had to." },
    ]
  },
  {
    id: 'cafe_repair_counter',
    character: 'alo',
    lines: [
      { speaker: 'alo', text: "[runs a hand along the rebuilt counter]", isAction: true },
      { speaker: 'alo', text: "Won't wobble when Linda leans on it now." },
      { speaker: 'rowan', text: "She'll notice." },
      { speaker: 'alo', text: "She notices everything." },
    ]
  },
  {
    id: 'cafe_repair_coffee',
    character: 'alo',
    lines: [
      { speaker: 'alo', text: "Machine's older than you." },
      { speaker: 'rowan', text: "Can you fix it?" },
      { speaker: 'alo', text: "Already did. Don't tell it I said its age." },
    ]
  },
  {
    id: 'cafe_repair_wall',
    character: 'alo',
    lines: [
      { speaker: 'alo', text: "Rebuilt the garden wall. Found three feathers in the gap." },
      { speaker: 'rowan', text: "Brigadier's." },
      { speaker: 'alo', text: "[sets the feathers on the sill, says nothing]", isAction: true },
    ]
  },
  {
    id: 'cafe_repair_window',
    character: 'alo',
    lines: [
      { speaker: 'alo', text: "Cleared the window corner. Mum's table fits there again." },
      { speaker: 'rowan', text: "...Yeah. It does." },
      { speaker: 'alo', text: "Thought you'd want to know." },
    ]
  },

  // ═══════════════════
  // LINDA
  // ═══════════════════
  {
    id: 'linda_lemon_memory',
    character: 'linda',
    lines: [
      { speaker: 'linda', text: "That smells like your first day of school." },
      { speaker: 'rowan', text: "...What?" },
      { speaker: 'linda', text: "You'd been in the garden. You smelled like lemons. I have no idea why." },
    ]
  },
  {
    id: 'linda_saffron_wonder',
    character: 'linda',
    lines: [
      { speaker: 'linda', text: "Where did you get saffron?" },
      { speaker: 'rowan', text: "Brigadier left it." },
      { speaker: 'linda', text: "Of course he did." },
      { speaker: 'linda', text: "Don't put too much in." },
    ]
  },
  {
    id: 'linda_custard_tart_story',
    character: 'linda',
    lines: [
      { speaker: 'linda', text: "Bit more nutmeg." },
      { speaker: 'rowan', text: "The recipe doesn't say nutmeg." },
      { speaker: 'linda', text: "The recipe is wrong about the nutmeg." },
    ]
  },
  {
    id: 'linda_friday_pizza_memory',
    character: 'linda',
    lines: [
      { speaker: 'linda', text: "[quiet for a moment]", isAction: true },
      { speaker: 'linda', text: "You remembered the basil order." },
      { speaker: 'rowan', text: "Basil first, then tomato, then cheese." },
      { speaker: 'linda', text: "I taught you that." },
      { speaker: 'rowan', text: "You did." },
    ]
  },
  {
    id: 'linda_recipe_card',
    character: 'linda',
    lines: [
      { speaker: 'linda', text: "[hands Rowan a laminated card]", isAction: true },
      { speaker: 'linda', text: "I drew that bunny when I was pregnant with Alo. I don't know why I drew a bunny." },
      { speaker: 'rowan', text: "We've always loved bunnies." },
      { speaker: 'linda', text: "We have, haven't we." },
    ]
  },
  {
    id: 'linda_name_day_bun',
    character: 'linda',
    lines: [
      { speaker: 'rowan', text: "I've been trying to remember what you put in it." },
      { speaker: 'linda', text: "Cardamom. Small amount. You can't taste it but it's wrong without it." },
      { speaker: 'rowan', text: "You made it the same day." },
      { speaker: 'linda', text: "Of course I did." },
      { speaker: 'linda', text: "[matter-of-factly]", isAction: true },
      { speaker: 'linda', text: "You'd told me your name." },
    ]
  },
  {
    id: 'linda_correction',
    character: 'linda',
    lines: [
      { speaker: 'linda', text: "[from armchair, not looking up from her book]", isAction: true },
      { speaker: 'linda', text: "It's Rowan." },
      { speaker: 'linda', text: "His name is Rowan." },
      { speaker: 'linda', text: "Thank you." },
      { speaker: 'rowan', text: "[later, to Trixie] She does that every time.", isAction: true },
      { speaker: 'trixie', text: "She doesn't even look up from her book." },
      { speaker: 'rowan', text: "She doesn't need to." },
    ]
  },
  {
    id: 'linda_cafe_birthday',
    character: 'linda',
    lines: [
      { speaker: 'rowan', text: "I found a photo. I think I got it right." },
      { speaker: 'linda', text: "[looks at the cake for a long time]", isAction: true },
      { speaker: 'linda', text: "You got the bunny right." },
      { speaker: 'linda', text: "[laughs]", isAction: true },
      { speaker: 'linda', text: "You got the bunny exactly right." },
    ]
  },
  {
    id: 'linda_at_the_table',
    character: 'linda',
    lines: [
      { speaker: 'linda', text: "[sits at the window table]", isAction: true },
      { speaker: 'rowan', text: "[sets the plate down, sits opposite]", isAction: true },
      { speaker: 'linda', text: "...This is nice." },
      { speaker: 'rowan', text: "It is." },
      { speaker: 'linda', text: "Don't tell Alo I cried." },
      { speaker: 'rowan', text: "I won't." },
    ]
  },

  // ═══════════════════
  // BRIGADIER (Monkeyoji)
  // — always isAction, never speech
  // ═══════════════════
  {
    id: 'brigadier_visit',
    character: 'brigadier',
    lines: [
      { speaker: 'brigadier', text: "Brigadier is on the windowsill, hat slightly askew. He sets down a single thread of saffron with enormous ceremony.", isAction: true },
      { speaker: 'brigadier', text: "He looks at the saffron. He looks at you. He adjusts the hat, and ambles back over the garden wall.", isAction: true },
    ]
  },
  {
    id: 'brigadier_saffron_watch',
    character: 'brigadier',
    lines: [
      { speaker: 'brigadier', text: "Brigadier appears on the garden wall and watches through the window with great attention. He does not blink.", isAction: true },
      { speaker: 'brigadier', text: "When the dough turns gold, he nods once and disappears.", isAction: true },
    ]
  },
  {
    id: 'brigadier_saffron_buns',
    character: 'brigadier',
    lines: [
      { speaker: 'brigadier', text: "Brigadier is on the windowsill before the oven timer goes off. Nobody saw him arrive.", isAction: true },
      { speaker: 'brigadier', text: "He places one paw on the glass. Politely. He can wait.", isAction: true },
    ]
  },
  {
    id: 'brigadier_gift_return',
    character: 'brigadier',
    lines: [
      { speaker: 'brigadier', text: "In the morning, the plate on the garden wall is empty. In its place: a single white feather, perfectly placed.", isAction: true },
      { speaker: 'brigadier', text: "Nobody knows where he gets the feathers. Linda hangs it by the window. It stays there.", isAction: true },
    ]
  },
  {
    id: 'golden_bun_debut',
    character: 'brigadier',
    lines: [
      { speaker: 'alo', text: "Someone's written about this online." },
      { speaker: 'rowan', text: "About the buns?" },
      { speaker: 'alo', text: "[shows Linda his phone]", isAction: true },
      { speaker: 'linda', text: "Read it to me." },
      { speaker: 'brigadier', text: "From the garden wall, Brigadier observes. He is wearing the hat.", isAction: true },
    ]
  },
  {
    id: 'neighbourhood_event',
    character: 'trixie',
    lines: [
      { speaker: 'trixie', text: "The spreadsheet was twelve pages. I'm not apologising for that." },
      { speaker: 'rowan', text: "It was genuinely perfect." },
      { speaker: 'trixie', text: "Tab seven was a risk assessment for Brigadier." },
      { speaker: 'rowan', text: "...Was he on the risk assessment?" },
      { speaker: 'trixie', text: "He was most of the risk assessment." },
    ]
  },
];