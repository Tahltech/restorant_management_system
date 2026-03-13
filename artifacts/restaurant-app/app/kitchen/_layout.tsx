import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

export default function KitchenLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      {/* Kitchen Header */}
      <View style={[styles.kitchenHeader, { 
        backgroundColor: theme.background,
        borderBottomColor: theme.border,
        paddingTop: insets.top + 12
      }]}>
      </View>
      
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: "#888",
          tabBarStyle: {
            backgroundColor: "#1A1A1A",
            borderTopColor: "#333",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Orders",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="meals"
          options={{
            title: "Meals",
            href: "/kitchen/meals",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="restaurant-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  kitchenHeader: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
});
