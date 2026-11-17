// src/components/DraggablePlaylistSongs.jsx

import { useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import SongItem from "./SongItem";
import usePlaylistStore from "../store/usePlaylistStore";
import useThemedStyles from "../theme/useThemedStyles";

export default function DraggablePlaylistSongs({
  playlist,
  songs,
  onPlaySong,
  onAddToPlaylist,
  onRemoveSong,
  onPlayNext,
  onAddToQueue,
  searchActive = false,
}) {
  const reorderSongs = usePlaylistStore((s) => s.reorderSongs);
  const { styles } = useThemedStyles(createStyles);
  // Reorder songs within the saved playlist.
  const handleDragEnd = useCallback(
    async ({ data, from, to }) => {
      if (searchActive || from === to) return;

      try {
        const orderedIds = data.map((song) => String(song.id));
        await reorderSongs(playlist.id, orderedIds);
      } catch (error) {
        console.error("Playlist reorder error:", error);

        Alert.alert(
          "Reorder failed",
          error?.message ||
          "Unable to reorder playlist songs."
        );
      }
    },
    [playlist.id, reorderSongs, searchActive]
  );

  // Add song immediately after the current track.
  const handlePlayNext = useCallback(
    async (song) => {
      if (!onPlayNext) return;

      try {
        await onPlayNext(song);
      } catch (error) {
        console.error("Play Next error:", error);

        Alert.alert(
          "Queue error",
          error?.message ||
          "Unable to play this song next."
        );
      }
    },
    [onPlayNext]
  );

  // Append song to the playback queue.
  const handleAddToQueue = useCallback(
    async (song) => {
      if (!onAddToQueue) return;

      try {
        await onAddToQueue(song);
      } catch (error) {
        console.error("Add to Queue error:", error);

        Alert.alert(
          "Queue error",
          error?.message ||
          "Unable to add this song to the queue."
        );
      }
    },
    [onAddToQueue]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }) => (
      <ScaleDecorator>
        <View
          style={[
            styles.row,
            isActive && styles.activeRow,
          ]}
        >
          <View style={styles.song}>
            <SongItem
              song={item}
              onPress={() => onPlaySong(item)}
              onAddToPlaylist={
                onAddToPlaylist
                  ? () => onAddToPlaylist(item)
                  : undefined
              }
              onRemoveFromPlaylist={
                onRemoveSong
                  ? () => onRemoveSong(item)
                  : undefined
              }
              onPlayNext={
                onPlayNext
                  ? () => handlePlayNext(item)
                  : undefined
              }
              onAddToQueue={
                onAddToQueue
                  ? () => handleAddToQueue(item)
                  : undefined
              }
            />
          </View>

          {/* Drag handle for playlist ordering */}
          <Pressable
            onLongPress={
              searchActive ? undefined : drag
            }
            delayLongPress={180}
            disabled={isActive || searchActive}
            style={[
              styles.dragHandle,
              searchActive && styles.disabledHandle,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Reorder ${item.title}`}
            accessibilityHint="Long press and drag to reorder"
          >
            <Text style={styles.dragIcon}>≡</Text>
          </Pressable>
        </View>
      </ScaleDecorator>
    ),
    [
      onPlaySong,
      onAddToPlaylist,
      onRemoveSong,
      onPlayNext,
      onAddToQueue,
      handlePlayNext,
      handleAddToQueue,
      searchActive,
      styles,
    ]
  );

  return (
    <DraggableFlatList
      data={songs}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      onDragEnd={handleDragEnd}
      showsVerticalScrollIndicator={false}
      activationDistance={10}
      autoscrollThreshold={70}
      autoscrollSpeed={80}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchActive
              ? "No matching songs."
              : "This playlist is empty."}
          </Text>

          {!searchActive && (
            <Text style={styles.emptyText}>
              Add songs using the ＋ button in your library.
            </Text>
          )}
        </View>
      }
    />
  );
}

const createStyles = (colors) => StyleSheet.create({
  content: {
    paddingBottom: 30,
    flexGrow: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
  },

  activeRow: {
    backgroundColor: colors.surfaceAlt,
    elevation: 8,
  },

  song: {
    flex: 1,
    minWidth: 0,
  },

  dragHandle: {
    width: 32,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledHandle: {
    opacity: 0.3,
  },

  dragIcon: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    gap: 8,
  },

  emptyText: {
    color: colors.muted,
    textAlign: "center",
  },
});
