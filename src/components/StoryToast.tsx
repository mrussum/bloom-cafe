// src/components/StoryToast.tsx
// Bloom — The Fluffy Bunny Café
// Slides up from bottom when a recipe triggers a story beat.
// Brigadier: no speaker label, all text italic (action-only).

import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useGameStore } from '../game/gameState';
import { DIALOGUE_BEATS } from '../game/npcs';
import type { DialogueBeat } from '../game/types';

const CHARACTER_NAMES: Record<string, string> = {
  rowan: 'Rowan',
  linda: 'Linda',
  alo: 'Alo',
  trixie: 'Trixie',
  // brigadier intentionally absent — no speaker label
};

const CHARACTER_COLORS: Record<string, string> = {
  rowan: '#5B8DB8',
  linda: '#C87C5E',
  alo: '#7A9E6B',
  trixie: '#C87CC8',
};

export function StoryToast() {
  const pendingStoryTrigger = useGameStore((s) => s.pendingStoryTrigger);
  const clearStoryTrigger = useGameStore((s) => s.clearStoryTrigger);

  const [activeBeat, setActiveBeat] = useState<DialogueBeat | null>(null);
  const [lineIndex, setLineIndex] = useState(0);

  // Always mounted — starts off-screen and invisible
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  function slideIn() {
    translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
    opacity.value = withTiming(1, { duration: 180 });
  }

  function slideOut(onDone: () => void) {
    translateY.value = withTiming(300, { duration: 260 });
    opacity.value = withTiming(0, { duration: 260 }, (finished) => {
      if (finished) runOnJS(onDone)();
    });
  }

  useEffect(() => {
    if (!pendingStoryTrigger) return;
    const beat = DIALOGUE_BEATS.find((b) => b.id === pendingStoryTrigger);
    if (!beat) return;
    setActiveBeat(beat);
    setLineIndex(0);
    slideIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingStoryTrigger]);

  function handleTap() {
    if (!activeBeat) return;
    const isLast = lineIndex >= activeBeat.lines.length - 1;
    if (isLast) {
      slideOut(() => {
        setActiveBeat(null);
        clearStoryTrigger();
      });
    } else {
      setLineIndex((i) => i + 1);
    }
  }

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const line = activeBeat?.lines[lineIndex];
  const isBrigadier = line?.speaker === 'brigadier';
  const isLast = !activeBeat || lineIndex >= activeBeat.lines.length - 1;
  const speakerName = line ? CHARACTER_NAMES[line.speaker] : undefined;
  const speakerColor = line ? (CHARACTER_COLORS[line.speaker] ?? '#3D2B1F') : '#3D2B1F';

  return (
    <Animated.View
      style={[styles.toast, animStyle]}
      pointerEvents={activeBeat ? 'auto' : 'none'}
    >
      <Pressable onPress={handleTap} style={styles.inner}>
        {/* Speaker — hidden for Brigadier */}
        {!isBrigadier && speakerName ? (
          <Text style={[styles.speaker, { color: speakerColor }]}>{speakerName}</Text>
        ) : null}

        {/* Dialogue line */}
        {line ? (
          <Text style={[styles.text, (line.isAction || isBrigadier) && styles.action]}>
            {line.text}
          </Text>
        ) : null}

        {/* Navigation hint */}
        <Text style={styles.hint}>{isLast ? 'Tap to close' : 'Tap to continue'}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    backgroundColor: '#FFF8F0',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 12,
  },
  inner: {
    padding: 22,
  },
  speaker: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  text: {
    fontSize: 17,
    color: '#3D2B1F',
    lineHeight: 26,
  },
  action: {
    fontStyle: 'italic',
    color: '#7A6855',
  },
  hint: {
    marginTop: 14,
    fontSize: 11,
    color: '#B8977E',
    textAlign: 'right',
  },
});
