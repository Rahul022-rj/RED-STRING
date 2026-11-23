import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateCase } from "../services/api.js";

const THEMES = [
  { key: "museum", label: "Museum Heist" },
  { key: "mansion", label: "Country Mansion" },
  { key: "facility", label: "Research Facility" },
  { key: "ship", label: "Ocean Liner" },
  { key: "theatre", label: "Theatre Backstage" },
  { key: "school", label: "Boarding School" },
  { key: "gallery", label: "Art Gallery" },
  { key: "hotel", label: "Grand Hotel" }
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
    try {
      const data = await generateCase({ theme, difficulty, tone });
      navigate("/investigation/" + data.id);
    } catch (err) {
      setError("Could not generate case. Check the server terminal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h2 className="page-title">Generate a Custom Case</h2>
      <p className="page-sub">
        Describe the mystery you want and the AI agent will build a fully playable case.
      </p>

      <form className="gen-form" onSubmit={onSubmit}>
        <label>
          <span>Theme</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            {THEMES.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Difficulty</span>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </label>

        <label>
          <span>Tone / Style</span>
          <textarea
            rows={3}
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            placeholder="e.g. A tense slow-burn with a shocking reveal, no graphic content."
          />
        </label>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Generating..." : "Generate Case"}
        </button>
        {error && <p className="muted" style={{ color: "#E14B55" }}>{error}</p>}
      </form>
    </div>
  );
}
