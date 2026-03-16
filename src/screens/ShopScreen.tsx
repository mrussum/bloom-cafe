// src/screens/ShopScreen.tsx
// Bloom — The Fluffy Bunny Café
// Cosmetics + remove-ads shop. Ethical: always clearly priced,
// no fake scarcity, no manipulative timers.

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';
import { useGameStore } from '../game/gameState';
import {
  checkRemoveAds,
  fetchOfferings,
  purchasePackage,
  restorePurchases,
} from '../services/purchases';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Cosmetic placeholder items — real products added once art is ready
const CAFE_THEMES = [
  { id: 'BLOOM_CAFE_THEME_SPRING', name: 'Spring Garden', emoji: '🌸', price: '£1.99' },
  { id: 'BLOOM_CAFE_THEME_AUTUMN', name: 'Autumn Harvest', emoji: '🍂', price: '£1.99' },
  { id: 'BLOOM_CAFE_THEME_NIGHT', name: 'Evening Service', emoji: '🌙', price: '£1.99' },
];

const ROWAN_OUTFITS = [
  { id: 'BLOOM_ROWAN_OUTFIT_APRON', name: 'Linen Apron', emoji: '👘', price: '£0.99' },
  { id: 'BLOOM_ROWAN_OUTFIT_CHEF', name: 'Chef Whites', emoji: '🧑‍🍳', price: '£0.99' },
  { id: 'BLOOM_ROWAN_OUTFIT_CASUAL', name: 'Day Off', emoji: '🧣', price: '£0.99' },
];

export function ShopScreen({ visible, onClose }: Props) {
  const hasRemovedAds = useGameStore((s) => s.hasRemovedAds);
  const setHasRemovedAds = useGameStore((s) => s.setHasRemovedAds);

  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [loadingOfferings, setLoadingOfferings] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Fetch offerings when shop opens
  useEffect(() => {
    if (!visible) return;
    setLoadingOfferings(true);
    fetchOfferings().then((o) => {
      setOfferings(o);
      setLoadingOfferings(false);
    });
  }, [visible]);

  // Find the remove-ads package in the current offering
  const removeAdsPackage: PurchasesPackage | null =
    offerings?.current?.availablePackages.find(
      (p) => p.product.identifier === 'BLOOM_REMOVE_ADS',
    ) ?? null;

  const removeAdsPrice = removeAdsPackage?.product.priceString ?? '£2.99';

  async function handleRemoveAds() {
    if (hasRemovedAds || purchasing) return;
    if (!removeAdsPackage) {
      setStatusMessage('Purchase unavailable — please try again later.');
      return;
    }
    setPurchasing(true);
    setStatusMessage(null);
    const result = await purchasePackage(removeAdsPackage);
    if (result.hasRemovedAds) {
      setHasRemovedAds(true);
      setStatusMessage('Ads removed — thank you! 🐰');
    } else if (result.success === false) {
      setStatusMessage(null); // user cancelled — no message needed
    }
    setPurchasing(false);
  }

  async function handleRestore() {
    if (restoring) return;
    setRestoring(true);
    setStatusMessage(null);
    const restored = await restorePurchases();
    if (restored) {
      setHasRemovedAds(true);
      setStatusMessage('Purchases restored. 🐰');
    } else {
      setStatusMessage('Nothing to restore.');
    }
    setRestoring(false);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#fdf6e9', '#f5e6cc']} style={styles.gradient}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🛍️ The Shop</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── Remove Ads ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Remove Ads</Text>
            <Text style={styles.sectionSubtitle}>
              One-time purchase. Removes all ads permanently.
              Always easy to find — we promise.
            </Text>
            {loadingOfferings ? (
              <ActivityIndicator style={styles.loader} color="#C87C5E" />
            ) : hasRemovedAds ? (
              <View style={[styles.productCard, styles.productOwned]}>
                <Text style={styles.productEmoji}>✅</Text>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>Ads Removed</Text>
                  <Text style={styles.productOwnedLabel}>Thank you 🐰</Text>
                </View>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.productCard, pressed && styles.productPressed]}
                onPress={handleRemoveAds}
                disabled={purchasing}
              >
                <Text style={styles.productEmoji}>🚫</Text>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>Remove All Ads</Text>
                  <Text style={styles.productDescription}>Permanent. One-time.</Text>
                </View>
                {purchasing ? (
                  <ActivityIndicator color="#C87C5E" />
                ) : (
                  <Text style={styles.price}>{removeAdsPrice}</Text>
                )}
              </Pressable>
            )}
          </View>

          {/* ── Café Themes ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Café Themes</Text>
            <Text style={styles.sectionSubtitle}>
              Cosmetic skins for The Fluffy Bunny. Pure decoration.
            </Text>
            {CAFE_THEMES.map((theme) => (
              <View key={theme.id} style={[styles.productCard, styles.productLocked]}>
                <Text style={styles.productEmoji}>{theme.emoji}</Text>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{theme.name}</Text>
                  <Text style={styles.comingSoon}>Coming soon</Text>
                </View>
                <Text style={styles.priceMuted}>{theme.price}</Text>
              </View>
            ))}
          </View>

          {/* ── Rowan Outfits ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rowan's Outfits</Text>
            <Text style={styles.sectionSubtitle}>
              Cosmetic only. Rowan looks great in all of them.
            </Text>
            {ROWAN_OUTFITS.map((outfit) => (
              <View key={outfit.id} style={[styles.productCard, styles.productLocked]}>
                <Text style={styles.productEmoji}>{outfit.emoji}</Text>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{outfit.name}</Text>
                  <Text style={styles.comingSoon}>Coming soon</Text>
                </View>
                <Text style={styles.priceMuted}>{outfit.price}</Text>
              </View>
            ))}
          </View>

          {/* ── Status message ── */}
          {statusMessage ? (
            <Text style={styles.statusMessage}>{statusMessage}</Text>
          ) : null}

          {/* ── Restore purchases ── */}
          <Pressable onPress={handleRestore} disabled={restoring} style={styles.restoreButton}>
            {restoring ? (
              <ActivityIndicator color="#B8977E" />
            ) : (
              <Text style={styles.restoreText}>Restore Purchases</Text>
            )}
          </Pressable>

          <Text style={styles.footer}>
            All purchases are cosmetic or convenience.{'\n'}
            No pay-to-progress. Ever.
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3D2B1F',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#7A6855',
    marginBottom: 14,
    lineHeight: 19,
  },
  loader: {
    marginVertical: 12,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#B8977E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  productPressed: {
    backgroundColor: '#F5E6CC',
  },
  productOwned: {
    borderWidth: 1.5,
    borderColor: '#7BC67E',
  },
  productLocked: {
    opacity: 0.65,
  },
  productEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D2B1F',
  },
  productDescription: {
    fontSize: 12,
    color: '#7A6855',
    marginTop: 2,
  },
  productOwnedLabel: {
    fontSize: 12,
    color: '#7BC67E',
    marginTop: 2,
    fontWeight: '600',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C87C5E',
  },
  priceMuted: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8977E',
  },
  comingSoon: {
    fontSize: 11,
    color: '#B8977E',
    marginTop: 2,
  },
  statusMessage: {
    textAlign: 'center',
    fontSize: 14,
    color: '#7A9E6B',
    marginBottom: 16,
    fontWeight: '500',
  },
  restoreButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  restoreText: {
    fontSize: 13,
    color: '#B8977E',
    textDecorationLine: 'underline',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#B8977E',
    lineHeight: 18,
  },
});
