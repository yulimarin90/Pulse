// Firestore access. Collections:
//   users/{id}               profile of every user (plus the Firebase uid of its owner)
//   usernames/{username}     lets a person sign in by username and keeps usernames unique
//   follows/{followerId}_{followedId}
//   tweets/{id}
import type { DataSnapshot } from './dataStore';
import type { ProfileChanges, Tweet, User } from './types';
import { getFirebaseApp } from './firebase';

export class UsernameTakenError extends Error {
  constructor() {
    super('That username is already taken');
    this.name = 'UsernameTakenError';
  }
}

// What the app needs from the database. Tests replace it with a fake one.
export interface RemoteStore {
  getEmailByUsername(username: string): Promise<string | null>;
  // Saves the profile and reserves the username in one step. Throws UsernameTakenError when it is taken.
  createProfile(profile: User, uid: string): Promise<void>;
  findProfileByUid(uid: string): Promise<User | null>;
  loadAll(): Promise<DataSnapshot>;
  updateProfile(userId: number, changes: ProfileChanges): Promise<void>;
  saveFollow(followerId: number, followedId: number): Promise<void>;
  saveTweet(tweet: Tweet): Promise<void>;
}

async function getDb() {
  const firestore = await import('firebase/firestore');
  return { f: firestore, db: firestore.getFirestore(await getFirebaseApp()) };
}

const PROFILE_FIELDS = ['bio', 'location', 'website', 'birthDate', 'avatarUrl', 'bannerUrl'] as const;

const toUser = (data: User): User => {
  const user: User = { id: data.id, fullName: data.fullName, username: data.username, email: data.email };
  // Only the details that were filled in.
  for (const field of PROFILE_FIELDS) if (data[field]) user[field] = data[field];
  return user;
};

export const firestoreStore: RemoteStore = {
  async getEmailByUsername(username) {
    const { f, db } = await getDb();
    const snap = await f.getDoc(f.doc(db, 'usernames', username));
    return snap.exists() ? (snap.data().email as string) : null;
  },

  async createProfile(profile, uid) {
    const { f, db } = await getDb();
    await f.runTransaction(db, async (tx) => {
      const usernameRef = f.doc(db, 'usernames', profile.username);
      if ((await tx.get(usernameRef)).exists()) throw new UsernameTakenError();
      tx.set(usernameRef, { uid, email: profile.email, userId: profile.id });
      tx.set(f.doc(db, 'users', String(profile.id)), { ...profile, uid });
    });
  },

  async findProfileByUid(uid) {
    const { f, db } = await getDb();
    const result = await f.getDocs(f.query(f.collection(db, 'users'), f.where('uid', '==', uid), f.limit(1)));
    return result.empty ? null : toUser(result.docs[0].data() as User);
  },

  async loadAll() {
    const { f, db } = await getDb();
    const [users, follows, tweets] = await Promise.all(
      ['users', 'follows', 'tweets'].map((name) => f.getDocs(f.collection(db, name))),
    );
    return {
      users: users.docs.map((d) => toUser(d.data() as User)),
      follows: follows.docs.map((d) => [d.data().followerId, d.data().followedId] as [number, number]),
      tweets: tweets.docs.map((d): Tweet => {
        const { id, userId, text, createdAt } = d.data();
        return { id, userId, text, createdAt };
      }),
    };
  },

  async updateProfile(userId, changes) {
    const { f, db } = await getDb();
    // Firestore does not accept undefined values.
    const data = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
    await f.updateDoc(f.doc(db, 'users', String(userId)), data);
  },

  async saveFollow(followerId, followedId) {
    const { f, db } = await getDb();
    await f.setDoc(f.doc(db, 'follows', `${followerId}_${followedId}`), { followerId, followedId });
  },

  async saveTweet(tweet) {
    const { f, db } = await getDb();
    await f.setDoc(f.doc(db, 'tweets', String(tweet.id)), tweet);
  },
};
