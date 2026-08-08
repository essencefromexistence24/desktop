"use client";

let audioCtx: AudioContext | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

export function playUltraSound() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const now = ctx.currentTime;

  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length;
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8) * 0.7;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.setValueAtTime(2400, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(180, now + 0.55);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.4, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.6);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.5, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc.connect(oscGain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.6);

  const sparkle = ctx.createOscillator();
  sparkle.type = "triangle";
  sparkle.frequency.setValueAtTime(1800, now + 0.05);
  sparkle.frequency.exponentialRampToValueAtTime(4200, now + 0.4);
  const sparkleGain = ctx.createGain();
  sparkleGain.gain.setValueAtTime(0.0, now);
  sparkleGain.gain.linearRampToValueAtTime(0.25, now + 0.1);
  sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  sparkle.connect(sparkleGain).connect(ctx.destination);
  sparkle.start(now);
  sparkle.stop(now + 0.5);
}

export function playClickSound() {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}
