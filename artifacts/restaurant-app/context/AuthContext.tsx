import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export type UserRole = "customer" | "admin" | "kitchen";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  profileImage?: string | null;
  addresses: string[];
  isBlocked: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `http://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem("auth_token"),
        AsyncStorage.getItem("auth_user"),
      ]);
      if (token && userStr) {
        setState({ user: JSON.parse(userStr), token, isLoading: false });
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    } catch {
      setState((s) => ({ ...s, isLoading: false }));
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    await Promise.all([
      AsyncStorage.setItem("auth_token", data.token),
      AsyncStorage.setItem("auth_user", JSON.stringify(data.user)),
    ]);
    setState({ user: data.user, token: data.token, isLoading: false });
    
    // Navigate based on user role
    if (data.user.role === "admin") {
      router.replace("/admin");
    } else if (data.user.role === "kitchen") {
      router.replace("/kitchen");
    } else {
      router.replace("/(tabs)");
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = "customer") => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    await Promise.all([
      AsyncStorage.setItem("auth_token", data.token),
      AsyncStorage.setItem("auth_user", JSON.stringify(data.user)),
    ]);
    setState({ user: data.user, token: data.token, isLoading: false });
    
    // Navigate based on user role
    if (data.user.role === "admin") {
      router.replace("/admin");
    } else if (data.user.role === "kitchen") {
      router.replace("/kitchen");
    } else {
      router.replace("/(tabs)");
    }
  };

  const logout = async () => {
    try {
      console.log("Starting logout...");
      await Promise.all([
        AsyncStorage.removeItem("auth_token"),
        AsyncStorage.removeItem("auth_user"),
      ]);
      console.log("Storage cleared, updating state...");
      setState({ user: null, token: null, isLoading: false });
      
      console.log("State updated, navigating to login...");
      // Navigate back to login page
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, try to clear state and navigate
      setState({ user: null, token: null, isLoading: false });
      router.replace("/(auth)/login");
    }
  };

  const updateUser = (user: User) => {
    AsyncStorage.setItem("auth_user", JSON.stringify(user));
    setState((s) => ({ ...s, user }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
