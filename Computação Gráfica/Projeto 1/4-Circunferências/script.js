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
let circles = []; // Array para armazenar as circunferências desenhadas

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
// Função para desenhar todas as circunferências armazenadas
// ===============================
function drawCircles() {
    circles.forEach(circle => {
        const selectedAlgorithm = algorithmSelect.value;

        if (selectedAlgorithm === "eqex") {
            scrollContainer.innerHTML = "";
            drawCircleUsingExplicitEquation(circle.x, circle.y, circle.r);
        } else if (selectedAlgorithm === "trigo") {
            scrollContainer.innerHTML = "";
            drawCircleUsingTrigonometric(circle.x, circle.y, circle.r);
        } else if (selectedAlgorithm === "ponto-medio") {
            scrollContainer.innerHTML = "";
            drawCircleUsingMidPoint(circle.x, circle.y, circle.r);
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
// Evento para capturar cliques e desenhar circunferências
// ===============================
let clickCount = 0;
let cx, cy, r;

canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left - canvas.width / 2);
    const y = Math.round(canvas.height / 2 - (event.clientY - rect.top));

    if (clickCount === 0) {
        // Primeiro clique: define o centro da circunferência
        cx = x;
        cy = y;
        clickCount = 1;

        document.getElementById("x").value = cx;
        document.getElementById("y").value = cy;
    } else if (clickCount === 1) {
        // Segundo clique: calcula o raio e armazena a circunferência
        r = Math.round(Math.sqrt((x - cx) ** 2 + (y - cy) ** 2));
        circles.push({ x: cx, y: cy, r: r });
        clickCount = 0;

        document.getElementById("r").value = r;
        
        // Desenha a circunferência após o segundo clique
        drawCircles();

        // Atualiza o painel direito com as informações da circunferência
        document.getElementById("x-ponto").textContent = cx;
        document.getElementById("y-ponto").textContent = cy;
        document.getElementById("raio").textContent = r;

        document.getElementById("clicked-coords").style.display = "block";
        document.getElementById("no-line-message").style.display = "none";
    }
});

// ===============================
// Evento para limpar todas as circunferências e restaurar o canvas
// ===============================
clearBtn.addEventListener("click", () => {
    circles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();
    drawCircles();

    document.getElementById("no-line-message").style.display = "block";
    document.getElementById("clicked-coords").style.display = "none";

    document.getElementById("x").value = '';
    document.getElementById("y").value = '';
    document.getElementById("r").value = '';

    scrollContainer.innerHTML = "";
});

// ===============================
// Evento para trocar o algoritmo de desenho de circunferência
// ===============================
algorithmSelect.addEventListener("change", () => {
    circles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();
    drawCircles();

    document.getElementById("no-line-message").style.display = "block";
    document.getElementById("clicked-coords").style.display = "none";

    document.getElementById("x").value = '';
    document.getElementById("y").value = '';
    document.getElementById("r").value = '';
});

// ===============================
// Evento do botão "Desenhar" para criar circunferência via inputs
// ===============================
drawLineBtn.addEventListener("click", () => {
    const xValue = parseInt(document.getElementById("x").value);
    const yValue = parseInt(document.getElementById("y").value);
    const rValue = parseInt(document.getElementById("r").value);

    circles.push({ x: xValue, y: yValue, r: rValue });
    drawCircles();

    const lastCircle = circles[circles.length - 1];
    document.getElementById("x-ponto").textContent = lastCircle.x;
    document.getElementById("y-ponto").textContent = lastCircle.y;
    document.getElementById("raio").textContent = lastCircle.r;

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
// Algoritmo da Equação Explícita para circunferência
// ===============================
function drawCircleUsingExplicitEquation(xc, yc, r) {
    let count = 1; 
    for (let x = -r; x <= r; x++) {
        let y = Math.round(Math.sqrt(r * r - x * x)); 

        setPixel(xc + x, yc + y);
        addCoordToSidebar(xc + x, yc + y, count++);

        setPixel(xc + x, yc - y);
        addCoordToSidebar(xc + x, yc - y, count++);
    }
}

// ===============================
// Algoritmo Trigonométrico para circunferência
// ===============================
function drawCircleUsingTrigonometric(xc, yc, r) {
    const step = 0.1;  
    let count = 1; 
    for (let theta = 0; theta < 2 * Math.PI; theta += step) {
        let x = Math.round(xc + r * Math.cos(theta));
        let y = Math.round(yc + r * Math.sin(theta));

        setPixel(x, y);
        addCoordToSidebar(x, y, count++);
    }
}

// ===============================
// Algoritmo do Ponto Médio para circunferência
// ===============================
function drawCircleUsingMidPoint(xc, yc, r) {
    let x = 0;
    let y = r;
    let p = 1 - r;  
    let count = 1;

    function plotCirclePoints(xc, yc, x, y) {
        setPixel(xc + x, yc + y); 
        addCoordToSidebar(xc + x, yc + y, count); 
        count++;

        setPixel(xc - x, yc + y); 
        addCoordToSidebar(xc - x, yc + y, count); 
        count++;

        setPixel(xc + x, yc - y); 
        addCoordToSidebar(xc + x, yc - y, count); 
        count++;

        setPixel(xc - x, yc - y); 
        addCoordToSidebar(xc - x, yc - y, count); 
        count++;

        setPixel(xc + y, yc + x); 
        addCoordToSidebar(xc + y, yc + x, count); 
        count++;

        setPixel(xc - y, yc + x); 
        addCoordToSidebar(xc - y, yc + x, count); 
        count++;

        setPixel(xc + y, yc - x); 
        addCoordToSidebar(xc + y, yc - x, count); 
        count++;

        setPixel(xc - y, yc - x); 
        addCoordToSidebar(xc - y, yc - x, count); 
        count++;
    }

    while (x <= y) {
        plotCirclePoints(xc, yc, x, y);
        if (p < 0) {
            p = p + 2 * x + 3; 
        } else {
            p = p + 2 * (x - y) + 5; 
            y--;
        }
        x++;
    }
}