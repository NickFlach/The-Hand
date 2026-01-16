import React from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { EntryType } from "@/types/entry";

type FilterValue = "all" | EntryType;

interface FilterPillsProps {
  value: FilterValue;
  onChange: (filter: FilterValue) => void;
}

const filters: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "built", label: "Built" },
  { value: "helped", label: "Helped" },
  { value: "learned", label: "Learned" },
];

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 200,
};

function FilterPill({
  filter,
  isSelected,
  onPress,
}: {
  filter: { value: FilterValue; label: string };
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withSpring(
      isSelected ? theme.text : "transparent",
      springConfig
    ),
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={[styles.pillWrapper, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        style={[styles.pill, { borderColor: theme.divider }]}
        testID={`filter-pill-${filter.value}`}
      >
        <ThemedText
          style={[
            styles.pillText,
            { color: isSelected ? theme.backgroundRoot : theme.text },
          ]}
        >
          {filter.label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export function FilterPills({ value, onChange }: FilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((filter) => (
        <FilterPill
          key={filter.value}
          filter={filter}
          isSelected={value === filter.value}
          onPress={() => onChange(filter.value)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  pillWrapper: {
    borderRadius: BorderRadius.full,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
