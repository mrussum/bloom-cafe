// App.tsx
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { CafeScreen } from './src/screens/CafeScreen';
import { initPurchases } from './src/services/purchases';

export default function App() {
  useEffect(() => {
    // Initialise RevenueCat once on app start — before any purchase calls
    initPurchases();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <CafeScreen />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
