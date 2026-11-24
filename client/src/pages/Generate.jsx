import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateCase } from "../services/api.js";
import { setProfile } from "../game/storage.js";
import { announce } from "../game/rules.js";
import { sfx } from "../game/sfx.js";

const THEMES = [
  { key: "museum", label: "Museum Heist", icon: "🏛️" },
  { key: "mansion", label: "Country Mansion", icon: "🏚️" },
  { key: "facility", label: "Research Facility", icon: "🧪" },
  { key: "ship", label: "Ocean Liner", icon: "🚢" },
  { key: "theatre", label: "Theatre Backstage", icon: "🎭" },
  { key: "school", label: "Boarding School", icon: "🏫" },
  { key: "gallery", label: "Art Gallery", icon: "🖼️" },
  { key: "hotel", label: "Grand Hotel", icon: "🛎️" }
];

export default function Generate() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("museum");
  const [difficulty, setDifficulty] = useState("Medium");
  const [tone, setTone] = useState("A tense, slow-burn atmosphere with a shocking final reveal.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    sfx.search();
    try {
      const data = await generateCase({ theme, difficulty, tone });
      setProfile(data.profile);
      announce(data.unlocked);
      sfx.discover();
      navigate("/investigation/" + data.id);
    } catch (err) {
      setError(err.message || "Could not generate case.");
      sfx.deny();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h2 className="page-title">Generate a Custom Case</h2>
      <p className="page-sub">Pick a setting and the case engine will build a fully playable mystery.</p>

      <form className="gen-form" onSubmit={onSubmit}>
        <span className="field-label">Setting</span>
        <div className="theme-grid">
          {THEMES.map((t) => (
            <button
              type="button"
              key={t.key}
              className={"theme-tile" + (theme === t.key ? " selected" : "")}
              onClick={() => { sfx.click(); setTheme(t.key); }}
            >
              <span className="big-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <span className="field-label">Difficulty</span>
        <div className="tabs">
          {["Easy", "Medium", "Hard"].map((d) => (
            <button type="button" key={d} className={"tab" + (difficulty === d ? " active" : "")} onClick={() => { sfx.click(); setDifficulty(d); }}>
              {d}
            </button>
          ))}
        </div>

        <label>
          <span className="field-label">Tone / Style</span>
          <textarea rows={3} value={tone} onChange={(e) => setTone(e.target.value)} maxLength={80}
            placeholder="e.g. A tense slow-burn with a shocking reveal." />
        </label>

        <button className="btn btn-primary btn-big" disabled={loading}>
          {loading ? "Building the case file..." : "Generate Case"}
        </button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}
