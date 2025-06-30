// ===============================
// Seleção de elementos da interface (DOM)
// ===============================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const drawSquareBtn = document.getElementById("draw-square-btn");
const clearCanvasBtn = document.getElementById("clear-canvas-btn");

// ===============================
// Inicialização do canvas
// ===============================
canvas.width = 500;
canvas.height = 500;

// ===============================
// Desenha os eixos cartesianos
// ===============================
function desenharQuadrantes() {
    const largura = canvas.width;
    const altura = canvas.height;

    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(largura / 2, 0);
    ctx.lineTo(largura / 2, altura);
    ctx.stroke();

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
    const canvasY = canvas.height / 2 - y;
    ctx.fillStyle = "black";
    ctx.fillRect(canvasX, canvasY, 1, 1);
}

// ===============================
// Algoritmo DDA para desenhar uma linha
// ===============================
function dda(x1, y1, x2, y2) {
    const length = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    const xinc = (x2 - x1) / length;
    const yinc = (y2 - y1) / length;

    let x = x1;
    let y = y1;

    setPixel(Math.round(x), Math.round(y));

    for (let i = 0; i < length; i++) {
        x += xinc;
        y += yinc;
        setPixel(Math.round(x), Math.round(y));
    }
}

// ===============================
// Variável para armazenar os pontos do quadrado atual
// ===============================
let quadradoAtual = [];

// ===============================
// Função para desenhar um quadrado customizado usando DDA
// ===============================
function drawCustomSquareDDA() {
    // Obter valores dos inputs ou usar padrão
    const size = parseInt(document.getElementById('square-size').value) || 50;
    const startX = parseInt(document.getElementById('square-x').value) || 0;
    const startY = parseInt(document.getElementById('square-y').value) || 0;

    // Limpar canvas e redesenhar eixos
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();

    // Calcular vértices do quadrado
    quadradoAtual = [
        { x: startX, y: startY },
        { x: startX + size, y: startY },
        { x: startX + size, y: startY + size },
        { x: startX, y: startY + size }
    ];

    // Desenhar as quatro arestas usando DDA
    for (let i = 0; i < quadradoAtual.length; i++) {
        const current = quadradoAtual[i];
        const next = quadradoAtual[(i + 1) % quadradoAtual.length];
        dda(current.x, current.y, next.x, next.y);
    }

    atualizarInformacoesObjeto();
}

// ===============================
// Função para multiplicar matriz 3x3 por vetor homogêneo
// ===============================
function multiplicarMatrizVetor(matriz, vetor) {
    return [
        matriz[0][0] * vetor[0] + matriz[0][1] * vetor[1] + matriz[0][2] * 1,
        matriz[1][0] * vetor[0] + matriz[1][1] * vetor[1] + matriz[1][2] * 1
    ];
}

// ===============================
// Matrizes de transformação (translação, rotação, escala, cisalhamento, reflexão)
// ===============================
function criarMatrizTranslacao(dx, dy) {
    return [
        [1, 0, dx],
        [0, 1, dy],
        [0, 0, 1]
    ];
}

function criarMatrizRotacao(anguloGraus, centroX = 0, centroY = 0) {
    const anguloRad = (anguloGraus * Math.PI) / 180;
    const cos = Math.cos(anguloRad);
    const sin = Math.sin(anguloRad);

    const matrizRotacao = [
        [cos, -sin, 0],
        [sin,  cos, 0],
        [0,    0,   1]
    ];

    if (centroX !== 0 || centroY !== 0) {
        const matrizTranslacaoPositiva = criarMatrizTranslacao(centroX, centroY);
        const matrizTranslacaoNegativa = criarMatrizTranslacao(-centroX, -centroY);
        return multiplicarMatrizes(
            matrizTranslacaoPositiva,
            multiplicarMatrizes(matrizRotacao, matrizTranslacaoNegativa)
        );
    }

    return matrizRotacao;
}

function criarMatrizEscala(sx, sy) {
    return [
        [sx, 0, 0],
        [0, sy, 0],
        [0, 0, 1]
    ];
}

function criarMatrizCisalhamento(shx, shy) {
    return [
        [1, shx, 0],
        [shy, 1, 0],
        [0, 0, 1]
    ];
}

function criarMatrizReflexao(refletirX, refletirY) {
    return [
        [refletirY ? -1 : 1, 0, 0],
        [0, refletirX ? -1 : 1, 0],
        [0, 0, 1]
    ];
}

// ===============================
// Multiplicação de matrizes 3x3 (para compor transformações)
// ===============================
function multiplicarMatrizes(a, b) {
    const result = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    return result;
}

// ===============================
// Funções para aplicar transformações (translação, rotação, escala, cisalhamento, reflexão)
// ===============================
function aplicarTranslacaoMatriz() {
    const dx = parseFloat(document.getElementById("x-translation").value) || 0;
    const dy = parseFloat(document.getElementById("y-translation").value) || 0;

    if (quadradoAtual.length === 0) {
        alert("Gere um quadrado primeiro!");
        return;
    }

    const matrizTranslacao = criarMatrizTranslacao(dx, dy);

    const novosPontos = quadradoAtual.map(ponto => {
        const vetor = [ponto.x, ponto.y];
        const [novoX, novoY] = multiplicarMatrizVetor(matrizTranslacao, vetor);
        return { x: novoX, y: novoY };
    });

    redesenharQuadrado(novosPontos);
    quadradoAtual = novosPontos;
    atualizarInformacoesObjeto();
    updateTransformationHistory2D(`Translação: Δx = ${dx}, Δy = ${dy}`);
}

