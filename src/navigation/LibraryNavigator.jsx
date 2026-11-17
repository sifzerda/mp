// src/navigation/LibraryNavigator.jsx

import { useEffect } from "react";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SongsScreen from "../screens/SongsScreen";
import ArtistsScreen from "../screens/ArtistsScreen";
import AlbumsScreen from "../screens/AlbumsScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import PlaylistsScreen from "../screens/PlaylistsScreen";

import ArtistDetailScreen from "../screens/ArtistDetailScreen";
import AlbumDetailScreen from "../screens/AlbumDetailScreen";
import PlaylistDetailScreen from "../screens/PlaylistDetailScreen";

import useMusicStore from "../store/useMusicStore";
import useFavoritesStore from "../store/useFavoritesStore";
import usePlaylistStore from "../store/usePlaylistStore";

import LibraryTabBar from "./LibraryTabBar";
import useTheme from "../theme/useTheme";

const Tab = createBottomTabNavigator();
const ArtistStack = createNativeStackNavigator();
const AlbumStack = createNativeStackNavigator();
const PlaylistStack = createNativeStackNavigator();

function useStackOptions() {
  const colors = useTheme();

  return {
    headerShown: false,
    animation: "slide_from_right",
    contentStyle: {
      backgroundColor: colors.background,
    },
  };
}

function ArtistNavigator() {
  const options = useStackOptions();

  return (
    <ArtistStack.Navigator screenOptions={options}>
      <ArtistStack.Screen
        name="ArtistList"
        component={ArtistsScreen}
      />

      <ArtistStack.Screen
        name="ArtistDetail"
        component={ArtistDetailScreen}
      />
    </ArtistStack.Navigator>
  );
}

function AlbumNavigator() {
  const options = useStackOptions();

  return (
    <AlbumStack.Navigator screenOptions={options}>
      <AlbumStack.Screen
        name="AlbumList"
        component={AlbumsScreen}
      />

      <AlbumStack.Screen
        name="AlbumDetail"
        component={AlbumDetailScreen}
      />
    </AlbumStack.Navigator>
  );
}

function PlaylistNavigator() {
  const options = useStackOptions();

  return (
    <PlaylistStack.Navigator screenOptions={options}>
      <PlaylistStack.Screen
        name="PlaylistList"
        component={PlaylistsScreen}
      />

      <PlaylistStack.Screen
        name="PlaylistDetail"
        component={PlaylistDetailScreen}
      />
    </PlaylistStack.Navigator>
  );
}

export default function LibraryNavigator() {
  const loadSongs = useMusicStore((s) => s.loadSongs);
  const loadFavorites = useFavoritesStore((s) => s.loadFavorites);
  const loadPlaylists = usePlaylistStore((s) => s.loadPlaylists);

  // Initialize library and persistent storage
  useEffect(() => {
    Promise.allSettled([
      loadSongs(),
      loadFavorites(),
      loadPlaylists(),
    ]).then((results) => {
      for (const result of results) {
        if (result.status === "rejected") {
          console.error(
            "Library initialization failed:",
            result.reason
          );
        }
      }
    });
  }, [loadSongs, loadFavorites, loadPlaylists]);

  return (
    <Tab.Navigator
      initialRouteName="Songs"
      backBehavior="history"
      tabBar={(props) => <LibraryTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Songs"
        component={SongsScreen}
      />

      <Tab.Screen
        name="Artists"
        component={ArtistNavigator}
      />

      <Tab.Screen
        name="Albums"
        component={AlbumNavigator}
      />

      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
      />

      <Tab.Screen
        name="Playlists"
        component={PlaylistNavigator}
      />
    </Tab.Navigator>
  );
}