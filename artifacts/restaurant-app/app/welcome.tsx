import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { mealsApi } from "@/services/api";

const { width: screenWidth } = Dimensions.get("window");

interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  available: boolean;
}

export default function WelcomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const topPadding = insets.top;

  const { data: mealsData, isLoading, error } = useQuery({
    queryKey: ["meals"],
    queryFn: () => mealsApi.list(),
  });

  const meals = mealsData?.meals || [];
  const featuredMeals = meals.filter(meal => meal.available).slice(0, 6);

  const handleGetStarted = () => {
    router.push("/(auth)/login");
  };

  const handleBrowse = () => {
    // Just show more meals without requiring login
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 20 }]}>
        <View style={styles.logoContainer}>
          <Image source={require("@/assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.appName, { color: theme.text }]}>FoodOps</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Delicious meals, delivered fresh
          </Text>
        </View>
      </View>

      {/* Hero Section */}
      <View style={[styles.heroSection, { backgroundColor: theme.card }]}>
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Welcome to FoodOps
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            Browse our delicious menu and order your favorite meals
          </Text>
          <TouchableOpacity
            style={[styles.heroBtn, { backgroundColor: Colors.primary }]}
            onPress={handleGetStarted}
          >
            <Text style={styles.heroBtnText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Meals Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Meals</Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading delicious meals...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
            <Text style={[styles.errorText, { color: theme.text }]}>
              Failed to load meals
            </Text>
          </View>
        ) : featuredMeals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No meals available at the moment
            </Text>
          </View>
        ) : (
          <View style={styles.mealsGrid}>
            {featuredMeals.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={[styles.mealCard, { backgroundColor: theme.card }]}
                onPress={() => handleBrowse()}
              >
                <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />
                <View style={styles.mealInfo}>
                  <Text style={[styles.mealName, { color: theme.text }]} numberOfLines={1}>
                    {meal.name}
                  </Text>
                  <Text style={[styles.mealPrice, { color: Colors.primary }]}>
                    ${meal.price.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.availabilityBadge, { 
                  backgroundColor: meal.available ? Colors.success + "20" : Colors.error + "20" 
                }]}>
                  <Text style={[styles.availabilityText, { 
                    color: meal.available ? Colors.success : Colors.error 
                  }]}>
                    {meal.available ? "Available" : "Sold Out"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={[styles.featuresTitle, { color: theme.text }]}>Why FoodOps?</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.primary + "20" }]}>
              <Ionicons name="flash-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>Fast Delivery</Text>
            <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
              Get your meals delivered quickly and fresh
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.secondary + "20" }]}>
              <Ionicons name="heart-outline" size={24} color={Colors.secondary} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>Quality Food</Text>
            <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
              Fresh ingredients prepared with care
            </Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.warning + "20" }]}>
              <Ionicons name="shield-checkmark-outline" size={24} color={Colors.warning} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>Secure Payment</Text>
            <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
              Safe and secure payment options
            </Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={[styles.ctaSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.ctaTitle, { color: theme.text }]}>
          Ready to order?
        </Text>
        <Text style={[styles.ctaSubtitle, { color: theme.textSecondary }]}>
          Join thousands of satisfied customers
        </Text>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: Colors.primary }]}
          onPress={handleGetStarted}
        >
          <Text style={styles.ctaBtnText}>Sign Up & Order</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: insets.bottom + 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    alignItems: "center", 
    paddingBottom: 20 
  },
  logoContainer: { 
    alignItems: "center", 
    marginBottom: 24 
  },
  logo: { 
    width: 80, 
    height: 80, 
    marginBottom: 8 
  },
  appName: { 
    fontFamily: "Inter_700Bold", 
    fontSize: 28, 
    marginBottom: 8 
  },
  tagline: { 
    fontFamily: "Inter_500Medium", 
    fontSize: 16 
  },
  heroSection: { 
    marginHorizontal: 20, 
    marginBottom: 24, 
    borderRadius: 16, 
    padding: 24 
  },
  heroContent: { 
    alignItems: "center" 
  },
  heroTitle: { 
    fontFamily: "Inter_700Bold", 
    fontSize: 24, 
    textAlign: "center", 
    marginBottom: 8 
  },
  heroSubtitle: { 
    fontFamily: "Inter_500Medium", 
    fontSize: 16, 
    textAlign: "center", 
    marginBottom: 24,
    color: "#666" 
  },
  heroBtn: { 
    paddingHorizontal: 32, 
    paddingVertical: 16, 
    borderRadius: 12 
  },
  heroBtnText: { 
    fontFamily: "Inter_600SemiBold", 
    fontSize: 16, 
    color: "#FFF" 
  },
  section: { 
    paddingHorizontal: 20, 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontFamily: "Inter_700Bold", 
    fontSize: 20, 
    marginBottom: 16 
  },
  loadingContainer: { 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 40 
  },
  loadingText: { 
    fontFamily: "Inter_500Medium", 
    fontSize: 16, 
    marginTop: 12 
  },
  errorContainer: { 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 40 
  },
  errorText: { 
    fontFamily: "Inter_600SemiBold", 
    fontSize: 18, 
    marginTop: 12 
  },
  emptyContainer: { 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 40 
  },
  emptyText: { 
    fontFamily: "Inter_500Medium", 
    fontSize: 16, 
    marginTop: 12 
  },
  mealsGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between" 
  },
  mealCard: { 
    width: (screenWidth - 48) / 2, 
    borderRadius: 12, 
    marginBottom: 16, 
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  mealImage: { 
    width: "100%", 
    height: 120 
  },
  mealInfo: { 
    padding: 12 
  },
  mealName: { 
    fontFamily: "Inter_600SemiBold", 
    fontSize: 14, 
    marginBottom: 4 
  },
  mealPrice: { 
    fontFamily: "Inter_700Bold", 
    fontSize: 16 
  },
  availabilityBadge: { 
    position: "absolute", 
    top: 8, 
    right: 8, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  availabilityText: { 
    fontFamily: "Inter_600SemiBold", 
    fontSize: 10 
  },
  featuresSection: { 
    paddingHorizontal: 20, 
    marginBottom: 24 
  },
  featuresTitle: { 
    fontFamily: "Inter_700Bold", 
    fontSize: 20, 
    textAlign: "center", 
    marginBottom: 20 
  },
  featuresGrid: { 
    gap: 20 
  },
  featureItem: { 
    alignItems: "center", 
    flex: 1 
  },
  featureIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: 12 
  },
  featureTitle: { 
    fontFamily: "Inter_600SemiBold", 
    fontSize: 16, 
    marginBottom: 8 
  },
  featureDescription: { 
    fontFamily: "Inter_400Regular", 
    fontSize: 14, 
    textAlign: "center" 
  },
  ctaSection: { 
    marginHorizontal: 20, 
    marginBottom: 24, 
    borderRadius: 16, 
    padding: 24,
    alignItems: "center" 
  },
  ctaTitle: { 
    fontFamily: "Inter_700Bold", 
    fontSize: 24, 
    marginBottom: 8 
  },
  ctaSubtitle: { 
    fontFamily: "Inter_500Medium", 
    fontSize: 16, 
    marginBottom: 24 
  },
  ctaBtn: { 
    paddingHorizontal: 32, 
    paddingVertical: 16, 
    borderRadius: 12 
  },
  ctaBtnText: { 
    fontFamily: "Inter_600SemiBold", 
    fontSize: 16, 
    color: "#FFF" 
  },
});
