import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchCase, submitAccusation } from "../services/api.js";
import { getProgress, resetCase, flush, setProfile, setProgressLocal } from "../game/storage.js";
import { announce, MAX_CITED } from "../game/rules.js";
import { sfx } from "../game/sfx.js";
import { toast } from "../game/events.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import CaseLeaderboard from "../components/CaseLeaderboard.jsx";

export default function Results() {
  const { id } = useParams();
  return <Courtroom key={id} id={id} />;
}

function Courtroom({ id }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [prog, setProg] = useState(() => getProgress(id));
  const [culprit, setCulprit] = useState("");
  const [cited, setCited] = useState([]);
  const [theory, setTheory] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    fetchCase(id).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="page center-page"><h2 className="page-title">Case file missing</h2><p className="page-sub">{error}</p></div>;
  if (!data) return <div className="page center-page"><div className="loader" /></div>;

  if (!prog.started) {
    return (
      <div className="page center-page">
        <h2 className="page-title">No investigation yet</h2>
        <p className="page-sub">You can't accuse anyone before you've taken the case.</p>
        <Link to={"/investigation/" + id} className="btn btn-primary">Open case file</Link>
      </div>
    );
  }

  if (prog.completed && prog.result) {
    return (
      <Report
        data={data}
        result={prog.result}
        reward={prog.reward}
        animate={animate}
        onReplay={() => { resetCase(id); navigate("/investigation/" + id); }}
      />
    );
  }

  const discovered = prog.discovered || [];
  const evidence = data.evidence.filter((e) => discovered.includes(e.id));

  function toggleCite(evId) {
    sfx.click();
    if (cited.includes(evId)) setCited(cited.filter((x) => x !== evId));
    else if (cited.length < MAX_CITED) setCited([...cited, evId]);
    else toast("Evidence limit", "You can cite at most " + MAX_CITED + " pieces of evidence.", "danger", "📎");
  }

  async function submit() {
    setConfirming(false);
    setSubmitting(true);
    try {
      // Make sure the server has our latest evidence, hours and board first:
      // the score is computed from what's stored there.
      await flush();
      const res = await submitAccusation({ caseId: id, culpritId: culprit, supportingEvidence: cited, theory });
      setProfile(res.profile);
      setProgressLocal(id, res.progress);
      announce(res.unlocked);
      setAnimate(true);
      setProg(res.progress);
    } catch (e) {
      toast("Accusation failed", e.message, "danger", "⚠️");
    }
    setSubmitting(false);
  }

  const accused = data.suspects.find((s) => s.id === culprit);

  return (
    <div className="page">
      <div className="case-number">CASE {data.number} · THE ACCUSATION</div>
      <h2 className="page-title">Name the culprit</h2>
      <p className="page-sub">One shot. Choose who did it and cite up to {MAX_CITED} pieces of evidence that prove it. Irrelevant evidence costs points.</p>

      <div className="accuse-block">
        <h3>1 · Who did it?</h3>
        <div className="accuse-suspects">
          {data.suspects.map((s) => (
            <button
              key={s.id}
              className={"accuse-suspect" + (culprit === s.id ? " selected" : "")}
              onClick={() => { sfx.pin(); setCulprit(s.id); }}
            >
              <div className="avatar">{s.avatar}</div>
              <strong>{s.name}</strong>
              <span className="role">{s.role}</span>
              {(prog.marks || {})[s.id] > 0 && <span className="your-mark">{"●".repeat(prog.marks[s.id])}</span>}
            </button>
          ))}
        </div>

        <h3>2 · Cite your evidence <span className="muted">({cited.length}/{MAX_CITED})</span></h3>
        {evidence.length === 0 ? (
          <p className="muted">You found no evidence. You'll be accusing on instinct alone.</p>
        ) : (
          <div className="evidence-select">
            {evidence.map((ev) => (
              <label key={ev.id} className={"ev-check" + (cited.includes(ev.id) ? " selected" : "")}>
                <input type="checkbox" checked={cited.includes(ev.id)} onChange={() => toggleCite(ev.id)} />
                <span className="ev-cat">{ev.category}</span> {ev.title}
              </label>
            ))}
          </div>
        )}

        <h3>3 · Your theory <span className="muted">(optional)</span></h3>
        <textarea value={theory} onChange={(e) => setTheory(e.target.value)} placeholder="Explain how it happened..." rows={4} />

        <div className="cta-row">
          <Link to={"/investigation/" + id} className="btn btn-ghost">Keep investigating</Link>
          <button className="btn btn-danger btn-big" disabled={!culprit || submitting} onClick={() => setConfirming(true)}>
            {submitting ? "The court is deliberating..." : "⚖️ Submit Accusation"}
          </button>
        </div>
      </div>

      {confirming && accused && (
        <ConfirmDialog
          title={"Accuse " + accused.name + "?"}
          body={"This is final. You're citing " + cited.length + " piece" + (cited.length === 1 ? "" : "s") + " of evidence. There is no going back."}
          confirmLabel="Make it official"
          danger
          onConfirm={submit}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}

function useCountUp(target, active) {
  const [v, setV] = useState(active ? 0 : target);
  useEffect(() => {
    if (!active) { setV(target); return; }
    let raf;
    const start = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - start) / 1400);
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return v;
}

function Report({ data, result, reward, animate, onReplay }) {
  const [phase, setPhase] = useState(animate ? 0 : 9);
  const culpritObj = data.suspects.find((s) => s.id === result.solution.culprit);
  const score = useCountUp(result.score, animate && phase >= 3);

  useEffect(() => {
    if (!animate) return;
    const steps = [
      [0, () => sfx.heartbeat()],
      [900, () => sfx.heartbeat()],
      [1900, () => { setPhase(1); sfx.stamp(); result.correct ? sfx.success() : sfx.fail(); }],
      [2800, () => setPhase(2)],
      ...[0, 1, 2].map((i) => [3000 + i * 350, () => i < result.stars && sfx.coin()]),
      [4100, () => setPhase(3)],
      [5600, () => {
        setPhase(4);
        if (reward) {
          toast("+" + reward.xpGained + " XP", reward.firstSolve ? "First solve bonus applied." : "", "xp", "✨");
          if (reward.leveledUp) {
            sfx.levelUp();
            toast("Level up!", "You are now level " + reward.after.level + " — " + reward.after.title, "level", "🏅");
          }
        }
      }],
      [6200, () => setPhase(9)]
    ];
    const timers = steps.map(([t, fn]) => setTimeout(fn, t));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const xpPct = reward ? (reward.after.into / reward.after.need) * 100 : 0;

  return (
    <div className="page report">
      {phase === 0 && (
        <div className="deliberate">
          <div className="avatar large pulse">?</div>
          <p>The evidence is weighed...</p>
        </div>
      )}

      {phase >= 1 && (
        <div className="verdict-wrap">
          <div className={"verdict-stamp " + (result.correct ? "correct" : "wrong")}>
            {result.correct ? "CASE CLOSED" : "WRONG SUSPECT"}
          </div>
          <p className="verdict-sub">
            {result.correct
              ? "You put the right person behind bars."
              : "An innocent person takes the fall. The real culprit walks free."}
          </p>
        </div>
      )}

      {phase >= 2 && (
        <div className="stars">
          {[0, 1, 2].map((i) => (
            <span key={i} className={"star" + (i < result.stars ? " on" : "")} style={{ animationDelay: i * 0.35 + "s" }}>★</span>
          ))}
        </div>
      )}

      {phase >= 3 && (
        <div className="score-panel fade-in">
          <div className="score-big">{score}</div>
          <div className="score-rank">{result.rank}</div>
          <div className="breakdown">
            {result.breakdown.map((b, i) => (
              <div key={i} className={"breakdown-row" + (b.points < 0 ? " neg" : "")} style={{ animationDelay: i * 0.12 + "s" }}>
                <span>{b.label}</span>
                <span>{b.points > 0 ? "+" : ""}{b.points}</span>
              </div>
            ))}
          </div>
          <p className="muted">
            Key evidence cited: {result.keyFound}/{result.keyTotal} · Solid board strings: {result.strongConnections}
          </p>
        </div>
      )}

      {phase >= 4 && reward && (
        <div className="xp-panel fade-in">
          <div className="xp-row">
            <span className="lvl-badge big">{reward.after.level}</span>
            <div style={{ flex: 1 }}>
              <div className="xp-title">{reward.after.title} <span className="muted">+{reward.xpGained} XP</span></div>
              <div className="xp-bar"><span style={{ width: xpPct + "%" }} /></div>
              <div className="muted small">{reward.after.into} / {reward.after.need} XP to next level</div>
            </div>
          </div>
        </div>
      )}

      {phase >= 9 && (
        <div className="fade-in">
          <div className="solution-block">
            <h3>The truth: {culpritObj?.name} <span className="role">({culpritObj?.role})</span></h3>
            <p><strong>Motive:</strong> {result.solution.motive}</p>
            <p><strong>Method:</strong> {result.solution.method}</p>
            <p><strong>Timeline:</strong> {result.solution.timeline}</p>
            <h4>Key evidence</h4>
            <ul>
              {(result.solution.keyEvidence || []).map((eid) => {
                const ev = data.evidence.find((e) => e.id === eid);
                return <li key={eid}>{ev?.title || eid}</li>;
              })}
            </ul>
            <h4>Why the others were innocent</h4>
            <ul>
              {Object.entries(result.solution.innocent || {}).map(([sid, txt]) => {
                const s = data.suspects.find((x) => x.id === sid);
                return <li key={sid}><strong>{s?.name}:</strong> {txt}</li>;
              })}
            </ul>
          </div>

          <CaseLeaderboard caseId={data.id} title={"Case hall of fame: " + data.title} />

          <div className="cta-row">
            <button className="btn btn-primary" onClick={onReplay}>↻ Replay case</button>
            <Link to="/cases" className="btn btn-ghost">Next case</Link>
            <Link to="/profile" className="btn btn-ghost">Detective profile</Link>
          </div>
        </div>
      )}
    </div>
  );
}
