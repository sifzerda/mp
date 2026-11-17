// src/components/CollectionList.jsx
// shared by Artists and Albums

import { useCallback, useMemo, useState } from "react";

import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import {
  UserRound,
  ChevronRight,
} from "lucide-react-native";

import AlbumArtwork from "./AlbumArtwork";
import SearchBar from "./SearchBar";

import useMusicStore from "../store/useMusicStore";
import useThemedStyles from "../theme/useThemedStyles";

import { filterCollections } from "../utils/musicCollections";

export default function CollectionList({
  collections,
  type,
  onSelect,
}) {
  const { colors, styles } =
    useThemedStyles(createStyles);

  const [search, setSearch] = useState("");

  const loading = useMusicStore((s) => s.loading);
  const loadSongs = useMusicStore((s) => s.loadSongs);
  const error = useMusicStore((s) => s.error);
  const permissionGranted = useMusicStore(
    (s) => s.permissionGranted
  );

  const isAlbum = type === "Albums";

  const items = useMemo(
    () => filterCollections(collections, search),
    [collections, search]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <Pressable
        style={styles.collection}
        onPress={() => onSelect(item)}
        accessibilityRole="button"
      >
        {isAlbum ? (
          <AlbumArtwork
            song={item.songs[0]}
            size={58}
            borderRadius={10}
          />
        ) : (
          <View style={styles.artistIcon}>
            <UserRound
              size={27}
              color={colors.primary}
            />
          </View>
        )}

        <View style={styles.details}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text
            style={styles.subtitle}
            numberOfLines={1}
          >
            {isAlbum
              ? `${item.artist} · ${item.songs.length} songs`
              : `${item.songs.length} songs`}
          </Text>
        </View>

        <ChevronRight
          size={22}
          color={colors.muted}
        />
      </Pressable>
    ),
    [colors, styles, isAlbum, onSelect]
  );

  return (
    <View style={styles.container}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={`Search ${type.toLowerCase()}...`}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={loadSongs}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator
                color={colors.primary}
                size="large"
              />
            ) : (
              <>
                <Text style={styles.message}>
                  {permissionGranted === false
                    ? "Music permission is required."
                    : error
                      ? error
                      : `No ${type.toLowerCase()} found.`}
                </Text>

                {(permissionGranted === false || error) && (
                  <Pressable onPress={loadSongs}>
                    <Text style={styles.retry}>
                      Try Again
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      paddingBottom: 15,
    },

    collection: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 12,
      marginBottom: 10,
      gap: 14,
    },

    artistIcon: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },

    details: {
      flex: 1,
      minWidth: 0,
    },

    name: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },

    subtitle: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 5,
    },

    empty: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      padding: 20,
    },

    message: {
      color: colors.muted,
      textAlign: "center",
    },

    retry: {
      color: colors.primary,
      fontWeight: "600",
    },
  });