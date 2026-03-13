import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

type BadgeVariant = "primary" | "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: Colors.primary + "20", text: Colors.primary },
  success: { bg: Colors.success + "20", text: Colors.success },
  warning: { bg: Colors.warning + "20", text: Colors.warning },
  error: { bg: Colors.error + "20", text: Colors.error },
  info: { bg: Colors.secondary + "20", text: Colors.secondary },
  neutral: { bg: "#88888820", text: "#888888" },
};

export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    pending: "warning",
    preparing: "info",
    ready: "success",
    delivered: "neutral",
    cancelled: "error",
  };
  return <Badge label={status.charAt(0).toUpperCase() + status.slice(1)} variant={variantMap[status] || "neutral"} />;
}

export function Badge({ label, variant = "primary", size = "md" }: BadgeProps) {
  const colors = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, size === "sm" && styles.sm]}>
      <Text style={[styles.text, { color: colors.text }, size === "sm" && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  textSm: {
    fontSize: 10,
  },
});
