
import type { AppNotification, DirectMessage, ProfileChanges, Reaction, Tweet, TweetWithAuthor, User } from './types';

export const MAX_TWEET_LENGTH = 280;
export const MAX_NAME_LENGTH = 50;
export const MAX_BIO_LENGTH = 160;
export const MAX_LOCATION_LENGTH = 30;
export const MAX_WEBSITE_LENGTH = 100;
export const MAX_TWEET_IMAGE_LENGTH = 300_000;

const users: User[] = [];
// [followerId, followedId]
const follows: Array<[number, number]> = [];
let followedAt: Record<string, number> = {};
const tweets: Tweet[] = [];
const likes: Reaction[] = [];
const reposts: Reaction[] = [];
const bookmarks: Reaction[] = [];
const directMessages: DirectMessage[] = [];
export const MAX_MESSAGE_LENGTH = 1000;

// The screens that must show new data right away (notifications) listen to the changes of the local data.
let dataVersion = 0;
const dataListeners = new Set<() => void>();
const notifyChange = (): void => {
  dataVersion += 1;
  dataListeners.forEach((listener) => listener());
};
export function onDataChange(listener: () => void): () => void {
  dataListeners.add(listener);
  return () => dataListeners.delete(listener);
}
export const getDataVersion = (): number => dataVersion;

export const normalizeUsername = (value: string): string => value.trim().toLowerCase().replace(/^@/, '');
export const normalizeEmail = (value: string): string => value.trim().toLowerCase();
export const USERNAME_PATTERN = /^[a-z0-9_]{1,30}$/;
export const USERNAME_FORMAT_MESSAGE = 'The username can only have letters, numbers and underscores (up to 30)';

let lastId = 0;
export const newId = (): number => {
  lastId = Math.max(Date.now() * 1000 + Math.floor(Math.random() * 1000), lastId + 1);
  return lastId;
};

// Changes that must also be saved outside of this file (backend.ts saves them in Firestore).
export type StoreEvent =
  | { type: 'follow'; followerId: number; followedId: number; createdAt: number }
  | { type: 'unfollow'; followerId: number; followedId: number }
  | { type: 'tweet'; tweet: Tweet }
  | { type: 'like'; reaction: Reaction }
  | { type: 'unlike'; userId: number; tweetId: number }
  | { type: 'repost'; reaction: Reaction }
  | { type: 'unrepost'; userId: number; tweetId: number }
  | { type: 'bookmark'; reaction: Reaction }
  | { type: 'unbookmark'; userId: number; tweetId: number }
  | { type: 'directMessage'; message: DirectMessage }
  | { type: 'deleteDirectMessage'; messageId: number };

