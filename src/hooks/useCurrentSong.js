// src/hooks/useCurrentSong.js

import useMusicStore from "../store/useMusicStore";

export default function useCurrentSong(track) {
  const id = track?.id;
  const songId = track?.songId;
  const uri = track?.uri ?? track?.url;

  const song = useMusicStore((state) => {
    const { songsById, songsByUri } =
      state.libraryIndex;

    return (
      (songId != null
        ? songsById.get(String(songId))
        : undefined) ??

      (id != null
        ? songsById.get(String(id))
        : undefined) ??

      (uri
        ? songsByUri.get(uri)
        : undefined) ??

      null
    );
  });

  return song ?? track ?? null;
}