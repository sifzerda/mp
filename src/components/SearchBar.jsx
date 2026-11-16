// src/components/SearchBar.jsx

import { StyleSheet, TextInput, View } from "react-native";
import useMusicStore from "../store/useMusicStore";
import colors from "../theme/colors";

export default function SearchBar() {
  const search = useMusicStore((s) => s.search);
  const setSearch = useMusicStore((s) => s.setSearch);

  return (
    <View style={styles.container}>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search songs..."
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  input: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
