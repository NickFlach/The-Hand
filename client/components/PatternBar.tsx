import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PatternData } from "@/types/entry";

interface PatternBarProps {
  data: PatternData;
  maxTotal: number;
}

export function PatternBar({ data, maxTotal }: PatternBarProps) {
  const { theme } = useTheme();

  const barWidth = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;

  const builtWidth = data.total > 0 ? (data.built / data.total) * 100 : 0;
  const helpedWidth = data.total > 0 ? (data.helped / data.total) * 100 : 0;
  const learnedWidth = data.total > 0 ? (data.learned / data.total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText style={styles.period}>{data.period}</ThemedText>
        <ThemedText style={[styles.count, { color: theme.textSecondary }]}>
          {data.total}
        </ThemedText>
      </View>
      <View style={[styles.barContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={[styles.barOuter, { width: `${barWidth}%` }]}>
          {data.built > 0 ? (
            <View
              style={[
                styles.barSegment,
                { width: `${builtWidth}%`, backgroundColor: theme.badgeBuilt },
              ]}
            />
          ) : null}
          {data.helped > 0 ? (
            <View
              style={[
                styles.barSegment,
                { width: `${helpedWidth}%`, backgroundColor: theme.badgeHelped },
              ]}
            />
          ) : null}
          {data.learned > 0 ? (
            <View
              style={[
                styles.barSegment,
                { width: `${learnedWidth}%`, backgroundColor: theme.badgeLearned },
              ]}
            />
          ) : null}
        </View>
      </View>
      <View style={styles.breakdown}>
        {data.built > 0 ? (
          <ThemedText style={[styles.breakdownText, { color: theme.textSecondary }]}>
            {data.built} built
          </ThemedText>
        ) : null}
        {data.helped > 0 ? (
          <ThemedText style={[styles.breakdownText, { color: theme.textSecondary }]}>
            {data.helped} helped
          </ThemedText>
        ) : null}
        {data.learned > 0 ? (
          <ThemedText style={[styles.breakdownText, { color: theme.textSecondary }]}>
            {data.learned} learned
          </ThemedText>
        ) : null}
      </View>
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
  period: {
    fontSize: 14,
    fontWeight: "500",
  },
  count: {
    fontSize: 13,
    fontFamily: "monospace",
  },
  barContainer: {
    height: 12,
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
  },
  barOuter: {
    height: "100%",
    flexDirection: "row",
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
  },
  barSegment: {
    height: "100%",
  },
  breakdown: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  breakdownText: {
    fontSize: 11,
  },
});