function aplicarRotacaoMatriz() {
    const angulo = parseFloat(document.getElementById("angle").value) || 0;
    const centroX = parseFloat(document.getElementById("x-rotation").value) || 0;
    const centroY = parseFloat(document.getElementById("y-rotation").value) || 0;

    if (quadradoAtual.length === 0) {
        alert("Gere um quadrado primeiro!");
        return;
    }

    const matrizRotacao = criarMatrizRotacao(angulo, centroX, centroY);

    const novosPontos = quadradoAtual.map(ponto => {
        const vetor = [ponto.x, ponto.y];
        const [novoX, novoY] = multiplicarMatrizVetor(matrizRotacao, vetor);
        return { x: novoX, y: novoY };
    });

    redesenharQuadrado(novosPontos);
    quadradoAtual = novosPontos;
    atualizarInformacoesObjeto();
    updateTransformationHistory2D(`Rotação: ${angulo}° em torno de (${centroX}, ${centroY})`);
}

function aplicarEscalaMatriz() {
    const sx = parseFloat(document.getElementById("x-scale").value) || 1;
    const sy = parseFloat(document.getElementById("y-scale").value) || 1;

    if (quadradoAtual.length === 0) {
        alert("Gere um quadrado primeiro!");
        return;
    }

    // Escala em torno do primeiro vértice
    const origemX = quadradoAtual[0].x;
    const origemY = quadradoAtual[0].y;

    const matrizTranslacaoParaOrigem = criarMatrizTranslacao(-origemX, -origemY);
    const matrizEscala = criarMatrizEscala(sx, sy);
    const matrizTranslacaoDeVolta = criarMatrizTranslacao(origemX, origemY);

    const matrizFinal = multiplicarMatrizes(
        matrizTranslacaoDeVolta,
        multiplicarMatrizes(matrizEscala, matrizTranslacaoParaOrigem)
    );

    const novosPontos = quadradoAtual.map(ponto => {
        const vetor = [ponto.x, ponto.y];
        const [novoX, novoY] = multiplicarMatrizVetor(matrizFinal, vetor);
        return { x: novoX, y: novoY };
    });

    redesenharQuadrado(novosPontos);
    quadradoAtual = novosPontos;
    atualizarInformacoesObjeto();
    updateTransformationHistory2D(`Escala: Sx = ${sx}, Sy = ${sy}`);
}

function aplicarCisalhamentoMatriz() {
    const shx = parseFloat(document.getElementById("x-cis").value) || 0;
    const shy = parseFloat(document.getElementById("y-cis").value) || 0;

    if (quadradoAtual.length === 0) {
        alert("Gere um quadrado primeiro!");
        return;
    }

    const matrizCisalhamento = criarMatrizCisalhamento(shx, shy);

    const novosPontos = quadradoAtual.map(ponto => {
        const vetor = [ponto.x, ponto.y];
        const [novoX, novoY] = multiplicarMatrizVetor(matrizCisalhamento, vetor);
        return { x: novoX, y: novoY };
    });

    redesenharQuadrado(novosPontos);
    quadradoAtual = novosPontos;
    atualizarInformacoesObjeto();
    updateTransformationHistory2D(`Cisalhamento: Shx = ${shx}, Shy = ${shy}`);
}

function aplicarReflexaoMatriz() {
    const refletirX = document.getElementById("x-ref").checked;
    const refletirY = document.getElementById("y-ref").checked;

    if (!refletirX && !refletirY) return;

    if (quadradoAtual.length === 0) {
        alert("Gere um quadrado primeiro!");
        return;
    }

    const matrizReflexao = criarMatrizReflexao(refletirX, refletirY);

    const novosPontos = quadradoAtual.map(ponto => {
        const vetor = [ponto.x, ponto.y];
        const [novoX, novoY] = multiplicarMatrizVetor(matrizReflexao, vetor);
        return { x: novoX, y: novoY };
    });

    redesenharQuadrado(novosPontos);
    quadradoAtual = novosPontos;
    atualizarInformacoesObjeto();
    updateTransformationHistory2D(`Reflexão: ${refletirX ? 'em X' : ''} ${refletirY ? 'em Y' : ''}`);
}

// ===============================
// Função auxiliar para redesenhar o quadrado com novos pontos
// ===============================
function redesenharQuadrado(pontos) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();

    for (let i = 0; i < pontos.length; i++) {
        const proximo = (i + 1) % pontos.length;
        dda(pontos[i].x, pontos[i].y, pontos[proximo].x, pontos[proximo].y);
    }
}

