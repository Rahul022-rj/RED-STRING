import { useEffect, useRef, useState } from "react";
import { getSettings, saveSettings } from "../game/storage.js";
import { sfx } from "../game/sfx.js";

// Ambient soundtrack: a low breathing drone + distant rain, all synthesized.
function startAmbience() {
  const A = window.AudioContext || window.webkitAudioContext;
  if (!A) return null;
  const ctx = new A();
  const out = ctx.createGain();
  out.gain.setValueAtTime(0, ctx.currentTime);
  out.gain.linearRampToValueAtTime(1, ctx.currentTime + 3);
  out.connect(ctx.destination);

  // Drone
  const drone = ctx.createGain();
  drone.gain.value = 0.035;
  drone.connect(out);
  [55, 82.5, 110.3].forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = i === 2 ? "triangle" : "sine";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = i === 2 ? 0.25 : 1;
    o.connect(g);
    g.connect(drone);
    o.start();
  });
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.015;
  lfo.connect(lfoGain);
  lfoGain.connect(drone.gain);
  lfo.start();

  // Rain: looped noise through a lowpass
  const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last * 3.5;
  }
  const rain = ctx.createBufferSource();
  rain.buffer = buf;
  rain.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  const rg = ctx.createGain();
  rg.gain.value = 0.18;
  rain.connect(lp);
  lp.connect(rg);
  rg.connect(out);
  rain.start();

  // Occasional lonely piano-ish note
  const notes = [220, 261.6, 293.7, 329.6, 196];
  const timer = setInterval(() => {
    if (Math.random() < 0.5) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = notes[Math.floor(Math.random() * notes.length)];
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.03, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + 4.2);
  }, 5000);

  return { ctx, timer };
}

export default function AudioAmbience() {
  const [settings, setSettings] = useState(getSettings);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  function stop() {
    if (ref.current) {
      clearInterval(ref.current.timer);
      ref.current.ctx.close();
      ref.current = null;
    }
  }

  // Music needs a user gesture to start, so only autostart after a click.
  useEffect(() => {
    if (!settings.music) return;
    const begin = () => {
      if (!ref.current && getSettings().music) ref.current = startAmbience();
    };
    window.addEventListener("pointerdown", begin, { once: true });
    return () => window.removeEventListener("pointerdown", begin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => stop, []);

  function toggleMusic() {
    const music = !settings.music;
    setSettings(saveSettings({ music }));
    if (music) ref.current = ref.current || startAmbience();
    else stop();
  }

  function toggleSfx() {
    const s = saveSettings({ sfx: !settings.sfx });
    setSettings(s);
    if (s.sfx) sfx.click();
  }

  return (
    <div className="audio-dock">
      {open && (
        <div className="audio-panel pop-in">
          <button className={"audio-opt" + (settings.music ? " on" : "")} onClick={toggleMusic}>
            <span>🎵 Ambience</span><span>{settings.music ? "ON" : "OFF"}</span>
          </button>
          <button className={"audio-opt" + (settings.sfx ? " on" : "")} onClick={toggleSfx}>
            <span>🔔 Sound FX</span><span>{settings.sfx ? "ON" : "OFF"}</span>
          </button>
        </div>
      )}
      <button className="audio-toggle" onClick={() => setOpen(!open)} title="Audio settings">
        {settings.music || settings.sfx ? "🔊" : "🔇"} Audio
      </button>
    </div>
  );
}
