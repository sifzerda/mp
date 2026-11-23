// src/components/PlayerControls.jsx

import { memo, useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet} from "react-native";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, ListMusic, Gauge } from "lucide-react-native";
import { usePlaybackState, State } from "react-native-track-player";
import { togglePlayback, nextTrack, previousTrack, toggleShuffle, cycleRepeat } from "../services/audioService";
import usePlaybackAction from "../hooks/usePlaybackAction";
import useThemedStyles from "../theme/useThemedStyles";
import usePlaybackStore from "../store/usePlaybackStore";
import PlaySpeedModal from "./PlaySpeedModal";

const REPEAT_LABELS = {
  off: "Repeat",
  all: "Repeat All",
  one: "Repeat One",
};

/* -------------------- PLAYBACK CONTROLS -------------------- */

const PlaybackControls = memo(function PlaybackControls() {
  const { colors, styles } = useThemedStyles(createStyles);
  const { state } = usePlaybackState();
  const { busy, runAction } = usePlaybackAction();
  const isPlaying = state === State.Playing;
  const PlayIcon = isPlaying ? Pause : Play;

  return (
    <View style={styles.transport}>
      <Pressable
        onPress={() => runAction(previousTrack)}
        disabled={busy}
        style={({ pressed }) => [
          styles.skipButton,
          pressed && styles.pressed,
          busy && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Previous track"
      >
        <SkipBack
          size={32}
          color={colors.text}
          fill={colors.text}
        />
      </Pressable>

      <Pressable
        onPress={() => runAction(togglePlayback)}
        disabled={busy}
        style={({ pressed }) => [
          styles.playButton,
          pressed && styles.pressed,
          busy && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? "Pause" : "Play"}
      >
        <PlayIcon
          size={34}
          color={colors.onPrimary}
          fill={colors.onPrimary}
          style={!isPlaying && styles.playIcon}
        />
      </Pressable>

      <Pressable
        onPress={() => runAction(nextTrack)}
        disabled={busy}
        style={({ pressed }) => [
          styles.skipButton,
          pressed && styles.pressed,
          busy && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Next track"
      >
        <SkipForward
          size={32}
          color={colors.text}
          fill={colors.text}
        />
      </Pressable>
    </View>
  );
});

/* -------------------- MODE BUTTON -------------------- */

const ModeButton = memo(function ModeButton({
  icon: Icon,
  label,
  active = false,
  disabled = false,
  onPress,
  accessibilityLabel,
}) {
  const { colors, styles } = useThemedStyles(createStyles);
  const color = active ? colors.primary : colors.muted;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.modeButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{
        selected: active,
        disabled,
      }}
    >
      <Icon
        size={23}
        color={color}
        strokeWidth={2}
      />

      <Text
        numberOfLines={1}
        style={[styles.modeLabel, { color }]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.modeIndicator,
          active && styles.activeIndicator,
        ]}
      />
    </Pressable>
  );
});

/* -------------------- SPEED BUTTON -------------------- */

const SpeedButton = memo(function SpeedButton() {
  const speed = usePlaybackStore((s) => s.speed);
  const [visible, setVisible] = useState(false);
  const openModal = useCallback(() => { setVisible(true) }, []);
  const closeModal = useCallback(() => { setVisible(false) }, []);

  return (
    <>
      <ModeButton
        icon={Gauge}
        label={`${Number(speed.toFixed(2))}×`}
        active={speed !== 1}
        onPress={openModal}
        accessibilityLabel={`Playback speed ${speed} times`}
      />

      {visible && (
        <PlaySpeedModal
          visible={visible}
          onClose={closeModal}
        />
      )}
    </>
  );
});

/* -------------------- PLAYBACK MODES -------------------- */

const PlaybackModes = memo(function PlaybackModes({ onOpenQueue }) {
  const { styles } = useThemedStyles(createStyles);
  const shuffle = usePlaybackStore((s) => s.shuffle);
  const repeat = usePlaybackStore((s) => s.repeat);
  const { busy, runAction } = usePlaybackAction();

  return (
    <View style={styles.modes}>
      <ModeButton
        icon={Shuffle}
        label="Shuffle"
        active={shuffle}
        disabled={busy}
        onPress={() => runAction(toggleShuffle)}
        accessibilityLabel={
          shuffle ? "Disable shuffle" : "Enable shuffle"
        }
      />

      <View style={styles.modeDivider} />

      <ModeButton
        icon={repeat === "one" ? Repeat1 : Repeat}
        label={REPEAT_LABELS[repeat] || "Repeat"}
        active={repeat !== "off"}
        disabled={busy}
        onPress={() => runAction(cycleRepeat)}
        accessibilityLabel="Change repeat mode"
      />

      {onOpenQueue && (
        <>
          <View style={styles.modeDivider} />

          <ModeButton
            icon={ListMusic}
            label="Queue"
            onPress={onOpenQueue}
            accessibilityLabel="Open playback queue"
          />
        </>
      )}

      <View style={styles.modeDivider} />

      <SpeedButton />
    </View>
  );
});

/* -------------------- COMBINED CONTROLS -------------------- */

function PlayerControls({ onOpenQueue }) {
  const { styles } = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <PlaybackControls />
      <PlaybackModes onOpenQueue={onOpenQueue} />
    </View>
  );
}

export default memo(PlayerControls);

/* -------------------- STYLES -------------------- */

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      gap: 20,
    },

    transport: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 40,
    },

    skipButton: {
      width: 54,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 27,
    },

    playButton: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },

    playIcon: { marginLeft: 3 },
    pressed: { opacity: 0.65 },
    disabled: { opacity: 0.5 },

    modes: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceAlt,
      borderRadius: 10,
      paddingVertical: 0,
      paddingTop: 8,
      paddingHorizontal: 4,
    },

    modeButton: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      gap: 6,
    },

    modeLabel: { fontSize: 11, fontWeight: "600" },

    modeIndicator: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: "transparent",
    },

    activeIndicator: { backgroundColor: colors.primary },

    modeDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.border,
    },
  });