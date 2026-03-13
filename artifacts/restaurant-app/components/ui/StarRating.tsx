import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  editable?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({ rating, maxRating = 5, size = 16, editable = false, onRate }: StarRatingProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => editable && onRate?.(i + 1)}
            disabled={!editable}
            activeOpacity={0.7}
          >
            <Ionicons
              name={filled ? "star" : half ? "star-half" : "star-outline"}
              size={size}
              color={filled || half ? Colors.star : "#CCCCCC"}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 2,
  },
});
