
import type { Tweet, TweetWithAuthor, User } from './types';

export const MAX_TWEET_LENGTH = 280;

const users: User[] = [];
// [followerId, followedId]
const follows: Array<[number, number]> = [];
const tweets: Tweet[] = [];

export const normalizeUsername = (value: string): string => value.trim().toLowerCase().replace(/^@/, '');
export const normalizeEmail = (value: string): string => value.trim().toLowerCase();
export const USERNAME_PATTERN = /^[a-z0-9_]{1,30}$/;
export const USERNAME_FORMAT_MESSAGE = 'The username can only have letters, numbers and underscores (up to 30)';

let lastId = 0;
export const newId = (): number => {
  lastId = Math.max(Date.now() * 1000 + Math.floor(Math.random() * 1000), lastId + 1);
  return lastId;
};


export type StoreEvent =
  | { type: 'follow'; followerId: number; followedId: number }
  | { type: 'tweet'; tweet: Tweet };

const listeners = new Set<(event: StoreEvent) => void>();
export function subscribe(listener: (event: StoreEvent) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const emit = (event: StoreEvent): void => listeners.forEach((listener) => listener(event));

export interface DataSnapshot {
  users: User[];
  follows: Array<[number, number]>;
  tweets: Tweet[];
}

// Replaces the local data with the data stored in Firestore. Follows and tweets of unknown users are ignored.
export function loadRemoteData(data: DataSnapshot): void {
  const ids = new Set(data.users.map((u) => u.id));
  users.splice(0, users.length, ...data.users);
  follows.splice(0, follows.length, ...data.follows.filter(([a, b]) => ids.has(a) && ids.has(b)));
  tweets.splice(0, tweets.length, ...data.tweets.filter((t) => ids.has(t.userId)));
}

const byFullName = (a: User, b: User) => a.fullName.localeCompare(b.fullName);
const byNewest = (a: Tweet, b: Tweet) => b.createdAt - a.createdAt;

export const getUserById = (id: number): User | undefined => users.find((u) => u.id === id);
export const getUserByUsername = (username: string): User | undefined => users.find((u) => u.username === username);

function requireUser(id: number): User {
  const user = getUserById(id);
  if (!user) throw new Error(`User ${id} not found`);
  return user;
}

const withAuthor = (tweet: Tweet): TweetWithAuthor => ({ ...tweet, author: requireUser(tweet.userId) });

export const getTweets = (): TweetWithAuthor[] => [...tweets].sort(byNewest).map(withAuthor);

// Pairs are [followerId, followedId]: following filters by the first one, followers by the second.
export const getFollowing = (userId: number): User[] => follows
  .filter(([follower]) => follower === userId)
  .map(([, followed]) => requireUser(followed))
  .sort(byFullName);

export const getFollowers = (userId: number): User[] => follows
  .filter(([, followed]) => followed === userId)
  .map(([follower]) => requireUser(follower))
  .sort(byFullName);

export const isFollowing = (followerId: number, followedId: number): boolean => follows
  .some(([f, t]) => f === followerId && t === followedId);

export function follow(followerId: number, followedId: number): void {
  if (followerId === followedId) return;
  if (isFollowing(followerId, followedId)) return;
  follows.push([followerId, followedId]);
  emit({ type: 'follow', followerId, followedId });
}

export const getTweetsByUser = (userId: number): TweetWithAuthor[] => tweets
  .filter((t) => t.userId === userId).sort(byNewest).map(withAuthor);

export function getFeed(userId: number): TweetWithAuthor[] {
  const ids = [userId, ...getFollowing(userId).map((u) => u.id)];
  return tweets.filter((t) => ids.includes(t.userId)).sort(byNewest).map(withAuthor);
}

// Throws when the tweet is empty or longer than MAX_TWEET_LENGTH characters.
export function addTweet(userId: number, text: string): void {
  if (!text.trim()) throw new Error('Write something before posting');
  if (text.length > MAX_TWEET_LENGTH) throw new Error(`A tweet cannot exceed ${MAX_TWEET_LENGTH} characters`);
  const tweet: Tweet = { id: newId(), userId, text: text.trim(), createdAt: Date.now() };
  tweets.push(tweet);
  emit({ type: 'tweet', tweet });
}

// Follows a user typed by username. Throws when the user does not exist, is yourself or is already followed
export function followByUsername(followerId: number, username: string): User {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) throw new Error('Enter a username');
  const target = getUserByUsername(normalizedUsername);
  if (!target) throw new Error(`The user @${normalizedUsername} does not exist`);
  if (target.id === followerId) throw new Error('You cannot follow yourself');
  if (isFollowing(followerId, target.id)) throw new Error(`You already follow @${target.username}`);
  follow(followerId, target.id);
  return target;
}

const tweetsOf = (people: User[]): TweetWithAuthor[] => {
  const ids = people.map((u) => u.id);
  return tweets.filter((t) => ids.includes(t.userId)).sort(byNewest).map(withAuthor);
};

// Tweets written by the people the user follows / by the user's followers.
export const getFollowingTweets = (userId: number): TweetWithAuthor[] => tweetsOf(getFollowing(userId));
export const getFollowersTweets = (userId: number): TweetWithAuthor[] => tweetsOf(getFollowers(userId));
