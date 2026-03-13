import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, useColorScheme, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ordersApi, type OrderStatus, type Order } from "@/services/api";
import { OrderCard } from "@/components/OrderCard";
import { StatusBadge } from "@/components/ui/Badge";
import * as Haptics from "expo-haptics";

const STATUSES: Array<{ label: string; value: OrderStatus | null }> = [
  { label: "All", value: null },
  { label: "Pending", value: "pending" },
  { label: "Preparing", value: "preparing" },
  { label: "Ready", value: "ready" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AdminOrdersScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const qc = useQueryClient();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders", selectedStatus],
    queryFn: () => ordersApi.all(selectedStatus || undefined),
    refetchInterval: 15000,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const nextStatus: Record<OrderStatus, OrderStatus | null> = {
    pending: "preparing",
    preparing: "ready",
    ready: "delivered",
    delivered: null,
    cancelled: null,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>All Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.filterContainer, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {STATUSES.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => { Haptics.selectionAsync(); setSelectedStatus(item.value); }}
              style={[styles.filterChip, { backgroundColor: selectedStatus === item.value ? Colors.primary : theme.surface }]}
            >
              <Text style={[styles.filterText, { color: selectedStatus === item.value ? "#FFF" : theme.textSecondary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={data?.orders || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
        renderItem={({ item }) => (
          <View style={styles.orderContainer}>
            <OrderCard order={item} onPress={() => {}} showUser />
            {nextStatus[item.status] && (
              <TouchableOpacity
                onPress={() => updateStatus({ id: item.id, status: nextStatus[item.status]! })}
                style={styles.nextStatusBtn}
              >
                <Text style={styles.nextStatusText}>
                  Mark as {nextStatus[item.status]?.charAt(0).toUpperCase()}{nextStatus[item.status]?.slice(1)}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No orders</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontFamily: "Inter_700Bold", fontSize: 20 },
  filterContainer: { 
    borderBottomWidth: 1, 
  },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingVertical: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, minWidth: 80, alignItems: 'center' },
  filterText: { fontFamily: "Inter_600SemiBold", fontSize: 14, textAlign: 'center' },
  list: { paddingHorizontal: 20 },
  orderContainer: { gap: 8 },
  nextStatusBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 10,
  },
  nextStatusText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFF" },
  emptyState: { alignItems: "center", gap: 12, paddingTop: 60 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 15 },
});
