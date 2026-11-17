// src/services/musicLibrary.js

import {
  AssetField,
  MediaType,
  Query,
  getPermissionsAsync,
  requestPermissionsAsync,
} from "expo-media-library";

import MusicArtwork from "music-artwork";

const PAGE_SIZE = 200;
const CONCURRENCY = 8;

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const UNKNOWN_FOLDER = Object.freeze({
  folderId: "unknown",
  folderName: "Unknown Folder",
  folderPath: "",
  folderVolume: "",
});

/* -------------------- PERMISSIONS -------------------- */

export async function requestMusicPermission() {
  let permission = await getPermissionsAsync(
    false,
    ["audio"]
  );

  if (
    !permission.granted &&
    permission.canAskAgain !== false
  ) {
    permission = await requestPermissionsAsync(
      false,
      ["audio"]
    );
  }

  return permission.granted;
}

/* -------------------- FOLDER METADATA -------------------- */

async function getFolderMetadata() {
  try {
    return await MusicArtwork.getMusicFolders();
  } catch (error) {
    console.warn(
      "Unable to retrieve music folders:",
      error?.message
    );

    return {};
  }
}

function resolveFolder(uri, folders) {
  if (!uri) return UNKNOWN_FOLDER;

  const metadata = folders[uri];

  if (metadata) return metadata;

  // Handle ordinary filesystem paths.
  if (
    uri.startsWith("file://") ||
    uri.startsWith("/")
  ) {
    let path = uri.replace(/^file:\/\//, "");

    try {
      path = decodeURIComponent(path);
    } catch {
      // Retain the original path.
    }

    const folderPath = path.substring(
      0,
      path.lastIndexOf("/")
    );

    if (!folderPath) return UNKNOWN_FOLDER;

    return {
      folderId: `file:${folderPath}`,
      folderName:
        folderPath.split("/").pop() || "Root",
      folderPath,
      folderVolume: "",
    };
  }

  return UNKNOWN_FOLDER;
}

/* -------------------- MUSIC SCANNER -------------------- */

export async function getLocalSongs() {
  const songs = [];
  const seen = new Set();

  const folders = await getFolderMetadata();

  let offset = 0;

  while (true) {
    const assets = await new Query()
      .eq(AssetField.MEDIA_TYPE, MediaType.AUDIO)
      .limit(PAGE_SIZE)
      .offset(offset)
      .exe();

    if (assets.length === 0) break;

    for (
      let i = 0;
      i < assets.length;
      i += CONCURRENCY
    ) {
      const page = await Promise.all(
        assets
          .slice(i, i + CONCURRENCY)
          .map(async (asset) => {
            const info = await asset.getInfo();

            const filename =
              info.filename || "Unknown";

            const title = filename.replace(
              /\.[^.]+$/,
              ""
            );

            const folder = resolveFolder(
              info.uri,
              folders
            );

            return {
              id: asset.id,
              title,
              artist: "Unknown Artist",
              album: "Unknown Album",
              filename,
              uri: info.uri,
              duration: info.duration || 0,
              artwork: null,

              ...folder,
            };
          })
      );

      for (const song of page) {
        const id = String(song.id);

        if (seen.has(id)) continue;

        seen.add(id);
        songs.push(song);
      }
    }

    offset += assets.length;

    if (assets.length < PAGE_SIZE) break;
  }

  return songs.sort((a, b) =>
    collator.compare(a.title, b.title)
  );
}