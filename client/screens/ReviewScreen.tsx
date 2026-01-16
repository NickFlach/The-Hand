import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { Entry } from "@/types/entry";
import { getEntriesInRange, createReviewNote, formatRelativeTime } from "@/lib/storage";
import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";

type RangeDays = 30 | 60 | 90;

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

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [rangeDays, setRangeDays] = useState<RangeDays>(30);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [reflectionText, setReflectionText] = useState("");
  const [saving, setSaving] = useState(false);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEntriesInRange(rangeDays);
      setEntries(data);
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setLoading(false);
    }
  }, [rangeDays]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const handleRangeChange = (days: RangeDays) => {
    setRangeDays(days);
  };

  const handleSaveReflection = async () => {
    if (!reflectionText.trim()) return;

    setSaving(true);
    try {
      await createReviewNote(rangeDays, reflectionText.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Your reflection has been recorded.");
      setReflectionText("");
    } catch (error) {
      console.error("Failed to save reflection:", error);
      Alert.alert("Error", "Failed to save reflection.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

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
        <View style={styles.rangeSection}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            TIME RANGE
          </ThemedText>
          <View style={[styles.rangeButtons, { borderColor: theme.divider }]}>
            {([30, 60, 90] as RangeDays[]).map((days) => (
              <Pressable
                key={days}
                onPress={() => handleRangeChange(days)}
                style={[
                  styles.rangeButton,
                  rangeDays === days && { backgroundColor: theme.text },
                ]}
              >
                <ThemedText
                  style={[
                    styles.rangeButtonText,
                    { color: rangeDays === days ? theme.backgroundRoot : theme.text },
                  ]}
                >
                  {days} days
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.entriesSection}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            ENTRIES ({entries.length})
          </ThemedText>

          {loading ? (
            <ThemedText style={{ color: theme.textSecondary }}>Loading...</ThemedText>
          ) : entries.length === 0 ? (
            <EmptyState message={`No entries in the last ${rangeDays} days.`} />
          ) : (
            <View style={styles.entriesList}>
              {entries.map((entry) => (
                <View
                  key={entry.id}
                  style={[styles.entryItem, { borderColor: theme.divider }]}
                >
                  <View style={styles.entryHeader}>
                    <ThemedText style={[styles.entryType, { color: theme.textSecondary }]}>
                      {getTypeLabel(entry.type)}
                    </ThemedText>
                    <ThemedText style={[styles.entryDate, { color: theme.textSecondary }]}>
                      {formatRelativeTime(entry.createdAt)}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.entryAffected} numberOfLines={2}>
                    {entry.affected}
                  </ThemedText>
                  {entry.themes && entry.themes.length > 0 ? (
                    <View style={styles.themesRow}>
                      {entry.themes.map((t) => (
                        <View
                          key={t}
                          style={[styles.themeTag, { backgroundColor: theme.backgroundSecondary }]}
                        >
                          <ThemedText style={styles.themeTagText}>{t}</ThemedText>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          )}
        </View>

        {entries.length > 0 ? (
          <View style={styles.reflectionSection}>
            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              REFLECTION
            </ThemedText>
            <ThemedText style={[styles.reflectionPrompt, { color: theme.textSecondary }]}>
              Is there anything here you'd want to do differently going forward?
            </ThemedText>
            <TextInput
              style={[
                styles.reflectionInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.divider,
                },
              ]}
              placeholder="Optional reflection..."
              placeholderTextColor={theme.textSecondary}
              multiline
              value={reflectionText}
              onChangeText={setReflectionText}
              textAlignVertical="top"
            />
            {reflectionText.trim() ? (
              <Pressable
                onPress={handleSaveReflection}
                style={[
                  styles.saveButton,
                  { backgroundColor: theme.text, opacity: saving ? 0.5 : 1 },
                ]}
                disabled={saving}
              >
                <ThemedText style={[styles.saveButtonText, { color: theme.backgroundRoot }]}>
                  {saving ? "Saving..." : "Save Reflection"}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
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
  rangeSection: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  rangeButtons: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.xs,
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  entriesSection: {
    marginBottom: Spacing["2xl"],
  },
  entriesList: {
    gap: Spacing.md,
  },
  entryItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
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
    fontSize: 12,
    fontFamily: Fonts.mono,
  },
  entryAffected: {
    fontSize: 15,
    lineHeight: 22,
  },
  themesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  themeTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  themeTagText: {
    fontSize: 11,
  },
  reflectionSection: {
    marginTop: Spacing.lg,
  },
  reflectionPrompt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  reflectionInput: {
    minHeight: 100,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  saveButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["2xl"],
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
