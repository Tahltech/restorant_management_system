import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, useColorScheme, Platform } from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { usersApi, type User } from "@/services/api";
import { Badge } from "@/components/ui/Badge";

export default function AdminUsersScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: users, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: usersApi.list });
  const { mutate: blockUser } = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) => usersApi.block(id, blocked),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const handleBlock = (user: User) => {
    Alert.alert(
      user.isBlocked ? "Unblock User" : "Block User",
      `${user.isBlocked ? "Unblock" : "Block"} ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: user.isBlocked ? "Unblock" : "Block", style: "destructive", onPress: () => blockUser({ id: user.id, blocked: !user.isBlocked }) },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Users ({users?.length || 0})</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={users || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={[styles.userRow, { backgroundColor: theme.card }]}>
            <View style={[styles.avatar, { backgroundColor: Colors.primary + "20" }]}>
              <Text style={styles.avatarText}>{item.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                <Badge label={item.role} variant={item.role === "admin" ? "primary" : item.role === "kitchen" ? "info" : "success"} size="sm" />
              </View>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]} numberOfLines={1}>{item.email}</Text>
              {item.isBlocked && <Text style={[styles.blocked, { color: Colors.error }]}>Blocked</Text>}
            </View>
            {item.role !== "admin" && (
              <TouchableOpacity onPress={() => handleBlock(item)} style={[styles.blockBtn, { backgroundColor: item.isBlocked ? Colors.success + "20" : Colors.error + "20" }]}>
                <Ionicons name={item.isBlocked ? "lock-open-outline" : "ban-outline"} size={18} color={item.isBlocked ? Colors.success : Colors.error} />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontFamily: "Inter_700Bold", fontSize: 20 },
  list: { paddingHorizontal: 20 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.primary },
  userInfo: { flex: 1, gap: 3 },
  userHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  userName: { fontFamily: "Inter_600SemiBold", fontSize: 15, flex: 1 },
  userEmail: { fontFamily: "Inter_400Regular", fontSize: 13 },
  blocked: { fontFamily: "Inter_500Medium", fontSize: 12 },
  blockBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
