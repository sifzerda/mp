// src/components/LibraryEmptyState.jsx

import { memo } from "react";
import { View, Text, ActivityIndicator,Pressable, StyleSheet } from "react-native";
import useMusicStore from "../store/useMusicStore";
import useThemedStyles from "../theme/useThemedStyles";

function LibraryEmptyState({
  message = "No results found.",
}) {
  const { colors, styles } = useThemedStyles(createStyles);
  const loading = useMusicStore((s) => s.loading);
  const error = useMusicStore((s) => s.error);
  const permissionGranted = useMusicStore((s) => s.permissionGranted);
  const loadSongs = useMusicStore((s) => s.loadSongs);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.message}>
          Scanning your music...
        </Text>
      </View>
    );
  }

  const permissionDenied = permissionGranted === false;

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        {permissionDenied
          ? "Music permission is required."
          : error || message}
      </Text>

      {(permissionDenied || error) && (
        <Pressable
          onPress={loadSongs}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export default memo(LibraryEmptyState);

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 25,
      gap: 15,
    },

    message: {
      color: colors.muted,
      fontSize: 15,
      textAlign: "center",
    },

    retryButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },

    retryText: {
      color: colors.onPrimary,
      fontWeight: "700",
    },
  });