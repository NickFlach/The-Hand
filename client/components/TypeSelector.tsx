import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
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

interface TypeSelectorProps {
  value: EntryType | null;
  onChange: (type: EntryType) => void;
}

const types: { value: EntryType; label: string }[] = [
  { value: "built", label: "Built" },
  { value: "helped", label: "Helped" },
  { value: "learned", label: "Learned" },
];

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 200,
};

function TypeButton({
  type,
  isSelected,
  onPress,
}: {
  type: { value: EntryType; label: string };
  isSelected: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withSpring(
      isSelected ? theme.text : "transparent",
      springConfig
    ),
    transform: [{ scale: withSpring(isSelected ? 1 : 0.98, springConfig) }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={[styles.buttonWrapper, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        style={styles.button}
        testID={`type-selector-${type.value}`}
      >
        <ThemedText
          style={[
            styles.buttonText,
            { color: isSelected ? theme.backgroundRoot : theme.text },
          ]}
        >
          {type.label}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundSecondary, borderColor: theme.divider },
      ]}
    >
      {types.map((type) => (
        <TypeButton
          key={type.value}
          type={type}
          isSelected={value === type.value}
          onPress={() => onChange(type.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
    borderWidth: 1,
  },
  buttonWrapper: {
    flex: 1,
    borderRadius: BorderRadius.xs,
  },
  button: {
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
