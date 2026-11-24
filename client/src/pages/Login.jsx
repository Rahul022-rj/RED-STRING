import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { login, register } from "../services/api.js";
import { startSession, hydrate } from "../game/storage.js";
import { emit } from "../game/events.js";
import { sfx } from "../game/sfx.js";

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState(params.get("mode") === "register" ? "register" : "login");
  const [username, setUsername] = useState(params.get("u") || "");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const next = params.get("next") || "/";
  const isRegister = mode === "register";

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = isRegister
        ? await register(username.trim(), password, displayName.trim(), email.trim())
        : await login(username.trim(), password);
      startSession(res.token, res.profile);
      await hydrate();
      sfx.stamp();
      emit("login");
      navigate(next.startsWith("/") ? next : "/");
    } catch (err) {
      sfx.deny();
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <div className="page center-page">
      <form className="auth-card pop-in" onSubmit={onSubmit}>
        <div className="case-number">{isRegister ? "NEW RECRUIT" : "PRECINCT LOGIN"}</div>
        <h2 className="page-title">{isRegister ? "Join the force" : "Welcome back, detective"}</h2>
        <p className="page-sub">Your progress is saved to your account. Play from any device.</p>

        <label>
          <span className="field-label">{isRegister ? "Username" : "Username or email"}</span>
          <input autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)}
            placeholder={isRegister ? "letters, numbers, _" : ""} maxLength={isRegister ? 20 : 254} required />
        </label>
        {isRegister && (
          <>
            <label>
              <span className="field-label">Detective name <span className="muted">(shown on the leaderboard)</span></span>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Inspector Rahul" maxLength={24} />
            </label>
            <label>
              <span className="field-label">Email <span className="muted">(optional, only for password recovery)</span></span>
              <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={254} />
            </label>
          </>
        )}
        <label>
          <span className="field-label">Password</span>
          <input type="password" autoComplete={isRegister ? "new-password" : "current-password"}
            value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary btn-big" disabled={busy}>
          {busy ? "Checking credentials..." : isRegister ? "Create account" : "Log in"}
        </button>

        {!isRegister && (
          <p className="muted auth-links">
            <Link to="/forgot?mode=password" className="link-btn">Forgot password?</Link>
            <Link to="/forgot?mode=username" className="link-btn">Forgot username?</Link>
          </p>
        )}

        <p className="muted">
          {isRegister ? "Already on the force? " : "New here? "}
          <button type="button" className="link-btn" onClick={() => { setMode(isRegister ? "login" : "register"); setError(""); }}>
            {isRegister ? "Log in" : "Create an account"}
          </button>
        </p>
        <Link to="/leaderboard" className="link-btn">See the leaderboard →</Link>
      </form>
    </div>
  );
}
