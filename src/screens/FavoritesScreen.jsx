// src/screens/FavoritesScreen.jsx

import { memo, useMemo } from "react";

import LibraryLayout from "../components/LibraryLayout";
import SongList from "../components/SongList";

import useMusicStore from "../store/useMusicStore";
import useFavoritesStore from "../store/useFavoritesStore";

function FavoritesScreen() {
  const songs = useMusicStore((s) => s.songs);

  const favoriteIds = useFavoritesStore(
    (s) => s.favoriteIds
  );

  const favoriteSongs = useMemo(
    () =>
      favoriteIds.size
        ? songs.filter((song) =>
            favoriteIds.has(String(song.id))
          )
        : [],
    [songs, favoriteIds]
  );

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

export default memo(FavoritesScreen);