// ===============================
// Função para atualizar informações do objeto na interface
// ===============================
function atualizarInformacoesObjeto() {
    if (quadradoAtual.length === 0) {
        document.getElementById("vertices-list").innerHTML = "Nenhum objeto gerado.";
        document.getElementById("center-position").innerHTML = "Nenhum objeto gerado.";
        return;
    }

    const centroX = (quadradoAtual[0].x + quadradoAtual[1].x + quadradoAtual[2].x + quadradoAtual[3].x) / 4;
    const centroY = (quadradoAtual[0].y + quadradoAtual[1].y + quadradoAtual[2].y + quadradoAtual[3].y) / 4;

    const verticesHTML = quadradoAtual.map((vertice, index) =>
        `Vértice ${index + 1}: (${vertice.x.toFixed(2)}, ${vertice.y.toFixed(2)})`
    ).join("<br>");

    document.getElementById("vertices-list").innerHTML = verticesHTML;
    document.getElementById("center-position").innerHTML =
        `(${centroX.toFixed(2)}, ${centroY.toFixed(2)})`;
}

// ===============================
// Função para limpar o canvas e informações
// ===============================
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();
    quadradoAtual = [];
    document.getElementById("vertices-list").innerHTML = "Nenhum objeto gerado.";
    document.getElementById("center-position").innerHTML = "Nenhum objeto gerado.";
    transformationHistory2D = [];
    document.getElementById('transformation-history').innerHTML = "Nenhuma transformação aplicada.";
}

// ===============================
// Histórico de Transformações 2D
// ===============================
let transformationHistory2D = [];

function updateTransformationHistory2D(transformation) {
    transformationHistory2D.push(transformation);
    const historyElement = document.getElementById('transformation-history');
    historyElement.innerHTML = transformationHistory2D.map((t, i) => `<div>${i + 1}. ${t}</div>`).join('');
}

// ===============================
// Eventos dos botões principais
// ===============================
drawSquareBtn.addEventListener("click", drawCustomSquareDDA);
clearCanvasBtn.addEventListener("click", clearCanvas);
document.querySelectorAll('.type-op')[0].addEventListener('click', aplicarTranslacaoMatriz);
document.querySelectorAll('.type-op')[1].addEventListener('click', aplicarEscalaMatriz);
document.querySelectorAll('.type-op')[2].addEventListener('click', aplicarRotacaoMatriz);
document.querySelectorAll('.type-op')[3].addEventListener('click', aplicarReflexaoMatriz);
document.querySelectorAll('.type-op')[4].addEventListener('click', aplicarCisalhamentoMatriz);

// Inicializa o plano cartesiano ao carregar
desenharQuadrantes();

// ===============================
// Sequência de Transformações 2D
// ===============================
let transformationSequence2D = [];

// Preenche o select com as opções de transformação
const sequenceTypeSelect = document.getElementById('sequence-transformation-type');
if (sequenceTypeSelect) {
    sequenceTypeSelect.innerHTML = `
        <option value="translation">Translação</option>
        <option value="rotation">Rotação</option>
        <option value="scale">Escala</option>
        <option value="shear">Cisalhamento</option>
        <option value="reflection">Reflexão</option>
    `;
}

// Atualiza os parâmetros exibidos com base no tipo de transformação selecionado
sequenceTypeSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    const parametersDiv = document.getElementById('sequence-parameters');
    parametersDiv.innerHTML = '';

    switch (type) {
        case 'translation':
            parametersDiv.innerHTML = `
                <div class="input-row">
                    <label>X:</label>
                    <input type="number" id="seq-tx" value="0">
                </div>
                <div class="input-row">
                    <label>Y:</label>
                    <input type="number" id="seq-ty" value="0">
                </div>`;
            break;
        case 'rotation':
            parametersDiv.innerHTML = `
                <div class="input-row">
                    <label>Ângulo:</label>
                    <input type="number" id="seq-angle" value="0">
                </div>
                <div class="input-row">
                    <label>Centro X:</label>
                    <input type="number" id="seq-cx" value="0">
                </div>
                <div class="input-row">
                    <label>Centro Y:</label>
                    <input type="number" id="seq-cy" value="0">
                </div>`;
            break;
        case 'scale':
            parametersDiv.innerHTML = `
                <div class="input-row">
                    <label>X:</label>
                    <input type="number" id="seq-sx" value="1" step="0.1">
                </div>
                <div class="input-row">
                    <label>Y:</label>
                    <input type="number" id="seq-sy" value="1" step="0.1">
                </div>`;
            break;
        case 'shear':
            parametersDiv.innerHTML = `
                <div class="input-row">
                    <label>X:</label>
                    <input type="number" id="seq-shx" value="0" step="0.1">
                </div>
                <div class="input-row">
                    <label>Y:</label>
                    <input type="number" id="seq-shy" value="0" step="0.1">
                </div>`;
            break;
        case 'reflection':
            parametersDiv.innerHTML = `
                <div class="input-row">
                    <label><input type="checkbox" id="seq-ref-x"> Em X</label>
                </div>
                <div class="input-row">
                    <label><input type="checkbox" id="seq-ref-y"> Em Y</label>
                </div>`;
            break;
    }
});

// Inicializa os parâmetros ao carregar a página
if (sequenceTypeSelect) {
    const event = new Event('change');
    sequenceTypeSelect.dispatchEvent(event);
}

