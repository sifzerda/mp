// src/services/audioService.js

import TrackPlayer, { RepeatMode, Capability, AppKilledPlaybackBehavior, State } from "react-native-track-player";
import useSettingsStore from "../store/useSettingsStore";
import { NativeModules, Platform } from "react-native";
import usePlaybackStore from "../store/usePlaybackStore";

const REPEAT_MODES = Object.freeze([
  "off",
  "all",
  "one",
]);

const NATIVE_REPEAT_MODES = Object.freeze({
  off: RepeatMode.Off,
  all: RepeatMode.Queue,
  one: RepeatMode.Track,
});

let queueId = 0;
let setupPromise = null;
let playbackOperation = Promise.resolve();

/* -------------------- HELPERS -------------------- */

function getStore() {
  return usePlaybackStore.getState();
}

function getSongId(song) {
  return String(
    song.id ??
    song.uri ??
    song.url ??
    song.localUri
  );
}

export function normalizeSong(song) {
  const url = song.uri ?? song.url ?? song.localUri;

  if (!url) {
    throw new Error("Song has no playable file URI");
  }

  const id = getSongId(song);

  return {
    id,
    songId: song.songId ?? id,
    url,

    title: song.title || song.filename || "Unknown Title",
    artist: song.artist || "Unknown Artist",
    album: song.album || "Unknown Album",
    albumArtist: song.albumArtist || song.artist || "",

    year: song.year ?? null,
    trackNumber: song.trackNumber ?? null,
    discNumber: song.discNumber ?? null,

    genre: song.genre || "",
    composer: song.composer || "",

    bitrate: song.bitrate ?? null,
    mimeType: song.mimeType || "",

    duration: Number(song.duration) || 0,

    filename: song.filename || "",
    modificationTime: song.modificationTime ?? null,

    folderId: song.folderId ?? "unknown",
    folderName: song.folderName || "",
    folderPath: song.folderPath || "",
    folderVolume: song.folderVolume || "",

    ...(song.artwork ? { artwork: song.artwork } : {}),
  };
}

function createQueuedTrack(song) {
  const track = normalizeSong(song);

  return {
    ...track,
    id: `${track.id}:queued:${Date.now()}:${++queueId}`,
  };
}

