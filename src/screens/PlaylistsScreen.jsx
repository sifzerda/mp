// src/screens/PlaylistsScreen.jsx

import { memo, useCallback } from "react";
import LibraryLayout from "../components/LibraryLayout";
import PlaylistManager from "../components/PlaylistManager";
import usePlaylistStore from "../store/usePlaylistStore";

function PlaylistsScreen({ navigation }) {
  const count = usePlaylistStore((s) => s.playlists.length);
  const handleSelect = useCallback((playlist) => { navigation.navigate("PlaylistDetail", { playlistId: playlist.id }) }, [navigation]);

  return (
    <LibraryLayout
      title="Playlists"
      subtitle={`${count} playlists`}
      showRefresh={false}
    >
      <PlaylistManager onSelect={handleSelect} />
    </LibraryLayout>
  );
}

export default memo(PlaylistsScreen);