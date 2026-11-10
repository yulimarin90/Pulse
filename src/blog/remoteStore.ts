
import type { DataSnapshot } from './dataStore';
import type { Tweet, User } from './types';
import { getFirebaseApp } from './firebase';

export class UsernameTakenError extends Error {
  constructor() {
    super('That username is already taken');
    this.name = 'UsernameTakenError';
  }
}

export interface RemoteStore {
  getEmailByUsername(username: string): Promise<string | null>;
  // Saves the profile and reserves the username in one step. Throws UsernameTakenError when it is taken
  createProfile(profile: User, uid: string): Promise<void>;
  findProfileByUid(uid: string): Promise<User | null>;
  loadAll(): Promise<DataSnapshot>;
  saveFollow(followerId: number, followedId: number): Promise<void>;
  saveTweet(tweet: Tweet): Promise<void>;
}

async function getDb() {
  const firestore = await import('firebase/firestore');
  return { f: firestore, db: firestore.getFirestore(await getFirebaseApp()) };
}

const toUser = (data: { id: number; fullName: string; username: string; email: string }): User => ({
  id: data.id,
  fullName: data.fullName,
  username: data.username,
  email: data.email,
});

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

  async saveFollow(followerId, followedId) {
    const { f, db } = await getDb();
    await f.setDoc(f.doc(db, 'follows', `${followerId}_${followedId}`), { followerId, followedId });
  },

  async saveTweet(tweet) {
    const { f, db } = await getDb();
    await f.setDoc(f.doc(db, 'tweets', String(tweet.id)), tweet);
  },
};
