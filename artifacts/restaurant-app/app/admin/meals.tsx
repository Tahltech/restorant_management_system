import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, useColorScheme, Platform, Image } from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/colors";
import { mealsApi, categoriesApi, type Meal } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import * as Haptics from "expo-haptics";

interface MealFormProps {
  meal?: Meal | null;
  categories: Array<{ id: string; name: string }>;
  onSave: (data: Partial<Meal>) => void;
  onClose: () => void;
  loading: boolean;
  theme: any;
}

function MealForm({ meal, categories, onSave, onClose, loading, theme }: MealFormProps) {
  const [name, setName] = useState(meal?.name || "");
  const [description, setDescription] = useState(meal?.description || "");
  const [price, setPrice] = useState(meal?.price?.toString() || "");
  const [categoryId, setCategoryId] = useState(meal?.categoryId || "");
  const [imageUrl, setImageUrl] = useState(meal?.imageUrl || "");
  const [prepTime, setPrepTime] = useState(meal?.preparationTime?.toString() || "15");
  const [available, setAvailable] = useState(meal?.available !== false);
  const [ingredients, setIngredients] = useState(meal?.ingredients?.join(", ") || "");
  const insets = useSafeAreaInsets();

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUrl(result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSave = () => {
    if (!name || !price) { Alert.alert("Error", "Name and price are required"); return; }
    onSave({
      name, description, price: parseFloat(price),
      categoryId: categoryId || undefined,
      imageUrl: imageUrl || undefined,
      available,
      preparationTime: parseInt(prepTime) || 15,
      ingredients: ingredients ? ingredients.split(",").map((i) => i.trim()).filter(Boolean) : [],
    });
  };

  return (
    <View style={[styles.modal, { backgroundColor: theme.background }]}>
      <View style={[styles.modalHeader, { borderBottomColor: theme.border, paddingTop: insets.top + 16 }]}>
        <Text style={[styles.modalTitle, { color: theme.text }]}>{meal ? "Edit Meal" : "Add Meal"}</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
        <Input label="Name *" placeholder="Meal name" value={name} onChangeText={setName} />
        <Input label="Description" placeholder="Describe the meal" value={description} onChangeText={setDescription} multiline numberOfLines={3} style={{ height: 72 }} />
        <Input label="Price *" placeholder="0.00" value={price} onChangeText={setPrice} keyboardType="decimal-pad" leftIcon="pricetag-outline" />
        <Input label="Prep Time (min)" placeholder="15" value={prepTime} onChangeText={setPrepTime} keyboardType="number-pad" />
        
        {/* Image Upload Section */}
        <View style={styles.imageSection}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Meal Image</Text>
          <TouchableOpacity onPress={handleImagePick} style={[styles.imagePicker, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={40} color={theme.textTertiary} />
                <Text style={[styles.imagePlaceholderText, { color: theme.textTertiary }]}>Tap to select image</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUrl && (
            <TouchableOpacity onPress={() => setImageUrl("")} style={styles.removeImageBtn}>
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
              <Text style={[styles.removeImageText, { color: Colors.error }]}>Remove image</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Input label="Ingredients (comma-separated)" placeholder="Flour, Sugar, Butter" value={ingredients} onChangeText={setIngredients} multiline numberOfLines={2} style={{ height: 56 }} />
        <View style={styles.categoryPicker}>
          <Text style={[styles.pickerLabel, { color: theme.textSecondary }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            <TouchableOpacity onPress={() => setCategoryId("")} style={[styles.catChip, { backgroundColor: !categoryId ? Colors.primary : theme.surface }]}>
              <Text style={[styles.catChipText, { color: !categoryId ? "#FFF" : theme.textSecondary }]}>None</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} onPress={() => setCategoryId(cat.id)} style={[styles.catChip, { backgroundColor: categoryId === cat.id ? Colors.primary : theme.surface }]}>
                <Text style={[styles.catChipText, { color: categoryId === cat.id ? "#FFF" : theme.textSecondary }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity onPress={() => setAvailable(!available)} style={[styles.toggle, { backgroundColor: theme.surface }]}>
          <Text style={[styles.toggleLabel, { color: theme.text }]}>Available</Text>
          <View style={[styles.toggleBtn, { backgroundColor: available ? Colors.success : "#666" }]}>
            <View style={[styles.toggleThumb, { transform: [{ translateX: available ? 16 : 0 }] }]} />
          </View>
        </TouchableOpacity>
        <Button title={meal ? "Update Meal" : "Add Meal"} onPress={handleSave} loading={loading} />
      </ScrollView>
    </View>
  );
}

export default function AdminMealsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editMeal, setEditMeal] = useState<Meal | null>(null);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: mealsData, isLoading } = useQuery({ queryKey: ["admin-meals"], queryFn: () => mealsApi.list({ page: 1, limit: 50 } as any) });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });

  const { mutate: createMeal, isPending: creating } = useMutation({
    mutationFn: (data: Partial<Meal>) => mealsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-meals"] }); setShowForm(false); },
  });

  const { mutate: updateMeal, isPending: updating } = useMutation({
    mutationFn: (data: Partial<Meal>) => mealsApi.update(editMeal!.id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-meals"] }); setShowForm(false); setEditMeal(null); },
  });

  const { mutate: deleteMeal } = useMutation({
    mutationFn: (id: string) => mealsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-meals"] }),
  });

  const handleDelete = (meal: Meal) => {
    Alert.alert("Delete Meal", `Delete "${meal.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMeal(meal.id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Manage Meals</Text>
        <TouchableOpacity onPress={() => { setEditMeal(null); setShowForm(true); }} style={styles.addBtn}>
          <Ionicons name="add-circle" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={mealsData?.meals || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={[styles.mealRow, { backgroundColor: theme.card }]}>
            <Image source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100" }} style={styles.mealImg} />
            <View style={styles.mealInfo}>
              <Text style={[styles.mealName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
              <Text style={[styles.mealPrice, { color: Colors.primary }]}>${item.price.toFixed(2)}</Text>
              <View style={styles.mealMeta}>
                {item.categoryName && <Text style={[styles.mealCat, { color: theme.textTertiary }]}>{item.categoryName}</Text>}
                <Badge label={item.available ? "Available" : "Unavailable"} variant={item.available ? "success" : "neutral"} size="sm" />
              </View>
            </View>
            <View style={styles.mealActions}>
              <TouchableOpacity onPress={() => { setEditMeal(item); setShowForm(true); }} style={[styles.actionBtn2, { backgroundColor: Colors.secondary + "20" }]}>
                <Ionicons name="create-outline" size={16} color={Colors.secondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={[styles.actionBtn2, { backgroundColor: Colors.error + "20" }]}>
                <Ionicons name="trash-outline" size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={showForm} animationType="slide" presentationStyle="fullScreen">
        <MealForm
          meal={editMeal}
          categories={categories || []}
          onSave={(data) => editMeal ? updateMeal(data) : createMeal(data)}
          onClose={() => { setShowForm(false); setEditMeal(null); }}
          loading={creating || updating}
          theme={theme}
        />
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
  mealRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, overflow: "hidden" },
  mealImg: { width: 72, height: 72, backgroundColor: "#E0E0E0" },
  mealInfo: { flex: 1, padding: 10, gap: 3 },
  mealName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  mealPrice: { fontFamily: "Inter_700Bold", fontSize: 15 },
  mealMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  mealCat: { fontFamily: "Inter_400Regular", fontSize: 11 },
  mealActions: { flexDirection: "row", gap: 6, paddingRight: 10 },
  actionBtn2: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  formContent: { padding: 20, gap: 16 },
  imageSection: { gap: 8 },
  sectionLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  imagePicker: { 
    height: 120, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderStyle: "dashed",
    alignItems: "center", 
    justifyContent: "center",
    overflow: "hidden"
  },
  previewImage: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center", justifyContent: "center", gap: 8 },
  imagePlaceholderText: { fontFamily: "Inter_400Regular", fontSize: 14 },
  removeImageBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6, 
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 4
  },
  removeImageText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  categoryPicker: { gap: 8 },
  pickerLabel: { fontFamily: "Inter_500Medium", fontSize: 13 },
  categoryRow: { flexDirection: "row", gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  catChipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  toggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 12 },
  toggleLabel: { fontFamily: "Inter_500Medium", fontSize: 15 },
  toggleBtn: { width: 44, height: 26, borderRadius: 13, padding: 3 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#FFF" },
});
