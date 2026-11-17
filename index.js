// index.js

import { registerRootComponent } from "expo";
import TrackPlayer from "react-native-track-player";
import { LogBox } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";

import App from "./App";

// Suppress known Reanimated dependency warnings
LogBox.ignoreLogs([
  "[Reanimated] Dependencies should only be used on the web",
]);

// Retain Reanimated errors but suppress warnings
configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: false,
});

// Register application
registerRootComponent(App);

// Register background audio playback service
TrackPlayer.registerPlaybackService(() => require("./src/services/playbackService").default);