import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Alert,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { api } from "../api/client";
import { Transaction, TransactionType } from "../types/transaction";
import TransactionItem from "../components/TransactionItem";
import EditTransactionModal from "../components/EditTransactionModal";
import { useAppTheme } from "../theme/ThemeContext";
import { useProfile } from "../profile/ProfileContext";

export default function HistoryScreen() {
  const { profileName } = useProfile();
  const { colors } = useAppTheme();

  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selected, setSelected] = useState<Transaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [historyMode, setHistoryMode] = useState<"current" | "deleted">(
    "current",
  );

  const load = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data =
        historyMode === "current"
          ? await api.getTransactions()
          : await api.getDeletedTransactions();

      setItems(data);
    } catch (error) {
      console.error("Failed to load history:", error);

      setError(
        historyMode === "current"
          ? "Could not load transaction history. Check your backend connection."
          : "Could not load deleted transaction history.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * Reload transactions whenever
   * Current / Deleted is switched
   */
  useEffect(() => {
    load();
  }, [historyMode]);

  /*
   * Reload current screen when
   * navigating back to History
   */
  useFocusEffect(
    useCallback(() => {
      load();
    }, [historyMode]),
  );

  const handleDelete = (item: Transaction) => {
    Alert.alert(
      "Delete Transaction?",
      "This transaction will be moved to Deleted History. All subsequent balances will be recalculated.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {
            try {
              await api.deleteTransaction(item.id);

              // Reload current transaction history
              const data = await api.getTransactions();

              setItems(data);

              Alert.alert(
                "Transaction Deleted",
                "The transaction was moved to Deleted History and the balances were recalculated.",
              );
            } catch (error) {
              console.error("Failed to delete transaction:", error);

              Alert.alert(
                "Delete Failed",
                "Unable to delete this transaction. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const save = async (payload: {
    type: TransactionType;
    amount: number;
    description: string;
  }) => {
    if (!selected) return;

    setSaving(true);

    try {
      await api.updateTransaction(selected.id, payload);

      setSelected(null);

      await load();
    } catch (error) {
      console.error("Failed to update transaction:", error);

      Alert.alert(
        "Update Failed",
        "Unable to update this transaction. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isCurrentHistory = historyMode === "current";

  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        style={{
          backgroundColor: colors.background,
        }}
        contentContainerStyle={[
          styles.container,
          items.length === 0 && styles.emptyContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>See the history, {profileName}</Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {isCurrentHistory
                ? "Tap a transaction to edit it."
                : "Transactions removed from your active history."}
            </Text>

            {/* CURRENT / DELETED TOGGLE */}

            <View
              style={[
                styles.historyToggle,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* CURRENT */}

              <Pressable
                onPress={() => setHistoryMode("current")}
                style={[
                  styles.toggleButton,

                  historyMode === "current" && {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="history"
                  size={18}
                  color={
                    historyMode === "current" ? "#FFFFFF" : colors.textSecondary
                  }
                />

                <Text
                  style={[
                    styles.toggleText,
                    {
                      color:
                        historyMode === "current"
                          ? "#FFFFFF"
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Current
                </Text>
              </Pressable>

              {/* DELETED */}

              <Pressable
                onPress={() => setHistoryMode("deleted")}
                style={[
                  styles.toggleButton,

                  historyMode === "deleted" && {
                    backgroundColor: colors.negative,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={18}
                  color={
                    historyMode === "deleted" ? "#FFFFFF" : colors.textSecondary
                  }
                />

                <Text
                  style={[
                    styles.toggleText,
                    {
                      color:
                        historyMode === "deleted"
                          ? "#FFFFFF"
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Deleted
                </Text>
              </Pressable>
            </View>

            {error ? (
              <Text
                style={[
                  styles.error,
                  {
                    color: colors.negative,
                  },
                ]}
              >
                {error}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            onPress={
              historyMode === "current" ? () => setSelected(item) : undefined
            }
            onDelete={
              historyMode === "current" ? () => handleDelete(item) : undefined
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: isCurrentHistory
                    ? colors.primarySoft
                    : colors.negativeSoft,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={isCurrentHistory ? "history" : "trash-can-outline"}
                size={38}
                color={isCurrentHistory ? colors.primary : colors.negative}
              />
            </View>

            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {isCurrentHistory
                ? "No transactions yet"
                : "No deleted transactions"}
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {isCurrentHistory
                ? "Add your first transaction from the Balance tab."
                : "Deleted transactions will appear here."}
            </Text>
          </View>
        }
      />

      {/* EDIT MODAL ONLY FOR CURRENT HISTORY */}

      {historyMode === "current" && (
        <EditTransactionModal
          visible={!!selected}
          transaction={selected}
          saving={saving}
          onClose={() => setSelected(null)}
          onSave={save}
        />
      )}
    </>
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

  emptyContainer: {
    flexGrow: 1,
  },

  header: {
    marginTop: 12,
    marginBottom: 22,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 5,
    marginBottom: 18,
  },

  historyToggle: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },

  toggleButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  toggleText: {
    fontSize: 14,
    fontWeight: "800",
  },

  error: {
    marginTop: 10,
    fontWeight: "700",
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    minHeight: 420,
  },

  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    fontWeight: "600",
  },
});
