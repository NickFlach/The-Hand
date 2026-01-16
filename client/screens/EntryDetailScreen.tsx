import React, { useState, useCallback, useLayoutEffect } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, useFocusEffect, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HeaderButton } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { Entry, EntryType } from "@/types/entry";
import { getEntry, updateEntry, addAddendum, isEditable, formatRelativeTime } from "@/lib/storage";
import { isFeatureEnabled } from "@/lib/features";
import { ThemedText } from "@/components/ThemedText";
import { FormField } from "@/components/FormField";
import { AddendumSheet } from "@/components/AddendumSheet";
import { ThemeEditor } from "@/components/ThemeEditor";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type EntryDetailRouteProp = RouteProp<RootStackParamList, "EntryDetail">;

function getTypeLabel(type: EntryType): string {
  switch (type) {
    case "built":
      return "BUILT";
    case "helped":
      return "HELPED";
    case "learned":
      return "LEARNED";
  }
}

function getTypeBadgeColor(type: EntryType, theme: any): string {
  switch (type) {
    case "built":
      return theme.badgeBuilt;
    case "helped":
      return theme.badgeHelped;
    case "learned":
      return theme.badgeLearned;
  }
}

export default function EntryDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<EntryDetailRouteProp>();
  const { entryId } = route.params;

  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showAddendumSheet, setShowAddendumSheet] = useState(false);

  const [editedAffected, setEditedAffected] = useState("");
  const [editedCost, setEditedCost] = useState("");
  const [editedReflection, setEditedReflection] = useState("");
  const [editedThemes, setEditedThemes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const canEdit = entry ? isEditable(entry) : false;

  const loadEntry = useCallback(async () => {
    try {
      const data = await getEntry(entryId);
      setEntry(data);
      if (data) {
        setEditedAffected(data.affected);
        setEditedCost(data.cost);
        setEditedReflection(data.reflection);
        setEditedThemes(data.themes || []);
      }
    } catch (error) {
      console.error("Failed to load entry:", error);
    } finally {
      setLoading(false);
    }
  }, [entryId]);

  useFocusEffect(
    useCallback(() => {
      loadEntry();
    }, [loadEntry])
  );

  const handleEdit = () => {
    if (canEdit) {
      setEditing(true);
    } else {
      setShowAddendumSheet(true);
    }
  };

  const handleCancelEdit = () => {
    if (entry) {
      setEditedAffected(entry.affected);
      setEditedCost(entry.cost);
      setEditedReflection(entry.reflection);
      setEditedThemes(entry.themes || []);
    }
    setEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!entry) return;

    setSaving(true);
    try {
      const updated = await updateEntry(entry.id, {
        affected: editedAffected.trim(),
        cost: editedCost.trim(),
        reflection: editedReflection.trim(),
        themes: editedThemes,
      });
      if (updated) {
        setEntry(updated);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setEditing(false);
    } catch (error) {
      console.error("Failed to update entry:", error);
      Alert.alert("Error", "Failed to save changes.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddendum = async (content: string) => {
    if (!entry) return;

    try {
      const updated = await addAddendum(entry.id, content);
      if (updated) {
        setEntry(updated);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Failed to add addendum:", error);
      Alert.alert("Error", "Failed to add note.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  useLayoutEffect(() => {
    if (editing) {
      navigation.setOptions({
        headerLeft: () => (
          <HeaderButton onPress={handleCancelEdit}>
            <ThemedText style={{ color: theme.textSecondary }}>Cancel</ThemedText>
          </HeaderButton>
        ),
        headerRight: () => (
          <HeaderButton onPress={handleSaveEdit} disabled={saving}>
            <ThemedText style={{ fontWeight: "600", opacity: saving ? 0.5 : 1 }}>
              {saving ? "Saving..." : "Save"}
            </ThemedText>
          </HeaderButton>
        ),
      });
    } else if (entry) {
      navigation.setOptions({
        headerLeft: undefined,
        headerRight: () => (
          <HeaderButton onPress={handleEdit}>
            <ThemedText style={{ fontWeight: "500" }}>
              {canEdit ? "Edit" : "Add Note"}
            </ThemedText>
          </HeaderButton>
        ),
      });
    }
  }, [navigation, editing, entry, canEdit, saving, theme]);

  if (loading || !entry) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.loadingContainer, { paddingTop: headerHeight + Spacing.xl }]}>
          <ThemedText style={{ color: theme.textSecondary }}>Loading...</ThemedText>
        </View>
      </View>
    );
  }

  const badgeColor = getTypeBadgeColor(entry.type, theme);

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
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <ThemedText style={[styles.badgeText, { color: theme.backgroundRoot }]}>
              {getTypeLabel(entry.type)}
            </ThemedText>
          </View>
          <ThemedText style={[styles.timestamp, { color: theme.textSecondary }]}>
            {formatRelativeTime(entry.createdAt)}
          </ThemedText>
        </View>

        <ThemedText style={[styles.dateDetail, { color: theme.textSecondary }]}>
          {new Date(entry.createdAt).toLocaleString()}
        </ThemedText>

        {!canEdit && !editing ? (
          <View style={[styles.lockNotice, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={[styles.lockNoticeText, { color: theme.textSecondary }]}>
              This entry is locked. You can add a note.
            </ThemedText>
          </View>
        ) : null}

        {editing ? (
          <View style={styles.editForm}>
            <FormField
              label="Affected"
              value={editedAffected}
              onChangeText={setEditedAffected}
              maxLength={300}
            />
            <FormField
              label="Cost"
              value={editedCost}
              onChangeText={setEditedCost}
              maxLength={300}
            />
            <FormField
              label="Reflection"
              value={editedReflection}
              onChangeText={setEditedReflection}
              maxLength={300}
            />
            {isFeatureEnabled("FEATURE_THEMES_V1") ? (
              <ThemeEditor
                themes={editedThemes}
                onChange={setEditedThemes}
              />
            ) : null}
          </View>
        ) : (
          <View style={styles.fieldsContainer}>
            <View style={styles.field}>
              <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                AFFECTED
              </ThemedText>
              <ThemedText style={styles.fieldValue}>{entry.affected}</ThemedText>
            </View>
            <View style={styles.field}>
              <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                COST
              </ThemedText>
              <ThemedText style={styles.fieldValue}>{entry.cost}</ThemedText>
            </View>
            <View style={styles.field}>
              <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                REFLECTION
              </ThemedText>
              <ThemedText style={styles.fieldValue}>{entry.reflection}</ThemedText>
            </View>
            {isFeatureEnabled("FEATURE_THEMES_V1") ? (
              <ThemeEditor
                themes={entry.themes || []}
                onChange={() => {}}
                disabled
              />
            ) : null}
          </View>
        )}

        {entry.addenda.length > 0 ? (
          <View style={[styles.addendaSection, { borderTopColor: theme.divider }]}>
            <ThemedText style={[styles.addendaTitle, { color: theme.textSecondary }]}>
              NOTES
            </ThemedText>
            {entry.addenda.map((addendum) => (
              <View
                key={addendum.id}
                style={[styles.addendum, { borderColor: theme.divider }]}
              >
                <ThemedText
                  style={[styles.addendumTimestamp, { color: theme.textSecondary }]}
                >
                  {new Date(addendum.createdAt).toLocaleString()}
                </ThemedText>
                <ThemedText style={[styles.addendumContent, { fontStyle: "italic" }]}>
                  {addendum.content}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <AddendumSheet
        visible={showAddendumSheet}
        onClose={() => setShowAddendumSheet(false)}
        onSubmit={handleAddAddendum}
      />
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: Fonts.mono,
  },
  dateDetail: {
    fontSize: 13,
    marginBottom: Spacing.xl,
  },
  lockNotice: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  lockNoticeText: {
    fontSize: 13,
    textAlign: "center",
  },
  editForm: {
    marginTop: Spacing.lg,
  },
  fieldsContainer: {
    gap: Spacing.xl,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  fieldValue: {
    fontSize: 16,
    lineHeight: 24,
  },
  addendaSection: {
    marginTop: Spacing["2xl"],
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
  },
  addendaTitle: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.lg,
  },
  addendum: {
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  addendumTimestamp: {
    fontSize: 12,
    fontFamily: Fonts.mono,
    marginBottom: Spacing.sm,
  },
  addendumContent: {
    fontSize: 15,
    lineHeight: 22,
  },
});
