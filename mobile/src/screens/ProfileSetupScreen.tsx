import React, { useState } from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAppTheme } from "../theme/ThemeContext";
import { useProfile } from "../profile/ProfileContext";

export default function ProfileSetupScreen() {
  const { colors } = useAppTheme();
  const { createProfile } = useProfile();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    const cleanName = name.trim();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (cleanName.length < 2) {
      setError("Please enter a valid name.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createProfile(cleanName);
    } catch {
      setError("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      behavior={
        Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primarySoft },
          ]}
        >
          <MaterialCommunityIcons
            name="account-outline"
            size={42}
            color={colors.primary}
          />
        </View>

        <Text
          style={[
            styles.title,
            { color: colors.text },
          ]}
        >
          Who are you?
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary },
          ]}
        >
          Enter your name to set up this device.
          All transactions created here will be associated
          with your profile.
        </Text>

        <View style={styles.inputContainer}>
          <Text
            style={[
              styles.label,
              { color: colors.text },
            ]}
          >
            Your name
          </Text>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: error
                  ? colors.negative
                  : colors.border,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={21}
              color={colors.textSecondary}
            />

            <TextInput
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError("");
              }}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                { color: colors.text },
              ]}
              autoFocus
              autoCapitalize="words"
              autoCorrect={false}
              editable={!saving}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>

          {error ? (
            <Text
              style={[
                styles.error,
                { color: colors.negative },
              ]}
            >
              {error}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={saving}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.primary,
              opacity: pressed || saving ? 0.75 : 1,
            },
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.buttonText}>
                Continue
              </Text>

              <MaterialCommunityIcons
                name="arrow-right"
                size={22}
                color="#FFFFFF"
              />
            </>
          )}
        </Pressable>

        <Text
          style={[
            styles.note,
            { color: colors.textSecondary },
          ]}
        >
          This profile name cannot be changed from the app.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
  },

  iconContainer: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 9,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
    marginBottom: 32,
  },

  inputContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 9,
  },

  inputWrapper: {
    height: 58,
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 12,
  },

  error: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "700",
  },

  button: {
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  note: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 18,
    lineHeight: 18,
  },
});