// src/screens/NowPlayingScreen.jsx

import { useMemo } from "react";
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
import AlbumArtwork from "../components/AlbumArtwork";
import PlaybackModes from "../components/PlaybackModes";
import PlaybackSpeed from "../components/PlaybackSpeed";



import useMusicStore from "../store/useMusicStore";

import useFavoritesStore from "../store/useFavoritesStore";
import useThemedStyles from "../theme/useThemedStyles";

function formatTime(seconds) {
  const total = Math.floor(Math.max(0, seconds || 0));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function NowPlayingScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);



  const track = useActiveTrack();
  const { position, duration } = useProgress(500);
  const closePlayer = () => navigation.goBack();
  const songs = useMusicStore((s) => s.songs);

  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const artworkSong = useMemo(() => {
    if (!track) return null;

    return (
      songs.find(
        (song) =>
          String(song.id) === String(track.id) ||
          song.uri === track.url
      ) || track
    );
  }, [songs, track]);

  const songId = artworkSong?.id ?? track?.id;

  const isFavorite =
    songId != null && favorites.includes(String(songId));

  const totalDuration = Math.max(
    0,
    duration || track?.duration || 0
  );

  if (!track) {
    return (
      <View style={styles.container}>
        <Pressable onPress={closePlayer}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>

        <Text style={styles.empty}>
          No song selected
        </Text>
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
        <AlbumArtwork
          song={artworkSong}
          size={280}
          borderRadius={24}
        />
      </View>

      {/* Song title and favorites */}
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>
          {track.title || "Unknown title"}
        </Text>

        <Pressable
          onPress={() =>
            toggleFavorite(songId).catch(console.error)
          }
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
          style={styles.favoriteButton}
        >
          <Text
            style={[
              styles.heart,
              isFavorite && styles.activeHeart,
            ]}
          >
            {isFavorite ? "♥" : "♡"}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.artist}>
        {track.artist || "Unknown artist"}
      </Text>

      {/* Playback progress */}
      <View style={styles.progress}>
        <Slider
          minimumValue={0}
          maximumValue={Math.max(totalDuration, 1)}
          value={Math.min(
            Math.max(position, 0),
            Math.max(totalDuration, 1)
          )}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.sliderTrack}
          thumbTintColor={colors.primary}
          disabled={totalDuration <= 0}
          onSlidingComplete={(value) =>
            TrackPlayer.seekTo(value).catch(console.error)
          }
          accessibilityLabel="Playback position"
        />

        <View style={styles.times}>
          <Text style={styles.time}>
            {formatTime(position)}
          </Text>

          <Text style={styles.time}>
            {formatTime(totalDuration)}
          </Text>
        </View>
      </View>

      {/* Playback queue */}
      <Pressable
        onPress={() => navigation.navigate("Queue")}
        style={styles.queueButton}
        accessibilityRole="button"
        accessibilityLabel="Open playback queue"
      >
        <Text style={styles.queueButtonText}>
          ☷ View Queue
        </Text>
      </Pressable>

      <PlaybackControls />
      <PlaybackModes />
      <PlaybackSpeed />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 24,
      justifyContent: "center",
    },

    back: {
      color: colors.primary,
      fontSize: 17,
      marginBottom: 30,
    },

    artworkContainer: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },

    title: {
      flexShrink: 1,
      color: colors.text,
      fontSize: 26,
      fontWeight: "bold",
      textAlign: "center",
    },

    artist: {
      color: colors.muted,
      fontSize: 16,
      textAlign: "center",
      marginTop: 8,
    },

    favoriteButton: {
      padding: 10,
    },

    heart: {
      color: colors.text,
      fontSize: 32,
    },

    activeHeart: {
      color: colors.danger,
    },

    progress: {
      marginVertical: 35,
    },

    times: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    time: {
      color: colors.muted,
      fontSize: 13,
    },

    queueButton: {
      alignSelf: "center",
      marginTop: 24,
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
    },

    queueButtonText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "700",
    },

    empty: {
      color: colors.text,
      textAlign: "center",
    },
  });