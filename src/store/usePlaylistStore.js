// src/store/usePlaylistStore.js

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "music-player-playlists-v1";

let loadPromise = null;
let saveQueue = Promise.resolve();

const persist = (playlists) => {
    const save = saveQueue.then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playlists)));

    saveQueue = save.catch((error) => {
        console.error("Failed to save playlists:", error);
    });

    return save;
};

const usePlaylistStore = create((set, get) => ({
    playlists: [],
    loaded: false,

    loadPlaylists: async () => {
        if (get().loaded) return;
        if (loadPromise) return loadPromise;

        loadPromise = (async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                const parsed = saved ? JSON.parse(saved) : [];

                set({
                    playlists: Array.isArray(parsed) ? parsed : [],
                    loaded: true,
                });
            } catch (error) {
                console.error("Failed to load playlists:", error);
                set({ loaded: true });
            }
        })();

        try {
            await loadPromise;
        } finally {
            loadPromise = null;
        }
    },

    createPlaylist: async (name) => {
        await get().loadPlaylists();

        const trimmed = name.trim();
        if (!trimmed) return null;

        const playlist = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: trimmed,
            songIds: [],
        };

        const playlists = [...get().playlists, playlist];

        set({ playlists });
        await persist(playlists);

        return playlist.id;
    },

    renamePlaylist: async (id, name) => {
        await get().loadPlaylists();

        const trimmed = name.trim();
        if (!trimmed) return;

        const playlists = get().playlists.map((playlist) => playlist.id === id ? { ...playlist, name: trimmed } : playlist);

        set({ playlists });
        await persist(playlists);
    },

    deletePlaylist: async (id) => {
        await get().loadPlaylists();

        const playlists = get().playlists.filter((playlist) => playlist.id !== id);

        set({ playlists });
        await persist(playlists);
    },

    addSong: async (playlistId, songId) => {
        await get().loadPlaylists();

        const id = String(songId);

        const playlists = get().playlists.map((playlist) => {
            if (playlist.id !== playlistId) return playlist;
            if (playlist.songIds.includes(id)) return playlist;

            return {
                ...playlist,
                songIds: [...playlist.songIds, id],
            };
        });

        set({ playlists });
        await persist(playlists);
    },

    removeSong: async (playlistId, songId) => {
        await get().loadPlaylists();

        const id = String(songId);
        const playlists = get().playlists.map((playlist) => playlist.id === playlistId
            ? {
                ...playlist,
                songIds: playlist.songIds.filter((item) => item !== id),
            }
            : playlist
        );

        set({ playlists });
        await persist(playlists);
    },


    reorderSongs: async (playlistId, orderedSongIds) => {
        await get().loadPlaylists();

        const playlist = get().playlists.find((item) => item.id === playlistId);

        if (!playlist) return;

        const originalIds = playlist.songIds.map(String);
        const newIds = orderedSongIds.map(String);

        // Only accept a reordering of the same songs.
        if (
            originalIds.length !== newIds.length ||
            new Set(newIds).size !== newIds.length ||
            !newIds.every((id) => originalIds.includes(id))
        ) {
            return;
        }

        const playlists = get().playlists.map((item) =>
            item.id === playlistId
                ? { ...item, songIds: newIds }
                : item
        );

        set({ playlists });
        await persist(playlists);
    },

}));

export default usePlaylistStore;

