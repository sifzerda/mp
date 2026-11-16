// src/components/MiniPlayer.jsx 

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import {
  useActiveTrack,
  usePlaybackState,
  State,
} from "react-native-track-player";

import {
  togglePlayback,
  nextTrack,
} from "../services/audioService";

import usePlayerStore from "../store/usePlayerStore";

export default function MiniPlayer() {
  const track = useActiveTrack();
  const playback = usePlaybackState();
  const openPlayer = usePlayerStore((s) => s.openPlayer);

  if (!track) return null;

  const isPlaying = playback.state === State.Playing;

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.details}
        onPress={openPlayer}
      >
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
        </Text>
      </Pressable>

      <Pressable
        onPress={togglePlayback}
        style={styles.button}
      >
        <Text style={styles.icon}>
          {isPlaying ? "⏸" : "▶"}
        </Text>
      </Pressable>

      <Pressable
        onPress={nextTrack}
        style={styles.button}
      >
        <Text style={styles.icon}>⏭</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#142436",
    borderTopWidth: 1,
    borderTopColor: "#28445b",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  details: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  artist: {
    color: "#9baec1",
    fontSize: 12,
    marginTop: 3,
  },
  button: {
    paddingHorizontal: 10,
  },
  icon: {
    color: "#00d9ff",
    fontSize: 25,
  },
});
