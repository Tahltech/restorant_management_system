import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import type { Meal } from "@/services/api";
import { StarRating } from "./ui/StarRating";
import { useCart } from "@/context/CartContext";

interface MealCardProps {
  meal: Meal;
  onPress: () => void;
  horizontal?: boolean;
}

export function MealCard({ meal, onPress, horizontal = false }: MealCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const { addItem, items } = useCart();

  const cartItem = items.find((i) => i.mealId === meal.id);

  const handleAddToCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem({ mealId: meal.id, mealName: meal.name, price: meal.price, imageUrl: meal.imageUrl });
  };

  if (horizontal) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.hCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
        <Image
          source={{ uri: meal.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200" }}
          style={styles.hImage}
        />
        <View style={styles.hContent}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{meal.name}</Text>
          {meal.averageRating != null && (
            <View style={styles.ratingRow}>
              <StarRating rating={meal.averageRating} size={12} />
              <Text style={[styles.ratingText, { color: theme.textSecondary }]}>{meal.averageRating.toFixed(1)}</Text>
            </View>
          )}
          <Text style={[styles.prepTime, { color: theme.textTertiary }]}>
            <Ionicons name="time-outline" size={11} color={theme.textTertiary} /> {meal.preparationTime} min
          </Text>
          <View style={styles.hBottom}>
            <Text style={[styles.price, { color: Colors.primary }]}>${meal.price.toFixed(2)}</Text>
            <TouchableOpacity onPress={handleAddToCart} style={styles.addBtn} disabled={!meal.available}>
              <Ionicons name="add" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}>
      <Image
        source={{ uri: meal.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" }}
        style={styles.image}
      />
      {!meal.available && (
        <View style={styles.unavailableOverlay}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}
      {cartItem && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{cartItem.quantity}</Text>
        </View>
      )}
      <View style={styles.content}>
        {meal.categoryName && (
          <Text style={[styles.category, { color: Colors.secondary }]}>{meal.categoryName}</Text>
        )}
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{meal.name}</Text>
        {meal.description && (
          <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>{meal.description}</Text>
        )}
        <View style={styles.meta}>
          {meal.averageRating != null && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={Colors.star} />
              <Text style={[styles.ratingText, { color: theme.textSecondary }]}>{meal.averageRating.toFixed(1)}</Text>
            </View>
          )}
          <Text style={[styles.prepTime, { color: theme.textTertiary }]}>
            {meal.preparationTime} min
          </Text>
        </View>
        <View style={styles.bottom}>
          <Text style={[styles.price, { color: Colors.primary }]}>${meal.price.toFixed(2)}</Text>
          <TouchableOpacity
            onPress={handleAddToCart}
            style={[styles.addBtn, !meal.available && styles.addBtnDisabled]}
            disabled={!meal.available}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: "#E0E0E0",
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    top: 0,
    height: 160,
  },
  unavailableText: {
    color: "#FFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  cartBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  content: {
    padding: 12,
    gap: 4,
  },
  category: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  prepTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  price: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: {
    backgroundColor: "#AAAAAA",
  },

  // Horizontal card
  hCard: {
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  hImage: {
    width: 100,
    height: 100,
    backgroundColor: "#E0E0E0",
  },
  hContent: {
    flex: 1,
    padding: 12,
    gap: 3,
    justifyContent: "space-between",
  },
  hBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
