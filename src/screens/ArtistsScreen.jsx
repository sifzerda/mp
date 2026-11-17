// src/screens/ArtistsScreen.jsx

import { useCallback } from "react";

import LibraryLayout from "../components/LibraryLayout";
import CollectionList from "../components/CollectionList";

import useMusicStore from "../store/useMusicStore";

export default function ArtistsScreen({ navigation }) {
  const artists = useMusicStore((s) => s.libraryIndex.artists);

  const handleSelect = useCallback(
    (artist) => {
      navigation.navigate("ArtistDetail", {
        artist: artist.name,
      });
    },
    [navigation]
  );

  return (
    <LibraryLayout
      title="Artists"
      subtitle={`${artists.length} artists`}
    >
      <CollectionList
        collections={artists}
        type="Artists"
        onSelect={handleSelect}
      />
    </LibraryLayout>
  );
}