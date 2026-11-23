import { useState } from "react";
import { requestHint } from "../services/api.js";

export default function HintSystem({ caseId, onHintUsed }) {
  const [hints, setHints] = useState([]);
  const [loading, setLoading] = useState(false);

  async function getHint(level) {
    if (hints.find((h) => h.level === level)) return;
    setLoading(true);
    const data = await requestHint(caseId, level);
    setHints([...hints, { level, text: data.hint }]);
    onHintUsed && onHintUsed(level);
    setLoading(false);
  }

  return (
    <div className="hint-panel">
      <h3>Detective Hints</h3>
      <div className="hint-buttons">
        {[1, 2, 3].map((lvl) => (
          <button key={lvl} className="btn btn-small" disabled={loading || hints.find((h) => h.level === lvl)} onClick={() => getHint(lvl)}>
            Hint {lvl} {hints.find((h) => h.level === lvl) ? "unlocked" : "( -50 pts )"}
          </button>
        ))}
      </div>
      <div className="hint-list">
        {hints.map((h) => (
          <div key={h.level} className="hint-item">
            <strong>Hint {h.level}:</strong> {h.text}
          </div>
        ))}
      </div>
    </div>
  );
}
