// src/components/RecipeBook.tsx
// Bloom — The Fluffy Bunny Café
// Recipe discovery tracker. Discovered recipes show their full card;
// undiscovered ones stay a teasing "???" so there's always more to find.

import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../game/gameState';
import { RECIPES } from '../game/recipes';
import { lookupType, recipeProgress } from '../game/spawner';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const TIER_SECTIONS: { tier: number; label: string }[] = [
  { tier: 2, label: 'Prepared Basics' },
  { tier: 3, label: 'Café Staples' },
  { tier: 4, label: 'Signature Dishes' },
  { tier: 5, label: 'Special Occasions' },
  { tier: 6, label: 'Legendary' },
];

const TIER_COLORS: Record<number, string> = {
  2: '#4ECDC4',
  3: '#FFD166',
  4: '#FF8C42',
  5: '#C177E0',
  6: '#FFD700',
};

export function RecipeBook({ visible, onClose }: Props) {
  const discovered = useGameStore((s) => s.discoveredRecipes);
  const { found, total } = recipeProgress(discovered);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#fdf6e9', '#f5e6cc']} style={styles.gradient}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>📖 Recipe Book</Text>
            <Text style={styles.subtitle}>{found} of {total} discovered</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {TIER_SECTIONS.map(({ tier, label }) => {
            const recipes = RECIPES.filter((r) => r.outputTier === tier);
            if (recipes.length === 0) return null;
            return (
              <View key={tier} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.tierDot, { backgroundColor: TIER_COLORS[tier] }]} />
                  <Text style={styles.sectionTitle}>{label}</Text>
                </View>

                {recipes.map((recipe) => {
                  const isFound = discovered.includes(recipe.output);
                  const a = lookupType(recipe.inputs[0]);
                  const b = lookupType(recipe.inputs[1]);
                  return (
                    <View
                      key={recipe.output}
                      style={[styles.card, !isFound && styles.cardLocked]}
                    >
                      <Text style={styles.cardEmoji}>{isFound ? recipe.emoji : '🔒'}</Text>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardName}>
                          {isFound ? recipe.displayName : '???'}
                        </Text>
                        {isFound ? (
                          <Text style={styles.cardRecipe}>
                            {a?.emoji ?? '·'} + {b?.emoji ?? '·'}
                          </Text>
                        ) : (
                          <Text style={styles.cardHint}>Not yet discovered</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}

          <Text style={styles.footer}>
            Keep merging — Linda always says there's one more recipe in the tin.
          </Text>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3D2B1F',
  },
  subtitle: {
    fontSize: 13,
    color: '#7A6855',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8D5B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: '#7A6855',
    fontWeight: '600',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3D2B1F',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#B8977E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardEmoji: {
    fontSize: 26,
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D2B1F',
  },
  cardRecipe: {
    fontSize: 14,
    color: '#7A6855',
    marginTop: 2,
  },
  cardHint: {
    fontSize: 12,
    color: '#B8977E',
    marginTop: 2,
    fontStyle: 'italic',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#B8977E',
    lineHeight: 18,
    marginTop: 4,
  },
});
