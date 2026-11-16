// src/store/usePlaybackStore.js

import { create } from "zustand";

const usePlaybackStore = create((set) => ({
  shuffle: false,
  repeat: "off",
  originalQueue: [],
  speed: 1,

  setShuffle: (shuffle) => set({ shuffle }),
  setRepeat: (repeat) => set({ repeat }),
  setOriginalQueue: (originalQueue) => set({ originalQueue }),
  setSpeed: (speed) => set({ speed }),
}));

export default usePlaybackStore;
