// src/components/PlaybackSpeed.jsx

import { useState } from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";

import usePlaybackStore from "../store/usePlaybackStore";
import useThemedStyles from "../theme/useThemedStyles";

import { setPlaybackSpeed } from "../services/audioService";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function PlaybackSpeed() {
  const { styles } = useThemedStyles(createStyles);

  const speed = usePlaybackStore((s) => s.speed);
  const [busy, setBusy] = useState(false);

  const changeSpeed = async (value) => {
    if (busy || value === speed) return;

    setBusy(true);

    try {
      await setPlaybackSpeed(value);
    } catch (error) {
      Alert.alert(
        "Playback speed error",
        error?.message || "Unable to change speed."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Playback Speed</Text>

      <View style={styles.options}>
        {SPEEDS.map((value) => {
          const selected = speed === value;

          return (
            <Pressable
              key={value}
              onPress={() => changeSpeed(value)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: busy }}
              style={[
                styles.option,
                selected && styles.selected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selected && styles.selectedText,
                ]}
              >
                {value}×
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      marginTop: 18,
    },

    label: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 12,
    },

    options: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 6,
    },

    option: {
      flex: 1,
      maxWidth: 72,
      alignItems: "center",
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    selected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    optionText: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: "700",
    },

    selectedText: {
      color: colors.onPrimary,
    },
  });