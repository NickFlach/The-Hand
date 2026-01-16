import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Pressable, TextInput, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ResponsibilityThread, EntryThreadLink } from "@/types/entry";
import {
  getThreads,
  getLinksForEntry,
  linkEntryToThread,
  unlinkEntryFromThread,
  createThread,
} from "@/lib/storage";

interface ThreadLinkerProps {
  entryId: string;
  disabled?: boolean;
  onUpdate?: () => void;
}

export function ThreadLinker({ entryId, disabled = false, onUpdate }: ThreadLinkerProps) {
  const { theme } = useTheme();
  const [threads, setThreads] = useState<ResponsibilityThread[]>([]);
  const [links, setLinks] = useState<EntryThreadLink[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [threadsData, linksData] = await Promise.all([
        getThreads(),
        getLinksForEntry(entryId),
      ]);
      setThreads(threadsData);
      setLinks(linksData);
    } catch (error) {
      console.error("Failed to load thread data:", error);
    } finally {
      setLoading(false);
    }
  }, [entryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const linkedThreadIds = new Set(links.map((l) => l.threadId));
  const linkedThreads = threads.filter((t) => linkedThreadIds.has(t.id));
  const activeUnlinkedThreads = threads.filter(
    (t) => !linkedThreadIds.has(t.id) && !t.closedAt
  );

  const handleLink = async (threadId: string) => {
    try {
      await linkEntryToThread(entryId, threadId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error("Failed to link:", error);
    }
  };

  const handleUnlink = async (threadId: string) => {
    try {
      await unlinkEntryFromThread(entryId, threadId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error("Failed to unlink:", error);
    }
  };

  const handleCreateAndLink = async () => {
    if (!newThreadTitle.trim()) return;

    try {
      const newThread = await createThread(newThreadTitle.trim());
      await linkEntryToThread(entryId, newThread.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewThreadTitle("");
      setShowNewThread(false);
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error("Failed to create thread:", error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
        LINKED RESPONSIBILITY
      </ThemedText>

      {linkedThreads.length > 0 ? (
        <View style={styles.linkedList}>
          {linkedThreads.map((thread) => (
            <View
              key={thread.id}
              style={[styles.linkedTag, { backgroundColor: theme.backgroundSecondary }]}
            >
              <ThemedText style={styles.linkedTagText}>{thread.title}</ThemedText>
              {!disabled ? (
                <Pressable
                  onPress={() => handleUnlink(thread.id)}
                  style={styles.unlinkButton}
                  hitSlop={8}
                >
                  <Feather name="x" size={14} color={theme.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {!disabled ? (
        <Pressable
          onPress={() => setShowModal(true)}
          style={[styles.addButton, { borderColor: theme.divider }]}
        >
          <Feather name="link" size={16} color={theme.textSecondary} />
          <ThemedText style={[styles.addButtonText, { color: theme.textSecondary }]}>
            {linkedThreads.length > 0 ? "Link another" : "Link to responsibility"}
          </ThemedText>
        </Pressable>
      ) : linkedThreads.length === 0 ? (
        <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
          No linked responsibility
        </ThemedText>
      ) : null}

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderColor: theme.divider }]}>
            <ThemedText type="h3">Link Responsibility</ThemedText>
            <Pressable onPress={() => setShowModal(false)} hitSlop={12}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            {showNewThread ? (
              <View style={[styles.newThreadCard, { backgroundColor: theme.backgroundDefault }]}>
                <TextInput
                  style={[
                    styles.newThreadInput,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                      borderColor: theme.divider,
                    },
                  ]}
                  placeholder="What do you carry?"
                  placeholderTextColor={theme.textSecondary}
                  value={newThreadTitle}
                  onChangeText={setNewThreadTitle}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCreateAndLink}
                />
                <View style={styles.newThreadButtons}>
                  <Pressable
                    onPress={() => {
                      setShowNewThread(false);
                      setNewThreadTitle("");
                    }}
                    style={[styles.cancelButton, { borderColor: theme.divider }]}
                  >
                    <ThemedText style={{ color: theme.textSecondary }}>Cancel</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleCreateAndLink}
                    disabled={!newThreadTitle.trim()}
                    style={[
                      styles.createButton,
                      {
                        backgroundColor: theme.text,
                        opacity: newThreadTitle.trim() ? 1 : 0.5,
                      },
                    ]}
                  >
                    <ThemedText style={{ color: theme.backgroundRoot, fontWeight: "600" }}>
                      Create & Link
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowNewThread(true)}
                style={[styles.newThreadButton, { borderColor: theme.divider }]}
              >
                <Feather name="plus" size={18} color={theme.textSecondary} />
                <ThemedText style={[styles.newThreadButtonText, { color: theme.textSecondary }]}>
                  Create new responsibility
                </ThemedText>
              </Pressable>
            )}

            {activeUnlinkedThreads.length > 0 ? (
              <View style={styles.existingSection}>
                <ThemedText style={[styles.existingSectionLabel, { color: theme.textSecondary }]}>
                  EXISTING RESPONSIBILITIES
                </ThemedText>
                {activeUnlinkedThreads.map((thread) => (
                  <Pressable
                    key={thread.id}
                    onPress={() => {
                      handleLink(thread.id);
                      setShowModal(false);
                    }}
                    style={[styles.threadOption, { backgroundColor: theme.backgroundDefault }]}
                  >
                    <ThemedText style={styles.threadOptionText}>{thread.title}</ThemedText>
                    <Feather name="plus" size={18} color={theme.textSecondary} />
                  </Pressable>
                ))}
              </View>
            ) : !showNewThread ? (
              <View style={styles.noThreadsMessage}>
                <ThemedText style={[styles.noThreadsText, { color: theme.textSecondary }]}>
                  No responsibilities to link. Create one above.
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
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
  linkedList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  linkedTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  linkedTagText: {
    fontSize: 13,
    fontWeight: "500",
  },
  unlinkButton: {
    marginLeft: Spacing.xs,
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  newThreadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  newThreadButtonText: {
    fontSize: 15,
  },
  newThreadCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing["2xl"],
  },
  newThreadInput: {
    height: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  newThreadButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  createButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  existingSection: {
    marginTop: Spacing.md,
  },
  existingSectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  threadOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  threadOptionText: {
    fontSize: 15,
    fontWeight: "500",
  },
  noThreadsMessage: {
    paddingVertical: Spacing["2xl"],
    alignItems: "center",
  },
  noThreadsText: {
    fontSize: 14,
    textAlign: "center",
  },
});
