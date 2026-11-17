// src/screens/LibraryScreen.jsx

import { useEffect, useMemo, useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, StyleSheet } from "react-native";

import useMusicStore from "../store/useMusicStore";
import useFavoritesStore from "../store/useFavoritesStore";
import usePlaylistStore from "../store/usePlaylistStore";
import usePlayerStore from "../store/usePlayerStore";

import SongItem from "../components/SongItem";
import SearchBar from "../components/SearchBar";
import LibraryTabs from "../components/LibraryTabs";
import PlaylistManager from "../components/PlaylistManager";
import PlaylistPicker from "../components/PlaylistPicker";
import DraggablePlaylistSongs from "../components/DraggablePlaylistSongs";

import useThemedStyles from "../theme/useThemedStyles";
import { playSong, addSongToQueue, playSongNext } from "../services/audioService";

const UNKNOWN_ARTIST = "Unknown artist";
const UNKNOWN_ALBUM = "Unknown album";

function getArtist(song) {
  return String(song.artist || UNKNOWN_ARTIST).trim();
}

function getAlbum(song) {
  return String(song.album || UNKNOWN_ALBUM).trim();
}

function groupSongs(songs, type) {
  const groups = new Map();

  for (const song of songs) {
    const artist = getArtist(song);
    const album = getAlbum(song);
    const name = type === "Artists" ? artist : album;
    const key = type === "Artists" ? artist : `${artist}\u0000${album}`;

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        name,
        artist: type === "Albums" ? artist : null,
        songs: [],
      });
    }

    groups.get(key).songs.push(song);
  }

  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default function LibraryScreen() {
  const { colors, styles } = useThemedStyles(createStyles);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [pickerSong, setPickerSong] = useState(null);
  const songs = useMusicStore((s) => s.songs);
  const search = useMusicStore((s) => s.search);
  const activeTab = useMusicStore((s) => s.activeTab);
  const selectedCollection = useMusicStore((s) => s.selectedCollection);
  const loading = useMusicStore((s) => s.loading);
  const error = useMusicStore((s) => s.error);
  const permissionGranted = useMusicStore((s) => s.permissionGranted);
  const loadSongs = useMusicStore((s) => s.loadSongs);
  const selectCollection = useMusicStore((s) => s.selectCollection);
  const clearCollection = useMusicStore((s) => s.clearCollection);
  const favorites = useFavoritesStore((s) => s.favorites);
  const loadFavorites = useFavoritesStore((s) => s.loadFavorites);
  const playlists = usePlaylistStore((s) => s.playlists);
  const loadPlaylists = usePlaylistStore((s) => s.loadPlaylists);
  const removeSong = usePlaylistStore((s) => s.removeSong);
  const openSettings = usePlayerStore((s) => s.openSettings);

  useEffect(() => {
    loadSongs();
    loadFavorites();
    loadPlaylists();
  }, [loadSongs, loadFavorites, loadPlaylists]);

  const selectedPlaylist = useMemo(() => playlists.find((playlist) => playlist.id === selectedPlaylistId) || null, [playlists, selectedPlaylistId]);

  const query = search.trim().toLowerCase();

  const isPlaylistTab = activeTab === "Playlists";
  const isPlaylistDetail = isPlaylistTab && !!selectedPlaylist;

  const showingSongs =
    activeTab === "Songs" ||
    activeTab === "Favorites" ||
    isPlaylistDetail ||
    (!!selectedCollection && !isPlaylistTab);

  const collections = useMemo(() => {
    if (
      activeTab === "Artists" ||
      activeTab === "Albums"
    ) {
      return groupSongs(songs, activeTab);
    }

    return [];
  }, [songs, activeTab]);

  const collectionSongs = useMemo(() => {
    if (activeTab === "Favorites") {
      const ids = new Set(favorites);
      return songs.filter((song) => ids.has(String(song.id)));
    }

    if (activeTab === "Playlists") {
      if (!selectedPlaylist) return [];

      const songMap = new Map(songs.map((song) => [String(song.id), song]));

      return selectedPlaylist.songIds
        .map((id) => songMap.get(String(id)))
        .filter(Boolean);
    }

    if (!selectedCollection) return songs;

    if (selectedCollection.type === "Artists") {
      return songs.filter(
        (song) => getArtist(song) === selectedCollection.name);
    }

    if (selectedCollection.type === "Albums") {
      return songs.filter((song) =>
        getAlbum(song) === selectedCollection.name &&
        getArtist(song) === selectedCollection.artist
      );
    }

    return songs;
  }, [
    songs,
    activeTab,
    selectedCollection,
    selectedPlaylist,
    favorites,
  ]);

  const items = useMemo(() => {
    if (showingSongs) {
      return collectionSongs.filter((song) =>
        [song.title, song.artist, song.album].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query)
        )
      );
    }

    return collections.filter((collection) =>
      [collection.name, collection.artist].some(
        (value) => String(value ?? "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [showingSongs, collectionSongs, collections, query]);

  const handlePlaySong = useCallback(
    async (song) => {
      try {
        await playSong(song, collectionSongs);
      } catch (err) {
        console.error("Playback error:", err);

        Alert.alert("Unable to play song", err?.message || "An unexpected error occurred.");
      }
    },
    [collectionSongs]
  );

  const handleRemoveSong = useCallback(
    (song) => {
      if (!selectedPlaylist) return;

      Alert.alert(
        "Remove song?",
        `Remove "${song.title}" from "${selectedPlaylist.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                await removeSong(
                  selectedPlaylist.id,
                  song.id
                );
              } catch (err) {
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
    [selectedPlaylist, removeSong]
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (showingSongs) {
        return (
          <SongItem
            song={item}
            onPress={() => handlePlaySong(item)}
            onAddToPlaylist={() => setPickerSong(item)}
            onRemoveFromPlaylist={
              isPlaylistDetail
                ? () => handleRemoveSong(item)
                : undefined
            }
            onPlayNext={async () => {
              try {
                await playSongNext(item);
              } catch (error) {
                Alert.alert("Queue error", error.message);
              }
            }}

            onAddToQueue={async () => {
              try {
                await addSongToQueue(item);
              } catch (error) {
                Alert.alert("Queue error", error.message);
              }
            }}
          />
        );
      }

      return (
        <Pressable
          style={styles.collection}
          onPress={() =>
            selectCollection(
              activeTab,
              item.name,
              item.artist
            )
          }
        >
          <View style={styles.collectionIcon}>
            <Text style={styles.collectionSymbol}>
              {activeTab === "Artists" ? "♫" : "▣"}
            </Text>
          </View>

          <View style={styles.collectionDetails}>
            <Text
              style={styles.collectionName}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text style={styles.collectionSubtitle}>
              {activeTab === "Albums"
                ? `${item.artist} · ${item.songs.length} songs`
                : `${item.songs.length} songs`}
            </Text>
          </View>

          <Text style={styles.chevron}>›</Text>
        </Pressable>
      );
    },
    [
      showingSongs,
      handlePlaySong,
      isPlaylistDetail,
      handleRemoveSong,
      selectCollection,
      activeTab,
      styles,
    ]
  );

  const emptyMessage =
    permissionGranted === false
      ? "Music permission is required."
      : error
        ? error
        : query
          ? "No matching results."
          : activeTab === "Favorites"
            ? "No favorite songs yet."
            : isPlaylistDetail
              ? "This playlist is empty. Add songs using ＋."
              : songs.length === 0
                ? "No music found on your device."
                : "No songs found.";

  const showPlaylistManager = isPlaylistTab && !selectedPlaylist;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.heading}>My Music</Text>

          <Text style={styles.subtitle}>
            {songs.length} songs on your device
          </Text>
        </View>

        <Pressable
          onPress={openSettings}
          style={styles.settingsButton}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>

        <Pressable
          onPress={loadSongs}
          disabled={loading}
          style={styles.refreshButton}
        >
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      <LibraryTabs />

      {/* Selected playlist header */}
      {isPlaylistDetail && (
        <View style={styles.collectionHeader}>
          <Pressable
            onPress={() => setSelectedPlaylistId(null)}
          >
            <Text style={styles.back}>
              ‹ Back to Playlists
            </Text>
          </Pressable>

          <Text style={styles.collectionTitle}>
            {selectedPlaylist.name}
          </Text>

          <Text style={styles.subtitle}>
            {collectionSongs.length} songs
          </Text>

          {collectionSongs.length > 0 && (
            <Pressable
              style={styles.playAllButton}
              onPress={() =>
                handlePlaySong(collectionSongs[0])
              }
            >
              <Text style={styles.playAllText}>
                ▶ Play Playlist
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Artists / Albums collection header */}
      {!isPlaylistTab && selectedCollection && (
        <View style={styles.collectionHeader}>
          <Pressable onPress={clearCollection}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>

          <Text style={styles.collectionTitle}>
            {selectedCollection.name}
          </Text>

          <Text style={styles.subtitle}>
            {collectionSongs.length} songs
          </Text>
        </View>
      )}

      {/* Search */}
      {!showPlaylistManager && <SearchBar />}

      {/* Main content */}
      {loading && songs.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.message}>
            Scanning your music...
          </Text>
        </View>
      ) : showPlaylistManager ? (
        <PlaylistManager
          onSelect={(playlist) =>
            setSelectedPlaylistId(playlist.id)
          }
        />
      ) : isPlaylistDetail ? (
        <DraggablePlaylistSongs
          playlist={selectedPlaylist}
          songs={items}
          onPlaySong={handlePlaySong}
          onAddToPlaylist={setPickerSong}
          onRemoveSong={handleRemoveSong}
          onPlayNext={playSongNext}
          onAddToQueue={addSongToQueue}
          searchActive={query.length > 0}
        />
      ) : (
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
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.message}>
                {emptyMessage}
              </Text>

              {permissionGranted === false && (
                <Pressable
                  style={styles.retryButton}
                  onPress={loadSongs}
                >
                  <Text style={styles.retryText}>
                    Try Again
                  </Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}

      {/* Add song to playlist modal */}
      <PlaylistPicker
        visible={!!pickerSong}
        song={pickerSong}
        onClose={() => setPickerSong(null)}
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
  },
  heading: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 5,
  },
  refreshButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  refreshText: {
    color: colors.primary,
    fontWeight: "600",
  },
  settingsButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: {
    fontSize: 28,
    color: colors.primary,
  },
  collectionHeader: {
    marginBottom: 16,
  },
  back: {
    color: colors.primary,
    fontSize: 16,
    marginBottom: 10,
  },
  collectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
  },
  collection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  collectionIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  collectionSymbol: {
    color: colors.primary,
    fontSize: 26,
  },
  collectionDetails: {
    flex: 1,
  },
  collectionName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  collectionSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 5,
  },
  chevron: {
    color: colors.muted,
    fontSize: 28,
    marginLeft: 10,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
    gap: 15,
  },
  message: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 15,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: colors.onPrimary,
    fontWeight: "700",
  },
  playAllButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 14,
  },
  playAllText: {
    color: colors.onPrimary,
    fontWeight: "700",
  },
});