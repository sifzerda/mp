// src/components/SongList.jsx
// shared by Songs, Favorites, Artist Details and Album Details.

import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";

import {
  View,
  FlatList,
  StyleSheet,
} from "react-native";

import SongItem from "./SongItem";
import SearchBar from "./SearchBar";
import PlaylistPicker from "./PlaylistPicker";
import LibraryEmptyState from "./LibraryEmptyState";

import useMusicStore from "../store/useMusicStore";
import useSongActions from "../hooks/useSongActions";

import { filterSongs } from "../utils/musicCollections";

/* -------------------- LIST HELPERS -------------------- */

const keyExtractor = (item) => String(item.id);

/* -------------------- MEMOIZED ROW -------------------- */

const SongRow = memo(function SongRow({
  song,
  onPlay,
  onAddToPlaylist,
  onPlayNext,
  onAddToQueue,
}) {
  const handlePlay = useCallback(
    () => onPlay(song),
    [song, onPlay]
  );

  const handleAddToPlaylist = useCallback(
    () => onAddToPlaylist(song),
    [song, onAddToPlaylist]
  );

  const handlePlayNext = useCallback(
    () => onPlayNext(song),
    [song, onPlayNext]
  );

  const handleAddToQueue = useCallback(
    () => onAddToQueue(song),
    [song, onAddToQueue]
  );

  return (
    <SongItem
      song={song}
      onPress={handlePlay}
      onAddToPlaylist={handleAddToPlaylist}
      onPlayNext={handlePlayNext}
      onAddToQueue={handleAddToQueue}
    />
  );
});

/* -------------------- SONG LIST -------------------- */

function SongList({
  songs,
  emptyMessage = "No songs found.",
}) {
  const [search, setSearch] = useState("");

  const deferredSearch = useDeferredValue(search);

  const loading = useMusicStore((s) => s.loading);
  const loadSongs = useMusicStore((s) => s.loadSongs);

  const {
    pickerSong,
    setPickerSong,
    closePicker,
    handlePlaySong,
    handlePlayNext,
    handleAddToQueue,
  } = useSongActions(songs);

  const items = useMemo(
    () => filterSongs(songs, deferredSearch),
    [songs, deferredSearch]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <SongRow
        song={item}
        onPlay={handlePlaySong}
        onAddToPlaylist={setPickerSong}
        onPlayNext={handlePlayNext}
        onAddToQueue={handleAddToQueue}
      />
    ),
    [
      handlePlaySong,
      setPickerSong,
      handlePlayNext,
      handleAddToQueue,
    ]
  );

  const emptyState = useMemo(
    () => (
      <LibraryEmptyState
        message={
          deferredSearch.trim()
            ? "No matching songs."
            : emptyMessage
        }
      />
    ),
    [deferredSearch, emptyMessage]
  );

  return (
    <View style={styles.container}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={loadSongs}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={emptyState}
      />

      {pickerSong && (
        <PlaylistPicker
          visible
          song={pickerSong}
          onClose={closePicker}
        />
      )}
    </View>
  );
}

export default memo(SongList);

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  listContent: {
    flexGrow: 1,
    paddingBottom: 15,
  },
});