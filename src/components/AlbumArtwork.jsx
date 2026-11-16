// src/components/AlbumArtwork.jsx

import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";

import { getSongArtwork } from "../services/artworkService";
import colors from "../theme/colors";

export default function AlbumArtwork({
  song,
  size = 52,
  borderRadius = 12,
}) {
  const [artwork, setArtwork] = useState(null);

  // Library songs use "uri".
  // TrackPlayer tracks use "url".
  const songUri = song?.uri || song?.url || null;

  useEffect(() => {
    let active = true;

    setArtwork(null);

    if (songUri) {
      getSongArtwork(songUri)
        .then((uri) => {
          if (active) {
            setArtwork(uri);
          }
        })
        .catch((error) => {
          console.warn("Failed to load album artwork:", error);
        });
    }

    return () => {
      active = false;
    };
  }, [songUri]);

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
          source={{ uri: artwork }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={[
            styles.placeholder,
            { fontSize: size * 0.5 },
          ]}
        >
          ♫
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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

  placeholder: {
    color: colors.primary,
  },
});
