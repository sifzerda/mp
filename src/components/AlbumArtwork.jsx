// src/components/AlbumArtwork.jsx

import { useCallback, useEffect, useState, memo } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Music } from "lucide-react-native";
import { getSongArtwork, getArtworkSize, getArtworkKey, peekSongArtwork, invalidateSongArtwork } from "../services/artworkService";
import useThemedStyles from "../theme/useThemedStyles";

/* -------------------- ARTWORK LOADING -------------------- */

function useSongArtwork(song, displaySize = 52) {
  
  const uri = song?.uri || song?.url || null;
  const size = getArtworkSize(displaySize);
  const version = String(song?.modificationTime ?? song?.modifiedAt ?? "");
  const key = getArtworkKey(uri, size, version);
  const [result, setResult] = useState(null);
  const [retryKey, setRetryKey] = useState(null);
  const retry = retryKey === key;

  useEffect(() => {
    let active = true;

    if (!uri) return;

    getSongArtwork(uri, size, version).then(
      (artwork) => {
        if (active) {
          setResult({
            key,
            artwork,
          });
        }
      }
    );

    return () => {
      active = false;
    };
  }, [uri, size, version, key, retry]);

  const artwork = result?.key === key ? result.artwork : peekSongArtwork(uri, size, version) ?? null;

  const handleError = useCallback(() => {
    invalidateSongArtwork(uri, size, version);

    setResult({
      key,
      artwork: null,
    });

    setRetryKey(key);
  }, [uri, size, version, key]);

  return {
    artwork,
    artworkKey: key,
    handleError,
  };
}

/* -------------------- COMPONENT -------------------- */

function AlbumArtwork({
  song,
  size = 52,
  borderRadius = 12,
}) {
  const { colors, styles } = useThemedStyles(createStyles);

  const {
    artwork,
    artworkKey,
    handleError,
  } = useSongArtwork(song, size);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
        },
      ]}
    >
      {artwork ? (
        <Image
          source={artwork}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory"
          recyclingKey={artworkKey}
          transition={0}
          allowDownscaling
          onError={handleError}
        />
      ) : (
        <Music
          size={size * 0.5}
          color={colors.primary}
          strokeWidth={2}
        />
      )}
    </View>
  );
}

export default memo(AlbumArtwork);

/* -------------------- STYLES -------------------- */

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      overflow: "hidden",
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },

    image: {
      width: "100%",
      height: "100%",
    },
  });