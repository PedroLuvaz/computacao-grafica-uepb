const canvas = document.getElementById("cardioCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

let t = 0;
let speed = 1; // valor inicial da velocidade
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

  // ECG mais fiel: P, Q, R, S, T (ciclo de 100)
  // Parâmetros do ciclo
  const baseY = height / 2;
  let value = 0;
  const cycle = t % 100;

  if (cycle < 10) {
    // Onda P (pequena subida)
    value = -8 * Math.sin(Math.PI * cycle / 10);
  } else if (cycle < 20) {
    // Linha base
    value = 0;
  } else if (cycle < 25) {
    // Q (descida curta)
    value =  -15 * (cycle - 20) / 5;
  } else if (cycle < 30) {
    // R (pico alto)
    value =  -15 + 60 * (cycle - 25) / 5;
  } else if (cycle < 35) {
    // S (descida rápida)
    value =  45 - 35 * (cycle - 30) / 5;
  } else if (cycle < 50) {
    // Retorno à linha base
    value = 10 * Math.sin(Math.PI * (cycle - 35) / 15);
  } else if (cycle < 70) {
    // Onda T (suave)
    value = 12 * Math.sin(Math.PI * (cycle - 50) / 20);
  } else {
    // Linha base
    value = 0;
  }

  // Oscilação leve para simular ruído fisiológico
  value += Math.sin(t * 0.12) * 2;

  history.push(baseY + value);
  if (history.length > width) {
    history.shift();
  }

  // Desenha a linha do batimento usando DDA
  ctx.fillStyle = "#ff0000";
  for (let i = 1; i < history.length; i++) {
    drawLineDDA(i - 1, history[i - 1], i, history[i]);
  }

  t += speed;
  requestAnimationFrame(drawCardio);
}

// Função para registrar BPM aproximado
function recordBPM() {
    const now = Date.now();
    // Se não houver histórico, apenas registra o tempo
    if (bpmHistory.length === 0) {
        bpmHistory.push(now);
        history.push("Primeiro batimento registrado.");
    } else {
        // Calcula intervalo em segundos
        const last = bpmHistory[bpmHistory.length - 1];
        const interval = (now - last) / 1000;
        const bpm = Math.round(60 / interval);
        bpmHistory.push(now);
        history.push(`BPM: ${bpm} (${new Date(now).toLocaleTimeString()})`);
    }
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
