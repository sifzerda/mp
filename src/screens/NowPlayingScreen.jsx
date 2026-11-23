// src/screens/NowPlayingScreen.jsx

import { memo, useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useActiveTrack } from "react-native-track-player";
import { ChevronDown, Music2 } from "lucide-react-native";
import PlayerControls from "../components/PlayerControls";
import PlaybackProgress from "../components/PlaybackProgress";
import AlbumArtwork from "../components/AlbumArtwork";
import useCurrentSong from "../hooks/useCurrentSong";
import useThemedStyles from "../theme/useThemedStyles";
import { formatMetadata, getYear, getTrackNumber, getDiscNumber } from "../utils/musicUtils";

const MAX_ARTWORK_SIZE = 400;
const COMPACT_HEIGHT = 760;

function NowPlayingScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);
  const { height } = useWindowDimensions();
  const compact = height < COMPACT_HEIGHT;
  const [artworkSize, setArtworkSize] = useState(0);
  const track = useActiveTrack();
  const song = useCurrentSong(track);
  const isFocused = useIsFocused();
  const metadata = song ?? track ?? {};
  const title = song?.title || track?.title || "Unknown Title";
  const artist = song?.artist || track?.artist || "Unknown Artist";
  const album = song?.album || track?.album || "";
  const year = getYear(metadata);
  const trackNumber = getTrackNumber(metadata);
  const discNumber = getDiscNumber(metadata);
  const albumInfo = formatMetadata(album, year);
  const trackInfo = formatMetadata(discNumber > 1 ? `Disc ${discNumber}` : null, trackNumber != null ? `Track ${trackNumber}` : null, metadata.genre);

  /* -------------------- NAVIGATION -------------------- */

  const closePlayer = useCallback(() => { navigation.goBack() }, [navigation]);
  const openQueue = useCallback(() => { navigation.navigate("Queue") }, [navigation]);

  /* -------------------- RESPONSIVE ARTWORK -------------------- */

  const handleArtworkLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    const size = Math.max(0, Math.floor(Math.min(width, height, MAX_ARTWORK_SIZE)));

    setArtworkSize((current) => current === size ? current : size);
  }, []);

  /* -------------------- RENDER -------------------- */

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View
        style={[
          styles.header,
          compact && styles.compactHeader,
        ]}
      >
        <Pressable
          onPress={closePlayer}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Close player"
        >
          <ChevronDown
            size={26}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            NOW PLAYING
          </Text>

          <Text style={styles.headerSubtitle}>
            Music Library
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* EMPTY PLAYER */}

      {!track ? (
        <View style={styles.emptyContainer}>
          <Music2
            size={52}
            color={colors.muted}
            strokeWidth={1.5}
          />

          <Text style={styles.emptyTitle}>
            Nothing playing
          </Text>

          <Text style={styles.emptySubtitle}>
            Select a song from your library
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.content,
            compact && styles.compactContent,
          ]}
        >
          {/* FLEXIBLE ARTWORK AREA */}

          <View
            style={styles.artworkContainer}
            onLayout={handleArtworkLayout}
          >
            {artworkSize > 0 && (
              <View style={styles.artworkShadow}>
                <AlbumArtwork
                  song={song}
                  size={artworkSize}
                  borderRadius={20}
                />
              </View>
            )}
          </View>

          {/* TRACK INFORMATION */}

          <View
            style={[
              styles.trackInfo,
              compact && styles.compactTrackInfo,
            ]}
          >
            <Text
              style={[
                styles.title,
                compact && styles.compactTitle,
              ]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>

            <Text
              style={styles.artist}
              numberOfLines={1}
            >
              {artist}
            </Text>

            {!!albumInfo && (
              <Text
                style={styles.album}
                numberOfLines={1}
              >
                {albumInfo}
              </Text>
            )}

            {!!trackInfo && (
              <Text
                style={styles.metadata}
                numberOfLines={1}
              >
                {trackInfo}
              </Text>
            )}
          </View>

          {/* PLAYBACK */}

          <View
            style={[
              styles.playbackSection,
              compact && styles.compactPlaybackSection,
            ]}
          >
            <PlaybackProgress
              key={track.id}
              trackId={track.id}
              trackDuration={track.duration}
              enabled={isFocused}
            />

            <PlayerControls
              onOpenQueue={openQueue}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default memo(NowPlayingScreen);

/* -------------------- STYLES -------------------- */

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    /* HEADER */

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 8,
    },

    compactHeader: {
      paddingVertical: 4,
    },

    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },

    headerInfo: {
      flex: 1,
      alignItems: "center",
      gap: 4,
    },

    headerTitle: {
      color: colors.text,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 2,
    },

    headerSubtitle: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: "500",
    },

    headerSpacer: {
      width: 44,
    },

    /* MAIN CONTENT */

    content: {
      flex: 1,
      width: "100%",
      maxWidth: 500,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 20,
      gap: 16,
    },

    compactContent: {
      paddingTop: 6,
      paddingBottom: 10,
      gap: 10,
    },

    /* ARTWORK */

    artworkContainer: {
      flex: 1,
      minHeight: 0,
      alignItems: "center",
      justifyContent: "center",
    },

    artworkShadow: {
      borderRadius: 20,
      backgroundColor: colors.surface,
      elevation: 8,

      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },

    /* TRACK INFORMATION */

    trackInfo: {
      flexShrink: 0,
      gap: 5,
    },

    compactTrackInfo: {
      gap: 3,
    },

    title: {
      color: colors.text,
      fontSize: 27,
      fontWeight: "700",
      letterSpacing: -0.7,
    },

    compactTitle: {
      fontSize: 23,
    },

    artist: {
      color: colors.muted,
      fontSize: 15,
      fontWeight: "500",
    },

    album: {
      color: colors.muted,
      fontSize: 13,
    },

    metadata: {
      color: colors.muted,
      fontSize: 11,
    },

    /* PLAYBACK */

    playbackSection: {
      flexShrink: 0,
      gap: 16,
    },

    compactPlaybackSection: {
      gap: 8,
    },

    /* EMPTY PLAYER */

    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 24,
    },

    emptyTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "700",
    },

    emptySubtitle: {
      color: colors.muted,
      fontSize: 14,
      textAlign: "center",
    },
  });