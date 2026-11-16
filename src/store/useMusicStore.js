// src/store/useMusicStore.js

import { create } from "zustand";
import { getLocalSongs, requestMusicPermission } from "../services/musicLibrary";

const useMusicStore = create((set, get) => ({
  songs: [],
  search: "",
  activeTab: "Songs",
  selectedCollection: null,

  loading: false,
  permissionGranted: null,
  error: null,

  setSearch: (search) => set({ search }),

  setActiveTab: (activeTab) =>
    set({
      activeTab,
      selectedCollection: null,
      search: "",
    }),

  selectCollection: (type, name, artist = null) =>
    set({
      selectedCollection: { type, name, artist },
      search: "",
    }),

  clearCollection: () =>
    set({
      selectedCollection: null,
      search: "",
    }),

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
          permissionGranted: false,
          songs: [],
          selectedCollection: null,
          loading: false,
        });
        return;
      }

      const songs = await getLocalSongs();

      set({
        songs,
        permissionGranted: true,
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error?.message || "Unable to load music",
        loading: false,
      });
    }
  },
}));

export default useMusicStore;