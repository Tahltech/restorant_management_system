import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, useColorScheme } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Join us today</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} leftIcon="user" />
          <Input label="Email" placeholder="your@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="mail" />
          <Input label="Password" placeholder="At least 6 characters" value={password} onChangeText={setPassword} isPassword />
          <Input label="Confirm Password" placeholder="Re-enter password" value={confirm} onChangeText={setConfirm} isPassword returnKeyType="done" onSubmitEditing={handleRegister} />

          <Button title="Create Account" onPress={handleRegister} loading={loading} style={styles.registerBtn} />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={[styles.footerLink, { color: Colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 28 },
  header: { gap: 8 },
  backBtn: { alignSelf: "flex-start", marginBottom: 8 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 16 },
  form: { gap: 16 },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: Colors.error + "15", borderRadius: 10, padding: 12 },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.error, flex: 1 },
  registerBtn: { marginTop: 4 },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontFamily: "Inter_400Regular", fontSize: 15 },
  footerLink: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
