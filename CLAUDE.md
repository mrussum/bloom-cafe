# BLOOM — Cozy Merge Café
## CLAUDE.md — Project Bible

### What This Is
A mobile merge game (React Native + Expo) for iOS and Android.
The player runs a cosy café as Rowan, a trans man (he/him) in his 
mid-twenties who returns to his Cambridge neighbourhood to revive his 
disabled mum Linda's café, The Fluffy Bunny. Core mechanic: 
drag-and-drop merge grid. No energy systems. No manipulative timers.
Ethical mobile game with cosmetic IAP + one-time remove-ads purchase.

Real-world mission: built by Michael Russum (Cambridge) to help his
family. This context informs the warmth and authenticity of the writing.

### Tech Stack
- React Native + Expo (TypeScript, strict mode)
- Zustand with AsyncStorage persistence (game state)
- Supabase (cloud saves + anonymous auth)
- RevenueCat (IAP — cosmetics + remove-ads)
- expo-haptics (merge feedback — critical for feel)
- react-native-gesture-handler (drag/drop)
- expo-av (ambient sound + SFX)
- expo-linear-gradient (UI polish)

### Architecture Rules — NEVER VIOLATE THESE
1. src/game/ = pure TypeScript ONLY. Zero React imports. Zero UI.
2. All game logic is immutable — functions take state, return new state
3. Components never modify state directly — always via Zustand store actions
4. Merge engine returns null for invalid moves, never throws exceptions
5. Cloud save is fire-and-forget — NEVER block gameplay waiting for it
6. Recipes are data, not code — defined in recipes.ts as a plain array
7. NPC dialogue is data — defined in npcs.ts, never hardcoded in components

### Folder Structure
src/
  game/              ← PURE TS — no React here ever
    types.ts         ← All TypeScript interfaces
    mergeEngine.ts   ← Core merge algorithm
    gameState.ts     ← Zustand store
    recipes.ts       ← Recipe definitions (data)
    npcs.ts          ← Character + dialogue data
  screens/
    CafeScreen.tsx   ← Main game screen
    StoryScreen.tsx  ← NPC dialogue moments
    ShopScreen.tsx   ← Cosmetics + IAP
  components/
    MergeGrid.tsx
    MergeCell.tsx
    ParticleEffect.tsx
    DialogueBubble.tsx
  services/
    supabase.ts
    purchases.ts
    analytics.ts
  assets/
    images/
    sounds/
  hooks/
    useGameState.ts
    useSave.ts

### Characters
ROWAN (protagonist, he/him, 24)
  Trans man, quietly determined, dry humour. Expresses care through food.
  Came home to look after Linda. His arc: learning to ask for help.
  Favourite recipe: Mum's Friday Pizza (triggers Linda's memory dialogue)

LINDA (Rowan's mum, she/her, 57)
  Sharp, warm, funny. Runs The Fluffy Bunny for 20 years before health dipped.
  Pretends not to notice how much she needs Rowan there. Fiercely proud.
  Mechanic: Linda's memories unlock recipe lore and café history.

ALO (Rowan's older brother, he/him, 28)
  Stayed when Rowan left. Practical, toolbelt always present. Quietly hurt,
  quietly glad. Mechanic: Alo's repairs gate café level upgrades.

TRIXIE (Rowan's best friend, she/her, 24)
  Chaotic, warm, genuinely terrible cook. First called Rowan by his name.
  Mechanic: Trixie's friendship levels unlock new ingredient categories.

BRIGADIER (the baboon — wise, mischievous, no explanation given)
  Communicates via actions and significant looks. Has a small hat (origin unknown).
  Steals only from the chain café down the road. Fond of Linda's lavender.
  Mechanic: Brings rare mystery ingredients. Tap him to trigger.
  Dialogue style: NO spoken words — only flavour text describing his actions.

### Setting
The Croft — a quaint cobbled lane in Cambridge, UK.
The Fluffy Bunny Café — bunny motifs, original 1980s tiles, chalkboard menu.
Tone: warm, funny, gentle. Like a good hug from someone who knows you well.

### Ethical Design Rules
- NO energy timers that lock players out
- NO fake scarcity ("LIMITED TIME!!!") 
- NO aggressive ad placement — ads ONLY on level-up and shop-open
- Remove-ads purchase is always visible and clearly described
- All IAP is purely cosmetic or convenience — never pay-to-progress

### Monetisation Products
BLOOM_REMOVE_ADS       £2.99 one-time
BLOOM_CAFE_THEME_*     £1.99 each (cosmetic café skins)
BLOOM_ROWAN_OUTFIT_*   £0.99 each (character cosmetics)

### Current Build Status
[ UPDATE THIS EACH SESSION ]
- Phase: audio + feel / level-up moments
- Last completed: audio.ts (expo-av — preloaded SFX + looping ambient pad), synthesised WAV assets (scripts/gen_audio.py → merge/spawn/levelup/sparkle/ambient), useAudio.ts hook, sound+music prefs in store, SettingsModal.tsx (⚙️ toggles), ads.ts ethical ad-trigger stub (level-up + shop-open only, respects remove-ads), merge/spawn/level-up/story SFX wired — zero TS errors
- In progress: —
- Next task: Session 8 — café progression (Alo's repairs gate cafeLevel upgrades) + a proper level-up celebration moment, then wire a real ad SDK into ads.ts

### Writing Style Guide
- Warm but never saccharine
- Funny in a dry, observational way (think: early Stardew, Coffee Talk)
- NPC dialogue is SHORT — 1–3 sentences max per bubble
- Brigadier NEVER speaks — describe his actions only
- Linda's dialogue always contains exactly one opinion about Rowan's cooking