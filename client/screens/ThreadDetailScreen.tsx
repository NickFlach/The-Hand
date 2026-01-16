import React, { useState, useCallback, useLayoutEffect } from "react";
import { StyleSheet, View, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight, HeaderButton } from "@react-navigation/elements";
import { useNavigation, useRoute, useFocusEffect, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { ResponsibilityThread, Entry } from "@/types/entry";
import {
  getThread,
  getEntriesForThread,
  closeThread,
  reopenThread,
  formatRelativeTime,
} from "@/lib/storage";
import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type ThreadDetailRouteProp = RouteProp<RootStackParamList, "ThreadDetail">;

function getTypeLabel(type: string): string {
  switch (type) {
    case "built":
      return "BUILT";
    case "helped":
      return "HELPED";
    case "learned":
      return "LEARNED";
    default:
      return type.toUpperCase();
  }
}

export default function ThreadDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ThreadDetailRouteProp>();
  const { threadId } = route.params;

  const [thread, setThread] = useState<ResponsibilityThread | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const threadData = await getThread(threadId);
      const entriesData = await getEntriesForThread(threadId);
      setThread(threadData);
      setEntries(
        entriesData.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Failed to load thread:", error);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleCloseThread = async () => {
    if (!thread) return;

    Alert.alert(
      "Close Responsibility",
      "This responsibility will be marked as closed. Linked entries will remain.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close",
          onPress: async () => {
            setActionInProgress(true);
            try {
              const updated = await closeThread(thread.id);
              if (updated) {
                setThread(updated);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error) {
              console.error("Failed to close thread:", error);
              Alert.alert("Error", "Failed to close responsibility.");
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
              setActionInProgress(false);
            }
          },
        },
      ]
    );
  };

  const handleReopenThread = async () => {
    if (!thread) return;

    setActionInProgress(true);
    try {
      const updated = await reopenThread(thread.id);
      if (updated) {
        setThread(updated);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Failed to reopen thread:", error);
      Alert.alert("Error", "Failed to reopen responsibility.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setActionInProgress(false);
    }
  };

  useLayoutEffect(() => {
    if (thread) {
      navigation.setOptions({
        headerTitle: thread.title,
      });
    }
  }, [navigation, thread]);

  if (loading || !thread) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.loadingContainer, { paddingTop: headerHeight + Spacing.xl }]}>
          <ThemedText style={{ color: theme.textSecondary }}>Loading...</ThemedText>
        </View>
      </View>
    );
  }

  const isClosed = !!thread.closedAt;

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
      >
        <View style={styles.header}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isClosed ? theme.backgroundSecondary : theme.text },
            ]}
          >
            <ThemedText
              style={[
                styles.statusText,
                { color: isClosed ? theme.textSecondary : theme.backgroundRoot },
              ]}
            >
              {isClosed ? "CLOSED" : "ACTIVE"}
            </ThemedText>
          </View>
          <ThemedText style={[styles.dateText, { color: theme.textSecondary }]}>
            Since {new Date(thread.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>

        {isClosed ? (
          <View style={[styles.closedNotice, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={[styles.closedNoticeText, { color: theme.textSecondary }]}>
              Closed on {new Date(thread.closedAt!).toLocaleDateString()}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.entriesSection}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            LINKED ENTRIES ({entries.length})
          </ThemedText>

          {entries.length === 0 ? (
            <EmptyState message="No entries linked to this responsibility." />
          ) : (
            <View style={styles.timeline}>
              {entries.map((entry, index) => (
                <Pressable
                  key={entry.id}
                  onPress={() =>
                    navigation.navigate("EntryDetail", { entryId: entry.id })
                  }
                  style={styles.timelineItem}
                >
                  <View style={styles.timelineConnector}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: theme.text },
                      ]}
                    />
                    {index < entries.length - 1 ? (
                      <View
                        style={[
                          styles.timelineLine,
                          { backgroundColor: theme.divider },
                        ]}
                      />
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.entryCard,
                      { backgroundColor: theme.backgroundDefault },
                    ]}
                  >
                    <View style={styles.entryHeader}>
                      <ThemedText
                        style={[styles.entryType, { color: theme.textSecondary }]}
                      >
                        {getTypeLabel(entry.type)}
                      </ThemedText>
                      <ThemedText
                        style={[styles.entryDate, { color: theme.textSecondary }]}
                      >
                        {formatRelativeTime(entry.createdAt)}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.entryAffected} numberOfLines={2}>
                      {entry.affected}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          {isClosed ? (
            <Pressable
              onPress={handleReopenThread}
              disabled={actionInProgress}
              style={[
                styles.actionButton,
                { borderColor: theme.divider, opacity: actionInProgress ? 0.5 : 1 },
              ]}
            >
              <ThemedText style={styles.actionButtonText}>
                {actionInProgress ? "Reopening..." : "Reopen Responsibility"}
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleCloseThread}
              disabled={actionInProgress}
              style={[
                styles.actionButton,
                { borderColor: theme.divider, opacity: actionInProgress ? 0.5 : 1 },
              ]}
            >
              <ThemedText style={[styles.actionButtonText, { color: theme.textSecondary }]}>
                {actionInProgress ? "Closing..." : "Close Responsibility"}
              </ThemedText>
            </Pressable>
          )}
        </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 13,
    fontFamily: Fonts.mono,
  },
  closedNotice: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  closedNoticeText: {
    fontSize: 13,
    textAlign: "center",
  },
  entriesSection: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.lg,
  },
  timeline: {
    paddingLeft: Spacing.sm,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  timelineConnector: {
    width: 20,
    alignItems: "center",
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: Spacing.md,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: Spacing.xs,
  },
  entryCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.md,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  entryType: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  entryDate: {
    fontSize: 11,
    fontFamily: Fonts.mono,
  },
  entryAffected: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  actionButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
