// src/services/musicLibrary.js

import {
  AssetField,
  MediaType,
  Query,
  getPermissionsAsync,
  requestPermissionsAsync,
} from "expo-media-library";

const PAGE_SIZE = 200;
const CONCURRENCY = 8;

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

export async function getLocalSongs() {
  const songs = [];
  const seen = new Set();

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

            const filename = info.filename || "Unknown";
            const title = filename.replace(/\.[^.]+$/, "");

            return {
              id: asset.id,
              title,
              artist: "Unknown Artist",
              album: "Unknown Album",
              filename,
              uri: info.uri,
              duration: info.duration || 0,
              artwork: null,
            };
          })
      );

      for (const song of page) {
        if (seen.has(String(song.id))) continue;

        seen.add(String(song.id));
        songs.push(song);
      }
    }

    offset += assets.length;

    if (assets.length < PAGE_SIZE) break;
  }

  return songs.sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}