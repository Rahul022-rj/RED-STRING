export default function ScoreBoard({ stats }) {
  return (
    <div className="scoreboard">
      <div className="score-item"><span className="score-val">{stats.total}</span><span className="score-lbl">Total Points</span></div>
      <div className="score-item"><span className="score-val">{stats.rank}</span><span className="score-lbl">Rank</span></div>
      <div className="score-item"><span className="score-val">{stats.evidenceCount}</span><span className="score-lbl">Evidence</span></div>
      <div className="score-item"><span className="score-val">{stats.connectionCount}</span><span className="score-lbl">Connections</span></div>
      <div className="score-item"><span className="score-val">{stats.hintsUsed}</span><span className="score-lbl">Hints Used</span></div>
    </div>
  );
}
