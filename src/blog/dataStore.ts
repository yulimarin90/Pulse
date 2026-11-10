// Local copy of the data stored in Firestore: users, follows and tweets.
// The screens read from here, so they are fast and never wait for the network.
// backend.ts fills it when a person signs in and saves in Firestore the changes made here (see subscribe).
import type { ProfileChanges, Tweet, TweetWithAuthor, User } from './types';

export const MAX_TWEET_LENGTH = 280;
export const MAX_NAME_LENGTH = 50;
export const MAX_BIO_LENGTH = 160;
export const MAX_LOCATION_LENGTH = 30;
export const MAX_WEBSITE_LENGTH = 100;

const users: User[] = [];
// [followerId, followedId]
const follows: Array<[number, number]> = [];
const tweets: Tweet[] = [];

export const normalizeUsername = (value: string): string => value.trim().toLowerCase().replace(/^@/, '');
export const normalizeEmail = (value: string): string => value.trim().toLowerCase();
export const USERNAME_PATTERN = /^[a-z0-9_]{1,30}$/;
export const USERNAME_FORMAT_MESSAGE = 'The username can only have letters, numbers and underscores (up to 30)';

// Unique id for new users and tweets. It is based on the time (plus a random part), so two browsers
// practically never create the same one, and it always grows inside one browser.
let lastId = 0;
export const newId = (): number => {
  lastId = Math.max(Date.now() * 1000 + Math.floor(Math.random() * 1000), lastId + 1);
  return lastId;
};

// Changes that must also be saved outside of this file (backend.ts saves them in Firestore).
export type StoreEvent =
  | { type: 'follow'; followerId: number; followedId: number }
  | { type: 'unfollow'; followerId: number; followedId: number }
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

// Throws a readable message when a profile change is not valid.
export function validateProfileChanges(changes: ProfileChanges): void {
  if (changes.fullName !== undefined) {
    if (!changes.fullName.trim()) throw new Error('The name cannot be empty');
    if (changes.fullName.length > MAX_NAME_LENGTH) throw new Error(`The name can have up to ${MAX_NAME_LENGTH} characters`);
  }
  if ((changes.bio ?? '').length > MAX_BIO_LENGTH) throw new Error(`The bio can have up to ${MAX_BIO_LENGTH} characters`);
  if ((changes.location ?? '').length > MAX_LOCATION_LENGTH) throw new Error(`The location can have up to ${MAX_LOCATION_LENGTH} characters`);
  if ((changes.website ?? '').length > MAX_WEBSITE_LENGTH) throw new Error(`The website can have up to ${MAX_WEBSITE_LENGTH} characters`);
  if (changes.birthDate && (!/^\d{4}-\d{2}-\d{2}$/.test(changes.birthDate) || changes.birthDate > new Date().toISOString().slice(0, 10))) {
    throw new Error('Enter a valid birth date');
  }
}

// Applies the changes to the local copy of the user and returns it. backend.ts saves them in Firestore first.
export function updateUser(userId: number, changes: ProfileChanges): User {
  validateProfileChanges(changes);
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error(`User ${userId} not found`);
  users[index] = { ...users[index], ...changes, ...(changes.fullName !== undefined ? { fullName: changes.fullName.trim() } : {}) };
  return users[index];
}

// The ids are created from the clock (see newId), so the registration date is inside the id.
// Returns null for an id that does not look like a date.
export function getJoinedAt(user: User): number | null {
  const joinedAt = Math.floor(user.id / 1000);
  return joinedAt > Date.UTC(2020, 0, 1) && joinedAt <= Date.now() + 86_400_000 ? joinedAt : null;
}

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

// People the user can still follow (not themselves, not followed yet) whose name or username contains the text.
// Lowercase and without accents, so "Medellín" and "medellin" are the same when searching.
const plain = (value: string): string => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function getUsersToFollow(userId: number, query = ''): User[] {
  const text = plain(query.trim()).replace(/^@/, '');
  return users
    .filter((u) => u.id !== userId && !isFollowing(userId, u.id))
    .filter((u) => !text || plain(u.fullName).includes(text) || u.username.includes(text))
    .sort(byFullName);
}

export function follow(followerId: number, followedId: number): void {
  if (followerId === followedId) return;
  if (isFollowing(followerId, followedId)) return;
  follows.push([followerId, followedId]);
  emit({ type: 'follow', followerId, followedId });
}

// Stops following a user. Does nothing when the user was not followed.
export function unfollow(followerId: number, followedId: number): void {
  const index = follows.findIndex(([follower, followed]) => follower === followerId && followed === followedId);
  if (index === -1) return;
  follows.splice(index, 1);
  emit({ type: 'unfollow', followerId, followedId });
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

// Follows a user typed by username. Throws when the user does not exist, is yourself or is already followed.
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
