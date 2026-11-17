// src/hooks/useSongActions.js

import { useCallback, useState } from "react";
import { Alert } from "react-native";

import {
  playSong,
  playSongNext,
  addSongToQueue,
} from "../services/audioService";

export default function useSongActions(songs) {
  const [pickerSong, setPickerSong] = useState(null);

  const handlePlaySong = useCallback(
    async (song) => {
      try {
        await playSong(song, songs);
      } catch (error) {
        Alert.alert(
          "Playback error",
          error?.message || "Unable to play song."
        );
      }
    },
    [songs]
  );

  const handlePlayNext = useCallback(async (song) => {
    try {
      await playSongNext(song);
    } catch (error) {
      Alert.alert(
        "Queue error",
        error?.message || "Unable to play song next."
      );
    }
  }, []);

  const handleAddToQueue = useCallback(async (song) => {
    try {
      await addSongToQueue(song);
    } catch (error) {
      Alert.alert(
        "Queue error",
        error?.message || "Unable to add song to queue."
      );
    }
  }, []);

  const closePicker = useCallback(() => {
    setPickerSong(null);
  }, []);

  return {
    pickerSong,
    setPickerSong,
    closePicker,
    handlePlaySong,
    handlePlayNext,
    handleAddToQueue,
  };
}