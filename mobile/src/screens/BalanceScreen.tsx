import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import BalanceCard from "../components/BalanceCard";
import TransactionForm from "../components/TransactionForm";
import { api } from "../api/client";
import { useAppTheme } from "../theme/ThemeContext";
import { TransactionType } from "../types/transaction";
import { useProfile } from "../profile/ProfileContext";

export default function BalanceScreen() {
  const { profileName } = useProfile();
  const { colors } = useAppTheme();

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);

      setError("");

      setBalance(await api.getBalance());
    } catch {
      setError(
        "Backend unavailable. Check EXPO_PUBLIC_API_URL and make sure FastAPI is running.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const create = async (
    type: TransactionType,
    amount: number,
    description: string,
  ) => {
    if (!profileName) return;

    setSubmitting(true);

    try {
      await api.createTransaction({
        type,
        amount,
        description,
        owner: profileName,
      });

      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor={colors.primary}
        />
      }
      keyboardShouldPersistTaps="handled"
    >
      {/* HEADER */}
      <View style={styles.top}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Welcome back,
          </Text>

          <Text style={[styles.userName, { color: colors.text }]}>
            {profileName}
          </Text>
        </View>
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Manage your balance in seconds.
      </Text>

      <BalanceCard balance={balance} />

      {error ? (
        <View
          style={[
            styles.error,
            {
              backgroundColor: colors.negativeSoft,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={20}
            color={colors.negative}
          />

          <Text
            style={{
              color: colors.negative,
              fontWeight: "700",
              flex: 1,
            }}
          >
            {error}
          </Text>
        </View>
      ) : null}

      <TransactionForm onSubmit={create} submitting={submitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    padding: 20,
    paddingBottom: 34,
  },

  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 4,
  },

  greeting: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 3,
  },

  userName: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  profileIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 22,
  },

  error: {
    borderRadius: 15,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
