// src/components/LevelUpOverlay.tsx
// Bloom — The Fluffy Bunny Café
// A warm full-screen "Level Up!" moment: a card springs in over a soft scrim,
// a little confetti drifts down, the chime plays. Auto-dismisses; tap to skip.

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { playSfx } from '../services/audio';

interface Props {
  level: number | null;
  onDone: () => void;
}

const HOLD_MS = 2300;
const CONFETTI = ['🥐', '🍋', '🌿', '🍰', '🫐', '🧁', '💜', '🐰'];

const MESSAGES = [
  "The Fluffy Bunny's getting busier.",
  'Linda would be proud — not that she’d say so.',
  'Word’s getting round The Croft.',
  'Another regular through the door.',
];

function ConfettiPiece({
  emoji,
  index,
  active,
  width,
  height,
}: {
  emoji: string;
  index: number;
  active: boolean;
  width: number;
  height: number;
}) {
  const y = useSharedValue(-50);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    const delay = index * 70;
    y.value = -50;
    opacity.value = 0;
    rotate.value = 0;
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    y.value = withDelay(delay, withTiming(height + 60, { duration: 1900 }));
    rotate.value = withDelay(delay, withTiming(index % 2 === 0 ? 360 : -360, { duration: 1900 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  const left = 16 + ((index + 0.5) / CONFETTI.length) * (width - 32);
  return (
    <Animated.Text style={[styles.confetti, { left }, style]}>{emoji}</Animated.Text>
  );
}

export function LevelUpOverlay({ level, onDone }: Props) {
  const { width, height } = useWindowDimensions();
  const active = level !== null;

  const scrim = useSharedValue(0);
  const cardScale = useSharedValue(0.6);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (level === null) return;
    void playSfx('levelup');
    scrim.value = withTiming(1, { duration: 200 });
    cardOpacity.value = withTiming(1, { duration: 200 });
    cardScale.value = withSpring(1, { damping: 12, stiffness: 180 });

    const t = setTimeout(() => {
      scrim.value = withTiming(0, { duration: 280 });
      cardScale.value = withTiming(0.85, { duration: 280 });
      cardOpacity.value = withTiming(0, { duration: 280 }, (finished) => {
        if (finished) runOnJS(onDone)();
      });
    }, HOLD_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  function dismiss() {
    scrim.value = withTiming(0, { duration: 200 });
    cardScale.value = withTiming(0.85, { duration: 200 });
    cardOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) runOnJS(onDone)();
    });
  }

  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  // The message is keyed to the level so it stays stable while shown.
  const message = level !== null ? MESSAGES[level % MESSAGES.length] : '';

  return (
    <Animated.View
      style={[styles.root, scrimStyle]}
      pointerEvents={active ? 'auto' : 'none'}
    >
      {CONFETTI.map((emoji, i) => (
        <ConfettiPiece
          key={i}
          emoji={emoji}
          index={i}
          active={active}
          width={width}
          height={height}
        />
      ))}

      <Pressable style={styles.fill} onPress={dismiss}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={styles.spark}>🎉</Text>
          <Text style={styles.levelText}>Level {level ?? ''}</Text>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.hint}>tap to continue</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45, 59, 45, 0.55)',
    zIndex: 50,
  },
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    fontSize: 26,
  },
  card: {
    backgroundColor: '#FFF8F0',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 36,
    alignItems: 'center',
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 14,
  },
  spark: { fontSize: 44, marginBottom: 6 },
  levelText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3D2B1F',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    color: '#7A6855',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  hint: {
    fontSize: 11,
    color: '#B8977E',
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
