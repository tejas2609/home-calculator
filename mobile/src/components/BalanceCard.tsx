import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../theme/ThemeContext";
import { formatCurrency } from "../utils/format";

export default function BalanceCard({ balance }: { balance: number }) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.primary }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>AVAILABLE BALANCE</Text>
          <Text style={styles.balance}>{formatCurrency(balance)}</Text>
        </View>
        <View style={styles.icon}>
          <MaterialCommunityIcons name="wallet-outline" size={30} color="#FFFFFF" />
        </View>
      </View>
      <Text style={styles.caption}>Updated automatically from your transaction history</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    padding: 24,
    marginBottom: 22,
    minHeight: 175,
    justifyContent: "space-between",
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  label: { color: "rgba(255,255,255,0.76)", fontSize: 12, fontWeight: "800", letterSpacing: 1.1 },
  balance: { color: "#FFFFFF", fontSize: 38, fontWeight: "800", marginTop: 12, letterSpacing: -1 },
  icon: { width: 52, height: 52, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  caption: { color: "rgba(255,255,255,0.78)", fontSize: 13, fontWeight: "500" },
});
