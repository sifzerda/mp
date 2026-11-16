// src/components/MiniPlayer.jsx 

import { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import Slider from "@react-native-community/slider";

import TrackPlayer, {
  useActiveTrack,
  usePlaybackState,
  useProgress,
  State,
} from "react-native-track-player";

import {
  togglePlayback,
  nextTrack,
} from "../services/audioService";

import AlbumArtwork from "./AlbumArtwork";
import usePlayerStore from "../store/usePlayerStore";
import useMusicStore from "../store/useMusicStore";

function formatTime(seconds) {
  const total = Math.floor(Math.max(0, seconds || 0));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function MiniPlayer() {
  const track = useActiveTrack();
  const playback = usePlaybackState();
  const { position, duration } = useProgress(500);

  const songs = useMusicStore((s) => s.songs);
  const openPlayer = usePlayerStore((s) => s.openPlayer);

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  // Use the original library song for embedded artwork.
  const artworkSong = useMemo(() => {
    if (!track) return null;

    return (
      songs.find(
        (song) => String(song.id) === String(track.id)
      ) || track
    );
  }, [songs, track]);

  if (!track) return null;

  const isPlaying = playback.state === State.Playing;

  const totalDuration = Math.max(
    0,
    duration || track.duration || 0
  );

  const sliderMaximum = Math.max(totalDuration, 1);

  const currentPosition = isSeeking
    ? seekPosition
    : position;

  const sliderValue = Math.min(
    Math.max(currentPosition, 0),
    sliderMaximum
  );

  const handleSeekStart = () => {
    setSeekPosition(position);
    setIsSeeking(true);
  };

  const handleSeekComplete = async (value) => {
    try {
      await TrackPlayer.seekTo(value);
    } catch (error) {
      console.warn("Mini-player seek failed:", error);
    } finally {
      setIsSeeking(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Song information and playback buttons */}
      <View style={styles.topRow}>
        <Pressable
          style={styles.details}
          onPress={openPlayer}
          accessibilityRole="button"
          accessibilityLabel="Open now playing"
        >
          <AlbumArtwork
            song={artworkSong}
            size={44}
            borderRadius={8}
          />

          <View style={styles.songInfo}>
            <Text
              style={styles.title}
              numberOfLines={1}
            >
              {track.title || "Unknown title"}
            </Text>

            <Text
              style={styles.artist}
              numberOfLines={1}
            >
              {track.artist || "Unknown artist"}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={togglePlayback}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
        >
          <Text style={styles.icon}>
            {isPlaying ? "⏸" : "▶"}
          </Text>
        </Pressable>

        <Pressable
          onPress={nextTrack}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Next track"
        >
          <Text style={styles.icon}>⏭</Text>
        </Pressable>
      </View>

      {/* Seekable progress bar */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={sliderMaximum}
        value={sliderValue}
        minimumTrackTintColor="#00d9ff"
        maximumTrackTintColor="#34485b"
        thumbTintColor="#00d9ff"
        disabled={totalDuration <= 0}
        onSlidingStart={handleSeekStart}
        onValueChange={(value) => {
          if (isSeeking) {
            setSeekPosition(value);
          }
        }}
        onSlidingComplete={handleSeekComplete}
      />

      {/* Playback times */}
      <View style={styles.times}>
        <Text style={styles.time}>
          {formatTime(currentPosition)}
        </Text>

        <Text style={styles.time}>
          {formatTime(totalDuration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#142436",
    borderTopWidth: 1,
    borderTopColor: "#28445b",
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
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  artist: {
    color: "#9baec1",
    fontSize: 12,
    marginTop: 3,
  },

  button: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  icon: {
    color: "#00d9ff",
    fontSize: 25,
  },

  slider: {
    width: "100%",
    height: 30,
    marginTop: 4,
  },

  times: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: -3,
  },

  time: {
    color: "#9baec1",
    fontSize: 11,
  },
});
