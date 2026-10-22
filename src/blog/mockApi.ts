import type { RegisterData, Tweet, TweetWithAuthor, User } from '../blog/types';


const NAMES = [
    'Ana Gomez', 'Bruno Diaz', 'Carla Mejia', 'Diego Rios', 'Elena Vargas', 'Felipe Soto',
    'Gabriela Luna', 'Hugo Castaño', 'Isabel Mora', 'Jorge Pardo', 'Karen Ospina', 
    'Luis Zapata', 'Maria Rendon', 'Nicolas Gil', 'Olga Cano', 'Pablo Uribe', 
    'Ramiro Duque', 'Sebastian Cardona', 'Tatiana Ruiz', 'Yuli Marin',
];

const users: User[] = [
  { id: 1, fullName: 'Juan Perez', username: 'juanp', email: 'juan@example.com' },
  ...NAMES.map((fullName, i) => ({
    id: i + 2,
    fullName,
    username: fullName.split(' ')[0].toLowerCase(),
    email: `user${i + 2}@example.com`,
  })),
];

//followers id
const follows: Array<[number, number]> =[];
for (let id = 2; id <= 12; id += 1) follows.push([1, id]); //user 1 follows 11 users
for (let id = 3; id <= 13; id += 1) follows.push([id, 1]); // 11 users follow user 1


//Create a list of test tweets, setting the count to 30 so that it displays pagination as 3 of 3
const tweets: Tweet[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  userId: (i % 2) + 1,
  text: `Mock tweet #${i + 1}`,
  createdAt: Date.now() - i * 3600 * 1000,
}));

const byFullName = (a: User, b: User) => a.fullName.localeCompare(b.fullName);
const byNewest = (a: Tweet, b: Tweet) => b.createdAt - a.createdAt;

export const getUserById = (id: number): User | undefined => users.find((u) => u.id === id);
export const getUserByUsername = (username: string): User | undefined => users.find((u) => u.username === username);

function requireUser(id: number): User {
    const user = getUserById(id);
    if (!user) throw new Error (`User ${id} not found`);
    return user;
}

const withAuthor = (tweet: Tweet): TweetWithAuthor => ({ ...tweet, author: requireUser(tweet.userId) });

// Any password is accepted for existing users while data is mocked
export const authenticate = (username: string): User | null => getUserByUsername(username.trim().toLowerCase()) ?? null;

export function registerUser ({ fullName, username, email }: RegisterData): User {
    const user: User = { id: users.length + 1, fullName, username, email };
    users.push(user);
    return user;
}

export const getFollowing = (userId: number): User[] => follows
.filter(([, followed]) => followed === userId)
.map(([followed]) => requireUser(followed))
.sort(byFullName);

export const getFollowers = (userId: number): User[] => follows
.filter(([, followed]) => followed === userId)
.map(([follower]) => requireUser(follower))
.sort(byFullName);

export const isFollowing = (followerId: number, followedId: number): boolean => follows
.some(([f, t]) => f  === followerId && t === followedId);

export function follow(followerId: number, followedId: number): void {
    if (!isFollowing(followerId, followedId)) follows.push([followerId, followedId]);
}

export const getTweetsByUser = (userId: number): TweetWithAuthor[] => tweets
.filter((t) => t.userId === userId).sort(byNewest).map(withAuthor);

export function getFeed(userId: number): TweetWithAuthor[] {
    const ids = [userId, ... getFollowing(userId).map((u) => u.id)];
    return tweets.filter((t) => ids.includes(t.userId)).sort(byNewest).map(withAuthor);
}

export function addTweet(userId: number, text: string): void {
    tweets.push({ id: tweets.length + 1, userId, text, createdAt: Date.now() });
}