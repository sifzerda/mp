// src/screens/NowPlayingScreen.jsx

import { useMemo } from "react";
import useMusicStore from "../store/useMusicStore";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import TrackPlayer, { useActiveTrack, useProgress } from "react-native-track-player";
import PlaybackControls from "../components/PlaybackControls";
import AlbumArtwork from "../components/AlbumArtwork";
import PlaybackModes from "../components/PlaybackModes";

import usePlayerStore from "../store/usePlayerStore";
import useFavoritesStore from "../store/useFavoritesStore";

function formatTime(seconds) {
  const total = Math.floor(Math.max(0, seconds || 0));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function NowPlayingScreen() {
  const track = useActiveTrack();
  const songs = useMusicStore((s) => s.songs);

  const artworkSong = useMemo(() => {
    if (!track) return null;

    return (
      songs.find((song) => String(song.id) === String(track.id)) ||
      track
    );
  }, [songs, track]);
  const { position, duration } = useProgress(500);
  const closePlayer = usePlayerStore((s) => s.closePlayer);
  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = track ? favorites.includes(String(track.id)) : false;

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

      {/* Album artwork */}
      <View style={styles.artworkContainer}>
        <AlbumArtwork song={artworkSong} size={280} borderRadius={24} />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>
          {track.title}
        </Text>

        <Pressable
          onPress={() => toggleFavorite(track.id)}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? "Remove from favorites" : "Add to favorites"
          }
          style={styles.favoriteButton}
        >
          <Text style={[
            styles.heart,
            isFavorite && styles.activeHeart,
          ]}>
            {isFavorite ? "♥" : "♡"}
          </Text>
        </Pressable>
      </View>

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
      <PlaybackModes />
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

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  favoriteButton: {
    padding: 10,
  },
  heart: {
    color: "#ffffff",
    fontSize: 32,
  },
  activeHeart: {
    color: "#ff477e",
  },
});
