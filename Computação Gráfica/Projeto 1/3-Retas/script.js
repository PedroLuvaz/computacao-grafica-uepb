// ===============================
// Seleção de elementos da interface (DOM)
// ===============================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const liveCoords = document.getElementById("live-coords");
const clickedCoords = document.getElementById("clicked-coords");
const clearBtn = document.getElementById("clear-btn");
const drawLineBtn = document.getElementById("draw-line-btn");
const algorithmSelect = document.getElementById("algorithm-select");
const scrollContainer = document.querySelector(".scroll-container");

let selectedPixel = null;
let previousPixel = null;
let lines = []; // Array para armazenar as retas desenhadas

// ===============================
// Inicialização do canvas
// ===============================
canvas.width = 500;
canvas.height = 500;

// ===============================
// Desenha as linhas dos quadrantes (eixos X e Y)
// ===============================
function desenharQuadrantes() {
    const largura = canvas.width;
    const altura = canvas.height;

    ctx.lineWidth = 0.3;

    // Linha vertical central
    ctx.beginPath();
    ctx.moveTo(largura / 2, 0);
    ctx.lineTo(largura / 2, altura);
    ctx.stroke();

    // Linha horizontal central
    ctx.beginPath();
    ctx.moveTo(0, altura / 2);
    ctx.lineTo(largura, altura / 2);
    ctx.stroke();
}

// ===============================
// Função para desenhar um pixel no canvas
// ===============================
function setPixel(x, y) {
    const canvasX = x + canvas.width / 2;
    const canvasY = canvas.height / 2 - y;  // Inverte o Y para que a direção positiva seja para cima

    ctx.fillStyle = "black";
    ctx.fillRect(canvasX, canvasY, 1, 1);
}

// ===============================
// Função para desenhar todas as retas armazenadas
// ===============================
function drawLines() {
    lines.forEach(line => {
        const selectedAlgorithm = algorithmSelect.value;

        if (selectedAlgorithm === "dda") {
            scrollContainer.innerHTML = "";
            dda(line.x1, line.y1, line.x2, line.y2);
        } else if (selectedAlgorithm === "ponto-medio") {
            scrollContainer.innerHTML = "";
            pontoMedio(line.x1, line.y1, line.x2, line.y2);
        }
    });
}

// ===============================
// Evento para exibir as coordenadas do mouse e quadrante
// ===============================
canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left - canvas.width / 2); 
    const y = Math.round(canvas.height / 2 - (event.clientY - rect.top));

    liveCoords.innerHTML = ` 
        <strong>Coordenada:</strong> (${x}, ${y})<br>
        <strong>Quadrante:</strong> ${atualizarQuadrante(x,y)}
    `;
});

// ===============================
// Evento para capturar cliques e desenhar retas
// ===============================
let clickCount = 0;
let x1, y1;

canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left - canvas.width / 2); 
    const y = Math.round(canvas.height / 2 - (event.clientY - rect.top));

    if (clickCount === 0) {
        // Primeiro ponto da reta
        x1 = x;
        y1 = y;
        clickCount = 1;

        // Preenche os inputs com as coordenadas do primeiro ponto
        document.getElementById("x1").value = x1;
        document.getElementById("y1").value = y1;
    } else if (clickCount === 1) {
        // Segundo ponto da reta, armazena e desenha
        lines.push({ x1, y1, x2: x, y2: y });
        clickCount = 0;
        drawLines();

        // Atualiza painel direito com as coordenadas da reta desenhada
        const lastLine = lines[lines.length - 1];
        document.getElementById("x-initial").textContent = lastLine.x1;
        document.getElementById("y-initial").textContent = lastLine.y1;
        document.getElementById("x-final").textContent = lastLine.x2;
        document.getElementById("y-final").textContent = lastLine.y2;

        // Exibe informações e esconde mensagem de "Nenhuma reta desenhada"
        document.getElementById("clicked-coords").style.display = "block";
        document.getElementById("no-line-message").style.display = "none";

        // Preenche os inputs com as coordenadas do segundo ponto
        document.getElementById("x2").value = x;
        document.getElementById("y2").value = y;
    }
});

// ===============================
// Evento para limpar todas as retas e restaurar o canvas
// ===============================
clearBtn.addEventListener("click", () => {
    lines = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();
    drawLines();

    // Restaura painel direito para o estado inicial
    document.getElementById("no-line-message").style.display = "block";
    document.getElementById("clicked-coords").style.display = "none";

    // Limpa os campos de entrada
    document.getElementById("x1").value = '';
    document.getElementById("y1").value = '';
    document.getElementById("x2").value = '';
    document.getElementById("y2").value = '';

    scrollContainer.innerHTML = "";
});

