// App.js

import { StatusBar } from "expo-status-bar";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import LibraryScreen from "./src/screens/LibraryScreen";
import colors from "./src/theme/colors";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top", "bottom"]}
      >
        <StatusBar style="light" />
        <LibraryScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}