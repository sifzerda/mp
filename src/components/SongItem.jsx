// src/components/SongItem.jsx

import {
  memo,
  useCallback,
  useState,
} from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
} from "react-native";

import useThemedStyles from "../theme/useThemedStyles";
import AlbumArtwork from "./AlbumArtwork";

/* -------------------- HELPERS -------------------- */

function formatDuration(seconds) {
  const total = Math.max(
    0,
    Math.floor(Number(seconds) || 0)
  );

  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

/* -------------------- SONG INFORMATION -------------------- */

const SongInformation = memo(function SongInformation({
  song,
  styles,
  onPress,
}) {
  return (
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
  );
});

/* -------------------- OPTIONS MENU -------------------- */

function SongOptionsMenu({
  song,
  styles,
  onClose,
  onPlayNext,
  onAddToQueue,
}) {
  function handleAction(callback) {
    onClose();

    Promise.resolve()
      .then(callback)
      .catch(console.error);
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <Pressable
          style={styles.menu}
          onPress={(event) => event.stopPropagation()}
        >
          <Text style={styles.menuTitle} numberOfLines={2}>
            {song.title || "Unknown title"}
          </Text>

          {onPlayNext && (
            <Pressable
              style={styles.menuItem}
              onPress={() => handleAction(onPlayNext)}
            >
              <Text style={styles.menuText}>
                ⏭ Play Next
              </Text>
            </Pressable>
          )}

          {onAddToQueue && (
            <Pressable
              style={styles.menuItem}
              onPress={() => handleAction(onAddToQueue)}
            >
              <Text style={styles.menuText}>
                ☷ Add to Queue
              </Text>
            </Pressable>
          )}

          <Pressable
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* -------------------- SONG ITEM -------------------- */

function SongItem({
  song,
  onPress,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  onPlayNext,
  onAddToQueue,
}) {
  const { styles } = useThemedStyles(createStyles);

  const [menuVisible, setMenuVisible] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const openMenu = useCallback(() => {
    setMenuVisible(true);
  }, []);

  return (
    <View style={styles.container}>
      <SongInformation
        song={song}
        styles={styles}
        onPress={onPress}
      />

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
          <Text style={styles.remove}>
            Remove
          </Text>
        </Pressable>
      )}

      {(onPlayNext || onAddToQueue) && (
        <Pressable
          onPress={openMenu}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel="Song options"
        >
          <Text style={styles.more}>⋮</Text>
        </Pressable>
      )}

      {menuVisible && (
        <SongOptionsMenu
          song={song}
          styles={styles}
          onClose={closeMenu}
          onPlayNext={onPlayNext}
          onAddToQueue={onAddToQueue}
        />
      )}
    </View>
  );
}

export default memo(SongItem);

/* -------------------- STYLES -------------------- */

const createStyles = (colors) =>
  StyleSheet.create({
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

    add: {
      color: colors.primary,
      fontSize: 29,
    },

    more: {
      color: colors.muted,
      fontSize: 28,
      fontWeight: "700",
    },

    removeButton: {
      paddingHorizontal: 5,
      paddingVertical: 12,
    },

    remove: {
      color: colors.danger,
      fontSize: 12,
    },

    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      padding: 24,
    },

    menu: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 18,
    },

    menuTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 14,
    },

    menuItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    menuText: {
      color: colors.text,
      fontSize: 16,
    },

    cancelButton: {
      alignItems: "center",
      paddingTop: 20,
      paddingBottom: 5,
    },

    cancelText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "700",
    },
  });