// Server-side rules for scoring, XP, levels and achievements.
// The client keeps a copy of levelInfo/ACHIEVEMENTS for display only.

const HOURS = { Easy: 16, Medium: 13, Hard: 11 };
const MAX_CITED = 4;

const RANKS = [
  [1100, "Legendary Detective"],
  [850, "Master Detective"],
  [650, "Inspector"],
  [400, "Investigator"],
  [150, "Observer"],
  [0, "Rookie"]
];

const TITLES = [
  "Rookie", "Patrol Officer", "Junior Detective", "Detective", "Senior Detective",
  "Inspector", "Chief Inspector", "Superintendent", "Living Legend"
];

const ACHIEVEMENT_IDS = [
  "first_case", "flawless", "pure_mind", "swift", "thorough", "weaver", "hard_boiled",
  "wrong_man", "breaker", "lawyered", "architect", "streak", "veteran"
];

function levelInfo(xp) {
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

// A board string is "solid" if it ties evidence to the suspect it implicates,
// links two pieces of key evidence, or links key evidence to the real culprit.
function isSolid(conn, c) {
  const sol = c._solution;
  const key = sol.keyEvidence || [];
  const ev = (id) => c.evidence.find((e) => e.id === id);
  const sus = (id) => c.suspects.some((s) => s.id === id);
  const { a, b } = conn;
  if (ev(a) && sus(b)) return ev(a).relatedSuspect === b || (key.includes(a) && b === sol.culprit);
  if (ev(b) && sus(a)) return ev(b).relatedSuspect === a || (key.includes(b) && a === sol.culprit);
  if (ev(a) && ev(b)) return key.includes(a) && key.includes(b);
  return false;
}

function scoreAccusation(c, { culpritId, cited, discovered, connections, hintsUsed, hoursLeft }) {
  const sol = c._solution;
  const key = sol.keyEvidence || [];
  const correct = sol.culprit === culpritId;
  const keyFound = cited.filter((id) => key.includes(id)).length;
  const wrongCited = cited.length - keyFound;
  const strongConnections = connections.filter((x) => isSolid(x, c)).length;

  const breakdown = [];
  const add = (label, points) => points && breakdown.push({ label, points });
  add("Culprit identified", correct ? 500 : 0);
  add("Key evidence cited ×" + keyFound, keyFound * 100);
  add("Irrelevant evidence ×" + wrongCited, wrongCited * -40);
  add("Evidence uncovered ×" + discovered.length, discovered.length * 10);
  add("Solid board strings ×" + Math.min(strongConnections, 8), Math.min(strongConnections, 8) * 25);
  add("Time bonus (" + hoursLeft + "h left)", correct ? hoursLeft * 20 : 0);
  add("Informant tips ×" + hintsUsed, hintsUsed * -100);

  let total = breakdown.reduce((sum, b) => sum + b.points, 0);
  if (!correct) {
    const penalty = Math.round(Math.max(total, 0) * 0.75);
    add("Wrong suspect", -penalty);
    total -= penalty;
  }
  total = Math.max(0, total);

  let stars = 0;
  if (correct) {
    stars = 1;
    if (keyFound >= key.length) stars = 2;
    if (stars === 2 && hintsUsed === 0) stars = 3;
  }

  return {
    correct,
    score: total,
    stars,
    rank: RANKS.find(([min]) => total >= min)[1],
    breakdown,
    keyFound,
    keyTotal: key.length,
    strongConnections,
    solution: {
      culprit: sol.culprit,
      motive: sol.motive,
      method: sol.method,
      timeline: sol.timeline,
      keyEvidence: sol.keyEvidence,
      innocent: sol.innocent
    }
  };
}

// Adds an achievement to a user doc if not already unlocked. Returns true if new.
function grant(user, id) {
  if (!ACHIEVEMENT_IDS.includes(id)) return false;
  const ach = user.achievements || {};
  if (ach[id]) return false;
  user.achievements = { ...ach, [id]: new Date().toISOString() };
  user.markModified("achievements");
  return true;
}

// Applies an accusation result to the user: XP, stats, case record, achievements.
function applyAccusation(user, { caseId, result, difficulty, hintsUsed, hoursLeft, hoursTotal, discovered, totalEvidence, connections }) {
  const before = levelInfo(user.xp);
  const cases = { ...(user.cases || {}) };
  const record = cases[caseId] || { best: 0, stars: 0, solves: 0, attempts: 0 };
  const firstSolve = result.correct && record.solves === 0;
  const xpGained = result.correct
    ? (firstSolve ? result.score : Math.round(result.score * 0.25))
    : Math.round(result.score * 0.5);

  record.attempts += 1;
  if (result.correct) record.solves += 1;
  record.best = Math.max(record.best, result.score);
  record.stars = Math.max(record.stars, result.stars);
  cases[caseId] = record;
  user.cases = cases;
  user.markModified("cases");

  user.xp += xpGained;
  const s = user.stats;
  s.accusations += 1;
  if (result.correct) {
    s.correct += 1;
    s.streak += 1;
    s.bestStreak = Math.max(s.bestStreak, s.streak);
  } else {
    s.streak = 0;
  }

  const unlocked = [];
  const check = (id, cond) => cond && grant(user, id) && unlocked.push(id);
  check("first_case", result.correct);
  check("flawless", result.stars >= 3);
  check("pure_mind", result.correct && hintsUsed === 0);
  check("swift", result.correct && hoursLeft >= hoursTotal / 2);
  check("thorough", discovered >= totalEvidence);
  check("weaver", connections >= 8);
  check("hard_boiled", result.correct && difficulty === "Hard");
  check("wrong_man", !result.correct);
  check("streak", s.streak >= 3);
  check("veteran", s.correct >= 5);

  const after = levelInfo(user.xp);
  return {
    reward: { xpGained, firstSolve, before, after, leveledUp: after.level > before.level },
    unlocked
  };
}

module.exports = { HOURS, MAX_CITED, levelInfo, scoreAccusation, applyAccusation, grant };
