// src/components/PlaylistPicker.jsx

import { useState } from "react";
import { Modal, View, Text, Pressable, FlatList, StyleSheet, Alert } from "react-native";
import usePlaylistStore from "../store/usePlaylistStore";
import useThemedStyles from "../theme/useThemedStyles";

export default function PlaylistPicker({
  visible,
  song,
  onClose,
}) {
  const playlists = usePlaylistStore((s) => s.playlists);
  const addSong = usePlaylistStore((s) => s.addSong);
  const [busy, setBusy] = useState(false);
  const { styles } = useThemedStyles(createStyles);

  const handleSelect = async (playlist) => {
    if (!song || busy) return;

    setBusy(true);

    try {
      await addSong(playlist.id, song.id);
      onClose();
    } catch (error) {
      Alert.alert("Error", "Unable to add song to playlist.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.heading}>
            Add to Playlist
          </Text>

          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                disabled={busy}
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>
                  {item.name}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>
                No playlists yet. Create one in the
                Playlists tab.
              </Text>
            }
          />

          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

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
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    itemText: {
      color: colors.text,
      fontSize: 16,
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