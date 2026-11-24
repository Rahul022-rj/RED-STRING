import { useEffect, useState } from "react";
import { sfx } from "../game/sfx.js";

// Reveals text letter by letter. Click to skip.
export default function Typewriter({ text, speed = 22, sound = true, onDone, className = "" }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    setN(0);
  }, [text]);

  useEffect(() => {
    if (n >= text.length) {
      onDone && onDone();
      return;
    }
    const t = setTimeout(() => {
      setN((x) => x + 1);
      if (sound && n % 3 === 0 && text[n] !== " ") sfx.type();
    }, speed);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, text]);

  const done = n >= text.length;
  return (
    <span className={"typewriter " + className} onClick={() => setN(text.length)}>
      {text.slice(0, n)}
      {!done && <span className="caret">▌</span>}
    </span>
  );
}
