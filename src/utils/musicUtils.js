// src/utils/musicUtils.js

const songSearchCache = new WeakMap();
const collectionSearchCache = new WeakMap();
const libraryIndexCache = new WeakMap();
const membershipCache = new WeakMap();

export const EMPTY_SONG_IDS = Object.freeze([]);
export const EMPTY_SONGS = Object.freeze([]);

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

/* -------------------- NORMALIZATION -------------------- */

function normalize(value) {
  return String(value ?? "").toLowerCase();
}

function normalizeQuery(query) {
  return normalize(query).trim();
}

/* -------------------- METADATA -------------------- */

export function getArtist(song) {
  return String(song.artist ?? "").trim() || "Unknown artist";
}

export function getAlbum(song) {
  return String(song.album ?? "").trim() || "Unknown album";
}

export function getAlbumId(artist, album) {
  return JSON.stringify([artist, album]);
}

export function getFolderName(song) {
  return String(song.folderName ?? "").trim() || "Unknown Folder";
}

export function getFolderPath(song) {
  return String(song.folderPath ?? "");
}

export function getFolderId(song) {
  return song.folderId || "unknown";
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
    item.filename,
    item.folderName,
    item.folderPath,
  ]);
}

function getCollectionSearchValues(collection) {
  return getSearchValues(
    collection,
    collectionSearchCache,
    (item) => [
      item.name,
      item.artist,
      item.path,
    ]
  );
}

/* -------------------- COLLECTION GROUPING -------------------- */

function addToGroup(groups, id, metadata, song) {
  let group = groups.get(id);

  if (!group) {
    group = {
      id,
      ...metadata,
      songs: [],
    };

    groups.set(id, group);
  }

  group.songs.push(song);
}

function sortCollections(groups) {
  return Array.from(groups.values()).sort(
    (a, b) =>
      collator.compare(a.name, b.name) ||
      collator.compare(a.path ?? "", b.path ?? "")
  );
}

/* -------------------- LIBRARY INDEX -------------------- */

export function createLibraryIndex(songs) {
  const songsById = new Map();
  const songsByUri = new Map();

  const artistsById = new Map();
  const albumsById = new Map();
  const foldersById = new Map();

  for (const song of songs) {
    const artist = getArtist(song);
    const album = getAlbum(song);

    songsById.set(String(song.id), song);

    if (song.uri) {
      songsByUri.set(song.uri, song);
    }

    // Artists
    addToGroup(
      artistsById,
      artist,
      {
        name: artist,
        artist: null,
      },
      song
    );

    // Albums
    addToGroup(
      albumsById,
      getAlbumId(artist, album),
      {
        name: album,
        artist,
      },
      song
    );

    // Folders
    addToGroup(
      foldersById,
      getFolderId(song),
      {
        name: getFolderName(song),
        path: getFolderPath(song),
        volume: song.folderVolume ?? "",
      },
      song
    );
  }

  return {
    songsById,
    songsByUri,

    artistsById,
    albumsById,
    foldersById,

    artists: sortCollections(artistsById),
    albums: sortCollections(albumsById),
    folders: sortCollections(foldersById),
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

/* -------------------- FILTERING -------------------- */

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

/* -------------------- PLAYLIST UTILITIES -------------------- */

export function normalizeSongIds(ids) {
  if (!Array.isArray(ids)) return [];

  return [
    ...new Set(
      ids
        .filter((id) => id != null)
        .map(String)
    ),
  ];
}

export function createPlaylistIndex(playlists) {
  return new Map(
    playlists.map((playlist) => [
      playlist.id,
      playlist,
    ])
  );
}

export function getSongIdSet(songIds) {
  let ids = membershipCache.get(songIds);

  if (!ids) {
    ids = new Set(songIds.map(String));

    membershipCache.set(songIds, ids);
  }

  return ids;
}

export function playlistContainsSong(playlist, songId) {
  if (!playlist || songId == null) return false;

  return getSongIdSet(playlist.songIds).has(
    String(songId)
  );
}

export function sameOrder(a, b) {
  return (
    a.length === b.length &&
    a.every((id, index) => id === b[index])
  );
}

export function isValidReorder(originalIds, orderedIds) {
  if (
    !Array.isArray(orderedIds) ||
    originalIds.length !== orderedIds.length
  ) {
    return false;
  }

  const original = getSongIdSet(originalIds);
  const incoming = new Set(orderedIds);

  return (
    original.size === originalIds.length &&
    incoming.size === orderedIds.length &&
    orderedIds.every((id) => original.has(id))
  );
}

export function resolvePlaylistSongs(songIds, songsById) {
  const result = [];

  for (const id of songIds) {
    const song = songsById.get(String(id));

    if (song) {
      result.push(song);
    }
  }

  return result;
}

/* -------------------- FORMATTING -------------------- */

export function formatTime(seconds) {
  const total = Math.floor(
    Math.max(0, Number(seconds) || 0)
  );

  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}