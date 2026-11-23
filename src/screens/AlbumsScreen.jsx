// src/screens/AlbumsScreen.jsx

import { useCallback } from "react";
import LibraryLayout from "../components/LibraryLayout";
import CollectionList from "../components/CollectionList";
import useMusicStore from "../store/useMusicStore";

export default function AlbumsScreen({ navigation }) {
  const albums = useMusicStore((s) => s.libraryIndex.albums);

  const handleSelect = useCallback((album) => {
      navigation.navigate("AlbumDetail", {
        albumId: album.id,
        album: album.name,
        artist: album.artist,
      });
    },
    [navigation]
  );

  return (
    <LibraryLayout
      title="Albums"
      subtitle={`${albums.length} ${
        albums.length === 1 ? "album" : "albums"
      }`}
    >
      <CollectionList
        collections={albums}
        type="Albums"
        onSelect={handleSelect}
      />
    </LibraryLayout>
  );
}