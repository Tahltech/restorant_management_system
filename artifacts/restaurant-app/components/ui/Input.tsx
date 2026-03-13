import React, { useState, forwardRef } from "react";
import { TextInput, View, Text, StyleSheet, TextInputProps, TouchableOpacity, useColorScheme } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  style,
  ...props
}, ref) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      )}
      <View style={[
        styles.inputWrapper,
        {
          backgroundColor: theme.surface,
          borderColor: error ? Colors.error : theme.border,
        }
      ]}>
        {leftIcon && (
          <Feather name={leftIcon as any} size={18} color={theme.textTertiary} style={styles.leftIcon} />
        )}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            { color: theme.text },
            leftIcon ? styles.inputWithLeft : null,
            (rightIcon || isPassword) ? styles.inputWithRight : null,
            style,
          ]}
          placeholderTextColor={theme.textTertiary}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Feather name={rightIcon as any} size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
});

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    paddingVertical: 12,
  },
  inputWithLeft: {
    paddingLeft: 8,
  },
  inputWithRight: {
    paddingRight: 8,
  },
  leftIcon: {
    marginRight: 4,
  },
  rightIcon: {
    padding: 4,
    marginLeft: 4,
  },
  error: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.error,
  },
});
