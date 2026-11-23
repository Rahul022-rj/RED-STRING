import { useEffect } from "react";

export default function Flashlight() {
  useEffect(() => {
    function handleMove(e) {
      document.documentElement.style.setProperty("--mouse-x", e.clientX + "px");
      document.documentElement.style.setProperty("--mouse-y", e.clientY + "px");
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return <div className="flashlight" aria-hidden="true" />;
}
