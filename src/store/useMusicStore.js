// src/store/useMusicStore.js

import { create } from "zustand";

import {
  getLocalSongs,
  requestMusicPermission,
} from "../services/musicLibrary";

const useMusicStore = create((set, get) => ({
  songs: [],
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
          permissionGranted: false,
          songs: [],
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
        error: error?.message || "Unable to load music",
        loading: false,
      });
    }
  },
}));

export default useMusicStore;