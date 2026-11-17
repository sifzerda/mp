// src/screens/SongsScreen.jsx

import LibraryLayout from "../components/LibraryLayout";
import SongList from "../components/SongList";
import useMusicStore from "../store/useMusicStore";

export default function SongsScreen() {
  const songs = useMusicStore((s) => s.songs);

  return (
    <LibraryLayout
      title="Songs"
      subtitle={`${songs.length} songs on your device`}
    >
      <SongList
        songs={songs}
        emptyMessage="No music found on your device."
      />
    </LibraryLayout>
  );
}