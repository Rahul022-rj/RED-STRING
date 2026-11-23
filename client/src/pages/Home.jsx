import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home() {
  const [progress, setProgress] = useState({});
  const [archive, setArchive] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("redstring-progress") || "{}");
    setProgress(saved);
    fetch("/api/cases").then((r) => r.json()).then(setArchive).catch(() => {});
  }, []);

  const completed = Object.values(progress).filter((p) => p.completed).length;
  const lastCase = Object.entries(progress).find(([, v]) => !v.completed);

  return (
    <div className="home">
      <div className="hero-glow" />
      <div className="home-content">
        <h1 className="hero-title">
          <span className="logo-string" /> RED STRING
        </h1>
        <p className="hero-tag">Every clue connects. Every truth has a cost.</p>

        <div className="hero-actions">
          <Link to="/cases" className="btn btn-primary">New Investigation</Link>
          {lastCase && (
            <Link to={"/investigation/" + lastCase[0]} className="btn btn-ghost">
              Continue Investigation
            </Link>
          )}
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{completed}</span>
            <span className="stat-label">Completed Cases</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{archive.length}</span>
            <span className="stat-label">Case Archive</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{completed >= 2 ? "Detective" : completed >= 1 ? "Observer" : "Rookie"}</span>
            <span className="stat-label">Detective Rank</span>
          </div>
        </div>
      </div>
    </div>
  );
}
