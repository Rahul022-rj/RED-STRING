// Game rules shown on the client: time budgets, locations, levels, achievements, dialogue.
// Scoring, XP and unlocking happen on the server (server/services/progression.js).
import { toast } from "./events.js";
import { sfx } from "./sfx.js";

/* ---------- time ---------- */

export const HOURS = { Easy: 16, Medium: 13, Hard: 11 };
export const hoursFor = (difficulty) => HOURS[difficulty] || 13;
export const HINT_PENALTY = 100;
export const MAX_CITED = 4;
export const STRESS_LIMIT = 100;

/* ---------- crime scene ---------- */

export function locationOf(ev) {
  return String(ev.location || "Unknown").split(" - ")[0].trim();
}

export function groupByLocation(evidence) {
  const map = new Map();
  evidence.forEach((ev) => {
    const name = locationOf(ev);
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(ev);
  });
  return [...map.entries()].map(([name, items]) => ({ name, items }));
}

export function locationIcon(name) {
  const n = name.toLowerCase();
  if (/(radio)/.test(n)) return "📻";
  if (/(lamp|lighthouse)/.test(n)) return "💡";
  if (/(harbour|harbor|boat|dock|bridge)/.test(n)) return "⚓";
  if (/(box office|ticket)/.test(n)) return "🎟️";
  if (/(dressing|green room|wings|theatre|theater)/.test(n)) return "🎭";
  if (/(cottage)/.test(n)) return "🏠";
  if (/(security|footage|camera|cctv)/.test(n)) return "📹";
  if (/(server|terminal|digital|computer)/.test(n)) return "💻";
  if (/(office|desk|study)/.test(n)) return "🗄️";
  if (/(library)/.test(n)) return "📚";
  if (/(basement|fuse|cellar|engine)/.test(n)) return "🔦";
  if (/(locker|cloak|coat|rack)/.test(n)) return "🧥";
  if (/(quarters|room|cabin|suite|dorm)/.test(n)) return "🛏️";
  if (/(dining|kitchen|bar)/.test(n)) return "🍷";
  if (/(lab)/.test(n)) return "🧪";
  if (/(hall|lobby|foyer|stage|gallery)/.test(n)) return "🏛️";
  if (/(wing|corridor|deck|garden)/.test(n)) return "🚪";
  return "📍";
}

/* ---------- levels ---------- */

const TITLES = [
  "Rookie", "Patrol Officer", "Junior Detective", "Detective", "Senior Detective",
  "Inspector", "Chief Inspector", "Superintendent", "Living Legend"
];

export function levelInfo(xp) {
  let level = 1;
  let need = 400;
  let rem = Math.max(0, xp || 0);
  while (rem >= need) {
    rem -= need;
    level++;
    need = Math.round(need * 1.3);
  }
  return { level, into: rem, need, title: TITLES[Math.min(level - 1, TITLES.length - 1)] };
}

/* ---------- achievements ---------- */

export const ACHIEVEMENTS = [
  { id: "first_case", icon: "🗂️", name: "Case Closed", desc: "Solve your first case." },
  { id: "flawless", icon: "⭐", name: "Flawless", desc: "Earn 3 stars on a case." },
  { id: "pure_mind", icon: "🧠", name: "Pure Deduction", desc: "Solve a case without using any hints." },
  { id: "swift", icon: "⏱️", name: "Swift Justice", desc: "Solve a case with half your hours left." },
  { id: "thorough", icon: "🔍", name: "Leave No Stone", desc: "Uncover every piece of evidence in a case." },
  { id: "weaver", icon: "🧵", name: "String Theory", desc: "Accuse with 8+ strings on your board." },
  { id: "hard_boiled", icon: "🎩", name: "Hard Boiled", desc: "Solve a Hard case." },
  { id: "wrong_man", icon: "⚖️", name: "The Wrong Man", desc: "Accuse an innocent suspect." },
  { id: "breaker", icon: "💥", name: "Breaking Point", desc: "Break 5 suspects with evidence." },
  { id: "lawyered", icon: "🤐", name: "Lawyered Up", desc: "Push a suspect until they refuse to talk." },
  { id: "architect", icon: "🛠️", name: "Case Architect", desc: "Generate a custom case." },
  { id: "streak", icon: "🔥", name: "On a Roll", desc: "Solve 3 cases in a row." },
  { id: "veteran", icon: "🎖️", name: "Veteran", desc: "Solve 5 cases." }
];

// Achievements are granted by the server; this just celebrates the new ones.
export function announce(ids = []) {
  ids.forEach((id, i) => {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a) return;
    setTimeout(() => {
      sfx.achievement();
      toast("Achievement unlocked", a.name + " — " + a.desc, "achievement", a.icon);
    }, 300 + i * 700);
  });
}

/* ---------- interrogation dialogue ---------- */

const LINES = {
  alibi: [
    "I already told the officers everything. Fine — again.",
    "Write this down, detective, because I won't repeat it.",
    "Where was I? Somewhere I can prove.",
    "I have nothing to hide. Here's where I was."
  ],
  motive: [
    "Everyone in this building had a reason. Mine's no secret.",
    "You've been digging, haven't you?",
    "That's... a personal matter. But you'll find out anyway.",
    "Reasons? Sure. Doesn't make me guilty."
  ],
  crack: [
    "...Alright. Alright! You want the truth?",
    "Where did you get that?! ...Fine. Fine.",
    "That's not — it's not what it looks like.",
    "You weren't supposed to find that."
  ],
  deflect: [
    "I've never seen that before in my life.",
    "What does that have to do with me?",
    "You're grasping at straws, detective.",
    "Is that supposed to scare me?",
    "Interesting. Irrelevant, but interesting."
  ],
  stressed: [
    "I'm done answering your questions.",
    "Any further questions go through my lawyer."
  ]
};

export function line(kind) {
  const list = LINES[kind];
  return list[Math.floor(Math.random() * list.length)];
}
