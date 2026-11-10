import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { backend as firebaseBackend } from './backend';
import type { AuthBackend } from './backend';
import { isFirebaseConfigured } from './firebase';
import type { SocialProvider } from './firebase';
import type { RegisterData, User } from './types';

interface AuthContextValue {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithProvider: (provider: SocialProvider) => Promise<void>;
  // if the username or email address is already in use, reject the request
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  // Only tests pass another one. The app always uses Firebase
  backend?: AuthBackend;
}

export function AuthProvider({ children, backend = firebaseBackend }: AuthProviderProps) {
  const configured = backend !== firebaseBackend || isFirebaseConfigured;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!configured);

  // Restores the Firebase session before showing the app
  useEffect(() => {
    if (!configured) return;
    backend.restoreSession()
      .then(setCurrentUser)
      .catch((error) => console.error('Could not restore the session', error))
      .finally(() => setReady(true));
  }, [backend, configured]);

  const value = useMemo<AuthContextValue>(() => ({
    currentUser,
    login: async (username, password) => {
      const user = await backend.login(username, password);
      if (user) setCurrentUser(user);
      return Boolean(user);
    },
    loginWithProvider: async (provider) => setCurrentUser(await backend.loginWithProvider(provider)),
    register: async (data) => setCurrentUser(await backend.register(data)),
    logout: () => {
      void backend.logout();
      setCurrentUser(null);
    },
  }), [backend, currentUser]);

  if (!configured) {
    return (
      <div className="setup-notice">
        <h1>Firebase is not configured</h1>
        <p>Copy <code>.env.example</code> to <code>.env</code>, add the keys of your Firebase project and restart <code>npm run dev</code>.</p>
        <p>Step by step: <code>docs/firebase-setup.md</code></p>
      </div>
    );
  }
  if (!ready) return <p className="loading">Loading...</p>;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

// 'privateLayout' This is for private pages and ensures that the user is logged in
export function useCurrentUser(): User {
  const { currentUser } = useAuth();
  if (!currentUser) throw new Error('No logged-in user');
  return currentUser;
}
