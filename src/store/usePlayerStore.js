// src/store/usePlayerStore.js

import { create } from "zustand";

const usePlayerStore = create((set) => ({
  showNowPlaying: false,
  shuffle: false,
  repeat: "off",

  openPlayer: () => set({ showNowPlaying: true }),
  closePlayer: () => set({ showNowPlaying: false }),
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  setRepeat: (repeat) => set({ repeat }),
}));

export default usePlayerStore;
