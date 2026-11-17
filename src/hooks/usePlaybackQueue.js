// src/hooks/usePlaybackQueue.js

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Alert } from "react-native";
import { useIsFocused } from "@react-navigation/native";

import {
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";

import usePlaybackStore from "../store/usePlaybackStore";

import {
  getPlaybackQueue,
  removeQueuedTrack,
  moveQueuedTrack,
  playQueuedTrack,
} from "../services/audioService";

const EVENTS = [
  Event.PlaybackActiveTrackChanged,
  Event.PlaybackQueueEnded,
];

const INITIAL_QUEUE = {
  tracks: [],
  activeIndex: -1,
};

function sameTrack(a, b) {
  return (
    a &&
    b &&
    a.id === b.id &&
    a.url === b.url &&
    a.title === b.title &&
    a.artist === b.artist &&
    a.album === b.album &&
    a.duration === b.duration &&
    a.artwork === b.artwork
  );
}

function reconcileTracks(previous, incoming) {
  const previousById = new Map(
    previous.map((track) => [
      String(track.id),
      track,
    ])
  );

  const tracks = incoming.map((track) => {
    const existing = previousById.get(
      String(track.id)
    );

    return sameTrack(existing, track)
      ? existing
      : track;
  });

  const unchanged =
    previous.length === tracks.length &&
    tracks.every(
      (track, index) => track === previous[index]
    );

  return unchanged ? previous : tracks;
}

export default function usePlaybackQueue() {
  const isFocused = useIsFocused();

  const revision = usePlaybackStore(
    (s) => s.queueRevision
  );

  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const queueRef = useRef(INITIAL_QUEUE);
  const focusedRef = useRef(false);
  const mountedRef = useRef(true);

  const busyRef = useRef(false);
  const draggingRef = useRef(false);
  const dirtyRef = useRef(true);
  const pendingRef = useRef(null);
  const generationRef = useRef(0);

  const commitQueue = useCallback((next) => {
    queueRef.current = next;

    if (mountedRef.current) {
      setQueue(next);
    }
  }, []);

  const refresh = useCallback(() => {
    dirtyRef.current = true;

    if (
      !mountedRef.current ||
      !focusedRef.current ||
      draggingRef.current ||
      busyRef.current
    ) {
      return Promise.resolve();
    }

    if (pendingRef.current) {
      return pendingRef.current;
    }

    const generation = generationRef.current;

    const request = Promise.resolve()
      .then(async () => {
        while (
          dirtyRef.current &&
          mountedRef.current &&
          focusedRef.current &&
          !draggingRef.current &&
          !busyRef.current &&
          generation === generationRef.current
        ) {
          dirtyRef.current = false;

          const incoming = await getPlaybackQueue();

          if (
            !mountedRef.current ||
            !focusedRef.current ||
            generation !== generationRef.current ||
            draggingRef.current ||
            busyRef.current
          ) {
            dirtyRef.current = true;
            break;
          }

          const previous = queueRef.current;

          const tracks = reconcileTracks(
            previous.tracks,
            incoming.tracks
          );

          if (
            tracks !== previous.tracks ||
            incoming.activeIndex !== previous.activeIndex
          ) {
            commitQueue({
              tracks,
              activeIndex: incoming.activeIndex,
            });
          }

          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (
          mountedRef.current &&
          focusedRef.current &&
          generation === generationRef.current
        ) {
          setError(
            err?.message || "Unable to load queue."
          );

          setLoading(false);
        }
      })
      .finally(() => {
        pendingRef.current = null;

        if (
          dirtyRef.current &&
          mountedRef.current &&
          focusedRef.current &&
          !draggingRef.current &&
          !busyRef.current
        ) {
          refresh();
        }
      });

    pendingRef.current = request;

    return request;
  }, [commitQueue]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      generationRef.current++;
    };
  }, []);

  useEffect(() => {
    focusedRef.current = isFocused;
    generationRef.current++;

    if (isFocused) {
      refresh();
    }

    return () => {
      focusedRef.current = false;
      draggingRef.current = false;
      generationRef.current++;
    };
  }, [isFocused, refresh]);

  useEffect(() => {
    refresh();
  }, [revision, refresh]);

  useTrackPlayerEvents(EVENTS, () => {
    refresh();
  });

  const runAction = useCallback(
    async (action) => {
      if (busyRef.current || draggingRef.current) {
        return;
      }

      busyRef.current = true;
      setBusy(true);

      try {
        await action();
      } catch (err) {
        if (mountedRef.current) {
          Alert.alert(
            "Queue error",
            err?.message ||
              "Unable to update playback queue."
          );
        }
      } finally {
        busyRef.current = false;

        if (mountedRef.current) {
          setBusy(false);
          await refresh();
        }
      }
    },
    [refresh]
  );

  const handlePlay = useCallback(
    (index, trackId) => {
      const absoluteIndex =
        queueRef.current.activeIndex + 1 + index;

      return runAction(() =>
        playQueuedTrack(absoluteIndex, trackId)
      );
    },
    [runAction]
  );

  const handleRemove = useCallback(
    (index, trackId) => {
      const absoluteIndex =
        queueRef.current.activeIndex + 1 + index;

      return runAction(() =>
        removeQueuedTrack(absoluteIndex, trackId)
      );
    },
    [runAction]
  );

  const handleDragBegin = useCallback(() => {
    draggingRef.current = true;
  }, []);

  const handleDragEnd = useCallback(
    async ({ data, from, to }) => {
      draggingRef.current = false;

      if (
        dirtyRef.current ||
        pendingRef.current ||
        busyRef.current ||
        !focusedRef.current ||
        from === to
      ) {
        await refresh();
        return;
      }

      const { tracks, activeIndex } =
        queueRef.current;

      const offset = activeIndex + 1;
      const source = tracks[offset + from];
      const destination = tracks[offset + to];

      if (!source || !destination) {
        await refresh();
        return;
      }

      // Optimistically display the new order.
      commitQueue({
        activeIndex,
        tracks: [
          ...tracks.slice(0, offset),
          ...data,
        ],
      });

      await runAction(() =>
        moveQueuedTrack(
          offset + from,
          offset + to,
          source.id,
          destination.id
        )
      );
    },
    [commitQueue, refresh, runAction]
  );

  const currentTrack =
    queue.tracks[queue.activeIndex] ?? null;

  const upcoming = useMemo(
    () => queue.tracks.slice(queue.activeIndex + 1),
    [queue.tracks, queue.activeIndex]
  );

  return {
    currentTrack,
    upcoming,
    loading,
    busy,
    error,
    refresh,
    handlePlay,
    handleRemove,
    handleDragBegin,
    handleDragEnd,
  };
}