// src/components/LibraryTabs.jsx

import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import useMusicStore from "../store/useMusicStore";
import colors from "../theme/colors";

const TABS = ["Songs", "Artists", "Albums", "Favorites", "Playlists"];

export default function LibraryTabs() {
  const activeTab = useMusicStore((s) => s.activeTab);
  const setActiveTab = useMusicStore((s) => s.setActiveTab);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab;

        return (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              active && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.label,
                active && styles.activeLabel,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    marginBottom: 18,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  activeLabel: {
    color: "#08121f",
    fontWeight: "700",
  },
});