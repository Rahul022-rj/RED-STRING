import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCases, deleteCustomCase } from "../services/api.js";
import { getAllProgress, getProfile, resetCase } from "../game/storage.js";
import { hoursFor } from "../game/rules.js";
import { toast } from "../game/events.js";
import { sfx } from "../game/sfx.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [progress, setProgress] = useState(getAllProgress);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [filter, setFilter] = useState("All");
  const me = getProfile();
  const records = me.cases;

  useEffect(load, []);

  function load() {
    fetchCases().then(setCases).catch((e) => setError(e.message));
  }

  function doReset(caseId) {
    resetCase(caseId);
    setProgress(getAllProgress());
    toast("Case reset", "The file is fresh. Your best score is kept.", "info", "↻");
  }

  async function doDelete(caseId) {
    try {
      await deleteCustomCase(caseId);
      resetCase(caseId);
      setProgress(getAllProgress());
      load();
      toast("Case shredded", "", "info", "🗑️");
    } catch (e) {
      toast("Delete failed", e.message, "danger", "⚠️");
    }
  }

  const shown = cases.filter((c) => filter === "All" || (filter === "Custom" ? c.custom : c.difficulty === filter));

  return (
    <div className="page">
      <h2 className="page-title">Case Archive</h2>
      <p className="page-sub">Pick a file. Harder cases give you fewer hours.</p>

      <div className="tabs">
        {["All", "Easy", "Medium", "Hard", "Custom"].map((f) => (
          <button key={f} className={"tab" + (filter === f ? " active" : "")} onClick={() => { sfx.click(); setFilter(f); }}>{f}</button>
        ))}
      </div>

      {error && <p className="error-text">Can't load cases: {error}</p>}

      <div className="case-grid">
        {shown.map((c) => {
          const p = progress[c.id] || {};
          const rec = records[c.id];
          const done = p.completed;
          const active = p.started && !done;
          const left = hoursFor(c.difficulty) - (p.hoursUsed || 0);
          return (
            <div key={c.id} className={"case-card" + (done ? " solved" : "") + (active ? " active" : "")}>
              <div className="case-number">
                {c.custom ? "CUSTOM CASE" : "CASE"} {c.number}
                {done && <span className={"case-state " + (p.result?.correct ? "ok" : "bad")}>{p.result?.correct ? "SOLVED" : "FAILED"}</span>}
                {active && <span className="case-state live">IN PROGRESS · {Math.max(0, left)}h</span>}
              </div>
              <h3>{c.title}</h3>
              <p className="case-loc">📍 {c.location}{c.author && <span className="author"> · by {c.author}</span>}</p>
              <p className="case-desc">{c.description}</p>
              <div className="case-meta">
                <span className={"difficulty " + c.difficulty.toLowerCase()}>{c.difficulty}</span>
                <span className="muted small">⏳ {hoursFor(c.difficulty)}h</span>
                <span className="case-stars" title="Best rating">
                  {[0, 1, 2].map((i) => <span key={i} className={i < (rec?.stars || 0) ? "on" : ""}>★</span>)}
                </span>
                {rec && <span className="muted small">Best {rec.best}</span>}
              </div>

              <div className="case-actions">
                <Link to={"/investigation/" + c.id} className="btn btn-primary" onClick={() => sfx.click()}>
                  {done ? "View File" : active ? "Continue" : "Investigate"}
                </Link>
                {(done || active) && (
                  <button className="btn btn-ghost btn-small" onClick={() => setConfirm({ kind: "reset", c })}>Reset</button>
                )}
                {c.custom && me.id && c.authorId === me.id && (
                  <button className="btn btn-danger btn-small" onClick={() => setConfirm({ kind: "delete", c })}>Delete</button>
                )}
              </div>
            </div>
          );
        })}
        <Link to="/generate" className="case-card new-case">
          <span className="big-icon">＋</span>
          <h3>Generate a new case</h3>
          <p className="muted">Build a fresh mystery from a theme.</p>
        </Link>
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.kind === "reset" ? "Reset " + confirm.c.title + "?" : "Delete " + confirm.c.title + "?"}
          body={confirm.kind === "reset" ? "Evidence, interrogations, and board will be cleared." : "This custom case will be permanently shredded."}
          confirmLabel={confirm.kind === "reset" ? "Reset" : "Delete"}
          danger
          onConfirm={() => { confirm.kind === "reset" ? doReset(confirm.c.id) : doDelete(confirm.c.id); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
