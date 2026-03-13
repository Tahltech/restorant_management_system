import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, useColorScheme, Platform } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import type { CartItem } from "@/context/CartContext";

function CartItemRow({ item, onInc, onDec, onRemove, theme }: { item: CartItem; onInc: () => void; onDec: () => void; onRemove: () => void; theme: any }) {
  return (
    <View style={[styles.itemRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Image
        source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200" }}
        style={styles.itemImage}
      />
      <View style={styles.itemContent}>
        <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>{item.mealName}</Text>
        <Text style={[styles.itemPrice, { color: Colors.primary }]}>${(item.price * item.quantity).toFixed(2)}</Text>
        <Text style={[styles.unitPrice, { color: theme.textTertiary }]}>${item.price.toFixed(2)} each</Text>
      </View>
      <View style={styles.qtyControls}>
        <TouchableOpacity onPress={onDec} style={[styles.qtyBtn, { backgroundColor: theme.surface }]}>
          <Ionicons name={item.quantity === 1 ? "trash-outline" : "remove"} size={16} color={item.quantity === 1 ? Colors.error : theme.text} />
        </TouchableOpacity>
        <Text style={[styles.qty, { color: theme.text }]}>{item.quantity}</Text>
        <TouchableOpacity onPress={onInc} style={[styles.qtyBtn, { backgroundColor: Colors.primary }]}>
          <Ionicons name="add" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { items, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();
  const { user } = useAuth();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const handleCheckout = () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    router.push("/checkout");
  };

  const handleDec = (item: CartItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.quantity === 1) removeItem(item.mealId);
    else updateQuantity(item.mealId, item.quantity - 1);
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
          <Text style={[styles.title, { color: theme.text }]}>Cart</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.card + "15" }]}>
            <Ionicons name="cart-outline" size={56} color={theme.text} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptyText, { color: theme.textTertiary }]}>Add some delicious meals to get started</Text>
          <Button title="Browse Menu" onPress={() => router.push("/(tabs)")} style={styles.browseBtn} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.title, { color: theme.text }]}>Cart ({itemCount})</Text>
        <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); clearCart(); }}>
          <Text style={[styles.clearText, { color: Colors.error }]}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.mealId}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 240 }]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <CartItemRow
            item={item}
            theme={theme}
            onInc={() => updateQuantity(item.mealId, item.quantity + 1)}
            onDec={() => handleDec(item)}
            onRemove={() => removeItem(item.mealId)}
          />
        )}
      />

      {/* Checkout Footer */}
      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: insets.bottom + bottomPadding + 100 }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Delivery fee</Text>
          <Text style={[styles.freeText]}>FREE</Text>
        </View>
        <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
          <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: Colors.primary }]}>${total.toFixed(2)}</Text>
        </View>
        <Button
          title={`Checkout • $${total.toFixed(2)}`}
          onPress={handleCheckout}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  clearText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  itemRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, overflow: "hidden", borderWidth: 1 },
  itemImage: { width: 80, height: 80, backgroundColor: "#E0E0E0" },
  itemContent: { flex: 1, padding: 12, gap: 2 },
  itemName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  itemPrice: { fontFamily: "Inter_700Bold", fontSize: 16 },
  unitPrice: { fontFamily: "Inter_400Regular", fontSize: 11 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 10, paddingRight: 12 },
  qtyBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  qty: { fontFamily: "Inter_600SemiBold", fontSize: 16, minWidth: 20, textAlign: "center" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 40 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Inter_700Bold", fontSize: 22 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center" },
  browseBtn: { marginTop: 8, paddingHorizontal: 32 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1, gap: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontFamily: "Inter_400Regular", fontSize: 14 },
  summaryValue: { fontFamily: "Inter_500Medium", fontSize: 14 },
  freeText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.success },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1, marginBottom: 4 },
  totalLabel: { fontFamily: "Inter_700Bold", fontSize: 16 },
  totalValue: { fontFamily: "Inter_700Bold", fontSize: 20 },
});