const listeners = new Set<(event: StoreEvent) => void>();
export function subscribe(listener: (event: StoreEvent) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const emit = (event: StoreEvent): void => listeners.forEach((listener) => listener(event));

export interface DataSnapshot {
  users: User[];
  follows: Array<[number, number]>;
  followedAt?: Record<string, number>;
  tweets: Tweet[];
  likes?: Reaction[];
  reposts?: Reaction[];
  bookmarks?: Reaction[];
  directMessages?: DirectMessage[];
}

// Replaces the local data with the data stored in Firestore. Follows, tweets and reactions of unknown users are ignored.
export function loadRemoteData(data: DataSnapshot): void {
  const ids = new Set(data.users.map((u) => u.id));
  users.splice(0, users.length, ...data.users);
  follows.splice(0, follows.length, ...data.follows.filter(([a, b]) => ids.has(a) && ids.has(b)));
  tweets.splice(0, tweets.length, ...data.tweets.filter((t) => ids.has(t.userId)));
  directMessages.splice(0, directMessages.length, ...(data.directMessages ?? []).filter((m) => ids.has(m.senderId) && ids.has(m.receiverId)));

  const tweetIds = new Set(tweets.map((t) => t.id));
  const known = (r: Reaction) => ids.has(r.userId) && tweetIds.has(r.tweetId);
  likes.splice(0, likes.length, ...(data.likes ?? []).filter(known));
  reposts.splice(0, reposts.length, ...(data.reposts ?? []).filter(known));
  bookmarks.splice(0, bookmarks.length, ...(data.bookmarks ?? []).filter(known));
  followedAt = { ...data.followedAt };
  notifyChange();
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
  notifyChange();
  return users[index];
}

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

export const isGiphyMediaUrl = (url: string): boolean => /^https:\/\/(media[0-9]*|i)\.giphy\.com\/[^\s]+$/.test(url);

// Converts the GIF link, or returns null if it is not a GIPHY link. Supports both
// the direct link (https://media.giphy.com/media/ID/giphy.gif) and the page link (https://giphy.com/gifs/name-ID).
export function parseGiphyLink(text: string): string | null {
  let url: URL;
  try {
    url = new URL(text.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (isGiphyMediaUrl(url.href)) return url.href;
  if (url.hostname !== 'giphy.com' && url.hostname !== 'www.giphy.com') return null;
  const [section, last] = url.pathname.split('/').filter(Boolean);
  if (section !== 'gifs' && section !== 'embed' && section !== 'stickers') return null;
  const id = (last ?? '').split('-').pop() ?? '';
  return /^[A-Za-z0-9]+$/.test(id) ? `https://media.giphy.com/media/${id}/giphy.gif` : null;
}

const isReply = (tweet: Tweet): boolean => tweet.replyToId !== undefined;

export const getTweets = (): TweetWithAuthor[] => tweets.filter((t) => !isReply(t)).sort(byNewest).map(withAuthor);

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

export function searchUsers(userId: number, query: string): User[] {
  const text = plain(query.trim()).replace(/^@/, '');
  return users
    .filter((u) => u.id !== userId)
    .filter((u) => plain(u.fullName).includes(text) || u.username.includes(text))
    .sort(byFullName);
}

export function follow(followerId: number, followedId: number): void {
  if (followerId === followedId) return;
  if (isFollowing(followerId, followedId)) return;
  const createdAt = Date.now();
  follows.push([followerId, followedId]);
  followedAt[`${followerId}_${followedId}`] = createdAt;
  emit({ type: 'follow', followerId, followedId, createdAt });
  notifyChange();
}

// Stops following a user. Does nothing when the user was not followed.
export function unfollow(followerId: number, followedId: number): void {
  const index = follows.findIndex(([follower, followed]) => follower === followerId && followed === followedId);
  if (index === -1) return;
  follows.splice(index, 1);
  delete followedAt[`${followerId}_${followedId}`];
  emit({ type: 'unfollow', followerId, followedId });
  notifyChange();
}

export const getTweetsByUser = (userId: number): TweetWithAuthor[] => tweets
  .filter((t) => t.userId === userId && !isReply(t)).sort(byNewest).map(withAuthor);

export function getFeed(userId: number): TweetWithAuthor[] {
  const ids = [userId, ...getFollowing(userId).map((u) => u.id)];
  return tweets.filter((t) => ids.includes(t.userId) && !isReply(t)).sort(byNewest).map(withAuthor);
}

function createTweet(userId: number, text: string, imageUrl?: string, replyToId?: number): void {
  if (!text.trim() && !imageUrl) throw new Error('Write something before posting');
  if (text.length > MAX_TWEET_LENGTH) throw new Error(`A tweet cannot exceed ${MAX_TWEET_LENGTH} characters`);
  if (imageUrl && imageUrl.length > MAX_TWEET_IMAGE_LENGTH) throw new Error('The photo is too big, choose another one');
  // The picture is a small photo saved as text (data:image/...) or the link of a GIF from GIPHY.
  if (imageUrl && !imageUrl.startsWith('data:image/') && !isGiphyMediaUrl(imageUrl)) throw new Error('That picture is not valid');
  const tweet: Tweet = {
    id: newId(), userId, text: text.trim(), createdAt: Date.now(),
    ...(imageUrl ? { imageUrl } : {}),
    ...(replyToId !== undefined ? { replyToId } : {}),
  };
  tweets.push(tweet);
  emit({ type: 'tweet', tweet });
  notifyChange();
}

// Throws when the tweet is empty (no text and no photo) or longer than MAX_TWEET_LENGTH characters.
export const addTweet = (userId: number, text: string, imageUrl?: string): void => createTweet(userId, text, imageUrl);

// A reply (comment) to a tweet. Same rules as a tweet; throws when the tweet does not exist.
export function addReply(userId: number, tweetId: number, text: string, imageUrl?: string): void {
  if (!tweets.some((t) => t.id === tweetId)) throw new Error('The tweet does not exist anymore');
  createTweet(userId, text, imageUrl, tweetId);
}

export const getTweetById = (tweetId: number): TweetWithAuthor | undefined => {
  const tweet = tweets.find((t) => t.id === tweetId);
  return tweet && withAuthor(tweet);
};

// Direct replies of a tweet, oldest first (as a conversation).
export const getReplies = (tweetId: number): TweetWithAuthor[] => tweets
  .filter((t) => t.replyToId === tweetId).sort((a, b) => a.createdAt - b.createdAt).map(withAuthor);
export const getReplyCount = (tweetId: number): number => tweets.filter((t) => t.replyToId === tweetId).length;

// ---------- Likes and reposts ----------

export const isLiked = (userId: number, tweetId: number): boolean => likes.some((l) => l.userId === userId && l.tweetId === tweetId);
export const isReposted = (userId: number, tweetId: number): boolean => reposts.some((r) => r.userId === userId && r.tweetId === tweetId);
export const getLikeCount = (tweetId: number): number => likes.filter((l) => l.tweetId === tweetId).length;
export const getRepostCount = (tweetId: number): number => reposts.filter((r) => r.tweetId === tweetId).length;

// Likes the tweet, or removes the like when it was already liked. Returns true when it is liked now.
export function toggleLike(userId: number, tweetId: number): boolean {
  if (!tweets.some((t) => t.id === tweetId)) throw new Error('The tweet does not exist anymore');
  const index = likes.findIndex((l) => l.userId === userId && l.tweetId === tweetId);
  if (index !== -1) {
    likes.splice(index, 1);
    emit({ type: 'unlike', userId, tweetId });
    notifyChange();
    return false;
  }
  const reaction: Reaction = { userId, tweetId, createdAt: Date.now() };
  likes.push(reaction);
  emit({ type: 'like', reaction });
  notifyChange();
  return true;
}

// Reposts the tweet, or removes the repost when it was already reposted. Returns true when it is reposted now.
export function toggleRepost(userId: number, tweetId: number): boolean {
  if (!tweets.some((t) => t.id === tweetId)) throw new Error('The tweet does not exist anymore');
  const index = reposts.findIndex((r) => r.userId === userId && r.tweetId === tweetId);
  if (index !== -1) {
    reposts.splice(index, 1);
    emit({ type: 'unrepost', userId, tweetId });
    notifyChange();
    return false;
  }
  const reaction: Reaction = { userId, tweetId, createdAt: Date.now() };
  reposts.push(reaction);
  emit({ type: 'repost', reaction });
  notifyChange();
  return true;
}

export const isBookmarked = (userId: number, tweetId: number): boolean => bookmarks.some((b) => b.userId === userId && b.tweetId === tweetId);

// Saves the tweet, or removes it from the saved tweets when it was already saved. Returns true when it is saved now.
export function toggleBookmark(userId: number, tweetId: number): boolean {
  if (!tweets.some((t) => t.id === tweetId)) throw new Error('The tweet does not exist anymore');
  const index = bookmarks.findIndex((b) => b.userId === userId && b.tweetId === tweetId);
  if (index !== -1) {
    bookmarks.splice(index, 1);
    emit({ type: 'unbookmark', userId, tweetId });
    notifyChange();
    return false;
  }
  const reaction: Reaction = { userId, tweetId, createdAt: Date.now() };
  bookmarks.push(reaction);
  emit({ type: 'bookmark', reaction });
  notifyChange();
  return true;
}

// The tweets the person saved, the last saved first.
export function getBookmarkedTweets(userId: number): TweetWithAuthor[] {
  return bookmarks
    .filter((b) => b.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .flatMap((b) => tweets.filter((t) => t.id === b.tweetId))
    .map(withAuthor);
}

// Profile tabs. Replies written by the user, tweets the user reposted (last repost first) and tweets with a photo.
export const getRepliesByUser = (userId: number): TweetWithAuthor[] => tweets
  .filter((t) => t.userId === userId && isReply(t)).sort(byNewest).map(withAuthor);

export function getRepostedTweets(userId: number): TweetWithAuthor[] {
  return reposts
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .flatMap((r) => tweets.filter((t) => t.id === r.tweetId))
    .map(withAuthor);
}

export const getMediaTweetsByUser = (userId: number): TweetWithAuthor[] => tweets
  .filter((t) => t.userId === userId && t.imageUrl).sort(byNewest).map(withAuthor);

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
  return tweets.filter((t) => ids.includes(t.userId) && !isReply(t)).sort(byNewest).map(withAuthor);
};

// Tweets written by the people the user follows / by the user's followers.
export const getFollowingTweets = (userId: number): TweetWithAuthor[] => tweetsOf(getFollowing(userId));
export const getFollowersTweets = (userId: number): TweetWithAuthor[] => tweetsOf(getFollowers(userId));

// ---------- Notifications ----------

// when the text mentions the username with an @ ("@ana", not "email@ana.com" or "@analia").
export const mentionsUsername = (text: string, username: string): boolean => new RegExp(`(^|[^a-z0-9_])@${username}(?![a-z0-9_])`, 'i').test(text);

export function getNotifications(userId: number): AppNotification[] {
  const me = getUserById(userId);
  if (!me) return [];
  const result: AppNotification[] = [];

  for (const [followerId, followedId] of follows) {
    const createdAt = followedAt[`${followerId}_${followedId}`];
    if (followedId === userId && createdAt) {
      result.push({ id: `follow-${followerId}`, kind: 'follow', createdAt, actor: requireUser(followerId) });
    }
  }

  const followingIds = new Set(getFollowing(userId).map((u) => u.id));
  for (const tweet of tweets) {
    if (tweet.userId === userId) continue;
    const parent = isReply(tweet) ? tweets.find((t) => t.id === tweet.replyToId) : undefined;
    const withAuthorTweet = withAuthor(tweet);
    if (parent && parent.userId === userId) {
      result.push({ id: `reply-${tweet.id}`, kind: 'reply', createdAt: tweet.createdAt, actor: withAuthorTweet.author, tweet: withAuthorTweet, target: withAuthor(parent) });
      continue;
    }
    const mention = mentionsUsername(tweet.text, me.username);
    if (!mention && (isReply(tweet) || !followingIds.has(tweet.userId))) continue;
    result.push({ id: `${mention ? 'mention' : 'tweet'}-${tweet.id}`, kind: mention ? 'mention' : 'tweet', createdAt: tweet.createdAt, actor: withAuthorTweet.author, tweet: withAuthorTweet });
  }

  const reactions: Array<[AppNotification['kind'], Reaction[]]> = [['like', likes], ['repost', reposts]];
  for (const [kind, list] of reactions) {
    for (const reaction of list) {
      const target = tweets.find((t) => t.id === reaction.tweetId);
      if (!target || target.userId !== userId || reaction.userId === userId) continue;
      result.push({ id: `${kind}-${reaction.userId}-${reaction.tweetId}`, kind, createdAt: reaction.createdAt, actor: requireUser(reaction.userId), target: withAuthor(target) });
    }
  }

  return result.sort((a, b) => b.createdAt - a.createdAt);
}

// Moment from which the notifications are unread: the last time they were opened, or when the user registered.
export const getNotificationsSeenAt = (user: User): number => user.notificationsSeenAt ?? getJoinedAt(user) ?? 0;

export function getUnreadNotificationCount(userId: number): number {
  const me = getUserById(userId);
  if (!me) return 0;
  const seenAt = getNotificationsSeenAt(me);
  return getNotifications(userId).filter((n) => n.createdAt > seenAt).length;
}

// Marks all the notifications as read (local copy) and returns the user. backend.ts saves it in Firestore.
// It is read up to now, or up to the newest notification if its date is later (the clock of another device can go ahead)
export function markNotificationsSeen(userId: number): User {
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error(`User ${userId} not found`);
  const newest = getNotifications(userId)[0]?.createdAt ?? 0;
  users[index] = { ...users[index], notificationsSeenAt: Math.max(Date.now(), newest) };
  notifyChange();
  return users[index];
}

// ---------- Private messages ----------

// Sends a message. Throws when it is empty, too long, for yourself or for a user that does not exist
export function sendDirectMessage(senderId: number, receiverId: number, text: string): DirectMessage {
  if (!text.trim()) throw new Error('Write a message before sending it');
  if (text.length > MAX_MESSAGE_LENGTH) throw new Error(`A message cannot exceed ${MAX_MESSAGE_LENGTH} characters`);
  if (senderId === receiverId) throw new Error('You cannot send a message to yourself');
  requireUser(receiverId);
  const message: DirectMessage = { id: newId(), senderId, receiverId, text: text.trim(), createdAt: Date.now() };
  directMessages.push(message);
  emit({ type: 'directMessage', message });
  notifyChange();
  return message;
}

// Deletes a message you sent (the other person does not see it anymore either). Throws when it is not yours
export function deleteDirectMessage(userId: number, messageId: number): void {
  const index = directMessages.findIndex((m) => m.id === messageId);
  if (index === -1) return;
  if (directMessages[index].senderId !== userId) throw new Error('You can only delete your own messages');
  directMessages.splice(index, 1);
  emit({ type: 'deleteDirectMessage', messageId });
  notifyChange();
}

// The messages between two people, oldest first
export function getConversation(userId1: number, userId2: number): DirectMessage[] {
  return directMessages
    .filter((m) => (m.senderId === userId1 && m.receiverId === userId2) || (m.senderId === userId2 && m.receiverId === userId1))
    .sort((a, b) => a.createdAt - b.createdAt);
}

// One row per person the user talked with, with the last message, the newest conversation first
export function getConversationsList(currentUserId: number): { user: User; lastMessage: DirectMessage }[] {
  const lastByPartner = new Map<number, DirectMessage>();
  for (const m of directMessages) {
    if (m.senderId !== currentUserId && m.receiverId !== currentUserId) continue;
    const partnerId = m.senderId === currentUserId ? m.receiverId : m.senderId;
    const existing = lastByPartner.get(partnerId);
    if (!existing || m.createdAt > existing.createdAt) lastByPartner.set(partnerId, m);
  }
  const list: { user: User; lastMessage: DirectMessage }[] = [];
  lastByPartner.forEach((lastMessage, partnerId) => {
    const user = getUserById(partnerId);
    if (user) list.push({ user, lastMessage });
  });
  return list.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);
}

// ---------- Unread messages ----------


interface ReadState { since: number; read: Record<string, number> }
const readStates = new Map<number, ReadState>();
const readStateKey = (userId: number): string => `pulse.messagesRead.${userId}`;

function saveReadState(userId: number, state: ReadState): void {
  readStates.set(userId, state);
  try {
    localStorage.setItem(readStateKey(userId), JSON.stringify(state));
  } catch {
    // Without localStorage the count still works until the page is reloaded.
  }
}

function getReadState(userId: number): ReadState {
  const known = readStates.get(userId);
  if (known) return known;
  try {
    const saved = JSON.parse(localStorage.getItem(readStateKey(userId)) ?? 'null');
    if (saved && typeof saved.since === 'number' && typeof saved.read === 'object') {
      readStates.set(userId, saved);
      return saved;
    }
  } catch {
    // Nothing saved, or localStorage is not available.
  }
  const fresh: ReadState = { since: Date.now(), read: {} };
  saveReadState(userId, fresh);
  return fresh;
}

// The people whose messages you have not opened yet.
function unreadPartners(userId: number): Set<number> {
  const state = getReadState(userId);
  const partners = new Set<number>();
  for (const m of directMessages) {
    if (m.receiverId === userId && m.createdAt > (state.read[m.senderId] ?? state.since)) partners.add(m.senderId);
  }
  return partners;
}

// Number of conversations with messages you have not read: the number on the messages icon.
export const getUnreadConversationCount = (userId: number): number => unreadPartners(userId).size;

export const hasUnreadMessages = (userId: number, partnerId: number): boolean => unreadPartners(userId).has(partnerId);

// Marks the conversation as read (up to now, or up to the newest message if its date is later).
export function markConversationRead(userId: number, partnerId: number): void {
  if (!unreadPartners(userId).has(partnerId)) return;
  const state = getReadState(userId);
  const newest = getConversation(userId, partnerId).at(-1)?.createdAt ?? 0;
  saveReadState(userId, { ...state, read: { ...state.read, [partnerId]: Math.max(Date.now(), newest) } });
  notifyChange();
}