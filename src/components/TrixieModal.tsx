// src/components/TrixieModal.tsx
// Bloom — The Fluffy Bunny Café
// Trixie's friendship surface. Each level she opens a new ingredient category
// for the pantry. Shows current level, progress to the next unlock, and what
// each tier brings — discovered tiers in full, future ones teased.

import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../game/gameState';
import {
  FRIENDSHIP_TIERS,
  friendshipLevelFor,
  nextFriendshipTier,
} from '../game/friendship';
import { SPAWNABLE_INGREDIENTS } from '../game/spawner';

interface Props {
  visible: boolean;
  onClose: () => void;
}

function categoryEmojis(category: string | null): string {
  if (!category) return '🌿 🍚';
  return SPAWNABLE_INGREDIENTS.filter((i) => i.category === category)
    .map((i) => i.emoji)
    .join(' ');
}

export function TrixieModal({ visible, onClose }: Props) {
  const friendshipPoints = useGameStore((s) => s.friendshipPoints);
  const level = friendshipLevelFor(friendshipPoints);
  const next = nextFriendshipTier(level);
  const toNext = next ? Math.max(0, next.threshold - friendshipPoints) : 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#fdf6e9', '#f5e6cc']} style={styles.gradient}>

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>💛 Trixie</Text>
            <Text style={styles.subtitle}>
              Friendship level {level}
              {next ? ` · ${toNext} more dish${toNext === 1 ? '' : 'es'} to "${next.blurb}"` : ' · maxed out!'}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.intro}>
            Trixie's a terrible cook but the best friend you've got. Every dish you
            discover, you discover together — and she keeps finding you new ingredients.
          </Text>

          {FRIENDSHIP_TIERS.map((tier) => {
            const done = level >= tier.level;
            const isNext = tier.level === level + 1;
            return (
              <View
                key={tier.level}
                style={[
                  styles.card,
                  done && styles.cardDone,
                  !done && !isNext && styles.cardLocked,
                ]}
              >
                <View style={styles.cardHead}>
                  <Text style={styles.cardLevel}>Lv {tier.level}</Text>
                  <Text style={styles.cardTitle}>{tier.blurb}</Text>
                  {done ? <Text style={styles.doneTick}>✓</Text> : null}
                </View>
                <Text style={styles.cardEmojis}>{categoryEmojis(tier.unlocksCategory)}</Text>
                {!done ? (
                  <Text style={styles.cardNeed}>
                    {isNext
                      ? `Discover ${toNext} more recipe${toNext === 1 ? '' : 's'}`
                      : `Reach friendship level ${tier.level}`}
                  </Text>
                ) : null}
              </View>
            );
          })}

          <Text style={styles.footer}>She'd want it noted that she has a spreadsheet.</Text>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8D5B7',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#3D2B1F' },
  subtitle: { fontSize: 13, color: '#7A6855', marginTop: 2, maxWidth: 260 },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8D5B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 14, color: '#7A6855', fontWeight: '600' },
  content: { padding: 24, paddingBottom: 48 },
  intro: { fontSize: 14, color: '#7A6855', lineHeight: 21, marginBottom: 18 },
  card: {
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#B8977E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDone: { borderWidth: 1.5, borderColor: '#C87CC8' },
  cardLocked: { opacity: 0.6 },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardLevel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#C87CC8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 10,
    overflow: 'hidden',
  },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#3D2B1F' },
  doneTick: { fontSize: 16, color: '#C87CC8', fontWeight: '700' },
  cardEmojis: { fontSize: 22, marginTop: 10, letterSpacing: 2 },
  cardNeed: { fontSize: 12, color: '#B8977E', marginTop: 8, fontStyle: 'italic' },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#B8977E',
    lineHeight: 18,
    marginTop: 4,
  },
});
