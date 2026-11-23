import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function Board() {
  const { id } = useParams();
  const [evidence, setEvidence] = useState([]);
  const [positions, setPositions] = useState({});
  const [connections, setConnections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const boardRef = useRef(null);

  useEffect(() => {
    fetch("/api/cases/" + id + "/evidence").then((r) => r.json()).then((ev) => {
      setEvidence(ev);
      const saved = JSON.parse(localStorage.getItem("redstring-board-" + id) || "null");
      if (saved) {
        setPositions(saved.positions || {});
        setConnections(saved.connections || []);
      } else {
        const init = {};
        ev.forEach((e, i) => {
          init[e.id] = { x: 40 + (i % 4) * 200, y: 40 + Math.floor(i / 4) * 160 };
        });
        setPositions(init);
      }
      setLoaded(true);
    });
  }, [id]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("redstring-board-" + id, JSON.stringify({ positions, connections }));
    const saved = JSON.parse(localStorage.getItem("redstring-progress") || "{}");
    saved[id] = { ...(saved[id] || {}), connectionCount: connections.length };
    localStorage.setItem("redstring-progress", JSON.stringify(saved));
  }, [positions, connections, id, loaded]);

  function onMouseDown(e, evId) {
    const startX = e.clientX;
    const startY = e.clientY;
    const start = positions[evId];

    function move(ev) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      setPositions((prev) => ({ ...prev, [evId]: { x: start.x + dx, y: start.y + dy } }));
    }
    function up() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  function onClickCard(evId) {
    if (!selected) {
      setSelected(evId);
    } else if (selected === evId) {
      setSelected(null);
    } else {
      const exists = connections.some(
        (c) => (c.a === selected && c.b === evId) || (c.a === evId && c.b === selected)
      );
      if (!exists) setConnections([...connections, { a: selected, b: evId }]);
      setSelected(null);
    }
  }

  function removeConnection(index) {
    setConnections(connections.filter((_, i) => i !== index));
  }

  function resetBoard() {
    setConnections([]);
    const init = {};
    evidence.forEach((e, i) => {
      init[e.id] = { x: 40 + (i % 4) * 200, y: 40 + Math.floor(i / 4) * 160 };
    });
    setPositions(init);
    setSelected(null);
  }

  return (
    <div className="page">
      <div className="case-header">
        <div>
          <h2 className="page-title">Investigation Board</h2>
          <p className="page-sub">{connections.length} connections | Click cards to link them with red string</p>
        </div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={resetBoard}>Reset Board</button>
          <Link to={"/investigation/" + id} className="btn btn-ghost">Back to Case</Link>
          <Link to={"/results/" + id} className="btn btn-primary">Make Accusation</Link>
        </div>
      </div>

      <div className="board" ref={boardRef}>
        <svg className="string-layer" width="100%" height="100%">
          {connections.map((c, i) => {
            const p1 = positions[c.a];
            const p2 = positions[c.b];
            if (!p1 || !p2) return null;
            return (
              <line
                key={i}
                x1={p1.x + 80}
                y1={p1.y + 60}
                x2={p2.x + 80}
                y2={p2.y + 60}
                stroke="#C83A46"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {evidence.map((ev) => {
          const pos = positions[ev.id] || { x: 0, y: 0 };
          const isSelected = selected === ev.id;
          return (
            <div
              key={ev.id}
              className={"board-card" + (isSelected ? " selected" : "")}
              style={{ left: pos.x, top: pos.y }}
              onMouseDown={(e) => {
                if (e.target.tagName !== "BUTTON") onMouseDown(e, ev.id);
              }}
              onClick={() => onClickCard(ev.id)}
            >
              <div className="board-card-cat">{ev.category}</div>
              <h4>{ev.title}</h4>
              <p>{ev.description}</p>
            </div>
          );
        })}
      </div>

      <div className="connections-panel">
        <h3>Connections ({connections.length})</h3>
        {connections.length === 0 && <p className="muted">No connections yet. Click one card, then another to connect.</p>}
        {connections.map((c, i) => {
          const a = evidence.find((e) => e.id === c.a);
          const b = evidence.find((e) => e.id === c.b);
          return (
            <div key={i} className="connection-row">
              <span>{a?.title} {"\u2192"} {b?.title}</span>
              <button className="btn btn-small btn-danger" onClick={() => removeConnection(i)}>Delete</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
