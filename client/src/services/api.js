import { emit } from "../game/events.js";

// The website talks to its own server ("/api"). The mobile app is built with
// VITE_API_URL pointing at the live server, so both use the same database.
const base = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "redstring-token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

async function request(method, path, body, { keepalive = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = "Bearer " + token;

  let r;
  try {
    r = await fetch(base + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      keepalive
    });
  } catch {
    const e = new Error("Can't reach the server. Check your connection.");
    e.offline = true;
    throw e;
  }
  const data = await r.json().catch(() => ({}));
  if (r.status === 401 && token) {
    setToken(null);
    emit("logout");
  }
  if (!r.ok) {
    const e = new Error(data.error || "Request failed: " + r.status);
    e.status = r.status;
    throw e;
  }
  return data;
}

/* cases */
export const fetchCases = () => request("GET", "/cases");
export const fetchCase = (id) => request("GET", "/cases/" + id);
export const fetchEvidence = (id) => request("GET", "/cases/" + id + "/evidence");

/* game */
export const submitAccusation = (payload) => request("POST", "/game/accuse", payload);
export const requestHint = (caseId, level) => request("POST", "/game/hint", { caseId, level });
export const generateCase = (payload) => request("POST", "/generate", payload);
export const deleteCustomCase = (caseId) => request("DELETE", "/generate/" + caseId);

/* auth */
export const register = (username, password, displayName, email) => request("POST", "/auth/register", { username, password, displayName, email });
export const forgotPassword = (identifier) => request("POST", "/auth/forgot-password", { identifier });
export const forgotUsername = (email) => request("POST", "/auth/forgot-username", { email });
export const resetPassword = (token, password) => request("POST", "/auth/reset-password", { token, password });
export const updateEmail = (email, password) => request("PUT", "/me/email", { email, password });
export const login = (username, password) => request("POST", "/auth/login", { username, password });

/* player state */
export const fetchState = () => request("GET", "/me/state");
export const putProgress = (caseId, data) => request("PUT", "/me/progress/" + caseId, { data }, { keepalive: true });
export const putBoard = (caseId, board) => request("PUT", "/me/board/" + caseId, { board }, { keepalive: true });
export const deleteProgress = (caseId) => request("DELETE", "/me/progress/" + caseId);
export const putProfile = (patch) => request("PUT", "/me/profile", patch);
export const postEvent = (type) => request("POST", "/me/event", { type });
export const fetchLeaderboard = () => request("GET", "/leaderboard");
export const fetchCaseLeaderboard = (caseId) => request("GET", "/leaderboard/case/" + caseId);
export const changePassword = (current, next) => request("PUT", "/me/password", { current, next });
