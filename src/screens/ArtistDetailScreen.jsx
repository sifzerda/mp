// src/screens/ArtistDetailScreen.jsx

import LibraryLayout from "../components/LibraryLayout";
import SongList from "../components/SongList";
import useMusicStore from "../store/useMusicStore";

const EMPTY_ARRAY = Object.freeze([]);

export default function ArtistDetailScreen({ route }) {
  const { artist } = route.params;
  const artistSongs = useMusicStore((s) => s.libraryIndex.artistsById.get(artist)?.songs ?? EMPTY_ARRAY);

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