// src/navigation/LibraryTabBar.jsx

import { memo, useCallback } from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import { useIsFocused } from "@react-navigation/native";

import {
  Music,
  Users,
  Disc3,
  Heart,
  ListMusic,
} from "lucide-react-native";

import MiniPlayer from "../components/MiniPlayer";
import useThemedStyles from "../theme/useThemedStyles";

const ICONS = {
  Songs: Music,
  Artists: Users,
  Albums: Disc3,
  Favorites: Heart,
  Playlists: ListMusic,
};

const LibraryTab = memo(function LibraryTab({
  route,
  label,
  focused,
  navigation,
}) {
  const { colors, styles } =
    useThemedStyles(createStyles);

  const Icon = ICONS[route.name] || Music;

  const color = focused
    ? colors.primary
    : colors.muted;

  const onPress = useCallback(() => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!focused && !event.defaultPrevented) {
      navigation.navigate(
        route.name,
        route.params
      );
    }
  }, [navigation, route, focused]);

  const onLongPress = useCallback(() => {
    navigation.emit({
      type: "tabLongPress",
      target: route.key,
    });
  }, [navigation, route.key]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      style={styles.tab}
    >
      {focused && (
        <View style={styles.indicator} />
      )}

      <Icon
        color={color}
        size={23}
        strokeWidth={focused ? 2.5 : 1.8}
      />

      <Text style={[styles.label, { color }]}>
        {label}
      </Text>
    </Pressable>
  );
});

function LibraryTabBar({
  state,
  descriptors,
  navigation,
}) {
  const { styles } = useThemedStyles(createStyles);

  const isFocused = useIsFocused();

  const openPlayer = useCallback(() => {
    navigation.navigate("NowPlaying");
  }, [navigation]);

  return (
    <View style={styles.container}>
      <MiniPlayer
        onOpenPlayer={openPlayer}
        enabled={isFocused}
      />

      <View style={styles.tabBar}>
        {state.routes.map((route, index) => (
          <LibraryTab
            key={route.key}
            route={route}
            label={
              descriptors[route.key].options.title ||
              route.name
            }
            focused={state.index === index}
            navigation={navigation}
          />
        ))}
      </View>
    </View>
  );
}

export default memo(LibraryTabBar);

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
    },

    tabBar: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 8,
    },

    tab: {
      flex: 1,
      minHeight: 52,
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },

    label: {
      fontSize: 11,
      fontWeight: "600",
    },

    indicator: {
      position: "absolute",
      top: -8,
      width: 30,
      height: 3,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
  });