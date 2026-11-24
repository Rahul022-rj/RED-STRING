import { useEffect, useState } from "react";
import { fetchCaseLeaderboard } from "../services/api.js";
import { getProfile } from "../game/storage.js";

const MEDALS = ["🥇", "🥈", "🥉"];

// Top 10 best scores on a single case.
export default function CaseLeaderboard({ caseId, title = "Case hall of fame" }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const me = getProfile();

  useEffect(() => {
    setRows(null);
    fetchCaseLeaderboard(caseId).then((d) => setRows(d.rows)).catch((e) => setError(e.message));
  }, [caseId]);

  return (
    <div className="case-lb">
      <h3 className="section-title">{title}</h3>
      {error && <p className="error-text">{error}</p>}
      {!rows && !error && <p className="muted">Loading...</p>}
      {rows && rows.length === 0 && <p className="muted">Nobody has solved this case yet. Be the first.</p>}
      {rows && rows.length > 0 && (
        <div className="lb">
          {rows.map((r) => (
            <div key={r.id} className={"lb-row case-row" + (r.id === me.id ? " me" : "") + (r.rank <= 3 ? " top" : "")}>
              <span className="lb-rank">{MEDALS[r.rank - 1] || r.rank}</span>
              <span className="lb-name"><strong>{r.name}</strong><small>@{r.username}</small></span>
              <span className="case-stars">
                {[0, 1, 2].map((i) => <span key={i} className={i < r.stars ? "on" : ""}>★</span>)}
              </span>
              <span className="red">{r.best}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
