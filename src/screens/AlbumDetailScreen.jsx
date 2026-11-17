// src/screens/AlbumDetailScreen.jsx

import { View, Text, StyleSheet } from "react-native";

import LibraryLayout from "../components/LibraryLayout";
import AlbumArtwork from "../components/AlbumArtwork";
import SongList from "../components/SongList";

import useMusicStore from "../store/useMusicStore";
import useThemedStyles from "../theme/useThemedStyles";

import {
  EMPTY_SONGS,
  getAlbumId,
  formatMetadata,
  formatSongCount,
} from "../utils/musicUtils";

export default function AlbumDetailScreen({ route }) {
  const { styles } = useThemedStyles(createStyles);

  const { album, artist } = route.params;

  const albumId =
    route.params.albumId ??
    getAlbumId(artist, album);

  const collection = useMusicStore(
    (s) => s.libraryIndex.albumsById.get(albumId)
  );

  const albumSongs = collection?.songs ?? EMPTY_SONGS;

  const totalDuration = albumSongs.reduce(
    (total, song) =>
      total + Math.max(0, Number(song.duration) || 0),
    0
  );

  const totalMinutes = Math.floor(totalDuration / 60);

  const subtitle = formatMetadata(
    collection?.artist ?? artist,
    collection?.year,
    formatSongCount(albumSongs.length)
  );

  return (
    <LibraryLayout
      title={collection?.name ?? album}
      subtitle={subtitle}
      showBack
      showRefresh={false}
    >
      <View style={styles.albumHeader}>
        <AlbumArtwork
          song={albumSongs[0]}
          size={180}
          borderRadius={18}
        />

        {totalMinutes > 0 && (
          <Text style={styles.duration}>
            {totalMinutes} minutes
          </Text>
        )}
      </View>

      <SongList songs={albumSongs} />
    </LibraryLayout>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    albumHeader: {
      alignItems: "center",
      marginBottom: 24,
      gap: 12,
    },

    duration: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: "500",
    },
  });