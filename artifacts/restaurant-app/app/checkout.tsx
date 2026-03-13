import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Platform } from "react-native";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ordersApi, type OrderType, type PaymentMethod } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as Haptics from "expo-haptics";

export default function CheckoutScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const qc = useQueryClient();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.addresses?.[0] || "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: () =>
      ordersApi.create({
        items: items.map((i) => ({ mealId: i.mealId, quantity: i.quantity })),
        orderType,
        deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
        paymentMethod,
        notes: notes || undefined,
      }),
    onSuccess: (order) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();
      qc.invalidateQueries({ queryKey: ["my-orders"] });
      router.replace(`/order/${order.id}`);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to place order");
    },
  });

  const handlePlaceOrder = () => {
    if (orderType === "delivery" && !deliveryAddress.trim()) {
      setError("Please enter a delivery address");
      return;
    }
    setError("");
    placeOrder();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Order Type */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Type</Text>
          <View style={styles.optionRow}>
            {(["delivery", "pickup"] as OrderType[]).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => { Haptics.selectionAsync(); setOrderType(type); }}
                style={[styles.optionBtn, {
                  borderColor: orderType === type ? Colors.primary : theme.border,
                  backgroundColor: orderType === type ? Colors.primary + "10" : theme.surface,
                }]}
              >
                <Ionicons
                  name={type === "delivery" ? "bicycle-outline" : "bag-outline"}
                  size={20}
                  color={orderType === type ? Colors.primary : theme.textSecondary}
                />
                <Text style={[styles.optionText, { color: orderType === type ? Colors.primary : theme.textSecondary }]}>
                  {type === "delivery" ? "Delivery" : "Pickup"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Address */}
        {orderType === "delivery" && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery Address</Text>
            {user?.addresses && user.addresses.length > 0 && (
              <View style={styles.savedAddresses}>
                {user.addresses.map((addr, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => { Haptics.selectionAsync(); setDeliveryAddress(addr); }}
                    style={[styles.addressBtn, {
                      borderColor: deliveryAddress === addr ? Colors.primary : theme.border,
                      backgroundColor: deliveryAddress === addr ? Colors.primary + "10" : theme.surface,
                    }]}
                  >
                    <Ionicons name="location-outline" size={16} color={deliveryAddress === addr ? Colors.primary : theme.textSecondary} />
                    <Text style={[styles.addressText, { color: deliveryAddress === addr ? Colors.primary : theme.text }]} numberOfLines={1}>{addr}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Input
              placeholder="Or enter delivery address..."
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              leftIcon="location-outline"
              multiline
            />
          </View>
        )}

        {/* Payment */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            {([
              { value: "card" as PaymentMethod, icon: "card-outline", label: "Card" },
              { value: "cash" as PaymentMethod, icon: "cash-outline", label: "Cash" },
              { value: "online" as PaymentMethod, icon: "phone-portrait-outline", label: "Online" },
            ]).map((pm) => (
              <TouchableOpacity
                key={pm.value}
                onPress={() => { Haptics.selectionAsync(); setPaymentMethod(pm.value); }}
                style={[styles.paymentBtn, {
                  borderColor: paymentMethod === pm.value ? Colors.primary : theme.border,
                  backgroundColor: paymentMethod === pm.value ? Colors.primary + "10" : theme.surface,
                }]}
              >
                <Ionicons name={pm.icon as any} size={22} color={paymentMethod === pm.value ? Colors.primary : theme.textSecondary} />
                <Text style={[styles.paymentLabel, { color: paymentMethod === pm.value ? Colors.primary : theme.textSecondary }]}>{pm.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Notes</Text>
          <Input
            placeholder="Any special requests? (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ height: 72 }}
          />
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.mealId} style={styles.summaryItem}>
              <Text style={[styles.summaryItemName, { color: theme.text }]}>{item.quantity}× {item.mealName}</Text>
              <Text style={[styles.summaryItemPrice, { color: theme.textSecondary }]}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: Colors.primary }]}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 16 }]}>
        <Button
          title={`Place Order • $${total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          loading={isPending}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontFamily: "Inter_700Bold", fontSize: 18 },
  content: { padding: 16, gap: 12 },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.error + "15", borderRadius: 10, padding: 12 },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.error, flex: 1 },
  section: { borderRadius: 16, padding: 16, gap: 12 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  optionRow: { flexDirection: "row", gap: 12 },
  optionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  optionText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  savedAddresses: { gap: 8 },
  addressBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  addressText: { fontFamily: "Inter_400Regular", fontSize: 14, flex: 1 },
  paymentOptions: { flexDirection: "row", gap: 10 },
  paymentBtn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6, padding: 14, borderRadius: 12, borderWidth: 1.5 },
  paymentLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  summaryItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryItemName: { fontFamily: "Inter_400Regular", fontSize: 14, flex: 1 },
  summaryItemPrice: { fontFamily: "Inter_500Medium", fontSize: 14 },
  divider: { height: 1 },
  totalLabel: { fontFamily: "Inter_700Bold", fontSize: 16 },
  totalValue: { fontFamily: "Inter_700Bold", fontSize: 18 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
});
