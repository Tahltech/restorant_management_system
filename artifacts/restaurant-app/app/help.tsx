import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import * as Haptics from "expo-haptics";

const helpItems = [
  {
    icon: "help-circle-outline",
    title: "Getting Started",
    description: "Learn how to place your first order",
  },
  {
    icon: "restaurant-outline",
    title: "Ordering Guide",
    description: "Step-by-step guide to ordering food",
  },
  {
    icon: "time-outline",
    title: "Delivery Times",
    description: "Check our delivery schedule and times",
  },
  {
    icon: "card-outline",
    title: "Payment Methods",
    description: "Accepted payment options",
  },
  {
    icon: "return-down-back-outline",
    title: "Refunds & Returns",
    description: "Our refund and return policy",
  },
  {
    icon: "chatbubble-outline",
    title: "Contact Support",
    description: "Get help from our support team",
  },
];

export default function HelpScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleHelpItem = (title: string) => {
    // TODO: Implement specific help content
  };

  const handleContactSupport = () => {
    // TODO: Implement contact support
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPadding + 12, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>Help & Support</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Find answers to common questions and get support
        </Text>
      </View>

      <View style={styles.helpGrid}>
        {helpItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.helpItem, { backgroundColor: theme.card }]}
            onPress={() => handleHelpItem(item.title)}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.primary + "15" }]}>
              <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
            </View>
            <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.contactButton, { backgroundColor: Colors.primary }]}
        onPress={handleContactSupport}
      >
        <Ionicons name="chatbubble-outline" size={20} color="#FFF" />
        <Text style={styles.contactButtonText}>Contact Support Team</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  header: { borderRadius: 16, padding: 20, marginBottom: 16 },
  title: { fontFamily: "Inter_700Bold", fontSize: 24 },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 4,
  },
  helpGrid: { gap: 12 },
  helpItem: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    flex: 1,
  },
  itemDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  contactButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFF",
  },
});
