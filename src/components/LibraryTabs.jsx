// src/components/LibraryTabs.jsx

import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import useMusicStore from "../store/useMusicStore";
import colors from "../theme/colors";

const TABS = ["Songs", "Artists", "Albums"];

export default function LibraryTabs() {
  const activeTab = useMusicStore((s) => s.activeTab);
  const setActiveTab = useMusicStore((s) => s.setActiveTab);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
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
    gap: 10,
    paddingBottom: 18,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.muted,
    fontWeight: "600",
  },
  activeLabel: {
    color: colors.text,
  },
});
