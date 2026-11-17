// src/screens/QueueScreen.jsx

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  const [currentTrack, setCurrentTrack] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const busyRef = useRef(false);
  const draggingRef = useRef(false);
  const queueChangedRef = useRef(false);

  const songs = useMusicStore((s) => s.songs);

  const artworkMap = useMemo(() => {
    const map = new Map();

    for (const song of songs) {
      map.set(String(song.id), song);

      if (song.uri) {
        map.set(song.uri, song);
      }
    }

    return map;
  }, [songs]);

  const getArtworkSong = useCallback(
    (track) => {
      if (!track) return null;

      return (
        artworkMap.get(String(track.id)) ||
        artworkMap.get(track.url) ||
        track
      );
    },
    [artworkMap]
  );

  const refresh = useCallback(async () => {
    try {
      const { tracks, activeIndex: index } =
        await getPlaybackQueue();

      setActiveIndex(index);

      setCurrentTrack(
        index >= 0 ? tracks[index] : null
      );

      setUpcoming(
        tracks.slice(index + 1)
      );
    } catch (error) {
      console.error("Queue refresh error:", error);
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
    () => {
      if (draggingRef.current || busyRef.current) {
        queueChangedRef.current = true;
        return;
      }

      refresh();
    }
  );

  const runAction = useCallback(
    async (action) => {
      if (busyRef.current) return;

      busyRef.current = true;
      setBusy(true);

      try {
        await action();
      } catch (error) {
        Alert.alert(
          "Queue error",
          error?.message ||
            "Unable to update playback queue."
        );
      } finally {
        await refresh();

        busyRef.current = false;
        setBusy(false);

        if (queueChangedRef.current) {
          queueChangedRef.current = false;
          await refresh();
        }
      }
    },
    [refresh]
  );

  const handlePlay = useCallback(
    (index) =>
      runAction(() =>
        playQueuedTrack(activeIndex + 1 + index)
      ),
    [activeIndex, runAction]
  );

  const handleRemove = useCallback(
    (index) =>
      runAction(() =>
        removeQueuedTrack(activeIndex + 1 + index)
      ),
    [activeIndex, runAction]
  );

  const handleDragBegin = useCallback(() => {
    draggingRef.current = true;
    queueChangedRef.current = false;
  }, []);

  const handleDragEnd = useCallback(
    async ({ data, from, to }) => {
      draggingRef.current = false;

      // Cancel stale operations if the active song
      // changed while the user was dragging.
      if (queueChangedRef.current) {
        queueChangedRef.current = false;
        await refresh();
        return;
      }

      if (from === to || busyRef.current) {
        return;
      }

      const movedTrack = upcoming[from];

      if (!movedTrack) {
        await refresh();
        return;
      }

      // Immediately display the reordered list.
      setUpcoming(data);

      const offset = activeIndex + 1;

      await runAction(() =>
        moveQueuedTrack(
          from + offset,
          to + offset,
          movedTrack.id
        )
      );
    },
    [activeIndex, upcoming, refresh, runAction]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }) => (
      <ScaleDecorator activeScale={1.03}>
        <View
          style={[
            styles.songRow,
            isActive && styles.activeRow,
          ]}
        >
          <Pressable
            style={styles.songDetails}
            disabled={busy || isActive}
            onPress={() => {
              const index = getIndex();

              if (index != null) {
                handlePlay(index);
              }
            }}
          >
            <AlbumArtwork
              song={getArtworkSong(item)}
              size={48}
              borderRadius={9}
            />

            <View style={styles.songText}>
              <Text
                style={styles.songTitle}
                numberOfLines={1}
              >
                {item.title || "Unknown title"}
              </Text>

              <Text
                style={styles.songArtist}
                numberOfLines={1}
              >
                {item.artist || "Unknown artist"}
              </Text>
            </View>
          </Pressable>

          {/* Remove from queue */}
          <Pressable
            style={styles.actionButton}
            disabled={busy || isActive}
            onPress={() => {
              const index = getIndex();

              if (index != null) {
                handleRemove(index);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Remove from queue"
          >
            <Text style={styles.removeIcon}>✕</Text>
          </Pressable>

          {/* Drag handle */}
          <Pressable
            style={styles.dragHandle}
            onLongPress={drag}
            delayLongPress={150}
            disabled={busy || isActive}
            accessibilityRole="button"
            accessibilityLabel={`Reorder ${item.title}`}
            accessibilityHint="Long press and drag"
          >
            <Text style={styles.dragIcon}>≡</Text>
          </Pressable>
        </View>
      </ScaleDecorator>
    ),
    [
      busy,
      getArtworkSong,
      handlePlay,
      handleRemove,
    ]
  );

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>
          ‹ Now Playing
        </Text>
      </Pressable>

      <Text style={styles.heading}>
        Playback Queue
      </Text>

      {loading ? (
        <ActivityIndicator
          color="#00d9ff"
          size="large"
        />
      ) : (
        <>
          <Text style={styles.sectionTitle}>
            NOW PLAYING
          </Text>

          {currentTrack ? (
            <View style={styles.currentRow}>
              <AlbumArtwork
                song={getArtworkSong(currentTrack)}
                size={56}
                borderRadius={10}
              />

              <View style={styles.songText}>
                <Text
                  style={styles.songTitle}
                  numberOfLines={1}
                >
                  {currentTrack.title}
                </Text>

                <Text
                  style={styles.songArtist}
                  numberOfLines={1}
                >
                  {currentTrack.artist}
                </Text>
              </View>

              <Text style={styles.playingIcon}>
                ♫
              </Text>
            </View>
          ) : (
            <Text style={styles.empty}>
              No song playing
            </Text>
          )}

          <Text style={styles.sectionTitle}>
            UP NEXT ({upcoming.length})
          </Text>

          {upcoming.length > 1 && (
            <Text style={styles.hint}>
              Hold and drag ≡ to reorder songs
            </Text>
          )}

          <DraggableFlatList
            data={upcoming}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            onDragBegin={handleDragBegin}
            onDragEnd={handleDragEnd}
            activationDistance={5}
            autoscrollThreshold={70}
            autoscrollSpeed={100}
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

  back: {
    color: "#00d9ff",
    fontSize: 16,
    marginBottom: 18,
  },

  heading: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
  },

  sectionTitle: {
    color: "#00d9ff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 12,
  },

  hint: {
    color: "#9baec1",
    fontSize: 12,
    marginBottom: 14,
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

  activeRow: {
    backgroundColor: "#28445b",
    elevation: 10,
  },

  songDetails: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  songText: {
    flex: 1,
    minWidth: 0,
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

  actionButton: {
    width: 36,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  removeIcon: {
    color: "#ff477e",
    fontSize: 18,
  },

  dragHandle: {
    width: 38,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  dragIcon: {
    color: "#00d9ff",
    fontSize: 30,
    fontWeight: "700",
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
