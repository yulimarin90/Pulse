// Pictures for the sample users and tweets of the seed. Everything is drawn here with code (no downloads), so the
// seed can write them in Firestore as small data URLs, the same way the app saves the photos of real users.
import { readFileSync } from 'node:fs';

// The same id always gives the same picture.
const random = (seed) => {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const pick = (rand, list) => list[Math.floor(rand() * list.length)];
const toDataUrl = (svg) => 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.replace(/\s+/g, ' ').trim());

const BACKGROUNDS = [['#fde68a', '#f59e0b'], ['#a5f3fc', '#0891b2'], ['#fbcfe8', '#db2777'], ['#bbf7d0', '#16a34a'], ['#ddd6fe', '#7c3aed'], ['#fecaca', '#dc2626'], ['#bfdbfe', '#2563eb'], ['#fed7aa', '#ea580c']];
const SKINS = ['#f5d0b5', '#e8b48f', '#c98d63', '#a56b43', '#7a4a2c', '#f8dcc4'];
const HAIRS = ['#1f1a17', '#3b2416', '#6b4423', '#a16a2a', '#d4a24c', '#8a8a8a', '#7c2d12'];
const SHIRTS = ['#1d4ed8', '#be123c', '#15803d', '#7c3aed', '#0e7490', '#b45309', '#334155', '#db2777'];

// Illustrated face of a sample person (256 x 256).
export function personAvatar(id) {
  const r = random(id);
  const [bg1, bg2] = pick(r, BACKGROUNDS);
  const skin = pick(r, SKINS);
  const hair = pick(r, HAIRS);
  const shirt = pick(r, SHIRTS);
  const style = Math.floor(r() * 4);
  const longHair = style === 1 || style === 2;
  return toDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs>
    <rect width="256" height="256" fill="url(#g)"/>
    ${longHair ? `<rect x="68" y="80" width="120" height="${style === 2 ? 150 : 110}" rx="50" fill="${hair}"/>` : ''}
    <path d="M28 256c0-52 44-80 100-80s100 28 100 80z" fill="${shirt}"/>
    <rect x="108" y="150" width="40" height="40" rx="16" fill="${skin}"/>
    <ellipse cx="128" cy="110" rx="48" ry="56" fill="${skin}"/>
    ${style === 3 ? `<circle cx="128" cy="50" r="20" fill="${hair}"/>` : ''}
    <path d="M78 104c-2-40 24-64 52-64s56 20 50 64c-10-22-30-32-52-32s-40 10-50 32z" fill="${hair}"/>
    <circle cx="108" cy="116" r="5" fill="#1f2937"/><circle cx="148" cy="116" r="5" fill="#1f2937"/>
    <path d="M110 140q18 16 36 0" stroke="#7f1d1d" stroke-width="5" fill="none" stroke-linecap="round"/>
  </svg>`);
}

const LOGO_COLORS = [['#0a7a3d', '#34d399'], ['#1d4ed8', '#60a5fa'], ['#b45309', '#fbbf24'], ['#7c3aed', '#c4b5fd'], ['#be123c', '#fb7185'], ['#0e7490', '#67e8f9'], ['#4d7c0f', '#bef264']];
const initialsOf = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// Round badge with the initials of a sample company (256 x 256). They are not the real logos.
export function companyAvatar(id, name) {
  const [c1, c2] = LOGO_COLORS[id % LOGO_COLORS.length];
  return toDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <rect width="256" height="256" fill="url(#g)"/>
    <circle cx="206" cy="48" r="70" fill="#fff" opacity="0.12"/><circle cx="30" cy="236" r="90" fill="#000" opacity="0.1"/>
    <text x="128" y="162" font-size="96" font-family="Arial, sans-serif" font-weight="700" fill="#fff" text-anchor="middle">${initialsOf(name)}</text>
  </svg>`);
}

