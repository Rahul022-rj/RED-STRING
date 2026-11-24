import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, renameDetective, logout } from "../game/storage.js";
import { levelInfo, ACHIEVEMENTS } from "../game/rules.js";
import { on, toast } from "../game/events.js";
import { sfx } from "../game/sfx.js";

export default function Profile() {
  const navigate = useNavigate();
  const [p, setP] = useState(getProfile);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(p.name);

  useEffect(() => on("profile", setP), []);

  const lv = levelInfo(p.xp);
  const s = p.stats;
  const accuracy = s.accusations ? Math.round((s.correct / s.accusations) * 100) : 0;

  async function saveName(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await renameDetective(name.trim().slice(0, 24));
      sfx.stamp();
      setEditing(false);
    } catch (err) {
      toast("Rename failed", err.message, "danger", "⚠️");
    }
  }

  async function signOut() {
    sfx.click();
    await logout();
    navigate("/");
  }

  const stats = [
    ["Cases solved", s.correct],
    ["Accusations", s.accusations],
    ["Accuracy", accuracy + "%"],
    ["Best streak", s.bestStreak],
    ["Suspects broken", s.breaks],
    ["Evidence found", s.evidenceFound],
    ["Tips bought", s.hintsUsed],
    ["Cases generated", s.generated]
  ];

  return (
    <div className="page">
      <div className="badge-card">
        <div className="badge-shield">
          <span className="lvl-badge big">{lv.level}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="case-number">DETECTIVE ID</div>
          {editing ? (
            <form onSubmit={saveName} className="enlist-row">
              <input autoFocus maxLength={24} value={name} onChange={(e) => setName(e.target.value)} />
              <button className="btn btn-small btn-primary">Save</button>
            </form>
          ) : (
            <h2 className="page-title" onClick={() => setEditing(true)} title="Click to rename">
              {p.name || "Unnamed Detective"} <span className="edit-pen">✎</span>
            </h2>
          )}
          <p className="page-sub">@{p.username} · {lv.title} · {p.xp} XP total</p>
          <div className="xp-bar"><span style={{ width: (lv.into / lv.need) * 100 + "%" }} /></div>
          <p className="muted small">{lv.into} / {lv.need} XP to level {lv.level + 1}</p>
        </div>
        <button className="btn btn-ghost btn-small" onClick={signOut}>Log out</button>
      </div>

      <h3 className="section-title">Service Record</h3>
      <div className="scoreboard">
        {stats.map(([label, val]) => (
          <div key={label} className="score-item">
            <span className="score-val">{val}</span>
            <span className="score-lbl">{label}</span>
          </div>
        ))}
      </div>

      <h3 className="section-title">Achievements ({Object.keys(p.achievements).length}/{ACHIEVEMENTS.length})</h3>
      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const got = p.achievements[a.id];
          return (
            <div key={a.id} className={"ach" + (got ? " got" : "")}>
              <span className="ach-icon">{got ? a.icon : "🔒"}</span>
              <div>
                <strong>{a.name}</strong>
                <p>{a.desc}</p>
                {got && <small>{new Date(got).toLocaleDateString()}</small>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
