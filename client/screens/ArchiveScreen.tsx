import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { ArchiveYear, Entry } from "@/types/entry";
import { getArchiveData, formatRelativeTime } from "@/lib/storage";
import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

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

export default function ArchiveScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [archiveData, setArchiveData] = useState<ArchiveYear[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getArchiveData();
      setArchiveData(data);
    } catch (error) {
      console.error("Failed to load archive:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const hasAnyEntries = archiveData.some((year) =>
    year.months.some((month) => month.entries.length > 0)
  );

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
        {!hasAnyEntries ? (
          <EmptyState message="No entries to archive yet." />
        ) : (
          archiveData.map((yearData) => (
            <View key={yearData.year} style={styles.yearSection}>
              <ThemedText style={styles.yearLabel}>{yearData.year}</ThemedText>

              {yearData.months.map((monthData) => {
                const monthKey = `${monthData.year}-${monthData.month}`;
                const isExpanded = expandedMonths.has(monthKey);
                const isEmpty = monthData.entries.length === 0;

                return (
                  <View key={monthKey} style={styles.monthSection}>
                    <Pressable
                      onPress={() => !isEmpty && toggleMonth(monthKey)}
                      style={[
                        styles.monthHeader,
                        { borderColor: theme.divider },
                      ]}
                      disabled={isEmpty}
                    >
                      <View style={styles.monthLabelRow}>
                        <ThemedText
                          style={[
                            styles.monthLabel,
                            isEmpty && { color: theme.textSecondary },
                          ]}
                        >
                          {monthData.label}
                        </ThemedText>
                        {!isEmpty ? (
                          <View
                            style={[
                              styles.countBadge,
                              { backgroundColor: theme.backgroundSecondary },
                            ]}
                          >
                            <ThemedText
                              style={[styles.countText, { color: theme.textSecondary }]}
                            >
                              {monthData.entries.length}
                            </ThemedText>
                          </View>
                        ) : (
                          <ThemedText
                            style={[styles.emptyIndicator, { color: theme.textSecondary }]}
                          >
                            —
                          </ThemedText>
                        )}
                      </View>
                      {!isEmpty ? (
                        <Feather
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={theme.textSecondary}
                        />
                      ) : null}
                    </Pressable>

                    {isExpanded && !isEmpty ? (
                      <View style={styles.entriesList}>
                        {monthData.entries.map((entry) => (
                          <Pressable
                            key={entry.id}
                            onPress={() =>
                              navigation.navigate("EntryDetail", { entryId: entry.id })
                            }
                            style={[
                              styles.entryRow,
                              { borderColor: theme.divider },
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
                                {new Date(entry.createdAt).toLocaleDateString(undefined, {
                                  day: "numeric",
                                })}
                              </ThemedText>
                            </View>
                            <ThemedText style={styles.entryAffected} numberOfLines={1}>
                              {entry.affected}
                            </ThemedText>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))
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
  yearSection: {
    marginBottom: Spacing["2xl"],
  },
  yearLabel: {
    fontSize: 28,
    fontWeight: "300",
    letterSpacing: -0.5,
    marginBottom: Spacing.lg,
  },
  monthSection: {
    marginBottom: Spacing.sm,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  monthLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: 12,
    fontFamily: Fonts.mono,
  },
  emptyIndicator: {
    fontSize: 14,
  },
  entriesList: {
    paddingTop: Spacing.sm,
    paddingLeft: Spacing.md,
  },
  entryRow: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
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
});
