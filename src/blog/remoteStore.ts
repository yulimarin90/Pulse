/* Firestore access. Collections:
   users/{id}       
   usernames/{username}  
   follows/{followerId}_{followedId}   
   tweets/{id}  
   likes/{userId}_{tweetId} 
   reposts/{userId}_{tweetId}   */   
import type { DataSnapshot } from './dataStore';
import type { ProfileChanges, Reaction, Tweet, User } from './types';
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
  createProfile(profile: User, uid: string): Promise<void>;
  findProfileByUid(uid: string): Promise<User | null>;
  loadAll(): Promise<DataSnapshot>;
  updateProfile(userId: number, changes: ProfileChanges): Promise<void>;
  saveFollow(followerId: number, followedId: number, createdAt: number): Promise<void>;
  deleteFollow(followerId: number, followedId: number): Promise<void>;
  saveTweet(tweet: Tweet): Promise<void>;
  saveLike(reaction: Reaction): Promise<void>;
  deleteLike(userId: number, tweetId: number): Promise<void>;
  saveRepost(reaction: Reaction): Promise<void>;
  deleteRepost(userId: number, tweetId: number): Promise<void>;
  // Saves the moment when the person opened the notifications for the last time.
  saveNotificationsSeen(userId: number, seenAt: number): Promise<void>;
  // Calls onData with all the data every time something changes in Firestore (for example, a new follower or tweet).
  // Returns the function that stops listening.
  listen(onData: (data: DataSnapshot) => void): () => void;
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
  if (data.verified === true) user.verified = true;
  if (typeof data.notificationsSeenAt === 'number') user.notificationsSeenAt = data.notificationsSeenAt;
  return user;
};

const toTweet = (data: Tweet): Tweet => {
  const { id, userId, text, createdAt, imageUrl, replyToId } = data;
  return {
    id, userId, text, createdAt,
    ...(imageUrl ? { imageUrl } : {}),
    ...(typeof replyToId === 'number' ? { replyToId } : {}),
  };
};

const toReaction = (data: Reaction): Reaction => ({ userId: data.userId, tweetId: data.tweetId, createdAt: data.createdAt });

interface FollowData { followerId: number; followedId: number; createdAt?: number }

// Follows as the app uses them: the pairs and the moment of each one.
const toFollows = (docs: FollowData[]): Pick<DataSnapshot, 'follows' | 'followedAt'> => ({
  follows: docs.map((d) => [d.followerId, d.followedId] as [number, number]),
  followedAt: Object.fromEntries(docs.filter((d) => d.createdAt).map((d) => [`${d.followerId}_${d.followedId}`, d.createdAt as number])),
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
    const [users, follows, tweets, likes, reposts] = await Promise.all(
      ['users', 'follows', 'tweets', 'likes', 'reposts'].map((name) => f.getDocs(f.collection(db, name))),
    );
    return {
      users: users.docs.map((d) => toUser(d.data() as User)),
      ...toFollows(follows.docs.map((d) => d.data() as FollowData)),
      tweets: tweets.docs.map((d) => toTweet(d.data() as Tweet)),
      likes: likes.docs.map((d) => toReaction(d.data() as Reaction)),
      reposts: reposts.docs.map((d) => toReaction(d.data() as Reaction)),
    };
  },

  async updateProfile(userId, changes) {
    const { f, db } = await getDb();
    // Firestore does not accept undefined values.
    const data = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
    await f.updateDoc(f.doc(db, 'users', String(userId)), data);
  },

  async saveFollow(followerId, followedId, createdAt) {
    const { f, db } = await getDb();
    await f.setDoc(f.doc(db, 'follows', `${followerId}_${followedId}`), { followerId, followedId, createdAt });
  },

  async deleteFollow(followerId, followedId) {
    const { f, db } = await getDb();
    await f.deleteDoc(f.doc(db, 'follows', `${followerId}_${followedId}`));
  },

  async saveTweet(tweet) {
    const { f, db } = await getDb();
    await f.setDoc(f.doc(db, 'tweets', String(tweet.id)), tweet);
  },

  async saveLike(reaction) {
    const { f, db } = await getDb();
    await f.setDoc(f.doc(db, 'likes', `${reaction.userId}_${reaction.tweetId}`), reaction);
  },

  async deleteLike(userId, tweetId) {
    const { f, db } = await getDb();
    await f.deleteDoc(f.doc(db, 'likes', `${userId}_${tweetId}`));
  },

  async saveRepost(reaction) {
    const { f, db } = await getDb();
    await f.setDoc(f.doc(db, 'reposts', `${reaction.userId}_${reaction.tweetId}`), reaction);
  },

  async deleteRepost(userId, tweetId) {
    const { f, db } = await getDb();
    await f.deleteDoc(f.doc(db, 'reposts', `${userId}_${tweetId}`));
  },

  async saveNotificationsSeen(userId, seenAt) {
    const { f, db } = await getDb();
    await f.updateDoc(f.doc(db, 'users', String(userId)), { notificationsSeenAt: seenAt });
  },

  listen(onData) {
    let stopped = false;
    let stops: Array<() => void> = [];
    getDb().then(({ f, db }) => {
      if (stopped) return;
      const latest: { users?: User[]; follows?: FollowData[]; tweets?: Tweet[]; likes?: Reaction[]; reposts?: Reaction[] } = {};
      // Waits until the five collections have arrived once, then sends everything on each change.
      const send = () => {
        if (!latest.users || !latest.follows || !latest.tweets || !latest.likes || !latest.reposts) return;
        onData({ users: latest.users, ...toFollows(latest.follows), tweets: latest.tweets, likes: latest.likes, reposts: latest.reposts });
      };
      const onError = (error: unknown) => console.error('Lost the connection with Firestore', error);
      stops = [
        f.onSnapshot(f.collection(db, 'users'), (snap) => { latest.users = snap.docs.map((d) => toUser(d.data() as User)); send(); }, onError),
        f.onSnapshot(f.collection(db, 'follows'), (snap) => { latest.follows = snap.docs.map((d) => d.data() as FollowData); send(); }, onError),
        f.onSnapshot(f.collection(db, 'tweets'), (snap) => { latest.tweets = snap.docs.map((d) => toTweet(d.data() as Tweet)); send(); }, onError),
        f.onSnapshot(f.collection(db, 'likes'), (snap) => { latest.likes = snap.docs.map((d) => toReaction(d.data() as Reaction)); send(); }, onError),
        f.onSnapshot(f.collection(db, 'reposts'), (snap) => { latest.reposts = snap.docs.map((d) => toReaction(d.data() as Reaction)); send(); }, onError),
      ];
    }).catch((error) => console.error('Could not listen to Firestore', error));
    return () => {
      stopped = true;
      stops.forEach((stop) => stop());
    };
  },
};
