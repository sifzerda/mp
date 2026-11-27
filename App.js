// App.js

import { useEffect, useState } from "react";

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  AppState,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import RootNavigator from "./src/navigation/RootNavigator";
import useThemedStyles from "./src/theme/useThemedStyles";

import { initializePlayer } from "./src/services/audioService";

import useExternalAudio from "./src/hooks/useExternalAudio";
import ExternalAudioModal from "./src/components/ExternalAudioModal";

export default function App() {
  const { colors, styles } = useThemedStyles(createStyles);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const externalAudio = useExternalAudio(ready);

  useEffect(() => {
    let mounted = true;
    let initializing = false;
    let initialized = false;

    async function setup() {
      if (
        !mounted ||
        initializing ||
        initialized ||
        AppState.currentState !== "active"
      ) {
        return;
      }

      initializing = true;

      try {
        await initializePlayer();

        initialized = true;

        if (mounted) {
          setError(null);
          setReady(true);
        }
      } catch (error) {
        if (mounted) {
          setError(
            error?.message || "Unable to initialize audio player"
          );
        }
      } finally {
        initializing = false;
      }
    }

    const subscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          void setup();
        }
      }
    );

    void setup();

    return () => {
      mounted = false;
      subscription.remove();
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
              <Text style={styles.error}>
                {error}
              </Text>
            </View>
          ) : !ready ? (
            <View style={styles.center}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />

              <Text style={styles.loading}>
                Initializing audio player...
              </Text>
            </View>
          ) : (
            <>
              <RootNavigator />

              <ExternalAudioModal
                {...externalAudio}
              />
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