import { useEffect, useState } from "react";
import { on } from "../game/events.js";

export default function Toasts() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    return on("toast", (t) => {
      setItems((list) => [...list.slice(-4), t]);
      setTimeout(() => setItems((list) => list.filter((x) => x.id !== t.id)), 4200);
    });
  }, []);

  return (
    <div className="toasts" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={"toast toast-" + t.kind}>
          {t.icon && <span className="toast-icon">{t.icon}</span>}
          <div>
            <div className="toast-title">{t.title}</div>
            {t.body && <div className="toast-body">{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
