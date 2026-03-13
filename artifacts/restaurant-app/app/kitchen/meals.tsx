import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform,
  useColorScheme,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/colors";
import { mealsApi, categoriesApi, type Meal, type Category } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import * as Haptics from "expo-haptics";

export default function KitchenMealsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
    ingredients: "",
    preparationTime: "",
    available: true,
  });

  // Fetch meals and categories
  const { data: mealsData, isLoading: mealsLoading } = useQuery({
    queryKey: ["meals"],
    queryFn: () => mealsApi.list(),
  });

  const meals = mealsData?.meals || [];

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getAll(),
  });

  // Mutations
  const createMealMutation = useMutation({
    mutationFn: mealsApi.create,
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["meals"] });
      resetForm();
      setShowAddForm(false);
      Alert.alert("Success", "Meal added successfully!");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to add meal");
    },
  });

  const updateMealMutation = useMutation({
    mutationFn: ({ id, ...data }: Meal) => mealsApi.update(id, data),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ["meals"] });
      resetForm();
      setEditingMeal(null);
      setShowAddForm(false);
      Alert.alert("Success", "Meal updated successfully!");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update meal");
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: mealsApi.delete,
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      qc.invalidateQueries({ queryKey: ["meals"] });
      Alert.alert("Success", "Meal deleted successfully!");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to delete meal");
    },
  });

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData({ ...formData, imageUrl: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const mealData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId,
      imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      ingredients: formData.ingredients.split(",").map(i => i.trim()).filter(i => i),
      preparationTime: parseInt(formData.preparationTime) || 15,
      available: formData.available,
    };

    if (editingMeal) {
      updateMealMutation.mutate({ ...mealData, id: editingMeal.id });
    } else {
      createMealMutation.mutate(mealData);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      imageUrl: "",
      ingredients: "",
      preparationTime: "",
      available: true,
    });
  };

  const editMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      description: meal.description || "",
      price: meal.price.toString(),
      categoryId: meal.categoryId,
      imageUrl: meal.imageUrl || "",
      ingredients: meal.ingredients?.join(", ") || "",
      preparationTime: meal.preparationTime.toString(),
      available: meal.available,
    });
    setShowAddForm(true);
  };

  const deleteMeal = (meal: Meal) => {
    Alert.alert(
      "Delete Meal",
      `Are you sure you want to delete "${meal.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMealMutation.mutate(meal.id),
        },
      ]
    );
  };

  const toggleAvailability = (meal: Meal) => {
    updateMealMutation.mutate({ ...meal, available: !meal.available });
  };

  if (showAddForm) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
          <TouchableOpacity onPress={() => { setShowAddForm(false); setEditingMeal(null); resetForm(); }}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editingMeal ? "Edit Meal" : "Add New Meal"}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <Input
            label="Meal Name *"
            placeholder="Enter meal name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Input
            label="Description"
            placeholder="Describe the meal"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
          />

          <Input
            label="Price *"
            placeholder="0.00"
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            keyboardType="numeric"
          />

          <View style={styles.pickerContainer}>
            <Text style={[styles.label, { color: theme.text }]}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories?.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: formData.categoryId === category.id ? Colors.primary : theme.card,
                      borderColor: formData.categoryId === category.id ? Colors.primary : theme.border,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, categoryId: category.id })}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color: formData.categoryId === category.id ? "#FFF" : theme.text,
                      },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.imageSection}>
            <Text style={[styles.label, { color: theme.text }]}>Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {formData.imageUrl ? (
                <Image source={{ uri: formData.imageUrl }} style={styles.previewImage} />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: theme.card }]}>
                  <Ionicons name="camera-outline" size={40} color={theme.textSecondary} />
                  <Text style={[styles.imagePlaceholderText, { color: theme.textSecondary }]}>
                    Tap to add image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Input
            label="Ingredients"
            placeholder="Enter ingredients separated by commas"
            value={formData.ingredients}
            onChangeText={(text) => setFormData({ ...formData, ingredients: text })}
          />

          <Input
            label="Preparation Time (minutes)"
            placeholder="15"
            value={formData.preparationTime}
            onChangeText={(text) => setFormData({ ...formData, preparationTime: text })}
            keyboardType="numeric"
          />

          <View style={styles.switchContainer}>
            <Text style={[styles.label, { color: theme.text }]}>Available</Text>
            <TouchableOpacity
              style={[
                styles.switch,
                {
                  backgroundColor: formData.available ? Colors.primary : theme.border,
                },
              ]}
              onPress={() => setFormData({ ...formData, available: !formData.available })}
            >
              <View
                style={[
                  styles.switchThumb,
                  {
                    transform: [{ translateX: formData.available ? 20 : 0 }],
                    backgroundColor: "#FFF",
                  },
                ]}
              />
            </TouchableOpacity>
          </View>

          <Button
            title={editingMeal ? "Update Meal" : "Add Meal"}
            onPress={handleSubmit}
            loading={createMealMutation.isPending || updateMealMutation.isPending}
            style={styles.submitBtn}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Meal Management</Text>
        <TouchableOpacity onPress={() => setShowAddForm(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {meals?.map((meal) => (
          <View key={meal.id} style={[styles.mealCard, { backgroundColor: theme.card }]}>
            <View style={styles.mealHeader}>
              <View style={styles.mealInfo}>
                <Text style={[styles.mealName, { color: theme.text }]}>{meal.name}</Text>
                <Text style={[styles.mealPrice, { color: Colors.primary }]}>
                  ${meal.price.toFixed(2)}
                </Text>
                <Text style={[styles.mealCategory, { color: theme.textSecondary }]}>
                  {meal.categoryName}
                </Text>
              </View>
              <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />
            </View>

            {meal.description && (
              <Text style={[styles.mealDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                {meal.description}
              </Text>
            )}

            <View style={styles.mealMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {meal.preparationTime} min
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="list-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {meal.ingredients?.length || 0} ingredients
                </Text>
              </View>
            </View>

            <View style={styles.mealActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: meal.available ? Colors.success : Colors.error }]}
                onPress={() => toggleAvailability(meal)}
              >
                <Ionicons name={meal.available ? "checkmark" : "close"} size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>
                  {meal.available ? "Available" : "Unavailable"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.secondary }]}
                onPress={() => editMeal(meal)}
              >
                <Ionicons name="create-outline" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.error }]}
                onPress={() => deleteMeal(meal)}
              >
                <Ionicons name="trash-outline" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#FFF" },
  addBtn: { backgroundColor: Colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, gap: 16 },
  mealCard: { borderRadius: 16, padding: 16, gap: 12 },
  mealHeader: { flexDirection: "row", justifyContent: "space-between" },
  mealInfo: { flex: 1, gap: 4 },
  mealName: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  mealPrice: { fontFamily: "Inter_700Bold", fontSize: 18 },
  mealCategory: { fontFamily: "Inter_500Medium", fontSize: 12 },
  mealImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#E0E0E0" },
  mealDescription: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 18 },
  mealMeta: { flexDirection: "row", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  mealActions: { flexDirection: "row", gap: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  actionBtnText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#FFF" },
  formContent: { padding: 20, gap: 16 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14, marginBottom: 8 },
  pickerContainer: { gap: 8 },
  categoryScroll: { flexDirection: "row" },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  categoryChipText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  imageSection: { gap: 8 },
  imagePicker: { borderRadius: 12, overflow: "hidden" },
  previewImage: { width: "100%", height: 200, backgroundColor: "#E0E0E0" },
  imagePlaceholder: { width: "100%", height: 200, alignItems: "center", justifyContent: "center", gap: 8 },
  imagePlaceholderText: { fontFamily: "Inter_500Medium", fontSize: 14 },
  switchContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  switch: { width: 48, height: 28, borderRadius: 14, justifyContent: "center" },
  switchThumb: { width: 24, height: 24, borderRadius: 12 },
  submitBtn: { marginTop: 16 },
});
