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
import useThemedStyles from "../theme/useThemedStyles";

function NowPlayingScreen({ navigation }) {
  const { styles } = useThemedStyles(createStyles);

  const track = useActiveTrack();
  const artworkSong = useCurrentSong(track);

  const isFocused = useIsFocused();

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

      <Text style={styles.title} numberOfLines={2}>
        {track.title || "Unknown title"}
      </Text>

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

/* -------------------- STYLES -------------------- */

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

    title: {
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