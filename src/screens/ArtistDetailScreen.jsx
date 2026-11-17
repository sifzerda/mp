// src/screens/ArtistDetailScreen.jsx

import { useMemo } from "react";

import LibraryLayout from "../components/LibraryLayout";
import SongList from "../components/SongList";

import useMusicStore from "../store/useMusicStore";
import { getArtist } from "../utils/musicCollections";

export default function ArtistDetailScreen({ route }) {
  const { artist } = route.params;

  const songs = useMusicStore((s) => s.songs);

  const artistSongs = useMemo(
    () =>
      songs.filter((song) =>
        getArtist(song) === artist
      ),
    [songs, artist]
  );

  return (
    <LibraryLayout
      title={artist}
      subtitle={`${artistSongs.length} songs`}
      showBack
      showRefresh={false}
    >
      <SongList songs={artistSongs} />
    </LibraryLayout>
  );
}