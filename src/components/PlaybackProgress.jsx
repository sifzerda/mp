// src/components/PlaybackProgress.jsx

import { memo, useCallback, useRef,useState } from "react";
import { View, Text,StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import { seekTo } from "../services/audioService";
import usePlaybackProgress from "../hooks/usePlaybackProgress";
import useThemedStyles from "../theme/useThemedStyles";
import { formatTime } from "../utils/musicUtils";

function PlaybackProgress({ trackId, trackDuration = 0, compact = false, enabled = true }) {
  
  const { colors, styles } = useThemedStyles(createStyles);
  const { position, duration, refresh } = usePlaybackProgress({ interval: compact ? 1000 : 250, enabled, trackId, });
  const seekingRef = useRef(false);
  const [seekPosition, setSeekPosition] = useState(null);
  const totalDuration = Math.max(0, duration || trackDuration || 0);
  const maximum = Math.max(totalDuration, 1);
  const currentPosition = Math.min(Math.max(seekPosition ?? position, 0), maximum);
  const handleSeekStart = useCallback((value) => { seekingRef.current = true; setSeekPosition(value); }, []);
  const handleSeekChange = useCallback((value) => { if (seekingRef.current) { setSeekPosition(value) } }, []);

  const handleSeekComplete = useCallback(
    async (value) => {
      seekingRef.current = false;
      setSeekPosition(value);

      try {
        await seekTo(value, trackId);
        await refresh();
      } catch (error) {
        console.warn("Seeking failed:", error);
      } finally {
        if (!seekingRef.current) {
          setSeekPosition(null);
        }
      }
    },
    [refresh, trackId]
  );

  return (
    <View
      style={
        compact
          ? styles.compactContainer
          : styles.container
      }
    >
      <Slider
        style={
          compact
            ? styles.compactSlider
            : styles.slider
        }
        minimumValue={0}
        maximumValue={maximum}
        value={currentPosition}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.sliderTrack}
        thumbTintColor={colors.primary}
        disabled={!enabled || totalDuration <= 0}
        onSlidingStart={handleSeekStart}
        onValueChange={handleSeekChange}
        onSlidingComplete={handleSeekComplete}
        accessibilityLabel="Playback position"
      />

      <View
        style={[
          styles.times,
          compact && styles.compactTimes,
        ]}
      >
        <Text
          style={[
            styles.time,
            compact && styles.compactTime,
          ]}
        >
          {formatTime(currentPosition)}
        </Text>

        <Text
          style={[
            styles.time,
            compact && styles.compactTime,
          ]}
        >
          {formatTime(totalDuration)}
        </Text>
      </View>
    </View>
  );
}

export default memo(PlaybackProgress);

/* -------------------- STYLES -------------------- */

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      gap: 0,
    },

    compactContainer: {
      marginTop: 4,
    },

    slider: {
      width: "100%",
      height: 36,
    },

    compactSlider: {
      width: "100%",
      height: 30,
    },

    times: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 4,
    },

    compactTimes: {
      paddingHorizontal: 4,
      marginTop: -3,
    },

    time: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: "500",
      fontVariant: ["tabular-nums"],
    },

    compactTime: {
      fontSize: 11,
    },
  });