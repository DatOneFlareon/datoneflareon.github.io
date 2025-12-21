// Supported systems with button mappings
const SYSTEMS = {
  nestopia: { name: "NES", extensions: [".nes"], buttons: ["a", "b", "select", "start"] },
  snes9x: { name: "SNES", extensions: [".smc", ".sfc"], buttons: ["a", "b", "x", "y", "select", "start"] },
  genesis_plus_gx: { name: "Sega Genesis", extensions: [".md", ".gen"], buttons: ["a", "b", "c", "start"] },
  gambatte: { name: "Game Boy", extensions: [".gb"], buttons: ["a", "b", "select", "start"] },
  mgba: { name: "Game Boy Advance", extensions: [".gba"], buttons: ["a", "b", "l", "r", "select", "start"] },
  pcsx_rearmed: { name: "PlayStation", extensions: [".bin", ".cue"], buttons: ["cross", "circle", "square", "triangle", "l1", "r1", "start", "select"] },
};

let currentEmulator = null;
let currentSystem = null;

// Detect touch device
const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
const touchControls = document.getElementById("touch-controls");
if (isTouchDevice) {
  touchControls.classList.remove("hidden");
}

// Render system cards
const systemsGrid = document.getElementById("systemsGrid");
for (const [core, info] of Object.entries(SYSTEMS)) {
  const card = document.createElement("div");
  card.className = "system-card";
  card.innerHTML = `<h3>${info.name}</h3>`;
  card.onclick = () => loadSystem(core, info);
  systemsGrid.appendChild(card);
}

function loadSystem(core, info) {
  document.getElementById("system-select").classList.add("hidden");
  document.getElementById("emulator-container").classList.remove("hidden");

  if (currentEmulator) currentEmulator.destroy();
  document.getElementById("emulator-screen").innerHTML = "";

  currentSystem = info;

  currentEmulator = new EmulatorJS({
    container: document.getElementById("emulator-screen"),
    emulatorWasmUrl: "emulator/emulator.wasm",
    core: core,
    width: 640,
    height: 480,
    sampleRate: 44100,
    maxAudioBufferSize: 4096,
  });

  currentEmulator.start();

  if (isTouchDevice) setupTouchControls();
}

function setupTouchControls() {
  // Clear any previous listeners
  const buttons = ["up", "down", "left", "right", "a", "b", "start", "select", "x", "y", "l", "r", "cross", "circle", "square", "triangle", "l1", "r1"];
  buttons.forEach(btn => {
    const el = document.getElementById(`btn-${btn}`);
    if (el) {
      el.onpointerdown = () => currentEmulator.gamepadButtonDown(0, btn);
      el.onpointerup = () => currentEmulator.gamepadButtonUp(0, btn);
      el.onpointerleave = () => currentEmulator.gamepadButtonUp(0, btn); // in case finger slides off
    }
  });

  // D-Pad directional
  document.getElementById("btn-up").onpointerdown = () => currentEmulator.gamepadAxis(0, 1, -1); // Y up = -1
  document.getElementById("btn-up").onpointerup = document.getElementById("btn-up").onpointerleave = () => currentEmulator.gamepadAxis(0, 1, 0);

  document.getElementById("btn-down").onpointerdown = () => currentEmulator.gamepadAxis(0, 1, 1); // Y down = +1
  document.getElementById("btn-down").onpointerup = document.getElementById("btn-down").onpointerleave = () => currentEmulator.gamepadAxis(0, 1, 0);

  document.getElementById("btn-left").onpointerdown = () => currentEmulator.gamepadAxis(0, 0, -1); // X left = -1
  document.getElementById("btn-left").onpointerup = document.getElementById("btn-left").onpointerleave = () => currentEmulator.gamepadAxis(0, 0, 0);

  document.getElementById("btn-right").onpointerdown = () => currentEmulator.gamepadAxis(0, 0, 1); // X right = +1
  document.getElementById("btn-right").onpointerup = document.getElementById("btn-right").onpointerleave = () => currentEmulator.gamepadAxis(0, 0, 0);
}

// Back button
document.getElementById("back-btn").onclick = () => {
  if (currentEmulator) currentEmulator.destroy();
  document.getElementById("emulator-container").classList.add("hidden");
  document.getElementById("system-select").classList.remove("hidden");
};

// Load ROM
document.getElementById("load-rom-btn").onclick = () => {
  document.getElementById("rom-input").click();
};

document.getElementById("rom-input").onchange = (e) => {
  const file = e.target.files[0];
  if (!file || !currentEmulator) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    currentEmulator.setGameBlob(file.name, event.target.result);
  };
  reader.readAsArrayBuffer(file);
};

// Fullscreen
document.getElementById("fullscreen-btn").onclick = () => {
  const screen = document.getElementById("emulator-screen");
  if (screen.requestFullscreen) screen.requestFullscreen();
};