// src/services/playbackService.js

import TrackPlayer, {
  Event,
} from "react-native-track-player";

const safely = (action) => async (event) => {
  try {
    await action(event);
  } catch (error) {
    console.warn("Remote playback:", error?.message);
  }
};

export default async function playbackService() {
  TrackPlayer.addEventListener(
    Event.RemotePlay,
    safely(() => TrackPlayer.play())
  );

  TrackPlayer.addEventListener(
    Event.RemotePause,
    safely(() => TrackPlayer.pause())
  );

  TrackPlayer.addEventListener(
    Event.RemoteNext,
    safely(async () => {
      try {
        await TrackPlayer.skipToNext();
      } catch {
        // End of queue.
      }
    })
  );

  TrackPlayer.addEventListener(
    Event.RemotePrevious,
    safely(async () => {
      try {
        await TrackPlayer.skipToPrevious();
      } catch {
        await TrackPlayer.seekTo(0);
      }
    })
  );

  TrackPlayer.addEventListener(
    Event.RemoteSeek,
    safely(({ position }) =>
      TrackPlayer.seekTo(position)
    )
  );
}