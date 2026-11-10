// Fills Firestore with sample users and tweets so the lists have enough rows to test the pagination.
//
// Usage:  npm run seed -- <username> [<username> ...] [--dry-run]
//
//  - creates 120 sample people (ids 3 to 122), 14 sample companies (ids 123 to 136) and 160 sample tweets
//    (the first names repeat, the last names do not: the Search page lists them as people to follow)
//  - for every username you pass (people who already registered in the app) it also creates
//    follows: that person follows 43 sample users and 51 sample users follow that person
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
  ['Metro de Medellin', 'metrodemedellin'], ['Isagen', 'isagen'], ['Bancolombia', 'bancolombia'], ['EPM', 'epm'],
  ['Grupo Exito', 'grupoexito'], ['Avianca', 'avianca'], ['Ecopetrol', 'ecopetrol'], ['Grupo Nutresa', 'gruponutresa'],
  ['Postobon', 'postobon'], ['Alpina', 'alpina'], ['Davivienda', 'davivienda'], ['Juan Valdez Cafe', 'juanvaldezcafe'],
  ['Rappi', 'rappi_co'], ['Tecnologico de Antioquia', 'tecnologicodeantioquia'],
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
  for (let id = 3; id <= 45; id += 1) set(`follows/${userId}_${id}`, { followerId: userId, followedId: id });
  for (let id = 30; id <= 80; id += 1) set(`follows/${id}_${userId}`, { followerId: id, followedId: userId });
  console.log(`@${username}: follows 43 sample users and has 51 sample followers.`);
}

console.log(`${operations.length} documents (${people.length} people, ${companies.length} companies, ${sampleTweets.length} tweets, ${operations.filter((o) => o.path.startsWith('follows/')).length} follows).`);
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
