// Player state lives in MongoDB. This module keeps an in-memory copy so the
// game can read it synchronously, and pushes changes to the server in the
// background (debounced). Only device settings stay in localStorage.
import { emit } from "./events.js";
import {
  fetchState, putProgress, putBoard, deleteProgress, putProfile, postEvent, setToken
} from "../services/api.js";

const SETTINGS_KEY = "redstring-settings";

const DEFAULT_PROFILE = {
  id: null,
  username: "",
  name: "",
  xp: 0,
  cases: {},
  achievements: {},
  stats: {
    accusations: 0, correct: 0, streak: 0, bestStreak: 0,
    breaks: 0, evidenceFound: 0, hintsUsed: 0, generated: 0
  }
};

let cache = { profile: null, progress: {}, boards: {} };

/* ---------- background sync ---------- */

const pending = new Map(); // key -> { timer, fn }
const inflight = new Set();

function schedule(key, fn, delay = 700) {
  const prev = pending.get(key);
  if (prev) clearTimeout(prev.timer);
  pending.set(key, { fn, timer: setTimeout(() => run(key), delay) });
}

function run(key) {
  const job = pending.get(key);
  if (!job) return Promise.resolve();
  pending.delete(key);
  clearTimeout(job.timer);
  const p = job.fn()
    .then(() => emit("sync", "saved"))
    .catch((e) => emit("sync", e.offline ? "offline" : "error"))
    .finally(() => inflight.delete(p));
  inflight.add(p);
  emit("sync", "saving");
  return p;
}

function cancel(key) {
  const job = pending.get(key);
  if (job) clearTimeout(job.timer);
  pending.delete(key);
}

// Push every queued change now and wait for all requests to finish.
export async function flush() {
  await Promise.all([...pending.keys()].map(run));
  await Promise.all([...inflight]);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => flush());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

/* ---------- session ---------- */

export async function hydrate() {
  const s = await fetchState();
  cache = { profile: s.profile, progress: s.progress || {}, boards: s.boards || {} };
  emit("profile", getProfile());
}

export function startSession(token, profile) {
  setToken(token);
  cache = { profile, progress: {}, boards: {} };
}

export async function logout({ flushFirst = true } = {}) {
  if (flushFirst) await flush().catch(() => {});
  pending.forEach((job) => clearTimeout(job.timer));
  pending.clear();
  cache = { profile: null, progress: {}, boards: {} };
  setToken(null);
  emit("profile", getProfile());
}

export const isLoggedIn = () => !!cache.profile;

/* ---------- per-case progress ---------- */

export function getAllProgress() {
  return { ...cache.progress };
}

export function getProgress(id) {
  return { ...(cache.progress[id] || {}) };
}

export function saveProgress(id, patch) {
  cache.progress[id] = { ...(cache.progress[id] || {}), ...patch };
  schedule("p:" + id, () => putProgress(id, cache.progress[id]));
  return { ...cache.progress[id] };
}

// Store a server-authored copy without sending it back.
export function setProgressLocal(id, data) {
  cancel("p:" + id);
  cache.progress[id] = { ...data };
}

export function resetCase(id) {
  cancel("p:" + id);
  cancel("b:" + id);
  delete cache.progress[id];
  delete cache.boards[id];
  return deleteProgress(id).catch(() => emit("sync", "error"));
}

/* ---------- board ---------- */

export function getBoard(id) {
  const b = cache.boards[id] || {};
  return { positions: { ...(b.positions || {}) }, connections: [...(b.connections || [])] };
}

export function saveBoard(id, board) {
  cache.boards[id] = board;
  schedule("b:" + id, () => putBoard(id, cache.boards[id]));
}

/* ---------- detective profile (server-authoritative) ---------- */

export function getProfile() {
  const p = cache.profile || {};
  return {
    ...DEFAULT_PROFILE,
    ...p,
    cases: { ...(p.cases || {}) },
    achievements: { ...(p.achievements || {}) },
    stats: { ...DEFAULT_PROFILE.stats, ...(p.stats || {}) }
  };
}

export function setProfile(profile) {
  if (!profile) return;
  cache.profile = profile;
  emit("profile", getProfile());
}

export async function renameDetective(name) {
  const res = await putProfile({ name });
  setProfile(res.profile);
  return res.profile;
}

// Tell the server about an in-game moment ("evidence", "break", "lawyered").
// Returns the ids of any achievements it unlocked.
export async function recordEvent(type) {
  try {
    const res = await postEvent(type);
    setProfile(res.profile);
    return res.unlocked || [];
  } catch {
    return [];
  }
}

/* ---------- device settings ---------- */

function readSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}

export function getSettings() {
  return { music: false, sfx: true, ...readSettings() };
}

export function saveSettings(patch) {
  const s = { ...getSettings(), ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
  emit("settings", s);
  return s;
}
