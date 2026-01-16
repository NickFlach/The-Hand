import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Entry, PatternData } from "@/types/entry";
import { getEntries, calculatePatternData } from "@/lib/storage";
import { ThemedText } from "@/components/ThemedText";
import { PatternBar } from "@/components/PatternBar";
import { EmptyState } from "@/components/EmptyState";

type GroupBy = "week" | "month";

export default function PatternsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [patternData, setPatternData] = useState<PatternData[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await getEntries();
      setEntries(data);
      setPatternData(calculatePatternData(data, groupBy));
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupBy]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleGroupByChange = (newGroupBy: GroupBy) => {
    setGroupBy(newGroupBy);
    setPatternData(calculatePatternData(entries, newGroupBy));
  };

  const maxTotal = patternData.reduce((max, d) => Math.max(max, d.total), 0);

  const totalBuilt = patternData.reduce((sum, d) => sum + d.built, 0);
  const totalHelped = patternData.reduce((sum, d) => sum + d.helped, 0);
  const totalLearned = patternData.reduce((sum, d) => sum + d.learned, 0);
  const totalEntries = totalBuilt + totalHelped + totalLearned;

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
        {entries.length === 0 ? (
          <EmptyState message="No entries yet." />
        ) : (
          <>
            <View style={styles.summarySection}>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                TOTAL ENTRIES
              </ThemedText>
              <ThemedText type="h1" style={styles.totalCount}>
                {totalEntries}
              </ThemedText>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <View style={[styles.dot, { backgroundColor: theme.badgeBuilt }]} />
                  <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
                    {totalBuilt} built
                  </ThemedText>
                </View>
                <View style={styles.summaryItem}>
                  <View style={[styles.dot, { backgroundColor: theme.badgeHelped }]} />
                  <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
                    {totalHelped} helped
                  </ThemedText>
                </View>
                <View style={styles.summaryItem}>
                  <View style={[styles.dot, { backgroundColor: theme.badgeLearned }]} />
                  <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
                    {totalLearned} learned
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.groupBySection}>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                GROUP BY
              </ThemedText>
              <View style={[styles.groupByButtons, { borderColor: theme.divider }]}>
                <Pressable
                  onPress={() => handleGroupByChange("week")}
                  style={[
                    styles.groupByButton,
                    groupBy === "week" && { backgroundColor: theme.text },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.groupByButtonText,
                      { color: groupBy === "week" ? theme.backgroundRoot : theme.text },
                    ]}
                  >
                    Week
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => handleGroupByChange("month")}
                  style={[
                    styles.groupByButton,
                    groupBy === "month" && { backgroundColor: theme.text },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.groupByButtonText,
                      { color: groupBy === "month" ? theme.backgroundRoot : theme.text },
                    ]}
                  >
                    Month
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={styles.distributionSection}>
              <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                DISTRIBUTION
              </ThemedText>
              {patternData.map((data) => (
                <PatternBar key={data.period} data={data} maxTotal={maxTotal} />
              ))}
            </View>
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
  summarySection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  totalCount: {
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 13,
  },
  groupBySection: {
    marginBottom: Spacing["2xl"],
  },
  groupByButtons: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
  },
  groupByButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.xs,
  },
  groupByButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  distributionSection: {
    marginTop: Spacing.md,
  },
});
