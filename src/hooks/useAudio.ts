// src/hooks/useAudio.ts
// Bloom — The Fluffy Bunny Café
// Bridges store audio prefs → the audio service, and owns the ambient
// loop's lifecycle (start on mount, pause when the app backgrounds).

import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useGameStore } from '../game/gameState';
import {
  initAudio,
  setMusicEnabled,
  setSfxEnabled,
  startAmbient,
  stopAmbient,
} from '../services/audio';

export function useAudio() {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const musicEnabled = useGameStore((s) => s.musicEnabled);

  // Preload + configure the audio session once, then push current prefs
  // (ordering matters so the ambient loop starts after the session is set).
  useEffect(() => {
    initAudio().then(() => {
      const { soundEnabled: sfx, musicEnabled: music } = useGameStore.getState();
      setSfxEnabled(sfx);
      setMusicEnabled(music);
    });
    return () => {
      void stopAmbient();
    };
  }, []);

  // Mirror toggle changes into the service.
  useEffect(() => {
    setSfxEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    setMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  // Pause ambient in the background; resume on return if music is on.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        if (useGameStore.getState().musicEnabled) void startAmbient();
      } else {
        void stopAmbient();
      }
    });
    return () => sub.remove();
  }, []);
}
