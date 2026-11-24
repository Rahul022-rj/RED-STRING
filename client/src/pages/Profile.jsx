import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, renameDetective, logout, setProfile } from "../game/storage.js";
import { changePassword, updateEmail, setToken } from "../services/api.js";
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

  const [mail, setMail] = useState({ email: p.email || "", password: "" });
  const [mailMsg, setMailMsg] = useState(null);
  const [mailBusy, setMailBusy] = useState(false);

  async function submitEmail(e) {
    e.preventDefault();
    setMailBusy(true);
    try {
      const res = await updateEmail(mail.email.trim(), mail.password);
      setProfile(res.profile);
      sfx.stamp();
      setMail({ email: res.profile.email || "", password: "" });
      setMailMsg({ ok: true, text: res.profile.email ? "Recovery email saved." : "Recovery email removed." });
    } catch (err) {
      sfx.deny();
      setMailMsg({ ok: false, text: err.message });
    }
    setMailBusy(false);
  }

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const [pwBusy, setPwBusy] = useState(false);

  async function submitPassword(e) {
    e.preventDefault();
    if (pw.next !== pw.confirm) return setPwMsg({ ok: false, text: "The new passwords don't match." });
    if (pw.next.length < 6) return setPwMsg({ ok: false, text: "The new password must be at least 6 characters." });
    setPwBusy(true);
    try {
      const res = await changePassword(pw.current, pw.next);
      if (res.token) setToken(res.token); // other devices are signed out, this one stays in
      sfx.stamp();
      setPw({ current: "", next: "", confirm: "" });
      setPwMsg({ ok: true, text: "Password changed. Your other devices have been signed out." });
    } catch (err) {
      sfx.deny();
      setPwMsg({ ok: false, text: err.message });
    }
    setPwBusy(false);
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

      <h3 className="section-title">Security</h3>
      <div className="security-grid">
      <form className="pw-form" onSubmit={submitEmail}>
        <strong>Recovery email</strong>
        <p className="muted small">
          {p.email ? "Used only to reset your password or remind you of your username. Never shown to other players." : "No recovery email yet. Without one, a forgotten password can't be reset."}
        </p>
        <label>
          <span className="field-label">Email</span>
          <input type="email" autoComplete="email" value={mail.email} maxLength={254}
            onChange={(e) => setMail({ ...mail, email: e.target.value })} placeholder="you@example.com" />
        </label>
        <label>
          <span className="field-label">Your password (to confirm)</span>
          <input type="password" autoComplete="current-password" value={mail.password}
            onChange={(e) => setMail({ ...mail, password: e.target.value })} required />
        </label>
        <button className="btn btn-primary" disabled={mailBusy}>{mailBusy ? "Saving..." : p.email ? "Update email" : "Add email"}</button>
        {mailMsg && <p className={mailMsg.ok ? "ok-text" : "error-text"}>{mailMsg.text}</p>}
      </form>
      <form className="pw-form" onSubmit={submitPassword}>
        <strong>Change password</strong>
        <label>
          <span className="field-label">Current password</span>
          <input type="password" autoComplete="current-password" value={pw.current}
            onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
        </label>
        <label>
          <span className="field-label">New password</span>
          <input type="password" autoComplete="new-password" minLength={6} value={pw.next}
            onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
        </label>
        <label>
          <span className="field-label">Repeat new password</span>
          <input type="password" autoComplete="new-password" minLength={6} value={pw.confirm}
            onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
        </label>
        <button className="btn btn-primary" disabled={pwBusy}>{pwBusy ? "Saving..." : "Change password"}</button>
        {pwMsg && <p className={pwMsg.ok ? "ok-text" : "error-text"}>{pwMsg.text}</p>}
      </form>
      </div>
    </div>
  );
}
