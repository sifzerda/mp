// src/components/SongItem.jsx

import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
} from "react-native";

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
  onPlayNext,
  onAddToQueue,
}) {
  const [menuVisible, setMenuVisible] = useState(false);

  const isFavorite = useFavoritesStore((s) =>
    s.favorites.includes(String(song.id))
  );

  const toggleFavorite = useFavoritesStore(
    (s) => s.toggleFavorite
  );

  const closeMenu = () => setMenuVisible(false);

  const handleMenuAction = (callback) => {
    closeMenu();

    if (callback) {
      Promise.resolve()
        .then(callback)
        .catch(console.error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Song artwork and information */}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.songButton,
          pressed && styles.pressed,
        ]}
      >
        <AlbumArtwork
          song={song}
          size={48}
          borderRadius={12}
        />

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

      {/* Favorite */}
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

      {/* Add to playlist */}
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

      {/* Remove from playlist */}
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

      {/* Queue options */}
      {(onPlayNext || onAddToQueue) && (
        <Pressable
          onPress={() => setMenuVisible(true)}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel="Song options"
        >
          <Text style={styles.more}>⋮</Text>
        </Pressable>
      )}

      {/* Options menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable
          style={styles.overlay}
          onPress={closeMenu}
        >
          <View style={styles.menu}>
            <Text
              style={styles.menuTitle}
              numberOfLines={2}
            >
              {song.title || "Unknown title"}
            </Text>

            {onPlayNext && (
              <Pressable
                style={styles.menuItem}
                onPress={() =>
                  handleMenuAction(onPlayNext)
                }
              >
                <Text style={styles.menuText}>
                  ⏭  Play Next
                </Text>
              </Pressable>
            )}

            {onAddToQueue && (
              <Pressable
                style={styles.menuItem}
                onPress={() =>
                  handleMenuAction(onAddToQueue)
                }
              >
                <Text style={styles.menuText}>
                  ☷  Add to Queue
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.cancelButton}
              onPress={closeMenu}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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

  more: {
    color: "#9baec1",
    fontSize: 28,
    fontWeight: "700",
  },

  removeButton: {
    paddingHorizontal: 5,
    paddingVertical: 12,
  },

  remove: {
    color: "#ff477e",
    fontSize: 12,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    padding: 24,
  },

  menu: {
    backgroundColor: "#142436",
    borderRadius: 18,
    padding: 18,
  },

  menuTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#28445b",
  },

  menuText: {
    color: "#ffffff",
    fontSize: 16,
  },

  cancelButton: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 5,
  },

  cancelText: {
    color: "#00d9ff",
    fontSize: 15,
    fontWeight: "700",
  },
});
