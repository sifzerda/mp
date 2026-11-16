// src/components/PlaybackControls.jsx

import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  usePlaybackState,
  State,
} from "react-native-track-player";

import {
  togglePlayback,
  nextTrack,
  previousTrack,
} from "../services/audioService";

export default function PlaybackControls() {
  const playback = usePlaybackState();
  const isPlaying = playback.state === State.Playing;

  return (
    <View style={styles.container}>
      <Pressable onPress={previousTrack} style={styles.button}>
        <Text style={styles.icon}>⏮</Text>
      </Pressable>

      <Pressable
        onPress={togglePlayback}
        style={styles.playButton}
      >
        <Text style={styles.playIcon}>
          {isPlaying ? "⏸" : "▶"}
        </Text>
      </Pressable>

      <Pressable onPress={nextTrack} style={styles.button}>
        <Text style={styles.icon}>⏭</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
