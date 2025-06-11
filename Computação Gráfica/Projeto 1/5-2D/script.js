const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const drawSquareBtn = document.getElementById("draw-square-btn");
const clearCanvasBtn = document.getElementById("clear-canvas-btn");

// Definir tamanho do canvas
canvas.width = 500;
canvas.height = 500;

// Desenhar eixos cartesianos
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

// Função para desenhar um pixel no canvas
function setPixel(x, y) {
    const canvasX = x + canvas.width / 2;
    const canvasY = canvas.height / 2 - y;
    ctx.fillStyle = "black";
    ctx.fillRect(canvasX, canvasY, 1, 1);
}

// Algoritmo DDA para desenhar uma linha
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

//para armazenar os pontos do quadrado anteriores para as operações.
let quadradoAtual = [];

function drawCustomSquareDDA() {
    // Obter valores ou usar padrão (50x50 no primeiro quadrante)
    const size = parseInt(document.getElementById('square-size').value) || 50;
    const startX = parseInt(document.getElementById('square-x').value) || 0;
    const startY = parseInt(document.getElementById('square-y').value) || 0;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();

    // Calcular vértices (primeiro quadrante)
    quadradoAtual = [
        { x: startX, y: startY },          // Vértice inferior esquerdo
        { x: startX + size, y: startY },    // Vértice inferior direito
        { x: startX + size, y: startY + size }, // Vértice superior direito
        { x: startX, y: startY + size }     // Vértice superior esquerdo
    ];

    // Desenhar usando DDA
    for (let i = 0; i < quadradoAtual.length; i++) {
        const current = quadradoAtual[i];
        const next = quadradoAtual[(i + 1) % quadradoAtual.length];
        dda(current.x, current.y, next.x, next.y);
    }

    atualizarInformacoesObjeto();
}

// Event Listener
document.getElementById('draw-square-btn').addEventListener('click', drawCustomSquareDDA);

// Função para desenhar linha (DDA)
function dda(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    const xInc = dx / steps;
    const yInc = dy / steps;

    let x = x1;
    let y = y1;

    for (let i = 0; i <= steps; i++) {
        setPixel(Math.round(x), Math.round(y));
        x += xInc;
        y += yInc;
    }
}



//Matriz Homogênea (usada nas operações)
function multiplicarMatrizVetor(matriz, vetor) {
    // vetor no formato [x, y, 1] (coordenadas homogêneas)
    return [
        matriz[0][0] * vetor[0] + matriz[0][1] * vetor[1] + matriz[0][2] * 1,
        matriz[1][0] * vetor[0] + matriz[1][1] * vetor[1] + matriz[1][2] * 1
    ];
}

//Matriz de Translacao
function criarMatrizTranslacao(dx, dy) {
    return [
        [1, 0, dx],
        [0, 1, dy],
        [0, 0, 1]
    ];
}

//Operação Translação
function aplicarTranslacaoMatriz() {
    const dx = parseFloat(document.getElementById("x-translation").value) || 0;
    const dy = parseFloat(document.getElementById("y-translation").value) || 0;

    if (quadradoAtual.length === 0) {
        alert("Gere um quadrado primeiro!");
        return;
    }

    // Criar matriz de translação
    const matrizTranslacao = criarMatrizTranslacao(dx, dy);

    // Aplicar a cada ponto do quadrado
    const novosPontos = quadradoAtual.map(ponto => {
        const vetor = [ponto.x, ponto.y]; // Ponto original
        const [novoX, novoY] = multiplicarMatrizVetor(matrizTranslacao, vetor);
        return { x: novoX, y: novoY };
    });

    // Redesenhar e atualizar
    redesenharQuadrado(novosPontos);
    quadradoAtual = novosPontos;
    atualizarInformacoesObjeto()
    updateTransformationHistory2D(`Translação: Δx = ${dx}, Δy = ${dy}`);
}

//Matriz de Rotação
function criarMatrizRotacao(anguloGraus, centroX = 0, centroY = 0) {
    const anguloRad = (anguloGraus * Math.PI) / 180; // Converte graus para radianos
    const cos = Math.cos(anguloRad);
    const sin = Math.sin(anguloRad);

    // Matriz de rotação em torno da origem
    const matrizRotacao = [
        [cos, -sin, 0],
        [sin,  cos, 0],
        [0,    0,   1]
    ];

    // Se houver centro de rotação diferente da origem, combinar com translações
    if (centroX !== 0 || centroY !== 0) {
        const matrizTranslacaoPositiva = criarMatrizTranslacao(centroX, centroY);
        const matrizTranslacaoNegativa = criarMatrizTranslacao(-centroX, -centroY);

        // Matriz composta: T⁻¹ × Rotação × T
        return multiplicarMatrizes(
            matrizTranslacaoPositiva,
            multiplicarMatrizes(matrizRotacao, matrizTranslacaoNegativa)
        );
    }

    return matrizRotacao;
}

