import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BalanceScreen from "../screens/BalanceScreen";
import HistoryScreen from "../screens/HistoryScreen";
import { useAppTheme } from "../theme/ThemeContext";

export type RootTabParamList = {
  Balance: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 72,
          paddingTop: 7,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "800", paddingBottom: 7 },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={route.name === "Balance" ? "wallet-outline" : "history"}
            size={size + 2}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Balance" component={BalanceScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
}
