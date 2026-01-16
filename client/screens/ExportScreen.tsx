import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Share, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Entry } from "@/types/entry";
import { getEntries, exportData, exportDataAsText } from "@/lib/storage";
import { ThemedText } from "@/components/ThemedText";
import { SettingsRow } from "@/components/SettingsRow";

export default function ExportScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      const data = await getEntries();
      setEntries(data);
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const handleExportText = async () => {
    setExporting("text");
    try {
      const textData = await exportDataAsText();
      await Share.share({
        message: textData,
        title: "The Hand Export (Plain Text)",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      if ((error as any).message !== "User did not share") {
        Alert.alert("Export Failed", "Could not export your data.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setExporting(null);
    }
  };

  const handleExportJSON = async () => {
    setExporting("json");
    try {
      const jsonData = await exportData();
      await Share.share({
        message: jsonData,
        title: "The Hand Export (JSON)",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      if ((error as any).message !== "User did not share") {
        Alert.alert("Export Failed", "Could not export your data.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setExporting(null);
    }
  };

  const totalBuilt = entries.filter((e) => e.type === "built").length;
  const totalHelped = entries.filter((e) => e.type === "helped").length;
  const totalLearned = entries.filter((e) => e.type === "learned").length;

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
        <View style={styles.noticeContainer}>
          <ThemedText style={[styles.notice, { color: theme.textSecondary }]}>
            This is a record. It is not a report card.
          </ThemedText>
        </View>

        <View style={styles.summarySection}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            YOUR LEDGER
          </ThemedText>
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Total Entries</ThemedText>
              <ThemedText style={styles.summaryValue}>{entries.length}</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Built</ThemedText>
              <ThemedText style={styles.summaryValue}>{totalBuilt}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Helped</ThemedText>
              <ThemedText style={styles.summaryValue}>{totalHelped}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Learned</ThemedText>
              <ThemedText style={styles.summaryValue}>{totalLearned}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.exportSection}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            EXPORT FORMAT
          </ThemedText>
          <SettingsRow
            label="Plain Text"
            description={exporting === "text" ? "Exporting..." : "Human-readable format"}
            onPress={handleExportText}
            showChevron
          />
          <SettingsRow
            label="JSON"
            description={exporting === "json" ? "Exporting..." : "Machine-readable format"}
            onPress={handleExportJSON}
            showChevron
          />
        </View>

        <View style={styles.footerSection}>
          <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
            All data is stored locally on your device. You own your data.
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  noticeContainer: {
    marginBottom: Spacing["2xl"],
  },
  notice: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  summarySection: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  exportSection: {
    marginBottom: Spacing["2xl"],
  },
  footerSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
