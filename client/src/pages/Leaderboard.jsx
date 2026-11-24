import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchLeaderboard, fetchCases } from "../services/api.js";
import { getProfile, isLoggedIn } from "../game/storage.js";
import CaseLeaderboard from "../components/CaseLeaderboard.jsx";
import { sfx } from "../game/sfx.js";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [board, setBoard] = useState(null);
  const [cases, setCases] = useState([]);
  const [view, setView] = useState("overall");
  const [error, setError] = useState("");
  const me = getProfile();

  useEffect(() => {
    const load = () => fetchLeaderboard().then(setBoard).catch((e) => setError(e.message));
    load();
    fetchCases().then(setCases).catch(() => {});
    const t = setInterval(load, 30000); // live-ish refresh
    return () => clearInterval(t);
  }, []);

  const selectedCase = cases.find((c) => c.id === view);

  return (
    <div className="page">
      <div className="case-number">HALL OF FAME</div>
      <h2 className="page-title">Leaderboard</h2>
      <p className="page-sub">
        {board ? board.players + " detective" + (board.players === 1 ? "" : "s") + " on the force." : "Loading the rankings..."}
        {board?.me && <> You're ranked <strong className="red">#{board.me.rank}</strong>.</>}
      </p>
      {error && <p className="error-text">{error}</p>}
      {!isLoggedIn() && <p className="muted"><Link to="/login?mode=register" className="link-btn">Create an account</Link> to get on the board.</p>}

      <div className="lb-views">
        <select value={view} onChange={(e) => { sfx.click(); setView(e.target.value); }} aria-label="Leaderboard view">
          <option value="overall">🏆 Overall (XP)</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>🗂️ Case {c.number}: {c.title}</option>
          ))}
        </select>
      </div>

      {view !== "overall" ? (
        <CaseLeaderboard caseId={view} title={selectedCase ? "Best scores: " + selectedCase.title : "Best scores"} />
      ) : (
        board && (
          <div className="lb">
            <div className="lb-row lb-head">
              <span>#</span><span>Detective</span><span>Level</span><span>XP</span><span>Solved</span><span>Accuracy</span><span>🏆</span>
            </div>
            {board.rows.map((r) => (
              <div key={r.id} className={"lb-row" + (r.id === me.id ? " me" : "") + (r.rank <= 3 ? " top" : "")}>
                <span className="lb-rank">{MEDALS[r.rank - 1] || r.rank}</span>
                <span className="lb-name"><strong>{r.name}</strong><small>@{r.username} · {r.title}</small></span>
                <span><span className="lvl-badge">{r.level}</span></span>
                <span className="red">{r.xp}</span>
                <span>{r.solved}</span>
                <span>{r.accuracy}%</span>
                <span>{r.achievements}</span>
              </div>
            ))}
            {board.rows.length === 0 && <p className="muted" style={{ padding: 20 }}>No detectives yet. Be the first.</p>}
          </div>
        )
      )}
    </div>
  );
}
