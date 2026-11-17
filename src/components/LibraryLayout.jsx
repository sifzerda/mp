// src/components/LibraryLayout.jsx

import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import {
  Settings,
  RefreshCw,
  ChevronLeft,
} from "lucide-react-native";

import { useNavigation } from "@react-navigation/native";

import useMusicStore from "../store/useMusicStore";
import useThemedStyles from "../theme/useThemedStyles";

export default function LibraryLayout({
  title,
  subtitle,
  showBack = false,
  showRefresh = true,
  children,
}) {
  const navigation = useNavigation();

  const { colors, styles } =
    useThemedStyles(createStyles);

  const loadSongs = useMusicStore((s) => s.loadSongs);
  const loading = useMusicStore((s) => s.loading);

  return (
    <View style={styles.container}>
      {showBack && (
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft
            color={colors.primary}
            size={22}
          />

          <Text style={styles.backText}>Back</Text>
        </Pressable>
      )}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text
            style={styles.heading}
            numberOfLines={2}
          >
            {title}
          </Text>

          {!!subtitle && (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>

        {showRefresh && (
          <Pressable
            onPress={loadSongs}
            disabled={loading}
            style={[
              styles.iconButton,
              loading && styles.disabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Refresh music"
          >
            <RefreshCw
              size={22}
              color={colors.primary}
            />
          </Pressable>
        )}

        <Pressable
          onPress={() => navigation.navigate("Settings")}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Settings
            size={24}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingTop: 20,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
      gap: 5,
    },

    headerText: {
      flex: 1,
    },

    heading: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "800",
    },

    subtitle: {
      color: colors.muted,
      fontSize: 13,
      marginTop: 5,
    },

    iconButton: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
    },

    disabled: {
      opacity: 0.4,
    },

    back: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      marginBottom: 15,
    },

    backText: {
      color: colors.primary,
      fontSize: 16,
    },

    content: {
      flex: 1,
    },
  });