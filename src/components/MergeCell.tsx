// src/components/MergeCell.tsx
// Bloom — The Fluffy Bunny Café
// Single grid cell with drag-to-merge gesture

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { GridItem } from '../game/types';

const ROWS = 5;
const COLS = 4;

const TIER_COLORS: Record<number, string> = {
  1: '#7BC67E',
  2: '#4ECDC4',
  3: '#FFD166',
  4: '#FF8C42',
  5: '#C177E0',
  6: '#FFD700',
};

interface Props {
  item: GridItem | null;
  row: number;
  col: number;
  cellSize: number;
  gridPageX: SharedValue<number>;
  gridPageY: SharedValue<number>;
  onDrop: (fromPos: [number, number], toPos: [number, number]) => void;
}

export function MergeCell({
  item,
  row,
  col,
  cellSize,
  gridPageX,
  gridPageY,
  onDrop,
}: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isLifted = useSharedValue(false);

  // Pop animation when a new item lands in this cell
  useEffect(() => {
    if (item?.isNew) {
      scale.value = withSequence(withSpring(1.22), withSpring(1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  const gesture = Gesture.Pan()
    .enabled(item !== null)
    .onStart(() => {
      scale.value = withSpring(1.12);
      isLifted.value = true;
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const dropCol = Math.round((e.absoluteX - gridPageX.value) / cellSize - 0.5);
      const dropRow = Math.round((e.absoluteY - gridPageY.value) / cellSize - 0.5);
      const clampedCol = Math.max(0, Math.min(COLS - 1, dropCol));
      const clampedRow = Math.max(0, Math.min(ROWS - 1, dropRow));
      runOnJS(onDrop)([row, col], [clampedRow, clampedCol]);
    })
    .onFinalize(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      isLifted.value = false;
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: isLifted.value ? 20 : 0,
    shadowOpacity: isLifted.value ? 0.28 : 0.12,
    elevation: isLifted.value ? 10 : 2,
  }));

  const size = cellSize - 8;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cell, { width: size, height: size }, animStyle]}>
        {item ? (
          <>
            <Text style={[styles.emoji, { fontSize: size * 0.4 }]}>{item.emoji}</Text>
            <View
              style={[
                styles.tierBadge,
                { backgroundColor: TIER_COLORS[item.tier] ?? '#ccc' },
              ]}
            >
              <Text style={styles.tierText}>{item.tier}</Text>
            </View>
          </>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cell: {
    margin: 4,
    borderRadius: 14,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B8977E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: {
    textAlign: 'center',
  },
  tierBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
});
