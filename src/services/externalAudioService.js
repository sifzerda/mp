// src/services/externalAudioService.js

// receives external file URI, metadata, pass the song to the playback service

import MusicArtwork from "music-artwork";

import { playSong } from "./audioService";
import useMusicStore from "../store/useMusicStore";
import { openNowPlaying } from "../navigation/navigationRef";

/* -------------------- VALIDATION -------------------- */

export function isExternalAudioUri(uri) {
  return (
    typeof uri === "string" &&
    /^(content|file):\/\//i.test(uri)
  );
}

/* -------------------- FILE INFORMATION -------------------- */

export async function getExternalAudio(uri) {
  if (!isExternalAudioUri(uri)) {
    throw new Error("Invalid audio file");
  }

  const { libraryIndex } = useMusicStore.getState();

  const existingSong =
    libraryIndex.songsByUri.get(uri);

  if (existingSong) {
    return existingSong;
  }

  const [info, metadata] = await Promise.all([
    MusicArtwork.getAudioFileInfo(uri),

    MusicArtwork.getMetadata(uri)
      .catch(() => ({})),
  ]);

  const filename = info.filename || "Unknown Audio";

  const fallbackTitle =
    filename.replace(/\.[^.]+$/, "");

  return {
    ...metadata,

    id: `external:${uri}`,
    uri,
    filename,

    title: metadata.title || fallbackTitle,
    artist: metadata.artist || "Unknown Artist",
    album: metadata.album || "Unknown Album",

    albumArtist:
      metadata.albumArtist ||
      metadata.artist ||
      "Unknown Artist",

    mimeType:
      metadata.mimeType ||
      info.mimeType ||
      "",

    duration: Number(metadata.duration) || 0,

    size: info.size || 0,
    artwork: null,

    folderId: "unknown",
    folderName: "",
    folderPath: "",
    folderVolume: "",
  };
}

/* -------------------- PLAYBACK -------------------- */

export async function playExternalAudio(songs) {
  if (!songs?.length) return;

  await playSong(songs[0], songs);

  openNowPlaying();
}

/* -------------------- IMPORT -------------------- */

export async function importExternalAudio(songs) {
  const importedUris = [];

  for (const song of songs) {
    const existing =
      useMusicStore
        .getState()
        .libraryIndex
        .songsByUri
        .get(song.uri);

    if (existing) {
      importedUris.push(existing.uri);
      continue;
    }

    const imported =
      await MusicArtwork.importAudioFile(song.uri);

    importedUris.push(imported.uri);
  }

  // Wait for an existing library scan to finish.
  if (useMusicStore.getState().loading) {
    await useMusicStore.getState().loadSongs();
  }

  // Refresh the library with the imported files.
  await useMusicStore.getState().loadSongs();

  return Promise.all(
    importedUris.map(getExternalAudio)
  );
}

export async function importAndPlayExternalAudio(songs) {
  const importedSongs =
    await importExternalAudio(songs);

  await playExternalAudio(importedSongs);

  return importedSongs;
}