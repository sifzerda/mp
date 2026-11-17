// src/components/CollectionList.jsx
// shared by Artists and Albums

import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";

import {
  UserRound,
  ChevronRight,
} from "lucide-react-native";

import AlbumArtwork from "./AlbumArtwork";
import SearchBar from "./SearchBar";
import LibraryEmptyState from "./LibraryEmptyState";

import useMusicStore from "../store/useMusicStore";
import useThemedStyles from "../theme/useThemedStyles";

import { filterCollections } from "../utils/musicUtils";

/* -------------------- LIST HELPERS -------------------- */

const keyExtractor = (item) => item.id;

/* -------------------- COLLECTION ROW -------------------- */

const CollectionRow = memo(function CollectionRow({
  collection,
  isAlbum,
  onSelect,
}) {
  const { colors, styles } =
    useThemedStyles(createStyles);

  const handlePress = useCallback(
    () => onSelect(collection),
    [collection, onSelect]
  );

  return (
    <Pressable
      style={styles.collection}
      onPress={handlePress}
      accessibilityRole="button"
    >
      {isAlbum ? (
        <AlbumArtwork
          song={collection.songs[0]}
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
          {collection.name}
        </Text>

        <Text
          style={styles.subtitle}
          numberOfLines={1}
        >
          {isAlbum
            ? `${collection.artist} · ${collection.songs.length} songs`
            : `${collection.songs.length} songs`}
        </Text>
      </View>

      <ChevronRight
        size={22}
        color={colors.muted}
      />
    </Pressable>
  );
});

/* -------------------- COLLECTION LIST -------------------- */

function CollectionList({
  collections,
  type,
  onSelect,
}) {
  const [search, setSearch] = useState("");

  const deferredSearch = useDeferredValue(search);

  const loading = useMusicStore((s) => s.loading);
  const loadSongs = useMusicStore((s) => s.loadSongs);

  const isAlbum = type === "Albums";

  const items = useMemo(
    () =>
      filterCollections(
        collections,
        deferredSearch
      ),
    [collections, deferredSearch]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <CollectionRow
        collection={item}
        isAlbum={isAlbum}
        onSelect={onSelect}
      />
    ),
    [isAlbum, onSelect]
  );

  const emptyState = useMemo(
    () => (
      <LibraryEmptyState
        message={
          deferredSearch.trim()
            ? "No matching results."
            : `No ${type.toLowerCase()} found.`
        }
      />
    ),
    [deferredSearch, type]
  );

  return (
    <View style={layoutStyles.container}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder={`Search ${type.toLowerCase()}...`}
      />

      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={loadSongs}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={layoutStyles.content}
        ListEmptyComponent={emptyState}
      />
    </View>
  );
}

export default memo(CollectionList);

/* -------------------- LAYOUT STYLES -------------------- */

const layoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingBottom: 15,
  },
});

/* -------------------- THEMED STYLES -------------------- */

const createStyles = (colors) =>
  StyleSheet.create({
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
  });