// src/screens/CafeScreen.tsx
// Bloom — The Fluffy Bunny Café
// Main game screen: chalkboard header, merge grid, spawn buttons

import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { v4 as uuidv4 } from 'uuid';
import { useGameStore } from '../game/gameState';
import { BASE_INGREDIENTS } from '../game/recipes';
import type { GridItem, ItemCategory, ItemTier } from '../game/types';
import { MergeGrid } from '../components/MergeGrid';
import { StoryToast } from '../components/StoryToast';
import { supabase } from '../services/supabase';
import { useSave } from '../hooks/useSave';
import { checkRemoveAds } from '../services/purchases';
import { ShopScreen } from './ShopScreen';

const XP_PER_LEVEL = 100;

// The three spawn buttons specified for Session 3
const SPAWN_BUTTONS = [
  BASE_INGREDIENTS[0], // basil 🌿
  BASE_INGREDIENTS[1], // tomato 🍅
  BASE_INGREDIENTS[2], // flour 🌾
];

export function CafeScreen() {
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const spawnItem = useGameStore((s) => s.spawnItem);
  const userId = useGameStore((s) => s.userId);
  const setUserId = useGameStore((s) => s.setUserId);
  const setHasRemovedAds = useGameStore((s) => s.setHasRemovedAds);
  const [shopOpen, setShopOpen] = useState(false);

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

  // Auto-save every 60s + on background
  useSave(userId);

  const xpProgress = (xp % XP_PER_LEVEL) / XP_PER_LEVEL;

  function handleSpawn(id: string) {
    const ing = BASE_INGREDIENTS.find((i) => i.id === id);
    if (!ing) return;
    const item: GridItem = {
      id: uuidv4(),
      type: ing.id,
      tier: ing.tier as ItemTier,
      category: ing.category as ItemCategory,
      emoji: ing.emoji,
      assetKey: ing.id,
      isNew: true,
      isLocked: false,
    };
    spawnItem(item);
  }

  return (
    <LinearGradient colors={['#fdf6e9', '#f5e6cc']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>

        {/* ── Chalkboard header ── */}
        <View style={styles.chalkboard}>
          <View style={styles.headerRow}>
            <Text style={styles.cafeTitle}>The Fluffy Bunny 🐰</Text>
            <View style={styles.headerRight}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv {level}</Text>
              </View>
              <Pressable onPress={() => setShopOpen(true)} style={styles.shopButton}>
                <Text style={styles.shopButtonText}>🛍️</Text>
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

        {/* ── Merge grid ── */}
        <View style={styles.gridWrapper}>
          <View style={styles.gridShadow}>
            <MergeGrid />
          </View>
        </View>

        {/* ── Spawn buttons ── */}
        <View style={styles.spawnRow}>
          {SPAWN_BUTTONS.map((ing) => (
            <Pressable
              key={ing.id}
              style={({ pressed }) => [styles.spawnButton, pressed && styles.spawnPressed]}
              onPress={() => handleSpawn(ing.id)}
            >
              <Text style={styles.spawnEmoji}>{ing.emoji}</Text>
              <Text style={styles.spawnName}>{ing.displayName}</Text>
            </Pressable>
          ))}
        </View>

      </SafeAreaView>

      {/* Story toast — absolutely positioned, always mounted for smooth animation */}
      <StoryToast />

      {/* Shop modal */}
      <ShopScreen visible={shopOpen} onClose={() => setShopOpen(false)} />
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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  shopButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3D5C3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopButtonText: {
    fontSize: 16,
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

  // Spawn buttons
  spawnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 28,
    paddingTop: 8,
    paddingHorizontal: 20,
  },
  spawnButton: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 12,
    shadowColor: '#B8977E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  spawnPressed: {
    backgroundColor: '#F5E6CC',
  },
  spawnEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  spawnName: {
    fontSize: 11,
    color: '#7A6855',
    fontWeight: '600',
  },
});
