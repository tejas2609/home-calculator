import React, { createContext, useContext, useMemo } from "react";
import {
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { useColorScheme } from "react-native";

import {
  darkColors,
  lightColors,
  AppColors,
} from "./colors";


type ThemeContextValue = {
  colors: AppColors;
  isDark: boolean;
  navigationTheme: typeof DefaultTheme;
};


const ThemeContext =
  createContext<ThemeContextValue | undefined>(
    undefined
  );


export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const colorScheme = useColorScheme();

  const isDark = colorScheme === "dark";

  const colors = isDark
    ? darkColors
    : lightColors;

  const navigationTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),

      colors: {
        ...(isDark
          ? DarkTheme.colors
          : DefaultTheme.colors),

        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
        notification: colors.negative,
      },
    }),
    [isDark, colors]
  );

  return (
    <ThemeContext.Provider
      value={{
        colors,
        isDark,
        navigationTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}


export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useAppTheme must be used inside ThemeProvider"
    );
  }

  return context;
}