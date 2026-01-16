import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, TextInput, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getUserThemes } from "@/lib/storage";

interface ThemeEditorProps {
  themes: string[];
  onChange: (themes: string[]) => void;
  disabled?: boolean;
}

export function ThemeEditor({ themes, onChange, disabled = false }: ThemeEditorProps) {
  const { theme: appTheme } = useTheme();
  const [inputValue, setInputValue] = useState("");
  const [userThemes, setUserThemes] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadUserThemes();
  }, []);

  const loadUserThemes = async () => {
    const saved = await getUserThemes();
    setUserThemes(saved);
  };

  const suggestions = userThemes
    .filter(
      (t) =>
        t.toLowerCase().includes(inputValue.toLowerCase()) &&
        !themes.includes(t) &&
        inputValue.length > 0
    )
    .slice(0, 5);

  const handleAddTheme = useCallback((themeText: string) => {
    const trimmed = themeText.trim().toLowerCase();
    if (trimmed && !themes.includes(trimmed)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange([...themes, trimmed]);
      setInputValue("");
      setShowSuggestions(false);
    }
  }, [themes, onChange]);

  const handleRemoveTheme = useCallback((themeToRemove: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(themes.filter((t) => t !== themeToRemove));
  }, [themes, onChange]);

  const handleSubmit = () => {
    handleAddTheme(inputValue);
  };

  if (disabled && themes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.label, { color: appTheme.textSecondary }]}>
        THEMES
      </ThemedText>

      {themes.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.themesRow}
        >
          {themes.map((t) => (
            <View
              key={t}
              style={[styles.themeTag, { backgroundColor: appTheme.backgroundSecondary }]}
            >
              <ThemedText style={styles.themeTagText}>{t}</ThemedText>
              {!disabled ? (
                <Pressable
                  onPress={() => handleRemoveTheme(t)}
                  style={styles.removeButton}
                  hitSlop={8}
                >
                  <Feather name="x" size={14} color={appTheme.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </ScrollView>
      ) : null}

      {!disabled ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: appTheme.backgroundSecondary,
                color: appTheme.text,
                borderColor: appTheme.divider,
              },
            ]}
            placeholder="Add a theme..."
            placeholderTextColor={appTheme.textSecondary}
            value={inputValue}
            onChangeText={(text) => {
              setInputValue(text);
              setShowSuggestions(text.length > 0);
            }}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
            autoCapitalize="none"
          />
          {inputValue.trim() ? (
            <Pressable
              onPress={handleSubmit}
              style={[styles.addButton, { backgroundColor: appTheme.text }]}
            >
              <Feather name="plus" size={18} color={appTheme.backgroundRoot} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {showSuggestions && suggestions.length > 0 ? (
        <View
          style={[
            styles.suggestionsContainer,
            { backgroundColor: appTheme.backgroundDefault, borderColor: appTheme.divider },
          ]}
        >
          <ThemedText style={[styles.suggestionsLabel, { color: appTheme.textSecondary }]}>
            Your themes
          </ThemedText>
          <View style={styles.suggestionsRow}>
            {suggestions.map((s) => (
              <Pressable
                key={s}
                onPress={() => handleAddTheme(s)}
                style={[styles.suggestionTag, { borderColor: appTheme.divider }]}
              >
                <ThemedText style={styles.suggestionText}>{s}</ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  themesRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  themeTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  themeTagText: {
    fontSize: 13,
    fontWeight: "500",
  },
  removeButton: {
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 14,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionsContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  suggestionsLabel: {
    fontSize: 11,
    marginBottom: Spacing.sm,
  },
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  suggestionTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 13,
  },
});
