/// <reference types="vite/client" />
// Firebase app and Firebase Authentication. The SDK is loaded only when Firebase is configured and used
import type { FirebaseApp } from 'firebase/app';

export type SocialProvider = 'Google' | 'GitHub' | 'Facebook' | 'Microsoft';

export const FIREBASE_NOT_CONFIGURED = 'Firebase is not configured. Copy .env.example to .env and add your keys.';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(config).every(Boolean);

export async function getFirebaseApp(): Promise<FirebaseApp> {
  if (!isFirebaseConfigured) throw new Error(FIREBASE_NOT_CONFIGURED);
  const { getApps, initializeApp } = await import('firebase/app');
  return getApps()[0] ?? initializeApp(config);
}

export interface AuthSession {
  uid: string;
  email: string | null;
}

export interface SocialAccount {
  uid: string;
  email: string;
  displayName: string;
}

export interface AuthService {
  waitForSession(): Promise<AuthSession | null>;
  signUp(email: string, password: string): Promise<{ uid: string }>;
  signIn(email: string, password: string): Promise<{ uid: string }>;
  signInWithProvider(provider: SocialProvider): Promise<SocialAccount>;
  deleteCurrentUser(): Promise<void>;
  signOut(): Promise<void>;
}

async function loadAuth() {
  const authModule = await import('firebase/auth');
  return { authModule, auth: authModule.getAuth(await getFirebaseApp()) };
}

export const firebaseAuthService: AuthService = {
  async waitForSession() {
    const { auth } = await loadAuth();
    await auth.authStateReady();
    const { currentUser } = auth;
    return currentUser ? { uid: currentUser.uid, email: currentUser.email } : null;
  },

  async signUp(email, password) {
    const { authModule, auth } = await loadAuth();
    const { user } = await authModule.createUserWithEmailAndPassword(auth, email, password);
    return { uid: user.uid };
  },

  async signIn(email, password) {
    const { authModule, auth } = await loadAuth();
    const { user } = await authModule.signInWithEmailAndPassword(auth, email, password);
    return { uid: user.uid };
  },

  async signInWithProvider(provider) {
    const { authModule, auth } = await loadAuth();
    const providers = {
      Google: () => new authModule.GoogleAuthProvider(),
      GitHub: () => new authModule.GithubAuthProvider(),
      Facebook: () => new authModule.FacebookAuthProvider(),
      Microsoft: () => new authModule.OAuthProvider('microsoft.com'),
    };
    const { user } = await authModule.signInWithPopup(auth, providers[provider]());
    if (!user.email) throw new Error(`Your ${provider} account does not share an email address`);
    return { uid: user.uid, email: user.email, displayName: user.displayName ?? user.email };
  },

  async deleteCurrentUser() {
    const { auth } = await loadAuth();
    if (auth.currentUser) await auth.currentUser.delete();
  },

  async signOut() {
    const { authModule, auth } = await loadAuth();
    await authModule.signOut(auth);
  },
};

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'That email is already registered',
  'auth/weak-password': 'The password must have at least 6 characters',
  'auth/invalid-email': 'The email is not valid',
  'auth/too-many-requests': 'Too many attempts. Try again in a few minutes',
  'auth/network-request-failed': 'Network error. Check your connection',
  'auth/popup-closed-by-user': 'The sign-in window was closed before finishing',
  'auth/cancelled-popup-request': 'The sign-in window was closed before finishing',
  'auth/popup-blocked': 'The browser blocked the sign-in window',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in the Firebase console',
  'auth/account-exists-with-different-credential': 'An account with this email already exists with another sign-in method',
};

const WRONG_CREDENTIAL_CODES = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-login-credentials'];

function getErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) return String((error as { code: unknown }).code);
  return '';
}

export const isWrongCredentialError = (error: unknown): boolean => WRONG_CREDENTIAL_CODES.includes(getErrorCode(error));

export function getAuthErrorMessage(error: unknown): string {
  const message = AUTH_ERROR_MESSAGES[getErrorCode(error)];
  if (message) return message;
  return error instanceof Error ? error.message : 'Something went wrong. Try again';
}
