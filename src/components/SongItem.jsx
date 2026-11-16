// src/components/SongItem.jsx

import { View, Text, Pressable, StyleSheet } from "react-native";
import colors from "../theme/colors";
import useFavoritesStore from "../store/useFavoritesStore";
import AlbumArtwork from "./AlbumArtwork";

function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function SongItem({
  song,
  onPress,
  onAddToPlaylist,
  onRemoveFromPlaylist,
}) {
  const isFavorite = useFavoritesStore((s) => s.favorites.includes(String(song.id)));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.songButton,
          pressed && styles.pressed,
        ]}
      >
        <AlbumArtwork song={song} size={48} />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {song.title || "Unknown title"}
          </Text>

          <Text style={styles.artist} numberOfLines={1}>
            {song.artist || "Unknown artist"}
          </Text>

          <Text style={styles.duration}>
            {formatDuration(song.duration)}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() =>
          toggleFavorite(song.id).catch(console.error)
        }
        style={styles.actionButton}
        accessibilityRole="button"
        accessibilityLabel={
          isFavorite ? "Remove favorite" : "Add favorite"
        }
      >
        <Text
          style={[
            styles.heart,
            isFavorite && styles.activeHeart,
          ]}
        >
          {isFavorite ? "♥" : "♡"}
        </Text>
      </Pressable>

      {onAddToPlaylist && (
        <Pressable
          onPress={onAddToPlaylist}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel="Add to playlist"
        >
          <Text style={styles.add}>＋</Text>
        </Pressable>
      )}

      {onRemoveFromPlaylist && (
        <Pressable
          onPress={onRemoveFromPlaylist}
          style={styles.removeButton}
          accessibilityRole="button"
          accessibilityLabel="Remove from playlist"
        >
          <Text style={styles.remove}>Remove</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 4,
  },
  songButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
    opacity: 0.8,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  note: {
    color: colors.primary,
    fontSize: 25,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  artist: {
    color: colors.muted,
    fontSize: 12,
  },
  duration: {
    color: colors.muted,
    fontSize: 11,
  },
  actionButton: {
    width: 38,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  heart: {
    color: "#ffffff",
    fontSize: 29,
  },
  activeHeart: {
    color: "#ff477e",
  },
  add: {
    color: "#00d9ff",
    fontSize: 29,
  },
  removeButton: {
    paddingHorizontal: 5,
    paddingVertical: 12,
  },
  remove: {
    color: "#ff477e",
    fontSize: 12,
  },
});