// ===============================
// Adiciona a transformação configurada à sequência
// ===============================
document.getElementById('add-to-sequence-btn').addEventListener('click', () => {
    const type = sequenceTypeSelect.value;
    let parameters = {};

    switch (type) {
        case 'translation':
            parameters = {
                dx: parseFloat(document.getElementById('seq-tx').value) || 0,
                dy: parseFloat(document.getElementById('seq-ty').value) || 0
            };
            break;
        case 'rotation':
            parameters = {
                angle: parseFloat(document.getElementById('seq-angle').value) || 0,
                cx: parseFloat(document.getElementById('seq-cx').value) || 0,
                cy: parseFloat(document.getElementById('seq-cy').value) || 0
            };
            break;
        case 'scale':
            parameters = {
                sx: parseFloat(document.getElementById('seq-sx').value) || 1,
                sy: parseFloat(document.getElementById('seq-sy').value) || 1
            };
            break;
        case 'shear':
            parameters = {
                shx: parseFloat(document.getElementById('seq-shx').value) || 0,
                shy: parseFloat(document.getElementById('seq-shy').value) || 0
            };
            break;
        case 'reflection':
            parameters = {
                x: document.getElementById('seq-ref-x').checked,
                y: document.getElementById('seq-ref-y').checked
            };
            break;
    }

    transformationSequence2D.push({ type, parameters });
    updateTransformationHistory2D(`Adicionado à sequência: ${type} (${JSON.stringify(parameters)})`);
});

// ===============================
// Aplica a sequência de transformações
// ===============================
document.getElementById('apply-sequence-btn').addEventListener('click', () => {
    if (quadradoAtual.length === 0) {
        alert('Gere um quadrado primeiro!');
        return;
    }

    let pontos = quadradoAtual.map(p => ({ ...p }));

    transformationSequence2D.forEach(transformation => {
        const { type, parameters } = transformation;
        let matriz;

        switch (type) {
            case 'translation':
                matriz = criarMatrizTranslacao(parameters.dx, parameters.dy);
                pontos = pontos.map(ponto => {
                    const [x, y] = multiplicarMatrizVetor(matriz, [ponto.x, ponto.y]);
                    return { x, y };
                });
                updateTransformationHistory2D(`Translação (dx: ${parameters.dx}, dy: ${parameters.dy})`);
                break;
            case 'rotation':
                matriz = criarMatrizRotacao(parameters.angle, parameters.cx, parameters.cy);
                pontos = pontos.map(ponto => {
                    const [x, y] = multiplicarMatrizVetor(matriz, [ponto.x, ponto.y]);
                    return { x, y };
                });
                updateTransformationHistory2D(`Rotação (ângulo: ${parameters.angle}°, centro: ${parameters.cx}, ${parameters.cy})`);
                break;
            case 'scale':
                const origemX = pontos[0].x;
                const origemY = pontos[0].y;
                const t1 = criarMatrizTranslacao(-origemX, -origemY);
                const escala = criarMatrizEscala(parameters.sx, parameters.sy);
                const t2 = criarMatrizTranslacao(origemX, origemY);
                matriz = multiplicarMatrizes(t2, multiplicarMatrizes(escala, t1));
                pontos = pontos.map(ponto => {
                    const [x, y] = multiplicarMatrizVetor(matriz, [ponto.x, ponto.y]);
                    return { x, y };
                });
                updateTransformationHistory2D(`Escala (sx: ${parameters.sx}, sy: ${parameters.sy})`);
                break;
            case 'shear':
                matriz = criarMatrizCisalhamento(parameters.shx, parameters.shy);
                pontos = pontos.map(ponto => {
                    const [x, y] = multiplicarMatrizVetor(matriz, [ponto.x, ponto.y]);
                    return { x, y };
                });
                updateTransformationHistory2D(`Cisalhamento (shx: ${parameters.shx}, shy: ${parameters.shy})`);
                break;
            case 'reflection':
                matriz = criarMatrizReflexao(parameters.x, parameters.y);
                pontos = pontos.map(ponto => {
                    const [x, y] = multiplicarMatrizVetor(matriz, [ponto.x, ponto.y]);
                    return { x, y };
                });
                updateTransformationHistory2D(`Reflexão (X: ${parameters.x}, Y: ${parameters.y})`);
                break;
        }
    });

    redesenharQuadrado(pontos);
    quadradoAtual = pontos;
    atualizarInformacoesObjeto();

    transformationSequence2D = [];
});



// ===============================
// PGM IMAGE HANDLING
// ===============================

// Armazena os pontos do objeto da imagem carregada
let imagemObjetoPontos = [];
let imagemCentro = { x: 0, y: 0 };

