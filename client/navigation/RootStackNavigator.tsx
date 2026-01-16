import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { View, StyleSheet, Image } from "react-native";
import { HeaderButton } from "@react-navigation/elements";

import LedgerScreen from "@/screens/LedgerScreen";
import NewEntryScreen from "@/screens/NewEntryScreen";
import EntryDetailScreen from "@/screens/EntryDetailScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import PatternsScreen from "@/screens/PatternsScreen";
import ReviewScreen from "@/screens/ReviewScreen";
import ExportScreen from "@/screens/ExportScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing } from "@/constants/theme";

export type RootStackParamList = {
  Ledger: undefined;
  NewEntry: undefined;
  EntryDetail: { entryId: string };
  Settings: undefined;
  Patterns: undefined;
  Review: undefined;
  Export: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function HeaderTitle() {
  return (
    <View style={styles.headerTitleContainer}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.headerIcon}
        resizeMode="contain"
      />
      <ThemedText style={styles.headerTitleText}>The Hand</ThemedText>
    </View>
  );
}

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Ledger"
        component={LedgerScreen}
        options={({ navigation }) => ({
          headerTitle: () => <HeaderTitle />,
          headerLeft: () => (
            <HeaderButton onPress={() => navigation.navigate("Settings")}>
              <Feather name="settings" size={22} color={theme.text} />
            </HeaderButton>
          ),
          headerRight: () => (
            <HeaderButton onPress={() => navigation.navigate("NewEntry")}>
              <Feather name="plus" size={24} color={theme.text} />
            </HeaderButton>
          ),
        })}
      />
      <Stack.Screen
        name="NewEntry"
        component={NewEntryScreen}
        options={{
          presentation: "modal",
          headerTitle: "New Entry",
        }}
      />
      <Stack.Screen
        name="EntryDetail"
        component={EntryDetailScreen}
        options={{
          headerTitle: "Entry",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="Patterns"
        component={PatternsScreen}
        options={{
          headerTitle: "Patterns",
        }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{
          headerTitle: "Review",
        }}
      />
      <Stack.Screen
        name="Export"
        component={ExportScreen}
        options={{
          headerTitle: "Export",
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 26,
    height: 26,
    marginRight: Spacing.sm,
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
