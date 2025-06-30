const canvas = document.getElementById("cardioCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

let t = 0;
let speed = 1;
const history = [];
const bpmHistory = [];


let detectingRPeak = false;
let ecgMode = "rest";
let modeParams = {
  rest:    { baseBPM: 60, amplitude: 20, noise: 1.5, desc: "Repouso" },
  run:     { baseBPM: 140, amplitude: 35, noise: 4, desc: "Corrida" },
  stress:  { baseBPM: 110, amplitude: 28, noise: 3, desc: "Estresse" },
  sleep:   { baseBPM: 45, amplitude: 12, noise: 0.7, desc: "Sono" }
};

document.getElementById("speedRange").addEventListener("input", function () {
  speed = parseInt(this.value);
  document.getElementById("speedValue").textContent = speed;
});

document.getElementById("ecg-mode").addEventListener("change", function () {
  ecgMode = this.value;
  t = 0;
  history.length = 0;
  bpmHistory.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("historyBox").innerHTML = "Nenhum batimento registrado.";
});

function drawLineDDA(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  const xIncrement = dx / steps;
  const yIncrement = dy / steps;

  let x = x1;
  let y = y1;

  for (let i = 0; i <= steps; i++) {
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    x += xIncrement;
    y += yIncrement;
  }
}

function drawCardio() {
  ctx.clearRect(0, 0, width, height);

  // Fundo quadriculado tipo ECG
  ctx.strokeStyle = "#f4c2c2";
  ctx.lineWidth = 1;
  for (let y = 0; y <= height; y += 10) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let x = 0; x <= width; x += 10) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Linha base
  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Parâmetros do modo
  const params = modeParams[ecgMode];
  const bpm = params.baseBPM + (speed - 5) * 4; // velocidade afeta BPM
  const period = Math.round(60 * 60 / bpm); // quanto menor o período, mais rápido o ciclo
  const amplitude = params.amplitude;
  const noiseLevel = params.noise;

  const baseY = height / 2;
  let value = 0;
  const cycle = t % period;

  // Curvas diferentes para cada modo
 if (ecgMode === "rest") {
  if (cycle < period * 0.08) {
    value = 6 * Math.sin(Math.PI * cycle / (period * 0.08)); // invertido
  } else if (cycle < period * 0.16) {
    value = 0;
  } else if (cycle < period * 0.21) {
    value = amplitude * ((cycle - period * 0.16) / (period * 0.05)); // invertido
  } else if (cycle < period * 0.26) {
    value = amplitude - (amplitude + 58) * ((cycle - period * 0.21) / (period * 0.05)); // invertido
  } else if (cycle < period * 0.31) {
    value = -58 + 40 * ((cycle - period * 0.26) / (period * 0.05)); // invertido
  } else if (cycle < period * 0.36) {
    value = -18 * Math.sin(Math.PI * (cycle - period * 0.31) / (period * 0.05)); // invertido
  } else if (cycle < period * 0.5) {
    value = 0;
  } else if (cycle < period * 0.58) {
    value = -15 * Math.sin(Math.PI * (cycle - period * 0.5) / (period * 0.08)); // invertido
  } else if (cycle < period * 0.66) {
    value = 0;
  } else if (cycle < period * 0.75) {
    value = -6 * Math.sin(Math.PI * (cycle - period * 0.66) / (period * 0.09)); // invertido
  } else {
    value = 0;
  }
} else if (ecgMode === "run") {
  if (cycle < period * 0.05) {
    value = 8 * Math.sin(Math.PI * cycle / (period * 0.05));
  } else if (cycle < period * 0.12) {
    value = 0;
  } else if (cycle < period * 0.18) {
    value = amplitude * ((cycle - period * 0.12) / (period * 0.06));
  } else if (cycle < period * 0.22) {
    value = amplitude - (amplitude + 80) * ((cycle - period * 0.18) / (period * 0.04));
  } else if (cycle < period * 0.28) {
    value = -80 + 50 * ((cycle - period * 0.22) / (period * 0.06));
  } else if (cycle < period * 0.35) {
    value = -25 * Math.sin(Math.PI * (cycle - period * 0.28) / (period * 0.07));
  } else {
    value = 0;
  }
} else if (ecgMode === "stress") {
  if (cycle < period * 0.07) {
    value = 7 * Math.sin(Math.PI * cycle / (period * 0.07));
  } else if (cycle < period * 0.15) {
    value = 0;
  } else if (cycle < period * 0.22) {
    value = amplitude * ((cycle - period * 0.15) / (period * 0.07));
  } else if (cycle < period * 0.27) {
    value = amplitude - (amplitude + 65) * ((cycle - period * 0.22) / (period * 0.05));
  } else if (cycle < period * 0.33) {
    value = -65 + 35 * ((cycle - period * 0.27) / (period * 0.06));
  } else if (cycle < period * 0.4) {
    value = -15 * Math.sin(Math.PI * (cycle - period * 0.33) / (period * 0.07));
  } else {
    value = 0;
  }
} else if (ecgMode === "sleep") {
  if (cycle < period * 0.12) {
    value = 3 * Math.sin(Math.PI * cycle / (period * 0.12));
  } else if (cycle < period * 0.22) {
    value = 0;
  } else if (cycle < period * 0.28) {
    value = amplitude * ((cycle - period * 0.22) / (period * 0.06));
  } else if (cycle < period * 0.34) {
    value = amplitude - (amplitude + 30) * ((cycle - period * 0.28) / (period * 0.06));
  } else if (cycle < period * 0.42) {
    value = -30 + 15 * ((cycle - period * 0.34) / (period * 0.08));
  } else if (cycle < period * 0.5) {
    value = -7 * Math.sin(Math.PI * (cycle - period * 0.42) / (period * 0.08));
  } else {
    value = 0;
  }
}

  // Ruído fisiológico
  value += Math.sin(t * 0.12) * noiseLevel;
  value += Math.random() * noiseLevel * 0.7 - noiseLevel * 0.35; // ruído aleatório

  // Registrar valor
  history.push(baseY + value);
  if (history.length > width) {
    history.shift();
  }

  // Desenhar ECG
  ctx.fillStyle = "#0033cc";
  for (let i = 1; i < history.length; i++) {
    drawLineDDA(i - 1, history[i - 1], i, history[i]);
  }

  // Detectar batimento no pico R (ajuste para cada modo)
  let rPeakStart = period * 0.21, rPeakEnd = period * 0.26;
  if (ecgMode === "run") { rPeakStart = period * 0.18; rPeakEnd = period * 0.22; }
  if (ecgMode === "stress") { rPeakStart = period * 0.22; rPeakEnd = period * 0.27; }
  if (ecgMode === "sleep") { rPeakStart = period * 0.28; rPeakEnd = period * 0.34; }

  if (cycle >= rPeakStart && cycle < rPeakEnd && !detectingRPeak) {
    detectingRPeak = true;
    recordBPM();
  }
  if (cycle >= rPeakEnd) {
    detectingRPeak = false;
  }

  // Atualizar histórico a cada 10 segundos
  if (t % (60 * 10) === 0) {
    updateHistoryBox();
  }

  t += speed;
  requestAnimationFrame(drawCardio);
}

function recordBPM() {
  const now = Date.now();
  bpmHistory.push(now);
}

function updateHistoryBox() {
  const now = Date.now();
  const recent = bpmHistory.filter(time => now - time <= 60000);
  const bpm = recent.length;

  const historyBox = document.getElementById("historyBox");
  const time = new Date(now).toLocaleTimeString();

  const lastEntry = `BPM estimado: <strong>${bpm}</strong> às ${time}<br>`;
  historyBox.innerHTML += lastEntry;

  const lines = historyBox.innerHTML.split('<br>').filter(Boolean);
  if (lines.length > 10) {
    historyBox.innerHTML = lines.slice(-10).join('<br>') + "<br>";
  }
}

document.getElementById("clear-btn").addEventListener("click", function () {
  bpmHistory.length = 0;
  document.getElementById("historyBox").innerHTML = "Nenhum batimento registrado.";
});

document.getElementById("reset-btn").addEventListener("click", function () {
  t = 0;
  history.length = 0;
  bpmHistory.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("historyBox").innerHTML = "Nenhum batimento registrado.";
});

document.querySelector(".batimento-btn").addEventListener("click", function () {
  recordBPM();
  updateHistoryBox();
});

drawCardio();
