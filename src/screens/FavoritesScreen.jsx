// src/screens/FavoritesScreen.jsx

import { useMemo } from "react";

import LibraryLayout from "../components/LibraryLayout";
import SongList from "../components/SongList";

import useMusicStore from "../store/useMusicStore";
import useFavoritesStore from "../store/useFavoritesStore";

export default function FavoritesScreen() {
  const songs = useMusicStore((s) => s.songs);
  const favorites = useFavoritesStore((s) => s.favorites);

  const favoriteSongs = useMemo(() => {
    const ids = new Set(favorites.map(String));

    return songs.filter((song) =>
      ids.has(String(song.id))
    );
  }, [songs, favorites]);

  return (
    <LibraryLayout
      title="Favorites"
      subtitle={`${favoriteSongs.length} favorite songs`}
    >
      <SongList
        songs={favoriteSongs}
        emptyMessage="No favorite songs yet."
      />
    </LibraryLayout>
  );
}