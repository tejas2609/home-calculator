import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Transaction } from "../types/transaction";
import { useAppTheme } from "../theme/ThemeContext";
import { formatCurrency, formatDate } from "../utils/format";

export default function TransactionItem({
  item,
  onPress,
  onDelete,
}: {
  item: Transaction;
  onPress?: () => void;
  onDelete?: () => void;
}) {
  const { colors } = useAppTheme();

  const isAdd = item.type === "add";
  const accent = isAdd ? colors.positive : colors.negative;
  const soft = isAdd ? colors.positiveSoft : colors.negativeSoft;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: onPress && pressed ? 0.82 : 1,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: soft }]}>
        <MaterialCommunityIcons
          name={isAdd ? "arrow-bottom-left" : "arrow-top-right"}
          size={23}
          color={accent}
        />
      </View>

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[styles.description, { color: colors.text }]}
        >
          {item.description || "No description"}
        </Text>

        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(item.createdAt)}
        </Text>

        <Text style={[styles.remaining, { color: colors.textSecondary }]}>
          Balance after: {formatCurrency(item.balanceAfter)}
        </Text>

        <Text style={[styles.remaining, { color: colors.textSecondary }]}>
          User: {'owner' in item ? item.owner : ''}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: accent }]}>
          {isAdd ? "+" : "−"} {formatCurrency(item.amount)}
        </Text>

        {(onPress || onDelete) && (
          <View style={styles.actions}>
            {/* EDIT */}
            {onPress && (
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  onPress();
                }}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: colors.background,
                    opacity: pressed ? 0.65 : 1,
                  },
                ]}
                hitSlop={6}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
            )}

            {/* DELETE */}
            {onDelete && (
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: colors.negativeSoft,
                    opacity: pressed ? 0.65 : 1,
                  },
                ]}
                hitSlop={6}
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={18}
                  color={colors.negative}
                />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 108,
    borderRadius: 21,
    padding: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  content: {
    flex: 1,
    paddingRight: 8,
  },

  description: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },

  date: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },

  remaining: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6
  },

  right: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 10,
  },

  amount: {
    fontSize: 15,
    fontWeight: "900",
  },

  actions: {
    flexDirection: "row",
    gap: 7,
  },

  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
