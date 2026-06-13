// src/services/audio.ts
// Bloom — The Fluffy Bunny Café
// Thin wrapper over expo-av: preloaded one-shot SFX + a looping ambient pad.
// Pure playback service — knows nothing about game state. Components/hooks
// decide *when* to play; this module only owns the Sound objects and prefs.
// Every call degrades gracefully (silent on failure) so audio never blocks play.

import { Audio } from 'expo-av';

export type SfxName = 'merge' | 'spawn' | 'levelup' | 'sparkle';

const SFX_SOURCES: Record<SfxName, number> = {
  merge: require('../assets/sounds/merge.wav'),
  spawn: require('../assets/sounds/spawn.wav'),
  levelup: require('../assets/sounds/levelup.wav'),
  sparkle: require('../assets/sounds/sparkle.wav'),
};

const AMBIENT_SOURCE = require('../assets/sounds/ambient.wav');
const AMBIENT_VOLUME = 0.6;

const sfx: Partial<Record<SfxName, Audio.Sound>> = {};
let ambient: Audio.Sound | null = null;

let ready = false;
let initing: Promise<void> | null = null;
let sfxEnabled = true;
let musicEnabled = true;

/** Preload SFX + configure the audio session. Safe to call more than once. */
export async function initAudio(): Promise<void> {
  if (ready) return;
  if (initing) return initing;
  initing = (async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      await Promise.all(
        (Object.keys(SFX_SOURCES) as SfxName[]).map(async (name) => {
          const { sound } = await Audio.Sound.createAsync(SFX_SOURCES[name], {
            volume: 1.0,
          });
          sfx[name] = sound;
        }),
      );
      ready = true;
    } catch (err) {
      console.warn('[bloom] audio init failed silently:', err);
    }
  })();
  return initing;
}

/** Play a one-shot SFX from the start. No-op when SFX are muted or not ready. */
export async function playSfx(name: SfxName): Promise<void> {
  if (!sfxEnabled || !ready) return;
  const sound = sfx[name];
  if (!sound) return;
  try {
    await sound.replayAsync();
  } catch {
    // a dropped SFX is never worth surfacing
  }
}

/** Start (or resume) the looping ambient pad. No-op when music is muted. */
export async function startAmbient(): Promise<void> {
  if (!musicEnabled) return;
  try {
    if (!ambient) {
      const { sound } = await Audio.Sound.createAsync(AMBIENT_SOURCE, {
        isLooping: true,
        volume: AMBIENT_VOLUME,
      });
      ambient = sound;
    }
    await ambient.playAsync();
  } catch (err) {
    console.warn('[bloom] ambient failed silently:', err);
  }
}

export async function stopAmbient(): Promise<void> {
  try {
    await ambient?.pauseAsync();
  } catch {
    // ignore
  }
}

export function setSfxEnabled(enabled: boolean): void {
  sfxEnabled = enabled;
}

/** Toggle music; starts/stops the ambient loop to match. */
export function setMusicEnabled(enabled: boolean): void {
  musicEnabled = enabled;
  if (enabled) {
    void startAmbient();
  } else {
    void stopAmbient();
  }
}

/** Tear everything down (e.g. on app teardown). */
export async function unloadAudio(): Promise<void> {
  try {
    await Promise.all(Object.values(sfx).map((s) => s?.unloadAsync()));
    await ambient?.unloadAsync();
  } catch {
    // ignore
  } finally {
    ambient = null;
    ready = false;
    initing = null;
  }
}
