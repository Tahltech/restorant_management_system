import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, useColorScheme, Platform, Image } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { adminApi, type AdminStats } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { OrderCard } from "@/components/OrderCard";
import { StatusBadge } from "@/components/ui/Badge";

function StatCard({ label, value, icon, color, theme }: { label: string; value: string | number; icon: string; color: string; theme: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card }]}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminApi.stats,
    refetchInterval: 30000,
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: theme.background }]}>
        <View style={styles.headerLeft}>
          <Image source={require("@/assets/images/logo.png")} style={styles.headerLogo} resizeMode="contain" />
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Restaurant Admin</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => logout()} style={[styles.logoutBtn, { backgroundColor: Colors.error + "15" }]}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {stats && (
          <>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard label="Total Orders" value={stats.totalOrders} icon="basket-outline" color={Colors.primary} theme={theme} />
              <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(0)}`} icon="wallet-outline" color={Colors.success} theme={theme} />
              <StatCard label="Pending" value={stats.pendingOrders} icon="time-outline" color={Colors.warning} theme={theme} />
              <StatCard label="Preparing" value={stats.preparingOrders} icon="restaurant-outline" color={Colors.secondary} theme={theme} />
              <StatCard label="Customers" value={stats.totalCustomers} icon="people-outline" color={Colors.primary} theme={theme} />
              <StatCard label="Meals" value={stats.totalMeals} icon="pizza-outline" color={Colors.secondary} theme={theme} />
            </View>

            {/* Quick Actions */}
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                {[
                  { label: "All Orders", icon: "basket-outline", route: "/admin/orders" },
                  { label: "Manage Meals", icon: "pizza-outline", route: "/admin/meals" },
                  { label: "Categories", icon: "pricetag-outline", route: "/admin/categories" },
                  { label: "Users", icon: "people-outline", route: "/admin/users" },
                ].map((action) => (
                  <TouchableOpacity
                    key={action.label}
                    onPress={() => router.push(action.route as any)}
                    style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                  >
                    <Ionicons name={action.icon as any} size={24} color={Colors.primary} />
                    <Text style={[styles.actionLabel, { color: theme.text }]}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Popular Meals */}
            {stats.popularMeals.length > 0 && (
              <View style={[styles.section, { backgroundColor: theme.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Selling Meals</Text>
                {stats.popularMeals.map((meal, i) => (
                  <View key={meal.mealId} style={styles.popularRow}>
                    <View style={[styles.rankBadge, { backgroundColor: Colors.primary + (i === 0 ? "FF" : "60") }]}>
                      <Text style={styles.rankText}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.popularName, { color: theme.text }]} numberOfLines={1}>{meal.mealName}</Text>
                    <View style={styles.popularStats}>
                      <Text style={[styles.popularOrders, { color: theme.textSecondary }]}>{meal.orderCount} orders</Text>
                      <Text style={[styles.popularRevenue, { color: Colors.success }]}>${meal.revenue.toFixed(0)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Recent Orders */}
            {stats.recentOrders.length > 0 && (
              <View style={styles.section2}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Orders</Text>
                  <TouchableOpacity onPress={() => router.push("/admin/orders")}>
                    <Text style={[styles.viewAll, { color: Colors.primary }]}>View all</Text>
                  </TouchableOpacity>
                </View>
                {stats.recentOrders.slice(0, 5).map((order) => (
                  <OrderCard key={order.id} order={order} onPress={() => router.push(`/order/${order.id}`)} showUser />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  content: { padding: 20, gap: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: { width: "47%", borderRadius: 16, padding: 16, gap: 6 },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 22 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 13 },
  section: { borderRadius: 16, padding: 16, gap: 12 },
  section2: { gap: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16 },
  viewAll: { fontFamily: "Inter_500Medium", fontSize: 14 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionBtn: { width: "47%", alignItems: "center", justifyContent: "center", gap: 8, padding: 16, borderRadius: 14 },
  actionLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  popularRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankBadge: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  rankText: { color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 13 },
  popularName: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14 },
  popularStats: { alignItems: "flex-end", gap: 2 },
  popularOrders: { fontFamily: "Inter_400Regular", fontSize: 12 },
  popularRevenue: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
});
