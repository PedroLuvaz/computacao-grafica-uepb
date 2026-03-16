// ===============================
// common.js - Funções compartilhadas do Projeto 1
// ===============================

/**
 * Desenha um pixel no canvas com coordenadas cartesianas (origem no centro)
 */
function setPixelCentered(ctx, canvas, x, y, color = "black") {
    const canvasX = x + canvas.width / 2;
    const canvasY = canvas.height / 2 - y;
    ctx.fillStyle = color;
    ctx.fillRect(canvasX, canvasY, 1, 1);
}

/**
 * Desenha os eixos X e Y (quadrantes) no canvas
 */
function desenharQuadrantesPadrao(ctx, canvas) {
    const largura = canvas.width;
    const altura = canvas.height;

    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 0.5;

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

    ctx.strokeStyle = "black";
}

/**
 * Retorna o quadrante de um ponto (x, y)
 */
function identificarQuadrante(x, y) {
    if (x > 0 && y > 0) return '1';
    if (x < 0 && y > 0) return '2';
    if (x < 0 && y < 0) return '3';
    if (x > 0 && y < 0) return '4';
    if (x === 0 && y !== 0) return 'Eixo Y';
    if (y === 0 && x !== 0) return 'Eixo X';
    return 'Origem';
}

/**
 * Detecta a página atual e adiciona a classe 'active' ao link da navbar
 */
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.navbar ul li a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href.split('/').pop().replace('index.html', ''))) {
            link.classList.add('active');
        }
    });
});
