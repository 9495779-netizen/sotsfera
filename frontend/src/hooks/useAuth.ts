import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/api/client';
import type { AuthTokens } from '@/types';

export function useAuth() {
  const { user, isAuthenticated, setTokens, setUser, logout } = useAuthStore();

  const login = async (email: string, password: string) => {
    const { data } = await apiClient.post<AuthTokens>('/auth/login', { email, password });
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const logoutUser = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      logout();
    }
  };

  return { user, isAuthenticated, login, logout: logoutUser };
}
