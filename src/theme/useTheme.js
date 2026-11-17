// src/theme/useTheme.js

import { useMemo } from "react";
import { useColorScheme } from "react-native";

import useSettingsStore from "../store/useSettingsStore";
import { DARK_COLORS, LIGHT_COLORS } from "./colors";

function getContrastColor(hex) {
    const rgb = hex.replace("#", "");
    const channels = [0, 2, 4].map((index) => {
        const value = parseInt(rgb.slice(index, index + 2), 16) / 255;

        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });

    const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    return luminance > 0.179 ? "#000000" : "#ffffff";
}

export default function useTheme() {
    const theme = useSettingsStore((s) => s.theme);
    const accent = useSettingsStore((s) => s.accent);
    const systemTheme = useColorScheme();
    const resolvedTheme = theme === "system" ? systemTheme || "dark" : theme;

    return useMemo(() => {
        const isDark = resolvedTheme === "dark";

        return {
            ...(isDark ? DARK_COLORS : LIGHT_COLORS),
            primary: accent,
            onPrimary: getContrastColor(accent),
            accentSoft: `${accent}20`,
            isDark,
            theme: resolvedTheme,
        };
    }, [resolvedTheme, accent]);
}