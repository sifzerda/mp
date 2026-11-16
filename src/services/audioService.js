// src/services/audioService.js

import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from "react-native-track-player";

let setupPromise = null;

export function initializePlayer() {
  if (!setupPromise) {
    setupPromise = (async () => {
      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
      });

      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
        ],
        progressUpdateEventInterval: 1,
        android: {
          appKilledPlaybackBehavior:
            AppKilledPlaybackBehavior.ContinuePlayback,
        },
      });
    })().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }

  return setupPromise;
}

export function normalizeSong(song) {
  const url = song.uri ?? song.url ?? song.localUri;

  if (!url) {
    throw new Error("Song has no playable file URI");
  }

  return {
    id: String(song.id ?? url),
    url,
    title:
      song.title ??
      song.filename ??
      "Unknown title",
    artist: song.artist ?? "Unknown artist",
    album: song.album ?? "Unknown album",
    duration: Number(song.duration) || 0,
    ...(song.artwork ? { artwork: song.artwork } : {}),
  };
}

export async function playSong(song, songs = [song]) {
  await initializePlayer();

  const tracks = songs.map(normalizeSong);
  const selectedId = String(song.id ?? song.uri ?? song.url);
  const index = tracks.findIndex(
    (track) => track.id === selectedId
  );

  if (index < 0) {
    throw new Error("Selected song not found in queue");
  }

  await TrackPlayer.setQueue(tracks);
  await TrackPlayer.skip(index);
  await TrackPlayer.play();
}

export async function togglePlayback() {
  await initializePlayer();

  const state = await TrackPlayer.getPlaybackState();

  if (state.state === "playing") {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
}

export async function nextTrack() {
  await initializePlayer();

  try {
    await TrackPlayer.skipToNext();
  } catch {
    // Already at the end of the queue.
  }
}

export async function previousTrack() {
  await initializePlayer();

  const { position } = await TrackPlayer.getProgress();

  if (position > 3) {
    await TrackPlayer.seekTo(0);
    return;
  }

  try {
    await TrackPlayer.skipToPrevious();
  } catch {
    await TrackPlayer.seekTo(0);
  }
}
