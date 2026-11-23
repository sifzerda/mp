// src/components/DraggablePlaylistSongs.jsx

import { memo, useCallback, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { GripVertical } from "lucide-react-native";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import SongItem from "./SongItem";
import usePlaylistStore from "../store/usePlaylistStore";
import useThemedStyles from "../theme/useThemedStyles";

const keyExtractor = (item) => String(item.id);

const PlaylistSongRow = memo(function PlaylistSongRow({
  song,
  drag,
  isActive,
  searchActive,
  onPlaySong,
  onAddToPlaylist,
  onRemoveSong,
  onPlayNext,
  onAddToQueue,
}) {
  const { colors, styles } = useThemedStyles(createStyles);
  const handlePlay = useCallback(() => onPlaySong(song), [onPlaySong, song]);
  const handleAdd = useCallback(() => onAddToPlaylist?.(song), [onAddToPlaylist, song]);
  const handleRemove = useCallback(() => onRemoveSong?.(song), [onRemoveSong, song]);
  const handleNext = useCallback(() => onPlayNext?.(song), [onPlayNext, song]);
  const handleQueue = useCallback(() => onAddToQueue?.(song), [onAddToQueue, song]);

  return (
    <ScaleDecorator>
      <View
        style={[
          styles.row,
          isActive && styles.activeRow,
        ]}
      >
        <View style={styles.song}>
          <SongItem
            song={song}
            onPress={handlePlay}
            onAddToPlaylist={onAddToPlaylist ? handleAdd : undefined}
            onRemoveFromPlaylist={onRemoveSong ? handleRemove : undefined}
            onPlayNext={onPlayNext ? handleNext : undefined}
            onAddToQueue={onAddToQueue ? handleQueue : undefined}
          />
        </View>

        <Pressable
          onLongPress={searchActive ? undefined : drag}
          delayLongPress={180}
          disabled={isActive || searchActive}
          style={[styles.dragHandle, searchActive && styles.disabledHandle]}
          accessibilityRole="button"
          accessibilityLabel={`Reorder ${song.title}`}
          accessibilityHint="Long press and drag to reorder"
        >
          <GripVertical
            size={24}
            color={colors.primary}
            strokeWidth={2}
          />
        </Pressable>
      </View>
    </ScaleDecorator>
  );
});

const EmptyPlaylist = memo(function EmptyPlaylist({ searchActive }) {
  const { styles } = useThemedStyles(createStyles);

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchActive ? "No matching or available songs." : "This playlist is empty."}
      </Text>

      {!searchActive && (
        <Text style={styles.emptyText}>
          Add songs using the plus button in your library.
        </Text>
      )}
    </View>
  );
});

function DraggablePlaylistSongs({
  playlist,
  songs,
  onPlaySong,
  onAddToPlaylist,
  onRemoveSong,
  onPlayNext,
  onAddToQueue,
  searchActive = false,
}) {
  const { styles } = useThemedStyles(createStyles);
  const reorderSongs = usePlaylistStore((s) => s.reorderSongs);
  const dragSnapshot = useRef(null);
  const savingRef = useRef(false);

  const handleDragBegin = useCallback(() => { dragSnapshot.current = playlist.songIds }, [playlist.songIds]);

  const handleDragEnd = useCallback(
    async ({ data, from, to }) => {
      const expectedSongIds = dragSnapshot.current;

      dragSnapshot.current = null;

      if (
        searchActive ||
        from === to ||
        !expectedSongIds ||
        savingRef.current
      ) {
        return;
      }

      savingRef.current = true;

      try {
        await reorderSongs(
          playlist.id,
          data.map((song) => String(song.id)),
          expectedSongIds
        );
      } catch (error) {
        Alert.alert("Reorder failed", error?.message || "Unable to reorder playlist songs.");
      } finally {
        savingRef.current = false;
      }
    },
    [playlist.id, searchActive, reorderSongs]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }) => (
      <PlaylistSongRow
        song={item}
        drag={drag}
        isActive={isActive}
        searchActive={searchActive}
        onPlaySong={onPlaySong}
        onAddToPlaylist={onAddToPlaylist}
        onRemoveSong={onRemoveSong}
        onPlayNext={onPlayNext}
        onAddToQueue={onAddToQueue}
      />
    ),
    [
      searchActive,
      onPlaySong,
      onAddToPlaylist,
      onRemoveSong,
      onPlayNext,
      onAddToQueue,
    ]
  );

  const renderEmpty = useCallback(() => (<EmptyPlaylist searchActive={searchActive} />), [searchActive]);

  return (
    <DraggableFlatList
      data={songs}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onDragBegin={handleDragBegin}
      onDragEnd={handleDragEnd}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      activationDistance={10}
      autoscrollThreshold={70}
      autoscrollSpeed={80}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      updateCellsBatchingPeriod={50}
      windowSize={7}
      removeClippedSubviews={false}
      contentContainerStyle={styles.content}
    />
  );
}

export default memo(DraggablePlaylistSongs);

/* -------------------- STYLES -------------------- */

const createStyles = (colors) =>
  StyleSheet.create({
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