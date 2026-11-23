// src/screens/PlaylistDetailScreen.jsx

import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";

import { Text, Pressable, Alert, StyleSheet } from "react-native";
import { Play } from "lucide-react-native";
import LibraryLayout from "../components/LibraryLayout";
import SearchBar from "../components/SearchBar";
import PlaylistPicker from "../components/PlaylistPicker";
import DraggablePlaylistSongs from "../components/DraggablePlaylistSongs";
import usePlaylistStore from "../store/usePlaylistStore";
import useMusicStore from "../store/useMusicStore";
import useSongActions from "../hooks/useSongActions";
import useThemedStyles from "../theme/useThemedStyles";
import { filterSongs, EMPTY_SONG_IDS, resolvePlaylistSongs } from "../utils/musicUtils";

function PlaylistDetailScreen({ route }) {
  const { playlistId } = route.params;
  const { colors, styles } = useThemedStyles(createStyles);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const songsById = useMusicStore((s) => s.libraryIndex.songsById);
  const playlist = usePlaylistStore((s) => s.playlistsById.get(playlistId));
  const removeSong = usePlaylistStore((s) => s.removeSong);
  const songIds = playlist?.songIds ?? EMPTY_SONG_IDS;
  const playlistName = playlist?.name;
  const playlistSongs = useMemo(() => resolvePlaylistSongs(songIds, songsById), [songIds, songsById]);
  const items = useMemo(() => filterSongs(playlistSongs, deferredSearch), [playlistSongs, deferredSearch]);
  const searchActive = search.trim().length > 0 || deferredSearch.trim().length > 0 || playlistSongs.length !== songIds.length;

  const {
    pickerSong,
    setPickerSong,
    closePicker,
    handlePlaySong,
    handlePlayNext,
    handleAddToQueue,
  } = useSongActions(playlistSongs);

  const handlePlayPlaylist = useCallback(() => {
    if (playlistSongs.length) {
      handlePlaySong(playlistSongs[0]);
    }
  }, [playlistSongs, handlePlaySong]);

  const handleRemoveSong = useCallback(
    (song) => {
      if (!playlistName) return;

      Alert.alert(
        "Remove song?",
        `Remove "${song.title}" from "${playlistName}"?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                await removeSong(playlistId, song.id);
              } catch {
                Alert.alert("Error", "Unable to save playlist changes.");
              }
            },
          },
        ]
      );
    },
    [ playlistId, playlistName, removeSong ]
  );

  if (!playlist) {
    return (
      <LibraryLayout
        title="Playlist"
        showBack
        showRefresh={false}
      >
        <Text style={styles.empty}>
          This playlist no longer exists.
        </Text>
      </LibraryLayout>
    );
  }

  return (
    <LibraryLayout
      title={playlist.name}
      subtitle={`${playlistSongs.length} songs`}
      showBack
      showRefresh={false}
    >
      {playlistSongs.length > 0 && (
        <Pressable
          style={styles.playButton}
          onPress={handlePlayPlaylist}
          accessibilityRole="button"
          accessibilityLabel="Play playlist"
        >
          <Play
            size={19}
            color={colors.onPrimary}
            fill={colors.onPrimary}
          />

          <Text style={styles.playText}>
            Play Playlist
          </Text>
        </Pressable>
      )}

      <SearchBar
        value={search}
        onChangeText={setSearch}
      />

      <DraggablePlaylistSongs
        playlist={playlist}
        songs={items}
        onPlaySong={handlePlaySong}
        onAddToPlaylist={setPickerSong}
        onRemoveSong={handleRemoveSong}
        onPlayNext={handlePlayNext}
        onAddToQueue={handleAddToQueue}
        searchActive={searchActive}
      />

      <PlaylistPicker
        visible={!!pickerSong}
        song={pickerSong}
        onClose={closePicker}
      />
    </LibraryLayout>
  );
}

export default memo(PlaylistDetailScreen);

const createStyles = (colors) =>
  StyleSheet.create({
    playButton: {
      flexDirection: "row",
      alignSelf: "flex-start",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
      marginBottom: 20,
    },

    playText: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: "700",
    },

    empty: {
      color: colors.muted,
      textAlign: "center",
      marginTop: 30,
    },
  });