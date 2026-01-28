import { UserProfile } from '../types';
import { authService } from './authService';
import { localStorageService } from './localStorageService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...authService.getAuthHeader()
});

export const userService = {
  // Get user profile - localStorage for guests, API for authenticated
  getProfile: async (): Promise<UserProfile | null> => {
    if (authService.isGuest()) {
      const profile = localStorageService.getUserProfile();
      return profile ? { name: profile.name, hasOnboarded: true } : null;
    }

    try {
      const response = await fetch(`${API_URL}/user`, {
        headers: getHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
          const profile = localStorageService.getUserProfile();
          return profile ? { name: profile.name, hasOnboarded: true } : null;
        }
        throw new Error('Failed to fetch user profile');
      }
      
      const data = await response.json();
      return {
        name: data.name,
        hasOnboarded: data.hasOnboarded ?? true
      };
    } catch (error) {
      console.error("Error fetching user profile", error);
      return null;
    }
  },

  // Save user profile
  saveProfile: async (name: string): Promise<UserProfile> => {
    if (!name || !name.trim()) {
      throw new Error("Name cannot be empty");
    }
    
    if (name.trim().length < 2) {
      throw new Error("Name must be at least 2 characters");
    }

    if (authService.isGuest()) {
      localStorageService.saveUserProfile(name.trim());
      return { name: name.trim(), hasOnboarded: true };
    }

    const response = await fetch(`${API_URL}/user`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name: name.trim() })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        localStorageService.saveUserProfile(name.trim());
        return { name: name.trim(), hasOnboarded: true };
      }
      throw new Error('Failed to save user profile');
    }
    
    const data = await response.json();
    
    // Also update the stored user in authService
    const currentUser = authService.getUser();
    if (currentUser) {
      authService.updateUser({ ...currentUser, name: name.trim() });
    }
    
    return {
      name: data.name,
      hasOnboarded: true
    };
  },

  clearProfile: async (): Promise<void> => {
    if (authService.isGuest()) {
      return; // Don't clear guest profile
    }

    try {
      const response = await fetch(`${API_URL}/user`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to clear user profile');
    } catch (error) {
      console.error("Error clearing user profile", error);
      throw error;
    }
  }
};