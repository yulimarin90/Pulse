// Fills Firestore with sample users and tweets so the lists have enough rows to test the pagination.
//
// Usage:  npm run seed -- <username> [<username> ...] [--dry-run]
//
//  - creates 120 sample people (ids 3 to 122), 14 sample companies (ids 123 to 136) and 188 sample tweets
//    (the company tweets have a photo)
//    (the first names repeat, the last names do not: the Search page lists them as people to follow)
//  - for every username you pass (people who already registered in the app) it also creates
//    follows (with date): that person follows 43 sample users, 51 sample users follow that person, and
//    3 sample users mention that person in a tweet, and a sample tweet of that person gets 6 likes, 3 reposts
//    and 2 replies. They appear in the notifications.
//  - --dry-run only prints what would be written
//
// It uses the Firebase Admin SDK, so it ignores the security rules. It needs a service account key:
// save it as serviceAccountKey.json in the project root, or set GOOGLE_APPLICATION_CREDENTIALS.
import { readFileSync } from 'node:fs';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const FIRST_NAMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Hugo', 'Isabel', 'Jorge',
  'Karen', 'Luis', 'Marta', 'Nicolas', 'Olga', 'Pablo', 'Sofia', 'Tomas', 'Valeria', 'Camilo',
];
const LAST_NAMES = ['Gomez', 'Diaz', 'Mejia', 'Rios', 'Vargas', 'Lopez'];
const COMPANIES = [
  ['Metro de Medellín', 'metrodemedellin'], ['Isagen', 'isagen'], ['Bancolombia', 'bancolombia'], ['EPM', 'epm'],
  ['Grupo Éxito', 'grupoexito'], ['Avianca', 'avianca'], ['Ecopetrol', 'ecopetrol'], ['Grupo Nutresa', 'gruponutresa'],
  ['Postobón', 'postobon'], ['Alpina', 'alpina'], ['Davivienda', 'davivienda'], ['Juan Valdez Café', 'juanvaldezcafe'],
  ['Rappi', 'rappi_co'], ['Tecnológico de Antioquia', 'tecnologicodeantioquia'],
];
const BATCH_SIZE = 400;
const HOUR = 3600 * 1000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const usernames = args.filter((arg) => !arg.startsWith('--')).map((arg) => arg.replace(/^@/, '').toLowerCase());

const people = Array.from({ length: FIRST_NAMES.length * LAST_NAMES.length }, (_, i) => {
  const first = FIRST_NAMES[i % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length)];
  return {
    id: i + 3,
    fullName: `${first} ${last}`,
    username: `${first}${last}`.toLowerCase(),
    email: `${first}.${last}@example.com`.toLowerCase(),
  };
});
// Companies come after the people. They have no photo, so the app shows their initials.
const companies = COMPANIES.map(([fullName, username], i) => ({
  id: people.length + 3 + i,
  fullName,
  username,
  email: `${username}@example.com`,
  bio: 'Official account',
}));
const sampleUsers = [...people, ...companies];

const now = Date.now();
const sampleTweets = [
  ...Array.from({ length: 100 }, (_, i) => ({ id: i + 1, userId: 3 + (i % 8), text: `Sample tweet #${i + 1}`, createdAt: now - i * HOUR })),
  ...Array.from({ length: 60 }, (_, i) => ({ id: i + 101, userId: 30 + (i % 30), text: `Sample tweet #${i + 101}`, createdAt: now - (i + 100) * HOUR })),
];

