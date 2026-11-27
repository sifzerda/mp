// src/navigation/navigationRef.js

import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

let pendingNowPlaying = false;

export function openNowPlaying() {
  if (!navigationRef.isReady()) {
    pendingNowPlaying = true;
    return;
  }

  pendingNowPlaying = false;

  if (
    navigationRef.getCurrentRoute()?.name !== "NowPlaying"
  ) {
    navigationRef.navigate("NowPlaying");
  }
}

export function flushPendingNavigation() {
  if (pendingNowPlaying) {
    openNowPlaying();
  }
}