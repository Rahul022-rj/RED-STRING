import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import SuspectCard from "../components/SuspectCard.jsx";
import EvidenceCard from "../components/EvidenceCard.jsx";
import HintSystem from "../components/HintSystem.jsx";

export default function Investigation() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [discovered, setDiscovered] = useState([]);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  useEffect(() => {
    fetch("/api/cases/" + id).then((r) => r.json()).then(setData);
    const saved = JSON.parse(localStorage.getItem("redstring-progress") || "{}");
    if (saved[id]) {
      if (saved[id].discovered) setDiscovered(saved[id].discovered);
      if (saved[id].hintsUsed) setHintsUsed(saved[id].hintsUsed);
    }
  }, [id]);

  useEffect(() => {
    if (!data) return;
    const saved = JSON.parse(localStorage.getItem("redstring-progress") || "{}");
    saved[id] = { ...(saved[id] || {}), discovered, hintsUsed, caseId: id };
    localStorage.setItem("redstring-progress", JSON.stringify(saved));
  }, [discovered, hintsUsed, id, data]);

  if (!data) return <div className="page"><p>Loading case file...</p></div>;

  function discoverEvidence(evId) {
    if (!discovered.includes(evId)) {
      setDiscovered([...discovered, evId]);
    }
  }

  return (
    <div className="page">
      <div className="case-header">
        <div>
          <div className="case-number">CASE {data.number}</div>
          <h2 className="page-title">{data.title}</h2>
          <p className="page-sub">{data.location} | Difficulty: {data.difficulty}</p>
        </div>
        <Link to={"/board/" + id} className="btn btn-primary">Open Investigation Board</Link>
      </div>

      <div className="briefing">
        <h3>Case Briefing</h3>
        <p>{data.description}</p>
      </div>

      <h3 className="section-title">Suspects</h3>
      <div className="suspect-grid">
        {data.suspects.map((s) => (
          <SuspectCard key={s.id} suspect={s} onInvestigate={setSelectedSuspect} />
        ))}
      </div>

      {selectedSuspect && (
        <div className="modal-overlay" onClick={() => setSelectedSuspect(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="avatar large">{selectedSuspect.avatar}</div>
            <h3>{selectedSuspect.name}</h3>
            <p className="role">{selectedSuspect.role}</p>
            <div className="profile-block"><strong>Motive:</strong> {selectedSuspect.motive}</div>
            <div className="profile-block"><strong>Alibi:</strong> {selectedSuspect.alibi}</div>
            <div className="profile-block"><strong>Secret:</strong> {selectedSuspect.secret}</div>
            <button className="btn btn-ghost" onClick={() => setSelectedSuspect(null)}>Close</button>
          </div>
        </div>
      )}

      <h3 className="section-title">Evidence ({discovered.length}/{data.evidence.length})</h3>
      <div className="evidence-grid">
        {data.evidence.map((ev) => (
          <EvidenceCard key={ev.id} ev={ev} discovered={discovered.includes(ev.id)} onDiscover={discoverEvidence} />
        ))}
      </div>

      <HintSystem caseId={id} onHintUsed={() => setHintsUsed((h) => h + 1)} />

      <div className="cta-row">
        <Link to={"/board/" + id} className="btn btn-primary">Continue to Board</Link>
        <Link to={"/results/" + id} className="btn btn-danger">Make Accusation</Link>
      </div>
    </div>
  );
}
