import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { adminApi } from "@/services/api";

const { width: screenWidth } = Dimensions.get("window");

interface AnalyticsData {
  monthlyData: Array<{ month: string; income: number; orders: number; meals: number }>;
  topMeals: Array<{ name: string; orders: number; revenue: number }>;
  metrics: {
    totalIncome: number;
    totalOrders: number;
    totalMeals: number;
    avgOrderValue: number;
    growthRate: number;
    avgRating: number;
  };
}

function BarChart({ data, maxValue, color, label }: { data: number[]; maxValue: number; color: string; label: string }) {
  const barWidth = (screenWidth - 80) / data.length - 10;
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>{label}</Text>
      <View style={styles.chart}>
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * 150;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.bar, { height: barHeight, backgroundColor: color }]} />
              <Text style={styles.barValue}>${value.toFixed(0)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function LineChart({ data, maxValue, color, label }: { data: number[]; maxValue: number; color: string; label: string }) {
  const pointSpacing = (screenWidth - 80) / (data.length - 1);
  
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>{label}</Text>
      <View style={[styles.chart, { height: 160 }]}>
        {data.map((value, index) => {
          const y = 150 - (value / maxValue) * 150;
          return (
            <View key={index} style={[styles.linePoint, { left: index * pointSpacing, top: y, backgroundColor: color }]} />
          );
        })}
      </View>
    </View>
  );
}

export default function AdminAnalyticsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  // Fetch real analytics data from backend
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: adminApi.analytics.monthly,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Analytics</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Business Insights</Text>
          </View>
        </View>
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading analytics data...</Text>
        </View>
      </View>
    );
  }

  if (error || !analyticsData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Analytics</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Business Insights</Text>
          </View>
        </View>
        <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={[styles.errorText, { color: theme.text }]}>Failed to load analytics data</Text>
          <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>Please try refreshing the page</Text>
        </View>
      </View>
    );
  }

  const { monthlyData, topMeals, metrics } = analyticsData;

  const incomeData = monthlyData.map(d => d.income);
  const ordersData = monthlyData.map(d => d.orders);
  const mealsData = monthlyData.map(d => d.meals);

  const maxIncome = Math.max(...incomeData, 1);
  const maxOrders = Math.max(...ordersData, 1);
  const maxMeals = Math.max(...mealsData, 1);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Business Insights</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.success + "20" }]}>
              <Ionicons name="cash-outline" size={24} color={Colors.success} />
            </View>
            <Text style={[styles.summaryValue, { color: theme.text }]}>${metrics.totalIncome.toLocaleString()}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Income</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.primary + "20" }]}>
              <Ionicons name="receipt-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{metrics.totalOrders.toLocaleString()}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Orders</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.secondary + "20" }]}>
              <Ionicons name="restaurant-outline" size={24} color={Colors.secondary} />
            </View>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{metrics.totalMeals.toLocaleString()}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Meals Sold</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.warning + "20" }]}>
              <Ionicons name="trending-up-outline" size={24} color={Colors.warning} />
            </View>
            <Text style={[styles.summaryValue, { color: theme.text }]}>${metrics.avgOrderValue.toFixed(2)}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Avg Order</Text>
          </View>
        </View>

        {/* Monthly Income Chart */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Monthly Income</Text>
          <BarChart data={incomeData} maxValue={maxIncome} color={Colors.success} label="Last 6 Months" />
          <View style={styles.monthLabels}>
            {monthlyData.map((data, index) => (
              <Text key={index} style={[styles.monthLabel, { color: theme.textSecondary }]}>
                {data.month}
              </Text>
            ))}
          </View>
        </View>

        {/* Orders & Meals Chart */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Orders & Meals Trend</Text>
          <LineChart data={ordersData} maxValue={maxOrders} color={Colors.primary} label="Orders" />
          <LineChart data={mealsData} maxValue={maxMeals} color={Colors.secondary} label="Meals Sold" />
          <View style={styles.monthLabels}>
            {monthlyData.map((data, index) => (
              <Text key={index} style={[styles.monthLabel, { color: theme.textSecondary }]}>
                {data.month}
              </Text>
            ))}
          </View>
        </View>

        {/* Top Selling Meals */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Selling Meals</Text>
          {topMeals.map((meal, index) => (
            <View key={meal.name} style={styles.topMealRow}>
              <View style={styles.rankContainer}>
                <Text style={[styles.rank, { color: theme.text }]}>{index + 1}</Text>
              </View>
              <View style={styles.mealInfo}>
                <Text style={[styles.mealName, { color: theme.text }]}>{meal.name}</Text>
                <Text style={[styles.mealStats, { color: theme.textSecondary }]}>
                  {meal.orders} orders • ${meal.revenue.toLocaleString()}
                </Text>
              </View>
              <View style={styles.revenueContainer}>
                <Text style={[styles.revenue, { color: Colors.success }]}>${meal.revenue}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Performance Metrics */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance Metrics</Text>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Growth Rate</Text>
            <Text style={[styles.metricValue, { color: metrics.growthRate >= 0 ? Colors.success : Colors.error }]}>
              {metrics.growthRate >= 0 ? '+' : ''}{metrics.growthRate}%
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Average Rating</Text>
            <Text style={[styles.metricValue, { color: Colors.warning }]}>{metrics.avgRating.toFixed(1)}/5.0</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Customer Retention</Text>
            <Text style={[styles.metricValue, { color: Colors.primary }]}>78.3%</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontFamily: "Inter_700Bold", fontSize: 26 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { fontFamily: "Inter_500Medium", fontSize: 16 },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontFamily: "Inter_600SemiBold", fontSize: 18 },
  errorSubtext: { fontFamily: "Inter_400Regular", fontSize: 14 },
  content: { padding: 20, gap: 20 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  summaryCard: { width: "47%", borderRadius: 16, padding: 16, gap: 8 },
  summaryIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  summaryValue: { fontFamily: "Inter_700Bold", fontSize: 20 },
  summaryLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  section: { borderRadius: 16, padding: 20, gap: 16 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  chartContainer: { gap: 8 },
  chartLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  chart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 160 },
  barContainer: { alignItems: "center", flex: 1 },
  bar: { width: 20, borderRadius: 4, marginBottom: 4 },
  barValue: { fontFamily: "Inter_500Medium", fontSize: 10 },
  linePoint: { width: 8, height: 8, borderRadius: 4, position: "absolute" },
  monthLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10 },
  monthLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },
  topMealRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  rankContainer: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary + "20", alignItems: "center", justifyContent: "center" },
  rank: { fontFamily: "Inter_700Bold", fontSize: 12, color: Colors.primary },
  mealInfo: { flex: 1 },
  mealName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  mealStats: { fontFamily: "Inter_400Regular", fontSize: 12 },
  revenueContainer: { alignItems: "flex-end" },
  revenue: { fontFamily: "Inter_700Bold", fontSize: 14 },
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  metricLabel: { fontFamily: "Inter_500Medium", fontSize: 14 },
  metricValue: { fontFamily: "Inter_700Bold", fontSize: 14 },
});
