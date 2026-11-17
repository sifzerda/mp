// src/store/useFavoritesStore.js

import { create } from "zustand";

import {
  readJSON,
  writeJSON,
} from "../services/storageService";

import {
  normalizeSongIds,
} from "../utils/musicUtils";

const STORAGE_KEY = "music-player-favorites-v1";

let loadPromise = null;

const useFavoritesStore = create((set, get) => ({
  favorites: [],
  favoriteIds: new Set(),

  loaded: false,
  error: null,

  loadFavorites: async () => {
    if (get().loaded) return;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      try {
        const saved = await readJSON(STORAGE_KEY, []);

        if (!Array.isArray(saved)) {
          throw new Error("Invalid favorites data.");
        }

        const favorites = normalizeSongIds(saved);

        set({
          favorites,
          favoriteIds: new Set(favorites),
          loaded: true,
          error: null,
        });
      } catch (error) {
        set({
          error: error.message,
        });

        throw error;
      }
    })();

    try {
      await loadPromise;
    } finally {
      loadPromise = null;
    }
  },

  toggleFavorite: async (songId) => {
    if (songId == null) return;

    await get().loadFavorites();

    const id = String(songId);

    const {
      favorites: current,
      favoriteIds: currentIds,
    } = get();

    const favoriteIds = new Set(currentIds);

    let favorites;

    if (favoriteIds.has(id)) {
      favoriteIds.delete(id);

      favorites = current.filter(
        (item) => item !== id
      );
    } else {
      favoriteIds.add(id);

      favorites = [...current, id];
    }

    set({
      favorites,
      favoriteIds,
      error: null,
    });

    try {
      await writeJSON(STORAGE_KEY, favorites);
    } catch (error) {
      set({ error: error.message });

      throw error;
    }
  },

  isFavorite: (songId) =>
    get().favoriteIds.has(String(songId)),
}));

export default useFavoritesStore;