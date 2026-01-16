import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Entry, EntryType } from "@/types/entry";
import { formatRelativeTime } from "@/lib/storage";

interface EntryCardProps {
  entry: Entry;
  onPress: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

export function EntryCard({ entry, onPress }: EntryCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
    opacity.value = withSpring(0.7, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
    opacity.value = withSpring(1, springConfig);
  };

  const badgeColor = getTypeBadgeColor(entry.type, theme);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.divider,
        },
        animatedStyle,
      ]}
      testID={`entry-card-${entry.id}`}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <ThemedText
            style={[styles.badgeText, { color: theme.backgroundRoot }]}
          >
            {getTypeLabel(entry.type)}
          </ThemedText>
        </View>
        <ThemedText style={[styles.timestamp, { color: theme.textSecondary }]}>
          {formatRelativeTime(entry.createdAt)}
        </ThemedText>
      </View>
      <ThemedText
        style={styles.affectedPreview}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {entry.affected}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
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
    fontFamily: "monospace",
  },
  affectedPreview: {
    fontSize: 15,
    lineHeight: 22,
  },
});
