import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/api.js";
import { sfx } from "../game/sfx.js";

// Opened from the emailed link: /reset-password?token=...
export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [doneUser, setDoneUser] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (pw.length < 6) return setError("The new password must be at least 6 characters.");
    if (pw !== confirm) return setError("The passwords don't match.");
    setBusy(true);
    try {
      const res = await resetPassword(token, pw);
      sfx.stamp();
      setDoneUser(res.username);
    } catch (err) {
      sfx.deny();
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <div className="page center-page">
      <form className="auth-card pop-in" onSubmit={onSubmit}>
        <div className="case-number">ACCOUNT RECOVERY</div>
        <h2 className="page-title">Set a new password</h2>

        {!token ? (
          <>
            <p className="error-text">This page needs the link from your reset email.</p>
            <Link to="/forgot?mode=password" className="btn btn-primary">Send a new link</Link>
          </>
        ) : doneUser ? (
          <>
            <p className="ok-text">Password changed for @{doneUser}. Any devices that were logged in have been signed out.</p>
            <Link to={"/login?u=" + encodeURIComponent(doneUser)} className="btn btn-primary btn-big">Log in</Link>
          </>
        ) : (
          <>
            <label>
              <span className="field-label">New password</span>
              <input autoFocus type="password" autoComplete="new-password" minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} required />
            </label>
            <label>
              <span className="field-label">Repeat new password</span>
              <input type="password" autoComplete="new-password" minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </label>
            {error && <p className="error-text">{error}</p>}
            {error.includes("expired") && <Link to="/forgot?mode=password" className="link-btn">Send a new link</Link>}
            <button className="btn btn-primary btn-big" disabled={busy}>{busy ? "Saving..." : "Save new password"}</button>
          </>
        )}
      </form>
    </div>
  );
}