// Small colored square used as the photo of the sample company tweets.
const samplePhoto = (color, label) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="320" height="320" fill="${color}"/><text x="160" y="190" font-size="110" font-family="Arial" font-weight="700" fill="#fff" text-anchor="middle">${label}</text></svg>`);
const COLORS = ['#0a7a3d', '#1d4ed8', '#b45309', '#7c3aed', '#be123c', '#0e7490', '#4d7c0f'];
// Two tweets with a photo for each company, so the notifications show how the photos look.
sampleTweets.push(...companies.flatMap((company, i) => [0, 1].map((k) => ({
  id: 200 + i * 2 + k,
  userId: company.id,
  text: k === 0 ? `Service update from ${company.fullName}. Thank you for traveling with us.` : `News from ${company.fullName}: we keep working for you.`,
  createdAt: now - (i * 2 + k) * 20 * 60_000,
  imageUrl: samplePhoto(COLORS[i % COLORS.length], company.fullName.charAt(0)),
}))));

const operations = [];
const set = (path, data) => operations.push({ path, data });

for (const user of sampleUsers) {
  set(`users/${user.id}`, { ...user, uid: `sample-${user.id}` });
  set(`usernames/${user.username}`, { uid: `sample-${user.id}`, email: user.email, userId: user.id });
}
for (const tweet of sampleTweets) set(`tweets/${tweet.id}`, tweet);

async function findUserId(db, username) {
  if (dryRun) return 1_000_000 + username.length;
  const snap = await db.doc(`usernames/${username}`).get();
  return snap.exists ? snap.data().userId : null;
}

const db = dryRun ? null : (() => {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? './serviceAccountKey.json';
  initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) });
  return getFirestore();
})();

for (const username of usernames) {
  const userId = await findUserId(db, username);
  if (userId === null) {
    console.warn(`@${username} is not registered in the app yet. Skipped.`);
    continue;
  }
  // Every follow has a date, so the notifications can say when somebody followed.
  for (let id = 3; id <= 45; id += 1) set(`follows/${userId}_${id}`, { followerId: userId, followedId: id, createdAt: now - id * 60_000 });
  for (let id = 30; id <= 80; id += 1) set(`follows/${id}_${userId}`, { followerId: id, followedId: userId, createdAt: now - (id - 29) * 15 * 60_000 });
  // Three people mention the user in a tweet.
  for (let k = 0; k < 3; k += 1) {
    set(`tweets/${1000 + usernames.indexOf(username) * 10 + k}`, { id: 1000 + usernames.indexOf(username) * 10 + k, userId: 3 + k, text: `Welcome to Pulse, @${username}! This is mention #${k + 1}.`, createdAt: now - (k + 1) * 7 * 60_000 });
  }
  // A tweet of the user with 6 likes, 3 reposts and 2 replies from sample users, to see those notifications.
  const own = 2000 + usernames.indexOf(username) * 10;
  set(`tweets/${own}`, { id: own, userId, text: 'My first sample tweet. Like it, repost it or reply to it!', createdAt: now - 3 * HOUR });
  for (let k = 0; k < 6; k += 1) set(`likes/${3 + k}_${own}`, { userId: 3 + k, tweetId: own, createdAt: now - (k + 1) * 5 * 60_000 });
  for (let k = 0; k < 3; k += 1) set(`reposts/${9 + k}_${own}`, { userId: 9 + k, tweetId: own, createdAt: now - (k + 1) * 9 * 60_000 });
  for (let k = 0; k < 2; k += 1) {
    const replyId = 3000 + usernames.indexOf(username) * 10 + k;
    set(`tweets/${replyId}`, { id: replyId, userId: 12 + k, text: `Great tweet! This is reply #${k + 1}.`, createdAt: now - (k + 1) * 11 * 60_000, replyToId: own });
  }
  console.log(`@${username}: follows 43 sample users, has 51 sample followers, 3 mentions, and a tweet with 6 likes, 3 reposts and 2 replies.`);
}

console.log(`${operations.length} documents (${people.length} people, ${companies.length} companies, ${sampleTweets.length} tweets, ${operations.filter((o) => o.path.startsWith('follows/')).length} follows, ${operations.filter((o) => o.path.startsWith('likes/')).length} likes, ${operations.filter((o) => o.path.startsWith('reposts/')).length} reposts).`);
if (dryRun) {
  console.log('Dry run: nothing was written.');
} else {
  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const batch = db.batch();
    for (const { path, data } of operations.slice(i, i + BATCH_SIZE)) batch.set(db.doc(path), data);
    await batch.commit();
  }
  console.log('Done. Sign in again to see the sample data.');
}
