// src/screens/LibraryScreen.jsx

import { useEffect, useMemo, useCallback } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert, StyleSheet } from "react-native";
import useMusicStore from "../store/useMusicStore";
import SongItem from "../components/SongItem";
import SearchBar from "../components/SearchBar";
import LibraryTabs from "../components/LibraryTabs";
import colors from "../theme/colors";
import { playSong } from "../services/audioService";

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

    // Include artist in album identity to avoid
    // merging albums with the same title.
    const key =
      type === "Artists"
        ? artist
        : `${artist}\u0000${album}`;

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

  return Array.from(groups.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export default function LibraryScreen() {
  const songs = useMusicStore((s) => s.songs);
  const search = useMusicStore((s) => s.search);
  const activeTab = useMusicStore((s) => s.activeTab);
  const selectedCollection = useMusicStore(
    (s) => s.selectedCollection
  );

  const loading = useMusicStore((s) => s.loading);
  const error = useMusicStore((s) => s.error);
  const permissionGranted = useMusicStore(
    (s) => s.permissionGranted
  );

  const loadSongs = useMusicStore((s) => s.loadSongs);
  const selectCollection = useMusicStore(
    (s) => s.selectCollection
  );
  const clearCollection = useMusicStore(
    (s) => s.clearCollection
  );

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  const query = search.trim().toLowerCase();

  const collections = useMemo(() => {
    if (activeTab === "Songs") return [];

    return groupSongs(songs, activeTab);
  }, [songs, activeTab]);

  const collectionSongs = useMemo(() => {
    if (!selectedCollection) return songs;

    if (selectedCollection.type === "Artists") {
      return songs.filter(
        (song) =>
          getArtist(song) === selectedCollection.name
      );
    }

    return songs.filter(
      (song) =>
        getAlbum(song) === selectedCollection.name &&
        getArtist(song) === selectedCollection.artist
    );
  }, [songs, selectedCollection]);

  const items = useMemo(() => {
    if (activeTab === "Songs" || selectedCollection) {
      return collectionSongs.filter((song) =>
        [song.title, song.artist, song.album].some(
          (value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(query)
        )
      );
    }

    return collections.filter((collection) =>
      [collection.name, collection.artist].some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query)
      )
    );
  }, [
    activeTab,
    selectedCollection,
    collectionSongs,
    collections,
    query,
  ]);

  const showingSongs =
    activeTab === "Songs" || !!selectedCollection;

  const handlePlaySong = useCallback(
    async (song) => {
      try {
        await playSong(song, collectionSongs);
      } catch (err) {
        console.error("Playback error:", err);

        Alert.alert(
          "Unable to play song",
          err?.message ?? "An unexpected error occurred."
        );
      }
    },
    [collectionSongs]
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (showingSongs) {
        return (
          <SongItem
            song={item}
            onPress={() => handlePlaySong(item)}
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
      selectCollection,
      activeTab,
    ]
  );

  const emptyMessage =
    permissionGranted === false
      ? "Music permission is required."
      : error
        ? error
        : query
          ? "No matching results."
          : songs.length === 0
            ? "No music found on your device."
            : "No songs found.";

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
          onPress={loadSongs}
          disabled={loading}
          style={styles.refreshButton}
        >
          <Text style={styles.refreshText}>
            Refresh
          </Text>
        </Pressable>
      </View>

      <LibraryTabs />

      {selectedCollection && (
        <View style={styles.collectionHeader}>
          <Pressable onPress={clearCollection}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>

          <Text
            style={styles.collectionTitle}
            numberOfLines={2}
          >
            {selectedCollection.name}
          </Text>

          <Text style={styles.subtitle}>
            {collectionSongs.length} songs
          </Text>
        </View>
      )}

      <SearchBar />

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
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: colors.text,
    fontWeight: "700",
  },
});