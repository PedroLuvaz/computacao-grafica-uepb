// ===============================
// Definição das regiões para o algoritmo de Cohen-Sutherland
// ===============================
const INSIDE = 0; // 0000
const LEFT   = 1; // 0001
const RIGHT  = 2; // 0010
const BOTTOM = 4; // 0100
const TOP    = 8; // 1000

// ===============================
// Variáveis globais para limites, linhas e histórico
// ===============================
let xMin = 150, yMin = 100;
let xMax = 450, yMax = 300;
let lines = [];
let history = []; // Histórico de recortes

// ===============================
// Função para calcular o código da região de um ponto (bits)
// ===============================
function computeRegionCode(x, y) {
  let code = INSIDE;
  if (x < xMin) code |= LEFT;
  else if (x > xMax) code |= RIGHT;
  if (y < yMin) code |= BOTTOM;
  else if (y > yMax) code |= TOP;
  return code;
}

// ===============================
// Função para converter código da região em string de bits
// ===============================
function codeToBits(code) {
  return (code >>> 0).toString(2).padStart(4, '0');
}

// ===============================
// Função para resetar valores e interface
// ===============================
function resetValues() {
  xMin = 150;
  xMax = 450;
  yMin = 100;
  yMax = 300;
  lines = [];
  history = [];
  document.getElementById("input-xmin").value = xMin;
  document.getElementById("input-xmax").value = xMax;
  document.getElementById("input-ymin").value = yMin;
  document.getElementById("input-ymax").value = yMax;
  document.getElementById("xmin").textContent = xMin;
  document.getElementById("xmax").textContent = xMax;
  document.getElementById("ymin").textContent = yMin;
  document.getElementById("ymax").textContent = yMax;
  document.getElementById("clicked-coords").textContent = "Nenhum ponto selecionado";
  updateHistorySidebar();
  draw();
}

// ===============================
// Algoritmo de recorte de linhas de Cohen-Sutherland (com histórico)
// ===============================
function cohenSutherlandClip(x1, y1, x2, y2) {
  let code1 = computeRegionCode(x1, y1);
  let code2 = computeRegionCode(x2, y2);
  let accept = false;
  let steps = [];

  steps.push({
    x1, y1, x2, y2,
    code1: codeToBits(code1),
    code2: codeToBits(code2),
    action: 'Inicial'
  });

  while (true) {
    if ((code1 | code2) === 0) {
      accept = true;
      steps.push({
        x1, y1, x2, y2,
        code1: codeToBits(code1),
        code2: codeToBits(code2),
        action: 'Aceita (dentro)'
      });
      break;
    } else if ((code1 & code2) !== 0) {
      steps.push({
        x1, y1, x2, y2,
        code1: codeToBits(code1),
        code2: codeToBits(code2),
        action: 'Rejeitada (fora)'
      });
      break;
    }

    let x, y;
    const codeOut = code1 !== 0 ? code1 : code2;
    let action = '';

    if (codeOut & TOP) {
      x = x1 + (x2 - x1) * (yMax - y1) / (y2 - y1);
      y = yMax;
      action = 'Recorte TOP';
    } else if (codeOut & BOTTOM) {
      x = x1 + (x2 - x1) * (yMin - y1) / (y2 - y1);
      y = yMin;
      action = 'Recorte BOTTOM';
    } else if (codeOut & RIGHT) {
      y = y1 + (y2 - y1) * (xMax - x1) / (x2 - x1);
      x = xMax;
      action = 'Recorte RIGHT';
    } else if (codeOut & LEFT) {
      y = y1 + (y2 - y1) * (xMin - x1) / (x2 - x1);
      x = xMin;
      action = 'Recorte LEFT';
    }

    if (codeOut === code1) {
      steps.push({
        x1, y1, x2, y2,
        code1: codeToBits(code1),
        code2: codeToBits(code2),
        action
      });
      x1 = x;
      y1 = y;
      code1 = computeRegionCode(x1, y1);
    } else {
      steps.push({
        x1, y1, x2, y2,
        code1: codeToBits(code1),
        code2: codeToBits(code2),
        action
      });
      x2 = x;
      y2 = y;
      code2 = computeRegionCode(x2, y2);
    }
  }

  // Armazena o histórico deste recorte
  history.push(steps);

  return { accept, x1, y1, x2, y2, steps };
}

// ===============================
// Função para desenhar um pixel no canvas
// ===============================
function setPixel(x, y, color = "#000000") {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
}

