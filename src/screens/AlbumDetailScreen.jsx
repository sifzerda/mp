// src/screens/AlbumDetailScreen.jsx

import { View, StyleSheet } from "react-native";

import LibraryLayout from "../components/LibraryLayout";
import AlbumArtwork from "../components/AlbumArtwork";
import SongList from "../components/SongList";

import useMusicStore from "../store/useMusicStore";
import { getAlbumId } from "../utils/musicUtils";

const EMPTY_ARRAY = Object.freeze([]);

export default function AlbumDetailScreen({ route }) {
  const { album, artist } = route.params;

  const albumId = getAlbumId(artist, album);

  const albumSongs = useMusicStore(
    (s) =>
      s.libraryIndex.albumsById.get(albumId)?.songs ??
      EMPTY_ARRAY
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