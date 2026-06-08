import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/services/api/client';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => {
        set({ user, token });
        if (token) {
          apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
          delete apiClient.defaults.headers.common.Authorization;
        }
      },

      login: async ({ username, password }) => {
        set({ isLoading: true });
        try {
          const params = new URLSearchParams();
          params.append('username', username);
          params.append('password', password);

          const tokenResponse = await apiClient.post("/api/v1/auth/login", params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });

          const accessToken = tokenResponse.data.access_token;
          apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

          const meResponse = await apiClient.get("/api/v1/auth/me");
          const loggedInUser = meResponse.data;

          set({ user: loggedInUser, token: accessToken, isLoading: false });
          return loggedInUser;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        delete apiClient.defaults.headers.common.Authorization;
      },
    }),
    {
      name: 'smartmall-auth-storage',
      onRehydrateStorage: () => (state: any) => {
        if (state && state.token) {
          apiClient.defaults.headers.common.Authorization = `Bearer ${state.token}`;
        }
      },
    }
  )
);
