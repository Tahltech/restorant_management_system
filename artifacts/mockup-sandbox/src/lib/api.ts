import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API configuration for different environments
export const API_CONFIG = {
  // In development, use the Docker service name or localhost
  development: {
    baseURL: process.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
  },
  // In production, use the relative path or environment-specific URL
  production: {
    baseURL: process.env.VITE_API_URL || '/api',
    timeout: 10000,
  },
  // Test environment
  test: {
    baseURL: 'http://localhost:3000/api',
    timeout: 5000,
  },
} as const

// Get current environment configuration
export const getApiConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  return API_CONFIG[env as keyof typeof API_CONFIG] || API_CONFIG.development
}

// Helper function to make API calls
export const apiRequest = async (endpoint: string, options?: RequestInit) => {
  const config = getApiConfig()
  const url = `${config.baseURL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  }

  try {
    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}
