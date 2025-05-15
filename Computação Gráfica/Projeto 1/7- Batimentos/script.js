const canvas = document.getElementById("cardioCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

let t = 0;
let speed = 5; // valor inicial da velocidade
const history = [];
const bpmHistory = [];

// Atualiza velocidade com slider
document.getElementById("speedRange").addEventListener("input", function () {
  speed = parseInt(this.value);
  document.getElementById("speedValue").textContent = speed;
});

// Função DDA para desenhar linhas pixelizadas
function drawLineDDA(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  const xIncrement = dx / steps;
  const yIncrement = dy / steps;

  let x = x1;
  let y = y1;

  for (let i = 0; i <= steps; i++) {
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1); // Desenha um pixel
    x += xIncrement;
    y += yIncrement;
  }
}

function drawCardio() {
  ctx.clearRect(0, 0, width, height);

  // Desenha grade horizontal
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1;
  for (let y = 0; y <= height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Linha central
  ctx.strokeStyle = "#f0f0f0";
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // Simula batimento cardíaco com características de ECG
  const frequency = speed * 0.01;
  let value = Math.sin(t * frequency) * 10; // Base oscilante

  // Adiciona picos característicos do ECG
  if (t % 100 === 0) {
    value += 50; // Pico R
  } else if (t % 100 === 20) {
    value -= 20; // Pico Q
  } else if (t % 100 === 40) {
    value += 30; // Pico S
  } else if (t % 100 === 60) {
    value += 15; // Onda T
  } else if (t % 100 === 80) {
    value += 5; // Onda P
  }

  history.push(height / 2 - value);
  if (history.length > width) {
    history.shift();
  }

  // Desenha a linha do batimento usando DDA
  ctx.fillStyle = "#ff0000"; // Cor do traço
  for (let i = 1; i < history.length; i++) {
    drawLineDDA(i - 1, history[i - 1], i, history[i]);
  }

  t++;
  requestAnimationFrame(drawCardio);
}

// Função para registrar BPM aproximado
function recordBPM() {
  const now = Date.now();
  bpmHistory.push(now);
  updateHistoryBox();
}

//Função para resetar a simulação
function resetSimulation() {
    t = 0;           // Reinicia o tempo virtual
    history.length = 0; // Limpa histórico da linha
    bpmHistory.length = 0; // Limpa histórico de BPM
    updateHistoryBox(); // Atualiza caixa de histórico
  
    // Redesenha imediatamente com tela limpa
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }


// Atualiza histórico de batimentos
function updateHistoryBox() {
  const filtered = bpmHistory.filter(time => time > Date.now() - 60000); // últimos 60s
  const bpm = filtered.length;
  const historyBox = document.getElementById("historyBox");
  historyBox.innerHTML = `Últimos 60 segundos: <strong>${bpm} BPM</strong>`;
}

// Botão limpar histórico
document.getElementById("clear-btn").addEventListener("click", function () {
  bpmHistory.length = 0;
  updateHistoryBox();
});

//Botão de resetar simulação
document.getElementById("reset-btn").addEventListener("click", function () {
    resetSimulation();
  });

drawCardio(); // Inicia animação