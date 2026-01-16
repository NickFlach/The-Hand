import React, { useState, useLayoutEffect } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HeaderButton } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { EntryType, EntryFormData } from "@/types/entry";
import { createEntry } from "@/lib/storage";
import { isFeatureEnabled } from "@/lib/features";
import { TypeSelector } from "@/components/TypeSelector";
import { FormField } from "@/components/FormField";
import { ThemeEditor } from "@/components/ThemeEditor";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function NewEntryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [type, setType] = useState<EntryType | null>(null);
  const [affected, setAffected] = useState("");
  const [cost, setCost] = useState("");
  const [reflection, setReflection] = useState("");
  const [themes, setThemes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const isValid =
    type !== null &&
    affected.trim().length > 0 &&
    cost.trim().length > 0 &&
    reflection.trim().length > 0;

  const handleSave = async () => {
    if (!isValid || !type) return;

    setSaving(true);
    try {
      const formData: EntryFormData = {
        type,
        affected: affected.trim(),
        cost: cost.trim(),
        reflection: reflection.trim(),
        themes,
      };
      await createEntry(formData);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to create entry:", error);
      Alert.alert("Error", "Failed to save entry. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (affected || cost || reflection || themes.length > 0) {
      Alert.alert(
        "Discard Entry?",
        "Your entry will not be saved.",
        [
          { text: "Keep Editing", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton onPress={handleCancel}>
          <ThemedText style={{ color: theme.textSecondary }}>Cancel</ThemedText>
        </HeaderButton>
      ),
      headerRight: () => (
        <HeaderButton
          onPress={handleSave}
          disabled={!isValid || saving}
        >
          <ThemedText
            style={{
              fontWeight: "600",
              opacity: isValid && !saving ? 1 : 0.5,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </ThemedText>
        </HeaderButton>
      ),
    });
  }, [navigation, isValid, saving, affected, cost, reflection, themes, theme]);

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing["3xl"],
        },
      ]}
    >
      <View style={styles.section}>
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          TYPE
        </ThemedText>
        <TypeSelector value={type} onChange={setType} />
      </View>

      {type !== null ? (
        <View style={styles.fieldsContainer}>
          <FormField
            label="Affected"
            placeholder="Who or what did this impact?"
            value={affected}
            onChangeText={setAffected}
            maxLength={300}
          />
          <FormField
            label="Cost"
            placeholder="What did it cost you? (time, effort, risk)"
            value={cost}
            onChangeText={setCost}
            maxLength={300}
          />
          <FormField
            label="Reflection"
            placeholder="What would you do differently?"
            value={reflection}
            onChangeText={setReflection}
            maxLength={300}
          />
          {isFeatureEnabled("FEATURE_THEMES_V1") ? (
            <ThemeEditor themes={themes} onChange={setThemes} />
          ) : null}
        </View>
      ) : (
        <View style={styles.hintContainer}>
          <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
            Select a type to continue.
          </ThemedText>
        </View>
      )}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
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
  fieldsContainer: {
    marginTop: Spacing.lg,
  },
  hintContainer: {
    paddingVertical: Spacing["4xl"],
    alignItems: "center",
  },
  hint: {
    fontSize: 15,
  },
});
