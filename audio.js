(() => {
  let context, master, engineOsc, engineGain, initialized = false;
  function init() {
    if (initialized) { if (context?.state === 'suspended') context.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    context = new AC(); master = context.createGain(); master.gain.value = NSRStore.data.settings.volume; master.connect(context.destination);
    engineOsc = context.createOscillator(); engineOsc.type = 'sawtooth'; engineGain = context.createGain(); engineGain.gain.value = 0.012;
    const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 400; engineOsc.connect(filter); filter.connect(engineGain); engineGain.connect(master); engineOsc.start(); initialized = true;
  }
  function setVolume(value) { if (master) master.gain.setTargetAtTime(Number(value), context.currentTime, .04); }
  function engine(speed, nitro) { if (!initialized) return; engineOsc.frequency.setTargetAtTime(45 + speed * 1.3 + (nitro ? 40 : 0), context.currentTime, .06); engineGain.gain.setTargetAtTime(.008 + speed / 14000, context.currentTime, .08); }
  function tone(freq, duration = .12, type = 'sine', volume = .12) { if (!initialized) return; const osc = context.createOscillator(), gain = context.createGain(); osc.type = type; osc.frequency.setValueAtTime(freq, context.currentTime); gain.gain.setValueAtTime(volume, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration); osc.connect(gain); gain.connect(master); osc.start(); osc.stop(context.currentTime + duration); }
  function near() { tone(760,.12,'triangle',.13); setTimeout(() => tone(1120,.18,'triangle',.1), 65); }
  function crash() { tone(92,.42,'sawtooth',.22); }
  function nitro() { tone(180,.24,'sawtooth',.12); }
  function click() { tone(420,.045,'square',.035); }
  window.NSRAudio = { init, setVolume, engine, near, crash, nitro, click };
})();
