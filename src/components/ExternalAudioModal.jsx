// src/components/ExternalAudioModal.jsx

import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import {
  Music2,
  Files,
  Play,
  Download,
  ListMusic,
  ChevronRight,
  X,
} from "lucide-react-native";

import useThemedStyles from "../theme/useThemedStyles";

const ACTIONS = [
  {
    id: "play",
    title: "Play now",
    description: "Play without importing",
    Icon: Play,
  },
  {
    id: "import",
    title: "Import to library",
    description: "Save a permanent copy",
    Icon: Download,
  },
  {
    id: "import-play",
    title: "Import and play",
    description: "Save and start playback",
    Icon: ListMusic,
  },
];

export default function ExternalAudioModal({
  visible,
  songs,
  busy,
  close,
  performAction,
}) {
  const { colors, styles } =
    useThemedStyles(createStyles);

  const multiple = songs.length > 1;
  const first = songs[0];

  const FileIcon = multiple ? Files : Music2;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          disabled={busy}
        />

        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.heading}>
              {multiple
                ? "Open audio files"
                : "Open audio file"}
            </Text>

            <Pressable
              onPress={close}
              disabled={busy}
              hitSlop={12}
            >
              <X
                size={24}
                color={colors.text}
              />
            </Pressable>
          </View>

          <View style={styles.fileSummary}>
            <View style={styles.fileIcon}>
              <FileIcon
                size={32}
                color={colors.primary}
              />
            </View>

            <View style={styles.fileDetails}>
              <Text
                style={styles.title}
                numberOfLines={2}
              >
                {multiple
                  ? `${songs.length} audio files`
                  : first?.title}
              </Text>

              {!multiple && (
                <>
                  <Text
                    style={styles.secondary}
                    numberOfLines={1}
                  >
                    {first?.artist}
                  </Text>

                  <Text
                    style={styles.secondary}
                    numberOfLines={1}
                  >
                    {first?.filename}
                  </Text>
                </>
              )}
            </View>
          </View>

          {multiple && (
            <ScrollView
              style={styles.fileList}
              nestedScrollEnabled
            >
              {songs.map((song) => (
                <View
                  key={song.uri}
                  style={styles.fileRow}
                >
                  <Music2
                    size={18}
                    color={colors.primary}
                  />

                  <Text
                    style={styles.fileName}
                    numberOfLines={1}
                  >
                    {song.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {busy ? (
            <View style={styles.processing}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />

              <Text style={styles.secondary}>
                Processing audio files...
              </Text>
            </View>
          ) : (
            <>
              {ACTIONS.map((action) => {
                const Icon = action.Icon;

                return (
                  <Pressable
                    key={action.id}
                    style={({ pressed }) => [
                      styles.action,
                      pressed && styles.pressed,
                    ]}
                    onPress={() =>
                      performAction(action.id)
                    }
                  >
                    <Icon
                      size={24}
                      color={colors.primary}
                    />

                    <View style={styles.actionText}>
                      <Text style={styles.actionTitle}>
                        {action.title}
                      </Text>

                      <Text style={styles.secondary}>
                        {action.description}
                      </Text>
                    </View>

                    <ChevronRight
                      size={20}
                      color={colors.text}
                    />
                  </Pressable>
                );
              })}

              <Pressable
                style={styles.cancel}
                onPress={close}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: "rgba(0,0,0,0.65)",
    },

    modal: {
      width: "100%",
      maxWidth: 440,
      maxHeight: "90%",
      padding: 20,
      borderRadius: 24,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    heading: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },

    fileSummary: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 12,
    },

    fileIcon: {
      width: 64,
      height: 64,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },

    fileDetails: {
      flex: 1,
      gap: 4,
    },

    title: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.text,
    },

    secondary: {
      fontSize: 13,
      color: colors.text,
      opacity: 0.65,
    },

    fileList: {
      maxHeight: 140,
    },

    fileRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 8,
    },

    fileName: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
    },

    action: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },

    pressed: {
      opacity: 0.65,
    },

    actionText: {
      flex: 1,
      gap: 4,
    },

    actionTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },

    cancel: {
      padding: 12,
      alignItems: "center",
    },

    cancelText: {
      color: colors.text,
      fontSize: 15,
      opacity: 0.7,
    },

    processing: {
      padding: 24,
      alignItems: "center",
      gap: 16,
    },
  });