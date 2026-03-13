import React from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, useColorScheme, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

export default function EditProfileScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [formData, setFormData] = React.useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      // TODO: Implement API call to update profile
      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPadding + 12, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Personal Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Name</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            placeholder="Enter your email"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Phone</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
            placeholder="Enter your phone number"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: Colors.primary }]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  header: { borderRadius: 16, padding: 20, marginBottom: 16 },
  title: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.text },
  section: { borderRadius: 16, padding: 20, gap: 16 },
  sectionTitle: { fontFamily: "Inter_500Medium", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16, color: Colors.textSecondary },
  inputGroup: { gap: 8 },
  label: { fontFamily: "Inter_500Medium", fontSize: 14, marginBottom: 4 },
  input: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  saveButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFF",
  },
});
