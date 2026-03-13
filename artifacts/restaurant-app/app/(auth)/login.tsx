import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, useColorScheme, Image
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { adminApi } from "@/services/api";

export default function LoginScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const passRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await adminApi.seed();
      setEmail("john@example.com");
      setPassword("password123");
    } catch (err) {
      setError("Seed failed. Server may be starting up, please try again.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: Colors.primary + "15" }]}>
            <Ionicons name="restaurant" size={40} color={Colors.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Sign in to your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail"
            returnKeyType="next"
            onSubmitEditing={() => passRef.current?.focus()}
          />

          <Input
            ref={passRef}
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            isPassword
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />
        </View>

        {/* Demo accounts */}
        <View style={[styles.demoSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.demoTitle, { color: theme.textSecondary }]}>Demo Accounts</Text>
          <View style={styles.demoAccounts}>
            {[
              { label: "Customer", email: "john@example.com", icon: "person" },
              { label: "Admin", email: "admin@restaurant.com", icon: "settings" },
              { label: "Kitchen", email: "kitchen@restaurant.com", icon: "restaurant" },
            ].map((acc) => (
              <TouchableOpacity
                key={acc.email}
                onPress={() => { setEmail(acc.email); setPassword("password123"); }}
                style={[styles.demoBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Ionicons name={acc.icon as any} size={14} color={Colors.primary} />
                <Text style={[styles.demoBtnText, { color: theme.text }]}>{acc.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={handleSeed} style={styles.seedBtn} disabled={seeding}>
            <Text style={styles.seedText}>{seeding ? "Loading demo data..." : "Load demo data"}</Text>
          </TouchableOpacity>
        </View>

        {/* Register link */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={[styles.footerLink, { color: Colors.primary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 28 },
  header: { alignItems: "center", gap: 12 },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 16 },
  form: { gap: 16 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.error + "15",
    borderRadius: 10,
    padding: 12,
  },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.error, flex: 1 },
  loginBtn: { marginTop: 4 },
  demoSection: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  demoTitle: { fontFamily: "Inter_500Medium", fontSize: 13, textAlign: "center" },
  demoAccounts: { flexDirection: "row", gap: 8 },
  demoBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 10, borderRadius: 10, borderWidth: 1 },
  demoBtnText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  seedBtn: { alignItems: "center" },
  seedText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.secondary },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontFamily: "Inter_400Regular", fontSize: 15 },
  footerLink: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
