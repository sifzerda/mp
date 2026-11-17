// src/utils/musicCollections.js

// helpers to group and filter songs

export function getArtist(song) {
  return String(song.artist ?? "").trim() || "Unknown artist";
}

export function getAlbum(song) {
  return String(song.album ?? "").trim() || "Unknown album";
}

export function groupSongs(songs, type) {
  const groups = new Map();

  for (const song of songs) {
    const artist = getArtist(song);
    const album = getAlbum(song);
    const name = type === "Artists" ? artist : album;
    const id = type === "Artists" ? artist : JSON.stringify([artist, album]);

    if (!groups.has(id)) {
      groups.set(id, {
        id,
        name,
        artist: type === "Albums" ? artist : null,
        songs: [],
      });
    }

    groups.get(id).songs.push(song);
  }

  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function matchesSearch(query, ...values) {
  const normalized = query.trim().toLowerCase();

  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(normalized)
  );
}

export function filterSongs(songs, query) {
  if (!query.trim()) return songs;

  return songs.filter((song) =>
    matchesSearch(
      query,
      song.title,
      song.artist,
      song.album
    )
  );
}

export function filterCollections(collections, query) {
  if (!query.trim()) return collections;

  return collections.filter((collection) =>
    matchesSearch(
      query,
      collection.name,
      collection.artist
    )
  );
}