import { useEffect, useRef, useState } from "react";
import Typewriter from "./Typewriter.jsx";
import { STRESS_LIMIT } from "../game/rules.js";

// Interrogation room. All rules (time cost, outcomes) live in the parent via onAsk.
export default function Interrogation({ suspect, state = {}, evidence, hoursLeft, onAsk, onClose }) {
  const [presenting, setPresenting] = useState(false);
  const logRef = useRef(null);
  const log = state.log || [];
  const presented = state.presented || [];
  const silent = state.lawyered;
  const noTime = hoursLeft <= 0;
  const stress = state.stress || 0;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log.length]);

  const ask = (kind, evId) => {
    setPresenting(false);
    onAsk(kind, evId);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={"interro pop-in" + (stress >= 70 ? " tense" : "")} onClick={(e) => e.stopPropagation()}>
        <div className="interro-lamp" />
        <div className="interro-head">
          <div className={"avatar large" + (state.secret ? " cracked" : "")}>{suspect.avatar}</div>
          <div>
            <div className="case-number">INTERROGATION ROOM</div>
            <h3>{suspect.name}</h3>
            <p className="role">{suspect.role}</p>
            <div className="stress-wrap">
              <span>Stress</span>
              <div className="stress-bar big"><span style={{ width: Math.min(stress, 100) + "%" }} /></div>
              <span>{Math.min(stress, STRESS_LIMIT)}%</span>
            </div>
          </div>
        </div>

        <div className="interro-log" ref={logRef}>
          {log.length === 0 && <p className="muted">The suspect stares at you across the table. Every question costs one hour.</p>}
          {log.map((m, i) => (
            <div key={i} className={"log-line log-" + m.who}>
              <span className="log-who">{m.who === "you" ? "You" : m.who === "note" ? "📓 Notebook" : suspect.name.split(" ")[0]}</span>
              <span className="log-text">
                {i === log.length - 1 && m.who !== "you" ? <Typewriter text={m.text} speed={16} /> : m.text}
              </span>
            </div>
          ))}
        </div>

        {silent ? (
          <p className="error-text">{suspect.name.split(" ")[0]} has lawyered up. No more questions.</p>
        ) : noTime ? (
          <p className="error-text">You're out of time. Make your accusation.</p>
        ) : presenting ? (
          <div className="present-list">
            {evidence.length === 0 && <p className="muted">You haven't found any evidence yet. Search the crime scene.</p>}
            {evidence.map((ev) => (
              <button key={ev.id} className="present-item" disabled={presented.includes(ev.id)} onClick={() => ask("present", ev.id)}>
                <span className="ev-cat">{ev.category}</span> {ev.title}
                {presented.includes(ev.id) && <em> — shown</em>}
              </button>
            ))}
            <button className="btn btn-small btn-ghost" onClick={() => setPresenting(false)}>Back</button>
          </div>
        ) : (
          <div className="interro-actions">
            <button className="btn btn-ghost" disabled={state.alibi} onClick={() => ask("alibi")}>
              🕒 Where were you? <small>{state.alibi ? "✓" : "1h"}</small>
            </button>
            <button className="btn btn-ghost" disabled={state.motive} onClick={() => ask("motive")}>
              💭 Why would you do it? <small>{state.motive ? "✓" : "1h"}</small>
            </button>
            <button className="btn btn-primary" onClick={() => setPresenting(true)}>
              🗂️ Present evidence <small>1h</small>
            </button>
          </div>
        )}

        <div className="interro-file">
          <div><strong>Alibi:</strong> {state.alibi ? suspect.alibi : "???"}</div>
          <div><strong>Motive:</strong> {state.motive ? suspect.motive : "???"}</div>
          <div><strong>Secret:</strong> {state.secret ? suspect.secret : "??? — present the right evidence to break them"}</div>
        </div>

        <button className="btn btn-small btn-ghost" onClick={onClose}>Leave room</button>
      </div>
    </div>
  );
}
