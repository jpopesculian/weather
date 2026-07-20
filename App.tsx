import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { fontModules, ThemeProvider, useTheme } from './src/theme';
import { WeatherScreen } from './src/screens/WeatherScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

function ThemedRoot({ onLayout }: { onLayout: () => void }) {
  const { scheme } = useTheme();
  return (
    <View style={styles.flex} onLayout={onLayout}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <WeatherScreen />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts(fontModules);

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedRoot onLayout={onLayoutRootView} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
