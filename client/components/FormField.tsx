import React from "react";
import { StyleSheet, View, TextInput, TextInputProps } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";

interface FormFieldProps extends TextInputProps {
  label: string;
  maxLength?: number;
  value: string;
}

export function FormField({
  label,
  maxLength = 300,
  value,
  ...props
}: FormFieldProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </ThemedText>
        <ThemedText style={[styles.counter, { color: theme.textSecondary }]}>
          {value.length}/{maxLength}
        </ThemedText>
      </View>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundSecondary,
            color: theme.text,
            borderColor: theme.divider,
          },
        ]}
        placeholderTextColor={theme.textSecondary}
        multiline
        maxLength={maxLength}
        value={value}
        textAlignVertical="top"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  counter: {
    fontSize: 12,
    fontFamily: Fonts.mono,
  },
  input: {
    minHeight: 80,
    maxHeight: 120,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 24,
  },
});