// Função para ler arquivo PGM (P2 ou P5) e extrair pontos do objeto
function parsePGM(arrayBuffer) {
    const view = new Uint8Array(arrayBuffer);
    let currentIndex = 0;

    function readToken() {
        let token = "";
        while (currentIndex < view.length) {
            const charCode = view[currentIndex];
            const char = String.fromCharCode(charCode);
            if (/\s/.test(char)) {
                if (token.length > 0) {
                    currentIndex++;
                    return token;
                }
            } else if (char === "#") {
                // Skip comment
                while (
                    currentIndex < view.length &&
                    String.fromCharCode(view[currentIndex]) !== "\n"
                ) {
                    currentIndex++;
                }
            } else {
                token += char;
            }
            currentIndex++;
        }
        return token;
    }

    const magic = readToken();
    if (magic !== "P2" && magic !== "P5") {
        alert("Erro: Formato de arquivo PGM inválido.");
        return null;
    }
    const width = parseInt(readToken());
    const height = parseInt(readToken());
    const maxVal = parseInt(readToken());
    if (isNaN(width) || isNaN(height) || isNaN(maxVal)) {
        alert("Erro ao ler o cabeçalho do PGM.");
        return null;
    }
    let pixels;
    if (magic === "P5") {
        // Dados binários
        pixels = [];
        for (let i = 0; i < width * height; i++) {
            pixels.push(view[currentIndex++]);
        }
    } else {
        // P2: texto
        const textDecoder = new TextDecoder();
        const remainingText = textDecoder.decode(view.subarray(currentIndex));
        pixels = remainingText
            .split(/\s+/)
            .filter((s) => s)
            .map((s) => parseInt(s));
    }
    if (pixels.length < width * height) {
        alert("Erro: O arquivo PGM está incompleto.");
        return null;
    }
    pixels = pixels.slice(0, width * height);

    // Descobre valor do fundo (mais frequente)
    const freq = {};
    for (const px of pixels) freq[px] = (freq[px] || 0) + 1;
    const bg = parseInt(Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]);

    // Extrai pontos do objeto (não fundo)
    const pontos = [];
    let sumX = 0, sumY = 0, count = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const val = pixels[y * width + x];
            if (val !== bg) {
                // Centraliza no canvas (0,0 no centro)
                const px = x - width / 2;
                const py = height / 2 - y;
                pontos.push({ x: px, y: py });
                sumX += px;
                sumY += py;
                count++;
            }
        }
    }
    const imagemCentro = { x: sumX / count, y: sumY / count };
    return { pontos, imagemCentro };
}

// Renderiza os pontos da imagem no canvas
function renderImagemObjeto(pontos) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();
    // Fundo branco
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Desenha pontos do objeto
    ctx.fillStyle = "black";
    for (const p of pontos) {
        setPixel(Math.round(p.x), Math.round(p.y));
    }
}

function atualizarCentroImagem() {
    if (imagemObjetoPontos.length === 0) return;
    let sumX = 0, sumY = 0;
    for (const p of imagemObjetoPontos) {
        sumX += p.x;
        sumY += p.y;
    }
    imagemCentro = {
        x: sumX / imagemObjetoPontos.length,
        y: sumY / imagemObjetoPontos.length
    };
}

function aplicarTransformacaoImagem(matriz) {
    if (imagemObjetoPontos.length === 0) {
        alert("Carregue uma imagem PGM primeiro!");
        return;
    }
    imagemObjetoPontos = imagemObjetoPontos.map(p => {
        const [x, y] = multiplicarMatrizVetor(matriz, [p.x, p.y]);
        return { x, y };
    });
    atualizarCentroImagem(); // Atualiza o centro após a transformação
    renderImagemObjeto(imagemObjetoPontos);
}

// Handlers para cada transformação (usando os mesmos campos do quadrado)
function aplicarTranslacaoImagem() {
    const dx = parseFloat(document.getElementById("x-translation").value) || 0;
    const dy = parseFloat(document.getElementById("y-translation").value) || 0;
    const matriz = criarMatrizTranslacao(dx, dy);
    aplicarTransformacaoImagem(matriz);
}
function aplicarEscalaImagem() {
    const sx = parseFloat(document.getElementById("x-scale").value) || 1;
    const sy = parseFloat(document.getElementById("y-scale").value) || 1;
    // Escala em torno do centro do objeto
    const t1 = criarMatrizTranslacao(-imagemCentro.x, -imagemCentro.y);
    const escala = criarMatrizEscala(sx, sy);
    const t2 = criarMatrizTranslacao(imagemCentro.x, imagemCentro.y);
    const matriz = multiplicarMatrizes(t2, multiplicarMatrizes(escala, t1));
    aplicarTransformacaoImagem(matriz);
}
function aplicarRotacaoImagem() {
    const angulo = parseFloat(document.getElementById("angle").value) || 0;
    const cx = parseFloat(document.getElementById("x-rotation").value) || imagemCentro.x;
    const cy = parseFloat(document.getElementById("y-rotation").value) || imagemCentro.y;
    const matriz = criarMatrizRotacao(angulo, cx, cy);
    aplicarTransformacaoImagem(matriz);
}
function aplicarReflexaoImagem() {
    const refletirX = document.getElementById("x-ref").checked;
    const refletirY = document.getElementById("y-ref").checked;
    if (!refletirX && !refletirY) return;
    const matriz = criarMatrizReflexao(refletirX, refletirY);
    aplicarTransformacaoImagem(matriz);
}
function aplicarCisalhamentoImagem() {
    const shx = parseFloat(document.getElementById("x-cis").value) || 0;
    const shy = parseFloat(document.getElementById("y-cis").value) || 0;
    const matriz = criarMatrizCisalhamento(shx, shy);
    aplicarTransformacaoImagem(matriz);
}


