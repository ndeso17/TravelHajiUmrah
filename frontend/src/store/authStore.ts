import { create } from 'zustand';
import type { AuthUser, LoginCredentials } from '../api/types';
import { login as loginRequest, logout as logoutRequest, refresh as refreshRequest } from '../features/auth/api';

export type AuthStore = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  async login(credentials) {
    const { user, accessToken } = await loginRequest(credentials);
    set({ user, accessToken, isAuthenticated: true });
  },

  logout() {
    set({ user: null, accessToken: null, isAuthenticated: false });
    void logoutRequest().catch(() => undefined); // no-excuse-ok: catch — local session already cleared
  },

  setToken(token) {
    set({ accessToken: token });
  },

  async hydrate() {
    try {
      const { user, accessToken } = await refreshRequest();
      set({ user, accessToken, isAuthenticated: true });
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },
}));
