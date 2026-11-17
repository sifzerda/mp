// src/components/ThemePreview.jsx

import { View, Text, StyleSheet } from "react-native";

import {
  Music,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react-native";

import useThemedStyles from "../theme/useThemedStyles";

export default function ThemePreview() {
  const { colors, styles } = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.songRow}>
        <View style={styles.artwork}>
          <Music
            size={30}
            color={colors.primary}
          />
        </View>

        <View style={styles.songInfo}>
          <Text style={styles.title}>Song Title</Text>
          <Text style={styles.artist}>Artist Name</Text>
        </View>
      </View>

      <View style={styles.progress}>
        <View style={styles.progressFill} />
      </View>

      <View style={styles.times}>
        <Text style={styles.time}>1:19</Text>
        <Text style={styles.time}>3:33</Text>
      </View>

      <View style={styles.controls}>
        <SkipBack
          size={26}
          color={colors.text}
          fill={colors.text}
        />

        <View style={styles.playButton}>
          <Play
            size={28}
            color={colors.onPrimary}
            fill={colors.onPrimary}
          />
        </View>

        <SkipForward
          size={26}
          color={colors.text}
          fill={colors.text}
        />
      </View>
    </View>
  );
}

/* -------------------- STYLES -------------------- */

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      padding: 18,
      borderRadius: 16,
      gap: 14,
    },

    songRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    artwork: {
      width: 58,
      height: 58,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },

    songInfo: {
      flex: 1,
      gap: 4,
    },

    title: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "700",
    },

    artist: {
      color: colors.muted,
      fontSize: 14,
    },

    progress: {
      backgroundColor: colors.sliderTrack,
      height: 5,
      borderRadius: 5,
      overflow: "hidden",
    },

    progressFill: {
      backgroundColor: colors.primary,
      width: "37%",
      height: "100%",
    },

    times: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    time: {
      color: colors.muted,
      fontSize: 12,
    },

    controls: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 28,
    },

    playButton: {
      backgroundColor: colors.primary,
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
    },
  });