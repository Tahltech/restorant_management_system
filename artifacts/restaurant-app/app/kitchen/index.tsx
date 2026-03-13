import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, useColorScheme, Platform, Image } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ordersApi, type Order, type OrderStatus } from "@/services/api";
import { StatusBadge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

function KitchenOrderCard({ order, onUpdateStatus, theme }: { order: Order; onUpdateStatus: (status: OrderStatus) => void; theme: any }) {
  const timeSince = (date: string) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const isUrgent = (date: string) => Math.floor((Date.now() - new Date(date).getTime()) / 60000) > 20;

  return (
    <View style={[styles.orderCard, { backgroundColor: theme.card, borderColor: isUrgent(order.createdAt) && order.status === "pending" ? Colors.error : theme.border }]}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={[styles.orderId, { color: theme.text }]}>#{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={[styles.orderTime, { color: isUrgent(order.createdAt) ? Colors.error : theme.textTertiary }]}>
            {timeSince(order.createdAt)}
            {isUrgent(order.createdAt) && " ⚠️ Urgent"}
          </Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.typeRow}>
        <Ionicons
          name={order.orderType === "delivery" ? "bicycle-outline" : "bag-outline"}
          size={14}
          color={theme.textSecondary}
        />
        <Text style={[styles.typeText, { color: theme.textSecondary }]}>
          {order.orderType === "delivery" ? "Delivery" : "Pickup"}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.itemsList}>
        {order.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyText}>{item.quantity}</Text>
            </View>
            <Text style={[styles.itemName, { color: theme.text }]}>{item.mealName}</Text>
          </View>
        ))}
      </View>

      {order.notes && (
        <View style={[styles.notesBox, { backgroundColor: Colors.warning + "15" }]}>
          <Ionicons name="document-text-outline" size={14} color={Colors.warning} />
          <Text style={[styles.notesText, { color: Colors.warning }]}>{order.notes}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {order.status === "pending" && (
          <TouchableOpacity
            onPress={() => onUpdateStatus("preparing")}
            style={[styles.actionBtn, { backgroundColor: Colors.secondary }]}
          >
            <Ionicons name="flame" size={16} color="#FFF" />
            <Text style={styles.actionText}>Start Preparing</Text>
          </TouchableOpacity>
        )}
        {order.status === "preparing" && (
          <TouchableOpacity
            onPress={() => onUpdateStatus("ready")}
            style={[styles.actionBtn, { backgroundColor: Colors.success }]}
          >
            <Ionicons name="checkmark-circle" size={16} color="#FFF" />
            <Text style={styles.actionText}>Mark Ready</Text>
          </TouchableOpacity>
        )}
        {order.status === "ready" && (
          <View style={[styles.readyBadge, { backgroundColor: Colors.success + "20" }]}>
            <Ionicons name="checkmark-done" size={16} color={Colors.success} />
            <Text style={[styles.readyText, { color: Colors.success }]}>Ready for pickup/delivery</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function KitchenScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const qc = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<"active" | "all">("active");
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["kitchen-orders"],
    queryFn: () => ordersApi.all(),
    refetchInterval: 10000,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["kitchen-orders"] });
    },
  });

  const orders = data?.orders || [];
  const activeOrders = orders.filter((o) => o.status === "pending" || o.status === "preparing" || o.status === "ready");
  const displayed = activeFilter === "active" ? activeOrders : orders;

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: theme.background }]}>
        <View style={styles.headerLeft}>
          <Image source={require("@/assets/images/logo.png")} style={styles.headerLogo} resizeMode="contain" />
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Kitchen</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{activeOrders.length} active orders</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => logout()} style={[styles.logoutBtn, { backgroundColor: Colors.error + "15" }]}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* Status bar */}
      <View style={styles.statusBar}>
        <View style={[styles.statusItem, { backgroundColor: Colors.warning + "20" }]}>
          <Text style={[styles.statusCount, { color: Colors.warning }]}>{pendingCount}</Text>
          <Text style={[styles.statusLabel, { color: Colors.warning }]}>Pending</Text>
        </View>
        <View style={[styles.statusItem, { backgroundColor: Colors.secondary + "20" }]}>
          <Text style={[styles.statusCount, { color: Colors.secondary }]}>{preparingCount}</Text>
          <Text style={[styles.statusLabel, { color: Colors.secondary }]}>Preparing</Text>
        </View>
        <View style={[styles.statusItem, { backgroundColor: Colors.success + "20" }]}>
          <Text style={[styles.statusCount, { color: Colors.success }]}>{readyCount}</Text>
          <Text style={[styles.statusLabel, { color: Colors.success }]}>Ready</Text>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {(["active", "all"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => { Haptics.selectionAsync(); setActiveFilter(f); }}
            style={[styles.filterBtn, { backgroundColor: activeFilter === f ? Colors.primary : theme.surface }]}
          >
            <Text style={[styles.filterText, { color: activeFilter === f ? "#FFF" : theme.textSecondary }]}>
              {f === "active" ? "Active Orders" : "All Orders"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
        renderItem={({ item }) => (
          <KitchenOrderCard
            order={item}
            theme={theme}
            onUpdateStatus={(status) => updateStatus({ id: item.id, status })}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color={Colors.success} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>All caught up!</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No active orders at the moment</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 20, paddingBottom: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerLogo: { width: 32, height: 32, borderRadius: 16 },
  title: { fontFamily: "Inter_700Bold", fontSize: 26 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14 },
  logoutBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  statusBar: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 12 },
  statusItem: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12 },
  statusCount: { fontFamily: "Inter_700Bold", fontSize: 22 },
  statusLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  filterRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 12 },
  filterBtn: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 20 },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  list: { paddingHorizontal: 20 },
  orderCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  orderId: { fontFamily: "Inter_700Bold", fontSize: 17 },
  orderTime: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  typeText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  divider: { height: 1 },
  itemsList: { gap: 8 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.primary + "20", alignItems: "center", justifyContent: "center" },
  qtyText: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.primary },
  itemName: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },
  notesBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 10 },
  notesText: { fontFamily: "Inter_400Regular", fontSize: 13, flex: 1 },
  actions: {},
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 12 },
  actionText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFF" },
  readyBadge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 12 },
  readyText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  emptyState: { alignItems: "center", gap: 12, paddingTop: 80 },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 22 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center" },
});
