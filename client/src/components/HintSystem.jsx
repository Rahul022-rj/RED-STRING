import { useState } from "react";
import { requestHint } from "../services/api.js";
import { HINT_PENALTY } from "../game/rules.js";
import { sfx } from "../game/sfx.js";

export default function HintSystem({ caseId, hints, onHint, onClose, locked }) {
  const [loading, setLoading] = useState(0);
  const [err, setErr] = useState("");

  async function getHint(level) {
    if (hints[level] || loading) return;
    setLoading(level);
    setErr("");
    try {
      const data = await requestHint(caseId, level);
      sfx.discover();
      onHint(level, data.hint, data.profile);
    } catch {
      setErr("The informant isn't answering. Is the server running?");
    }
    setLoading(0);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal wide pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="case-number">INFORMANT</div>
        <h3>Call in a favour</h3>
        <p className="modal-body">Each tip costs <strong>{HINT_PENALTY} points</strong> from your final score. Tips unlock in order.</p>
        <div className="hint-list">
          {[1, 2, 3].map((lvl) => {
            const unlocked = !!hints[lvl];
            const available = lvl === 1 || hints[lvl - 1];
            return (
              <div key={lvl} className={"hint-item" + (unlocked ? " open" : "")}>
                <strong>Tip {lvl}</strong>{" "}
                {unlocked ? (
                  hints[lvl]
                ) : (
                  <button
                    className="btn btn-small btn-ghost"
                    disabled={!available || locked || loading}
                    onClick={() => getHint(lvl)}
                  >
                    {loading === lvl ? "Calling..." : available ? `Unlock (−${HINT_PENALTY} pts)` : "Locked"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {err && <p className="error-text">{err}</p>}
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
