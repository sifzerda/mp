// src/screens/ArtistsScreen.jsx

import { useCallback, useMemo } from "react";

import LibraryLayout from "../components/LibraryLayout";
import CollectionList from "../components/CollectionList";

import useMusicStore from "../store/useMusicStore";
import { groupSongs } from "../utils/musicCollections";

export default function ArtistsScreen({ navigation }) {
  const songs = useMusicStore((s) => s.songs);
  const artists = useMemo(() => groupSongs(songs, "Artists"), [songs]);

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