// ===============================
// Algoritmo DDA para desenhar uma linha pixel a pixel
// ===============================
function drawLineDDA(x1, y1, x2, y2, color = "#000000") {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let steps = Math.max(Math.abs(dx), Math.abs(dy));
  let xInc = dx / steps;
  let yInc = dy / steps;
  let x = x1;
  let y = y1;
  for (let i = 0; i <= steps; i++) {
    setPixel(x, y, color);
    x += xInc;
    y += yInc;
  }
}

// Flag para mostrar apenas as partes aceitas após aplicar recorte
let showOnlyClipped = false;

// ===============================
// Função principal de desenho (canvas e linhas)
// ===============================
function draw() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Atualiza limites na interface
  document.getElementById("xmin").textContent = xMin;
  document.getElementById("xmax").textContent = xMax;
  document.getElementById("ymin").textContent = yMin;
  document.getElementById("ymax").textContent = yMax;

  // Desenha a janela de recorte (retângulo azul)
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);

  for (let i = 0; i < lines.length; i++) {
    const [x1, y1, x2, y2] = lines[i];
    const clipped = cohenSutherlandClip(x1, y1, x2, y2);

    if (!showOnlyClipped) {
      // Desenha os segmentos descartados em vermelho
      const steps = clipped.steps;
      for (let j = 1; j < steps.length; j++) {
        const prev = steps[j - 1];
        const curr = steps[j];
        if (curr.action.startsWith("Recorte")) {
          if (curr.x1 !== prev.x1 || curr.y1 !== prev.y1) {
            drawLineDDA(prev.x1, prev.y1, curr.x1, curr.y1, "#b00");
          }
          if (curr.x2 !== prev.x2 || curr.y2 !== prev.y2) {
            drawLineDDA(prev.x2, prev.y2, curr.x2, curr.y2, "#b00");
          }
        }
      }
      // Linha original em vermelho
      drawLineDDA(x1, y1, x2, y2, "#b00");
    }

    // Linha recortada em verde (DDA, se aceita)
    if (clipped.accept) {
      drawLineDDA(clipped.x1, clipped.y1, clipped.x2, clipped.y2, "green");
    }
  }

  updateHistorySidebar();
}

// ===============================
// Atualiza o histórico na barra lateral direita
// ===============================
function updateHistorySidebar() {
  const sidebar = document.getElementById("history-sidebar");
  if (!sidebar) return;

  if (history.length === 0) {
    sidebar.innerHTML = "<p>Nenhum histórico de recorte.</p>";
    return;
  }

  sidebar.innerHTML = history.map((steps, idx) => {
    const finalStep = steps[steps.length - 1];
    let accepted = false;
    let acceptedSegment = null;
    let discardedSegments = [];

    // Percorre os passos para identificar todos os segmentos descartados
    for (let i = 1; i < steps.length; i++) {
      const prev = steps[i - 1];
      const curr = steps[i];
      if (curr.action.startsWith("Recorte")) {
        let recorteMath = "";
        if (curr.action === "Recorte TOP") {
          recorteMath = `y = yMax = ${yMax}<br>x = x1 + (x2 - x1) * (yMax - y1) / (y2 - y1)`;
        } else if (curr.action === "Recorte BOTTOM") {
          recorteMath = `y = yMin = ${yMin}<br>x = x1 + (x2 - x1) * (yMin - y1) / (y2 - y1)`;
        } else if (curr.action === "Recorte RIGHT") {
          recorteMath = `x = xMax = ${xMax}<br>y = y1 + (y2 - y1) * (xMax - x1) / (x2 - x1)`;
        } else if (curr.action === "Recorte LEFT") {
          recorteMath = `x = xMin = ${xMin}<br>y = y1 + (y2 - y1) * (xMin - x1) / (x2 - x1)`;
        }

        // Descobre qual ponto foi alterado (recortado)
        if (curr.x1 !== prev.x1 || curr.y1 !== prev.y1) {
          // O ponto 1 foi recortado
          discardedSegments.push({
            from: { x: prev.x1, y: prev.y1 },
            to: { x: curr.x1, y: curr.y1 },
            codeFrom: prev.code1,
            codeTo: curr.code1,
            side: curr.action,
            math: recorteMath
          });
        }
        if (curr.x2 !== prev.x2 || curr.y2 !== prev.y2) {
          // O ponto 2 foi recortado
          discardedSegments.push({
            from: { x: prev.x2, y: prev.y2 },
            to: { x: curr.x2, y: curr.y2 },
            codeFrom: prev.code2,
            codeTo: curr.code2,
            side: curr.action,
            math: recorteMath
          });
        }
      }
    }

    if (finalStep.action.startsWith("Aceita")) {
      accepted = true;
      acceptedSegment = {
        from: { x: finalStep.x1, y: finalStep.y1 },
        to: { x: finalStep.x2, y: finalStep.y2 },
        codeFrom: finalStep.code1,
        codeTo: finalStep.code2
      };
    }

    return `
      <div class="history-block">
        <strong>Linha ${idx + 1}:</strong>
        <ul>
          ${discardedSegments.map(seg => `
            <li class="is-discarded">
              <span><b>Descartado</b> (${seg.side}):</span><br>
              <span>P1=(${seg.from.x.toFixed(1)}, ${seg.from.y.toFixed(1)}) [${seg.codeFrom}]</span> →
              <span>P2=(${seg.to.x.toFixed(1)}, ${seg.to.y.toFixed(1)}) [${seg.codeTo}]</span><br>
              <span class="clip-math">${seg.math}</span>
            </li>
          `).join('')}
          ${accepted && acceptedSegment ? `
            <li class="is-accepted">
              <span><b>Aceito</b>:</span><br>
              <span>P1=(${acceptedSegment.from.x.toFixed(1)}, ${acceptedSegment.from.y.toFixed(1)}) [${acceptedSegment.codeFrom}]</span> →
              <span>P2=(${acceptedSegment.to.x.toFixed(1)}, ${acceptedSegment.to.y.toFixed(1)}) [${acceptedSegment.codeTo}]</span>
            </li>
          ` : `
            <li class="is-discarded"><b>Rejeitada</b>: Nenhum segmento aceito</li>
          `}
        </ul>
      </div>
    `;
  }).join('');
}

