// src/utils/musicCollections.js

// helpers to group and filter songs

const songSearchCache = new WeakMap();
const collectionSearchCache = new WeakMap();
const libraryIndexCache = new WeakMap();

const EMPTY_ARRAY = Object.freeze([]);

function normalize(value) {
  return String(value ?? "").toLowerCase();
}

function normalizeQuery(query) {
  return normalize(query).trim();
}

export function getArtist(song) {
  return String(song.artist ?? "").trim() || "Unknown artist";
}

export function getAlbum(song) {
  return String(song.album ?? "").trim() || "Unknown album";
}

export function getAlbumId(artist, album) {
  return JSON.stringify([artist, album]);
}

/* -------------------- SEARCH CACHE -------------------- */

function getSearchValues(item, cache, createValues) {
  let values = cache.get(item);

  if (!values) {
    values = createValues(item).map(normalize);
    cache.set(item, values);
  }

  return values;
}

function getSongSearchValues(song) {
  return getSearchValues(song, songSearchCache, (item) => [
    item.title,
    item.artist,
    item.album,
  ]);
}

function getCollectionSearchValues(collection) {
  return getSearchValues(
    collection,
    collectionSearchCache,
    (item) => [
      item.name,
      item.artist,
    ]
  );
}

/* -------------------- LIBRARY INDEX -------------------- */

function addToGroup(groups, id, name, artist, song) {
  let group = groups.get(id);

  if (!group) {
    group = {
      id,
      name,
      artist,
      songs: [],
    };

    groups.set(id, group);
  }

  group.songs.push(song);
}

function sortCollections(groups) {
  return Array.from(groups.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function createLibraryIndex(songs) {
  const songsById = new Map();
  const songsByUri = new Map();
  const artistsById = new Map();
  const albumsById = new Map();

  for (const song of songs) {
    const artist = getArtist(song);
    const album = getAlbum(song);

    songsById.set(String(song.id), song);

    if (song.uri) {
      songsByUri.set(song.uri, song);
    }

    addToGroup(
      artistsById,
      artist,
      artist,
      null,
      song
    );

    addToGroup(
      albumsById,
      getAlbumId(artist, album),
      album,
      artist,
      song
    );
  }

  return {
    songsById,
    songsByUri,
    artistsById,
    albumsById,
    artists: sortCollections(artistsById),
    albums: sortCollections(albumsById),
  };
}

export function getLibraryIndex(songs) {
  let index = libraryIndexCache.get(songs);

  if (!index) {
    index = createLibraryIndex(songs);
    libraryIndexCache.set(songs, index);
  }

  return index;
}

/* -------------------- COLLECTIONS -------------------- */

export function groupSongs(songs, type) {
  const index = getLibraryIndex(songs);

  return type === "Artists"
    ? index.artists
    : index.albums;
}

export function getArtistSongs(songs, artist) {
  return (
    getLibraryIndex(songs)
      .artistsById.get(artist)?.songs ?? EMPTY_ARRAY
  );
}

export function getAlbumSongs(songs, artist, album) {
  return (
    getLibraryIndex(songs)
      .albumsById.get(getAlbumId(artist, album))?.songs ??
    EMPTY_ARRAY
  );
}

export function getSongById(songs, id) {
  return getLibraryIndex(songs).songsById.get(String(id));
}

export function getSongByUri(songs, uri) {
  return getLibraryIndex(songs).songsByUri.get(uri);
}

export function getSongsByIds(songs, ids) {
  const { songsById } = getLibraryIndex(songs);

  return ids
    .map((id) => songsById.get(String(id)))
    .filter(Boolean);
}

/* -------------------- FILTERING -------------------- */

export function matchesSearch(query, ...values) {
  const normalized = normalizeQuery(query);

  return values.some((value) =>
    normalize(value).includes(normalized)
  );
}

export function filterSongs(songs, query) {
  const normalized = normalizeQuery(query);

  if (!normalized) return songs;

  return songs.filter((song) =>
    getSongSearchValues(song).some((value) =>
      value.includes(normalized)
    )
  );
}

export function filterCollections(collections, query) {
  const normalized = normalizeQuery(query);

  if (!normalized) return collections;

  return collections.filter((collection) =>
    getCollectionSearchValues(collection).some((value) =>
      value.includes(normalized)
    )
  );
}