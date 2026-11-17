// src/components/PlaybackModes.jsx

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import usePlaybackStore from "../store/usePlaybackStore";
import useThemedStyles from "../theme/useThemedStyles";

import {
  toggleShuffle,
  cycleRepeat,
} from "../services/audioService";

const REPEAT_LABELS = {
  off: "Repeat Off",
  all: "Repeat All",
  one: "Repeat One",
};

export default function PlaybackModes() {
  const { styles } = useThemedStyles(createStyles);

  const shuffle = usePlaybackStore((s) => s.shuffle);
  const repeat = usePlaybackStore((s) => s.repeat);

  const [busy, setBusy] = useState(false);

  async function handleAction(action) {
    if (busy) return;

    setBusy(true);

    try {
      await action();
    } catch (error) {
      console.error("Playback mode error:", error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => handleAction(toggleShuffle)}
        disabled={busy}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={
          shuffle ? "Disable shuffle" : "Enable shuffle"
        }
      >
        <Text
          style={[
            styles.icon,
            shuffle && styles.active,
          ]}
        >
          ⇄
        </Text>

        <Text style={styles.label}>
          {shuffle ? "Shuffle On" : "Shuffle Off"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handleAction(cycleRepeat)}
        disabled={busy}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Change repeat mode"
      >
        <Text
          style={[
            styles.icon,
            repeat !== "off" && styles.active,
          ]}
        >
          {repeat === "one" ? "↻¹" : "↻"}
        </Text>

        <Text style={styles.label}>
          {REPEAT_LABELS[repeat]}
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      marginTop: 20,
    },

    button: {
      alignItems: "center",
      padding: 12,
    },

    icon: {
      fontSize: 28,
      color: colors.muted,
    },

    active: {
      color: colors.primary,
    },

    label: {
      color: colors.text,
      fontSize: 12,
      marginTop: 5,
    },
  });