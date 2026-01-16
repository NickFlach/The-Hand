import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";

interface AddendumSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

const MAX_LENGTH = 300;

export function AddendumSheet({ visible, onClose, onSubmit }: AddendumSheetProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSubmit(content.trim());
      setContent("");
      onClose();
    }
  };

  const handleClose = () => {
    setContent("");
    onClose();
  };

  const isValid = content.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.backgroundDefault,
              paddingBottom: insets.bottom + Spacing.lg,
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <ThemedText type="h3">Add Note</ThemedText>
            <View style={styles.headerButtons}>
              <Pressable onPress={handleClose} style={styles.headerButton}>
                <ThemedText style={{ color: theme.textSecondary }}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                style={[styles.headerButton, { opacity: isValid ? 1 : 0.5 }]}
                disabled={!isValid}
              >
                <ThemedText style={{ fontWeight: "600" }}>Save</ThemedText>
              </Pressable>
            </View>
          </View>
          <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
            This note will be timestamped separately and appended to the original entry.
          </ThemedText>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.divider,
                },
              ]}
              placeholder="What would you add?"
              placeholderTextColor={theme.textSecondary}
              multiline
              maxLength={MAX_LENGTH}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
              autoFocus
            />
            <ThemedText style={[styles.counter, { color: theme.textSecondary }]}>
              {content.length}/{MAX_LENGTH}
            </ThemedText>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#C4C4C4",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  headerButtons: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  headerButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  input: {
    minHeight: 100,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  counter: {
    fontSize: 12,
    fontFamily: Fonts.mono,
    textAlign: "right",
    marginTop: Spacing.sm,
  },
});
