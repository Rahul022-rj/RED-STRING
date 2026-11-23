import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { submitAccusation, submitScore } from "../services/api.js";
import ScoreBoard from "../components/ScoreBoard.jsx";

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [culprit, setCulprit] = useState("");
  const [explanation, setExplanation] = useState("");
  const [supporting, setSupporting] = useState([]);
  const [result, setResult] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetch("/api/cases/" + id).then((r) => r.json()).then(setData);
  }, [id]);

  function toggleSupporting(evId) {
    if (supporting.includes(evId)) setSupporting(supporting.filter((x) => x !== evId));
    else setSupporting([...supporting, evId]);
  }

  async function submitAccusationHandler() {
    if (!culprit) {
      alert("Select a suspect to accuse.");
      return;
    }
    const res = await submitAccusation({
      caseId: id,
      culpritId: culprit,
      supportingEvidence: supporting,
      explanation
    });
    setResult(res);

    const saved = JSON.parse(localStorage.getItem("redstring-progress") || "{}");
    const prog = saved[id] || {};
    const scoreRes = await submitScore({
      correct: res.correct,
      evidenceCount: (prog.discovered || []).length,
      connectionCount: prog.connectionCount || 0,
      hintsUsed: prog.hintsUsed || 0
    });
    setScoreData({ ...scoreRes, timeTaken: Math.round((Date.now() - startTime) / 1000) });

    saved[id] = { ...prog, completed: true, correct: res.correct };
    localStorage.setItem("redstring-progress", JSON.stringify(saved));
  }

  function resetAndReplay() {
    const ok = window.confirm("Reset this case and start over? Evidence and board progress will be cleared.");
    if (!ok) return;

    const saved = JSON.parse(localStorage.getItem("redstring-progress") || "{}");
    delete saved[id];
    localStorage.setItem("redstring-progress", JSON.stringify(saved));
    localStorage.removeItem("redstring-board-" + id);

    navigate("/investigation/" + id);
  }

  if (!data) return <div className="page"><p>Loading...</p></div>;

  if (result) {
    const culpritObj = data.suspects.find((s) => s.id === result.solution.culprit);
    const prog = JSON.parse(localStorage.getItem("redstring-progress") || "{}")[id] || {};
    return (
      <div className="page">
        <h2 className="page-title">{result.correct ? "Accusation Correct" : "Wrong Accusation"}</h2>
        <p className={"verdict " + (result.correct ? "correct" : "wrong")}>
          {result.correct ? "You solved the case." : "Your accusation missed the mark."}
        </p>

        <div className="solution-block">
          <h3>The Real Culprit: {culpritObj?.name}</h3>
          <p><strong>Motive:</strong> {result.solution.motive}</p>
          <p><strong>Method:</strong> {result.solution.method}</p>
          <p><strong>Timeline:</strong> {result.solution.timeline}</p>
          <h4>Why the others were innocent:</h4>
          <ul>
            {Object.entries(result.solution.innocent).map(([sid, txt]) => {
              const s = data.suspects.find((x) => x.id === sid);
              return <li key={sid}><strong>{s?.name}:</strong> {txt}</li>;
            })}
          </ul>
        </div>

        {scoreData && (
          <ScoreBoard
            stats={{
              total: scoreData.total,
              rank: scoreData.rank,
              evidenceCount: (prog.discovered || []).length,
              connectionCount: prog.connectionCount || 0,
              hintsUsed: prog.hintsUsed || 0
            }}
          />
        )}

        <p className="muted">Time taken: {scoreData?.timeTaken}s</p>

        <div className="cta-row">
          <button className="btn btn-primary" onClick={resetAndReplay}>Reset & Replay This Case</button>
          <Link to="/cases" className="btn btn-ghost">Back to Cases</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h2 className="page-title">Make Your Accusation</h2>
      <p className="page-sub">Choose the culprit and the evidence that proves it.</p>

      <div className="accuse-block">
        <h3>Who is the culprit?</h3>
        <div className="suspect-select">
          {data.suspects.map((s) => (
            <label key={s.id} className={"suspect-radio" + (culprit === s.id ? " selected" : "")}>
              <input type="radio" name="culprit" value={s.id} checked={culprit === s.id} onChange={() => setCulprit(s.id)} />
              {s.name} <span className="role">({s.role})</span>
            </label>
          ))}
        </div>

        <h3>Supporting evidence</h3>
        <div className="evidence-select">
          {data.evidence.map((ev) => (
            <label key={ev.id} className={"ev-check" + (supporting.includes(ev.id) ? " selected" : "")}>
              <input type="checkbox" checked={supporting.includes(ev.id)} onChange={() => toggleSupporting(ev.id)} />
              {ev.title}
            </label>
          ))}
        </div>

        <h3>Your theory</h3>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain how you think the crime happened..."
          rows={5}
        />

        <div className="cta-row">
          <button className="btn btn-danger" onClick={submitAccusationHandler}>Submit Accusation</button>
          <button className="btn btn-ghost" onClick={resetAndReplay}>Reset Progress</button>
        </div>
      </div>
    </div>
  );
}
