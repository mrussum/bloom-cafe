// src/components/OnboardingOverlay.tsx
// Bloom — The Fluffy Bunny Café
// Gentle first-run intro: three warm cards that teach the merge mechanic.
// Always skippable, never naggy — shows once, then never again.

import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { playSfx } from '../services/audio';

interface Props {
  onDone: () => void;
}

interface Step {
  visual: string;
  big?: boolean; // render the visual larger (for the merge demo)
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    visual: '🐰',
    title: 'Welcome to The Fluffy Bunny',
    body: "Your mum Linda ran this café for twenty years. You've come home to open it back up — one bake at a time.",
  },
  {
    visual: '🌿  ➕  🌿  →  🫙',
    big: true,
    title: 'Merging is everything',
    body: 'Drag two of the same ingredient together to combine them into something new.',
  },
  {
    visual: '🧺',
    title: 'Stock the pantry',
    body: 'Tap the pantry to add ingredients. Your best friend Trixie keeps finding you more as you go.',
  },
];

export function OnboardingOverlay({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  const scrim = useSharedValue(0);
  const cardScale = useSharedValue(0.7);
  const content = useSharedValue(0);

  // Entrance
  useEffect(() => {
    scrim.value = withTiming(1, { duration: 240 });
    cardScale.value = withSpring(1, { damping: 13, stiffness: 170 });
    content.value = withTiming(1, { duration: 260 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fade the content when the step changes
  useEffect(() => {
    content.value = 0;
    content.value = withTiming(1, { duration: 260 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function finish() {
    void playSfx('sparkle');
    scrim.value = withTiming(0, { duration: 260 });
    cardScale.value = withTiming(0.85, { duration: 260 });
    content.value = withTiming(0, { duration: 260 }, (done) => {
      if (done) runOnJS(onDone)();
    });
  }

  function next() {
    if (isLast) finish();
    else setStep((s) => s + 1);
  }

  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: content.value }));

  const current = STEPS[step];

  return (
    <Animated.View style={[styles.root, scrimStyle]} pointerEvents="auto">
      <Animated.View style={[styles.card, cardStyle]}>
        <Animated.View style={[styles.body, contentStyle]}>
          <Text style={current.big ? styles.visualBig : styles.visual}>{current.visual}</Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.text}>{current.body}</Text>
        </Animated.View>

        {/* Step dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <Pressable style={({ pressed }) => [styles.nextButton, pressed && styles.nextPressed]} onPress={next}>
          <Text style={styles.nextText}>{isLast ? "Let's open up 🐰" : 'Next'}</Text>
        </Pressable>

        {!isLast ? (
          <Pressable onPress={finish} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45, 59, 45, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF8F0',
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 22,
    paddingHorizontal: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 16,
  },
  body: {
    alignItems: 'center',
    minHeight: 188,
  },
  visual: {
    fontSize: 52,
    marginBottom: 18,
  },
  visualBig: {
    fontSize: 30,
    marginBottom: 18,
    marginTop: 10,
    letterSpacing: 1,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#3D2B1F',
    textAlign: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 15,
    color: '#7A6855',
    textAlign: 'center',
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
    marginBottom: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0CDB4',
  },
  dotActive: {
    backgroundColor: '#C87C5E',
    width: 20,
  },
  nextButton: {
    alignSelf: 'stretch',
    backgroundColor: '#2D3B2D',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextPressed: {
    backgroundColor: '#3D5C3D',
  },
  nextText: {
    color: '#F5F0E8',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  skipButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 13,
    color: '#B8977E',
    textDecorationLine: 'underline',
  },
});
