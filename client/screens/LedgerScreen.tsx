import React, { useState, useCallback } from "react";
import { StyleSheet, FlatList, View, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { Entry, EntryType } from "@/types/entry";
import { getEntries } from "@/lib/storage";
import { EntryCard } from "@/components/EntryCard";
import { FilterPills } from "@/components/FilterPills";
import { EmptyState } from "@/components/EmptyState";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type FilterValue = "all" | EntryType;

export default function LedgerScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    try {
      const data = await getEntries();
      setEntries(data);
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadEntries();
  }, [loadEntries]);

  const filteredEntries =
    filter === "all" ? entries : entries.filter((e) => e.type === filter);

  const handleEntryPress = (entry: Entry) => {
    navigation.navigate("EntryDetail", { entryId: entry.id });
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Entry; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <EntryCard entry={item} onPress={() => handleEntryPress(item)} />
      </Animated.View>
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item: Entry) => item.id, []);

  const ListEmptyComponent = useCallback(() => {
    if (loading) return null;
    if (filter !== "all" && entries.length > 0) {
      return (
        <EmptyState
          message={`No "${filter}" entries yet.`}
        />
      );
    }
    return <EmptyState />;
  }, [loading, filter, entries.length]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredEntries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
        ListHeaderComponent={
          <View style={styles.filterContainer}>
            <FilterPills value={filter} onChange={setFilter} />
          </View>
        }
        ListEmptyComponent={ListEmptyComponent}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.textSecondary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  filterContainer: {
    marginBottom: Spacing.lg,
  },
});
