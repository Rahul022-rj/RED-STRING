// Procedural sound effects via the Web Audio API (no audio files needed).
import { getSettings } from "./storage.js";

let ctx = null;
let master = null;
let noiseBuf = null;

function audio() {
  if (!getSettings().sfx) return null;
  if (!ctx) {
    const A = window.AudioContext || window.webkitAudioContext;
    if (!A) return null;
    ctx = new A();
    master = ctx.createGain();
    master.gain.value = 0.45;
    master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, dur, { type = "sine", vol = 0.2, delay = 0, slide = null } = {}) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(dur, { vol = 0.2, delay = 0, freq = 1500, q = 1, filter = "bandpass" } = {}) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const f = c.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t, Math.random());
  src.stop(t + dur + 0.05);
}

export const sfx = {
  click: () => tone(900, 0.05, { type: "square", vol: 0.04 }),
  hover: () => tone(1400, 0.03, { type: "sine", vol: 0.015 }),
  type: () => noise(0.025, { vol: 0.05, freq: 3500, q: 2 }),
  search: () => {
    noise(0.18, { vol: 0.12, freq: 2200, q: 0.6 });
    noise(0.22, { vol: 0.1, freq: 1600, q: 0.6, delay: 0.16 });
    noise(0.2, { vol: 0.08, freq: 2600, q: 0.6, delay: 0.34 });
  },
  discover: () => {
    tone(523, 0.25, { vol: 0.12 });
    tone(784, 0.35, { vol: 0.12, delay: 0.09 });
    tone(1046, 0.5, { vol: 0.09, delay: 0.18, type: "triangle" });
  },
  empty: () => tone(140, 0.3, { type: "triangle", vol: 0.15, slide: 90 }),
  pin: () => {
    tone(2200, 0.04, { type: "square", vol: 0.04 });
    noise(0.05, { vol: 0.08, freq: 4000 });
  },
  string: () => tone(330, 0.35, { type: "triangle", vol: 0.1, slide: 320 }),
  snap: () => {
    noise(0.08, { vol: 0.15, freq: 3000, q: 3 });
    tone(600, 0.08, { type: "square", vol: 0.05, slide: 200 });
  },
  stamp: () => {
    tone(70, 0.35, { type: "sine", vol: 0.5, slide: 40 });
    noise(0.15, { vol: 0.3, freq: 600, filter: "lowpass" });
  },
  crack: () => {
    tone(220, 0.15, { type: "sawtooth", vol: 0.08 });
    tone(233, 0.4, { type: "sawtooth", vol: 0.06, delay: 0.12 });
    tone(440, 0.6, { type: "triangle", vol: 0.08, delay: 0.25 });
  },
  deny: () => {
    tone(200, 0.12, { type: "square", vol: 0.05 });
    tone(160, 0.2, { type: "square", vol: 0.05, delay: 0.12 });
  },
  heartbeat: () => {
    tone(60, 0.15, { vol: 0.4, slide: 45 });
    tone(55, 0.15, { vol: 0.3, slide: 40, delay: 0.22 });
  },
  success: () => {
    [392, 523, 659, 784].forEach((f, i) => tone(f, 0.5, { vol: 0.12, delay: i * 0.12, type: "triangle" }));
    tone(1046, 1.2, { vol: 0.1, delay: 0.5 });
  },
  fail: () => {
    [392, 349, 311, 233].forEach((f, i) => tone(f, 0.55, { vol: 0.12, delay: i * 0.22, type: "sawtooth" }));
  },
  coin: () => {
    tone(988, 0.07, { type: "square", vol: 0.04 });
    tone(1319, 0.2, { type: "square", vol: 0.04, delay: 0.06 });
  },
  levelUp: () => {
    [523, 659, 784, 1046, 1319].forEach((f, i) => tone(f, 0.3, { vol: 0.1, delay: i * 0.08, type: "square" }));
  },
  achievement: () => {
    tone(784, 0.2, { vol: 0.1, type: "triangle" });
    tone(1175, 0.5, { vol: 0.1, type: "triangle", delay: 0.1 });
    tone(1568, 0.7, { vol: 0.07, delay: 0.2 });
  }
};
