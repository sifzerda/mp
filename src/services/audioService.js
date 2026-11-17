// src/services/audioService.js

import TrackPlayer, { Capability, AppKilledPlaybackBehavior, RepeatMode, State } from "react-native-track-player";
import usePlaybackStore from "../store/usePlaybackStore";

let setupPromise = null;
let queueOperation = Promise.resolve();

function runQueueOperation(operation) {
  const result = queueOperation.then(operation);

  queueOperation = result.catch(() => { });

  return result;
}

export function initializePlayer() {
  if (!setupPromise) {
    setupPromise = (async () => {
      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
      });
      const speed = usePlaybackStore.getState().speed;
      await TrackPlayer.setRate(speed);
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

      const repeat = usePlaybackStore.getState().repeat;

      await TrackPlayer.setRepeatMode({
        off: RepeatMode.Off,
        all: RepeatMode.Queue,
        one: RepeatMode.Track,
      }[repeat]);
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
    title: song.title ?? song.filename ?? "Unknown title",
    artist: song.artist ?? "Unknown artist",
    album: song.album ?? "Unknown album",
    duration: Number(song.duration) || 0,
    ...(song.artwork ? { artwork: song.artwork } : {}),
  };
}

function shuffleTracks(tracks) {
  const result = [...tracks];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

async function replaceQueuePreservingPlayback(tracks, currentId) {
  const activeIndex = await TrackPlayer.getActiveTrackIndex();

  const progress = activeIndex == null
    ? { position: 0 }
    : await TrackPlayer.getProgress();

  const playback = await TrackPlayer.getPlaybackState();
  const wasPlaying = playback.state === State.Playing;

  const newIndex = tracks.findIndex(
    (track) => track.id === currentId
  );

  if (newIndex < 0) {
    throw new Error("Current song missing from queue");
  }

  await TrackPlayer.setQueue(tracks);
  await TrackPlayer.skip(newIndex);
  await TrackPlayer.seekTo(progress.position);

  if (wasPlaying) {
    await TrackPlayer.play();
  }
}

export async function playSong(song, songs = [song]) {
  return runQueueOperation(async () => {
    await initializePlayer();

    const tracks = songs.map(normalizeSong);
    const selectedId = String(
      song.id ?? song.uri ?? song.url ?? song.localUri
    );

    const selected = tracks.find(
      (track) => track.id === selectedId
    );

    if (!selected) {
      throw new Error("Selected song not found in queue");
    }

    const { shuffle } = usePlaybackStore.getState();

    const queue = shuffle
      ? [
        selected,
        ...shuffleTracks(
          tracks.filter((track) => track.id !== selectedId)
        ),
      ]
      : tracks;

    await TrackPlayer.setQueue(queue);

    if (!shuffle) {
      const index = queue.findIndex(
        (track) => track.id === selectedId
      );

      await TrackPlayer.skip(index);
    }

    await TrackPlayer.play();

    usePlaybackStore.getState().setOriginalQueue(tracks);
  });
}

export async function togglePlayback() {
  await initializePlayer();

  const playback = await TrackPlayer.getPlaybackState();

  if (playback.state === State.Playing) {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
}

export async function nextTrack() {
  return runQueueOperation(async () => {
    await initializePlayer();

    const index = await TrackPlayer.getActiveTrackIndex();
    const queue = await TrackPlayer.getQueue();

    if (index == null || index >= queue.length - 1) {
      return;
    }

    await TrackPlayer.skipToNext();
  });
}

export async function previousTrack() {
  return runQueueOperation(async () => {
    await initializePlayer();

    const index = await TrackPlayer.getActiveTrackIndex();

    if (index == null) return;

    const { position } = await TrackPlayer.getProgress();

    if (position > 3 || index === 0) {
      await TrackPlayer.seekTo(0);
      return;
    }

    await TrackPlayer.skipToPrevious();
  });
}

export async function toggleShuffle() {
  return runQueueOperation(async () => {
    await initializePlayer();

    const store = usePlaybackStore.getState();
    const enabled = !store.shuffle;

    const queue = await TrackPlayer.getQueue();
    const index = await TrackPlayer.getActiveTrackIndex();

    if (queue.length > 1 && index != null) {
      const current = queue[index];

      if (enabled) {
        // Preserve playback history and shuffle upcoming songs.
        const history = queue.slice(0, index + 1);
        const upcoming = shuffleTracks(queue.slice(index + 1));

        await replaceQueuePreservingPlayback(
          [...history, ...upcoming],
          current.id
        );
      } else {
        // Restore original library order.
        const original = store.originalQueue;

        if (original.length > 0) {
          await replaceQueuePreservingPlayback(
            original,
            current.id
          );
        }
      }
    }

    store.setShuffle(enabled);
  });
}

export async function cycleRepeat() {
  await initializePlayer();

  const store = usePlaybackStore.getState();
  const modes = ["off", "all", "one"];
  const index = modes.indexOf(store.repeat);
  const next = modes[(index + 1) % modes.length];

  const trackPlayerModes = {
    off: RepeatMode.Off,
    all: RepeatMode.Queue,
    one: RepeatMode.Track,
  };

  await TrackPlayer.setRepeatMode(trackPlayerModes[next]);

  store.setRepeat(next);
}


function syncEditedQueue(queue) {
  // Manual queue edits become the new saved order.
  // This prevents turning shuffle off from undoing edits.
  usePlaybackStore.getState().setOriginalQueue(queue);
}

export async function getPlaybackQueue() {
  await initializePlayer();

  const [tracks, activeIndex] = await Promise.all([
    TrackPlayer.getQueue(),
    TrackPlayer.getActiveTrackIndex(),
  ]);

  return {
    tracks,
    activeIndex: activeIndex ?? -1,
  };
}

export async function addSongToQueue(song) {
  return runQueueOperation(async () => {
    await initializePlayer();

    const track = normalizeSong(song);
    const queue = await TrackPlayer.getQueue();

    // Give newly queued copies unique IDs.
    track.id = `${track.id}:queued:${Date.now()}:${Math.random()}`;

    await TrackPlayer.add(track);

    syncEditedQueue(await TrackPlayer.getQueue());
  });
}

export async function playSongNext(song) {
  return runQueueOperation(async () => {
    await initializePlayer();

    const track = normalizeSong(song);
    const queue = await TrackPlayer.getQueue();
    const activeIndex = await TrackPlayer.getActiveTrackIndex();

    track.id = `${track.id}:queued:${Date.now()}:${Math.random()}`;

    const insertIndex =
      activeIndex == null
        ? queue.length
        : activeIndex + 1;

    await TrackPlayer.add(track, insertIndex);

    syncEditedQueue(await TrackPlayer.getQueue());
  });
}

export async function removeQueuedTrack(index) {
  return runQueueOperation(async () => {
    await initializePlayer();

    const queue = await TrackPlayer.getQueue();
    const activeIndex = await TrackPlayer.getActiveTrackIndex();

    if (
      activeIndex == null ||
      index <= activeIndex ||
      index >= queue.length
    ) {
      throw new Error("Only upcoming songs can be removed");
    }

    await TrackPlayer.remove(index);

    syncEditedQueue(await TrackPlayer.getQueue());
  });
}

export async function moveQueuedTrack(
  fromIndex,
  toIndex,
  expectedTrackId
) {
  return runQueueOperation(async () => {
    await initializePlayer();

    const queue = await TrackPlayer.getQueue();
    const activeIndex = await TrackPlayer.getActiveTrackIndex();

    if (
      !Number.isInteger(fromIndex) ||
      !Number.isInteger(toIndex) ||
      activeIndex == null ||
      fromIndex <= activeIndex ||
      toIndex <= activeIndex ||
      fromIndex >= queue.length ||
      toIndex >= queue.length
    ) {
      throw new Error("Only upcoming songs can be reordered");
    }

    if (
      expectedTrackId != null &&
      String(queue[fromIndex].id) !== String(expectedTrackId)
    ) {
      throw new Error("The playback queue has changed");
    }

    if (fromIndex === toIndex) return;

    await TrackPlayer.move(fromIndex, toIndex);

    syncEditedQueue(await TrackPlayer.getQueue());
  });
}

export async function playQueuedTrack(index) {
  return runQueueOperation(async () => {
    await initializePlayer();

    const queue = await TrackPlayer.getQueue();

    if (index < 0 || index >= queue.length) {
      throw new Error("Invalid queue position");
    }

    await TrackPlayer.skip(index);
    await TrackPlayer.play();
  });
}

export async function setPlaybackSpeed(speed) {
  const rate = Number(speed);

  if (!Number.isFinite(rate) || rate < 0.5 || rate > 2) {
    throw new Error("Invalid playback speed");
  }

  await initializePlayer();
  await TrackPlayer.setRate(rate);

  usePlaybackStore.getState().setSpeed(rate);
}