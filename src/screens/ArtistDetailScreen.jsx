// src/screens/ArtistDetailScreen.jsx

import LibraryLayout from "../components/LibraryLayout";
import SongList from "../components/SongList";
import useMusicStore from "../store/useMusicStore";
import { EMPTY_SONGS, getArtistId, formatSongCount } from "../utils/musicUtils";

export default function ArtistDetailScreen({ route }) {
  const { artist } = route.params;
  const artistId = route.params.artistId ?? getArtistId(artist);
  const collection = useMusicStore((s) => s.libraryIndex.artistsById.get(artistId));
  const artistSongs = collection?.songs ?? EMPTY_SONGS;

  return (
    <LibraryLayout
      title={collection?.name ?? artist}
      subtitle={formatSongCount(artistSongs.length)}
      showBack
      showRefresh={false}
    >
      <SongList songs={artistSongs} />
    </LibraryLayout>
  );
}