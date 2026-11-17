// src/store/usePlayerStore.js

import { create } from "zustand";

const usePlayerStore = create((set) => ({
  showNowPlaying: false,
  shuffle: false,
  repeat: "off",
  showSettings: false,

  openPlayer: () => set({ showNowPlaying: true, showSettings: false, }),
  closePlayer: () => set({ showNowPlaying: false }),
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  setRepeat: (repeat) => set({ repeat }),
  openSettings: () => set({ showSettings: true, showNowPlaying: false }),
  closeSettings: () => set({ showSettings: false }),
}));

export default usePlayerStore;
