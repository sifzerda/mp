// src/components/SearchBar.jsx

import { View, TextInput, StyleSheet } from "react-native";
import { Search, X } from "lucide-react-native";
import { Pressable } from "react-native";
import useThemedStyles from "../theme/useThemedStyles";

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search songs...",
}) {
  const { colors, styles } =
    useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <Search
        color={colors.muted}
        size={20}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        autoCorrect={false}
        style={styles.input}
      />

      {!!value && (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={10}
        >
          <X color={colors.muted} size={20} />
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      height: 48,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },

    input: {
      flex: 1,
      height: "100%",
      color: colors.text,
      fontSize: 15,
      paddingVertical: 0,
    },
  });