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

import {
  Plus,
  EllipsisVertical,
  SkipForward,
  ListPlus,
  Trash2,
} from "lucide-react-native";

import useThemedStyles from "../theme/useThemedStyles";
import AlbumArtwork from "./AlbumArtwork";

import {
  getArtist,
  getAlbum,
  getYear,
  getTrackNumber,
  formatTime,
  formatMetadata,
} from "../utils/musicUtils";

/* -------------------- SONG INFORMATION -------------------- */

const SongInformation = memo(function SongInformation({
  song,
  styles,
  onPress,
}) {
  const trackNumber = getTrackNumber(song);

  const subtitle = formatMetadata(
    getArtist(song),
    getAlbum(song)
  );

  const details = formatMetadata(
    trackNumber != null
      ? `Track ${trackNumber}`
      : null,

    getYear(song),
    formatTime(song.duration)
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.songButton,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Play ${song.title || "song"}`}
    >
      <AlbumArtwork
        song={song}
        size={48}
        borderRadius={12}
      />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {song.title || "Unknown Title"}
        </Text>

        <Text style={styles.artist} numberOfLines={1}>
          {subtitle}
        </Text>

        <Text style={styles.duration} numberOfLines={1}>
          {details}
        </Text>
      </View>
    </Pressable>
  );
});

/* -------------------- OPTIONS MENU -------------------- */

function SongOptionsMenu({
  song,
  colors,
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
          <Text
            style={styles.menuTitle}
            numberOfLines={2}
          >
            {song.title || "Unknown Title"}
          </Text>

          <Text
            style={styles.menuSubtitle}
            numberOfLines={2}
          >
            {formatMetadata(
              getArtist(song),
              getAlbum(song),
              getYear(song)
            )}
          </Text>

          {onPlayNext && (
            <Pressable
              style={styles.menuItem}
              onPress={() => handleAction(onPlayNext)}
            >
              <SkipForward
                size={22}
                color={colors.primary}
              />

              <Text style={styles.menuText}>
                Play Next
              </Text>
            </Pressable>
          )}

          {onAddToQueue && (
            <Pressable
              style={styles.menuItem}
              onPress={() => handleAction(onAddToQueue)}
            >
              <ListPlus
                size={22}
                color={colors.primary}
              />

              <Text style={styles.menuText}>
                Add to Queue
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
  const { colors, styles } =
    useThemedStyles(createStyles);

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
          <Plus
            size={26}
            color={colors.primary}
          />
        </Pressable>
      )}

      {onRemoveFromPlaylist && (
        <Pressable
          onPress={onRemoveFromPlaylist}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel="Remove from playlist"
        >
          <Trash2
            size={20}
            color={colors.danger}
          />
        </Pressable>
      )}

      {(onPlayNext || onAddToQueue) && (
        <Pressable
          onPress={openMenu}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel="Song options"
        >
          <EllipsisVertical
            size={24}
            color={colors.muted}
          />
        </Pressable>
      )}

      {menuVisible && (
        <SongOptionsMenu
          song={song}
          colors={colors}
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
      marginBottom: 5,
    },

    menuSubtitle: {
      color: colors.muted,
      fontSize: 12,
      marginBottom: 14,
    },

    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
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