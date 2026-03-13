import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, Platform, Image } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

interface ProfileItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  theme: any;
  rightText?: string;
}

function ProfileItem({ icon, label, onPress, danger = false, theme, rightText }: ProfileItemProps) {
  return (
    <TouchableOpacity
      onPress={() => { Haptics.selectionAsync(); onPress(); }}
      activeOpacity={0.7}
      style={[styles.item, { borderBottomColor: theme.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: danger ? Colors.error + "15" : Colors.primary + "15" }]}>
        <Ionicons name={icon as any} size={18} color={danger ? Colors.error : Colors.primary} />
      </View>
      <Text style={[styles.itemLabel, { color: danger ? Colors.error : theme.text }]}>{label}</Text>
      <View style={styles.itemRight}>
        {rightText && <Text style={[styles.rightText, { color: theme.textTertiary }]}>{rightText}</Text>}
        <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleLogout = () => {
    // Try immediate logout first (without confirmation)
    try {
      logout();
    } catch (error) {
      // Fallback to confirmation dialog
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: () => {
            try {
              logout();
            } catch (err) {
              console.error("Logout in alert also failed:", err);
            }
          }
        },
      ]);
    }
  };

  const roleLabel = user?.role === "admin" ? "Admin" : user?.role === "kitchen" ? "Kitchen Staff" : "Customer";
  const roleColor = user?.role === "admin" ? Colors.primary : user?.role === "kitchen" ? Colors.secondary : Colors.success;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPadding + 12, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: theme.card }]}>
        <View style={styles.headerLeft}>
          <Image source={require("@/assets/images/logo.png")} style={styles.headerLogo} resizeMode="contain" />
          <View style={styles.greetingSection}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Hello,</Text>
            <Text style={[styles.profileName, { color: theme.text }]}>{user?.name}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: Colors.error + "15" }]}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* Sections */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Account</Text>
        <ProfileItem icon="person-outline" label="Edit Profile" onPress={() => router.push("/profile/edit")} theme={theme} />
        <ProfileItem icon="location" label="Delivery Addresses" onPress={() => router.push("/profile/addresses")} theme={theme} rightText={`${user?.addresses?.length || 0} saved`} />
        <ProfileItem icon="receipt-outline" label="Order History" onPress={() => router.push("/orders")} theme={theme} />
      </View>

      {user?.role === "admin" && (
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Management</Text>
          <ProfileItem icon="grid-outline" label="Admin Dashboard" onPress={() => router.push("/(tabs)/index")} theme={theme} />
          <ProfileItem icon="restaurant-outline" label="Manage Meals" onPress={() => router.push("/(tabs)/index")} theme={theme} />
          <ProfileItem icon="people-outline" label="Manage Users" onPress={() => router.push("/(tabs)/index")} theme={theme} />
        </View>
      )}

      {user?.role === "kitchen" && (
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Kitchen</Text>
          <ProfileItem icon="restaurant" label="Kitchen Dashboard" onPress={() => router.push("/(tabs)/index")} theme={theme} />
        </View>
      )}

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>More</Text>
        <ProfileItem icon="help-circle-outline" label="Help & Support" onPress={() => router.push("/help")} theme={theme} />
        <ProfileItem icon="information-circle-outline" label="About" onPress={() => router.push("/about")} theme={theme} />
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        style={[styles.logoutBtn, { backgroundColor: Colors.error + "10", borderColor: Colors.error + "30" }]}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  profileHeader: { borderRadius: 16, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerLogo: { width: 32, height: 32, borderRadius: 16 },
  greetingSection: { flexDirection: "column" },
  greeting: { fontFamily: "Inter_400Regular", fontSize: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.primary },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontFamily: "Inter_700Bold", fontSize: 18 },
  profileEmail: { fontFamily: "Inter_400Regular", fontSize: 14 },
  roleBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
  roleText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  section: { borderRadius: 16, overflow: "hidden" },
  sectionTitle: { fontFamily: "Inter_500Medium", fontSize: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  itemLabel: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15 },
  itemRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  rightText: { fontFamily: "Inter_400Regular", fontSize: 13 },
  logoutBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: Colors.error + "15" },
  logoutText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.error },
});
