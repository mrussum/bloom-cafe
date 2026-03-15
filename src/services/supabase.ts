// src/services/supabase.ts
// Bloom — The Fluffy Bunny Café
// Supabase client + fire-and-forget cloud save/load. Never throws.
//
// ─── Run this SQL once in your Supabase dashboard (SQL Editor) ───────────────
//
// CREATE TABLE game_saves (
//   user_id  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
//   save_data JSONB NOT NULL,
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;
//
// CREATE POLICY "owner access" ON game_saves
//   USING  (auth.uid() = user_id)
//   WITH CHECK (auth.uid() = user_id);
//
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Grid } from '../game/types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// AsyncStorage satisfies SupportedStorage — cast needed due to Promise vs sync mismatch in types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Save data shape ──────────────────────────────────────────────────────────

export interface SaveData {
  grid: Grid;
  xp: number;
  level: number;
  cafeLevel: number;
  discoveredRecipes: string[];
}

// ─── cloudSave — fire and forget, never throws ───────────────────────────────

export async function cloudSave(userId: string, data: SaveData): Promise<void> {
  try {
    await supabase.from('game_saves').upsert({
      user_id: userId,
      save_data: data,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[bloom] cloudSave failed silently:', err);
  }
}

// ─── cloudLoad — returns null on any failure ─────────────────────────────────

export async function cloudLoad(userId: string): Promise<SaveData | null> {
  try {
    const { data, error } = await supabase
      .from('game_saves')
      .select('save_data')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return data.save_data as SaveData;
  } catch {
    return null;
  }
}