//Função multiplicar matrizes caso você precise rotacionar em um ponto fixo. (overload de método)
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

//Função Rotação
function aplicarRotacaoMatriz() {
    const angulo = parseFloat(document.getElementById("angle").value) || 0;
    const centroX = parseFloat(document.getElementById("x-rotation").value) || 0;
    const centroY = parseFloat(document.getElementById("y-rotation").value) || 0;

    if (quadradoAtual.length === 0) {
        alert("Gere um quadrado primeiro!");
        return;
    }

    // Criar matriz de rotação (com centro especificado)
    const matrizRotacao = criarMatrizRotacao(angulo, centroX, centroY);

    // Aplicar a cada ponto do quadrado
    const novosPontos = quadradoAtual.map(ponto => {
        const vetor = [ponto.x, ponto.y];
        const [novoX, novoY] = multiplicarMatrizVetor(matrizRotacao, vetor);
        return { x: novoX, y: novoY };
    });

    // Redesenhar e atualizar
    redesenharQuadrado(novosPontos);
    quadradoAtual = novosPontos;
    atualizarInformacoesObjeto();
    updateTransformationHistory2D(`Rotação: ${angulo}° em torno de (${centroX}, ${centroY})`);
}


//Matriz de Escala
function criarMatrizEscala(sx, sy) {
    return [
        [sx, 0, 0],
        [0, sy, 0],
        [0, 0, 1]
    ];
}

function aplicarEscalaMatriz() {
    const sx = parseFloat(document.getElementById("x-scale").value) || 1;
    const sy = parseFloat(document.getElementById("y-scale").value) || 1;

    if (quadradoAtual.length === 0) {
        alert("Gere um quadrado primeiro!");
        return;
    }

    // Definir o ponto fixo (50,50)
    const origemX = quadradoAtual[0].x;
    const origemY = quadradoAtual[0].y;

    // Criar as matrizes de transformação
    const matrizTranslacaoParaOrigem = criarMatrizTranslacao(-origemX, -origemY);
    const matrizEscala = criarMatrizEscala(sx, sy);
    const matrizTranslacaoDeVolta = criarMatrizTranslacao(origemX, origemY);

    // Matriz composta: T⁻¹ × Escala × T
    const matrizFinal = multiplicarMatrizes(
        matrizTranslacaoDeVolta,
        multiplicarMatrizes(matrizEscala, matrizTranslacaoParaOrigem)
    );

    // Aplicar transformação
    const novosPontos = quadradoAtual.map(ponto => {
        const vetor = [ponto.x, ponto.y];
        const [novoX, novoY] = multiplicarMatrizVetor(matrizFinal, vetor);
        return { x: novoX, y: novoY };
    });

    // Redesenhar e atualizar
    redesenharQuadrado(novosPontos);
    quadradoAtual = novosPontos;
    atualizarInformacoesObjeto();
    updateTransformationHistory2D(`Escala: Sx = ${sx}, Sy = ${sy}`);
}

//Matriz Cisalhamento
function criarMatrizCisalhamento(shx, shy) {
    return [
        [1, shx, 0],
        [shy, 1, 0],
        [0, 0, 1]
    ];
}

//Função Cisalhamento
function aplicarCisalhamentoMatriz() {
    const shx = parseFloat(document.getElementById("x-cis").value) || 0;
    const shy = parseFloat(document.getElementById("y-cis").value) || 0;

    if (quadradoAtual.length === 0) {
        alert("Gere um quadrado primeiro!");
        return;
    }

    // Criar matriz de cisalhamento
    const matrizCisalhamento = criarMatrizCisalhamento(shx, shy);

    // Aplicar a cada ponto do quadrado
    const novosPontos = quadradoAtual.map(ponto => {
        const vetor = [ponto.x, ponto.y];
        const [novoX, novoY] = multiplicarMatrizVetor(matrizCisalhamento, vetor);
        return { x: novoX, y: novoY };
    });

    // Redesenhar e atualizar
    redesenharQuadrado(novosPontos);
    quadradoAtual = novosPontos;
    atualizarInformacoesObjeto(); // Atualiza a sidebar
    updateTransformationHistory2D(`Cisalhamento: Shx = ${shx}, Shy = ${shy}`);
}


//Matriz de Reflexão
function criarMatrizReflexao(refletirX, refletirY) {
    return [
        [refletirY ? -1 : 1, 0, 0],
        [0, refletirX ? -1 : 1, 0],
        [0, 0, 1]
    ];
}

//flag
let estaRefletido = { x: false, y: false }; // Rastreia se o quadrado está atualmente refletido em X e/ou Y

