import React, { useState } from "react";
import {
  Alert,
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
import { TransactionType } from "../types/transaction";

type Props = {
  onSubmit: (type: TransactionType, amount: number, description: string) => Promise<void>;
  submitting: boolean;
};

export default function TransactionForm({ onSubmit, submitting }: Props) {
  const { colors } = useAppTheme();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const submit = async (type: TransactionType) => {
    const numericAmount = Number(amount);
    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert("Enter a valid amount", "Please enter an amount greater than zero.");
      return;
    }

    try {
      await onSubmit(type, numericAmount, description);
      setAmount("");
      setDescription("");
    } catch (error: any) {
      Alert.alert("Couldn't save transaction", error?.message || "Please check your backend connection.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>New transaction</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>AMOUNT</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="currency-inr" size={22} color={colors.textSecondary} />
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            style={[styles.amountInput, { color: colors.text }]}
          />
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>DESCRIPTION</Text>
        <View style={[styles.inputRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="note-text-outline" size={22} color={colors.textSecondary} />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What is this for?"
            placeholderTextColor={colors.textSecondary}
            style={[styles.textInput, { color: colors.text }]}
            maxLength={300}
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            disabled={submitting}
            onPress={() => submit("subtract")}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.negativeSoft, opacity: pressed || submitting ? 0.7 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="minus-circle-outline" size={22} color={colors.negative} />
            <Text style={[styles.actionText, { color: colors.negative }]}>Subtract</Text>
          </Pressable>

          <Pressable
            disabled={submitting}
            onPress={() => submit("add")}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.positiveSoft, opacity: pressed || submitting ? 0.7 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={22} color={colors.positive} />
            <Text style={[styles.actionText, { color: colors.positive }]}>Add</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 20, borderWidth: 1 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 20 },
  label: { fontSize: 11, fontWeight: "800", letterSpacing: 0.9, marginBottom: 8, marginTop: 4 },
  inputRow: { borderRadius: 16, minHeight: 56, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginBottom: 16 },
  amountInput: { flex: 1, fontSize: 22, fontWeight: "700", marginLeft: 9, paddingVertical: 12 },
  textInput: { flex: 1, fontSize: 16, fontWeight: "600", marginLeft: 9, paddingVertical: 12 },
  actions: { flexDirection: "row", gap: 12, marginTop: 4 },
  actionButton: { flex: 1, minHeight: 58, borderRadius: 17, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  actionText: { fontSize: 16, fontWeight: "800" },
});
