import { sfx } from "../game/sfx.js";

// Player-set suspicion (1-5) replaces the old fixed server value, which leaked the answer.
export default function SuspectCard({ suspect, state = {}, mark = 0, onMark, onInterrogate, disabled }) {
  const facts = ["alibi", "motive", "secret"].filter((k) => state[k]).length;
  const shut = state.lawyered;
  return (
    <div className={"suspect-card" + (state.secret ? " broken" : "") + (shut ? " shut" : "")}>
      {state.secret && <span className="suspect-stamp">BROKEN</span>}
      {shut && !state.secret && <span className="suspect-stamp grey">SILENT</span>}
      <div className="avatar">{suspect.avatar}</div>
      <h3>{suspect.name}</h3>
      <p className="role">{suspect.role}</p>

      <div className="suspicion" title="Your suspicion level">
        Your suspicion
        <span className="dots">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={n <= mark ? "dot on" : "dot"}
              onClick={() => { sfx.click(); onMark(n === mark ? 0 : n); }}
              aria-label={"Suspicion " + n}
            />
          ))}
        </span>
      </div>

      <div className="stress-bar" title="Stress">
        <span style={{ width: (state.stress || 0) + "%" }} />
      </div>
      <p className="facts">{facts}/3 facts recorded</p>

      <button className="btn btn-small btn-primary" disabled={disabled} onClick={() => onInterrogate(suspect)}>
        {shut ? "Review File" : "Interrogate"}
      </button>
    </div>
  );
}
