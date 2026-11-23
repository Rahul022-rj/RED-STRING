const base = "/api";

export async function fetchCases() {
  const r = await fetch(base + "/cases");
  return r.json();
}

export async function fetchCase(id) {
  const r = await fetch(base + "/cases/" + id);
  return r.json();
}

export async function fetchEvidence(id) {
  const r = await fetch(base + "/cases/" + id + "/evidence");
  return r.json();
}

export async function submitAccusation(payload) {
  const r = await fetch(base + "/game/accuse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return r.json();
}

export async function requestHint(caseId, level) {
  const r = await fetch(base + "/game/hint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caseId, level })
  });
  return r.json();
}

export async function submitScore(payload) {
  const r = await fetch(base + "/game/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return r.json();
}

export async function generateCase(payload) {
  const r = await fetch(base + "/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error("Generate failed: " + r.status);
  return r.json();
}

export async function deleteCustomCase(caseId) {
  const r = await fetch(base + "/generate/" + caseId, { method: "DELETE" });
  if (!r.ok) throw new Error("Delete failed: " + r.status);
  return r.json();
}
