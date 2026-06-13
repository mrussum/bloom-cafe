# Running Bloom locally

Bloom is a **managed Expo** app (React Native + TypeScript). You run it from
your own computer and view it on a phone or a simulator/emulator.

---

## 1. Install the prerequisites

| Tool | Notes |
|------|-------|
| **Node.js** (LTS — v20 or v22) | Includes `npm`. Get it from <https://nodejs.org> |
| **Git** | To clone the repo. <https://git-scm.com> |
| A code editor | VS Code recommended |

You do **not** need to install the Expo CLI globally — `npx expo …` works.

**To see the app, pick one:**
- **Your phone** — install **Expo Go** (iOS App Store / Google Play). Easiest.
- **iOS Simulator** — needs a **Mac + Xcode** (free, Mac App Store).
- **Android Emulator** — install **Android Studio** (Mac/Windows/Linux).

> On **Windows** there is no iOS Simulator — use a physical iPhone with
> Expo Go, or the Android emulator.

---

## 2. Get the code and start it

```bash
git clone https://github.com/mrussum/bloom-cafe.git
cd bloom-cafe
npm install
npx expo start
```

A dev server opens with a QR code. Then:

- **Phone:** scan the QR with **Expo Go** (Android) or the **Camera** app (iOS).
- **Simulator/emulator:** press `i` (iOS) or `a` (Android) in the terminal.

That's it — the café, merge grid, audio, story beats, recipe book, and
settings all run in **Expo Go**, no native build required.

---

## 3. What needs a development build (not Expo Go)

Two features rely on native code that Expo Go doesn't include. They are
**guarded to fail gracefully** — the game runs fine in Expo Go, these just
stay switched off:

- **In-app purchases** (`react-native-purchases` / RevenueCat) — the shop
  shows fallback prices and the purchase button reports "unavailable".
- **Audio** may be silent on the newest Expo Go SDK; it never crashes.

To get the **full** app (real IAP, reliable audio — and what you'll need for
store submission), make a **development build**:

```bash
npx expo install expo-dev-client
npm install -g eas-cli       # one-time
eas login                    # create a free Expo account if needed
eas build --profile development --platform ios     # or: android
```

EAS builds in the cloud (no Xcode/Android Studio needed). Install the
resulting build on your device, then run:

```bash
npx expo start --dev-client
```

---

## 4. Optional — cloud saves (Supabase)

Cloud save is optional; without it the game saves locally and plays fine.
To enable it, create a `.env` in the project root (it is **gitignored** —
never commit it):

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

For in-app purchases (dev build only), add when you have them:

```
EXPO_PUBLIC_REVENUECAT_KEY_IOS=...
EXPO_PUBLIC_REVENUECAT_KEY_ANDROID=...
```

---

## 5. Handy commands

```bash
npx expo start            # start the dev server
npx expo start -c         # start and clear the Metro cache (fixes odd errors)
npx tsc --noEmit          # type-check the whole project (should be 0 errors)
python3 scripts/gen_audio.py   # regenerate the placeholder sound effects
```

## Troubleshooting

- **Metro/cache weirdness:** `npx expo start -c`.
- **Phone can't connect:** put the phone and computer on the same Wi-Fi, or
  run `npx expo start --tunnel`.
- **`npm install` fails:** make sure you're on Node 20 or 22 (`node -v`).
