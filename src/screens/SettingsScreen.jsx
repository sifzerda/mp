// src/screens/SettingsScreen.jsx

import { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Switch } from "react-native";
import { Headphones, Sun, Moon, Smartphone, ChevronLeft, Check, RotateCcw } from "lucide-react-native";
import useSettingsStore from "../store/useSettingsStore";
import useTheme from "../theme/useTheme";
import { ACCENT_PRESETS } from "../theme/colors";
import ThemePreview from "../components/ThemePreview";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Smartphone },
];

export default function SettingsScreen({ navigation }) {
  const theme = useSettingsStore((s) => s.theme);
  const accent = useSettingsStore((s) => s.accent);
  const pauseOnDisconnect = useSettingsStore((s) => s.pauseOnDisconnect);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setAccent = useSettingsStore((s) => s.setAccent);
  const setPauseOnDisconnect = useSettingsStore((s) => s.setPauseOnDisconnect);
  const resetSettings = useSettingsStore((s) => s.resetSettings);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Back to Library"
      >
        <ChevronLeft
          size={22}
          color={colors.primary}
        />

        <Text style={styles.back}>Library</Text>
      </Pressable>

      <Text style={styles.heading}>Settings</Text>

      {/* APPEARANCE */}

      <Text style={styles.sectionTitle}>
        APPEARANCE
      </Text>

      <View style={styles.panel}>
        <Text style={styles.label}>Theme</Text>

        <View style={styles.themeRow}>
          {THEMES.map((item) => {
            const selected = theme === item.value;
            const Icon = item.icon;

            return (
              <Pressable
                key={item.value}
                onPress={() => setTheme(item.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.themeButton,
                  selected && styles.selectedTheme,
                ]}
              >
                <Icon
                  size={30}
                  color={
                    selected
                      ? colors.primary
                      : colors.muted
                  }
                />

                <Text style={styles.optionLabel}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>
          Accent color
        </Text>

        <View style={styles.accentGrid}>
          {ACCENT_PRESETS.map((item) => {
            const selected = accent === item.color;

            return (
              <Pressable
                key={item.color}
                onPress={() => setAccent(item.color)}
                style={styles.accentOption}
                accessibilityRole="button"
                accessibilityLabel={item.name}
                accessibilityState={{ selected }}
              >
                <View
                  style={[
                    styles.accentCircle,
                    { backgroundColor: item.color },
                    selected && styles.selectedAccent,
                  ]}
                >
                  {selected && (
                    <Check
                      size={24}
                      color={colors.onPrimary}
                      strokeWidth={3}
                    />
                  )}
                </View>

                <Text style={styles.optionLabel}>
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* PLAYER PREVIEW */}

      <Text style={styles.sectionTitle}>
        PLAYER PREVIEW
      </Text>

      <ThemePreview />

      {/* PLAYBACK */}

      <Text style={styles.sectionTitle}>
        PLAYBACK
      </Text>

      <View style={styles.panel}>
        <View style={styles.settingRow}>
          <View style={styles.settingIcon}>
            <Headphones
              size={24}
              color={colors.primary}
            />
          </View>

          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>
              Pause on headphone disconnect
            </Text>

            <Text style={styles.settingDescription}>
              Automatically pause music when headphones
              are disconnected.
            </Text>
          </View>

          <Switch
            value={pauseOnDisconnect}
            onValueChange={setPauseOnDisconnect}
            trackColor={{
              false: colors.border,
              true: colors.primary,
            }}
            thumbColor="#ffffff"
            accessibilityLabel="Pause on headphone disconnect"
          />
        </View>
      </View>

      {/* RESET */}

      <Pressable
        style={styles.resetButton}
        onPress={resetSettings}
        accessibilityRole="button"
      >
        <RotateCcw
          size={18}
          color={colors.primary}
        />

        <Text style={styles.resetText}>
          Reset to defaults
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        Your preferences are saved automatically.
      </Text>
    </ScrollView>
  );
}

/* -------------------- STYLES -------------------- */

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 20,
      paddingBottom: 40,
      gap: 16,
    },

    backButton: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 4,
    },

    back: {
      color: colors.primary,
      fontSize: 16,
    },

    heading: {
      color: colors.text,
      fontSize: 32,
      fontWeight: "800",
      marginBottom: 8,
    },

    sectionTitle: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1.5,
      marginTop: 10,
    },

    panel: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      padding: 16,
      gap: 16,
    },

    label: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "700",
    },

    themeRow: {
      flexDirection: "row",
      gap: 10,
    },

    themeButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 18,
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      gap: 8,
    },

    selectedTheme: {
      borderColor: colors.primary,
      backgroundColor: colors.accentSoft,
    },

    optionLabel: {
      color: colors.text,
      fontSize: 12,
    },

    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },

    accentGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      rowGap: 18,
    },

    accentOption: {
      width: "25%",
      alignItems: "center",
      gap: 8,
    },

    accentCircle: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "transparent",
    },

    selectedAccent: {
      borderColor: colors.text,
    },

    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    settingIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.accentSoft,
      alignItems: "center",
      justifyContent: "center",
    },

    settingInfo: {
      flex: 1,
      gap: 5,
    },

    settingTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "700",
    },

    settingDescription: {
      color: colors.muted,
      fontSize: 12,
      lineHeight: 17,
    },

    resetButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
    },

    resetText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "700",
    },

    footer: {
      color: colors.muted,
      textAlign: "center",
      fontSize: 12,
    },
  });