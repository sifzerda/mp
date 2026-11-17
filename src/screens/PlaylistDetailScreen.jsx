// src/screens/PlaylistDetailScreen.jsx

import { useCallback, useMemo, useState } from "react";

import {
  Text,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";

import { Play } from "lucide-react-native";

import LibraryLayout from "../components/LibraryLayout";
import SearchBar from "../components/SearchBar";
import PlaylistPicker from "../components/PlaylistPicker";
import DraggablePlaylistSongs from "../components/DraggablePlaylistSongs";

import usePlaylistStore from "../store/usePlaylistStore";
import useMusicStore from "../store/useMusicStore";

import useSongActions from "../hooks/useSongActions";
import useThemedStyles from "../theme/useThemedStyles";

import { filterSongs } from "../utils/musicCollections";

export default function PlaylistDetailScreen({ route }) {
  const { playlistId } = route.params;

  const { colors, styles } =
    useThemedStyles(createStyles);

  const [search, setSearch] = useState("");

  const songs = useMusicStore((s) => s.songs);

  const playlist = usePlaylistStore((s) =>
    s.playlists.find(
      (item) => item.id === playlistId
    )
  );

  const removeSong = usePlaylistStore((s) => s.removeSong);

  const playlistSongs = useMemo(() => {
    if (!playlist) return [];

    const songMap = new Map(
      songs.map((song) => [
        String(song.id),
        song,
      ])
    );

    return playlist.songIds
      .map((id) => songMap.get(String(id)))
      .filter(Boolean);
  }, [songs, playlist]);

  const items = useMemo(
    () => filterSongs(playlistSongs, search),
    [playlistSongs, search]
  );

  const {
    pickerSong,
    setPickerSong,
    closePicker,
    handlePlaySong,
    handlePlayNext,
    handleAddToQueue,
  } = useSongActions(playlistSongs);

  const handleRemoveSong = useCallback(
    (song) => {
      if (!playlist) return;

      Alert.alert(
        "Remove song?",
        `Remove "${song.title}" from "${playlist.name}"?`,
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
                await removeSong(
                  playlist.id,
                  song.id
                );
              } catch (error) {
                Alert.alert(
                  "Error",
                  "Unable to remove song from playlist."
                );
              }
            },
          },
        ]
      );
    },
    [playlist, removeSong]
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
          onPress={() =>
            handlePlaySong(playlistSongs[0])
          }
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
        searchActive={
          search.trim().length > 0 ||
          playlistSongs.length !== playlist.songIds.length
        }
      />

      <PlaylistPicker
        visible={!!pickerSong}
        song={pickerSong}
        onClose={closePicker}
      />
    </LibraryLayout>
  );
}

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