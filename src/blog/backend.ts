/* Sign in, register and save the data with Firebase Authentication + Firestore.
 The screens do not know about Firebase: they only use AuthContext and dataStore.*/
import * as api from './dataStore';
import { firebaseAuthService, getAuthErrorMessage, isWrongCredentialError } from './firebase';
import type { AuthService, SocialProvider } from './firebase';
import { UsernameTakenError, firestoreStore } from './remoteStore';
import type { RemoteStore } from './remoteStore';
import type { ProfileChanges, RegisterData, User } from './types';

export interface AuthBackend {
  restoreSession(): Promise<User | null>;
  login(username: string, password: string): Promise<User | null>;
  loginWithProvider(provider: SocialProvider): Promise<User>;
  register(data: RegisterData): Promise<User>;
  updateProfile(userId: number, changes: ProfileChanges): Promise<User>;
  markNotificationsSeen(userId: number): Promise<User>;
  logout(): Promise<void>;
}

interface FirebaseBackendDeps {
  auth: AuthService;
  store: RemoteStore;
}

const MAX_USERNAME_ATTEMPTS = 50;

export function createFirebaseBackend({ auth, store }: FirebaseBackendDeps): AuthBackend {
  let stopSync: (() => void) | null = null;

  const saving = (event: api.StoreEvent): Promise<void> => {
    switch (event.type) {
      case 'tweet': return store.saveTweet(event.tweet);
      case 'follow': return store.saveFollow(event.followerId, event.followedId, event.createdAt);
      case 'unfollow': return store.deleteFollow(event.followerId, event.followedId);
      case 'like': return store.saveLike(event.reaction);
      case 'unlike': return store.deleteLike(event.userId, event.tweetId);
      case 'repost': return store.saveRepost(event.reaction);
      case 'unrepost': return store.deleteRepost(event.userId, event.tweetId);
      case 'bookmark': return store.saveBookmark(event.reaction);
      case 'unbookmark': return store.deleteBookmark(event.userId, event.tweetId);
    }
  };

  // Follows, tweets, likes and reposts made while signed in are saved in Firestore, and what other people do (a new
  // follower, a like, a reply) arrives here while the app is open, so the notifications update by themselves.
  const startSync = (userId: number) => {
    stopSync?.();
    const stopSaving = api.subscribe((event) => {
      saving(event).catch((error) => console.error('Could not save the change in Firebase', error));
    });
    const stopListening = store.listen((data) => api.loadRemoteData(data), userId);
    stopSync = () => {
      stopSaving();
      stopListening();
    };
  };

  // Loads everything from Firestore into the app and returns the user as the app knows it
  const openSession = async (profile: User): Promise<User> => {
    api.loadRemoteData(await store.loadAll(profile.id));
    startSync(profile.id);
    return api.getUserById(profile.id) ?? profile;
  };

  const createProfileWithFreeUsername = async (base: string, fullName: string, email: string, uid: string): Promise<User> => {
    for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt += 1) {
      const profile: User = { id: api.newId(), fullName, username: attempt === 0 ? base : `${base}${attempt}`, email };
      try {
        await store.createProfile(profile, uid);
        return profile;
      } catch (error) {
        if (!(error instanceof UsernameTakenError)) throw error;
      }
    }
    throw new Error('Could not find a free username. Register with the form instead');
  };

  return {
    async restoreSession() {
      const session = await auth.waitForSession();
      if (!session) return null;
      const profile = await store.findProfileByUid(session.uid);
      return profile ? openSession(profile) : null;
    },

    async login(username, password) {
      const email = await store.getEmailByUsername(api.normalizeUsername(username));
      if (!email) return null;
      let uid: string;
      try {
        ({ uid } = await auth.signIn(email, password));
      } catch (error) {
        if (isWrongCredentialError(error)) return null;
        throw new Error(getAuthErrorMessage(error));
      }
      const profile = await store.findProfileByUid(uid);
      if (!profile) throw new Error('This account has no profile. Register it again');
      return openSession(profile);
    },

    async loginWithProvider(provider) {
      let account;
      try {
        account = await auth.signInWithProvider(provider);
      } catch (error) {
        throw new Error(getAuthErrorMessage(error));
      }
      const existing = await store.findProfileByUid(account.uid);
      if (existing) return openSession(existing);

      const base = account.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 25) || 'user';
      const profile = await createProfileWithFreeUsername(base, account.displayName.trim(), account.email.toLowerCase(), account.uid);
      return openSession(profile);
    },

    async register({ fullName, username, email, password }) {
      const normalizedUsername = api.normalizeUsername(username);
      if (!api.USERNAME_PATTERN.test(normalizedUsername)) throw new Error(api.USERNAME_FORMAT_MESSAGE);
      if (await store.getEmailByUsername(normalizedUsername)) throw new UsernameTakenError();

      const normalizedEmail = api.normalizeEmail(email);
      let uid: string;
      try {
        ({ uid } = await auth.signUp(normalizedEmail, password));
      } catch (error) {
        throw new Error(getAuthErrorMessage(error));
      }

      const profile: User = { id: api.newId(), fullName: fullName.trim(), username: normalizedUsername, email: normalizedEmail };
      try {
        await store.createProfile(profile, uid);
      } catch (error) {
        await auth.deleteCurrentUser().catch(() => undefined);
        throw error;
      }
      return openSession(profile);
    },

    async updateProfile(userId, changes) {
      api.validateProfileChanges(changes);
      await store.updateProfile(userId, changes);
      return api.updateUser(userId, changes);
    },

    async markNotificationsSeen(userId) {
      const user = api.markNotificationsSeen(userId);
      await store.saveNotificationsSeen(userId, user.notificationsSeenAt ?? Date.now());
      return user;
    },

    async logout() {
      stopSync?.();
      stopSync = null;
      await auth.signOut();
    },
  };
}

export const backend: AuthBackend = createFirebaseBackend({ auth: firebaseAuthService, store: firestoreStore });
