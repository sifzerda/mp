// src/components/PlaylistManager.jsx

import { useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, Alert, StyleSheet } from "react-native";
import usePlaylistStore from "../store/usePlaylistStore";
import useThemedStyles from "../theme/useThemedStyles";

export default function PlaylistManager({ onSelect }) {
    const playlists = usePlaylistStore((s) => s.playlists);
    const createPlaylist = usePlaylistStore((s) => s.createPlaylist);
    const renamePlaylist = usePlaylistStore((s) => s.renamePlaylist);
    const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist);
    const { colors, styles } = useThemedStyles(createStyles);
    const [name, setName] = useState("");

    const handleCreate = async () => {
        if (!name.trim()) return;

        try {
            await createPlaylist(name);
            setName("");
        } catch {
            Alert.alert("Error", "Unable to create playlist.");
        }
    };

    const handleRename = (playlist) => {
        // Rename input is shown in the screen, avoiding
        // Alert.prompt, which is unavailable on Android.
        setEditingId(playlist.id);
        setEditingName(playlist.name);
    };

    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    const saveRename = async () => {
        if (!editingName.trim()) return;

        try {
            await renamePlaylist(editingId, editingName);
            setEditingId(null);
            setEditingName("");
        } catch {
            Alert.alert("Error", "Unable to rename playlist.");
        }
    };

    const confirmDelete = (playlist) => {
        Alert.alert(
            "Delete playlist?",
            `Delete "${playlist.name}"? Your music files will not be deleted.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deletePlaylist(playlist.id),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.createRow}>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="New playlist name"
                    placeholderTextColor={colors.muted}
                    onSubmitEditing={handleCreate}
                />

                <Pressable style={styles.create} onPress={handleCreate}>
                    <Text style={styles.createText}>Create</Text>
                </Pressable>
            </View>

            <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.playlist}>
                        {editingId === item.id ? (
                            <View style={styles.editRow}>
                                <TextInput
                                    style={styles.input}
                                    value={editingName}
                                    onChangeText={setEditingName}
                                    autoFocus
                                />

                                <Pressable onPress={saveRename}>
                                    <Text style={styles.action}>Save</Text>
                                </Pressable>

                                <Pressable onPress={() => setEditingId(null)}>
                                    <Text style={styles.action}>Cancel</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <>
                                <Pressable
                                    style={styles.playlistName}
                                    onPress={() => onSelect(item)}
                                >
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.count}>
                                        {item.songIds.length} songs
                                    </Text>
                                </Pressable>

                                <Pressable onPress={() => handleRename(item)}>
                                    <Text style={styles.action}>Rename</Text>
                                </Pressable>

                                <Pressable onPress={() => confirmDelete(item)}>
                                    <Text style={styles.delete}>Delete</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.empty}>
                        No playlists created yet.
                    </Text>
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

    createRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },

    input: {
      flex: 1,
      minWidth: 0,
      color: colors.text,
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },

    create: {
      backgroundColor: colors.primary,
      paddingHorizontal: 15,
      justifyContent: "center",
      borderRadius: 10,
    },

    createText: {
      color: colors.onPrimary,
      fontWeight: "700",
    },

    playlist: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },

    playlistName: {
      flex: 1,
    },

    name: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },

    count: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 4,
    },

    action: {
      color: colors.primary,
      fontSize: 13,
    },

    delete: {
      color: colors.danger,
      fontSize: 13,
    },

    editRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    empty: {
      color: colors.muted,
      textAlign: "center",
      marginTop: 30,
    },
  });