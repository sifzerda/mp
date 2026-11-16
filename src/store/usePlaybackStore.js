// src/store/usePlaybackStore.js

import { create } from "zustand";

const usePlaybackStore = create((set) => ({
  shuffle: false,
  repeat: "off",
  originalQueue: [],

  setShuffle: (shuffle) => set({ shuffle }),
  setRepeat: (repeat) => set({ repeat }),
  setOriginalQueue: (originalQueue) => set({ originalQueue }),
}));

export default usePlaybackStore;
