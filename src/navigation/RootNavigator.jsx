// src/navigation/RootNavigator.jsx

import { useMemo } from "react";

import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import {
  navigationRef,
  flushPendingNavigation,
} from "./navigationRef";
import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import LibraryNavigator from "./LibraryNavigator";
import NowPlayingScreen from "../screens/NowPlayingScreen";
import QueueScreen from "../screens/QueueScreen";
import SettingsScreen from "../screens/SettingsScreen";

import useTheme from "../theme/useTheme";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const colors = useTheme();

  const theme = useMemo(() => {
    const base = colors.isDark
      ? DarkTheme
      : DefaultTheme;

    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [colors]);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={theme}
      onReady={flushPendingNavigation}
    >
      <Stack.Navigator
        initialRouteName="Library"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Library"
          component={LibraryNavigator}
        />

        <Stack.Screen
          name="NowPlaying"
          component={NowPlayingScreen}
          options={{
            animation: "slide_from_bottom",
          }}
        />

        <Stack.Screen
          name="Queue"
          component={QueueScreen}
        />

        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}