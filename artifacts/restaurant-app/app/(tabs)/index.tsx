import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity,
  RefreshControl, useColorScheme, Platform
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { mealsApi, categoriesApi, type Meal, type Category } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { MealCard } from "@/components/MealCard";

export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categoriesData, isLoading: loadingCats, refetch: refetchCats } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.list,
  });

  const { data: mealsData, isLoading: loadingMeals, refetch: refetchMeals } = useQuery({
    queryKey: ["meals", selectedCategory],
    queryFn: () => mealsApi.list({ categoryId: selectedCategory || undefined, available: true }),
  });

  const { data: featuredData } = useQuery({
    queryKey: ["meals", "featured"],
    queryFn: () => mealsApi.list({ available: true, limit: 6 } as any),
  });

  const handleRefresh = () => {
    refetchCats();
    refetchMeals();
  };

  const isLoading = loadingCats || loadingMeals;

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: theme.background }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>Good {getTimeOfDay()}, </Text>
          <Text style={[styles.userName, { color: theme.text }]}>{user?.name?.split(" ")[0] || "Guest"} 👋</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/search")}
          style={[styles.searchBtn, { backgroundColor: theme.surface }]}
        >
          <Ionicons name="search" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              style={[styles.categoryChip,
                { backgroundColor: !selectedCategory ? Colors.primary : theme.surface },
              ]}
            >
              <Text style={[styles.categoryChipText, { color: !selectedCategory ? "#FFF" : theme.textSecondary }]}>All</Text>
            </TouchableOpacity>
            {categoriesData?.map((cat: Category) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                style={[styles.categoryChip, { backgroundColor: selectedCategory === cat.id ? Colors.primary : theme.surface }]}
              >
                <Text style={[styles.categoryChipText, { color: selectedCategory === cat.id ? "#FFF" : theme.textSecondary }]}>
                  {cat.name}
                </Text>
                {cat.mealCount > 0 && (
                  <View style={[styles.countBadge, { backgroundColor: selectedCategory === cat.id ? "rgba(255,255,255,0.3)" : Colors.primary + "20" }]}>
                    <Text style={[styles.countText, { color: selectedCategory === cat.id ? "#FFF" : Colors.primary }]}>{cat.mealCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured / Filtered Meals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {selectedCategory ? categoriesData?.find((c: Category) => c.id === selectedCategory)?.name || "Meals" : "Popular Picks"}
            </Text>
            {mealsData && (
              <Text style={[styles.mealCount, { color: theme.textTertiary }]}>{mealsData.total} items</Text>
            )}
          </View>

          {mealsData?.meals && mealsData.meals.length > 0 ? (
            <View style={styles.mealsGrid}>
              {mealsData.meals.map((meal: Meal) => (
                <View key={meal.id} style={styles.mealCol}>
                  <MealCard meal={meal} onPress={() => router.push(`/meal/${meal.id}`)} />
                </View>
              ))}
            </View>
          ) : !loadingMeals ? (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No meals available</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: { fontFamily: "Inter_400Regular", fontSize: 14 },
  userName: { fontFamily: "Inter_700Bold", fontSize: 22 },
  searchBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  scrollContent: { gap: 8 },
  section: { gap: 12, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  mealCount: { fontFamily: "Inter_400Regular", fontSize: 13 },
  categoriesRow: { flexDirection: "row", gap: 8, paddingRight: 20 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryChipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  countBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  countText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  mealsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  mealCol: { width: "47%" },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 40 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 15 },
});