// ===============================
// Evento para trocar o algoritmo de desenho de reta
// ===============================
algorithmSelect.addEventListener("change", () => {
    lines = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();
    drawLines();

    // Restaura painel direito para o estado inicial
    document.getElementById("no-line-message").style.display = "block";
    document.getElementById("clicked-coords").style.display = "none";

    // Limpa os campos de entrada
    document.getElementById("x1").value = '';
    document.getElementById("y1").value = '';
    document.getElementById("x2").value = '';
    document.getElementById("y2").value = '';
});

// ===============================
// Evento do botão "Desenhar" para criar uma reta via inputs
// ===============================
drawLineBtn.addEventListener("click", () => {
    const x1Value = parseInt(document.getElementById("x1").value);
    const y1Value = parseInt(document.getElementById("y1").value);
    const x2Value = parseInt(document.getElementById("x2").value);
    const y2Value = parseInt(document.getElementById("y2").value);

    lines.push({ x1: x1Value, y1: y1Value, x2: x2Value, y2: y2Value });
    drawLines();

    // Atualiza painel direito com as coordenadas da reta desenhada
    const lastLine = lines[lines.length - 1];
    document.getElementById("x-initial").textContent = lastLine.x1;
    document.getElementById("y-initial").textContent = lastLine.y1;
    document.getElementById("x-final").textContent = lastLine.x2;
    document.getElementById("y-final").textContent = lastLine.y2;

    // Exibe as coordenadas e esconde a mensagem "Nenhuma reta desenhada"
    document.getElementById("clicked-coords").style.display = "block";
    document.getElementById("no-line-message").style.display = "none";
});

// ===============================
// Inicializa o canvas com o plano cartesiano
// ===============================
desenharQuadrantes();

// ===============================
// Função para identificar o quadrante do ponto
// ===============================
function atualizarQuadrante(x, y) {
    let quadrante = '';
    if (x > 0 && y > 0) {
        return quadrante = '1';
    } else if (x < 0 && y > 0) {
        return quadrante = '2';
    } else if (x < 0 && y < 0) {
        return quadrante = '3';
    } else if (x > 0 && y < 0) {
        return quadrante = '4';
    } else if (x === 0 && y !== 0) {
        return quadrante = 'Eixo Y';
    } else if (y === 0 && x !== 0) {
        return quadrante = 'Eixo X';
    } else {
        return quadrante = 'Origem';
    }
}

// ===============================
// Função auxiliar para adicionar coordenadas na barra lateral
// ===============================
function addCoordToSidebar(x, y, count) {
    let coordElement = document.createElement("div");
    coordElement.innerHTML = `<div style="justify-content: space-between; display: flex;"><strong>X${count}:</strong> ${x} <strong>Y${count}:</strong> ${y}</div><hr>`;
    scrollContainer.appendChild(coordElement);
}

// ===============================
// Algoritmo DDA para desenhar retas
// ===============================
function dda(x1, y1, x2, y2) {
    const length = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    const xinc = (x2 - x1) / length;
    const yinc = (y2 - y1) / length;

    let x = x1;
    let y = y1;

    let count = 0;

    setPixel(Math.round(x), Math.round(y));

    while (Math.abs(x - x2) > Math.abs(xinc) || Math.abs(y - y2) > Math.abs(yinc)) {
        x += xinc;
        y += yinc;

        count++;

        setPixel(Math.round(x), Math.round(y));
        addCoordToSidebar(Math.round(x), Math.round(y), count);
    }
}

// ===============================
// Algoritmo do Ponto Médio (Bresenham) para desenhar retas
// ===============================
function pontoMedio(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    if(dy < dx) { // |m| < 1.0 (1º Oitante)
        let ds = 2 * dy - dx;
        const incE = 2 * dy;
        const incNE = 2 * (dy - dx);

        let x = x1;
        let y = y1;
        let count = 0;

        setPixel(x, y);

        while (x < x2) {
            if (ds <= 0) {
                ds += incE;
                x += 1;
            } else {
                ds += incNE;
                x += 1;
                y += 1;
            }
            count++;
            setPixel(x, y);
            addCoordToSidebar(x, y, count);
        }
    } else { // |m| >= 1.0 (2º Oitante)
        let ds = 2 * dx - dy;
        const incE = 2 * dx;
        const incNE = 2 * (dx - dy);

        let x = x1;
        let y = y1;
        let count = 0;

        setPixel(x, y);

        while (y < y2) {
            if (ds <= 0) {
                ds += incE;
                y += 1;
            } else {
                ds += incNE;
                y += 1;
                x += 1;
            }
            count++;
            setPixel(x, y);
            addCoordToSidebar(x, y, count);
        }
    }
}