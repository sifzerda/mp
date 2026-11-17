// src/components/LibraryTabs.jsx

import {
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";

import useMusicStore from "../store/useMusicStore";
import useThemedStyles from "../theme/useThemedStyles";

const TABS = [
  "Songs",
  "Artists",
  "Albums",
  "Favorites",
  "Playlists",
];

export default function LibraryTabs() {
  const { styles } = useThemedStyles(createStyles);

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
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
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

const createStyles = (colors) =>
  StyleSheet.create({
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
      color: colors.onPrimary,
      fontWeight: "700",
    },
  });