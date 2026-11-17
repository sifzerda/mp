// modules/music-artwork/index.js

import { requireNativeModule } from "expo-modules-core";

const MusicArtwork = requireNativeModule("MusicArtwork");

export default {
  getArtwork(uri, size = 256, version = "") {
    return MusicArtwork.getArtwork(
      uri,
      size,
      version
    );
  },

  getMetadata(uri) {
    return MusicArtwork.getMetadata(uri);
  },

  getMusicFolders() {
    return MusicArtwork.getMusicFolders();
  },

  clearCache() {
    return MusicArtwork.clearCache();
  },
};