// src/theme/useThemedStyles.js

import useTheme from "./useTheme";

const styleCache = new WeakMap();
const MAX_THEME_VARIANTS = 8;

export default function useThemedStyles(createStyles) {
  const colors = useTheme();

  const themeKey = `${colors.theme}:${colors.primary}`;

  let themes = styleCache.get(createStyles);

  if (!themes) {
    themes = new Map();
    styleCache.set(createStyles, themes);
  }

  let styles = themes.get(themeKey);

  if (!styles) {
    styles = createStyles(colors);

    if (themes.size >= MAX_THEME_VARIANTS) {
      const oldestKey = themes.keys().next().value;
      themes.delete(oldestKey);
    }

    themes.set(themeKey, styles);
  }

  return {
    colors,
    styles,
  };
}