// src/store/useSettingsStore.js

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_SETTINGS = { theme: "dark", accent: "#00d9ff" };

const useSettingsStore = create(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: "music-player-settings",
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        theme: state.theme,
        accent: state.accent,
      }),
    }
  )
);

export default useSettingsStore;