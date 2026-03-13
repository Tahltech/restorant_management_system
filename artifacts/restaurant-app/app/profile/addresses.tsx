import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme, Platform, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { usersApi } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";

export default function AddressesScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddAddress = () => {
    setShowAddModal(true);
    setNewAddress("");
  };

  const handleSaveAddress = async () => {
    if (!newAddress.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid address',
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedAddresses = [...(user?.addresses || []), newAddress.trim()];
      await usersApi.updateProfile({ addresses: updatedAddresses });
      
      // Update user context
      if (updateUser && user) {
        updateUser({ ...user, addresses: updatedAddresses });
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Address added successfully',
      });
      
      setShowAddModal(false);
      setNewAddress("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to add address',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = (address: string, index: number) => {
    setEditingAddress(address);
    setEditingIndex(index);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAddress.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid address',
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedAddresses = [...(user?.addresses || [])];
      updatedAddresses[editingIndex] = editingAddress.trim();
      
      await usersApi.updateProfile({ addresses: updatedAddresses });
      
      // Update user context
      if (updateUser && user) {
        updateUser({ ...user, addresses: updatedAddresses });
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Address updated successfully',
      });
      
      setShowEditModal(false);
      setEditingAddress("");
      setEditingIndex(-1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update address',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = (address: string, index: number) => {
    Alert.alert(
      "Delete Address",
      `Are you sure you want to delete "${address}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            setIsLoading(true);
            try {
              const updatedAddresses = user?.addresses?.filter((_, i) => i !== index) || [];
              
              await usersApi.updateProfile({ addresses: updatedAddresses });
              
              // Update user context
              if (updateUser && user) {
                updateUser({ ...user, addresses: updatedAddresses });
              }

              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Address deleted successfully',
              });
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete address',
              });
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPadding + 12, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>Delivery Addresses</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Colors.primary }]}
          onPress={handleAddAddress}
        >
          <Ionicons name="add" size={16} color="#FFF" />
          <Text style={styles.addButtonText}>Add Address</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addressList}>
        {user?.addresses?.map((address, index) => (
          <View key={index} style={[styles.addressCard, { backgroundColor: theme.card }]}>
            <View style={styles.addressHeader}>
              <Text style={[styles.addressText, { color: theme.text }]}>{address}</Text>
              <View style={styles.addressActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors.primary + "20" }]}
                  onPress={() => handleEditAddress(address, index)}
                >
                  <Ionicons name="create-outline" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors.error + "20" }]}
                  onPress={() => handleDeleteAddress(address, index)}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )) || (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <Ionicons name="location-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No delivery addresses saved
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              Add your first delivery address to get started
            </Text>
          </View>
        )}
      </View>

      {/* Add Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Address</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={[styles.modalContent, { paddingTop: insets.top }]}>
            <Input
              label="Delivery Address"
              placeholder="Enter your delivery address"
              value={newAddress}
              onChangeText={setNewAddress}
              multiline
              leftIcon="map-pin"
            />
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowAddModal(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Add Address"
                onPress={handleSaveAddress}
                loading={isLoading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Address</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={[styles.modalContent, { paddingTop: insets.top }]}>
            <Input
              label="Delivery Address"
              placeholder="Enter your delivery address"
              value={editingAddress}
              onChangeText={setEditingAddress}
              multiline
              leftIcon="map-pin"
            />
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowEditModal(false)}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Save Changes"
                onPress={handleSaveEdit}
                loading={isLoading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  header: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontFamily: "Inter_700Bold", fontSize: 24 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#FFF",
  },
  addressList: { gap: 12 },
  addressCard: {
    borderRadius: 12,
    padding: 16,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addressText: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    flex: 1,
  },
  addressActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
  },
});
