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

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const showNowPlaying = usePlayerStore((state) => state.showNowPlaying);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          {error ? (
            <View style={styles.center}>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : !ready ? (
            <View style={styles.center}>
              <ActivityIndicator color="#00d9ff" />

              <Text style={styles.loading}>
                Initializing audio player...
              </Text>
            </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08121f",
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
    color: "#ffffff",
    marginTop: 12,
  },
  error: {
    color: "#ff6b6b",
    padding: 24,
    textAlign: "center",
  },
});
