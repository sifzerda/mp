// src/services/artworkService.js

import { PixelRatio } from "react-native";

import MusicArtwork from "../../modules/music-artwork";

const MAX_CACHE_ENTRIES = 1500;
const MAX_CONCURRENT_REQUESTS = 3;

const CACHE_TTL = 5 * 60 * 1000;
const NEGATIVE_CACHE_TTL = 5 * 60 * 1000;

const SIZE_BUCKETS = [
  64,
  128,
  256,
  512,
  768,
  1024,
];

const artworkCache = new Map();
const pendingRequests = new Map();
const requestQueue = [];

let activeRequests = 0;
let clearingPromise = null;

export function getArtworkSize(displaySize = 52) {
  const pixels =
    PixelRatio.getPixelSizeForLayoutSize(displaySize);

  return (
    SIZE_BUCKETS.find((size) => size >= pixels) ??
    SIZE_BUCKETS[SIZE_BUCKETS.length - 1]
  );
}

export function getArtworkKey(
  uri,
  size = 256,
  version = ""
) {
  return JSON.stringify([uri, size, version]);
}

function readCache(key) {
  const entry = artworkCache.get(key);

  if (!entry) return undefined;

  if (entry.expiresAt <= Date.now()) {
    artworkCache.delete(key);
    return undefined;
  }

  // Move recently accessed entries to the end.
  artworkCache.delete(key);
  artworkCache.set(key, entry);

  return entry.uri;
}

function writeCache(key, uri) {
  artworkCache.delete(key);

  artworkCache.set(key, {
    uri,
    expiresAt:
      Date.now() +
      (uri ? CACHE_TTL : NEGATIVE_CACHE_TTL),
  });

  while (artworkCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = artworkCache.keys().next().value;

    artworkCache.delete(oldestKey);
  }
}

export function peekSongArtwork(
  uri,
  size = 256,
  version = ""
) {
  if (!uri) return null;

  return readCache(
    getArtworkKey(uri, size, version)
  );
}

function processQueue() {
  while (
    activeRequests < MAX_CONCURRENT_REQUESTS &&
    requestQueue.length > 0
  ) {
    const { task, resolve, reject } =
      requestQueue.shift();

    activeRequests++;

    Promise.resolve()
      .then(task)
      .then(resolve, reject)
      .finally(() => {
        activeRequests--;

        processQueue();
      });
  }
}

function scheduleRequest(task) {
  return new Promise((resolve, reject) => {
    requestQueue.push({
      task,
      resolve,
      reject,
    });

    processQueue();
  });
}

export async function getSongArtwork(
  songUri,
  size = 256,
  version = ""
) {
  if (!songUri) return null;

  if (clearingPromise) {
    await clearingPromise;
  }

  const key = getArtworkKey(
    songUri,
    size,
    version
  );

  const cached = readCache(key);

  if (cached !== undefined) {
    return cached;
  }

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const request = scheduleRequest(() =>
    MusicArtwork.getArtwork(
      songUri,
      size,
      version
    )
  )
    .then((uri) => {
      const artwork = uri || null;

      writeCache(key, artwork);

      return artwork;
    })
    .catch(() => {
      return null;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, request);

  return request;
}

export function invalidateSongArtwork(
  uri,
  size,
  version = ""
) {
  artworkCache.delete(
    getArtworkKey(uri, size, version)
  );
}

export async function clearArtworkCache({
  disk = false,
} = {}) {
  if (clearingPromise) {
    return clearingPromise;
  }

  clearingPromise = Promise.resolve()
    .then(async () => {
      await Promise.allSettled(
        [...pendingRequests.values()]
      );

      artworkCache.clear();

      if (disk) {
        await MusicArtwork.clearCache();
      }
    })
    .finally(() => {
      clearingPromise = null;
    });

  return clearingPromise;
}

export function getArtworkCacheStats() {
  return {
    cached: artworkCache.size,
    pending: pendingRequests.size,
    queued: requestQueue.length,
    active: activeRequests,
    maxEntries: MAX_CACHE_ENTRIES,
    maxConcurrent: MAX_CONCURRENT_REQUESTS,
  };
}