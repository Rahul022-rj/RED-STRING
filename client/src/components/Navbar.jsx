import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getProfile, isLoggedIn } from "../game/storage.js";
import { levelInfo } from "../game/rules.js";
import { on } from "../game/events.js";

export default function Navbar() {
  const loc = useLocation();
  const [profile, setProfile] = useState(getProfile);
  const [sync, setSync] = useState("saved");

  useEffect(() => on("profile", setProfile), []);
  useEffect(() => on("sync", setSync), []);

  const lv = levelInfo(profile.xp);
  const cls = (match) => (match ? "active" : "");
  const syncLabel = { saving: "Saving…", saved: "Saved", offline: "Offline", error: "Not saved" }[sync];

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-string" /> RED STRING
      </Link>
      <div className="nav-links">
        <Link className={cls(loc.pathname === "/")} to="/">Home</Link>
        <Link className={cls(loc.pathname.startsWith("/cases"))} to="/cases">Cases</Link>
        <Link className={cls(loc.pathname === "/generate")} to="/generate">Generate</Link>
        <Link className={cls(loc.pathname === "/leaderboard")} to="/leaderboard">Leaderboard</Link>
      </div>
      {isLoggedIn() ? (
        <Link to="/profile" className={"nav-profile " + cls(loc.pathname === "/profile")} title={lv.title}>
          <span className="lvl-badge">{lv.level}</span>
          <span className="nav-profile-info">
            <span className="nav-name">{profile.name}</span>
            <span className="xp-bar mini"><span style={{ width: (lv.into / lv.need) * 100 + "%" }} /></span>
          </span>
          <span className={"sync-dot " + sync} title={syncLabel} />
        </Link>
      ) : (
        <Link to="/login" className="btn btn-small btn-primary">Log in</Link>
      )}
    </nav>
  );
}
