import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, useColorScheme, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { mealsApi, reviewsApi, type Review } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { Input } from "@/components/ui/Input";

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { addItem, items, updateQuantity } = useCart();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: meal, isLoading } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => mealsApi.get(id!),
    enabled: !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => reviewsApi.get(id!),
    enabled: !!id,
  });

  const { mutate: submitReview, isPending: submittingReview } = useMutation({
    mutationFn: () => reviewsApi.create(id!, rating, comment || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", id] });
      qc.invalidateQueries({ queryKey: ["meal", id] });
      setRating(0);
      setComment("");
      setShowReviewForm(false);
    },
  });

  const cartItem = items.find((i) => i.mealId === id);

  const handleAddToCart = () => {
    if (!meal) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem({ mealId: meal.id, mealName: meal.name, price: meal.price, imageUrl: meal.imageUrl }, qty);
  };

  if (isLoading || !meal) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.surface }]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: meal.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600" }}
            style={styles.image}
          />
          <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: "rgba(0,0,0,0.4)" }]}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
          {!meal.available && (
            <View style={styles.unavailableOverlay}>
              <Text style={styles.unavailableText}>Currently Unavailable</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={[styles.detailsCard, { backgroundColor: theme.background }]}>
          {meal.categoryName && (
            <Text style={[styles.category, { color: Colors.secondary }]}>{meal.categoryName}</Text>
          )}
          <Text style={[styles.name, { color: theme.text }]}>{meal.name}</Text>

          <View style={styles.metaRow}>
            {meal.averageRating != null && (
              <View style={styles.ratingRow}>
                <StarRating rating={meal.averageRating} size={16} />
                <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                  {meal.averageRating.toFixed(1)} ({meal.reviewCount} reviews)
                </Text>
              </View>
            )}
            <View style={styles.prepRow}>
              <Ionicons name="time-outline" size={16} color={theme.textTertiary} />
              <Text style={[styles.prepText, { color: theme.textTertiary }]}>{meal.preparationTime} min</Text>
            </View>
          </View>

          {meal.description && (
            <Text style={[styles.description, { color: theme.textSecondary }]}>{meal.description}</Text>
          )}

          {/* Ingredients */}
          {meal.ingredients.length > 0 && (
            <View style={styles.ingredientsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Ingredients</Text>
              <View style={styles.ingredientsList}>
                {meal.ingredients.map((ing, i) => (
                  <View key={i} style={[styles.ingredientChip, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.ingredientText, { color: theme.textSecondary }]}>{ing}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Reviews</Text>
              {user && (
                <TouchableOpacity onPress={() => setShowReviewForm(!showReviewForm)}>
                  <Text style={[styles.writeReview, { color: Colors.primary }]}>Write a review</Text>
                </TouchableOpacity>
              )}
            </View>

            {showReviewForm && (
              <View style={[styles.reviewForm, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.reviewFormTitle, { color: theme.text }]}>Your Rating</Text>
                <StarRating rating={rating} size={32} editable onRate={setRating} />
                <Input
                  placeholder="Share your experience (optional)"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={3}
                  style={{ height: 80 }}
                />
                <Button
                  title="Submit Review"
                  onPress={() => submitReview()}
                  loading={submittingReview}
                  disabled={rating === 0}
                  size="sm"
                />
              </View>
            )}

            {reviews && reviews.length > 0 ? (
              reviews.map((review: Review) => (
                <View key={review.id} style={[styles.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.reviewHeader}>
                    <Text style={[styles.reviewerName, { color: theme.text }]}>{review.userName || "Anonymous"}</Text>
                    <StarRating rating={review.rating} size={12} />
                  </View>
                  {review.comment && (
                    <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>{review.comment}</Text>
                  )}
                  <Text style={[styles.reviewDate, { color: theme.textTertiary }]}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.noReviews, { color: theme.textTertiary }]}>No reviews yet. Be the first!</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Footer */}
      {meal.available && (
        <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 16 }]}>
          <View style={styles.qtyRow}>
            <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} style={[styles.qtyBtn, { backgroundColor: theme.surface }]}>
              <Ionicons name="remove" size={18} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.qty, { color: theme.text }]}>{qty}</Text>
            <TouchableOpacity onPress={() => setQty(qty + 1)} style={[styles.qtyBtn, { backgroundColor: Colors.primary }]}>
              <Ionicons name="add" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Button
            title={`Add to Cart • $${(meal.price * qty).toFixed(2)}`}
            onPress={handleAddToCart}
            style={styles.addBtn}
            icon={cartItem ? <Ionicons name="cart" size={16} color="#FFF" /> : undefined}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imagePlaceholder: { width: "100%", height: 300 },
  imageContainer: { position: "relative" },
  image: { width: "100%", height: 320, backgroundColor: "#E0E0E0" },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  unavailableOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  unavailableText: { color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 18 },
  detailsCard: { padding: 20, gap: 12 },
  category: { fontFamily: "Inter_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  name: { fontFamily: "Inter_700Bold", fontSize: 26 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  prepRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  prepText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  description: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 },
  ingredientsSection: { gap: 10 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 17 },
  ingredientsList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ingredientChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  ingredientText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  reviewsSection: { gap: 12 },
  reviewsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  writeReview: { fontFamily: "Inter_500Medium", fontSize: 14 },
  reviewForm: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 12 },
  reviewFormTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  reviewCard: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 6 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewerName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  reviewComment: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  reviewDate: { fontFamily: "Inter_400Regular", fontSize: 11 },
  noReviews: { fontFamily: "Inter_400Regular", fontSize: 14, fontStyle: "italic" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderTopWidth: 1 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  qty: { fontFamily: "Inter_700Bold", fontSize: 18, minWidth: 24, textAlign: "center" },
  addBtn: { flex: 1 },
});
