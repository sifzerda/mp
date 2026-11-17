// src/components/SongList.jsx
// shared by Songs, Favorites, Artist Details and Album Details.

import { useCallback, useMemo, useState } from "react";

import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import SongItem from "./SongItem";
import SearchBar from "./SearchBar";
import PlaylistPicker from "./PlaylistPicker";

import useMusicStore from "../store/useMusicStore";
import useThemedStyles from "../theme/useThemedStyles";
import useSongActions from "../hooks/useSongActions";

import { filterSongs } from "../utils/musicCollections";

export default function SongList({
  songs,
  emptyMessage = "No songs found.",
}) {
  const { colors, styles } =
    useThemedStyles(createStyles);

  const [search, setSearch] = useState("");

  const loading = useMusicStore((s) => s.loading);
  const loadSongs = useMusicStore((s) => s.loadSongs);
  const error = useMusicStore((s) => s.error);
  const permissionGranted = useMusicStore(
    (s) => s.permissionGranted
  );

  const {
    pickerSong,
    setPickerSong,
    closePicker,
    handlePlaySong,
    handlePlayNext,
    handleAddToQueue,
  } = useSongActions(songs);

  const items = useMemo(
    () => filterSongs(songs, search),
    [songs, search]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <SongItem
        song={item}
        onPress={() => handlePlaySong(item)}
        onAddToPlaylist={() => setPickerSong(item)}
        onPlayNext={() => handlePlayNext(item)}
        onAddToQueue={() => handleAddToQueue(item)}
      />
    ),
    [
      handlePlaySong,
      setPickerSong,
      handlePlayNext,
      handleAddToQueue,
    ]
  );

  if (loading && songs.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.message}>
          Scanning your music...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={loadSongs}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.message}>
              {permissionGranted === false
                ? "Music permission is required."
                : error
                  ? error
                  : search.trim()
                    ? "No matching songs."
                    : emptyMessage}
            </Text>

            {(permissionGranted === false || error) && (
              <Pressable
                onPress={loadSongs}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>
                  Try Again
                </Text>
              </Pressable>
            )}
          </View>
        }
      />

      <PlaylistPicker
        visible={!!pickerSong}
        song={pickerSong}
        onClose={closePicker}
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    listContent: {
      flexGrow: 1,
      paddingBottom: 15,
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 25,
      gap: 15,
    },

    message: {
      color: colors.muted,
      fontSize: 15,
      textAlign: "center",
    },

    retryButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },

    retryText: {
      color: colors.onPrimary,
      fontWeight: "700",
    },
  });