import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "/api";

async function getToken() {
  return AsyncStorage.getItem("auth_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// Types
export interface Meal {
  id: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  price: number;
  imageUrl?: string | null;
  available: boolean;
  ingredients: string[];
  preparationTime: number;
  averageRating?: number | null;
  reviewCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  mealCount: number;
  createdAt: string;
}

export interface OrderItem {
  mealId: string;
  mealName: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
}

export type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled";
export type OrderType = "delivery" | "pickup";
export type PaymentMethod = "cash" | "card" | "online";

export interface Order {
  id: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  orderType: OrderType;
  deliveryAddress?: string | null;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName?: string | null;
  mealId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  totalCustomers: number;
  totalMeals: number;
  recentOrders: Order[];
  popularMeals: Array<{ mealId: string; mealName: string; orderCount: number; revenue: number }>;
  dailySales: Array<{ date: string; revenue: number; orderCount: number }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  profileImage?: string | null;
  addresses: string[];
  isBlocked: boolean;
  createdAt: string;
}

// API methods
export const mealsApi = {
  list: (params?: { categoryId?: string; search?: string; available?: boolean; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.categoryId) qs.set("categoryId", params.categoryId);
    if (params?.search) qs.set("search", params.search);
    if (params?.available !== undefined) qs.set("available", String(params.available));
    if (params?.page) qs.set("page", String(params.page));
    return api.get<{ meals: Meal[]; total: number; page: number; totalPages: number }>(`/meals?${qs}`);
  },
  get: (id: string) => api.get<Meal>(`/meals/${id}`),
  create: (data: Partial<Meal>) => api.post<Meal>("/meals", data),
  update: (id: string, data: Partial<Meal>) => api.put<Meal>(`/meals/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/meals/${id}`),
};

export const categoriesApi = {
  list: () => api.get<Category[]>("/categories"),
  create: (data: { name: string; description?: string; imageUrl?: string }) => api.post<Category>("/categories", data),
  update: (id: string, data: { name: string; description?: string; imageUrl?: string }) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/categories/${id}`),
};

export const ordersApi = {
  create: (data: { items: Array<{ mealId: string; quantity: number }>; orderType: OrderType; deliveryAddress?: string; paymentMethod: PaymentMethod; notes?: string }) => api.post<Order>("/orders", data),
  myOrders: (page = 1) => api.get<{ orders: Order[]; total: number; page: number; totalPages: number }>(`/orders/my-orders?page=${page}`),
  all: (status?: OrderStatus, page = 1) => {
    const qs = new URLSearchParams({ page: String(page) });
    if (status) qs.set("status", status);
    return api.get<{ orders: Order[]; total: number; page: number; totalPages: number }>(`/orders?${qs}`);
  },
  get: (id: string) => api.get<Order>(`/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus) => api.put<Order>(`/orders/${id}/status`, { status }),
  cancel: (id: string) => api.put<Order>(`/orders/${id}/cancel`, {}),
};

export const reviewsApi = {
  get: (mealId: string) => api.get<Review[]>(`/reviews/${mealId}`),
  create: (mealId: string, rating: number, comment?: string) => api.post<Review>("/reviews", { mealId, rating, comment }),
};

export const adminApi = {
  stats: () => api.get<AdminStats>("/admin/stats"),
  seed: () => api.post<{ success: boolean }>("/admin/seed", {}),
};

export const usersApi = {
  list: () => api.get<User[]>("/users"),
  profile: () => api.get<User>("/users/profile"),
  updateProfile: (data: Partial<User>) => api.put<User>("/users/profile", data),
  block: (id: string, blocked: boolean) => api.put<User>(`/users/${id}/block`, { blocked }),
};