//Operação Reflexão
function aplicarReflexaoMatriz() {
    const refletirX = document.getElementById("x-ref").checked;
    const refletirY = document.getElementById("y-ref").checked;

    if (!refletirX && !refletirY) return; // Nada a fazer

    if (quadradoAtual.length === 0) {
        alert("Gere um quadrado primeiro!");
        return;
    }

    // Criar matriz de reflexão
    const matrizReflexao = criarMatrizReflexao(refletirX, refletirY);

    // Aplicar a cada ponto do quadrado
    const novosPontos = quadradoAtual.map(ponto => {
        const vetor = [ponto.x, ponto.y];
        const [novoX, novoY] = multiplicarMatrizVetor(matrizReflexao, vetor);
        return { x: novoX, y: novoY };
    });

    // Redesenhar e atualizar
    redesenharQuadrado(novosPontos);
    quadradoAtual = novosPontos;
    atualizarInformacoesObjeto()
    updateTransformationHistory2D(`Reflexão: ${refletirX ? 'em X' : ''} ${refletirY ? 'em Y' : ''}`);
}

//Função para obter os pontos originais do quadrado criado.
function obterPontosOriginais() {
    return [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 },
        { x: 0, y: 50 }
    ];
}

//Função para obter os pontos atuais da figura.
function obterPontosAtuais() {
    return quadradoAtual;
}

// Função auxiliar para redesenhar o quadrado com novos pontos
function redesenharQuadrado(pontos) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();
    
    // Desenhar linhas entre os pontos
    for (let i = 0; i < pontos.length; i++) {
        const proximo = (i + 1) % pontos.length;
        dda(pontos[i].x, pontos[i].y, pontos[proximo].x, pontos[proximo].y);
    }
}

//Função para ter informações em tempo real do objeto
function atualizarInformacoesObjeto() {
    if (quadradoAtual.length === 0) {
        document.getElementById("vertices-list").innerHTML = "Nenhum objeto gerado.";
        document.getElementById("center-position").innerHTML = "Nenhum objeto gerado.";
        return;
    }

    // Calcular centro geométrico (média dos vértices)
    const centroX = (quadradoAtual[0].x + quadradoAtual[1].x + quadradoAtual[2].x + quadradoAtual[3].x) / 4;
    const centroY = (quadradoAtual[0].y + quadradoAtual[1].y + quadradoAtual[2].y + quadradoAtual[3].y) / 4;

    // Formatar vértices
    const verticesHTML = quadradoAtual.map((vertice, index) => 
        `Vértice ${index + 1}: (${vertice.x.toFixed(2)}, ${vertice.y.toFixed(2)})`
    ).join("<br>");

    // Atualizar a UI
    document.getElementById("vertices-list").innerHTML = verticesHTML;
    document.getElementById("center-position").innerHTML = 
        `(${centroX.toFixed(2)}, ${centroY.toFixed(2)})`;
}


// Função para limpar o canvas mantendo o plano cartesiano
function clearCanvas() {
    // Limpa o canvas e redesenhando os eixos
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharQuadrantes();
    
    // Reseta o array do quadrado atual
    quadradoAtual = [];
    
    // Limpa as informações exibidas na sidebar
    document.getElementById("vertices-list").innerHTML = "Nenhum objeto gerado.";
    document.getElementById("center-position").innerHTML = "Nenhum objeto gerado.";

    // Limpa o histórico de transformações
    transformationHistory2D = [];
    document.getElementById('transformation-history').innerHTML = "Nenhuma transformação aplicada.";
}




// --- Histórico de Transformações 2D ---
let transformationHistory2D = [];

function updateTransformationHistory2D(transformation) {
    transformationHistory2D.push(transformation);
    const historyElement = document.getElementById('transformation-history');
    historyElement.innerHTML = transformationHistory2D.map((t, i) => `<div>${i + 1}. ${t}</div>`).join('');
}

// Eventos para os botões
drawSquareBtn.addEventListener("click", drawCustomSquareDDA);
clearCanvasBtn.addEventListener("click", clearCanvas);
document.querySelectorAll('.type-op')[0].addEventListener('click', aplicarTranslacaoMatriz);
document.querySelectorAll('.type-op')[1].addEventListener('click', aplicarEscalaMatriz);
document.querySelectorAll('.type-op')[2].addEventListener('click', aplicarRotacaoMatriz);
document.querySelectorAll('.type-op')[3].addEventListener('click', aplicarReflexaoMatriz);
document.querySelectorAll('.type-op')[4].addEventListener('click', aplicarCisalhamentoMatriz);
// Inicializa o plano cartesiano
desenharQuadrantes();


// --- Sequência de Transformações 2D ---

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
    parametersDiv.innerHTML = ''; // Limpa os parâmetros anteriores

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

// Adiciona a transformação configurada à sequência
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

// Aplica a sequência de transformações
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
                // Escala em torno do primeiro vértice
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

    // Redesenha e atualiza o quadrado
    redesenharQuadrado(pontos);
    quadradoAtual = pontos;
    atualizarInformacoesObjeto();

    transformationSequence2D = []; // Limpa a sequência após aplicar
});