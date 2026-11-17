// src/screens/AlbumsScreen.jsx

import { useCallback, useMemo } from "react";

import LibraryLayout from "../components/LibraryLayout";
import CollectionList from "../components/CollectionList";

import useMusicStore from "../store/useMusicStore";
import { groupSongs } from "../utils/musicCollections";

export default function AlbumsScreen({ navigation }) {
  const songs = useMusicStore((s) => s.songs);

  const albums = useMemo(
    () => groupSongs(songs, "Albums"),
    [songs]
  );

  const handleSelect = useCallback(
    (album) => {
      navigation.navigate("AlbumDetail", {
        album: album.name,
        artist: album.artist,
      });
    },
    [navigation]
  );

  return (
    <LibraryLayout
      title="Albums"
      subtitle={`${albums.length} albums`}
    >
      <CollectionList
        collections={albums}
        type="Albums"
        onSelect={handleSelect}
      />
    </LibraryLayout>
  );
}