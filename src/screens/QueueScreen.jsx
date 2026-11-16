// src/screens/QueueScreen.jsx

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";

import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";

import {
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";

import AlbumArtwork from "../components/AlbumArtwork";
import useMusicStore from "../store/useMusicStore";

import {
  getPlaybackQueue,
  removeQueuedTrack,
  moveQueuedTrack,
  playQueuedTrack,
} from "../services/audioService";

export default function QueueScreen({ onBack }) {
  const [tracks, setTracks] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const songs = useMusicStore((s) => s.songs);

  const refresh = useCallback(async () => {
    try {
      const result = await getPlaybackQueue();

      setTracks(result.tracks);
      setActiveIndex(result.activeIndex);
    } catch (error) {
      console.warn("Queue refresh failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useTrackPlayerEvents(
    [
      Event.PlaybackActiveTrackChanged,
      Event.PlaybackQueueEnded,
    ],
    refresh
  );

  const currentTrack =
    activeIndex >= 0 ? tracks[activeIndex] : null;

  const upcoming = tracks
    .slice(activeIndex >= 0 ? activeIndex + 1 : 0)
    .map((track, index) => ({
      ...track,
      queueIndex:
        index + (activeIndex >= 0 ? activeIndex + 1 : 0),
      queueKey: String(index),
    }));

  const getArtworkSong = (track) => {
    if (!track) return null;

    return (
      songs.find(
        (song) =>
          song.uri === track.url ||
          String(song.id) === String(track.id)
      ) || track
    );
  };

  const handleRemove = async (index) => {
    if (busy) return;

    setBusy(true);

    try {
      await removeQueuedTrack(index);
      await refresh();
    } catch (error) {
      Alert.alert("Queue error", error.message);
    } finally {
      setBusy(false);
    }
  };

  const handlePlay = async (index) => {
    if (busy) return;

    setBusy(true);

    try {
      await playQueuedTrack(index);
      await refresh();
    } catch (error) {
      Alert.alert("Playback error", error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDragEnd = async ({ from, to }) => {
    if (busy || from === to) return;

    const offset = activeIndex >= 0 ? activeIndex + 1 : 0;

    setBusy(true);

    try {
      await moveQueuedTrack(from + offset, to + offset);
      await refresh();
    } catch (error) {
      Alert.alert("Reorder error", error.message);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const renderItem = ({ item, drag, isActive }) => (
    <ScaleDecorator>
      <View
        style={[
          styles.songRow,
          isActive && styles.dragging,
        ]}
      >
        <Pressable
          style={styles.songDetails}
          onPress={() => handlePlay(item.queueIndex)}
          disabled={busy}
        >
          <AlbumArtwork
            song={getArtworkSong(item)}
            size={48}
            borderRadius={9}
          />

          <View style={styles.songText}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {item.title || "Unknown title"}
            </Text>

            <Text style={styles.songArtist} numberOfLines={1}>
              {item.artist || "Unknown artist"}
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() => handleRemove(item.queueIndex)}
          disabled={busy}
          accessibilityLabel="Remove from queue"
        >
          <Text style={styles.remove}>✕</Text>
        </Pressable>

        <Pressable
          style={styles.action}
          onLongPress={drag}
          disabled={busy}
          accessibilityLabel="Drag to reorder song"
        >
          <Text style={styles.dragHandle}>☰</Text>
        </Pressable>
      </View>
    </ScaleDecorator>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>‹ Now Playing</Text>
        </Pressable>

        <Text style={styles.heading}>Playback Queue</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#00d9ff" size="large" />
      ) : (
        <>
          <Text style={styles.sectionTitle}>NOW PLAYING</Text>

          {currentTrack ? (
            <View style={styles.currentRow}>
              <AlbumArtwork
                song={getArtworkSong(currentTrack)}
                size={56}
                borderRadius={10}
              />

              <View style={styles.songText}>
                <Text style={styles.songTitle} numberOfLines={1}>
                  {currentTrack.title}
                </Text>

                <Text style={styles.songArtist} numberOfLines={1}>
                  {currentTrack.artist}
                </Text>
              </View>

              <Text style={styles.playingIcon}>♫</Text>
            </View>
          ) : (
            <Text style={styles.empty}>No song playing</Text>
          )}

          <Text style={styles.sectionTitle}>
            UP NEXT ({upcoming.length})
          </Text>

          <DraggableFlatList
            data={upcoming}
            keyExtractor={(item) => item.queueKey}
            renderItem={renderItem}
            onDragEnd={handleDragEnd}
            activationDistance={10}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.empty}>
                No upcoming songs
              </Text>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08121f",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  header: {
    marginBottom: 26,
  },

  back: {
    color: "#00d9ff",
    fontSize: 16,
    marginBottom: 18,
  },

  heading: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },

  sectionTitle: {
    color: "#00d9ff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 12,
  },

  currentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#193448",
    borderRadius: 14,
    padding: 12,
    gap: 12,
    marginBottom: 20,
  },

  songRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#142436",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },

  dragging: {
    backgroundColor: "#28445b",
  },

  songDetails: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  songText: {
    flex: 1,
  },

  songTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  songArtist: {
    color: "#9baec1",
    fontSize: 12,
    marginTop: 4,
  },

  action: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  remove: {
    color: "#ff477e",
    fontSize: 20,
  },

  dragHandle: {
    color: "#9baec1",
    fontSize: 22,
  },

  playingIcon: {
    color: "#00d9ff",
    fontSize: 25,
  },

  empty: {
    color: "#9baec1",
    textAlign: "center",
    marginTop: 25,
  },

  listContent: {
    paddingBottom: 30,
  },
});
