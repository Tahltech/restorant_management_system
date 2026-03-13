import React from "react";
import { View, Text, StyleSheet, ScrollView, useColorScheme, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export default function AboutScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const appVersion = "1.0.0";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPadding + 12, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>About FoodOps</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Restaurant Management System v{appVersion}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Our Mission</Text>
        <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
          FoodOps is a comprehensive restaurant management system designed to streamline operations, 
          enhance customer experience, and boost efficiency for modern restaurants.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Features</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
              Real-time order management
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
              Customer ordering interface
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
              Kitchen order display
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
              Admin dashboard
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
              Analytics & reporting
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact</Text>
        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={[styles.contactText, { color: theme.textSecondary }]}>
              support@foodops.com
            </Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="globe-outline" size={20} color={Colors.primary} />
            <Text style={[styles.contactText, { color: theme.textSecondary }]}>
              www.foodops.com
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Technical Info</Text>
        <View style={styles.techInfo}>
          <View style={styles.techItem}>
            <Text style={[styles.techLabel, { color: theme.textSecondary }]}>Version:</Text>
            <Text style={[styles.techValue, { color: theme.text }]}>{appVersion}</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={[styles.techLabel, { color: theme.textSecondary }]}>Build:</Text>
            <Text style={[styles.techValue, { color: theme.text }]}>Production</Text>
          </View>
        </View>
      </View>
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
  section: { borderRadius: 16, padding: 20, gap: 16 },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    marginBottom: 12,
  },
  sectionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
  featuresList: { gap: 12 },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    flex: 1,
  },
  contactInfo: { gap: 12 },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  techInfo: { gap: 8 },
  techItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  techLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  techValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
