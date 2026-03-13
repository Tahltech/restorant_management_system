import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, View } from "react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}` as "size_sm" | "size_md" | "size_lg"],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.text,
    styles[`text_${variant}` as keyof typeof styles],
    styles[`textSize_${size}` as keyof typeof styles],
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFF" : Colors.primary} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={labelStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: Colors.error,
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: {
    height: 36,
    paddingHorizontal: 16,
  },
  size_md: {
    height: 48,
    paddingHorizontal: 20,
  },
  size_lg: {
    height: 56,
    paddingHorizontal: 24,
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    color: "#FFF",
  },
  text_primary: { color: "#FFF" },
  text_secondary: { color: "#FFF" },
  text_outline: { color: Colors.primary },
  text_ghost: { color: Colors.primary },
  text_danger: { color: "#FFF" },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 17 },
});
