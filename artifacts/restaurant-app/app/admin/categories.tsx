import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, useColorScheme, Platform } from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { categoriesApi, type Category } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminCategoriesScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });

  const { mutate: createCat, isPending: creating } = useMutation({
    mutationFn: () => categoriesApi.create({ name, description }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setShowForm(false); setName(""); setDescription(""); },
  });

  const { mutate: updateCat, isPending: updating } = useMutation({
    mutationFn: () => categoriesApi.update(editCat!.id, { name, description }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setShowForm(false); setEditCat(null); setName(""); setDescription(""); },
  });

  const { mutate: deleteCat } = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const openEdit = (cat: Category) => { setEditCat(cat); setName(cat.name); setDescription(cat.description || ""); setShowForm(true); };
  const openAdd = () => { setEditCat(null); setName(""); setDescription(""); setShowForm(true); };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Categories</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={[styles.catRow, { backgroundColor: theme.card }]}>
            <View style={[styles.catIcon, { backgroundColor: Colors.secondary + "20" }]}>
              <Ionicons name="grid-outline" size={20} color={Colors.secondary} />
            </View>
            <View style={styles.catInfo}>
              <Text style={[styles.catName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.catMealCount, { color: theme.textSecondary }]}>{item.mealCount} meals</Text>
            </View>
            <TouchableOpacity onPress={() => openEdit(item)} style={[styles.actionBtn, { backgroundColor: Colors.secondary + "20" }]}>
              <Ionicons name="pencil-outline" size={16} color={Colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert("Delete", `Delete "${item.name}"?`, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => deleteCat(item.id) }])} style={[styles.actionBtn, { backgroundColor: Colors.error + "20" }]}>
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{editCat ? "Edit Category" : "Add Category"}</Text>
            <Input label="Name" placeholder="Category name" value={name} onChangeText={setName} />
            <Input label="Description" placeholder="Optional description" value={description} onChangeText={setDescription} multiline numberOfLines={2} style={{ height: 56 }} />
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setShowForm(false)} variant="outline" style={{ flex: 1 }} />
              <Button title={editCat ? "Update" : "Add"} onPress={() => editCat ? updateCat() : createCat()} loading={creating || updating} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontFamily: "Inter_700Bold", fontSize: 20 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: 20 },
  catRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14 },
  catIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  catInfo: { flex: 1 },
  catName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  catMealCount: { fontFamily: "Inter_400Regular", fontSize: 12 },
  actionBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 16 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  modalActions: { flexDirection: "row", gap: 12 },
});