// Handler para upload e renderização
document.getElementById("render-pgm-btn").addEventListener("click", () => {
    const fileInput = document.getElementById("pgm-upload");
    if (!fileInput.files[0]) {
        alert("Selecione um arquivo PGM.");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const result = parsePGM(e.target.result);
            if (!result) return;
            imagemObjetoPontos = result.pontos;
            imagemCentro = result.imagemCentro;
            renderImagemObjeto(imagemObjetoPontos);
        } catch (err) {
            alert("Erro ao ler PGM: " + err.message);
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
});

// Botões para aplicar transformações na imagem
document.getElementById('img-translate-btn').addEventListener('click', function() {
    const dx = parseFloat(document.getElementById('img-translate-x').value);
    const dy = parseFloat(document.getElementById('img-translate-y').value);
    // Aplica translação na imagem
    const matriz = criarMatrizTranslacao(dx, dy);
    aplicarTransformacaoImagem(matriz);
});

document.getElementById('img-scale-btn').addEventListener('click', function() {
    const sx = parseFloat(document.getElementById('img-scale-x').value);
    const sy = parseFloat(document.getElementById('img-scale-y').value);
    // Escala em torno do centro da imagem
    atualizarCentroImagem();
    const t1 = criarMatrizTranslacao(-imagemCentro.x, -imagemCentro.y);
    const escala = criarMatrizEscala(sx, sy);
    const t2 = criarMatrizTranslacao(imagemCentro.x, imagemCentro.y);
    const matriz = multiplicarMatrizes(t2, multiplicarMatrizes(escala, t1));
    aplicarTransformacaoImagem(matriz);
});

document.getElementById('img-rotate-btn').addEventListener('click', function() {
    const angle = parseFloat(document.getElementById('img-rotate-angle').value);
    atualizarCentroImagem();
    const matriz = criarMatrizRotacao(angle, imagemCentro.x, imagemCentro.y);
    aplicarTransformacaoImagem(matriz);
});

document.getElementById('img-reflect-btn').addEventListener('click', function() {
    const reflectX = document.getElementById('img-reflect-x').checked;
    const reflectY = document.getElementById('img-reflect-y').checked;
    const matriz = criarMatrizReflexao(reflectX, reflectY);
    aplicarTransformacaoImagem(matriz);
});

document.getElementById('img-shear-btn').addEventListener('click', function() {
    const shx = parseFloat(document.getElementById('img-shear-x').value);
    const shy = parseFloat(document.getElementById('img-shear-y').value);
    const matriz = criarMatrizCisalhamento(shx, shy);
    aplicarTransformacaoImagem(matriz);
});

// Garante que o plano cartesiano seja desenhado após a imagem ser plotada
function renderImagemObjeto(pontos) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Fundo branco
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes(); // Desenha os eixos APÓS o fundo
    // Desenha pontos do objeto
    ctx.fillStyle = "black";
    for (const p of pontos) {
        setPixel(Math.round(p.x), Math.round(p.y));
    }
}

// ===============================
// VIEWPORT (Recorte de Tela)
// ===============================
let viewportActive = false;
let viewport = { xmin: -100, ymin: -100, xmax: 100, ymax: 100 };

// UI handlers
const viewportActiveCheckbox = document.getElementById('viewport-active');
const viewportConfigDiv = document.getElementById('viewport-config');
viewportActiveCheckbox.addEventListener('change', function() {
    viewportActive = this.checked;
    viewportConfigDiv.style.display = viewportActive ? 'block' : 'none';
    updateViewportFromInputs();
    redrawAll();
});
['viewport-xmin', 'viewport-ymin', 'viewport-xmax', 'viewport-ymax'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        updateViewportFromInputs();
        redrawAll();
    });
});
function updateViewportFromInputs() {
    viewport.xmin = parseInt(document.getElementById('viewport-xmin').value);
    viewport.ymin = parseInt(document.getElementById('viewport-ymin').value);
    viewport.xmax = parseInt(document.getElementById('viewport-xmax').value);
    viewport.ymax = parseInt(document.getElementById('viewport-ymax').value);
}

// Desenha a viewport no canvas
function drawViewportRect() {
    if (!viewportActive) return;
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
        viewport.xmin + canvas.width / 2,
        canvas.height / 2 - viewport.ymax,
        viewport.xmax - viewport.xmin,
        viewport.ymax - viewport.ymin
    );
    ctx.restore();
}

