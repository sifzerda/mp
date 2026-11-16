// src/services/artworkService.js

import MusicArtwork from "../../modules/music-artwork";

const artworkCache = new Map();
const pendingRequests = new Map();

function normalizeArtworkUri(uri) {
  if (!uri) return null;

  if (uri.startsWith("data:image/jpeg;base64,")) {
    const base64 = uri.slice(
      "data:image/jpeg;base64,".length
    );

    // PNG images begin with this base64 signature.
    if (base64.startsWith("iVBORw0KGgo")) {
      return `data:image/png;base64,${base64}`;
    }
  }

  return uri;
}

export async function getSongArtwork(songUri) {
  if (!songUri) return null;

  if (artworkCache.has(songUri)) {
    return artworkCache.get(songUri);
  }

  if (pendingRequests.has(songUri)) {
    return pendingRequests.get(songUri);
  }

  const request = MusicArtwork.getArtwork(songUri)
    .then(normalizeArtworkUri)
    .then((artwork) => {
      artworkCache.set(songUri, artwork);
      return artwork;
    })
    .catch((error) => {
      console.warn("Artwork extraction failed:", error);
      return null;
    })
    .finally(() => {
      pendingRequests.delete(songUri);
    });

  pendingRequests.set(songUri, request);

  return request;
}

export function clearArtworkCache() {
  artworkCache.clear();
}
