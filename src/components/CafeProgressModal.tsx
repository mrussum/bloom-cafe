// src/components/CafeProgressModal.tsx
// Bloom — The Fluffy Bunny Café
// Alo's repair list. The café levels up one repair at a time; each is gated by
// the player's progress. Completed repairs read as done, the next shows what's
// still needed (or an "Ask Alo" button when ready), later ones stay locked.

import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../game/gameState';
import { CAFE_STAGES, cafeRepairReadiness } from '../game/cafe';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CafeProgressModal({ visible, onClose }: Props) {
  const cafeLevel = useGameStore((s) => s.cafeLevel);
  const level = useGameStore((s) => s.level);
  const discoveredRecipes = useGameStore((s) => s.discoveredRecipes);
  const repairCafe = useGameStore((s) => s.repairCafe);

  function handleRepair() {
    if (repairCafe()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onClose(); // close so Alo's story beat is visible
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#fdf6e9', '#f5e6cc']} style={styles.gradient}>

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🔨 The Café</Text>
            <Text style={styles.subtitle}>Café level {cafeLevel} · Alo's repairs</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {CAFE_STAGES.map((stage) => {
            const done = cafeLevel >= stage.level;
            const isNext = stage.level === cafeLevel + 1;
            const { ready, needs } = cafeRepairReadiness(stage, { level, discoveredRecipes });

            return (
              <View
                key={stage.id}
                style={[
                  styles.card,
                  done && styles.cardDone,
                  !done && !isNext && styles.cardLocked,
                ]}
              >
                <View style={styles.cardHead}>
                  <Text style={styles.cardLevel}>Lv {stage.level}</Text>
                  <Text style={styles.cardTitle}>{done || isNext ? stage.title : '???'}</Text>
                  {done ? <Text style={styles.doneTick}>✓</Text> : null}
                </View>

                {done || isNext ? (
                  <Text style={styles.cardDesc}>{stage.description}</Text>
                ) : (
                  <Text style={styles.cardHint}>A repair for later.</Text>
                )}

                {isNext && !done ? (
                  ready ? (
                    <Pressable
                      style={({ pressed }) => [styles.repairButton, pressed && styles.repairPressed]}
                      onPress={handleRepair}
                    >
                      <Text style={styles.repairText}>Ask Alo to fix it</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.needsBox}>
                      <Text style={styles.needsLabel}>Alo's waiting on:</Text>
                      {needs.map((n) => (
                        <Text key={n} style={styles.needsItem}>• {n}</Text>
                      ))}
                    </View>
                  )
                ) : null}
              </View>
            );
          })}

          <Text style={styles.footer}>
            Alo stayed when you left. Letting him fix things is its own kind of thank you.
          </Text>
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
  subtitle: { fontSize: 13, color: '#7A6855', marginTop: 2 },
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
  cardDone: { borderWidth: 1.5, borderColor: '#7BC67E' },
  cardLocked: { opacity: 0.6 },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardLevel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D3B2D',
    backgroundColor: '#D4E870',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 10,
    overflow: 'hidden',
  },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#3D2B1F' },
  doneTick: { fontSize: 16, color: '#7BC67E', fontWeight: '700' },
  cardDesc: { fontSize: 13, color: '#7A6855', marginTop: 8, lineHeight: 19 },
  cardHint: { fontSize: 12, color: '#B8977E', marginTop: 8, fontStyle: 'italic' },
  repairButton: {
    marginTop: 14,
    backgroundColor: '#2D3B2D',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  repairPressed: { backgroundColor: '#3D5C3D' },
  repairText: { color: '#F5F0E8', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  needsBox: {
    marginTop: 12,
    backgroundColor: '#F5E6CC',
    borderRadius: 12,
    padding: 12,
  },
  needsLabel: { fontSize: 12, fontWeight: '700', color: '#7A6855', marginBottom: 4 },
  needsItem: { fontSize: 13, color: '#7A6855', lineHeight: 20 },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#B8977E',
    lineHeight: 18,
    marginTop: 4,
  },
});
