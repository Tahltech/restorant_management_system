import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, register } = useAuth();

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields',
        position: 'top',
        visibilityTime: 2000,
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
        position: 'top',
        visibilityTime: 2000,
      });
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
    } catch (error: any) {
      // Toast is already shown in AuthContext register function
      console.error('Register error in page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { paddingTop: topPadding + 40 }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Join FoodOps to start ordering
          </Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
            <Ionicons 
              name="person-outline" 
              size={20} 
              color={theme.textSecondary} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Full Name"
              placeholderTextColor={theme.textSecondary}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              autoCapitalize="words"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
            <Ionicons 
              name="mail-outline" 
              size={20} 
              color={theme.textSecondary} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
            <Ionicons 
              name="lock-closed-outline" 
              size={20} 
              color={theme.textSecondary} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
            <Ionicons 
              name="lock-closed-outline" 
              size={20} 
              color={theme.textSecondary} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Confirm Password"
              placeholderTextColor={theme.textSecondary}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.registerButton, { backgroundColor: Colors.primary }]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={[styles.loginButtonText, { color: Colors.primary }]}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    textAlign: "center",
  },
  form: {
    gap: 20,
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  eyeIcon: {
    padding: 8,
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  registerButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFF",
    marginLeft: 8,
  },
  loginButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  loginButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
