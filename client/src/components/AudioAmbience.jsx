import { useEffect, useRef, useState } from "react";

export default function AudioAmbience() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef(null);

  function toggleAudio() {
    if (playing) {
      // Stop
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
      setPlaying(false);
      return;
    }

    // Start: create two oscillators for a low ambient drone
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      alert("Your browser does not support Web Audio.");
      return;
    }
    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.gain.value = 0.04; // very quiet
    gain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 55; // low A
    osc1.connect(gain);

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 82.5; // low E
    osc2.connect(gain);

    // Slow LFO to make it "breathe"
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.015;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    osc1.start();
    osc2.start();
    lfo.start();

    ctxRef.current = ctx;
    setPlaying(true);
  }

  useEffect(() => {
    return () => {
      if (ctxRef.current) ctxRef.current.close();
    };
  }, []);

  return (
    <button
      className="audio-toggle"
      onClick={toggleAudio}
      title={playing ? "Mute ambience" : "Play ambience"}
    >
      {playing ? "🔊 Ambience ON" : "🔇 Ambience OFF"}
    </button>
  );
}
