// App.js

import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RootNavigator from "./src/navigation/RootNavigator";
import useThemedStyles from "./src/theme/useThemedStyles";
import { initializePlayer } from "./src/services/audioService";
import { StatusBar } from "react-native";

export default function App() {
  const { colors, styles } = useThemedStyles(createStyles);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

    useEffect(() => {
    let mounted = true;

    initializePlayer()
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((error) => {
        if (mounted) setError(error.message);
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
            <RootNavigator />
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