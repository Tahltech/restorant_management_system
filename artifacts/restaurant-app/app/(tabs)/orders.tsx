import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, useColorScheme, Platform } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ordersApi, type OrderStatus } from "@/services/api";
import { OrderCard } from "@/components/OrderCard";

const STATUSES: Array<{ label: string; value: OrderStatus | null }> = [
  { label: "All", value: null },
  { label: "Pending", value: "pending" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function OrdersScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => ordersApi.myOrders(),
  });

  const filtered = selectedStatus
    ? data?.orders.filter((o) => o.status === selectedStatus) || []
    : data?.orders || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.title, { color: theme.text }]}>My Orders</Text>
      </View>

      {/* Status filter */}
      <View>
        <FlatList
          horizontal
          data={STATUSES}
          keyExtractor={(item) => item.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedStatus(item.value)}
              style={[styles.filterChip, { backgroundColor: selectedStatus === item.value ? Colors.primary : theme.surface }]}
            >
              <Text style={[styles.filterText, { color: selectedStatus === item.value ? "#FFF" : theme.textSecondary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => router.push(`/order/${item.id}`)} />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={56} color={theme.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No orders yet</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {selectedStatus ? `No ${selectedStatus} orders` : "Your order history will appear here"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  emptyState: { alignItems: "center", gap: 12, paddingTop: 60 },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 20 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center" },
});