function shuffleTracks(tracks) {
  const result = [...tracks];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

function getNextRepeatMode(current) {
  const index = REPEAT_MODES.indexOf(current);

  return REPEAT_MODES[
    (index + 1) % REPEAT_MODES.length
  ];
}

function isValidQueueIndex(index) {
  return Number.isInteger(index) && index >= 0;
}

function isUpcomingTrack(index, activeIndex) {
  return (
    isValidQueueIndex(index) &&
    activeIndex != null &&
    index > activeIndex
  );
}

/* -------------------- SERIALIZATION -------------------- */

function runOperation(operation) {
  const result = playbackOperation.then(async () => {
    await initializePlayer();

    return operation();
  });

  playbackOperation = result.catch(() => { });

  return result;
}

function notifyQueueChanged() {
  getStore().notifyQueueChanged();
}

/* -------------------- INITIALIZATION -------------------- */

export function initializePlayer() {
  if (!setupPromise) {
    setupPromise = initialize().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }

  return setupPromise;
}

async function initialize() {
  if (!useSettingsStore.persist.hasHydrated()) {
    await useSettingsStore.persist.rehydrate();
  }

  await TrackPlayer.setupPlayer({
    autoHandleInterruptions: true,
    pauseOnDisconnect:
      useSettingsStore.getState().pauseOnDisconnect,
  });

  if (Platform.OS === "android") {
    await NativeModules.TrackPlayerModule.setPauseOnDisconnect(
      useSettingsStore.getState().pauseOnDisconnect
    );
  }

  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],

    compactCapabilities: [
      Capability.SkipToPrevious,
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

  const { speed, repeat } = getStore();

  await TrackPlayer.setRate(speed);

  await TrackPlayer.setRepeatMode(
    NATIVE_REPEAT_MODES[repeat]
  );
}

/* -------------------- QUEUE SYNCHRONIZATION -------------------- */

async function syncEditedQueue() {
  try {
    const queue = await TrackPlayer.getQueue();

    getStore().setOriginalQueue(queue);
  } finally {
    notifyQueueChanged();
  }
}

async function replaceQueuePreservingPlayback(
  tracks,
  currentId
) {
  const newIndex = tracks.findIndex(
    (track) => track.id === currentId
  );

  if (newIndex < 0) {
    throw new Error("Current song missing from queue");
  }

  const [progress, playback] = await Promise.all([
    TrackPlayer.getProgress(),
    TrackPlayer.getPlaybackState(),
  ]);

  const wasPlaying = playback.state === State.Playing;

  await TrackPlayer.setQueue(tracks);
  await TrackPlayer.skip(newIndex);

  await TrackPlayer.seekTo(
    Math.max(0, progress.position || 0)
  );

  if (wasPlaying) {
    await TrackPlayer.play();
  } else {
    await TrackPlayer.pause();
  }
}

/* -------------------- PLAY SONG -------------------- */

export function playSong(song, songs = [song]) {
  return runOperation(async () => {
    const tracks = songs.map(normalizeSong);
    const selectedId = getSongId(song);

    const selectedIndex = tracks.findIndex(
      (track) => track.id === selectedId
    );

    if (selectedIndex < 0) {
      throw new Error("Selected song not found in queue");
    }

    const { shuffle } = getStore();

    if (shuffle) {
      const selected = tracks[selectedIndex];

      const remaining = tracks.filter(
        (_, index) => index !== selectedIndex
      );

      await TrackPlayer.setQueue([
        selected,
        ...shuffleTracks(remaining),
      ]);
    } else {
      await TrackPlayer.setQueue(tracks);

      if (selectedIndex !== 0) {
        await TrackPlayer.skip(selectedIndex);
      }
    }

    getStore().setOriginalQueue(tracks);
    notifyQueueChanged();

    await TrackPlayer.play();
  });
}

/* -------------------- PLAYBACK CONTROLS -------------------- */

export function togglePlayback() {
  return runOperation(async () => {
    const { state } =
      await TrackPlayer.getPlaybackState();

    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  });
}

export function nextTrack() {
  return runOperation(async () => {
    const index =
      await TrackPlayer.getActiveTrackIndex();

    if (index == null) return;

    const next = await TrackPlayer.getTrack(index + 1);

    if (next == null) return;

    await TrackPlayer.skipToNext();
  });
}

export function previousTrack() {
  return runOperation(async () => {
    const index =
      await TrackPlayer.getActiveTrackIndex();

    if (index == null) return;

    const { position } =
      await TrackPlayer.getProgress();

    if (position > 3 || index === 0) {
      await TrackPlayer.seekTo(0);
      return;
    }

    await TrackPlayer.skipToPrevious();
  });
}

export function seekTo(position, expectedTrackId) {
  return runOperation(async () => {
    const value = Number(position);

    if (!Number.isFinite(value) || value < 0) {
      throw new Error("Invalid playback position");
    }

    if (expectedTrackId != null) {
      const track = await TrackPlayer.getActiveTrack();

      if (String(track?.id) !== String(expectedTrackId)) {
        return;
      }
    }

    await TrackPlayer.seekTo(value);
  });
}

/* -------------------- SHUFFLE -------------------- */

export function toggleShuffle() {
  return runOperation(async () => {
    const store = getStore();
    const enabled = !store.shuffle;

    const [queue, index] = await Promise.all([
      TrackPlayer.getQueue(),
      TrackPlayer.getActiveTrackIndex(),
    ]);

    if (queue.length > 1 && index != null) {
      const current = queue[index];

      if (enabled) {
        store.setOriginalQueue(queue);

        const history = queue.slice(0, index + 1);
        const upcoming = shuffleTracks(
          queue.slice(index + 1)
        );

        await replaceQueuePreservingPlayback(
          [...history, ...upcoming],
          current.id
        );
      } else {
        const original = store.originalQueue;

        if (original.length > 0) {
          await replaceQueuePreservingPlayback(
            original,
            current.id
          );
        }
      }

      notifyQueueChanged();
    }

    store.setShuffle(enabled);
  });
}

/* -------------------- REPEAT -------------------- */

export function cycleRepeat() {
  return runOperation(async () => {
    const next = getNextRepeatMode(getStore().repeat);

    await TrackPlayer.setRepeatMode(
      NATIVE_REPEAT_MODES[next]
    );

    getStore().setRepeat(next);
  });
}

/* -------------------- READ QUEUE -------------------- */

export async function getPlaybackQueue() {
  await initializePlayer();
  await playbackOperation;

  const [tracks, activeIndex] = await Promise.all([
    TrackPlayer.getQueue(),
    TrackPlayer.getActiveTrackIndex(),
  ]);

  return {
    tracks,
    activeIndex: activeIndex ?? -1,
  };
}

/* -------------------- ADD TO QUEUE -------------------- */

export function addSongToQueue(song) {
  return runOperation(async () => {
    const track = createQueuedTrack(song);

    await TrackPlayer.add(track);
    await syncEditedQueue();
  });
}

/* -------------------- PLAY NEXT -------------------- */

export function playSongNext(song) {
  return runOperation(async () => {
    const track = createQueuedTrack(song);

    const activeIndex =
      await TrackPlayer.getActiveTrackIndex();

    if (activeIndex == null) {
      await TrackPlayer.add(track);
    } else {
      await TrackPlayer.add(track, activeIndex + 1);
    }

    await syncEditedQueue();
  });
}

/* -------------------- REMOVE FROM QUEUE -------------------- */

export function removeQueuedTrack(
  index,
  expectedTrackId
) {
  return runOperation(async () => {
    const activeIndex =
      await TrackPlayer.getActiveTrackIndex();

    if (!isUpcomingTrack(index, activeIndex)) {
      throw new Error(
        "Only upcoming songs can be removed"
      );
    }

    const track = await TrackPlayer.getTrack(index);

    if (!track) {
      throw new Error("Invalid queue position");
    }

    if (
      expectedTrackId != null &&
      String(track.id) !== String(expectedTrackId)
    ) {
      throw new Error("The playback queue has changed");
    }

    await TrackPlayer.remove(index);
    await syncEditedQueue();
  });
}

/* -------------------- REORDER QUEUE -------------------- */

export function moveQueuedTrack(
  fromIndex,
  toIndex,
  expectedTrackId,
  expectedDestinationId
) {
  return runOperation(async () => {
    if (fromIndex === toIndex) return;

    const activeIndex =
      await TrackPlayer.getActiveTrackIndex();

    if (
      !isUpcomingTrack(fromIndex, activeIndex) ||
      !isUpcomingTrack(toIndex, activeIndex)
    ) {
      throw new Error(
        "Only upcoming songs can be reordered"
      );
    }

    const [source, destination] = await Promise.all([
      TrackPlayer.getTrack(fromIndex),
      TrackPlayer.getTrack(toIndex),
    ]);

    if (!source || !destination) {
      throw new Error("Invalid queue position");
    }

    if (
      expectedTrackId != null &&
      String(source.id) !== String(expectedTrackId)
    ) {
      throw new Error("The playback queue has changed");
    }

    if (
      expectedDestinationId != null &&
      String(destination.id) !==
      String(expectedDestinationId)
    ) {
      throw new Error("The playback queue has changed");
    }

    await TrackPlayer.move(fromIndex, toIndex);
    await syncEditedQueue();
  });
}

/* -------------------- PLAY QUEUED TRACK -------------------- */

export function playQueuedTrack(index, expectedTrackId) {
  return runOperation(async () => {
    if (!isValidQueueIndex(index)) {
      throw new Error("Invalid queue position");
    }

    const track = await TrackPlayer.getTrack(index);

    if (!track) {
      throw new Error("Invalid queue position");
    }

    if (
      expectedTrackId != null &&
      String(track.id) !== String(expectedTrackId)
    ) {
      throw new Error("The playback queue has changed");
    }

    await TrackPlayer.skip(index);
    await TrackPlayer.play();
  });
}

/* -------------------- PLAYBACK SPEED -------------------- */

export function setPlaybackSpeed(speed) {
  return runOperation(async () => {
    const rate = Number(speed);

    if (
      !Number.isFinite(rate) ||
      rate < 0.5 ||
      rate > 2
    ) {
      throw new Error("Invalid playback speed");
    }

    if (rate === getStore().speed) return;

    await TrackPlayer.setRate(rate);

    getStore().setSpeed(rate);
  });
}