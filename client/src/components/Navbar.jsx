import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const loc = useLocation();
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <span className="logo-string" /> RED STRING
      </Link>
      <div className="nav-links">
        <Link className={loc.pathname === "/" ? "active" : ""} to="/">Home</Link>
        <Link className={loc.pathname.startsWith("/cases") ? "active" : ""} to="/cases">Cases</Link>
        <Link className={loc.pathname === "/generate" ? "active" : ""} to="/generate">Generate</Link>
      </div>
    </nav>
  );
}
