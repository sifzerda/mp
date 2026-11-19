// src/services/musicLibrary.js

import { AssetField, MediaType, Query, getPermissionsAsync, requestPermissionsAsync } from "expo-media-library";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MusicArtwork from "music-artwork";

const PAGE_SIZE = 200;
const CONCURRENCY = 4;
const CACHE_KEY = "music-metadata-cache-v1";

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
  let permission = await getPermissionsAsync(false, ["audio"]);

  if (
    !permission.granted && permission.canAskAgain !== false
  ) {
    permission = await requestPermissionsAsync(false, ["audio"]);
  }

  return permission.granted;
}

/* -------------------- METADATA CACHE -------------------- */

async function loadMetadataCache() {
  try {
    const stored = await AsyncStorage.getItem(CACHE_KEY);

    return new Map(
      stored ? Object.entries(JSON.parse(stored)) : []
    );
  } catch {
    return new Map();
  }
}

async function saveMetadataCache(cache) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(cache)));
  } catch (error) {
    console.warn("Unable to save metadata cache:", error?.message);
  }
}

export async function clearMetadataCache() {
  await AsyncStorage.removeItem(CACHE_KEY);
}

function getFileVersion(info) {
  const modified = info.modificationTime ?? info.modificationDate ?? info.modifiedTime;

  if (!modified) return null;

  return [
    info.filename,
    modified,
    info.fileSize ?? info.size ?? "",
  ].join("|");
}

/* -------------------- AUDIO METADATA -------------------- */

async function resolveMetadata(info, cache, nextCache) {
  const uri = info.uri;

  if (!uri) return {};

  const version = getFileVersion(info);
  const cached = cache.get(uri);

  if (
    version !== null && cached?.version === version
  ) {
    nextCache.set(uri, cached);
    return cached.metadata;
  }

  try {
    const metadata = (await MusicArtwork.getMetadata(uri)) || {};

    if (
      version !== null && Object.keys(metadata).length > 0
    ) {
      nextCache.set(uri, {
        version,
        metadata,
      });
    }

    return metadata;

  } catch (error) {
    console.warn("Unable to retrieve song metadata:", error?.message);

    return {};
  }
}

/* -------------------- FOLDER METADATA -------------------- */

async function getFolderMetadata() {
  try {
    return await MusicArtwork.getMusicFolders();
  } catch (error) {
    console.warn("Unable to retrieve music folders:", error?.message);

    return {};
  }
}

function resolveFolder(uri, folders) {
  if (!uri) return UNKNOWN_FOLDER;

  const metadata = folders[uri];

  if (metadata) return metadata;

  if (
    uri.startsWith("file://") || uri.startsWith("/")
  ) {
    let path = uri.replace(/^file:\/\//, "");

    try {
      path = decodeURIComponent(path);
    } catch {
      // Retain original path.
    }

    const folderPath = path.substring(0, path.lastIndexOf("/"));

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

/* -------------------- SONG NORMALIZATION -------------------- */

function normalizeSong(asset, info, metadata, folders) {
  const filename = info.filename || "Unknown";
  const fallbackTitle = filename.replace(/\.[^.]+$/, "");

  return {
    id: asset.id,
    title: metadata.title || fallbackTitle,
    artist: metadata.artist || metadata.albumArtist || "Unknown Artist",
    album: metadata.album || "Unknown Album",
    albumArtist: metadata.albumArtist || metadata.artist || "Unknown Artist",

    year: metadata.year ?? null,
    trackNumber: metadata.trackNumber ?? null,
    discNumber: metadata.discNumber ?? null,

    genre: metadata.genre || "",
    composer: metadata.composer || "",

    bitrate: metadata.bitrate ?? null,
    mimeType: metadata.mimeType || "",

    filename,
    uri: info.uri,

    duration: metadata.duration || info.duration || 0,

    artwork: null,
    modificationTime: info.modificationTime ?? info.modificationDate ?? info.modifiedTime ?? null,
    ...resolveFolder(info.uri, folders),
  };
}

/* -------------------- MUSIC SCANNER -------------------- */

export async function getLocalSongs() {
  const songs = [];
  const seen = new Set();

  const [folders, cache] = await Promise.all([
    getFolderMetadata(),
    loadMetadataCache(),
  ]);

  const nextCache = new Map();

  let offset = 0;

  while (true) {
    const assets = await new Query()
      .eq(AssetField.MEDIA_TYPE, MediaType.AUDIO)
      .limit(PAGE_SIZE)
      .offset(offset)
      .exe();

    if (assets.length === 0) break;

    for (
      let i = 0; i < assets.length; i += CONCURRENCY
    ) {
      const page = await Promise.all(
        assets
          .slice(i, i + CONCURRENCY)
          .map(async (asset) => {
            try {
              const info = await asset.getInfo();

              if (!info.uri) return null;

              const metadata = await resolveMetadata(info, cache, nextCache);

              return normalizeSong(
                asset,
                info,
                metadata,
                folders
              );

            } catch (error) {
              console.warn("Unable to read audio file:", error?.message);

              return null;
            }
          })
      );

      for (const song of page) {
        if (!song) continue;

        const id = String(song.id);

        if (seen.has(id)) continue;

        seen.add(id);
        songs.push(song);
      }
    }

    offset += assets.length;

    if (assets.length < PAGE_SIZE) break;
  }

  await saveMetadataCache(nextCache);

  return songs.sort((a, b) =>
    collator.compare(a.title, b.title)
  );
}

/* -------------------- ALBUM TRACK SORTING -------------------- */

export function sortAlbumSongs(songs) {
  return [...songs].sort((a, b) =>
    (a.discNumber ?? 1) - (b.discNumber ?? 1) ||
    (a.trackNumber ?? Infinity) - (b.trackNumber ?? Infinity) ||

    collator.compare(a.title, b.title)
  );
}