// Wide banner of the profile (900 x 300): a gradient with soft waves.
export function banner(id) {
  const r = random(id * 7 + 1);
  const [a1, a2] = pick(r, BACKGROUNDS);
  const [b1] = pick(r, BACKGROUNDS);
  const waves = [0, 1, 2].map((k) => {
    const y = 150 + k * 50 + r() * 20;
    return `<path d="M0 ${y} C 200 ${y - 60 - r() * 40}, 400 ${y + 60 + r() * 40}, 600 ${y} S 820 ${y - 40}, 900 ${y - 10} V300 H0 Z" fill="#fff" opacity="${0.18 - k * 0.04}"/>`;
  }).join('');
  return toDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300" viewBox="0 0 900 300">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a2}"/><stop offset="1" stop-color="${b1}"/></linearGradient></defs>
    <rect width="900" height="300" fill="url(#g)"/>
    <circle cx="${120 + r() * 660}" cy="${40 + r() * 60}" r="${40 + r() * 30}" fill="${a1}" opacity="0.55"/>
    ${waves}
  </svg>`);
}

// Scenes for the photos of the tweets (640 x 400). There are 6 different ones.
const SCENES = [
  // sunset over the mountains
  (r) => `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#312e81"/><stop offset="0.55" stop-color="#f97316"/><stop offset="1" stop-color="#fde68a"/></linearGradient></defs>
    <rect width="640" height="400" fill="url(#s)"/><circle cx="${200 + r() * 240}" cy="230" r="55" fill="#fef3c7"/>
    <path d="M0 400V280l100-80 90 70 120-110 130 120 90-60 110 80v180z" fill="#1e1b4b"/><path d="M0 400V330l140-60 120 50 140-70 240 90v60z" fill="#0f172a"/>`,
  // city skyline at night
  (r) => `<rect width="640" height="400" fill="#0f172a"/><circle cx="520" cy="70" r="30" fill="#fef9c3"/>
    ${Array.from({ length: 14 }, (_, i) => { const h = 90 + r() * 200; return `<rect x="${i * 46}" y="${400 - h}" width="40" height="${h}" fill="${i % 2 ? '#1e293b' : '#334155'}"/>${Array.from({ length: Math.floor(h / 34) }, (_, j) => `<rect x="${i * 46 + 8}" y="${400 - h + 10 + j * 30}" width="8" height="12" fill="#fde047" opacity="${r() > 0.35 ? 0.9 : 0.2}"/><rect x="${i * 46 + 24}" y="${400 - h + 10 + j * 30}" width="8" height="12" fill="#fde047" opacity="${r() > 0.35 ? 0.9 : 0.2}"/>`).join('')}`; }).join('')}`,
  // sea and waves
  (r) => `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#e0f2fe"/></linearGradient></defs>
    <rect width="640" height="400" fill="url(#s)"/><circle cx="${100 + r() * 400}" cy="90" r="40" fill="#fde047"/>
    ${[0, 1, 2, 3].map((k) => `<path d="M0 ${200 + k * 45} q80 -40 160 0 t160 0 t160 0 t160 0 V400 H0 Z" fill="#0369a1" opacity="${0.35 + k * 0.17}"/>`).join('')}`,
  // green hills (coffee fields)
  (r) => `<rect width="640" height="400" fill="#bae6fd"/><circle cx="${420 + r() * 150}" cy="80" r="45" fill="#fde047"/>
    <path d="M0 400V230q160-110 320-20t320-40V400z" fill="#4ade80"/><path d="M0 400V300q200-100 400-10t240-20V400z" fill="#16a34a"/>
    ${Array.from({ length: 26 }, (_, i) => `<circle cx="${(i * 53) % 640}" cy="${320 + ((i * 37) % 70)}" r="9" fill="#15803d"/><circle cx="${(i * 53) % 640}" cy="${316 + ((i * 37) % 70)}" r="3" fill="#dc2626"/>`).join('')}`,
  // forest
  (r) => `<rect width="640" height="400" fill="#ecfccb"/>
    ${Array.from({ length: 12 }, (_, i) => { const x = 20 + i * 53; const h = 120 + r() * 120; return `<rect x="${x + 14}" y="${400 - 60}" width="12" height="60" fill="#78350f"/><path d="M${x} ${400 - 50}l${20} ${-h}l${20} ${h}z" fill="${i % 2 ? '#15803d' : '#166534'}"/>`; }).join('')}`,
  // abstract colored shapes
  (r) => `<defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f472b6"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs>
    <rect width="640" height="400" fill="url(#s)"/>
    ${Array.from({ length: 7 }, () => `<circle cx="${r() * 640}" cy="${r() * 400}" r="${30 + r() * 90}" fill="#fff" opacity="${0.12 + r() * 0.2}"/>`).join('')}`,
];

export function scenePhoto(index) {
  const r = random(index + 11);
  return toDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">${SCENES[index % SCENES.length](r)}</svg>`);
}

// Small animated GIFs (made once with a script, saved in sample-gifs.json).
const GIFS = JSON.parse(readFileSync(new URL('./sample-gifs.json', import.meta.url), 'utf8'));
export const sampleGif = (index) => GIFS[index % GIFS.length];
export const GIF_COUNT = GIFS.length;
