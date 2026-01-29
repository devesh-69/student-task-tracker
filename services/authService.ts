// Authentication Service - Supports Guest Mode + Optional Login

// Smart API URL: Use /api in production (Netlify), localhost in development
const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');
const TOKEN_KEY = 'stt_auth_token';
const USER_KEY = 'stt_user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message: string;
}

export const authService = {
  // Check if user is a guest (not logged in)
  isGuest: (): boolean => {
    return !authService.isAuthenticated();
  },

  // Register new account
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Save token and user to localStorage
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data;
  },

  // Login with credentials
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Save token and user to localStorage
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return data;
  },

  // Logout - clear stored data
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get stored user
  getUser: (): AuthUser | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Check if user is authenticated (has valid token)
  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    if (!token) return false;
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  },

  // Get auth header for API requests
  getAuthHeader: (): { Authorization: string } | Record<string, never> => {
    const token = authService.getToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  },

  // Update stored user info
  updateUser: (user: AuthUser): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};
