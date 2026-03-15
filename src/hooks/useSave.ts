// src/hooks/useSave.ts
// Bloom — The Fluffy Bunny Café
// Auto-saves every 60s and on AppState 'background'.
// Skips cloud entirely when userId is null.

import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useGameStore } from '../game/gameState';
import { cloudSave } from '../services/supabase';
import type { SaveData } from '../services/supabase';

const AUTOSAVE_INTERVAL_MS = 60_000;

export function useSave(userId: string | null) {
  // Ref always holds the latest persisted state.
  // Using a ref (not state) means save() never needs to be re-created
  // just because the game state changed.
  const stateRef = useRef<SaveData>({
    grid: useGameStore.getState().grid,
    xp: useGameStore.getState().xp,
    level: useGameStore.getState().level,
    cafeLevel: useGameStore.getState().cafeLevel,
    discoveredRecipes: useGameStore.getState().discoveredRecipes,
  });

  // Keep ref in sync with the store
  useEffect(() => {
    return useGameStore.subscribe((s) => {
      stateRef.current = {
        grid: s.grid,
        xp: s.xp,
        level: s.level,
        cafeLevel: s.cafeLevel,
        discoveredRecipes: s.discoveredRecipes,
      };
    });
  }, []);

  const save = useCallback(() => {
    if (!userId) return;
    // Fire and forget — cloudSave never throws
    void cloudSave(userId, stateRef.current);
  }, [userId]);

  // Auto-save every 60 seconds
  useEffect(() => {
    const id = setInterval(save, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [save]);

  // Save when app moves to background (user switches away / locks phone)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') save();
    });
    return () => sub.remove();
  }, [save]);
}
