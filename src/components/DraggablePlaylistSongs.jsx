// src/components/DraggablePlaylistSongs.jsx

import { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";

import SongItem from "./SongItem";
import usePlaylistStore from "../store/usePlaylistStore";
import colors from "../theme/colors";

export default function DraggablePlaylistSongs({
  playlist,
  songs,
  onPlaySong,
  onAddToPlaylist,
  onRemoveSong,
  searchActive = false,
}) {
  const reorderSongs = usePlaylistStore((s) => s.reorderSongs);

  const handleDragEnd = useCallback(({ data }) => {
      const orderedIds = data.map((song) => String(song.id));
      reorderSongs(playlist.id, orderedIds).catch(console.error);
    },
    [playlist.id, reorderSongs]
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
              onAddToPlaylist={() => onAddToPlaylist(item)
              }
              onRemoveFromPlaylist={() => onRemoveSong(item)
              }
            />
          </View>

          <Pressable
            onLongPress={searchActive ? undefined : drag}
            delayLongPress={180}
            disabled={isActive || searchActive}
            style={styles.dragHandle}
            accessibilityRole="button"
            accessibilityLabel={`Reorder ${item.title}`}
          >
            <Text style={styles.dragIcon}>≡</Text>
          </Pressable>
        </View>
      </ScaleDecorator>
    ),
    [onPlaySong, onAddToPlaylist, onRemoveSong]
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
            This playlist is empty.
          </Text>
          <Text style={styles.emptyText}>
            Add songs using the ＋ button in your library.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
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
