export default function EvidenceCard({ ev, fresh = false }) {
  return (
    <div className={"evidence-card found" + (fresh ? " fresh" : "")}>
      <div className="ev-header">
        <span className="ev-cat">{ev.category}</span>
        <span className={"ev-imp " + String(ev.importance).toLowerCase()}>{ev.importance}</span>
      </div>
      <h4>{ev.title}</h4>
      <p>{ev.description}</p>
      <div className="ev-loc">📍 {ev.location}</div>
    </div>
  );
}
