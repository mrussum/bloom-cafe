// src/screens/CafeScreen.tsx
// Bloom — The Fluffy Bunny Café
// Main game screen: chalkboard header, merge grid, pantry, Brigadier + goals.

import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useGameStore, BRIGADIER_COOLDOWN } from '../game/gameState';
import { SPAWNABLE_INGREDIENTS, getNextGoal, recipeProgress } from '../game/spawner';
import { cafeRepairReadiness, nextCafeStage } from '../game/cafe';
import {
  friendshipLevelFor,
  nextFriendshipTier,
  unlockedCategories,
} from '../game/friendship';
import { MergeGrid } from '../components/MergeGrid';
import { StoryToast } from '../components/StoryToast';
import { RecipeBook } from '../components/RecipeBook';
import { SettingsModal } from '../components/SettingsModal';
import { CafeProgressModal } from '../components/CafeProgressModal';
import { TrixieModal } from '../components/TrixieModal';
import { LevelUpOverlay } from '../components/LevelUpOverlay';
import { OnboardingOverlay } from '../components/OnboardingOverlay';
import { supabase } from '../services/supabase';
import { useSave } from '../hooks/useSave';
import { useAudio } from '../hooks/useAudio';
import { playSfx } from '../services/audio';
import { showInterstitial } from '../services/ads';
import { checkRemoveAds } from '../services/purchases';
import { ShopScreen } from './ShopScreen';

const XP_PER_LEVEL = 100;

