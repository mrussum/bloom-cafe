// App.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { CafeScreen } from './src/screens/CafeScreen';

export default function App() {
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
