import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { forgotPassword, forgotUsername } from "../services/api.js";
import { sfx } from "../game/sfx.js";

// "Forgot password?" and "Forgot username?" — both send an email if the account has one.
export default function Forgot() {
  const [params, setParams] = useSearchParams();
  const mode = params.get("mode") === "username" ? "username" : "password";
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = mode === "password" ? await forgotPassword(value.trim()) : await forgotUsername(value.trim());
      sfx.stamp();
      setDone(res.message || "Check your email.");
    } catch (err) {
      sfx.deny();
      setError(err.message);
    }
    setBusy(false);
  }

  function switchMode(m) {
    setParams({ mode: m });
    setValue("");
    setDone("");
    setError("");
  }

  return (
    <div className="page center-page">
      <form className="auth-card pop-in" onSubmit={onSubmit}>
        <div className="case-number">ACCOUNT RECOVERY</div>
        <h2 className="page-title">{mode === "password" ? "Forgot your password?" : "Forgot your username?"}</h2>

        {done ? (
          <>
            <p className="ok-text">{done}</p>
            <p className="muted">
              {mode === "password"
                ? "The link works once and expires in 30 minutes."
                : "The email lists the username linked to that address."}
              {" "}No email? Your account may not have a recovery email. Ask the game admin for help.
            </p>
          </>
        ) : (
          <>
            <p className="page-sub">
              {mode === "password"
                ? "Enter your username or email. We'll email you a link to set a new password."
                : "Enter the email linked to your account and we'll send you your username."}
            </p>
            <label>
              <span className="field-label">{mode === "password" ? "Username or email" : "Email"}</span>
              <input autoFocus type={mode === "username" ? "email" : "text"} autoComplete={mode === "username" ? "email" : "username"}
                value={value} onChange={(e) => setValue(e.target.value)} maxLength={254} required />
            </label>
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn-primary btn-big" disabled={busy}>
              {busy ? "Sending..." : mode === "password" ? "Send reset link" : "Email my username"}
            </button>
          </>
        )}

        <p className="muted auth-links">
          {mode === "password"
            ? <button type="button" className="link-btn" onClick={() => switchMode("username")}>Forgot username instead?</button>
            : <button type="button" className="link-btn" onClick={() => switchMode("password")}>Forgot password instead?</button>}
          <Link to="/login" className="link-btn">Back to log in</Link>
        </p>
      </form>
    </div>
  );
}
