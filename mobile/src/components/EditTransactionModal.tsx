import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../theme/ThemeContext";
import { Transaction, TransactionType } from "../types/transaction";

type Props = {
  visible: boolean;
  transaction: Transaction | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: { type: TransactionType; amount: number; description: string }) => Promise<void>;
};

export default function EditTransactionModal({
  visible,
  transaction,
  saving,
  onClose,
  onSave,
}: Props) {
  const { colors } = useAppTheme();
  const [type, setType] = useState<TransactionType>("add");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setDescription(transaction.description);
    }
  }, [transaction]);

  const save = () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert("Enter a valid amount", "Amount must be greater than zero.");
      return;
    }

    Alert.alert(
      "Update transaction?",
      "This will recalculate the remaining balance for this and all following transactions.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: async () => {
            try {
              await onSave({ type, amount: numericAmount, description });
              onClose();
            } catch (error: any) {
              Alert.alert("Update failed", error?.message || "Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Edit transaction</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Balances after this item will update.
              </Text>
            </View>
            <Pressable onPress={onClose} style={[styles.close, { backgroundColor: colors.surfaceSecondary }]}>
              <MaterialCommunityIcons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>TRANSACTION TYPE</Text>
          <View style={styles.typeRow}>
            {(["add", "subtract"] as TransactionType[]).map((option) => {
              const active = type === option;
              const positive = option === "add";
              const color = positive ? colors.positive : colors.negative;
              return (
                <Pressable
                  key={option}
                  onPress={() => setType(option)}
                  style={[
                    styles.typeButton,
                    {
                      borderColor: active ? color : colors.border,
                      backgroundColor: active ? (positive ? colors.positiveSoft : colors.negativeSoft) : colors.surface,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={positive ? "plus-circle-outline" : "minus-circle-outline"}
                    size={21}
                    color={active ? color : colors.textSecondary}
                  />
                  <Text style={{ color: active ? color : colors.textSecondary, fontWeight: "800" }}>
                    {positive ? "Add" : "Subtract"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>AMOUNT</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>DESCRIPTION</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            maxLength={300}
          />

          <Pressable
            disabled={saving}
            onPress={save}
            style={({ pressed }) => [styles.save, { backgroundColor: colors.primary, opacity: saving || pressed ? 0.7 : 1 }]}
          >
            <MaterialCommunityIcons name="check-circle-outline" size={21} color="#FFFFFF" />
            <Text style={styles.saveText}>{saving ? "Updating..." : "Save changes"}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 22, paddingBottom: 34 },
  handleWrap: { alignItems: "center", marginBottom: 12 },
  handle: { width: 44, height: 5, borderRadius: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 },
  title: { fontSize: 23, fontWeight: "900" },
  subtitle: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  close: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 11, fontWeight: "900", letterSpacing: 0.9, marginBottom: 8, marginTop: 4 },
  typeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  typeButton: { flex: 1, minHeight: 52, borderRadius: 15, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  input: { minHeight: 54, borderRadius: 15, borderWidth: 1, paddingHorizontal: 15, fontSize: 16, fontWeight: "700", marginBottom: 16 },
  save: { minHeight: 57, borderRadius: 17, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 4 },
  saveText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
});
