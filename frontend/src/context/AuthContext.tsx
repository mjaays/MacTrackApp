import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, userApi, setTokens, clearTokens } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  heightCm?: number;
  currentWeightKg?: number;
  dateOfBirth?: string;
  gender?: string;
  activityLevel?: string;
  goals?: {
    goalType?: string;
    targetWeightKg?: number;
    dailyCalories?: number;
    dailyProteinG?: number;
    dailyCarbsG?: number;
    dailyFatG?: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Flatten the nested profile/goals from the backend response into our User shape
function mapUser(data: any): User {
  return {
    id: data.id,
    email: data.email,
    firstName: data.profile?.firstName,
    lastName: data.profile?.lastName,
    heightCm: data.profile?.heightCm,
    currentWeightKg: data.profile?.currentWeightKg,
    dateOfBirth: data.profile?.dateOfBirth,
    gender: data.profile?.gender,
    activityLevel: data.profile?.activityLevel,
    goals: data.goals ? {
      goalType: data.goals.goalType,
      targetWeightKg: data.goals.targetWeightKg,
      dailyCalories: data.goals.dailyCalories,
      dailyProteinG: data.goals.dailyProteinG,
      dailyCarbsG: data.goals.dailyCarbsG,
      dailyFatG: data.goals.dailyFatG,
    } : undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await userApi.getProfile();
      if (res.success && res.data) {
        setUser(mapUser(res.data));
      } else {
        setUser(null);
        clearTokens();
      }
    } catch {
      setUser(null);
      clearTokens();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.success && res.data) {
      setTokens(res.data.accessToken, res.data.refreshToken);
      await fetchUser();
      return { success: true };
    }
    const msg = res.error?.details?.length
      ? res.error.details.map((d: any) => d.message).join('. ')
      : res.error?.message || 'Login failed';
    return { success: false, error: msg };
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await authApi.register(data);
    if (res.success && res.data) {
      setTokens(res.data.accessToken, res.data.refreshToken);
      await fetchUser();
      return { success: true };
    }
    const msg = res.error?.details?.length
      ? res.error.details.map((d: any) => d.message).join('. ')
      : res.error?.message || 'Registration failed';
    return { success: false, error: msg };
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch { /* ignore */ }
    clearTokens();
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
