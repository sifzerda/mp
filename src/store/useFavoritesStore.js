// src/store/useFavoritesStore.js

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "music-player-favorites-v1";

let loadPromise = null;
let saveQueue = Promise.resolve();

const useFavoritesStore = create((set, get) => ({
  favorites: [],
  loaded: false,

  loadFavorites: async () => {
    if (get().loaded) return;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];

        set({
          favorites: Array.isArray(parsed)
            ? [...new Set(parsed.map(String))]
            : [],
          loaded: true,
        });
      } catch (error) {
        console.error("Failed to load favorites:", error);
        set({ loaded: true });
      }
    })();

    try {
      await loadPromise;
    } finally {
      loadPromise = null;
    }
  },

  toggleFavorite: async (songId) => {
    await get().loadFavorites();

    const id = String(songId);

    const current = get().favorites;

    const favorites = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];

    set({ favorites });

    const save = saveQueue.then(() =>
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(get().favorites)
      )
    );

    saveQueue = save.catch((error) => {
      console.error("Failed to save favorites:", error);
    });

    await save;
  },

  isFavorite: (songId) =>
    get().favorites.includes(String(songId)),
}));

export default useFavoritesStore;

