import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Platform,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { usersApi, type User } from "@/services/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "kitchen",
    phone: "",
  });

  const { data: users, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: usersApi.list });
  
  const { mutate: blockUser } = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) => usersApi.block(id, blocked),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const { mutate: createUser, isPending: creatingUser } = useMutation({
    mutationFn: (userData: any) => usersApi.create(userData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setShowCreateModal(false);
      setCreateFormData({ name: "", email: "", password: "", role: "kitchen", phone: "" });
      Alert.alert("Success", "User created successfully!");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to create user");
    },
  });

  // Cleanup modal state on unmount
  useEffect(() => {
    return () => {
      if (showCreateModal) {
        setShowCreateModal(false);
      }
    };
  }, [showCreateModal]);

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

  const handleCreateUser = () => {
    if (!createFormData.name || !createFormData.email || !createFormData.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    createUser(createFormData);
  };

  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <View style={[styles.container, { backgroundColor: "#F8F9FA" }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { 
              color: "#1E1E1E",
              backgroundColor: "#F2F3F4"
            }]}
            placeholder="Search users..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addBtn}>
          <Ionicons name="person-add-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={[styles.userRow, { backgroundColor: "#FFFFFF" }]}>
            <View style={[styles.avatar, { backgroundColor: Colors.primary + "20" }]}>
              <Text style={styles.avatarText}>{item.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <Text style={[styles.userName, { color: "#1E1E1E" }]} numberOfLines={1}>{item.name}</Text>
                <Badge label={item.role} variant={item.role === "admin" ? "primary" : item.role === "kitchen" ? "info" : "success"} size="sm" />
              </View>
              <Text style={[styles.userEmail, { color: "#666666" }]} numberOfLines={1}>{item.email}</Text>
              {item.phone && <Text style={[styles.userPhone, { color: "#999999" }]}>{item.phone}</Text>}
              {item.isBlocked && <Text style={[styles.blocked, { color: Colors.error }]}>Blocked</Text>}
            </View>
            {item.role !== "admin" && (
              <TouchableOpacity onPress={() => handleBlock(item)} style={[styles.blockBtn, { backgroundColor: item.isBlocked ? Colors.success + "20" : Colors.error + "20" }]}>
                <Ionicons name={item.isBlocked ? "checkmark-circle-outline" : "close-circle-outline"} size={18} color={item.isBlocked ? Colors.success : Colors.error} />
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* Create User Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: "#F8F9FA" }]}>
          <View style={[styles.modalHeader, { paddingTop: topPadding + 12 }]}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: "#1E1E1E" }]}>Create New User</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            contentContainerStyle={[styles.modalContent, { paddingBottom: insets.bottom + 40 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="Enter full name"
                placeholderTextColor={theme.textTertiary}
                value={createFormData.name}
                onChangeText={(text) => setCreateFormData({ ...createFormData, name: text })}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="Enter email address"
                placeholderTextColor={theme.textTertiary}
                value={createFormData.email}
                onChangeText={(text) => setCreateFormData({ ...createFormData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Password *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="Enter password"
                placeholderTextColor={theme.textTertiary}
                value={createFormData.password}
                onChangeText={(text) => setCreateFormData({ ...createFormData, password: text })}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Role *</Text>
              <View style={styles.roleButtons}>
                {["kitchen", "customer"].map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleBtn,
                      {
                        backgroundColor: createFormData.role === role ? Colors.primary : theme.card,
                        borderColor: createFormData.role === role ? Colors.primary : theme.border,
                      },
                    ]}
                    onPress={() => setCreateFormData({ ...createFormData, role })}
                  >
                    <Text
                      style={[
                        styles.roleBtnText,
                        {
                          color: createFormData.role === role ? "#FFF" : theme.text,
                        },
                      ]}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Phone (Optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="Enter phone number"
                placeholderTextColor={theme.textTertiary}
                value={createFormData.phone}
                onChangeText={(text) => setCreateFormData({ ...createFormData, phone: text })}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>

            <Button
              title="Create User"
              onPress={handleCreateUser}
              loading={creatingUser}
              style={styles.createBtn}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  searchContainer: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: scheme === "dark" ? "#242424" : "#F2F3F4", 
    borderRadius: 12, 
    paddingHorizontal: 16,
    marginHorizontal: 20
  },
  searchIcon: { marginRight: 12 },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    fontFamily: "Inter_400Regular",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: scheme === "dark" ? "#2C2C2C" : "#E8E9EA",
    color: scheme === "dark" ? "#F5F5F5" : "#1E1E1E"
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 20 },
  addBtn: { backgroundColor: Colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: 20 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.primary },
  userInfo: { flex: 1, gap: 3 },
  userHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  userName: { fontFamily: "Inter_600SemiBold", fontSize: 15, flex: 1 },
  userEmail: { fontFamily: "Inter_400Regular", fontSize: 13 },
  userPhone: { fontFamily: "Inter_400Regular", fontSize: 12 },
  blocked: { fontFamily: "Inter_500Medium", fontSize: 12 },
  blockBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  // Modal styles
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  modalContent: { padding: 20, gap: 20 },
  formGroup: { gap: 8 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 14 },
  roleButtons: { flexDirection: "row", gap: 12 },
  roleBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  roleBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  createBtn: { marginTop: 8 },
});
