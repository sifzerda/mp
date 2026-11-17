// src/hooks/usePlaybackProgress.js

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import TrackPlayer, {
  usePlaybackState,
  State,
} from "react-native-track-player";

const INITIAL_PROGRESS = {
  position: 0,
  duration: 0,
};

export default function usePlaybackProgress({
  interval = 500,
  enabled = true,
  trackId,
} = {}) {
  const { state } = usePlaybackState();

  const [progress, setProgress] = useState(
    INITIAL_PROGRESS
  );

  const [foreground, setForeground] = useState(
    AppState.currentState === "active"
  );

  const generation = useRef(0);
  const pending = useRef(null);

  const isPlaying = state === State.Playing;

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState) => {
        setForeground(nextState === "active");
      }
    );

    return () => subscription.remove();
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled || !foreground) return null;

    const currentGeneration = generation.current;

    if (
      pending.current?.generation === currentGeneration
    ) {
      return pending.current.promise;
    }

    const promise = Promise.resolve()
      .then(() => TrackPlayer.getProgress())
      .then(({ position, duration }) => {
        if (generation.current !== currentGeneration) {
          return null;
        }

        const next = { position, duration };

        setProgress((previous) => {
          if (
            previous.position === position &&
            previous.duration === duration
          ) {
            return previous;
          }

          return next;
        });

        return next;
      })
      .catch(() => null)
      .finally(() => {
        if (pending.current?.promise === promise) {
          pending.current = null;
        }
      });

    pending.current = {
      generation: currentGeneration,
      promise,
    };

    return promise;
  }, [enabled, foreground]);

  useEffect(() => {
    setProgress(INITIAL_PROGRESS);
  }, [trackId]);

  useEffect(() => {
    generation.current++;

    let active = true;
    let timer;

    async function poll() {
      await refresh();

      if (active && isPlaying) {
        timer = setTimeout(poll, interval);
      }
    }

    if (enabled && foreground) {
      poll();
    }

    return () => {
      active = false;
      clearTimeout(timer);
      generation.current++;
    };
  }, [
    enabled,
    foreground,
    isPlaying,
    state,
    interval,
    trackId,
    refresh,
  ]);

  return {
    ...progress,
    refresh,
  };
}