import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { api, AuthUser, getToken, removeToken, saveToken, setUnauthorizedHandler } from '@/lib/api';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(user: AuthUser): AuthUser {
  return {
    id: user.id ?? user._id,
    _id: user._id ?? user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshProfile() {
    const response = await api.get('/auth/profile');
    setUser(normalizeUser(response.data.user));
  }

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const storedToken = await getToken();

        if (!storedToken) {
          return;
        }

        const response = await api.get('/auth/profile');

        if (mounted) {
          setToken(storedToken);
          setUser(normalizeUser(response.data.user));
        }
      } catch {
        await removeToken();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      refreshProfile,
      login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        await saveToken(response.data.token);
        setToken(response.data.token);
        setUser(normalizeUser(response.data.user));
      },
      register: async (payload) => {
        const response = await api.post('/auth/register', payload);
        await saveToken(response.data.token);
        setToken(response.data.token);
        setUser(normalizeUser(response.data.user));
      },
      logout: async () => {
        await removeToken();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }

  return value;
}