// Cohen-Sutherland para recorte de linhas
function cohenSutherlandClip(x1, y1, x2, y2, vp) {
    const INSIDE = 0, LEFT = 1, RIGHT = 2, BOTTOM = 4, TOP = 8;
    function computeOutCode(x, y) {
        let code = INSIDE;
        if (x < vp.xmin) code |= LEFT;
        else if (x > vp.xmax) code |= RIGHT;
        if (y < vp.ymin) code |= BOTTOM;
        else if (y > vp.ymax) code |= TOP;
        return code;
    }
    let outcode0 = computeOutCode(x1, y1);
    let outcode1 = computeOutCode(x2, y2);
    let accept = false;
    while (true) {
        if (!(outcode0 | outcode1)) { accept = true; break; }
        else if (outcode0 & outcode1) { break; }
        else {
            let x, y;
            let outcodeOut = outcode0 ? outcode0 : outcode1;
            if (outcodeOut & TOP) {
                x = x1 + (x2 - x1) * (vp.ymax - y1) / (y2 - y1);
                y = vp.ymax;
            } else if (outcodeOut & BOTTOM) {
                x = x1 + (x2 - x1) * (vp.ymin - y1) / (y2 - y1);
                y = vp.ymin;
            } else if (outcodeOut & RIGHT) {
                y = y1 + (y2 - y1) * (vp.xmax - x1) / (x2 - x1);
                x = vp.xmax;
            } else if (outcodeOut & LEFT) {
                y = y1 + (y2 - y1) * (vp.xmin - x1) / (x2 - x1);
                x = vp.xmin;
            }
            if (outcodeOut === outcode0) {
                x1 = x; y1 = y; outcode0 = computeOutCode(x1, y1);
            } else {
                x2 = x; y2 = y; outcode1 = computeOutCode(x2, y2);
            }
        }
    }
    if (accept) return [x1, y1, x2, y2];
    else return null;
}

// DDA para desenhar um pixel de cor customizada
function setPixelColor(x, y, color) {
    const canvasX = x + canvas.width / 2;
    const canvasY = canvas.height / 2 - y;
    ctx.fillStyle = color;
    ctx.fillRect(canvasX, canvasY, 1, 1);
}

// Redefina o DDA para usar recorte se viewport ativa e desenhar vermelho fora
function ddaClipped(x1, y1, x2, y2) {
    if (viewportActive) {
        // Desenha parte dentro da viewport em preto, fora em vermelho
        // 1. Desenha parte dentro (clipped) em preto
        const clipped = cohenSutherlandClip(x1, y1, x2, y2, viewport);
        if (clipped) {
            ddaColor(clipped[0], clipped[1], clipped[2], clipped[3], "black");
        }
        // 2. Desenha parte(s) fora em vermelho
        // Se a linha original não está totalmente dentro, desenhe as partes fora
        // a) Antes do segmento visível
        // b) Depois do segmento visível
        // Se não há parte visível, desenhe tudo em vermelho
        if (!clipped) {
            ddaColor(x1, y1, x2, y2, "red");
        } else {
            // Desenha do ponto inicial até o início do segmento visível (se diferente)
            if (x1 !== clipped[0] || y1 !== clipped[1]) {
                ddaColor(x1, y1, clipped[0], clipped[1], "red");
            }
            // Desenha do fim do segmento visível até o ponto final (se diferente)
            if (x2 !== clipped[2] || y2 !== clipped[3]) {
                ddaColor(clipped[2], clipped[3], x2, y2, "red");
            }
        }
    } else {
        dda(x1, y1, x2, y2);
    }
}

// DDA com cor customizada
function ddaColor(x1, y1, x2, y2, color) {
    const length = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    const xinc = (x2 - x1) / length;
    const yinc = (y2 - y1) / length;
    let x = x1;
    let y = y1;
    setPixelColor(Math.round(x), Math.round(y), color);
    for (let i = 0; i < length; i++) {
        x += xinc;
        y += yinc;
        setPixelColor(Math.round(x), Math.round(y), color);
    }
}

// Redefina redesenharQuadrado para usar DDA com recorte
function redesenharQuadrado(pontos) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();
    for (let i = 0; i < pontos.length; i++) {
        const proximo = (i + 1) % pontos.length;
        ddaClipped(pontos[i].x, pontos[i].y, pontos[proximo].x, pontos[proximo].y);
    }
    drawViewportRect();
}

// Redefina renderImagemObjeto para recortar pixels fora da viewport e pintar vermelho
function renderImagemObjeto(pontos) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();
    for (const p of pontos) {
        if (viewportActive) {
            if (
                p.x < viewport.xmin || p.x > viewport.xmax ||
                p.y < viewport.ymin || p.y > viewport.ymax
            ) {
                setPixelColor(Math.round(p.x), Math.round(p.y), "red");
            } else {
                setPixelColor(Math.round(p.x), Math.round(p.y), "black");
            }
        } else {
            setPixelColor(Math.round(p.x), Math.round(p.y), "black");
        }
    }
    drawViewportRect();
}

// Redesenha tudo (quadrado e imagem) ao mudar viewport
function redrawAll() {
    if (quadradoAtual.length > 0) redesenharQuadrado(quadradoAtual);
    if (imagemObjetoPontos.length > 0) renderImagemObjeto(imagemObjetoPontos);
}

// ===============================
// Lousa (Viewport) - Apenas objeto, sem eixos
// ===============================
const lousaCanvas = document.getElementById('lousa-canvas');
const lousaCtx = lousaCanvas.getContext('2d');
const lousaWidthInput = document.getElementById('lousa-width');
const lousaHeightInput = document.getElementById('lousa-height');

