import type { RegisterData, Tweet, TweetWithAuthor, User } from '../blog/types';

const FIRST_NAMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Hugo', 'Isabel', 'Jorge',
  'Karen', 'Luis', 'Marta', 'Nicolas', 'Olga', 'Pablo', 'Sofia', 'Tomas', 'Valeria', 'Camilo',
];
const LAST_NAMES = ['Gomez', 'Diaz', 'Mejia', 'Rios', 'Vargas'];

// 100 users: Sebastian (1), Yuli (2) and 98 generated (20 first names x 5 last names, all unique).
const users: User[] = [
  { id: 1, fullName: 'Sebastian Cardona', username: 'sebastianc', email: 'sebastian.cardona@example.com' },
  { id: 2, fullName: 'Yuli Marin', username: 'yulim', email: 'yuli.marin@example.com' },
  ...Array.from({ length: 98 }, (_, i) => {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length)];
    return {
      id: i + 3,
      fullName: `${first} ${last}`,
      username: `${first}${last}`.toLowerCase(),
      email: `${first}.${last}@example.com`.toLowerCase(),
    };
  }),
];

// [followerId, followedId]
const follows: Array<[number, number]> = [];
for (const me of [1, 2]) {
  for (let id = 3; id <= 45; id += 1) follows.push([me, id]); // follows 43 users
  for (let id = 30; id <= 80; id += 1) follows.push([id, me]); // 51 followers
}
follows.push([1, 2], [2, 1]); // Sebastian and Yuli follow each other

// 100 tweets spread across users 1 to 8.
const tweets: Tweet[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  userId: (i % 8) + 1,
  text: `Mock tweet #${i + 1}`,
  createdAt: Date.now() - i * 3600 * 1000,
}));

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

// Any password is accepted for existing users while data is mocked.
export const authenticate = (username: string): User | null => getUserByUsername(username.trim().toLowerCase()) ?? null;

export function registerUser({ fullName, username, email }: RegisterData): User {
  const user: User = { id: users.length + 1, fullName, username, email };
  users.push(user);
  return user;
}

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
  if (!isFollowing(followerId, followedId)) follows.push([followerId, followedId]);
}

export const getTweetsByUser = (userId: number): TweetWithAuthor[] => tweets
  .filter((t) => t.userId === userId).sort(byNewest).map(withAuthor);

export function getFeed(userId: number): TweetWithAuthor[] {
  const ids = [userId, ...getFollowing(userId).map((u) => u.id)];
  return tweets.filter((t) => ids.includes(t.userId)).sort(byNewest).map(withAuthor);
}

export function addTweet(userId: number, text: string): void {
  tweets.push({ id: tweets.length + 1, userId, text, createdAt: Date.now() });
}