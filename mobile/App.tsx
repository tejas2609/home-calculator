import React from "react";

import {
  ActivityIndicator,
  View,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";

import AppNavigator from "./src/navigation/AppNavigator";
import ProfileSetupScreen from "./src/screens/ProfileSetupScreen";

import {
  ProfileProvider,
  useProfile,
} from "./src/profile/ProfileContext";

import {
  ThemeProvider,
  useAppTheme,
} from "./src/theme/ThemeContext";

function AppContent() {
  const {
    profileName,
    loadingProfile,
  } = useProfile();

  const { colors } = useAppTheme();

  if (loadingProfile) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  if (!profileName) {
    return <ProfileSetupScreen />;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </ThemeProvider>
  );
}