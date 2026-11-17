// src/store/useSettingsStore.js

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

const DEFAULT_SETTINGS = {
  theme: "dark",
  accent: "#00d9ff",
  pauseOnDisconnect: true,
};

async function syncPauseOnDisconnect(enabled) {
  if (Platform.OS !== "android") return;

  try {
    await NativeModules.TrackPlayerModule.setPauseOnDisconnect(
      enabled
    );
  } catch (error) {
    if (error?.code !== "player_not_initialized") {
      console.warn(
        "Unable to apply headphone setting:",
        error?.message
      );
    }
  }
}

const useSettingsStore = create(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setTheme: (theme) => set({ theme }),

      setAccent: (accent) => set({ accent }),

      setPauseOnDisconnect: (enabled) => {
        set({ pauseOnDisconnect: enabled });
        void syncPauseOnDisconnect(enabled);
      },

      resetSettings: () => {
        set(DEFAULT_SETTINGS);
        void syncPauseOnDisconnect(
          DEFAULT_SETTINGS.pauseOnDisconnect
        );
      },
    }),
    {
      name: "music-player-settings",

      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        theme: state.theme,
        accent: state.accent,
        pauseOnDisconnect: state.pauseOnDisconnect,
      }),
    }
  )
);

export default useSettingsStore;