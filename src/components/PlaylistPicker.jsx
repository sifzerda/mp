// src/components/PlaylistPicker.jsx

import {
  memo,
  useState,
  useRef,
  useCallback,
} from "react";

import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import { Check } from "lucide-react-native";

import usePlaylistStore from "../store/usePlaylistStore";
import useThemedStyles from "../theme/useThemedStyles";

import { playlistContainsSong } from "../utils/musicUtils";

const keyExtractor = (item) => item.id;

const PlaylistOption = memo(function PlaylistOption({
  playlist,
  songId,
  busy,
  onSelect,
}) {
  const { colors, styles } = useThemedStyles(createStyles);

  const added = playlistContainsSong(playlist, songId);

  return (
    <Pressable
      disabled={busy || added}
      style={styles.item}
      onPress={() => onSelect(playlist.id)}
      accessibilityRole="button"
      accessibilityState={{
        disabled: busy || added,
      }}
    >
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}>
          {playlist.name}
        </Text>

        <Text style={styles.count}>
          {playlist.songIds.length} songs
        </Text>
      </View>

      {added && (
        <View style={styles.addedRow}>
          <Check
            size={16}
            color={colors.success}
          />

          <Text style={styles.added}>Added</Text>
        </View>
      )}
    </Pressable>
  );
});

const EmptyPlaylists = memo(function EmptyPlaylists() {
  const { styles } = useThemedStyles(createStyles);

  return (
    <Text style={styles.empty}>
      No playlists yet. Create one in the Playlists tab.
    </Text>
  );
});

function PlaylistPickerContent({
  song,
  onClose,
}) {
  const { styles } = useThemedStyles(createStyles);

  const playlists = usePlaylistStore(
    (s) => s.playlists
  );

  const addSong = usePlaylistStore(
    (s) => s.addSong
  );

  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const songId = song.id;

  const handleSelect = useCallback(
    async (playlistId) => {
      if (busyRef.current) return;

      busyRef.current = true;
      setBusy(true);

      try {
        await addSong(playlistId, songId);
        onClose();
      } catch {
        Alert.alert(
          "Error",
          "Unable to save song to playlist."
        );
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [addSong, songId, onClose]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <PlaylistOption
        playlist={item}
        songId={songId}
        busy={busy}
        onSelect={handleSelect}
      />
    ),
    [songId, busy, handleSelect]
  );

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={busy ? () => {} : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.heading}>
            Add to Playlist
          </Text>

          <FlatList
            data={playlists}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListEmptyComponent={EmptyPlaylists}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
          />

          <Pressable
            disabled={busy}
            onPress={onClose}
            style={styles.close}
          >
            <Text style={styles.closeText}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default memo(function PlaylistPicker({
  visible,
  song,
  onClose,
}) {
  if (!visible || !song) return null;

  return (
    <PlaylistPickerContent
      key={String(song.id)}
      song={song}
      onClose={onClose}
    />
  );
});

/* -------------------- STYLES -------------------- */

const createStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      padding: 24,
    },

    modal: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      maxHeight: "70%",
    },

    heading: {
      color: colors.text,
      fontSize: 21,
      fontWeight: "700",
      marginBottom: 16,
    },

    item: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    itemDetails: {
      flex: 1,
    },

    itemText: {
      color: colors.text,
      fontSize: 16,
    },

    count: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 4,
    },

    addedRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    added: {
      color: colors.success,
      fontSize: 13,
      fontWeight: "600",
    },

    empty: {
      color: colors.muted,
      paddingVertical: 20,
    },

    close: {
      marginTop: 18,
      alignItems: "center",
    },

    closeText: {
      color: colors.primary,
      fontSize: 16,
    },
  });