// src/screens/AlbumDetailScreen.jsx

import { useMemo } from "react";
import { View, StyleSheet } from "react-native";

import LibraryLayout from "../components/LibraryLayout";
import AlbumArtwork from "../components/AlbumArtwork";
import SongList from "../components/SongList";

import useMusicStore from "../store/useMusicStore";

import {
  getArtist,
  getAlbum,
} from "../utils/musicCollections";

export default function AlbumDetailScreen({ route }) {
  const { album, artist } = route.params;

  const songs = useMusicStore((s) => s.songs);

  const albumSongs = useMemo(
    () =>
      songs.filter(
        (song) =>
          getArtist(song) === artist &&
          getAlbum(song) === album
      ),
    [songs, album, artist]
  );

  return (
    <LibraryLayout
      title={album}
      subtitle={`${artist} · ${albumSongs.length} songs`}
      showBack
      showRefresh={false}
    >
      <View style={styles.artwork}>
        <AlbumArtwork
          song={albumSongs[0]}
          size={180}
          borderRadius={18}
        />
      </View>

      <SongList songs={albumSongs} />
    </LibraryLayout>
  );
}

const styles = StyleSheet.create({
  artwork: {
    alignItems: "center",
    marginBottom: 24,
  },
});