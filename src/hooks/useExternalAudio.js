// src/hooks/useExternalAudio.js

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
  AppState,
} from "react-native";

import MusicArtwork from "music-artwork";

import {
  getExternalAudio,
  playExternalAudio,
  importExternalAudio,
  importAndPlayExternalAudio,
} from "../services/externalAudioService";

const CHECK_INTERVAL = 1000;

export default function useExternalAudio(ready) {
  const [songs, setSongs] = useState([]);
  const [busy, setBusy] = useState(false);

  const checking = useRef(false);
  const processing = useRef(false);

  const checkPending = useCallback(async () => {
    if (
      !ready ||
      checking.current ||
      processing.current ||
      AppState.currentState !== "active"
    ) {
      return;
    }

    checking.current = true;

    try {
      const uris =
        await MusicArtwork.consumePendingAudioUris();

      if (!uris?.length) return;

      const results = await Promise.allSettled(
        uris.map(getExternalAudio)
      );

      const incoming = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      if (!incoming.length) {
        Alert.alert(
          "Unable to open audio",
          "The selected audio files could not be accessed."
        );

        return;
      }

      setSongs((previous) => {
        const unique = new Map(
          previous.map((song) => [song.uri, song])
        );

        for (const song of incoming) {
          unique.set(song.uri, song);
        }

        return [...unique.values()];
      });

    } catch (error) {
      console.warn(
        "Unable to receive external audio:",
        error
      );

    } finally {
      checking.current = false;
    }
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    let interval = null;

    function stopChecking() {
      if (interval !== null) {
        clearInterval(interval);
        interval = null;
      }
    }

    function startChecking() {
      stopChecking();

      void checkPending();

      interval = setInterval(
        checkPending,
        CHECK_INTERVAL
      );
    }

    const subscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          startChecking();
        } else {
          stopChecking();
        }
      }
    );

    if (AppState.currentState === "active") {
      startChecking();
    }

    return () => {
      stopChecking();
      subscription.remove();
    };
  }, [ready, checkPending]);

  const close = useCallback(() => {
    if (processing.current) return;

    setSongs([]);
  }, []);

  const performAction = useCallback(async (action) => {
    if (
      processing.current ||
      !songs.length
    ) {
      return;
    }

    processing.current = true;
    setBusy(true);

    try {
      switch (action) {
        case "play":
          await playExternalAudio(songs);
          break;

        case "import":
          await importExternalAudio(songs);

          Alert.alert(
            "Import complete",
            `${songs.length} audio file(s) processed.`
          );
          break;

        case "import-play":
          await importAndPlayExternalAudio(songs);
          break;

        default:
          throw new Error("Invalid audio action");
      }

      const processedUris = new Set(
        songs.map((song) => song.uri)
      );

      setSongs((current) =>
        current.filter(
          (song) => !processedUris.has(song.uri)
        )
      );

    } catch (error) {
      Alert.alert(
        "Unable to process audio",
        error?.message ||
          "An unexpected error occurred."
      );

    } finally {
      processing.current = false;
      setBusy(false);
    }
  }, [songs]);

  return {
    songs,
    busy,
    visible: songs.length > 0,
    close,
    performAction,
  };
}