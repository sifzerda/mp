// src/components/SongItem.jsx

import { View, Text, Pressable, StyleSheet } from "react-native";
import colors from "../theme/colors";

function formatDuration(seconds) {
  const total = Math.floor(seconds || 0);
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export default function SongItem({ song }) {
  return (
    <Pressable style={styles.container}>
      <View style={styles.artwork}>
        <Text style={styles.note}>♫</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {song.title}
        </Text>

        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>

      <Text style={styles.duration}>
        {formatDuration(song.duration)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    gap: 12,
  },
  artwork: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  note: {
    color: colors.primary,
    fontSize: 27,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  artist: {
    color: colors.muted,
    fontSize: 13,
  },
  duration: {
    color: colors.muted,
    fontSize: 12,
  },
});
