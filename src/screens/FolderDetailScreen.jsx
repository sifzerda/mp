// src/screens/FolderDetailScreen.jsx

import LibraryLayout from "../components/LibraryLayout";
import SongList from "../components/SongList";
import useMusicStore from "../store/useMusicStore";
import { EMPTY_SONGS } from "../utils/musicUtils";

export default function FolderDetailScreen({ route }) {
  const { folderId } = route.params;
  const folder = useMusicStore((s) => s.libraryIndex.foldersById.get(folderId));
  const songs = folder?.songs ?? EMPTY_SONGS;
  const songCount = `${songs.length} ${songs.length === 1 ? "song" : "songs"}`;

  return (
    <LibraryLayout
      title={folder?.name ?? "Folder"}
      subtitle={folder?.path ? `${folder.path} · ${songCount}` : songCount}
      showBack
      showRefresh={false}
    >
      <SongList
        songs={songs}
        emptyMessage="No songs in this folder."
      />
    </LibraryLayout>
  );
}