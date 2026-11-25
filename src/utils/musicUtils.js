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

export function normalizeMetadata(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value) {
  return normalizeMetadata(value);
}

function normalizeQuery(query) {
  return normalizeMetadata(query);
}

function readText(value) {
  return String(value ?? "").trim();
}

function positiveInteger(value) {
  const number = Number(value);

  return Number.isInteger(number) && number > 0
    ? number
    : null;
}

/* -------------------- METADATA -------------------- */

export function getArtist(song) {
  return readText(song.artist) || "Unknown Artist";
}

export function getAlbum(song) {
  return readText(song.album) || "Unknown Album";
}

export function getAlbumArtist(song) {
  return readText(song.albumArtist) || getArtist(song);
}

export function getYear(song) {
  const year = positiveInteger(song.year);
  return year >= 1000 && year <= 9999 ? year : null;
}

export function getTrackNumber(song) {
  return positiveInteger(song.trackNumber);
}

export function getDiscNumber(song) {
  return positiveInteger(song.discNumber);
}

export function getAlbumId(artist, album) {
  return JSON.stringify([
    normalizeMetadata(artist) || "unknown artist",
    normalizeMetadata(album) || "unknown album",
  ]);
}

export function getArtistId(artist) {
  return normalizeMetadata(artist) || "unknown artist";
}

export function getFolderName(song) {
  return readText(song.folderName) || "Unknown Folder";
}

export function getFolderPath(song) {
  return String(song.folderPath ?? "");
}

export function getFolderId(song) {
  return song.folderId || "unknown";
}

/* -------------------- FORMATTING -------------------- */

export function formatMetadata(...values) {
  return values
    .filter((value) => value != null)
    .map(readText)
    .filter(Boolean)
    .join(" · ");
}

export function formatSongCount(count) {
  return `${count} ${count === 1 ? "song" : "songs"}`;
}

export function formatTime(seconds) {
  const total = Math.floor(Math.max(0, Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

/* -------------------- SORTING -------------------- */

export function compareSongTitles(a, b) {
  return collator.compare(a.title ?? "", b.title ?? "");
}

export function compareAlbumTracks(a, b) {
  return (
    (getDiscNumber(a) ?? 1) - (getDiscNumber(b) ?? 1) || (getTrackNumber(a) ?? Infinity) - (getTrackNumber(b) ?? Infinity) || compareSongTitles(a, b)
  );
}

export function sortAlbumSongs(songs) {
  return [...songs].sort(compareAlbumTracks);
}

/* -------------------- SEARCH CACHE -------------------- */

function getSearchValues(item, cache, createValues) {
  let values = cache.get(item);

  if (!values) {
    values = createValues(item)
      .filter((value) => value != null)
      .map(normalize);

    cache.set(item, values);
  }

  return values;
}

function getSongSearchValues(song) {
  return getSearchValues(song, songSearchCache, (item) => [
    item.title,
    item.artist,
    item.album,
    item.albumArtist,
    item.year,
    item.genre,
    item.composer,
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
      item.year,
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

  return group;
}

function sortCollections(groups) {
  return Array.from(groups.values()).sort(
    (a, b) =>
      collator.compare(a.name, b.name) ||
      collator.compare(a.artist ?? "", b.artist ?? "") ||
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
    const albumArtist = getAlbumArtist(song);
    const year = getYear(song);

    songsById.set(String(song.id), song);

    if (song.uri) {
      songsByUri.set(song.uri, song);
    }

    /* Artists */

    addToGroup(
      artistsById,
      getArtistId(artist),
      {
        name: artist,
        artist: null,
      },
      song
    );

    /* Albums */

    const albumGroup = addToGroup(
      albumsById,
      getAlbumId(albumArtist, album),
      {
        name: album,
        artist: albumArtist,
        year,
      },
      song
    );

    if (albumGroup.year == null && year != null) {
      albumGroup.year = year;
    }

    /* Folders */

    addToGroup(foldersById,
      getFolderId(song),
      {
        name: getFolderName(song),
        path: getFolderPath(song),
        volume: song.folderVolume ?? "",
      },
      song
    );
  }

  // Sort each album once when building the index.
  for (const album of albumsById.values()) {
    album.songs.sort(compareAlbumTracks);
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

  return songs.filter(
    (song) => getSongSearchValues(song).some((value) => value.includes(normalized))
  );
}

export function filterCollections(collections, query) {
  const normalized = normalizeQuery(query);

  if (!normalized) return collections;

  return collections.filter(
    (collection) => getCollectionSearchValues(collection).some((value) => value.includes(normalized))
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

// metadata normalization function

export function normalizeMetadata(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}