import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme, Platform } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { mealsApi, type Meal } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { MealCard } from "@/components/MealCard";

export default function SearchScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["meals-search", debouncedSearch],
    queryFn: () => mealsApi.list({ search: debouncedSearch || undefined, available: true }),
    enabled: true,
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.title, { color: theme.text }]}>Search</Text>
        <View style={styles.searchRow}>
          <Input
            placeholder="Search meals, ingredients..."
            value={search}
            onChangeText={setSearch}
            leftIcon="search"
            rightIcon={search ? "x" : undefined}
            onRightIconPress={() => setSearch("")}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      {!search && (
        <View style={styles.emptyHint}>
          <Ionicons name="search-outline" size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Find your favorite meals</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Search by name or ingredient</Text>
        </View>
      )}

      {search && (
        <FlatList
          data={data?.meals || []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          renderItem={({ item }) => (
            <View style={styles.col}>
              <MealCard meal={item} onPress={() => router.push(`/meal/${item.id}`)} />
            </View>
          )}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.noResults}>
                <Ionicons name="sad-outline" size={48} color={theme.textTertiary} />
                <Text style={[styles.noResultsText, { color: theme.textTertiary }]}>No meals found</Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            data?.total ? (
              <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
                {data.total} result{data.total !== 1 ? "s" : ""} for "{debouncedSearch}"
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  searchRow: { flexDirection: "row", gap: 12 },
  list: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  row: { gap: 12, marginBottom: 12 },
  col: { flex: 1 },
  resultsCount: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 12 },
  emptyHint: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingBottom: 80 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 15 },
  noResults: { alignItems: "center", gap: 12, paddingTop: 40 },
  noResultsText: { fontFamily: "Inter_400Regular", fontSize: 15 },
});
