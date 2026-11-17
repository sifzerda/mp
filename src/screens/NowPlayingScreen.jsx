// src/screens/NowPlayingScreen.jsx

import { memo, useCallback } from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import { useIsFocused } from "@react-navigation/native";
import { useActiveTrack } from "react-native-track-player";

import PlayerControls from "../components/PlayerControls";
import PlaybackProgress from "../components/PlaybackProgress";
import AlbumArtwork from "../components/AlbumArtwork";

import useCurrentSong from "../hooks/useCurrentSong";
import useFavoritesStore from "../store/useFavoritesStore";
import useThemedStyles from "../theme/useThemedStyles";

const FavoriteButton = memo(function FavoriteButton({
  songId,
}) {
  const { styles } = useThemedStyles(createStyles);

  const isFavorite = useFavoritesStore(
    (s) => songId != null &&
      s.favoriteIds.has(String(songId))
  );

  const toggleFavorite = useFavoritesStore(
    (s) => s.toggleFavorite
  );

  const handlePress = useCallback(() => {
    if (songId == null) return;

    toggleFavorite(songId).catch(console.error);
  }, [songId, toggleFavorite]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={songId == null}
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
  );
});

function NowPlayingScreen({ navigation }) {
  const { styles } = useThemedStyles(createStyles);

  const track = useActiveTrack();
  const artworkSong = useCurrentSong(track);
  const isFocused = useIsFocused();

  const songId = artworkSong?.id ?? track?.id;

  const closePlayer = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const openQueue = useCallback(() => {
    navigation.navigate("Queue");
  }, [navigation]);

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

      <View style={styles.artworkContainer}>
        <AlbumArtwork
          song={artworkSong}
          size={280}
          borderRadius={24}
        />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>
          {track.title || "Unknown title"}
        </Text>

        <FavoriteButton songId={songId} />
      </View>

      <Text style={styles.artist}>
        {track.artist || "Unknown artist"}
      </Text>

      <PlaybackProgress
        key={track.id}
        trackId={track.id}
        trackDuration={track.duration}
        enabled={isFocused}
      />

      <Pressable
        onPress={openQueue}
        style={styles.queueButton}
        accessibilityRole="button"
        accessibilityLabel="Open playback queue"
      >
        <Text style={styles.queueButtonText}>
          ☷ View Queue
        </Text>
      </Pressable>

      <PlayerControls />
    </View>
  );
}

export default memo(NowPlayingScreen);

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