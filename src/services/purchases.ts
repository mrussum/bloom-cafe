// src/services/purchases.ts
// Bloom — The Fluffy Bunny Café
// RevenueCat wrapper — all functions fire-and-forget safe, never throw.
//
// ─── RevenueCat dashboard setup ──────────────────────────────────────────────
// 1. Create entitlement:  "remove_ads"
// 2. Create products:     BLOOM_REMOVE_ADS (£2.99 non-consumable)
//                         BLOOM_CAFE_THEME_* (£1.99 non-consumable)
//                         BLOOM_ROWAN_OUTFIT_* (£0.99 non-consumable)
// 3. Create offering:     "default"  →  add BLOOM_REMOVE_ADS package
// 4. Attach products to entitlement "remove_ads"
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import type { PurchasesPackage } from 'react-native-purchases';

const REVENUECAT_KEY =
  Platform.OS === 'ios'
    ? (process.env.EXPO_PUBLIC_REVENUECAT_KEY_IOS ?? '')
    : (process.env.EXPO_PUBLIC_REVENUECAT_KEY_ANDROID ?? '');

// True only after a successful configure(). Stays false in Expo Go (where the
// RevenueCat native module is absent) or when no API key is set — so the rest
// of the IAP layer no-ops cleanly instead of crashing the app on launch.
let purchasesAvailable = false;

// ─── Initialise once on app start ────────────────────────────────────────────

export function initPurchases() {
  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
    Purchases.configure({ apiKey: REVENUECAT_KEY });
    purchasesAvailable = true;
  } catch (err) {
    purchasesAvailable = false;
    // Expected in Expo Go / without a dev build — IAP simply stays off.
    console.warn('[bloom] RevenueCat unavailable — in-app purchases disabled:', err);
  }
}

// ─── Check entitlements ───────────────────────────────────────────────────────

export async function checkRemoveAds(): Promise<boolean> {
  if (!purchasesAvailable) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return !!info.entitlements.active['remove_ads'];
  } catch {
    return false;
  }
}

// ─── Fetch current offering ───────────────────────────────────────────────────

export async function fetchOfferings() {
  if (!purchasesAvailable) return null;
  try {
    return await Purchases.getOfferings();
  } catch {
    return null;
  }
}

// ─── Purchase a package ───────────────────────────────────────────────────────

export interface PurchaseResult {
  success: boolean;
  hasRemovedAds: boolean;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  if (!purchasesAvailable) return { success: false, hasRemovedAds: false };
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return {
      success: true,
      hasRemovedAds: !!customerInfo.entitlements.active['remove_ads'],
    };
  } catch (err: unknown) {
    // User cancellation is not an error
    if (
      typeof err === 'object' &&
      err !== null &&
      'userCancelled' in err &&
      (err as { userCancelled: boolean }).userCancelled
    ) {
      return { success: false, hasRemovedAds: false };
    }
    console.warn('[bloom] purchasePackage failed silently:', err);
    return { success: false, hasRemovedAds: false };
  }
}

// ─── Restore purchases ────────────────────────────────────────────────────────

export async function restorePurchases(): Promise<boolean> {
  if (!purchasesAvailable) return false;
  try {
    const info = await Purchases.restorePurchases();
    return !!info.entitlements.active['remove_ads'];
  } catch {
    return false;
  }
}
