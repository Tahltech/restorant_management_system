import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import Colors from "@/constants/colors";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role === "admin") return <Redirect href="/admin" />;
  if (user.role === "kitchen") return <Redirect href="/kitchen" />;
  return <Redirect href="/(tabs)" />;
}
