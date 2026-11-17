// src/screens/NowPlayingScreen.jsx

import { memo, useCallback } from "react";

import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { useActiveTrack } from "react-native-track-player";

import { ChevronDown, Music2 } from "lucide-react-native";

import PlayerControls from "../components/PlayerControls";
import PlaybackProgress from "../components/PlaybackProgress";
import AlbumArtwork from "../components/AlbumArtwork";

import useCurrentSong from "../hooks/useCurrentSong";
import useThemedStyles from "../theme/useThemedStyles";

function NowPlayingScreen({ navigation }) {
  const { colors, styles } = useThemedStyles(createStyles);

  const { width, height } = useWindowDimensions();

  const track = useActiveTrack();
  const artworkSong = useCurrentSong(track);
  const isFocused = useIsFocused();

  const artworkSize = Math.min(
    width - 48,
    height * 0.36,
    400
  );

  const closePlayer = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const openQueue = useCallback(() => {
    navigation.navigate("Queue");
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
        >
          <View style={styles.artworkContainer}>
            <View style={styles.artworkShadow}>
              <AlbumArtwork
                song={artworkSong}
                size={artworkSize}
                borderRadius={20}
              />
            </View>
          </View>

          <View style={styles.trackInfo}>
            <Text
              style={styles.title}
              numberOfLines={2}
            >
              {track.title || "Unknown title"}
            </Text>

            <Text
              style={styles.artist}
              numberOfLines={1}
            >
              {track.artist || "Unknown artist"}
            </Text>
          </View>

          <PlaybackProgress
            key={track.id}
            trackId={track.id}
            trackDuration={track.duration}
            enabled={isFocused}
          />

          <PlayerControls onOpenQueue={openQueue} />
        </ScrollView>
      )}
    </SafeAreaView>
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

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 8,
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

    scrollView: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      width: "100%",
      maxWidth: 500,
      alignSelf: "center",
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 24,
      gap: 18,
    },

    artworkContainer: {
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

    trackInfo: {
      gap: 5,
    },

    title: {
      color: colors.text,
      fontSize: 27,
      fontWeight: "700",
      letterSpacing: -0.7,
    },

    artist: {
      color: colors.muted,
      fontSize: 15,
      fontWeight: "500",
    },

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