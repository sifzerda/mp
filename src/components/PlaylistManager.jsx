// src/components/PlaylistManager.jsx

import {
  memo,
  useCallback,
  useState,
  useRef,
} from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Alert,
  StyleSheet,
} from "react-native";

import usePlaylistStore from "../store/usePlaylistStore";
import useThemedStyles from "../theme/useThemedStyles";

const keyExtractor = (item) => item.id;

const CreatePlaylist = memo(function CreatePlaylist() {
  const { colors, styles } =
    useThemedStyles(createStyles);

  const createPlaylist = usePlaylistStore(
    (s) => s.createPlaylist
  );

  const [name, setName] = useState("");
  const busy = useRef(false);

  async function handleCreate() {
    if (!name.trim() || busy.current) return;

    busy.current = true;

    try {
      await createPlaylist(name);

      setName((current) =>
        current === name ? "" : current
      );
    } catch {
      Alert.alert(
        "Error",
        "Unable to save playlist."
      );
    } finally {
      busy.current = false;
    }
  }

  return (
    <View style={styles.createRow}>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="New playlist name"
        placeholderTextColor={colors.muted}
        onSubmitEditing={handleCreate}
      />

      <Pressable
        style={styles.create}
        onPress={handleCreate}
      >
        <Text style={styles.createText}>
          Create
        </Text>
      </Pressable>
    </View>
  );
});

const PlaylistRow = memo(function PlaylistRow({
  playlist,
  onSelect,
}) {
  const { styles } = useThemedStyles(createStyles);

  const renamePlaylist = usePlaylistStore(
    (s) => s.renamePlaylist
  );

  const deletePlaylist = usePlaylistStore(
    (s) => s.deletePlaylist
  );

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  const busy = useRef(false);

  function startEditing() {
    setName(playlist.name);
    setEditing(true);
  }

  async function saveRename() {
    if (!name.trim() || busy.current) return;

    busy.current = true;

    try {
      await renamePlaylist(playlist.id, name);
      setEditing(false);
    } catch {
      Alert.alert(
        "Error",
        "Unable to save playlist name."
      );
    } finally {
      busy.current = false;
    }
  }

  function confirmDelete() {
    Alert.alert(
      "Delete playlist?",
      `Delete "${playlist.name}"? Your music files will not be deleted.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlaylist(playlist.id);
            } catch {
              Alert.alert(
                "Error",
                "Unable to save playlist deletion."
              );
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.playlist}>
      {editing ? (
        <View style={styles.editRow}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            onSubmitEditing={saveRename}
            autoFocus
          />

          <Pressable onPress={saveRename}>
            <Text style={styles.action}>
              Save
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setEditing(false)}
          >
            <Text style={styles.action}>
              Cancel
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Pressable
            style={styles.playlistName}
            onPress={() => onSelect(playlist)}
          >
            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {playlist.name}
            </Text>

            <Text style={styles.count}>
              {playlist.songIds.length} songs
            </Text>
          </Pressable>

          <Pressable onPress={startEditing}>
            <Text style={styles.action}>
              Rename
            </Text>
          </Pressable>

          <Pressable onPress={confirmDelete}>
            <Text style={styles.delete}>
              Delete
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
});

const EmptyPlaylists = memo(function EmptyPlaylists() {
  const { styles } = useThemedStyles(createStyles);

  return (
    <Text style={styles.empty}>
      No playlists created yet.
    </Text>
  );
});

function PlaylistManager({ onSelect }) {
  const { styles } = useThemedStyles(createStyles);

  const playlists = usePlaylistStore(
    (s) => s.playlists
  );

  const renderItem = useCallback(
    ({ item }) => (
      <PlaylistRow
        playlist={item}
        onSelect={onSelect}
      />
    ),
    [onSelect]
  );

  return (
    <View style={styles.container}>
      <CreatePlaylist />

      <FlatList
        data={playlists}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={EmptyPlaylists}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

export default memo(PlaylistManager);

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
      minWidth: 0,
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