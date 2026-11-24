import { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Cases from "./pages/Cases.jsx";
import Investigation from "./pages/Investigation.jsx";
import Board from "./pages/Board.jsx";
import Results from "./pages/Results.jsx";
import Generate from "./pages/Generate.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Forgot from "./pages/Forgot.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Flashlight from "./components/Flashlight.jsx";
import AudioAmbience from "./components/AudioAmbience.jsx";
import Toasts from "./components/Toasts.jsx";
import { getToken } from "./services/api.js";
import { hydrate, isLoggedIn, logout } from "./game/storage.js";
import { on, toast } from "./game/events.js";
import { setupNativeBackButton } from "./game/platform.js";

function NotFound() {
  return (
    <div className="page center-page">
      <h2 className="page-title">Dead end</h2>
      <p className="page-sub">This lead goes nowhere.</p>
      <Link to="/" className="btn btn-primary">Back to the precinct</Link>
    </div>
  );
}

// Pages that need an account send guests to the login screen.
function RequireAuth({ children }) {
  const loc = useLocation();
  if (!isLoggedIn()) return <Navigate to={"/login?next=" + encodeURIComponent(loc.pathname)} replace />;
  return children;
}

export default function App() {
  // "loading" while restoring a saved login, then "ready".
  const [status, setStatus] = useState(getToken() ? "loading" : "ready");
  const [, setVersion] = useState(0);
  const [offline, setOffline] = useState(false);
  const navigate = useNavigate();

  function restore() {
    setOffline(false);
    setStatus("loading");
    hydrate()
      .then(() => setStatus("ready"))
      .catch((e) => {
        if (e.offline) setOffline(true);
        else setStatus("ready"); // bad/expired token: continue as guest
      });
  }

  useEffect(() => {
    if (getToken()) restore();
  }, []);

  useEffect(() => setupNativeBackButton(), []);

  useEffect(() => on("login", () => setVersion((v) => v + 1)), []);
  useEffect(
    () =>
      on("logout", () => {
        if (!isLoggedIn()) return;
        logout({ flushFirst: false });
        setVersion((v) => v + 1);
        toast("Session expired", "Please log in again.", "danger", "🔒");
        navigate("/login");
      }),
    [navigate]
  );

  if (status === "loading") {
    return (
      <div className="page center-page">
        {offline ? (
          <>
            <h2 className="page-title">No signal</h2>
            <p className="page-sub">Can't reach the precinct server. Check your internet connection.</p>
            <button className="btn btn-primary" onClick={restore}>Try again</button>
          </>
        ) : (
          <>
            <div className="loader" />
            <p className="muted">Opening your case files...</p>
          </>
        )}
      </div>
    );
  }

  const guard = (el) => <RequireAuth>{el}</RequireAuth>;

  return (
    <>
      <Flashlight />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <Navbar />
      <AudioAmbience />
      <Toasts />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/generate" element={guard(<Generate />)} />
        <Route path="/profile" element={guard(<Profile />)} />
        <Route path="/investigation/:id" element={guard(<Investigation />)} />
        <Route path="/board/:id" element={guard(<Board />)} />
        <Route path="/results/:id" element={guard(<Results />)} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
