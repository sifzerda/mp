// src/components/PlayerControls.jsx

import { memo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";

import {
  usePlaybackState,
  State,
} from "react-native-track-player";

import {
  togglePlayback,
  nextTrack,
  previousTrack,
  toggleShuffle,
  cycleRepeat,
  setPlaybackSpeed,
} from "../services/audioService";

import usePlaybackAction from "../hooks/usePlaybackAction";
import useThemedStyles from "../theme/useThemedStyles";
import usePlaybackStore from "../store/usePlaybackStore";

const REPEAT_LABELS = {
  off: "Repeat Off",
  all: "Repeat All",
  one: "Repeat One",
};

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

/* -------------------- PLAYBACK CONTROLS -------------------- */

const PlaybackControls = memo(function PlaybackControls() {
  const { styles } = useThemedStyles(createControlsStyles);
  const { state } = usePlaybackState();
  const { busy, runAction } = usePlaybackAction();

  const isPlaying = state === State.Playing;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => runAction(previousTrack)}
        disabled={busy}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Previous track"
      >
        <Text style={styles.icon}>⏮</Text>
      </Pressable>

      <Pressable
        onPress={() => runAction(togglePlayback)}
        disabled={busy}
        style={styles.playButton}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? "Pause" : "Play"}
      >
        <Text style={styles.playIcon}>
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
    </View>
  );
});

/* -------------------- PLAYBACK MODES -------------------- */

const PlaybackModes = memo(function PlaybackModes() {
  const { styles } = useThemedStyles(createModesStyles);

  const shuffle = usePlaybackStore((s) => s.shuffle);
  const repeat = usePlaybackStore((s) => s.repeat);

  const { busy, runAction } = usePlaybackAction();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => runAction(toggleShuffle)}
        disabled={busy}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={
          shuffle ? "Disable shuffle" : "Enable shuffle"
        }
      >
        <Text style={[
          styles.icon,
          shuffle && styles.active,
        ]}>
          ⇄
        </Text>

        <Text style={styles.label}>
          {shuffle ? "Shuffle On" : "Shuffle Off"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => runAction(cycleRepeat)}
        disabled={busy}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Change repeat mode"
      >
        <Text style={[
          styles.icon,
          repeat !== "off" && styles.active,
        ]}>
          {repeat === "one" ? "↻¹" : "↻"}
        </Text>

        <Text style={styles.label}>
          {REPEAT_LABELS[repeat]}
        </Text>
      </Pressable>
    </View>
  );
});

/* -------------------- PLAYBACK SPEED -------------------- */

const PlaybackSpeed = memo(function PlaybackSpeed() {
  const { styles } = useThemedStyles(createSpeedStyles);

  const speed = usePlaybackStore((s) => s.speed);
  const { busy, runAction } = usePlaybackAction();

  function changeSpeed(value) {
    if (value === speed) return;

    return runAction(async () => {
      try {
        await setPlaybackSpeed(value);
      } catch (error) {
        Alert.alert(
          "Playback speed error",
          error?.message || "Unable to change speed."
        );
      }
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Playback Speed</Text>

      <View style={styles.options}>
        {SPEEDS.map((value) => {
          const selected = speed === value;

          return (
            <Pressable
              key={value}
              onPress={() => changeSpeed(value)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityState={{
                selected,
                disabled: busy,
              }}
              style={[
                styles.option,
                selected && styles.selected,
              ]}
            >
              <Text style={[
                styles.optionText,
                selected && styles.selectedText,
              ]}>
                {value}×
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

/* -------------------- COMBINED CONTROLS -------------------- */

export default function PlayerControls() {
  return (
    <>
      <PlaybackControls />
      <PlaybackModes />
      <PlaybackSpeed />
    </>
  );
}

/* -------------------- STYLES -------------------- */

const createControlsStyles = (colors) =>
  StyleSheet.create({
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
      color: colors.text,
    },

    playButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    playIcon: {
      fontSize: 30,
      color: colors.onPrimary,
    },
  });

const createModesStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      marginTop: 20,
    },

    button: {
      alignItems: "center",
      padding: 12,
    },

    icon: {
      fontSize: 28,
      color: colors.muted,
    },

    active: {
      color: colors.primary,
    },

    label: {
      color: colors.text,
      fontSize: 12,
      marginTop: 5,
    },
  });

const createSpeedStyles = (colors) =>
  StyleSheet.create({
    container: {
      marginTop: 18,
    },

    label: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 12,
    },

    options: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 6,
    },

    option: {
      flex: 1,
      maxWidth: 72,
      alignItems: "center",
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    selected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    optionText: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: "700",
    },

    selectedText: {
      color: colors.onPrimary,
    },
  });