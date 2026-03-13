import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Platform, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ordersApi, type OrderStatus } from "@/services/api";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import * as Haptics from "expo-haptics";

const STATUS_STEPS: OrderStatus[] = ["pending", "preparing", "ready", "delivered"];

function StatusTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
  const isDark = true;
  const cancelled = currentStatus === "cancelled";
  return (
    <View style={styles.timeline}>
      {STATUS_STEPS.map((step, i) => {
        const stepIndex = STATUS_STEPS.indexOf(currentStatus);
        const isActive = i <= stepIndex;
        const isCurrent = i === stepIndex;
        return (
          <View key={step} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.dot, {
                backgroundColor: cancelled ? Colors.error : isActive ? Colors.primary : "#444",
                borderColor: isCurrent && !cancelled ? Colors.primary : "transparent",
                borderWidth: isCurrent ? 3 : 0,
              }]}>
                {isActive && !cancelled && <Ionicons name="checkmark" size={10} color="#FFF" />}
              </View>
              {i < STATUS_STEPS.length - 1 && (
                <View style={[styles.line, { backgroundColor: isActive && i < stepIndex ? Colors.primary : "#333" }]} />
              )}
            </View>
            <Text style={[styles.stepLabel, { color: isActive && !cancelled ? "#FFF" : "#888" }]}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.get(id!),
    enabled: !!id,
    refetchInterval: order?.status !== "delivered" && order?.status !== "cancelled" ? 10000 : false,
  });

  const { mutate: cancelOrder, isPending: cancelling } = useMutation({
    mutationFn: () => ordersApi.cancel(id!),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      qc.invalidateQueries({ queryKey: ["order", id] });
      qc.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });

  const handleCancel = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "Keep Order", style: "cancel" },
      { text: "Cancel Order", style: "destructive", onPress: () => cancelOrder() },
    ]);
  };

  if (isLoading || !order) {
    return (
      <View style={[styles.container, { backgroundColor: "#0F0F0F" }]}>
        <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#0F0F0F" }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <StatusBadge status={order.status} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Order ID & Date */}
        <View style={styles.orderIdSection}>
          <Text style={styles.orderId}>#{order.id.slice(-10).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleString()}</Text>
        </View>

        {/* Status Timeline */}
        {order.status !== "cancelled" && (
          <View style={styles.timelineCard}>
            <Text style={styles.trackingTitle}>Order Tracking</Text>
            <StatusTimeline currentStatus={order.status} />
          </View>
        )}

        {order.status === "cancelled" && (
          <View style={styles.cancelledBanner}>
            <Ionicons name="close-circle" size={32} color={Colors.error} />
            <Text style={styles.cancelledText}>Order Cancelled</Text>
          </View>
        )}

        {/* Items */}
        <View style={styles.itemsCard}>
          <Text style={styles.cardTitle}>Items Ordered</Text>
          {order.items.map((item, i) => (
            <View key={i} style={styles.orderItem}>
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>{item.quantity}</Text>
              </View>
              <Text style={styles.itemName} numberOfLines={1}>{item.mealName}</Text>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${order.totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Order Details</Text>
          <View style={styles.infoRow}>
            <Ionicons name={order.orderType === "delivery" ? "bicycle-outline" : "bag-outline"} size={18} color="#AAA" />
            <Text style={styles.infoLabel}>{order.orderType === "delivery" ? "Delivery" : "Pickup"}</Text>
          </View>
          {order.deliveryAddress && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color="#AAA" />
              <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={18} color="#AAA" />
            <Text style={styles.infoLabel}>{order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}</Text>
          </View>
          {order.notes && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={18} color="#AAA" />
              <Text style={styles.infoValue}>{order.notes}</Text>
            </View>
          )}
        </View>

        {/* Cancel button */}
        {order.status === "pending" && (
          <Button
            title="Cancel Order"
            onPress={handleCancel}
            variant="danger"
            loading={cancelling}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFF" },
  content: { padding: 20, gap: 16 },
  orderIdSection: { gap: 4 },
  orderId: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#FFF" },
  orderDate: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#888" },
  timelineCard: { backgroundColor: "#1A1A1A", borderRadius: 16, padding: 20, gap: 16 },
  trackingTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFF" },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: "row", alignItems: "flex-start", gap: 12, minHeight: 50 },
  timelineLeft: { alignItems: "center", gap: 0 },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", zIndex: 1 },
  line: { width: 2, flex: 1, minHeight: 20, marginTop: 4 },
  stepLabel: { fontFamily: "Inter_500Medium", fontSize: 14, paddingTop: 4 },
  cancelledBanner: { backgroundColor: Colors.error + "20", borderRadius: 16, padding: 24, alignItems: "center", gap: 12 },
  cancelledText: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.error },
  itemsCard: { backgroundColor: "#1A1A1A", borderRadius: 16, padding: 16, gap: 12 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFF" },
  orderItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBadge: { backgroundColor: Colors.primary + "20", borderRadius: 8, width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  qtyText: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.primary },
  itemName: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: "#CCC" },
  itemPrice: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#FFF" },
  divider: { height: 1, backgroundColor: "#2C2C2C" },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFF" },
  totalValue: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.primary },
  infoCard: { backgroundColor: "#1A1A1A", borderRadius: 16, padding: 16, gap: 12 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#CCC" },
  infoValue: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#AAA", flex: 1 },
});
