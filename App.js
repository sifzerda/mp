// App.js

import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import LibraryScreen from "./src/screens/LibraryScreen";
import NowPlayingScreen from "./src/screens/NowPlayingScreen";
import MiniPlayer from "./src/components/MiniPlayer";
import usePlayerStore from "./src/store/usePlayerStore";
import { initializePlayer } from "./src/services/audioService";
import SettingsScreen from "./src/screens/SettingsScreen";
import useThemedStyles from "./src/theme/useThemedStyles";
import { StatusBar } from "react-native";

export default function App() {
  const { colors, styles } = useThemedStyles(createStyles);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const showNowPlaying = usePlayerStore((s) => s.showNowPlaying);
  const showSettings = usePlayerStore((s) => s.showSettings);
  const closeSettings = usePlayerStore((s) => s.closeSettings);

  useEffect(() => {
    let mounted = true;

    initializePlayer()
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

   return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle={
              colors.isDark
                ? "light-content"
                : "dark-content"
            }
          />

          {error ? (
            <View style={styles.center}>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : !ready ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} />

              <Text style={styles.loading}>
                Initializing audio player...
              </Text>
            </View>
          ) : showSettings ? (
            <SettingsScreen onBack={closeSettings} />
          ) : showNowPlaying ? (
            <NowPlayingScreen />
          ) : (
            <>
              <View style={styles.library}>
                <LibraryScreen />
              </View>

              <MiniPlayer />
            </>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    library: {
      flex: 1,
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    loading: {
      color: colors.text,
      marginTop: 12,
    },

    error: {
      color: colors.danger,
      padding: 24,
      textAlign: "center",
    },
  });