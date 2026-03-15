// App.tsx — Session 2 test harness
// Renders MergeGrid on a cream background

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { MergeGrid } from './src/components/MergeGrid';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.bg}>
        <MergeGrid />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bg: {
    flex: 1,
    backgroundColor: '#fdf6e9',
    justifyContent: 'center',
  },
});
