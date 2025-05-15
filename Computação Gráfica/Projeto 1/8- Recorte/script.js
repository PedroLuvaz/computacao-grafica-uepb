// Definição das regiões
const INSIDE = 0; // 0000
const LEFT   = 1; // 0001
const RIGHT  = 2; // 0010
const BOTTOM = 4; // 0100
const TOP    = 8;  // 1000

// Variáveis globais
let xMin = 150, yMin = 100;
let xMax = 450, yMax = 300;
let lines = [];

function computeRegionCode(x, y) {
  let code = INSIDE;

  if (x < xMin) code |= LEFT;
  else if (x > xMax) code |= RIGHT;

  if (y < yMin) code |= BOTTOM;
  else if (y > yMax) code |= TOP;

  return code;
}


function resetValues() {
    // Define valores padrão
    xMin = 150;
    xMax = 450;
    yMin = 100;
    yMax = 300;
    lines = []; // Limpa as linhas
  
    // Atualiza inputs visuais
    document.getElementById("input-xmin").value = xMin;
    document.getElementById("input-xmax").value = xMax;
    document.getElementById("input-ymin").value = yMin;
    document.getElementById("input-ymax").value = yMax;
  
    // Atualiza texto inferior
    document.getElementById("xmin").textContent = xMin;
    document.getElementById("xmax").textContent = xMax;
    document.getElementById("ymin").textContent = yMin;
    document.getElementById("ymax").textContent = yMax;
  
    // Limpa coordenada clicada
    document.getElementById("clicked-coords").textContent = "Nenhum ponto selecionado";
  
    draw(); // Redesenha a tela
  }


function cohenSutherlandClip(x1, y1, x2, y2) {
  let code1 = computeRegionCode(x1, y1);
  let code2 = computeRegionCode(x2, y2);
  let accept = false;

  while (true) {
    if ((code1 | code2) === 0) {
      accept = true;
      break;
    } else if ((code1 & code2) !== 0) {
      break;
    }

    let x, y;
    const codeOut = code1 !== 0 ? code1 : code2;

    if (codeOut & TOP) {
      x = x1 + (x2 - x1) * (yMax - y1) / (y2 - y1);
      y = yMax;
    } else if (codeOut & BOTTOM) {
      x = x1 + (x2 - x1) * (yMin - y1) / (y2 - y1);
      y = yMin;
    } else if (codeOut & RIGHT) {
      y = y1 + (y2 - y1) * (xMax - x1) / (x2 - x1);
      x = xMax;
    } else if (codeOut & LEFT) {
      y = y1 + (y2 - y1) * (xMin - x1) / (x2 - x1);
      x = xMin;
    }

    if (codeOut === code1) {
      x1 = x;
      y1 = y;
      code1 = computeRegionCode(x1, y1);
    } else {
      x2 = x;
      y2 = y;
      code2 = computeRegionCode(x2, y2);
    }
  }

  return { accept, x1, y1, x2, y2 };
}

function draw() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Atualiza informações visuais
  document.getElementById("xmin").textContent = xMin;
  document.getElementById("xmax").textContent = xMax;
  document.getElementById("ymin").textContent = yMin;
  document.getElementById("ymax").textContent = yMax;

  // Desenha a janela de recorte
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);

  // Desenha as linhas
  for (let line of lines) {
    const [x1, y1, x2, y2] = line;
    const clipped = cohenSutherlandClip(x1, y1, x2, y2);

    // Original em cinza
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Recortada em verde
    if (clipped.accept) {
      ctx.beginPath();
      ctx.moveTo(clipped.x1, clipped.y1);
      ctx.lineTo(clipped.x2, clipped.y2);
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}




// Eventos dos botões
document.getElementById("set-coordinates-btn").addEventListener("click", () => {
  xMin = parseFloat(document.getElementById("input-xmin").value);
  xMax = parseFloat(document.getElementById("input-xmax").value);
  yMin = parseFloat(document.getElementById("input-ymin").value);
  yMax = parseFloat(document.getElementById("input-ymax").value);
  draw();
});

document.getElementById("add-line-btn").addEventListener("click", () => {
  const x1 = parseFloat(document.getElementById("x1").value);
  const y1 = parseFloat(document.getElementById("y1").value);
  const x2 = parseFloat(document.getElementById("x2").value);
  const y2 = parseFloat(document.getElementById("y2").value);
  lines.push([x1, y1, x2, y2]);
  draw();
});

// Coordenadas em tempo real ao passar o mouse
document.getElementById("canvas").addEventListener("mousemove", (e) => {
  const rect = e.target.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);
  document.getElementById("live-coords").textContent = `X: ${x}, Y: ${y}`;
});

// Adiciona linha ao clicar
document.getElementById("canvas").addEventListener("click", (e) => {
  const rect = e.target.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);
  document.getElementById("clicked-coords").textContent = `Último ponto: (${x}, ${y})`;

  staticClickLine(x, y);
});

let clickBuffer = [];

function staticClickLine(x, y) {
  clickBuffer.push({ x, y });
  if (clickBuffer.length === 2) {
    const p1 = clickBuffer[0];
    const p2 = clickBuffer[1];
    lines.push([p1.x, p1.y, p2.x, p2.y]);
    clickBuffer = [];
    draw();
  }
}

document.getElementById("reset-btn").addEventListener("click", resetValues);

draw(); // Primeira renderização