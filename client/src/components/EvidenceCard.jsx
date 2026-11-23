export default function EvidenceCard({ ev, discovered, onDiscover }) {
  if (!discovered) {
    return (
      <div className="evidence-card hidden">
        <div className="ev-locked">Undiscovered Evidence</div>
        <button className="btn btn-small" onClick={() => onDiscover(ev.id)}>Investigate</button>
      </div>
    );
  }
  return (
    <div className="evidence-card found">
      <div className="ev-header">
        <span className="ev-cat">{ev.category}</span>
        <span className={"ev-imp " + ev.importance.toLowerCase()}>{ev.importance}</span>
      </div>
      <h4>{ev.title}</h4>
      <p>{ev.description}</p>
      <div className="ev-loc">{ev.location}</div>
    </div>
  );
}
