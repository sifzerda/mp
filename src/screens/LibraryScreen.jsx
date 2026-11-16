// src/screens/LibraryScreen.jsx

import { useEffect, useMemo } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import useMusicStore from "../store/useMusicStore";
import SongItem from "../components/SongItem";
import SearchBar from "../components/SearchBar";
import LibraryTabs from "../components/LibraryTabs";
import colors from "../theme/colors";


export default function LibraryScreen() {
  const songs = useMusicStore((s) => s.songs);
  const search = useMusicStore((s) => s.search);
  const activeTab = useMusicStore((s) => s.activeTab);
  const loading = useMusicStore((s) => s.loading);
  const error = useMusicStore((s) => s.error);
  const permissionGranted = useMusicStore((s) => s.permissionGranted);
  const loadSongs = useMusicStore((s) => s.loadSongs);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  const filteredSongs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return songs;

    return songs.filter((song) =>
      [song.title, song.artist, song.album]
        .some((value) =>
          value.toLowerCase().includes(query)
        )
    );
  }, [songs, search]);

  const items = useMemo(() => {
    if (activeTab === "Songs") {
      return filteredSongs;
    }

    // Artist/album metadata will be implemented
    // in the next stage.
    return [];
  }, [activeTab, filteredSongs]);

  const emptyMessage =
    permissionGranted === false
      ? "Music permission is required."
      : error
        ? error
        : activeTab !== "Songs"
          ? "Artist and album browsing is coming next."
          : search
            ? "No matching songs."
            : "No music found on your device.";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>
            My Music
          </Text>

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

      <SearchBar />
      <LibraryTabs />

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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SongItem song={item} />
          )}
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