// Atualiza tamanho da lousa dinamicamente
lousaWidthInput.addEventListener('input', () => {
    lousaCanvas.width = parseInt(lousaWidthInput.value);
    desenharNaLousa();
});
lousaHeightInput.addEventListener('input', () => {
    lousaCanvas.height = parseInt(lousaHeightInput.value);
    desenharNaLousa();
});

// Função para transformar coordenadas do mundo para a lousa
function worldToLousa(x, y) {
    // A viewport é definida por viewport.xmin, ymin, xmax, ymax
    const vp = viewport;
    const w = lousaCanvas.width;
    const h = lousaCanvas.height;
    const lx = ((x - vp.xmin) / (vp.xmax - vp.xmin)) * w;
    const ly = h - ((y - vp.ymin) / (vp.ymax - vp.ymin)) * h;
    return { x: lx, y: ly };
}

// Cohen-Sutherland para lousa (viewport)
function cohenSutherlandClipLousa(x1, y1, x2, y2, vp) {
    const INSIDE = 0, LEFT = 1, RIGHT = 2, BOTTOM = 4, TOP = 8;
    function computeOutCode(x, y) {
        let code = INSIDE;
        if (x < vp.xmin) code |= LEFT;
        else if (x > vp.xmax) code |= RIGHT;
        if (y < vp.ymin) code |= BOTTOM;
        else if (y > vp.ymax) code |= TOP;
        return code;
    }
    let outcode0 = computeOutCode(x1, y1);
    let outcode1 = computeOutCode(x2, y2);
    let accept = false;
    while (true) {
        if (!(outcode0 | outcode1)) { accept = true; break; }
        else if (outcode0 & outcode1) { break; }
        else {
            let x, y;
            let outcodeOut = outcode0 ? outcode0 : outcode1;
            if (outcodeOut & TOP) {
                x = x1 + (x2 - x1) * (vp.ymax - y1) / (y2 - y1);
                y = vp.ymax;
            } else if (outcodeOut & BOTTOM) {
                x = x1 + (x2 - x1) * (vp.ymin - y1) / (y2 - y1);
                y = vp.ymin;
            } else if (outcodeOut & RIGHT) {
                y = y1 + (y2 - y1) * (vp.xmax - x1) / (x2 - x1);
                x = vp.xmax;
            } else if (outcodeOut & LEFT) {
                y = y1 + (y2 - y1) * (vp.xmin - x1) / (x2 - x1);
                x = vp.xmin;
            }
            if (outcodeOut === outcode0) {
                x1 = x; y1 = y; outcode0 = computeOutCode(x1, y1);
            } else {
                x2 = x; y2 = y; outcode1 = computeOutCode(x2, y2);
            }
        }
    }
    if (accept) return [x1, y1, x2, y2];
    else return null;
}

// Desenha o objeto atual na lousa, usando recorte
function desenharNaLousa() {
    lousaCtx.clearRect(0, 0, lousaCanvas.width, lousaCanvas.height);
    if (quadradoAtual.length === 0) return;
    for (let i = 0; i < quadradoAtual.length; i++) {
        const proximo = (i + 1) % quadradoAtual.length;
        const v1 = quadradoAtual[i];
        const v2 = quadradoAtual[proximo];
        // Recorte na viewport
        const clipped = cohenSutherlandClipLousa(v1.x, v1.y, v2.x, v2.y, viewport);
        if (clipped) {
            const p0 = worldToLousa(clipped[0], clipped[1]);
            const p1 = worldToLousa(clipped[2], clipped[3]);
            lousaCtx.strokeStyle = "#111";
            lousaCtx.beginPath();
            lousaCtx.moveTo(p0.x, p0.y);
            lousaCtx.lineTo(p1.x, p1.y);
            lousaCtx.stroke();
        }
    }
    // Também desenha pontos da imagem PGM na lousa
    if (imagemObjetoPontos && imagemObjetoPontos.length > 0) {
        for (const p of imagemObjetoPontos) {
            if (
                p.x >= viewport.xmin && p.x <= viewport.xmax &&
                p.y >= viewport.ymin && p.y <= viewport.ymax
            ) {
                const lp = worldToLousa(p.x, p.y);
                lousaCtx.fillStyle = "#111";
                lousaCtx.fillRect(lp.x, lp.y, 1, 1);
            }
        }
    }
}

// Sempre que redesenhar o quadrado, atualize a lousa também
const oldRedesenharQuadrado = redesenharQuadrado;
redesenharQuadrado = function(pontos) {
    oldRedesenharQuadrado(pontos);
    desenharNaLousa();
};
// Também ao limpar canvas
const oldClearCanvas = clearCanvas;
clearCanvas = function() {
    oldClearCanvas();
    desenharNaLousa();
};
// E ao carregar quadrado
drawCustomSquareDDA = (function(orig) {
    return function() {
        orig();
        desenharNaLousa();
    };
})(drawCustomSquareDDA);

// Atualize a lousa ao mudar viewport
['viewport-xmin', 'viewport-ymin', 'viewport-xmax', 'viewport-ymax'].forEach(id => {
    document.getElementById(id).addEventListener('input', desenharNaLousa);
});
document.getElementById('viewport-active').addEventListener('change', desenharNaLousa);

// Inicializa lousa ao carregar
desenharNaLousa();