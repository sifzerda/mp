// src/screens/SettingsScreen.jsx

import { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import useSettingsStore from "../store/useSettingsStore";
import useTheme from "../theme/useTheme";
import { ACCENT_PRESETS } from "../theme/colors";
import ThemePreview from "../components/ThemePreview";

const THEMES = [
    { value: "light", label: "Light", icon: "☀" },
    { value: "dark", label: "Dark", icon: "☾" },
    { value: "system", label: "System", icon: "◐" },
];

export default function SettingsScreen({ navigation }) {
  const onBack = () => navigation.goBack();
    const theme = useSettingsStore((s) => s.theme);
    const accent = useSettingsStore((s) => s.accent);
    const setTheme = useSettingsStore((s) => s.setTheme);
    const setAccent = useSettingsStore((s) => s.setAccent);
    const resetSettings = useSettingsStore((s) => s.resetSettings);
    const colors = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Pressable onPress={onBack}>
                <Text style={styles.back}>‹ Library</Text>
            </Pressable>

            <Text style={styles.heading}>Settings</Text>

            <Text style={styles.sectionTitle}>
                APPEARANCE
            </Text>

            <View style={styles.panel}>
                <Text style={styles.label}>Theme</Text>

                <View style={styles.themeRow}>
                    {THEMES.map((item) => {
                        const selected = theme === item.value;

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
                                <Text
                                    style={[
                                        styles.themeIcon,
                                        selected && styles.selectedText,
                                    ]}
                                >
                                    {item.icon}
                                </Text>

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
                                        {
                                            backgroundColor: item.color,
                                        },
                                        selected && styles.selectedAccent,
                                    ]}
                                >
                                    {selected && (
                                        <Text style={styles.check}>
                                            ✓
                                        </Text>
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

            <Text style={styles.sectionTitle}>
                PLAYER PREVIEW
            </Text>

            <ThemePreview />

            <Pressable
                style={styles.resetButton}
                onPress={resetSettings}
            >
                <Text style={styles.resetText}>
                    Reset to defaults
                </Text>
            </Pressable>

            <Text style={styles.footer}>
                Appearance preferences are saved automatically.
            </Text>
        </ScrollView>
    );
}

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

        themeIcon: {
            color: colors.muted,
            fontSize: 32,
        },

        selectedText: {
            color: colors.primary,
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

        check: {
            color: colors.onPrimary,
            fontSize: 24,
            fontWeight: "bold",
        },

        resetButton: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 12,
            alignItems: "center",
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