// src/store/usePlaybackStore.js

import { create } from "zustand";

const usePlaybackStore = create((set) => ({
  shuffle: false,
  repeat: "off",
  speed: 1,
  originalQueue: [],
  queueRevision: 0,

  setShuffle: (shuffle) => set({ shuffle }),
  setRepeat: (repeat) => set({ repeat }),
  setSpeed: (speed) => set({ speed }),
  setOriginalQueue: (originalQueue) => set({ originalQueue }),

  notifyQueueChanged: () => set((state) => ({
      queueRevision: state.queueRevision + 1,
    })),
}));

export default usePlaybackStore;