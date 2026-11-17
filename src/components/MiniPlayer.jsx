// src/components/MiniPlayer.jsx

import { memo } from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react-native";

import {
  useActiveTrack,
  usePlaybackState,
  State,
} from "react-native-track-player";

import {
  togglePlayback,
  previousTrack,
  nextTrack,
} from "../services/audioService";

import AlbumArtwork from "./AlbumArtwork";
import PlaybackProgress from "./PlaybackProgress";

import useCurrentSong from "../hooks/useCurrentSong";
import usePlaybackAction from "../hooks/usePlaybackAction";
import useThemedStyles from "../theme/useThemedStyles";

/* -------------------- CONTROL BUTTON -------------------- */

function ControlButton({
  icon: Icon,
  size = 23,
  label,
  onPress,
  disabled,
  colors,
  styles,
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        (pressed || disabled) && styles.dimmed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Icon
        size={size}
        color={colors.primary}
        fill={colors.primary}
      />
    </Pressable>
  );
}

/* -------------------- PLAYBACK CONTROLS -------------------- */

const MiniPlayerControls = memo(function MiniPlayerControls() {
  const { colors, styles } = useThemedStyles(createStyles);
  const { state } = usePlaybackState();
  const { busy, runAction } = usePlaybackAction();

  const isPlaying = state === State.Playing;

  return (
    <View style={styles.controls}>
      <ControlButton
        icon={SkipBack}
        label="Previous track"
        onPress={() => runAction(previousTrack)}
        disabled={busy}
        colors={colors}
        styles={styles}
      />

      <ControlButton
        icon={isPlaying ? Pause : Play}
        size={27}
        label={isPlaying ? "Pause" : "Play"}
        onPress={() => runAction(togglePlayback)}
        disabled={busy}
        colors={colors}
        styles={styles}
      />

      <ControlButton
        icon={SkipForward}
        label="Next track"
        onPress={() => runAction(nextTrack)}
        disabled={busy}
        colors={colors}
        styles={styles}
      />
    </View>
  );
});

/* -------------------- MINI PLAYER -------------------- */

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

/* -------------------- STYLES -------------------- */

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
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginRight: 6,
    },

    songInfo: {
      flex: 1,
      minWidth: 0,
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

    controls: {
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 0,
    },

    button: {
      width: 40,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },

    dimmed: {
      opacity: 0.5,
    },
  });