// src/hooks/usePlaybackAction.js

import { useCallback, useRef, useState } from "react";

export default function usePlaybackAction() {
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);

  const runAction = useCallback(async (action) => {
    if (busyRef.current) return;

    busyRef.current = true;
    setBusy(true);

    try {
      await action();
    } catch (error) {
      console.warn("Playback action failed:", error);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  return { busy, runAction };
}