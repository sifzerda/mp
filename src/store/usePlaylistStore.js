// src/store/usePlaylistStore.js

import { create } from "zustand";

import {
  readJSON,
  writeJSON,
} from "../services/storageService";

import {
  createPlaylistIndex,
  normalizeSongIds,
  playlistContainsSong,
  isValidReorder,
  sameOrder,
} from "../utils/musicUtils";

const STORAGE_KEY = "music-player-playlists-v1";

let loadPromise = null;

const usePlaylistStore = create((set, get) => {
  async function commitPlaylists(playlists) {
    if (playlists === get().playlists) return;

    set({
      playlists,
      playlistsById: createPlaylistIndex(playlists),
      error: null,
    });

    try {
      await writeJSON(STORAGE_KEY, playlists);
    } catch (error) {
      set({ error: error.message });

      throw error;
    }
  }

  function updatePlaylist(id, updater) {
    const current = get().playlistsById.get(id);

    if (!current) return;

    const updated = updater(current);

    if (updated === current) return;

    const playlists = get().playlists.map(
      (playlist) =>
        playlist.id === id
          ? updated
          : playlist
    );

    return commitPlaylists(playlists);
  }

  return {
    playlists: [],
    playlistsById: new Map(),

    loaded: false,
    error: null,

    loadPlaylists: async () => {
      if (get().loaded) return;
      if (loadPromise) return loadPromise;

      loadPromise = (async () => {
        try {
          const saved = await readJSON(STORAGE_KEY, []);

          if (
            !Array.isArray(saved) ||
            saved.some(
              (item) =>
                !item ||
                typeof item.id !== "string" ||
                typeof item.name !== "string" ||
                !Array.isArray(item.songIds)
            )
          ) {
            throw new Error("Invalid playlist data.");
          }

          const playlists = saved.map((playlist) => ({
            ...playlist,
            songIds: normalizeSongIds(playlist.songIds),
          }));

          set({
            playlists,
            playlistsById: createPlaylistIndex(playlists),
            loaded: true,
            error: null,
          });
        } catch (error) {
          set({ error: error.message });

          throw error;
        }
      })();

      try {
        await loadPromise;
      } finally {
        loadPromise = null;
      }
    },

    getPlaylist: (id) =>
      get().playlistsById.get(id) ?? null,

    createPlaylist: async (name) => {
      const trimmed = name.trim();

      if (!trimmed) return null;

      await get().loadPlaylists();

      const playlist = {
        id: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

        name: trimmed,
        songIds: [],
      };

      await commitPlaylists([
        ...get().playlists,
        playlist,
      ]);

      return playlist.id;
    },

    renamePlaylist: async (id, name) => {
      const trimmed = name.trim();

      if (!trimmed) return;

      await get().loadPlaylists();

      await updatePlaylist(id, (playlist) => {
        if (playlist.name === trimmed) {
          return playlist;
        }

        return {
          ...playlist,
          name: trimmed,
        };
      });
    },

    deletePlaylist: async (id) => {
      await get().loadPlaylists();

      if (!get().playlistsById.has(id)) return;

      await commitPlaylists(
        get().playlists.filter(
          (playlist) => playlist.id !== id
        )
      );
    },

    addSong: async (playlistId, songId) => {
      if (songId == null) return;

      await get().loadPlaylists();

      const id = String(songId);

      await updatePlaylist(
        playlistId,
        (playlist) => {
          if (playlistContainsSong(playlist, id)) {
            return playlist;
          }

          return {
            ...playlist,
            songIds: [...playlist.songIds, id],
          };
        }
      );
    },

    removeSong: async (playlistId, songId) => {
      if (songId == null) return;

      await get().loadPlaylists();

      const id = String(songId);

      await updatePlaylist(
        playlistId,
        (playlist) => {
          if (!playlistContainsSong(playlist, id)) {
            return playlist;
          }

          return {
            ...playlist,
            songIds: playlist.songIds.filter(
              (item) => item !== id
            ),
          };
        }
      );
    },

    reorderSongs: async (
      playlistId,
      orderedSongIds,
      expectedSongIds
    ) => {
      await get().loadPlaylists();

      if (!Array.isArray(orderedSongIds)) return;

      const orderedIds = orderedSongIds.map(String);

      await updatePlaylist(
        playlistId,
        (playlist) => {
          if (
            expectedSongIds &&
            !sameOrder(
              playlist.songIds,
              expectedSongIds
            )
          ) {
            throw new Error(
              "The playlist changed during reordering."
            );
          }

          if (
            !isValidReorder(
              playlist.songIds,
              orderedIds
            )
          ) {
            throw new Error(
              "Invalid playlist ordering."
            );
          }

          if (sameOrder(playlist.songIds, orderedIds)) {
            return playlist;
          }

          return {
            ...playlist,
            songIds: orderedIds,
          };
        }
      );
    },

    containsSong: (playlistId, songId) =>
      playlistContainsSong(
        get().playlistsById.get(playlistId),
        songId
      ),
  };
});

export default usePlaylistStore;