// src/screens/PlaylistsScreen.jsx

import LibraryLayout from "../components/LibraryLayout";
import PlaylistManager from "../components/PlaylistManager";
import usePlaylistStore from "../store/usePlaylistStore";

export default function PlaylistsScreen({ navigation }) {
  const playlists = usePlaylistStore((s) => s.playlists);

  return (
    <LibraryLayout
      title="Playlists"
      subtitle={`${playlists.length} playlists`}
      showRefresh={false}
    >
      <PlaylistManager
        onSelect={(playlist) =>
          navigation.navigate("PlaylistDetail", {
            playlistId: playlist.id,
          })
        }
      />
    </LibraryLayout>
  );
}