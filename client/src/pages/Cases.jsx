import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteCustomCase } from "../services/api.js";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    loadCases();
    setProgress(JSON.parse(localStorage.getItem("redstring-progress") || "{}"));
  }, []);

  function loadCases() {
    fetch("/api/cases").then((r) => r.json()).then(setCases);
  }

  function resetCase(caseId) {
    const ok = window.confirm("Reset this case? Your evidence, connections, and score for this case will be cleared.");
    if (!ok) return;

    const saved = JSON.parse(localStorage.getItem("redstring-progress") || "{}");
    delete saved[caseId];
    localStorage.setItem("redstring-progress", JSON.stringify(saved));
    localStorage.removeItem("redstring-board-" + caseId);

    setProgress(saved);
  }

  async function deleteCase(caseId) {
    const ok = window.confirm("DELETE this custom case permanently? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteCustomCase(caseId);
      // Clear local progress
      const saved = JSON.parse(localStorage.getItem("redstring-progress") || "{}");
      delete saved[caseId];
      localStorage.setItem("redstring-progress", JSON.stringify(saved));
      localStorage.removeItem("redstring-board-" + caseId);

      loadCases(); // refresh the list
    } catch (err) {
      alert("Failed to delete case. Check the server terminal.");
    }
  }

  return (
    <div className="page">
      <h2 className="page-title">Case Archive</h2>
      <p className="page-sub">Select a mystery to investigate, or generate a new one.</p>
      <div className="case-grid">
        {cases.map((c) => {
          const done = progress[c.id]?.completed;
          return (
            <div key={c.id} className={"case-card" + (done ? " solved" : "")}>
              <div className="case-number">
                {c.custom ? "CUSTOM CASE" : "CASE"} {c.number}{done ? " • SOLVED" : ""}
              </div>
              <h3>{c.title}</h3>
              <p className="case-loc">{c.location}</p>
              <p className="case-desc">{c.description}</p>
              <div className="case-meta">
                <span className={"difficulty " + c.difficulty.toLowerCase()}>{c.difficulty}</span>
              </div>
              
              <div className="case-actions" style={{ flexWrap: "wrap" }}>
                <Link to={"/investigation/" + c.id} className="btn btn-primary" style={{ minWidth: "120px" }}>
                  {done ? "Replay Case" : "Investigate"}
                </Link>
                
                {done && (
                  <button className="btn btn-ghost btn-small" onClick={() => resetCase(c.id)}>
                    Reset
                  </button>
                )}

                {c.custom && (
                  <button className="btn btn-danger btn-small" onClick={() => deleteCase(c.id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
