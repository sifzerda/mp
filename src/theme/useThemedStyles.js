// src/theme/useThemedStyles.js

import { useMemo } from "react";
import useTheme from "./useTheme";

export default function useThemedStyles(createStyles) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [createStyles, colors]);

  return { colors, styles };
}
