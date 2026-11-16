// src/components/MiniPlayer.jsx 

import { View, Text, Pressable, StyleSheet } from "react-native";
import { useActiveTrack, usePlaybackState, State } from "react-native-track-player";
import { togglePlayback, nextTrack } from "../services/audioService";
import AlbumArtwork from "./AlbumArtwork";
import usePlayerStore from "../store/usePlayerStore";
import useMusicStore from "../store/useMusicStore";

export default function MiniPlayer() {
  const track = useActiveTrack();
  const songs = useMusicStore((s) => s.songs);
  const artworkSong = songs.find((song) => String(song.id) === String(track?.id)) || track;
  const playback = usePlaybackState();
  const openPlayer = usePlayerStore((s) => s.openPlayer);

  if (!track) return null;

  const isPlaying = playback.state === State.Playing;

  return (
    <View style={styles.container}>
      {/* Artwork and song information */}
      <Pressable
        style={styles.details}
        onPress={openPlayer}
      >
        <AlbumArtwork
          song={artworkSong}
          size={44}
          borderRadius={8}
        />

        <View style={styles.songInfo}>
          <Text
            style={styles.title}
            numberOfLines={1}
          >
            {track.title || "Unknown title"}
          </Text>

          <Text
            style={styles.artist}
            numberOfLines={1}
          >
            {track.artist || "Unknown artist"}
          </Text>
        </View>
      </Pressable>

      {/* Play / Pause */}
      <Pressable
        onPress={togglePlayback}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={
          isPlaying ? "Pause" : "Play"
        }
      >
        <Text style={styles.icon}>
          {isPlaying ? "⏸" : "▶"}
        </Text>
      </Pressable>

      {/* Next track */}
      <Pressable
        onPress={nextTrack}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Next track"
      >
        <Text style={styles.icon}>
          ⏭
        </Text>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  details: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginRight: 8,
  },

  songInfo: {
    flex: 1,
    justifyContent: "center",
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
    paddingVertical: 8,
  },

  icon: {
    color: "#00d9ff",
    fontSize: 25,
  },
});