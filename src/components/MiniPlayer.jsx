// src/components/MiniPlayer.jsx 

import { memo } from "react";

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

import AlbumArtwork from "./AlbumArtwork";
import PlaybackProgress from "./PlaybackProgress";

import useCurrentSong from "../hooks/useCurrentSong";
import usePlaybackAction from "../hooks/usePlaybackAction";
import useThemedStyles from "../theme/useThemedStyles";

const MiniPlayerControls = memo(
  function MiniPlayerControls() {
    const { styles } = useThemedStyles(createStyles);

    const { state } = usePlaybackState();
    const { busy, runAction } = usePlaybackAction();

    const isPlaying = state === State.Playing;

    return (
      <>
        <Pressable
          onPress={() => runAction(togglePlayback)}
          disabled={busy}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
        >
          <Text style={styles.icon}>
            {isPlaying ? "⏸" : "▶"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => runAction(nextTrack)}
          disabled={busy}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Next track"
        >
          <Text style={styles.icon}>⏭</Text>
        </Pressable>
      </>
    );
  }
);

function MiniPlayer({
  onOpenPlayer,
  enabled = true,
}) {
  const { styles } = useThemedStyles(createStyles);

  const track = useActiveTrack();
  const artworkSong = useCurrentSong(track);

  if (!track) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          style={styles.details}
          onPress={onOpenPlayer}
          accessibilityRole="button"
          accessibilityLabel="Open now playing"
        >
          <AlbumArtwork
            song={artworkSong}
            size={44}
            borderRadius={8}
          />

          <View style={styles.songInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {track.title || "Unknown title"}
            </Text>

            <Text style={styles.artist} numberOfLines={1}>
              {track.artist || "Unknown artist"}
            </Text>
          </View>
        </Pressable>

        <MiniPlayerControls />
      </View>

      <PlaybackProgress
        key={track.id}
        trackId={track.id}
        trackDuration={track.duration}
        enabled={enabled}
        compact
      />
    </View>
  );
}

export default memo(MiniPlayer);

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 6,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "center",
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
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },

    artist: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 3,
    },

    button: {
      paddingHorizontal: 10,
      paddingVertical: 8,
    },

    icon: {
      color: colors.primary,
      fontSize: 25,
    },
  });