// ===============================
// Evento para mostrar coordenadas do mouse em tempo real
// ===============================
document.getElementById("canvas").addEventListener("mousemove", (e) => {
  const rect = e.target.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);
  document.getElementById("live-coords").textContent = `X: ${x}, Y: ${y}`;
});

// ===============================
// Evento para adicionar linha ao clicar no canvas
// ===============================
document.getElementById("canvas").addEventListener("click", (e) => {
  const rect = e.target.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);
  document.getElementById("clicked-coords").textContent = `Último ponto: (${x}, ${y})`;

  staticClickLine(x, y);
});

// ===============================
// Função auxiliar para adicionar linha por clique duplo
// ===============================
let clickBuffer = [];
function staticClickLine(x, y) {
  clickBuffer.push({ x, y });
  if (clickBuffer.length === 2) {
    const p1 = clickBuffer[0];
    const p2 = clickBuffer[1];
    lines.push([p1.x, p1.y, p2.x, p2.y]);
    draw();
    clickBuffer = [];
  }
}

// ===============================
// Evento para resetar tudo para o estado inicial
// ===============================
document.getElementById("reset-btn").addEventListener("click", resetValues);

// ===============================
// Botão para aplicar recorte e mostrar só as partes aceitas
// ===============================
document.getElementById("apply-clip-btn").addEventListener("click", () => {
  showOnlyClipped = true;
  draw();
});

// Se quiser voltar a mostrar tudo ao resetar:
document.getElementById("reset-btn").addEventListener("click", () => {
  showOnlyClipped = false;
  resetValues();
});

// ===============================
// Evento para adicionar linha manualmente pelos inputs
// ===============================
document.getElementById("add-line-btn").addEventListener("click", () => {
  const x1 = parseFloat(document.getElementById("x1").value);
  const y1 = parseFloat(document.getElementById("y1").value);
  const x2 = parseFloat(document.getElementById("x2").value);
  const y2 = parseFloat(document.getElementById("y2").value);

  if (
    isNaN(x1) || isNaN(y1) ||
    isNaN(x2) || isNaN(y2)
  ) {
    alert("Preencha todos os campos com valores válidos.");
    return;
  }

  lines.push([x1, y1, x2, y2]);
  draw();

  // Limpa os campos após adicionar
  document.getElementById("x1").value = "";
  document.getElementById("y1").value = "";
  document.getElementById("x2").value = "";
  document.getElementById("y2").value = "";
});


// ===============================
// Primeira renderização ao carregar a página
// ===============================
draw();