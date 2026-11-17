// src/screens/QueueScreen.jsx

import { memo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";

import AlbumArtwork from "../components/AlbumArtwork";

import useCurrentSong from "../hooks/useCurrentSong";
import usePlaybackQueue from "../hooks/usePlaybackQueue";
import useThemedStyles from "../theme/useThemedStyles";

const keyExtractor = (item) => String(item.id);

/* -------------------- SONG INFORMATION -------------------- */

const QueueSongInformation = memo(
  function QueueSongInformation({
    track,
    current = false,
  }) {
    const { styles } = useThemedStyles(createStyles);
    const song = useCurrentSong(track);

    return (
      <>
        <AlbumArtwork
          song={song}
          size={current ? 56 : 48}
          borderRadius={current ? 10 : 9}
        />

        <View style={styles.songText}>
          <Text
            style={styles.songTitle}
            numberOfLines={1}
          >
            {track.title || "Unknown title"}
          </Text>

          <Text
            style={styles.songArtist}
            numberOfLines={1}
          >
            {track.artist || "Unknown artist"}
          </Text>
        </View>
      </>
    );
  }
);

/* -------------------- QUEUE ITEM -------------------- */

const QueueItem = memo(function QueueItem({
  item,
  drag,
  isActive,
  getIndex,
  busy,
  onPlay,
  onRemove,
}) {
  const { styles } = useThemedStyles(createStyles);

  const disabled = busy || isActive;

  function handlePlay() {
    const index = getIndex();

    if (index != null) {
      onPlay(index, item.id);
    }
  }

  function handleRemove() {
    const index = getIndex();

    if (index != null) {
      onRemove(index, item.id);
    }
  }

  return (
    <ScaleDecorator activeScale={1.03}>
      <View
        style={[
          styles.songRow,
          isActive && styles.activeRow,
        ]}
      >
        <Pressable
          style={styles.songDetails}
          disabled={disabled}
          onPress={handlePlay}
          accessibilityRole="button"
          accessibilityLabel={`Play ${item.title}`}
        >
          <QueueSongInformation track={item} />
        </Pressable>

        <Pressable
          style={styles.actionButton}
          disabled={disabled}
          onPress={handleRemove}
          accessibilityRole="button"
          accessibilityLabel="Remove from queue"
        >
          <Text style={styles.removeIcon}>✕</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onLongPress={drag}
          delayLongPress={150}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Reorder ${item.title}`}
          accessibilityHint="Long press and drag"
        >
          <Text style={styles.dragIcon}>≡</Text>
        </Pressable>
      </View>
    </ScaleDecorator>
  );
});

/* -------------------- CURRENT TRACK -------------------- */

const CurrentTrack = memo(function CurrentTrack({
  track,
}) {
  const { styles } = useThemedStyles(createStyles);

  if (!track) {
    return (
      <Text style={styles.empty}>
        No song playing
      </Text>
    );
  }

  return (
    <View style={styles.currentRow}>
      <QueueSongInformation
        track={track}
        current
      />

      <Text style={styles.playingIcon}>♫</Text>
    </View>
  );
});

/* -------------------- EMPTY QUEUE -------------------- */

const EmptyQueue = memo(function EmptyQueue() {
  const { styles } = useThemedStyles(createStyles);

  return (
    <Text style={styles.empty}>
      No upcoming songs
    </Text>
  );
});

/* -------------------- SCREEN -------------------- */

function QueueScreen({ navigation }) {
  const { colors, styles } =
    useThemedStyles(createStyles);

  const {
    currentTrack,
    upcoming,
    loading,
    busy,
    error,
    refresh,
    handlePlay,
    handleRemove,
    handleDragBegin,
    handleDragEnd,
  } = usePlaybackQueue();

  const closeQueue = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }) => (
      <QueueItem
        item={item}
        drag={drag}
        isActive={isActive}
        getIndex={getIndex}
        busy={busy}
        onPlay={handlePlay}
        onRemove={handleRemove}
      />
    ),
    [busy, handlePlay, handleRemove]
  );

  return (
    <View style={styles.container}>
      <Pressable onPress={closeQueue}>
        <Text style={styles.back}>
          ‹ Now Playing
        </Text>
      </Pressable>

      <Text style={styles.heading}>
        Playback Queue
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            color={colors.primary}
            size="large"
          />
        </View>
      ) : (
        <>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.error}>
                {error}
              </Text>

              <Pressable
                onPress={refresh}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>
                  Try Again
                </Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.sectionTitle}>
            NOW PLAYING
          </Text>

          <CurrentTrack track={currentTrack} />

          <Text style={styles.sectionTitle}>
            UP NEXT ({upcoming.length})
          </Text>

          {upcoming.length > 1 && (
            <Text style={styles.hint}>
              Hold and drag ≡ to reorder songs
            </Text>
          )}

          <DraggableFlatList
            data={upcoming}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onDragBegin={handleDragBegin}
            onDragEnd={handleDragEnd}
            extraData={busy}
            activationDistance={5}
            autoscrollThreshold={70}
            autoscrollSpeed={100}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={7}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={EmptyQueue}
          />
        </>
      )}
    </View>
  );
}

export default memo(QueueScreen);

/* -------------------- STYLES -------------------- */

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    back: {
      color: colors.primary,
      fontSize: 16,
      marginBottom: 18,
    },

    heading: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 24,
    },

    sectionTitle: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1,
      marginTop: 12,
      marginBottom: 12,
    },

    hint: {
      color: colors.muted,
      fontSize: 12,
      marginBottom: 14,
    },

    currentRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceAlt,
      borderRadius: 14,
      padding: 12,
      gap: 12,
      marginBottom: 20,
    },

    playingIcon: {
      color: colors.primary,
      fontSize: 24,
    },

    songRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 10,
      marginBottom: 8,
    },

    activeRow: {
      backgroundColor: colors.surfaceAlt,
      elevation: 10,
    },

    songDetails: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    songText: {
      flex: 1,
      minWidth: 0,
    },

    songTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },

    songArtist: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 4,
    },

    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 10,
    },

    removeIcon: {
      color: colors.danger,
      fontSize: 18,
    },

    dragIcon: {
      color: colors.muted,
      fontSize: 26,
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    empty: {
      color: colors.muted,
      textAlign: "center",
      paddingVertical: 24,
    },

    listContent: {
      paddingBottom: 30,
    },

    errorContainer: {
      alignItems: "center",
      padding: 12,
      gap: 10,
    },

    error: {
      color: colors.danger,
      textAlign: "center",
    },

    retryButton: {
      backgroundColor: colors.surface,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
    },

    retryText: {
      color: colors.primary,
      fontWeight: "700",
    },
  });