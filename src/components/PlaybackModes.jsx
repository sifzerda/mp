// src/components/PlaybackModes.jsx

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import usePlaybackStore from "../store/usePlaybackStore";
import { toggleShuffle, cycleRepeat } from "../services/audioService";

export default function PlaybackModes() {
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
          {repeat === "one" ? "🔂" : "🔁"}
        </Text>

        <Text style={styles.label}>
          {repeat === "off"
            ? "Repeat Off"
            : repeat === "all"
              ? "Repeat All"
              : "Repeat One"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: "#777777",
  },
  active: {
    color: "#00d9ff",
  },
  label: {
    color: "#ffffff",
    fontSize: 12,
    marginTop: 5,
  },
});