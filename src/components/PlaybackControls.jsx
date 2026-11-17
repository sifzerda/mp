// src/components/PlaybackControls.jsx

import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { usePlaybackState, State } from "react-native-track-player";
import { togglePlayback, nextTrack, previousTrack } from "../services/audioService";

export default function PlaybackControls() {
  const playback = usePlaybackState();
  const [busy, setBusy] = useState(false);

  const isPlaying = playback.state === State.Playing;

  async function handleAction(action) {
    if (busy) return;

    setBusy(true);

    try {
      await action();
    } catch (error) {
      console.error("Playback control error:", error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => handleAction(previousTrack)}
        disabled={busy}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Previous track"
      >
        <Text style={styles.icon}>⏮</Text>
      </Pressable>

      <Pressable
        onPress={() => handleAction(togglePlayback)}
        disabled={busy}
        style={styles.playButton}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? "Pause" : "Play"}
      >
        <Text style={styles.playIcon}>
          {isPlaying ? "⏸" : "▶"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => handleAction(nextTrack)}
        disabled={busy}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Next track"
      >
        <Text style={styles.icon}>⏭</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
  },
  button: {
    padding: 12,
  },
  icon: {
    fontSize: 28,
    color: "#ffffff",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#00d9ff",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    fontSize: 30,
    color: "#07121d",
  },
});
