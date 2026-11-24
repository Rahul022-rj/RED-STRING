import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCase } from "../services/api.js";
import { getBoard, saveBoard, getProgress, saveProgress } from "../game/storage.js";
import { sfx } from "../game/sfx.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const CARD_W = 170;
const BOARD_W = 1180;

export default function Board() {
  const { id } = useParams();
  return <CorkBoard key={id} id={id} />;
}

function defaultPos(node, index, kind) {
  if (kind === "suspect") return { x: 40 + index * 280, y: 30 };
  return { x: 30 + (index % 6) * 190, y: 250 + Math.floor(index / 6) * 190 };
}

const tilt = (key) => {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 7) - 3) * 0.8;
};

function CorkBoard({ id }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [positions, setPositions] = useState({});
  const [connections, setConnections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pointer, setPointer] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const boardRef = useRef(null);
  const dragRef = useRef(null);

  const discovered = getProgress(id).discovered || [];

  useEffect(() => {
    fetchCase(id)
      .then((c) => {
        setData(c);
        const saved = getBoard(id);
        setPositions(saved.positions || {});
        setConnections(saved.connections || []);
        setLoaded(true);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!loaded) return;
    saveBoard(id, { positions, connections });
    saveProgress(id, { connectionCount: connections.length });
  }, [positions, connections, id, loaded]);

  if (error) return <div className="page center-page"><h2 className="page-title">Board unavailable</h2><p className="page-sub">{error}</p></div>;
  if (!data) return <div className="page center-page"><div className="loader" /></div>;

  const nodes = [
    ...data.suspects.map((s, i) => ({ id: s.id, kind: "suspect", item: s, def: defaultPos(s, i, "suspect") })),
    ...data.evidence.filter((e) => discovered.includes(e.id)).map((e, i) => ({ id: e.id, kind: "evidence", item: e, def: defaultPos(e, i, "evidence") }))
  ];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const posOf = (nid) => positions[nid] || byId[nid]?.def || { x: 0, y: 0 };
  const anchor = (nid) => { const p = posOf(nid); return { x: p.x + CARD_W / 2, y: p.y + 10 }; };
  const liveConnections = connections.filter((c) => byId[c.a] && byId[c.b]);
  const boardH = Math.max(720, ...nodes.map((n) => posOf(n.id).y + 220));

  function rope(a, b) {
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const sag = Math.min(90, 20 + dist * 0.18);
    return `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + sag} ${b.x} ${b.y}`;
  }

  function localPoint(e) {
    const r = boardRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onPointerDown(e, nid) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { nid, start: { x: e.clientX, y: e.clientY }, origin: posOf(nid), moved: false };
  }

  function onPointerMove(e) {
    if (selected) setPointer(localPoint(e));
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.start.x;
    const dy = e.clientY - d.start.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    d.moved = true;
    setPositions((prev) => ({
      ...prev,
      [d.nid]: {
        x: Math.max(0, Math.min(BOARD_W - CARD_W, d.origin.x + dx)),
        y: Math.max(0, d.origin.y + dy)
      }
    }));
  }

  function onPointerUp(nid) {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (d.moved) { sfx.pin(); return; }
    // treat as click
    if (!selected) {
      sfx.pin();
      setSelected(nid);
    } else if (selected === nid) {
      setSelected(null);
    } else {
      const exists = connections.some((c) => (c.a === selected && c.b === nid) || (c.a === nid && c.b === selected));
      if (!exists) {
        sfx.string();
        setConnections([...connections, { a: selected, b: nid }]);
      }
      setSelected(null);
    }
  }

  function removeConnection(c) {
    sfx.snap();
    setConnections(connections.filter((x) => x !== c));
  }

  function resetBoard() {
    sfx.snap();
    setConnections([]);
    setPositions({});
    setSelected(null);
    setConfirmReset(false);
  }

  const label = (nid) => (byId[nid]?.kind === "suspect" ? byId[nid].item.name : byId[nid]?.item.title);

  return (
    <div className="page">
      <div className="case-header">
        <div>
          <div className="case-number">CASE {data.number} · INVESTIGATION BOARD</div>
          <h2 className="page-title">{data.title}</h2>
          <p className="page-sub">
            {liveConnections.length} strings · Click a card, then another, to tie them together. Drag to rearrange. Click a string to cut it.
          </p>
        </div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={() => setConfirmReset(true)}>Clear Board</button>
          <Link to={"/investigation/" + id} className="btn btn-ghost">Back to Case</Link>
          <Link to={"/results/" + id} className="btn btn-danger">⚖️ Accuse</Link>
        </div>
      </div>

      {discovered.length === 0 && (
        <div className="banner"><span>No evidence pinned yet — search the crime scene to find some.</span></div>
      )}

      <div className="board-scroll">
        <div
          className={"board" + (selected ? " linking" : "")}
          ref={boardRef}
          style={{ width: BOARD_W, height: boardH }}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setPointer(null)}
          onClick={(e) => { if (e.target === boardRef.current) setSelected(null); }}
        >
          {nodes.map((n) => {
            const p = posOf(n.id);
            return (
              <div
                key={n.id}
                className={"board-card " + n.kind + (selected === n.id ? " selected" : "")}
                style={{ left: p.x, top: p.y, width: CARD_W, transform: `rotate(${tilt(n.id)}deg)` }}
                onPointerDown={(e) => onPointerDown(e, n.id)}
                onPointerUp={() => onPointerUp(n.id)}
              >
                <span className="pin" />
                {n.kind === "suspect" ? (
                  <>
                    <div className="polaroid"><div className="avatar">{n.item.avatar}</div></div>
                    <h4>{n.item.name}</h4>
                    <p>{n.item.role}</p>
                  </>
                ) : (
                  <>
                    <div className="board-card-cat">{n.item.category}</div>
                    <h4>{n.item.title}</h4>
                    <p>{n.item.description}</p>
                  </>
                )}
              </div>
            );
          })}

          <svg className="string-layer" width={BOARD_W} height={boardH}>
            <defs>
              <filter id="rope-shadow" x="-10%" y="-10%" width="120%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.6" />
              </filter>
            </defs>
            {liveConnections.map((c, i) => {
              const d = rope(anchor(c.a), anchor(c.b));
              return (
                <g key={c.a + c.b + i} className="rope" onClick={() => removeConnection(c)}>
                  <path d={d} className="rope-hit" />
                  <path d={d} className="rope-line" filter="url(#rope-shadow)" />
                </g>
              );
            })}
            {selected && pointer && (
              <path d={rope(anchor(selected), pointer)} className="rope-line preview" />
            )}
          </svg>
        </div>
      </div>

      <div className="connections-panel">
        <h3>Connections ({liveConnections.length})</h3>
        {liveConnections.length === 0 && <p className="muted">No strings yet. Link suspects to evidence, or evidence to evidence.</p>}
        {liveConnections.map((c, i) => (
          <div key={i} className="connection-row">
            <span>{label(c.a)} <span className="red">—🧵—</span> {label(c.b)}</span>
            <button className="btn btn-small btn-danger" onClick={() => removeConnection(c)}>Cut</button>
          </div>
        ))}
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Clear the board?"
          body="All strings will be cut and cards returned to their default spots."
          confirmLabel="Clear"
          danger
          onConfirm={resetBoard}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
