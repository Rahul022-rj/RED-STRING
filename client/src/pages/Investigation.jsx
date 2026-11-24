import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import SuspectCard from "../components/SuspectCard.jsx";
import EvidenceCard from "../components/EvidenceCard.jsx";
import HintSystem from "../components/HintSystem.jsx";
import Interrogation from "../components/Interrogation.jsx";
import Typewriter from "../components/Typewriter.jsx";
import { fetchCase } from "../services/api.js";
import { getProgress, saveProgress, resetCase, recordEvent, getProfile, setProfile } from "../game/storage.js";
import { hoursFor, groupByLocation, locationIcon, line, announce, STRESS_LIMIT, HINT_PENALTY } from "../game/rules.js";
import { sfx } from "../game/sfx.js";
import { toast } from "../game/events.js";

export default function Investigation() {
  const { id } = useParams();
  return <Game key={id} id={id} />;
}

function Game({ id }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [prog, setProg] = useState(() => getProgress(id));
  const [tab, setTab] = useState("scene");
  const [room, setRoom] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [found, setFound] = useState(null);
  const [searching, setSearching] = useState(null);
  const [coldCase, setColdCase] = useState(false);
  const [shake, setShake] = useState(false);
  const [briefDone, setBriefDone] = useState(false);

  useEffect(() => {
    fetchCase(id).then(setData).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (prog.started) saveProgress(id, prog);
  }, [prog, id]);

  const locations = useMemo(() => (data ? groupByLocation(data.evidence) : []), [data]);

  if (error) {
    return (
      <div className="page center-page">
        <h2 className="page-title">Case file missing</h2>
        <p className="page-sub">{error}</p>
        <Link to="/cases" className="btn btn-primary">Back to Cases</Link>
      </div>
    );
  }
  if (!data) return <div className="page center-page"><div className="loader" /><p className="muted">Pulling the case file...</p></div>;

  const total = hoursFor(data.difficulty);
  const used = prog.hoursUsed || 0;
  const left = Math.max(0, total - used);
  const discovered = prog.discovered || [];
  const cleared = prog.cleared || [];
  const searches = prog.searches || {};
  const interro = prog.interro || {};
  const hints = prog.hints || {};
  const marks = prog.marks || {};
  const locked = !!prog.completed;
  const hintCount = Object.keys(hints).length;
  const discoveredEvidence = data.evidence.filter((e) => discovered.includes(e.id));

  function commit(patch, cost = 0) {
    const hoursUsed = (prog.hoursUsed || 0) + cost;
    setProg({ ...prog, ...patch, hoursUsed });
    if (!cost) return;
    const nl = total - hoursUsed;
    if (nl <= 0) {
      setTimeout(() => { sfx.heartbeat(); setColdCase(true); }, 700);
    } else if (nl <= 3) {
      sfx.heartbeat();
      toast(nl + (nl === 1 ? " hour left" : " hours left"), "The trail is going cold.", "danger", "⏳");
    }
  }

  function canAct() {
    if (locked) return false;
    if (left <= 0) { setColdCase(true); return false; }
    return true;
  }

  function startCase() {
    sfx.stamp();
    setProg({ ...prog, started: true, startedAt: Date.now(), hoursUsed: 0 });
  }

  function search(loc) {
    if (searching || !canAct()) return;
    setSearching(loc.name);
    sfx.search();
    setTimeout(() => {
      const remaining = loc.items.filter((e) => !discovered.includes(e.id));
      const s = { ...searches, [loc.name]: (searches[loc.name] || 0) + 1 };
      if (!remaining.length) {
        sfx.empty();
        toast("Nothing new here", loc.name + " has been picked clean.", "info", "🕳️");
        commit({ searches: s, cleared: [...new Set([...cleared, loc.name])] }, 1);
      } else {
        const ev = remaining[Math.floor(Math.random() * remaining.length)];
        const autoClear = remaining.length === 1 && data.difficulty === "Easy";
        commit({
          searches: s,
          discovered: [...discovered, ev.id],
          cleared: autoClear ? [...cleared, loc.name] : cleared
        }, 1);
        recordEvent("evidence");
        sfx.discover();
        setFound(ev);
      }
      setSearching(null);
    }, 1100);
  }

  function ask(sid, kind, evId) {
    if (!canAct()) return;
    const suspect = data.suspects.find((s) => s.id === sid);
    const st = interro[sid] || { stress: 0, log: [], presented: [] };
    if (st.lawyered) return;
    const next = { ...st, log: [...(st.log || [])], presented: [...(st.presented || [])] };
    const say = (who, text) => next.log.push({ who, text });

    if (kind === "alibi") {
      say("you", "Where were you when it happened?");
      say("them", line("alibi"));
      say("note", suspect.alibi);
      next.alibi = true;
      next.stress = (next.stress || 0) + 10;
      sfx.click();
    } else if (kind === "motive") {
      say("you", "Someone wanted this to happen. Why you?");
      say("them", line("motive"));
      say("note", suspect.motive);
      next.motive = true;
      next.stress = (next.stress || 0) + 10;
      sfx.click();
    } else if (kind === "present") {
      const ev = data.evidence.find((e) => e.id === evId);
      next.presented.push(evId);
      say("you", "I found this — \"" + ev.title + "\". Explain it.");
      if (ev.relatedSuspect === sid && !st.secret) {
        say("them", line("crack"));
        say("note", "BREAKTHROUGH: " + suspect.secret);
        next.secret = true;
        next.stress = (next.stress || 0) + 30;
        sfx.crack();
        setShake(true);
        setTimeout(() => setShake(false), 500);
        toast("Suspect broken", suspect.name + " revealed a secret.", "success", "💥");
        recordEvent("break").then(announce);
      } else if (ev.relatedSuspect === sid) {
        say("them", "We've already been over that. I told you everything.");
        next.stress = (next.stress || 0) + 5;
        sfx.deny();
      } else {
        say("them", line("deflect"));
        next.stress = (next.stress || 0) + 25;
        sfx.deny();
      }
    }

    if (next.stress >= STRESS_LIMIT) {
      next.stress = STRESS_LIMIT;
      next.lawyered = true;
      say("them", line("stressed"));
      toast(suspect.name + " lawyered up", "They won't answer any more questions.", "danger", "🤐");
      recordEvent("lawyered").then(announce);
    }
    commit({ interro: { ...interro, [sid]: next } }, 1);
  }

  function onHint(level, text, profile) {
    setProfile(profile);
    commit({ hints: { ...hints, [level]: text } });
  }

  function replay() {
    resetCase(id);
    setProg({});
    setBriefDone(false);
  }

  /* ---------- intro briefing ---------- */
  if (!prog.started) {
    const record = getProfile().cases[id];
    return (
      <div className="briefing-screen">
        <div className="case-folder unfold">
          <div className="folder-tab">CASE FILE #{data.number}</div>
          <div className="classified">CLASSIFIED</div>
          <h1>{data.title}</h1>
          <p className="case-loc">📍 {data.location}</p>
          <span className={"difficulty " + data.difficulty.toLowerCase()}>{data.difficulty}</span>
          <p className="folder-body">
            <Typewriter text={data.description} speed={24} onDone={() => setBriefDone(true)} />
          </p>
          <ul className={"folder-rules" + (briefDone ? " show" : "")}>
            <li>⏳ You have <strong>{total} hours</strong> before the trail goes cold.</li>
            <li>🔍 Searching a location or asking a question costs <strong>1 hour</strong>.</li>
            <li>💥 Present the right evidence to a suspect to break them.</li>
            <li>⚖️ You get <strong>one</strong> accusation. Make it count.</li>
          </ul>
          {record && <p className="muted">Personal best: {record.best} pts · {"★".repeat(record.stars)}{"☆".repeat(3 - record.stars)}</p>}
          <div className="btn-row center">
            <Link to="/cases" className="btn btn-ghost">Not now</Link>
            <button className="btn btn-primary btn-big" onClick={startCase}>Take the case</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- main game screen ---------- */
  return (
    <div className={"page game" + (shake ? " shake" : "")}>
      <div className="hud">
        <div className="hud-left">
          <div className="case-number">CASE {data.number} · {data.difficulty.toUpperCase()}</div>
          <div className="hud-title">{data.title}</div>
        </div>
        <div className={"hud-clock" + (left <= 3 ? " low" : "")}>
          <span className="hud-label">⏳ {left}h left</span>
          <div className="segments">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={"seg" + (i < used ? " used" : "")} />
            ))}
          </div>
        </div>
        <div className="hud-stat"><span>{discovered.length}/{data.evidence.length}</span><small>Evidence</small></div>
        <div className="hud-stat"><span>{hintCount}</span><small>Tips</small></div>
        <div className="hud-actions">
          <button className="btn btn-small btn-ghost" onClick={() => { sfx.click(); setShowHints(true); }}>💡 Informant</button>
          <Link to={"/board/" + id} className="btn btn-small btn-ghost" onClick={() => sfx.click()}>🧵 Board</Link>
          <Link to={"/results/" + id} className="btn btn-small btn-danger" onClick={() => sfx.click()}>⚖️ Accuse</Link>
        </div>
      </div>

      {locked && (
        <div className="banner">
          <span>This case is closed.</span>
          <div className="btn-row">
            <Link to={"/results/" + id} className="btn btn-small btn-primary">View report</Link>
            <button className="btn btn-small btn-ghost" onClick={replay}>Replay case</button>
          </div>
        </div>
      )}
      {!locked && left <= 0 && (
        <div className="banner danger">
          <span>The trail has gone cold. You must make your accusation.</span>
          <Link to={"/results/" + id} className="btn btn-small btn-danger">Accuse now</Link>
        </div>
      )}

      <div className="tabs">
        {[
          ["scene", "🔦 Crime Scene"],
          ["suspects", "👤 Suspects"],
          ["file", "🗂️ Case File (" + discovered.length + ")"]
        ].map(([k, label]) => (
          <button key={k} className={"tab" + (tab === k ? " active" : "")} onClick={() => { sfx.click(); setTab(k); }}>
            {label}
          </button>
        ))}
      </div>

      {tab === "scene" && (
        <div className="fade-in">
          <p className="page-sub">
            Choose where to search. {data.difficulty === "Easy" ? "Clue counts are visible on Easy." : "You won't know a room is empty until you search it and find nothing."}
          </p>
          <div className="location-grid">
            {locations.map((loc) => {
              const foundHere = loc.items.filter((e) => discovered.includes(e.id));
              const isClear = cleared.includes(loc.name);
              const remaining = loc.items.length - foundHere.length;
              const count = searches[loc.name] || 0;
              return (
                <div key={loc.name} className={"location-card" + (isClear ? " cleared" : "") + (searching === loc.name ? " searching" : "")}>
                  <div className="loc-icon">{locationIcon(loc.name)}</div>
                  <h4>{loc.name}</h4>
                  <p className="loc-status">
                    {isClear
                      ? "✓ Cleared"
                      : data.difficulty === "Easy"
                        ? remaining + (remaining === 1 ? " clue remains" : " clues remain")
                        : count
                          ? "Searched ×" + count
                          : "Unsearched"}
                  </p>
                  <div className="loc-found">
                    {foundHere.map((e) => <span key={e.id} className="chip">{e.title}</span>)}
                  </div>
                  <button className="btn btn-small btn-primary" disabled={isClear || locked || !!searching} onClick={() => search(loc)}>
                    {searching === loc.name ? "Searching..." : isClear ? "Nothing left" : "Search · 1h"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "suspects" && (
        <div className="fade-in">
          <p className="page-sub">Question suspects and present evidence. Push too hard with the wrong evidence and they'll lawyer up.</p>
          <div className="suspect-grid">
            {data.suspects.map((s) => (
              <SuspectCard
                key={s.id}
                suspect={s}
                state={interro[s.id]}
                mark={marks[s.id] || 0}
                onMark={(n) => commit({ marks: { ...marks, [s.id]: n } })}
                onInterrogate={(sus) => { sfx.click(); setRoom(sus.id); }}
              />
            ))}
          </div>
        </div>
      )}

      {tab === "file" && (
        <div className="fade-in">
          <div className="briefing">
            <h3>Case Briefing</h3>
            <p>{data.description}</p>
          </div>
          {discoveredEvidence.length === 0 ? (
            <p className="muted">No evidence yet. Search the crime scene.</p>
          ) : (
            <div className="evidence-grid">
              {discoveredEvidence.map((ev) => <EvidenceCard key={ev.id} ev={ev} />)}
            </div>
          )}
          <h3 className="section-title">Detective's Notes</h3>
          <textarea
            className="notes"
            rows={6}
            value={prog.notes || ""}
            onChange={(e) => setProg({ ...prog, notes: e.target.value })}
            placeholder="Write down your theory..."
          />
          {hintCount > 0 && (
            <>
              <h3 className="section-title">Informant Tips (−{hintCount * HINT_PENALTY} pts)</h3>
              <div className="hint-list">
                {Object.entries(hints).map(([lvl, txt]) => (
                  <div key={lvl} className="hint-item open"><strong>Tip {lvl}</strong> {txt}</div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {searching && (
        <div className="search-overlay">
          <div className="search-beam" />
          <p>Searching {searching}...</p>
        </div>
      )}

      {found && (
        <div className="modal-overlay" onClick={() => setFound(null)}>
          <div className="found-modal" onClick={(e) => e.stopPropagation()}>
            <div className="found-flash">EVIDENCE DISCOVERED</div>
            <div className="flip-in"><EvidenceCard ev={found} fresh /></div>
            <p className="muted">Added to your case file. Pin it on the board, or show it to a suspect.</p>
            <div className="btn-row center">
              <button className="btn btn-ghost" onClick={() => { setFound(null); setTab("suspects"); }}>Confront a suspect</button>
              <button className="btn btn-primary" onClick={() => setFound(null)}>Keep searching</button>
            </div>
          </div>
        </div>
      )}

      {room && (
        <Interrogation
          suspect={data.suspects.find((s) => s.id === room)}
          state={interro[room]}
          evidence={discoveredEvidence}
          hoursLeft={locked ? 0 : left}
          onAsk={(kind, evId) => ask(room, kind, evId)}
          onClose={() => setRoom(null)}
        />
      )}

      {showHints && (
        <HintSystem caseId={id} hints={hints} locked={locked} onHint={onHint} onClose={() => setShowHints(false)} />
      )}

      {coldCase && !locked && (
        <div className="modal-overlay">
          <div className="modal pop-in danger-modal">
            <div className="big-icon">⏳</div>
            <h3>The trail has gone cold</h3>
            <p className="modal-body">You're out of time. Everything you know is all you'll get. Time to name a culprit.</p>
            <div className="btn-row center">
              <button className="btn btn-ghost" onClick={() => setColdCase(false)}>Review notes</button>
              <button className="btn btn-danger" onClick={() => navigate("/results/" + id)}>Make accusation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
