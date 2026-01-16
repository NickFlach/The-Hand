import React, { useState } from "react";
import { StyleSheet, View, Pressable, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { Attachment } from "@/types/entry";
import { addAttachment, removeAttachment } from "@/lib/storage";

interface AttachmentManagerProps {
  entryId: string;
  attachments: Attachment[];
  disabled?: boolean;
  onUpdate?: () => void;
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "file-text";
  if (mimeType.startsWith("text/")) return "file";
  return "paperclip";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentManager({
  entryId,
  attachments,
  disabled = false,
  onUpdate,
}: AttachmentManagerProps) {
  const { theme } = useTheme();
  const [adding, setAdding] = useState(false);

  const handleAddAttachment = async (type: "image" | "document") => {
    setAdding(true);

    try {
      let result;

      if (type === "image") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission needed", "Please allow access to your photos.");
          setAdding(false);
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.8,
        });

        if (result.canceled || !result.assets[0]) {
          setAdding(false);
          return;
        }

        const asset = result.assets[0];
        const filename = asset.fileName || `image-${Date.now()}.jpg`;
        const mimeType = asset.mimeType || "image/jpeg";

        // Copy to app's document directory for persistence
        const destDir = `${FileSystem.documentDirectory}attachments/`;
        await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
        const destUri = `${destDir}${Date.now()}-${filename}`;
        await FileSystem.copyAsync({ from: asset.uri, to: destUri });

        await addAttachment(entryId, {
          filename,
          mimeType,
          localUri: destUri,
        });
      } else {
        result = await DocumentPicker.getDocumentAsync({
          type: ["application/pdf", "text/plain", "text/*"],
          copyToCacheDirectory: true,
        });

        if (result.canceled || !result.assets[0]) {
          setAdding(false);
          return;
        }

        const asset = result.assets[0];

        // Copy to app's document directory for persistence
        const destDir = `${FileSystem.documentDirectory}attachments/`;
        await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
        const destUri = `${destDir}${Date.now()}-${asset.name}`;
        await FileSystem.copyAsync({ from: asset.uri, to: destUri });

        await addAttachment(entryId, {
          filename: asset.name,
          mimeType: asset.mimeType || "application/octet-stream",
          localUri: destUri,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to add attachment:", error);
      Alert.alert("Error", "Failed to attach file.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAttachment = (attachment: Attachment) => {
    Alert.alert("Remove Attachment", `Remove "${attachment.filename}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            // Delete the file
            try {
              await FileSystem.deleteAsync(attachment.localUri, { idempotent: true });
            } catch (e) {
              // File might not exist, continue anyway
            }

            await removeAttachment(entryId, attachment.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onUpdate?.();
          } catch (error) {
            console.error("Failed to remove attachment:", error);
            Alert.alert("Error", "Failed to remove attachment.");
          }
        },
      },
    ]);
  };

  const showAttachOptions = () => {
    Alert.alert("Add Attachment", "What would you like to attach?", [
      { text: "Cancel", style: "cancel" },
      { text: "Image", onPress: () => handleAddAttachment("image") },
      { text: "Document", onPress: () => handleAddAttachment("document") },
    ]);
  };

  if (disabled && attachments.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
        ATTACHMENTS
      </ThemedText>

      {attachments.length > 0 ? (
        <View style={styles.attachmentsList}>
          {attachments.map((attachment) => (
            <View
              key={attachment.id}
              style={[styles.attachmentItem, { backgroundColor: theme.backgroundSecondary }]}
            >
              <Feather
                name={getFileIcon(attachment.mimeType) as any}
                size={18}
                color={theme.textSecondary}
              />
              <View style={styles.attachmentInfo}>
                <ThemedText style={styles.attachmentName} numberOfLines={1}>
                  {attachment.filename}
                </ThemedText>
                <ThemedText style={[styles.attachmentMeta, { color: theme.textSecondary }]}>
                  {attachment.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
                </ThemedText>
              </View>
              {!disabled ? (
                <Pressable
                  onPress={() => handleRemoveAttachment(attachment)}
                  style={styles.removeButton}
                  hitSlop={8}
                >
                  <Feather name="x" size={16} color={theme.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {!disabled ? (
        <Pressable
          onPress={showAttachOptions}
          disabled={adding}
          style={[
            styles.addButton,
            { borderColor: theme.divider, opacity: adding ? 0.5 : 1 },
          ]}
        >
          <Feather name="paperclip" size={16} color={theme.textSecondary} />
          <ThemedText style={[styles.addButtonText, { color: theme.textSecondary }]}>
            {adding ? "Adding..." : "Add attachment"}
          </ThemedText>
        </Pressable>
      ) : attachments.length === 0 ? (
        <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
          No attachments
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  attachmentsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: "500",
  },
  attachmentMeta: {
    fontSize: 11,
    fontFamily: Fonts.mono,
    marginTop: 2,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  addButtonText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
  },
});
