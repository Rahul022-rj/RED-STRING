// Tiny global event bus (toasts, profile refreshes).
const listeners = {};

export function on(evt, fn) {
  (listeners[evt] = listeners[evt] || new Set()).add(fn);
  return () => listeners[evt].delete(fn);
}

export function emit(evt, payload) {
  (listeners[evt] || []).forEach((fn) => fn(payload));
}

// kind: "info" | "success" | "danger" | "xp" | "achievement" | "level"
export function toast(title, body = "", kind = "info", icon = "") {
  emit("toast", { id: Date.now() + Math.random(), title, body, kind, icon });
}
