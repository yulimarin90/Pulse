import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as api from './mockApi';
import type { RegisterData, User } from './types';

interface AuthContextValue {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  loginWithGoogle: () => void;
  register: (data: RegisterData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const value = useMemo<AuthContextValue>(() => ({
    currentUser,
    login: (username) => {
      const user = api.authenticate(username);
      if (user) setCurrentUser(user);
      return Boolean(user);
    },
    // Mocked: logs in as the demo user until Google auth is added with Firebase.
    loginWithGoogle: () => setCurrentUser(api.getUserById(1) ?? null),
    register: (data) => setCurrentUser(api.registerUser(data)),
    logout: () => setCurrentUser(null),
  }), [currentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

// 'privateLayout' This is for private pages and ensures that the user is logged in.
export function useCurrentUser(): User {
  const { currentUser } = useAuth();
  if (!currentUser) throw new Error('No logged-in user');
  return currentUser;
}


