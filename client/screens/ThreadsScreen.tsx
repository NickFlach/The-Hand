import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { ResponsibilityThread } from "@/types/entry";
import { getThreads, createThread, getLinksForThread } from "@/lib/storage";
import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

interface ThreadWithCount extends ResponsibilityThread {
  entryCount: number;
}

export default function ThreadsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [threads, setThreads] = useState<ThreadWithCount[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const loadThreads = useCallback(async () => {
    try {
      const data = await getThreads();
      const threadsWithCounts: ThreadWithCount[] = await Promise.all(
        data.map(async (thread) => {
          const links = await getLinksForThread(thread.id);
          return { ...thread, entryCount: links.length };
        })
      );
      setThreads(threadsWithCounts);
    } catch (error) {
      console.error("Failed to load threads:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadThreads();
    }, [loadThreads])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadThreads();
  }, [loadThreads]);

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim()) return;

    setCreating(true);
    try {
      await createThread(newThreadTitle.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNewThreadTitle("");
      setShowNewThread(false);
      loadThreads();
    } catch (error) {
      console.error("Failed to create thread:", error);
      Alert.alert("Error", "Failed to create responsibility.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setCreating(false);
    }
  };

  const activeThreads = threads.filter((t) => !t.closedAt);
  const closedThreads = threads.filter((t) => t.closedAt);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.loadingContainer, { paddingTop: headerHeight + Spacing.xl }]}>
          <ThemedText style={{ color: theme.textSecondary }}>Loading...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.textSecondary}
          />
        }
      >
        {showNewThread ? (
          <View style={[styles.newThreadCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={[styles.newThreadLabel, { color: theme.textSecondary }]}>
              NEW RESPONSIBILITY
            </ThemedText>
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
              onSubmitEditing={handleCreateThread}
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
                onPress={handleCreateThread}
                disabled={!newThreadTitle.trim() || creating}
                style={[
                  styles.createButton,
                  {
                    backgroundColor: theme.text,
                    opacity: newThreadTitle.trim() && !creating ? 1 : 0.5,
                  },
                ]}
              >
                <ThemedText style={{ color: theme.backgroundRoot, fontWeight: "600" }}>
                  {creating ? "Creating..." : "Create"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setShowNewThread(true)}
            style={[styles.addButton, { borderColor: theme.divider }]}
          >
            <Feather name="plus" size={18} color={theme.textSecondary} />
            <ThemedText style={[styles.addButtonText, { color: theme.textSecondary }]}>
              New responsibility
            </ThemedText>
          </Pressable>
        )}

        {threads.length === 0 && !showNewThread ? (
          <View style={styles.emptyContainer}>
            <EmptyState message="No responsibilities recorded." />
          </View>
        ) : (
          <>
            {activeThreads.length > 0 ? (
              <View style={styles.section}>
                <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  ACTIVE ({activeThreads.length})
                </ThemedText>
                {activeThreads.map((thread) => (
                  <Pressable
                    key={thread.id}
                    onPress={() =>
                      navigation.navigate("ThreadDetail", { threadId: thread.id })
                    }
                    style={[styles.threadCard, { backgroundColor: theme.backgroundDefault }]}
                  >
                    <View style={styles.threadHeader}>
                      <ThemedText style={styles.threadTitle}>{thread.title}</ThemedText>
                      <Feather name="chevron-right" size={18} color={theme.textSecondary} />
                    </View>
                    <View style={styles.threadMeta}>
                      <ThemedText style={[styles.threadMetaText, { color: theme.textSecondary }]}>
                        {thread.entryCount} {thread.entryCount === 1 ? "entry" : "entries"}
                      </ThemedText>
                      <ThemedText style={[styles.threadMetaText, { color: theme.textSecondary }]}>
                        Since{" "}
                        {new Date(thread.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })}
                      </ThemedText>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {closedThreads.length > 0 ? (
              <View style={styles.section}>
                <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  CLOSED ({closedThreads.length})
                </ThemedText>
                {closedThreads.map((thread) => (
                  <Pressable
                    key={thread.id}
                    onPress={() =>
                      navigation.navigate("ThreadDetail", { threadId: thread.id })
                    }
                    style={[
                      styles.threadCard,
                      { backgroundColor: theme.backgroundDefault, opacity: 0.7 },
                    ]}
                  >
                    <View style={styles.threadHeader}>
                      <ThemedText style={styles.threadTitle}>{thread.title}</ThemedText>
                      <Feather name="chevron-right" size={18} color={theme.textSecondary} />
                    </View>
                    <View style={styles.threadMeta}>
                      <ThemedText style={[styles.threadMetaText, { color: theme.textSecondary }]}>
                        {thread.entryCount} {thread.entryCount === 1 ? "entry" : "entries"}
                      </ThemedText>
                      <ThemedText style={[styles.threadMetaText, { color: theme.textSecondary }]}>
                        Closed{" "}
                        {new Date(thread.closedAt!).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })}
                      </ThemedText>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  addButton: {
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
  addButtonText: {
    fontSize: 15,
  },
  newThreadCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing["2xl"],
  },
  newThreadLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
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
  emptyContainer: {
    flex: 1,
    paddingTop: Spacing["4xl"],
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  threadCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  threadHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  threadMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  threadMetaText: {
    fontSize: 13,
    fontFamily: Fonts.mono,
  },
});
