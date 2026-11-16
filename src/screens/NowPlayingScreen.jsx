// src/screens/NowPlayingScreen.jsx

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import Slider from "@react-native-community/slider";

import TrackPlayer, {
  useActiveTrack,
  useProgress,
} from "react-native-track-player";

import PlaybackControls from "../components/PlaybackControls";
import usePlayerStore from "../store/usePlayerStore";

function formatTime(seconds) {
  const total = Math.floor(Math.max(0, seconds || 0));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function NowPlayingScreen() {
  const track = useActiveTrack();
  const { position, duration } = useProgress(500);

  const closePlayer = usePlayerStore((s) => s.closePlayer);

  if (!track) {
    return (
      <View style={styles.container}>
        <Pressable onPress={closePlayer}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.empty}>No song selected</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={closePlayer}>
        <Text style={styles.back}>‹ Library</Text>
      </Pressable>

      <View style={styles.artwork}>
        <Text style={styles.artworkIcon}>♫</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {track.title}
      </Text>

      <Text style={styles.artist}>
        {track.artist || "Unknown artist"}
      </Text>

      <View style={styles.progress}>
        <Slider
          minimumValue={0}
          maximumValue={Math.max(duration, 1)}
          value={Math.min(position, Math.max(duration, 1))}
          minimumTrackTintColor="#00d9ff"
          maximumTrackTintColor="#34485b"
          thumbTintColor="#00d9ff"
          onSlidingComplete={(value) =>
            TrackPlayer.seekTo(value)
          }
        />

        <View style={styles.times}>
          <Text style={styles.time}>
            {formatTime(position)}
          </Text>
          <Text style={styles.time}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      <PlaybackControls />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08121f",
    padding: 24,
    justifyContent: "center",
  },
  back: {
    color: "#00d9ff",
    fontSize: 17,
    marginBottom: 30,
  },
  artwork: {
    width: "100%",
    aspectRatio: 1,
    maxHeight: 340,
    backgroundColor: "#172b40",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  artworkIcon: {
    color: "#00d9ff",
    fontSize: 110,
  },
  title: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  artist: {
    color: "#9baec1",
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
  progress: {
    marginVertical: 35,
  },
  times: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: {
    color: "#9baec1",
    fontSize: 13,
  },
  empty: {
    color: "#ffffff",
    textAlign: "center",
  },
});
