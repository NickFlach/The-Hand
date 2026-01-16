import React, { useState, useCallback } from "react";
import { StyleSheet, View, ScrollView, Modal, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Settings, getSettings, updateSettings } from "@/lib/storage";
import { isFeatureEnabled } from "@/lib/features";
import { SettingsRow } from "@/components/SettingsRow";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  const loadSettings = useCallback(async () => {
    const data = await getSettings();
    setSettings(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  const handleToggleHighContrast = async (value: boolean) => {
    const updated = await updateSettings({ highContrastMode: value });
    setSettings(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const hasV1Tools =
    isFeatureEnabled("FEATURE_PATTERNS_V1") ||
    isFeatureEnabled("FEATURE_REVIEW_MODE_V1") ||
    isFeatureEnabled("FEATURE_EXPORT_V1");

  const hasV2Tools =
    isFeatureEnabled("FEATURE_RESPONSIBILITY_THREADS_V2") ||
    isFeatureEnabled("FEATURE_LONG_HORIZON_VIEW_V2");

  const hasV3Tools = isFeatureEnabled("FEATURE_TRUSTED_HANDS_V3");

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
        {hasV2Tools ? (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              CONTINUITY
            </ThemedText>
            {isFeatureEnabled("FEATURE_RESPONSIBILITY_THREADS_V2") ? (
              <SettingsRow
                label="Responsibilities"
                description="What you carry across time"
                onPress={() => navigation.navigate("Threads")}
                showChevron
              />
            ) : null}
            {isFeatureEnabled("FEATURE_LONG_HORIZON_VIEW_V2") ? (
              <SettingsRow
                label="Archive"
                description="Browse entries by time"
                onPress={() => navigation.navigate("Archive")}
                showChevron
              />
            ) : null}
          </View>
        ) : null}

        {hasV3Tools ? (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              ACCOUNTABILITY
            </ThemedText>
            <SettingsRow
              label="Trusted Hands"
              description="People who witness, not respond"
              onPress={() => navigation.navigate("TrustedHands")}
              showChevron
            />
          </View>
        ) : null}

        {hasV1Tools ? (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              TOOLS
            </ThemedText>
            {isFeatureEnabled("FEATURE_PATTERNS_V1") ? (
              <SettingsRow
                label="Patterns"
                description="View entry distribution over time"
                onPress={() => navigation.navigate("Patterns")}
                showChevron
              />
            ) : null}
            {isFeatureEnabled("FEATURE_REVIEW_MODE_V1") ? (
              <SettingsRow
                label="Review"
                description="Reflect on entries over a period"
                onPress={() => navigation.navigate("Review")}
                showChevron
              />
            ) : null}
            {isFeatureEnabled("FEATURE_EXPORT_V1") ? (
              <SettingsRow
                label="Export"
                description="Export your data"
                onPress={() => navigation.navigate("Export")}
                showChevron
              />
            ) : null}
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            ACCESSIBILITY
          </ThemedText>
          <SettingsRow
            label="High Contrast Mode"
            toggle={{
              value: settings?.highContrastMode ?? false,
              onValueChange: handleToggleHighContrast,
            }}
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            ABOUT
          </ThemedText>
          <SettingsRow
            label="About The Hand"
            onPress={() => setShowAbout(true)}
            showChevron
          />
        </View>

        <View style={styles.footerPadding} />
      </ScrollView>

      <Modal
        visible={showAbout}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAbout(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.aboutModal, { backgroundColor: theme.backgroundDefault }]}>
            <Image
              source={require("../../assets/images/about-illustration.png")}
              style={styles.aboutImage}
              resizeMode="contain"
            />
            <ThemedText type="h2" style={styles.aboutTitle}>
              The Hand
            </ThemedText>
            <ThemedText style={[styles.aboutVersion, { color: theme.textSecondary }]}>
              Version 1.3
            </ThemedText>
            <ThemedText style={[styles.aboutDescription, { color: theme.textSecondary }]}>
              A private ledger for recording what you built, who you helped, and what you learned—without performance or judgment.
            </ThemedText>

            <View style={styles.principlesList}>
              <ThemedText style={[styles.principleItem, { color: theme.textSecondary }]}>
                Private by default
              </ThemedText>
              <ThemedText style={[styles.principleItem, { color: theme.textSecondary }]}>
                Local-first
              </ThemedText>
              <ThemedText style={[styles.principleItem, { color: theme.textSecondary }]}>
                No scoring or streaks
              </ThemedText>
              <ThemedText style={[styles.principleItem, { color: theme.textSecondary }]}>
                You own your data
              </ThemedText>
            </View>

            <Pressable
              onPress={() => setShowAbout(false)}
              style={[styles.closeButton, { backgroundColor: theme.text }]}
            >
              <ThemedText style={[styles.closeButtonText, { color: theme.backgroundRoot }]}>
                Close
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  footerPadding: {
    height: Spacing["4xl"],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  aboutModal: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  aboutImage: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
    opacity: 0.7,
  },
  aboutTitle: {
    marginBottom: Spacing.xs,
  },
  aboutVersion: {
    fontSize: 13,
    marginBottom: Spacing.xl,
  },
  aboutDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  principlesList: {
    alignSelf: "stretch",
    marginBottom: Spacing.xl,
  },
  principleItem: {
    fontSize: 14,
    lineHeight: 28,
    textAlign: "center",
  },
  closeButton: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
