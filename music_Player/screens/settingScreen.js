import React, { useContext } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { ThemeContext } from "../App";

export default function SettingsScreen() {
  const { isDark, setIsDark } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#ffffff" },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: isDark ? "#ffffff" : "#000000" },
        ]}
      >
        Dark Mode
      </Text>

       <Switch
        value={isDark}
        onValueChange={setIsDark} // ✅ directly pass updater
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
});
