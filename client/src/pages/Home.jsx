import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCases } from "../services/api.js";
import { getAllProgress, getProfile, isLoggedIn } from "../game/storage.js";
import { levelInfo, ACHIEVEMENTS } from "../game/rules.js";
import { sfx } from "../game/sfx.js";
import { on } from "../game/events.js";
import { isNativeApp, APK_URL } from "../game/platform.js";

export default function Home() {
  const [profile, setProfile] = useState(getProfile);
  const [archive, setArchive] = useState([]);
  const [offline, setOffline] = useState(false);
  const progress = getAllProgress();

  useEffect(() => on("profile", setProfile), []);

  useEffect(() => {
    fetchCases().then(setArchive).catch(() => setOffline(true));
  }, []);

  const inProgress = Object.entries(progress).find(([cid, v]) => v.started && !v.completed && archive.some((c) => c.id === cid));
  const ongoing = inProgress && archive.find((c) => c.id === inProgress[0]);
  const lv = levelInfo(profile.xp);
  const unlocked = Object.keys(profile.achievements).length;

  return (
    <div className="home">
      <div className="hero-glow" />
      <div className="rain" aria-hidden="true" />
      <div className="home-content">
        <h1 className="hero-title">
          <span className="logo-string" /> RED STRING
        </h1>
        <p className="hero-tag">Every clue connects. Every truth has a cost.</p>

        {!isLoggedIn() ? (
          <div className="enlist pop-in">
            <div className="case-number">NEW RECRUIT?</div>
            <p>Create a detective account to play. Your cases, board and rank are saved online, so you can continue on any device.</p>
            <div className="btn-row center">
              <Link to="/login?mode=register" className="btn btn-primary btn-big" onClick={() => sfx.click()}>Join the force</Link>
              <Link to="/login" className="btn btn-ghost btn-big" onClick={() => sfx.click()}>Log in</Link>
            </div>
          </div>
        ) : (
          <>
            <p className="welcome">Welcome back, <strong>{lv.title} {profile.name}</strong>.</p>
            <div className="hero-actions">
              {ongoing && (
                <Link to={"/investigation/" + ongoing.id} className="btn btn-primary btn-big" onClick={() => sfx.click()}>
                  ▶ Continue: {ongoing.title}
                </Link>
              )}
              <Link to="/cases" className={"btn btn-big " + (ongoing ? "btn-ghost" : "btn-primary")} onClick={() => sfx.click()}>
                New Investigation
              </Link>
            </div>
          </>
        )}

        {offline && <p className="error-text">Can't reach the precinct server right now.</p>}

        {!isNativeApp && (
          <a className="app-badge" href={APK_URL} onClick={() => sfx.click()}>
            <span className="app-badge-icon">📱</span>
            <span>
              <small>Get it for Android</small>
              <strong>Download the app</strong>
            </span>
          </a>
        )}

        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">Lv {lv.level}</span>
            <span className="stat-label">{lv.title}</span>
            <span className="xp-bar"><span style={{ width: (lv.into / lv.need) * 100 + "%" }} /></span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{profile.stats.correct}</span>
            <span className="stat-label">Cases Solved</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{archive.length}</span>
            <span className="stat-label">Case Archive</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{unlocked}/{ACHIEVEMENTS.length}</span>
            <span className="stat-label">Achievements</span>
          </div>
        </div>
      </div>
    </div>
  );
}
