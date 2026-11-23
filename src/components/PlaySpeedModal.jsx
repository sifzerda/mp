// src/components/PlaySpeedModal.jsx

import { memo, useEffect, useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { X, RotateCcw, Gauge } from "lucide-react-native";
import { setPlaybackSpeed } from "../services/audioService";
import usePlaybackStore from "../store/usePlaybackStore";
import usePlaybackAction from "../hooks/usePlaybackAction";
import useThemedStyles from "../theme/useThemedStyles";

const MIN_SPEED = 0.5;
const MAX_SPEED = 2;
const STEP = 0.05;
const TICKS = Array.from({ length: 31 }, (_, index) => index);
const LABELS = [
  "0.5",
  "0.75",
  "1",
  "1.25",
  "1.5",
  "1.75",
  "2",
];

/* -------------------- CALIBRATION -------------------- */

const Calibration = memo(function Calibration({ styles }) {
  return (
    <View style={styles.calibration}>
      <View style={styles.tickRow}>
        {TICKS.map((tick) => (
          <View
            key={tick}
            style={[
              styles.tick,
              tick % 5 === 0 && styles.majorTick,
              tick === 10 && styles.normalTick,
            ]}
          />
        ))}
      </View>

      <View style={styles.tickLabels}>
        {LABELS.map((label) => (
          <Text
            key={label}
            style={[
              styles.tickLabel,
              label === "1" && styles.normalLabel,
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
});

/* -------------------- MODAL -------------------- */

function PlaySpeedModal({
  visible,
  onClose,
}) {
  const { colors, styles } = useThemedStyles(createStyles);

  const speed = usePlaybackStore((s) => s.speed);
  const { busy, runAction } = usePlaybackAction();

  const [draft, setDraft] = useState(speed);

  useEffect(() => {
    if (visible) {
      setDraft(speed);
    }
  }, [visible, speed]);

  function changeSpeed(value) {
    const rounded = Number(value.toFixed(2));

    setDraft(rounded);

    if (rounded === speed) return;

    return runAction(async () => {
      try {
        await setPlaybackSpeed(rounded);
      } catch (error) {
        setDraft(speed);

        Alert.alert(
          "Playback speed error",
          error?.message || "Unable to change speed."
        );
      }
    });
  }

  const description =
    draft === 1
      ? "Normal speed"
      : draft < 1
        ? "Slower playback"
        : "Faster playback";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close playback speed"
        />

        <View style={styles.sheet}>

          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Gauge
                size={22}
                color={colors.primary}
              />

              <Text style={styles.title}>
                Playback Speed
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={22} color={colors.muted} />
            </Pressable>
          </View>

          <View style={styles.speedDisplay}>
            <Text style={styles.speedValue}>
              {draft.toFixed(2)}×
            </Text>

            <Text style={styles.description}>
              {description}
            </Text>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={MIN_SPEED}
              maximumValue={MAX_SPEED}
              step={STEP}
              value={draft}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.sliderTrack}
              thumbTintColor={colors.primary}
              onValueChange={setDraft}
              onSlidingComplete={changeSpeed}
              disabled={busy}
              accessibilityLabel="Playback speed"
            />

            <Calibration styles={styles} />
          </View>

          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabel}>
              Slower
            </Text>

            <Text style={styles.rangeLabel}>
              Faster
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => changeSpeed(1)}
              disabled={busy}
              style={styles.resetButton}
              accessibilityRole="button"
              accessibilityLabel="Reset playback speed"
            >
              <RotateCcw
                size={17}
                color={colors.text}
              />

              <Text style={styles.resetText}>
                Reset
              </Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              disabled={busy}
              style={styles.doneButton}
              accessibilityRole="button"
            >
              <Text style={styles.doneText}>
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default memo(PlaySpeedModal);

/* -------------------- STYLES -------------------- */

const createStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },

    sheet: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: colors.surface,
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingVertical: 24,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    headerTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    title: {
      color: colors.text,
      fontSize: 19,
      fontWeight: "700",
    },

    closeButton: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 19,
      backgroundColor: colors.surfaceAlt,
    },

    speedDisplay: {
      alignItems: "center",
      paddingTop: 26,
      paddingBottom: 22,
      gap: 5,
    },

    speedValue: {
      fontSize: 52,
      fontWeight: "800",
      color: colors.primary,
      letterSpacing: -2,
      fontVariant: ["tabular-nums"],
    },

    description: {
      fontSize: 14,
      color: colors.muted,
      fontWeight: "500",
    },

    sliderContainer: {
      marginTop: 6,
    },

    slider: {
      width: "100%",
      height: 42,
    },

    calibration: {
      paddingHorizontal: 15,
    },

    tickRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      height: 14,
    },

    tick: {
      width: 1,
      height: 5,
      borderRadius: 1,
      backgroundColor: colors.muted,
      opacity: 0.4,
    },

    majorTick: {
      width: 2,
      height: 10,
      opacity: 0.8,
    },

    normalTick: {
      backgroundColor: colors.primary,
      height: 13,
      opacity: 1,
    },

    tickLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: -9,
      marginTop: 4,
    },

    tickLabel: {
      flex: 1,
      textAlign: "center",
      fontSize: 10,
      color: colors.muted,
      fontVariant: ["tabular-nums"],
    },

    normalLabel: {
      color: colors.primary,
      fontWeight: "700",
    },

    rangeLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 16,
      paddingHorizontal: 4,
    },

    rangeLabel: {
      color: colors.muted,
      fontSize: 12,
    },

    actions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 28,
    },

    resetButton: {
      flex: 1,
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 14,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },

    resetText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },

    doneButton: {
      flex: 2,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    doneText: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: "700",
    },
  });