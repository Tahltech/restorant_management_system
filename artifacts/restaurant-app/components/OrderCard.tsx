import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import type { Order } from "@/services/api";
import { StatusBadge } from "./ui/Badge";

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  showUser?: boolean;
}

export function OrderCard({ order, onPress, showUser = false }: OrderCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.orderId, { color: theme.text }]}>Order #{order.id.slice(-8).toUpperCase()}</Text>
          <Text style={[styles.date, { color: theme.textTertiary }]}>{date}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {showUser && order.userName && (
        <View style={[styles.userRow, { borderBottomColor: theme.border }]}>
          <Ionicons name="person-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.userName, { color: theme.textSecondary }]}>{order.userName}</Text>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.items}>
        {order.items.slice(0, 3).map((item, i) => (
          <Text key={i} style={[styles.item, { color: theme.textSecondary }]}>
            {item.quantity}× {item.mealName}
          </Text>
        ))}
        {order.items.length > 3 && (
          <Text style={[styles.more, { color: theme.textTertiary }]}>+{order.items.length - 3} more</Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.typeRow}>
          <Ionicons
            name={order.orderType === "delivery" ? "bicycle-outline" : "bag-outline"}
            size={14}
            color={theme.textSecondary}
          />
          <Text style={[styles.type, { color: theme.textSecondary }]}>
            {order.orderType === "delivery" ? "Delivery" : "Pickup"}
          </Text>
        </View>
        <Text style={[styles.total, { color: Colors.primary }]}>${order.totalPrice.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderId: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  date: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  userName: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  divider: {
    height: 1,
  },
  items: {
    gap: 2,
  },
  item: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  more: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  type: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  total: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
});
