// src/services/ads.ts
// Bloom — The Fluffy Bunny Café
// Ethical ad triggers. Ads appear ONLY at the two moments the design allows:
// level-up and shop-open. Never during play, never on a timer.
//
// No ad SDK is wired yet (react-native-google-mobile-ads will slot in here).
// Until then this is a graceful placeholder: it enforces the rules — respects
// the remove-ads entitlement and the allowed surfaces — and no-ops otherwise.
// When the SDK lands, replace the body of showInterstitial() with the real
// interstitial load/show; the call sites and guarantees stay identical.

export type AdSurface = 'levelup' | 'shop_open';

const ALLOWED: AdSurface[] = ['levelup', 'shop_open'];

interface ShowAdOptions {
  surface: AdSurface;
  hasRemovedAds: boolean;
}

/**
 * Request an interstitial for an allowed surface.
 * Returns true if an ad would have been shown (useful for tests/analytics),
 * false when suppressed (ads removed, or a disallowed surface).
 */
export async function showInterstitial({ surface, hasRemovedAds }: ShowAdOptions): Promise<boolean> {
  if (hasRemovedAds) return false; // purchase respected — always
  if (!ALLOWED.includes(surface)) {
    console.warn(`[bloom] ad blocked — "${surface}" is not an allowed ad surface`);
    return false;
  }
  // TODO(ads): load + show a real interstitial here once the SDK is added.
  if (__DEV__) console.log(`[bloom] (placeholder) interstitial would show on: ${surface}`);
  return true;
}
