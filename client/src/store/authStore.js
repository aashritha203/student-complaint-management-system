import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      error: null,
      loading: false,
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.post(`${BACKEND_URL}/auth/login`, { email, password });
          set({ user: res.data, token: res.data.token, loading: false });
          return res.data;
        } catch (err) {
          const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
          set({ error: errMsg, loading: false });
          throw new Error(errMsg);
        }
      },
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.post(`${BACKEND_URL}/auth/register`, userData);
          set({ user: res.data, token: res.data.token, loading: false });
          return res.data;
        } catch (err) {
          const errMsg =
            err.response?.data?.message ||
            err.response?.data?.errors?.[0]?.msg ||
            'Registration failed';
          set({ error: errMsg, loading: false });
          throw new Error(errMsg);
        }
      },
      logout: () => {
        set({ user: null, token: null, error: null });
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'college-complaint-auth', // Key in localStorage
    }
  )
);
