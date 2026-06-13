// src/components/MergeGrid.tsx
// Bloom — The Fluffy Bunny Café
// 5×4 merge grid — handles drop events, haptics, and grid layout

import React, { useCallback, useRef } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSharedValue } from 'react-native-reanimated';
import { useGameStore } from '../game/gameState';
import { playSfx } from '../services/audio';
import { MergeCell } from './MergeCell';

const COLS = 4;
const ROWS = 5;

export function MergeGrid() {
  const grid = useGameStore((s) => s.grid);
  const mergeItems = useGameStore((s) => s.mergeItems);

  const gridRef = useRef<View>(null);
  const gridPageX = useSharedValue(0);
  const gridPageY = useSharedValue(0);

  const { width } = useWindowDimensions();
  // 20px padding each side as per spec
  const gridWidth = Math.min(width - 40, 380);
  const cellSize = gridWidth / COLS;

  function handleLayout() {
    gridRef.current?.measure((_x, _y, _w, _h, pageX, pageY) => {
      gridPageX.value = pageX;
      gridPageY.value = pageY;
    });
  }

  const handleDrop = useCallback(
    (fromPos: [number, number], toPos: [number, number]) => {
      const [toRow, toCol] = toPos;
      if (toRow < 0 || toRow >= ROWS || toCol < 0 || toCol >= COLS) return;
      if (fromPos[0] === toPos[0] && fromPos[1] === toPos[1]) return;

      const success = mergeItems(fromPos, toPos);
      if (success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        void playSfx('merge');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    },
    [mergeItems],
  );

  return (
    <View
      ref={gridRef}
      style={[styles.grid, { width: gridWidth }]}
      onLayout={handleLayout}
    >
      {Array.from({ length: ROWS }, (_, r) => (
        <View key={r} style={styles.row}>
          {Array.from({ length: COLS }, (_, c) => (
            <MergeCell
              key={`${r}-${c}`}
              item={grid[r][c]}
              row={r}
              col={c}
              cellSize={cellSize}
              gridPageX={gridPageX}
              gridPageY={gridPageY}
              onDrop={handleDrop}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
