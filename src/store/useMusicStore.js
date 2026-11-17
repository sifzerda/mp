// src/store/useMusicStore.js

import { create } from "zustand";

import {
  getLocalSongs,
  requestMusicPermission,
} from "../services/musicLibrary";

import {
  getLibraryIndex,
} from "../utils/musicCollections";

/* -------------------- HELPERS -------------------- */

function shallowEqual(a, b) {
  if (a === b) return true;

  const keys = Object.keys(a);

  if (keys.length !== Object.keys(b).length) {
    return false;
  }

  return keys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      Object.is(a[key], b[key])
  );
}

function reconcileSongs(previous, incoming) {
  const previousById = new Map(
    previous.map((song) => [
      String(song.id),
      song,
    ])
  );

  let changed = previous.length !== incoming.length;

  const songs = incoming.map((song, index) => {
    const existing = previousById.get(
      String(song.id)
    );

    const result =
      existing && shallowEqual(existing, song)
        ? existing
        : song;

    if (result !== previous[index]) {
      changed = true;
    }

    return result;
  });

  return changed ? songs : previous;
}

/* -------------------- INITIAL STATE -------------------- */

const initialSongs = [];

/* -------------------- STORE -------------------- */

const useMusicStore = create((set, get) => ({
  songs: initialSongs,
  libraryIndex: getLibraryIndex(initialSongs),

  loading: false,
  permissionGranted: null,
  error: null,

  loadSongs: async () => {
    if (get().loading) return;

    set({
      loading: true,
      error: null,
    });

    try {
      const granted = await requestMusicPermission();

      if (!granted) {
        set({
          songs: initialSongs,
          libraryIndex: getLibraryIndex(initialSongs),
          permissionGranted: false,
        });

        return;
      }

      const incoming = await getLocalSongs();

      const songs = reconcileSongs(
        get().songs,
        incoming
      );

      set({
        songs,
        libraryIndex: getLibraryIndex(songs),
        permissionGranted: true,
      });
    } catch (error) {
      set({
        error:
          error?.message || "Unable to load music",
      });
    } finally {
      set({
        loading: false,
      });
    }
  },
}));

export default useMusicStore;