// src/screens/FoldersScreen.jsx

import { useCallback } from "react";
import LibraryLayout from "../components/LibraryLayout";
import CollectionList from "../components/CollectionList";
import useMusicStore from "../store/useMusicStore";

export default function FoldersScreen({ navigation }) {
  const folders = useMusicStore((s) => s.libraryIndex.folders);

  const handleSelect = useCallback(
    (folder) => {
      navigation.navigate("FolderDetail", {
        folderId: folder.id,
      });
    },
    [navigation]
  );

  return (
    <LibraryLayout
      title="Folders"
      subtitle={`${folders.length} ${folders.length === 1 ? "folder" : "folders"}`}
    >
      <CollectionList
        collections={folders}
        type="Folders"
        onSelect={handleSelect}
      />
    </LibraryLayout>
  );
}