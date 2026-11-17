// src/hooks/useCurrentSong.js

import useMusicStore from "../store/useMusicStore";

export default function useCurrentSong(track) {
  const id = track?.id;
  const uri = track?.url;

  const song = useMusicStore((state) => {
    if (!track) return null;

    const { songsById, songsByUri } = state.libraryIndex;

    return (
      songsById.get(String(id)) ??
      songsByUri.get(uri) ??
      null
    );
  });

  return song ?? track ?? null;
}