export function CafeScreen() {
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const grid = useGameStore((s) => s.grid);
  const discoveredRecipes = useGameStore((s) => s.discoveredRecipes);
  const cafeLevel = useGameStore((s) => s.cafeLevel);
  const friendshipPoints = useGameStore((s) => s.friendshipPoints);
  const mergeCount = useGameStore((s) => s.mergeCount);
  const lastBrigadierMerge = useGameStore((s) => s.lastBrigadierMerge);
  const spawnBase = useGameStore((s) => s.spawnBase);
  const autoSpawn = useGameStore((s) => s.autoSpawn);
  const summonBrigadier = useGameStore((s) => s.summonBrigadier);
  const ensurePlayable = useGameStore((s) => s.ensurePlayable);
  const userId = useGameStore((s) => s.userId);
  const setUserId = useGameStore((s) => s.setUserId);
  const hasRemovedAds = useGameStore((s) => s.hasRemovedAds);
  const setHasRemovedAds = useGameStore((s) => s.setHasRemovedAds);
  const hasOnboarded = useGameStore((s) => s.hasOnboarded);
  const setHasOnboarded = useGameStore((s) => s.setHasOnboarded);

  const [shopOpen, setShopOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cafeOpen, setCafeOpen] = useState(false);
  const [trixieOpen, setTrixieOpen] = useState(false);
  const [celebrationLevel, setCelebrationLevel] = useState<number | null>(null);

  // Anonymous auth — resolves existing session or creates a new one.
  // Fire-and-forget: game is fully playable while this resolves.
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        } else {
          const { data } = await supabase.auth.signInAnonymously();
          if (data.user) setUserId(data.user.id);
        }
      } catch (err) {
        console.warn('[bloom] auth failed silently:', err);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync remove-ads entitlement on mount (catches purchases made on other devices)
  useEffect(() => {
    checkRemoveAds().then((val) => { if (val) setHasRemovedAds(val); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Session loop: whenever the grid can't merge, top it up so the player
  // always has a move. No-ops when a merge is already available.
  useEffect(() => {
    ensurePlayable();
  }, [grid, ensurePlayable]);

  // Auto-save every 60s + on background
  useSave(userId);

  // Audio: preload SFX, drive ambient loop from prefs
  useAudio();

  // Level-up moment: celebratory chime + the (only) in-play ad trigger.
  // Skips the very first render so loading a saved level never fires an ad.
  const prevLevel = useRef<number | null>(null);
  useEffect(() => {
    if (prevLevel.current === null) {
      prevLevel.current = level;
      return;
    }
    if (level > prevLevel.current) {
      setCelebrationLevel(level); // overlay plays the chime + confetti
      void showInterstitial({ surface: 'levelup', hasRemovedAds });
    }
    prevLevel.current = level;
  }, [level, hasRemovedAds]);

  function openShop() {
    setShopOpen(true);
    void showInterstitial({ surface: 'shop_open', hasRemovedAds });
  }

  const xpProgress = (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  const { found, total } = recipeProgress(discoveredRecipes);
  const nextGoal = getNextGoal(discoveredRecipes);
  const brigadierHere = mergeCount - lastBrigadierMerge >= BRIGADIER_COOLDOWN;

  // Is a café repair ready for Alo? (drives the 🔨 button's notification dot)
  const nextStage = nextCafeStage(cafeLevel);
  const repairReady = nextStage
    ? cafeRepairReadiness(nextStage, { level, discoveredRecipes }).ready
    : false;

  // Trixie's friendship gates which ingredients the pantry offers.
  const friendLevel = friendshipLevelFor(friendshipPoints);
  const unlocked = unlockedCategories(friendLevel);
  const pantry = SPAWNABLE_INGREDIENTS.filter((i) => unlocked.has(i.category));
  const friendTier = nextFriendshipTier(friendLevel);
  const dishesToUnlock = friendTier ? Math.max(0, friendTier.threshold - friendshipPoints) : 0;

  // Gentle pulse for the Brigadier so he draws the eye without nagging.
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (brigadierHere) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.12, { duration: 700 }), withTiming(1, { duration: 700 })),
        -1,
        true,
      );
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [brigadierHere, pulse]);
  const brigadierStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  function handleSpawn(id: string) {
    if (spawnBase(id)) void playSfx('spawn');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }

  function handleBox() {
    const ok = autoSpawn();
    if (ok) void playSfx('spawn');
    Haptics.impactAsync(
      ok ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => {});
  }

  function handleBrigadier() {
    const ok = summonBrigadier();
    if (ok) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }

  return (
    <LinearGradient colors={['#fdf6e9', '#f5e6cc']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>

        {/* ── Chalkboard header ── */}
        <View style={styles.chalkboard}>
          <View style={styles.headerRow}>
            <Text style={styles.cafeTitle} numberOfLines={1}>The Fluffy Bunny 🐰</Text>
            <View style={styles.headerRight}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv {level}</Text>
              </View>
              <Pressable onPress={() => setCafeOpen(true)} style={styles.iconButton}>
                <Text style={styles.iconButtonText}>🔨</Text>
                {repairReady ? <View style={styles.notifyDot} /> : null}
              </Pressable>
              <Pressable onPress={() => setBookOpen(true)} style={styles.iconButton}>
                <Text style={styles.iconButtonText}>📖</Text>
              </Pressable>
              <Pressable onPress={() => setSettingsOpen(true)} style={styles.iconButton}>
                <Text style={styles.iconButtonText}>⚙️</Text>
              </Pressable>
              <Pressable onPress={openShop} style={styles.iconButton}>
                <Text style={styles.iconButtonText}>🛍️</Text>
              </Pressable>
            </View>
          </View>

          {/* XP bar */}
          <View style={styles.xpTrack}>
            <View style={styles.xpBarOuter}>
              <View style={{ flex: xpProgress, backgroundColor: '#D4E870', borderRadius: 3 }} />
              <View style={{ flex: 1 - xpProgress }} />
            </View>
            <Text style={styles.xpLabel}>
              {xp % XP_PER_LEVEL} / {XP_PER_LEVEL} xp
            </Text>
          </View>
        </View>

        {/* ── Goal hint ── */}
        <Pressable onPress={() => setBookOpen(true)} style={styles.goalBanner}>
          {nextGoal ? (
            <Text style={styles.goalText} numberOfLines={1}>
              Next: make <Text style={styles.goalName}>{nextGoal.displayName}</Text> {nextGoal.emoji}
            </Text>
          ) : (
            <Text style={styles.goalText}>Every recipe discovered — Linda's proud. 🐰</Text>
          )}
          <Text style={styles.goalCount}>{found}/{total}</Text>
        </Pressable>

        {/* ── Merge grid (Brigadier perches here when he visits) ── */}
        <View style={styles.gridWrapper}>
          <View style={styles.gridShadow}>
            <MergeGrid />
          </View>

          {brigadierHere ? (
            <Animated.View style={[styles.brigadierWrap, brigadierStyle]}>
              <Pressable onPress={handleBrigadier} style={styles.brigadier}>
                <Text style={styles.brigadierEmoji}>🐒</Text>
              </Pressable>
              <Text style={styles.brigadierHint}>tap</Text>
            </Animated.View>
          ) : null}
        </View>

        {/* ── Trixie friendship strip ── */}
        <Pressable onPress={() => setTrixieOpen(true)} style={styles.trixieStrip}>
          <Text style={styles.trixieText} numberOfLines={1}>
            💛 Trixie · Lv {friendLevel}
            {friendTier
              ? `  —  ${dishesToUnlock} dish${dishesToUnlock === 1 ? '' : 'es'} to ${friendTier.blurb}`
              : '  —  every ingredient unlocked'}
          </Text>
          <Text style={styles.trixieChevron}>›</Text>
        </Pressable>

        {/* ── Pantry (gated by Trixie's friendship) ── */}
        <View style={styles.pantry}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pantryRow}
          >
            {pantry.map((ing) => (
              <Pressable
                key={ing.id}
                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                onPress={() => handleSpawn(ing.id)}
              >
                <Text style={styles.chipEmoji}>{ing.emoji}</Text>
                <Text style={styles.chipName}>{ing.displayName}</Text>
              </Pressable>
            ))}
            {friendTier ? (
              <Pressable
                style={({ pressed }) => [styles.chip, styles.chipLocked, pressed && styles.chipPressed]}
                onPress={() => setTrixieOpen(true)}
              >
                <Text style={styles.chipEmoji}>🔒</Text>
                <Text style={styles.chipName}>more soon</Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <Pressable
            style={({ pressed }) => [styles.boxButton, pressed && styles.boxPressed]}
            onPress={handleBox}
          >
            <Text style={styles.boxEmoji}>🧺</Text>
            <Text style={styles.boxLabel}>Box of bits</Text>
          </Pressable>
        </View>

      </SafeAreaView>

      {/* Story toast — absolutely positioned, always mounted for smooth animation */}
      <StoryToast />

      {/* Level-up celebration — above everything */}
      <LevelUpOverlay level={celebrationLevel} onDone={() => setCelebrationLevel(null)} />

      {/* First-run onboarding — sits on top until completed/skipped */}
      {!hasOnboarded ? <OnboardingOverlay onDone={() => setHasOnboarded(true)} /> : null}

      {/* Modals */}
      <ShopScreen visible={shopOpen} onClose={() => setShopOpen(false)} />
      <RecipeBook visible={bookOpen} onClose={() => setBookOpen(false)} />
      <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CafeProgressModal visible={cafeOpen} onClose={() => setCafeOpen(false)} />
      <TrixieModal visible={trixieOpen} onClose={() => setTrixieOpen(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },

  // Chalkboard header
  chalkboard: {
    backgroundColor: '#2D3B2D',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cafeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F5F0E8',
    letterSpacing: 0.3,
    flexShrink: 1,
    marginRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelBadge: {
    backgroundColor: '#D4E870',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D3B2D',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3D5C3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 16,
  },
  notifyDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E8704A',
    borderWidth: 1,
    borderColor: '#2D3B2D',
  },
  xpTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  xpBarOuter: {
    flex: 1,
    height: 6,
    backgroundColor: '#1A2A1A',
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  xpLabel: {
    fontSize: 11,
    color: '#A8B894',
    width: 70,
    textAlign: 'right',
  },

  // Goal hint
  goalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFF8F0',
    borderRadius: 14,
    shadowColor: '#B8977E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  goalText: {
    flex: 1,
    fontSize: 13,
    color: '#7A6855',
  },
  goalName: {
    fontWeight: '700',
    color: '#3D2B1F',
  },
  goalCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C87C5E',
    marginLeft: 10,
  },

  // Grid area
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  gridShadow: {
    shadowColor: '#8B6B4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },

  // Brigadier
  brigadierWrap: {
    position: 'absolute',
    right: 8,
    top: 8,
    alignItems: 'center',
  },
  brigadier: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D4B483',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  brigadierEmoji: {
    fontSize: 28,
  },
  brigadierHint: {
    fontSize: 10,
    color: '#B8977E',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },

  // Trixie strip
  trixieStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 2,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: '#F7EEF7',
    borderRadius: 12,
  },
  trixieText: {
    flex: 1,
    fontSize: 12,
    color: '#8A5A8A',
    fontWeight: '600',
  },
  trixieChevron: {
    fontSize: 18,
    color: '#C87CC8',
    fontWeight: '700',
    marginLeft: 8,
  },

  // Pantry
  pantry: {
    paddingBottom: 24,
    paddingTop: 4,
    gap: 10,
  },
  chipLocked: {
    opacity: 0.7,
    backgroundColor: '#F2E8DC',
  },
  pantryRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    backgroundColor: '#FFF8F0',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 64,
    shadowColor: '#B8977E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  chipPressed: {
    backgroundColor: '#F5E6CC',
  },
  chipEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  chipName: {
    fontSize: 10,
    color: '#7A6855',
    fontWeight: '600',
  },
  boxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2D3B2D',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  boxPressed: {
    backgroundColor: '#3D5C3D',
  },
  boxEmoji: {
    fontSize: 20,
  },
  boxLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F5F0E8',
    letterSpacing: 0.3,
  },
});
