// src/components/SettingsModal.tsx
// Bloom — The Fluffy Bunny Café
// Small settings surface — sound + music toggles. Ethical by default:
// everything is on, and turning it off is one clear tap away.

import React from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../game/gameState';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: Props) {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const musicEnabled = useGameStore((s) => s.musicEnabled);
  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled);
  const setMusicEnabled = useGameStore((s) => s.setMusicEnabled);
  const setHasOnboarded = useGameStore((s) => s.setHasOnboarded);

  function replayIntro() {
    setHasOnboarded(false);
    onClose(); // closing reveals the onboarding overlay again
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#fdf6e9', '#f5e6cc']} style={styles.gradient}>

        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Settings</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Sound effects</Text>
              <Text style={styles.rowSub}>Merges, spawns, and little chimes.</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#D9C9B0', true: '#7A9E6B' }}
              thumbColor="#FFF8F0"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Ambient music</Text>
              <Text style={styles.rowSub}>A warm café hum under the play.</Text>
            </View>
            <Switch
              value={musicEnabled}
              onValueChange={setMusicEnabled}
              trackColor={{ false: '#D9C9B0', true: '#7A9E6B' }}
              thumbColor="#FFF8F0"
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.actionRow, pressed && styles.actionPressed]}
            onPress={replayIntro}
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Replay intro</Text>
              <Text style={styles.rowSub}>Watch the welcome again.</Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </Pressable>

          <Text style={styles.footer}>
            The Fluffy Bunny sounds best with the volume up — but it's your café. 🐰
          </Text>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E8D5B7',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3D2B1F',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8D5B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: '#7A6855',
    fontWeight: '600',
  },
  content: {
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#B8977E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D2B1F',
  },
  rowSub: {
    fontSize: 12,
    color: '#7A6855',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#B8977E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  actionPressed: {
    backgroundColor: '#F5E6CC',
  },
  actionChevron: {
    fontSize: 20,
    color: '#C87C5E',
    fontWeight: '700',
    marginLeft: 8,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#B8977E',
    lineHeight: 18,
    marginTop: 12,
  },
});
