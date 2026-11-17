// src/components/CollectionList.jsx

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
  Folder,
  ChevronRight,
} from "lucide-react-native";

import AlbumArtwork from "./AlbumArtwork";
import SearchBar from "./SearchBar";
import LibraryEmptyState from "./LibraryEmptyState";

import useMusicStore from "../store/useMusicStore";
import useThemedStyles from "../theme/useThemedStyles";

import {
  filterCollections,
  formatMetadata,
  formatSongCount,
} from "../utils/musicUtils";

/* -------------------- LIST HELPERS -------------------- */

const keyExtractor = (item) => item.id;

/* -------------------- COLLECTION ROW -------------------- */

const CollectionRow = memo(function CollectionRow({
  collection,
  type,
  onSelect,
}) {
  const { colors, styles } =
    useThemedStyles(createStyles);

  const isAlbum = type === "Albums";
  const isFolder = type === "Folders";

  const Icon = isFolder ? Folder : UserRound;

  const songCount = formatSongCount(
    collection.songs.length
  );

  const subtitle = isAlbum
    ? formatMetadata(
        collection.artist,
        collection.year,
        songCount
      )
    : songCount;

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
        <View
          style={[
            styles.collectionIcon,
            !isFolder && styles.roundIcon,
          ]}
        >
          <Icon
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

        {isFolder && !!collection.path && (
          <Text
            style={styles.path}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {collection.path}
          </Text>
        )}

        <Text
          style={styles.subtitle}
          numberOfLines={2}
        >
          {subtitle}
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

  const items = useMemo(
    () => filterCollections(
      collections,
      deferredSearch
    ),
    [collections, deferredSearch]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <CollectionRow
        collection={item}
        type={type}
        onSelect={onSelect}
      />
    ),
    [type, onSelect]
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

    collectionIcon: {
      width: 58,
      height: 58,
      borderRadius: 10,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },

    roundIcon: {
      borderRadius: 29,
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

    path: {
      color: colors.muted,
      fontSize: 11,
      marginTop: 4,
    },

    subtitle: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 5,
    },
  });