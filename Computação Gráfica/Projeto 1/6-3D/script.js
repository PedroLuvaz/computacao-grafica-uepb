// Configuração do canvas
const canvas = document.getElementById('canvas3d');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

// Variáveis de estado
let currentObject = null;
let objectVertices = [];
let objectEdges = [];
let objectRotationX = 0;
let objectRotationY = 0;
let objectRotationZ = 0;
let zoom = 100;

let cameraRotationX = 0;
let cameraRotationY = 0;
let cameraRotationZ = 0;

// Histórico de transformações
let transformationHistory = [];

// Variável para armazenar a sequência de transformações
let transformationSequence = [];

// Função para desenhar um pixel no canvas
function setPixel(x, y, color = '#000000') {
    const canvasX = Math.round(x);
    const canvasY = Math.round(y);
    
    if (canvasX >= 0 && canvasX < canvas.width && canvasY >= 0 && canvasY < canvas.height) {
        ctx.fillStyle = color;
        ctx.fillRect(canvasX, canvasY, 1, 1);
    }
}

function setPixelWorld(x, y, color = '#000000') {
    const canvasX = Math.round(x);
    const canvasY = Math.round(y);

    if (canvasX >= 0 && canvasX < worldWindowCanvas.width && canvasY >= 0 && canvasY < worldWindowCanvas.height) {
        worldWindowCtx.fillStyle = color;
        worldWindowCtx.fillRect(canvasX, canvasY, 1, 1);
    }
}

function setCameraRotation(x, y, z) {
    cameraRotationX = x;
    cameraRotationY = y;
    cameraRotationZ = z;
    drawObject();
}

// Algoritmo DDA para desenhar linhas
function drawLineDDA(x1, y1, x2, y2, color = '#000000') {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    const xIncrement = dx / steps;
    const yIncrement = dy / steps;
    
    let x = x1;
    let y = y1;
    
    setPixel(x, y, color);
    
    for (let i = 0; i < steps; i++) {
        x += xIncrement;
        y += yIncrement;
        setPixel(x, y, color);
    }
}

function drawLineDDAWorld(x1, y1, x2, y2, color = '#000000') {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    const xIncrement = dx / steps;
    const yIncrement = dy / steps;
    
    let x = x1;
    let y = y1;
    
    setPixelWorld(x, y, color);
    
    for (let i = 0; i < steps; i++) {
        x += xIncrement;
        y += yIncrement;
        setPixelWorld(x, y, color);
    }
}

// Matrizes de transformação 3D
class Matrix3D {
    static multiply(a, b) {
        const result = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                for (let k = 0; k < 4; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        return result;
    }

    static multiplyVector(matrix, vector) {
        const result = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                result[i] += matrix[i][j] * vector[j];
            }
        }
        return result;
    }

    static translation(tx, ty, tz) {
        return [
            [1, 0, 0, tx],
            [0, 1, 0, ty],
            [0, 0, 1, tz],
            [0, 0, 0, 1]
        ];
    }

    static scaling(sx, sy, sz) {
        return [
            [sx, 0, 0, 0],
            [0, sy, 0, 0],
            [0, 0, sz, 0],
            [0, 0, 0, 1]
        ];
    }

    static rotationX(angle) {
        const rad = angle * Math.PI / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return [
            [1, 0, 0, 0],
            [0, c, -s, 0],
            [0, s, c, 0],
            [0, 0, 0, 1]
        ];
    }

    static rotationY(angle) {
        const rad = angle * Math.PI / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return [
            [c, 0, s, 0],
            [0, 1, 0, 0],
            [-s, 0, c, 0],
            [0, 0, 0, 1]
        ];
    }

    static rotationZ(angle) {
        const rad = angle * Math.PI / 180;
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return [
            [c, -s, 0, 0],
            [s, c, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }

    // Função de cisalhamento
    static shear(shXY, shXZ, shYZ) {
        return [
            [1, shXY, shXZ, 0],
            [0, 1, shYZ, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ];
    }

    // Função de reflexão
    static reflection(axis) {
        switch (axis) {
            case 'xy':
                return [
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, -1, 0],
                    [0, 0, 0, 1]
                ];
            case 'xz':
                return [
                    [1, 0, 0, 0],
                    [0, -1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1]
                ];
            case 'yz':
                return [
                    [-1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1]
                ];
        }
    }
}

// Aplicar Escala
document.getElementById('apply-scale').addEventListener('click', () => {
    if (!currentObject) {
        alert('Gere um objeto primeiro!');
        return;
    }

    const sx = parseFloat(document.getElementById('sx').value) || 1;
    const sy = parseFloat(document.getElementById('sy').value) || 1;
    const sz = parseFloat(document.getElementById('sz').value) || 1;

    // Ponto fixo: vértice 1 (xyz)
    const [px, py, pz] = objectVertices[0];

    // Matrizes: translação para origem, escala, volta para posição original
    const toOrigin = Matrix3D.translation(-px, -py, -pz);
    const scale = Matrix3D.scaling(sx, sy, sz);
    const backToPosition = Matrix3D.translation(px, py, pz);

    // Composição: T⁻¹ * S * T
    const transform = Matrix3D.multiply(
        backToPosition,
        Matrix3D.multiply(scale, toOrigin)
    );

    // Aplicar transformação composta a cada vértice
    objectVertices = objectVertices.map(vertex => {
        const transformed = Matrix3D.multiplyVector(transform, [...vertex, 1]);
        return [transformed[0], transformed[1], transformed[2]];
    });

    updateTransformationHistory(`Escala (SX: ${sx}, SY: ${sy}, SZ: ${sz}) em torno do vértice 1`);
    drawObject();
});


// Aplicar Cisalhamento
document.getElementById('apply-shear').addEventListener('click', () => {
    if (!currentObject) {
        alert('Gere um objeto primeiro!');
        return;
    }

    const shXY = parseFloat(document.getElementById('sh-xy').value) || 0;
    const shXZ = parseFloat(document.getElementById('sh-xz').value) || 0;
    const shYZ = parseFloat(document.getElementById('sh-yz').value) || 0;

    const shearMatrix = Matrix3D.shear(shXY, shXZ, shYZ);
    objectVertices = objectVertices.map(vertex => {
        const transformed = Matrix3D.multiplyVector(shearMatrix, [...vertex, 1]);
        return [transformed[0], transformed[1], transformed[2]];
    });

    updateTransformationHistory(`Cisalhamento (XY: ${shXY}, XZ: ${shXZ}, YZ: ${shYZ})`);
    drawObject();
});

//Aplicar Reflexão
document.getElementById('apply-reflection').addEventListener('click', () => {
    if (!currentObject) {
        alert('Gere um objeto primeiro!');
        return;
    }

    const axis = document.getElementById('reflection-axis').value;
    const reflectionMatrix = Matrix3D.reflection(axis);

    objectVertices = objectVertices.map(vertex => {
        const transformed = Matrix3D.multiplyVector(reflectionMatrix, [...vertex, 1]);
        return [transformed[0], transformed[1], transformed[2]];
    });

    updateTransformationHistory(`Reflexão no plano ${axis.toUpperCase()}`);
    drawObject();
});

//Aplicar Translação
document.getElementById('apply-translation').addEventListener('click', () => {
    if (!currentObject) {
        alert('Gere um objeto primeiro!');
        return;
    }
    
    const tx = parseFloat(document.getElementById('tx').value) || 0;
    const ty = parseFloat(document.getElementById('ty').value) || 0;
    const tz = parseFloat(document.getElementById('tz').value) || 0;
    
    const translationMatrix = Matrix3D.translation(tx, ty, tz);
    objectVertices = objectVertices.map(vertex => {
        const transformed = Matrix3D.multiplyVector(translationMatrix, [...vertex, 1]);
        return [transformed[0], transformed[1], transformed[2]];
    });
    updateTransformationHistory(`Translação (TX: ${tx}, TY: ${ty}, TZ: ${tz})`);
    drawObject();
});

//Aplicar rotação
document.getElementById('apply-rotation').addEventListener('click', () => {
    if (!currentObject) {
        alert('Gere um objeto primeiro!');
        return;
    }

    const axis = document.getElementById('rotation-axis').value;
    const angle = parseFloat(document.getElementById('rotation-angle').value) || 0;

    // Ponto fixo (usando vértice 1)
    const [fx, fy, fz] = objectVertices[0];

    // Matrizes de transformação
    const translateToOrigin = Matrix3D.translation(-fx, -fy, -fz);
    const translateBack = Matrix3D.translation(fx, fy, fz);

    let rotationMatrix;
    switch (axis) {
        case 'x':
            rotationMatrix = Matrix3D.rotationX(angle);
            break;
        case 'y':
            rotationMatrix = Matrix3D.rotationY(angle);
            break;
        case 'z':
            rotationMatrix = Matrix3D.rotationZ(angle);
            break;
        default:
            alert('Eixo inválido!');
            return;
    }

    // Composição da transformação completa: T^-1 * R * T
    const compositeMatrix = Matrix3D.multiply(
        translateBack,
        Matrix3D.multiply(rotationMatrix, translateToOrigin)
    );

    // Aplicar a transformação aos vértices
    objectVertices = objectVertices.map(vertex => {
        const transformed = Matrix3D.multiplyVector(compositeMatrix, [...vertex, 1]);
        return [transformed[0], transformed[1], transformed[2]];
    });

    updateTransformationHistory(`Rotação Real (Eixo: ${axis.toUpperCase()}, Ângulo: ${angle}°)`);
    drawObject();
});

// Atualiza os parâmetros exibidos com base no tipo de transformação selecionado
document.getElementById('sequence-transformation-type').addEventListener('change', (e) => {
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
                </div>
                <div class="input-row">
                    <label>Z:</label>
                    <input type="number" id="seq-tz" value="0">
                </div>`;
            break;
        case 'rotation':
            parametersDiv.innerHTML = `
                <div class="input-row">
                    <label>Eixo:</label>
                    <select id="seq-rotation-axis">
                        <option value="x">X</option>
                        <option value="y">Y</option>
                        <option value="z">Z</option>
                    </select>
                </div>
                <div class="input-row">
                    <label>Ângulo:</label>
                    <input type="number" id="seq-rotation-angle" value="0">
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
                </div>
                <div class="input-row">
                    <label>Z:</label>
                    <input type="number" id="seq-sz" value="1" step="0.1">
                </div>`;
            break;
        case 'shear':
            parametersDiv.innerHTML = `
                <div class="input-row">
                    <label>XY:</label>
                    <input type="number" id="seq-sh-xy" value="0" step="0.1">
                </div>
                <div class="input-row">
                    <label>XZ:</label>
                    <input type="number" id="seq-sh-xz" value="0" step="0.1">
                </div>
                <div class="input-row">
                    <label>YZ:</label>
                    <input type="number" id="seq-sh-yz" value="0" step="0.1">
                </div>`;
            break;
        case 'reflection':
            parametersDiv.innerHTML = `
                <div class="input-row">
                    <label>Eixo:</label>
                    <select id="seq-reflection-axis">
                        <option value="xy">XY</option>
                        <option value="xz">XZ</option>
                        <option value="yz">YZ</option>
                    </select>
                </div>`;
            break;
    }
});

// Adiciona a transformação configurada à sequência
document.getElementById('add-to-sequence-btn').addEventListener('click', () => {
    const type = document.getElementById('sequence-transformation-type').value;
    let parameters = {};

    switch (type) {
        case 'translation':
            parameters = {
                tx: parseFloat(document.getElementById('seq-tx').value) || 0,
                ty: parseFloat(document.getElementById('seq-ty').value) || 0,
                tz: parseFloat(document.getElementById('seq-tz').value) || 0
            };
            break;
        case 'rotation':
            parameters = {
                axis: document.getElementById('seq-rotation-axis').value,
                angle: parseFloat(document.getElementById('seq-rotation-angle').value) || 0
            };
            break;
        case 'scale':
            parameters = {
                sx: parseFloat(document.getElementById('seq-sx').value) || 1,
                sy: parseFloat(document.getElementById('seq-sy').value) || 1,
                sz: parseFloat(document.getElementById('seq-sz').value) || 1
            };
            break;
        case 'shear':
            parameters = {
                shXY: parseFloat(document.getElementById('seq-sh-xy').value) || 0,
                shXZ: parseFloat(document.getElementById('seq-sh-xz').value) || 0,
                shYZ: parseFloat(document.getElementById('seq-sh-yz').value) || 0
            };
            break;
        case 'reflection':
            parameters = {
                axis: document.getElementById('seq-reflection-axis').value
            };
            break;
    }

    transformationSequence.push({ type, parameters });
    updateTransformationHistory(`Adicionado à sequência: ${type} (${JSON.stringify(parameters)})`);
});

// Aplica a sequência de transformações
document.getElementById('apply-sequence-btn').addEventListener('click', () => {
    if (!currentObject) {
        alert('Gere um objeto primeiro!');
        return;
    }

    transformationSequence.forEach(transformation => {
        const { type, parameters } = transformation;

        switch (type) {
            case 'translation':
                const translationMatrix = Matrix3D.translation(parameters.tx, parameters.ty, parameters.tz);
                objectVertices = objectVertices.map(vertex => {
                    const transformed = Matrix3D.multiplyVector(translationMatrix, [...vertex, 1]);
                    return [transformed[0], transformed[1], transformed[2]];
                });
                break;
            case 'rotation':
                let rotationMatrix;
                switch (parameters.axis) {
                    case 'x':
                        rotationMatrix = Matrix3D.rotationX(parameters.angle);
                        break;
                    case 'y':
                        rotationMatrix = Matrix3D.rotationY(parameters.angle);
                        break;
                    case 'z':
                        rotationMatrix = Matrix3D.rotationZ(parameters.angle);
                        break;
                }
                objectVertices = objectVertices.map(vertex => {
                    const transformed = Matrix3D.multiplyVector(rotationMatrix, [...vertex, 1]);
                    return [transformed[0], transformed[1], transformed[2]];
                });
                break;
            case 'scale':
                const scaleMatrix = Matrix3D.scaling(parameters.sx, parameters.sy, parameters.sz);
                objectVertices = objectVertices.map(vertex => {
                    const transformed = Matrix3D.multiplyVector(scaleMatrix, [...vertex, 1]);
                    return [transformed[0], transformed[1], transformed[2]];
                });
                break;
            case 'shear':
                const shearMatrix = Matrix3D.shear(parameters.shXY, parameters.shXZ, parameters.shYZ);
                objectVertices = objectVertices.map(vertex => {
                    const transformed = Matrix3D.multiplyVector(shearMatrix, [...vertex, 1]);
                    return [transformed[0], transformed[1], transformed[2]];
                });
                break;
            case 'reflection':
                const reflectionMatrix = Matrix3D.reflection(parameters.axis);
                objectVertices = objectVertices.map(vertex => {
                    const transformed = Matrix3D.multiplyVector(reflectionMatrix, [...vertex, 1]);
                    return [transformed[0], transformed[1], transformed[2]];
                });
                break;
        }

        updateTransformationHistory(`Aplicado: ${type} (${JSON.stringify(parameters)})`);
    });

    transformationSequence = []; // Limpa a sequência após aplicar
    drawObject();
});


function createCube(size) {
    const half = size / 2;
    // Vértice 1 vira a origem (0,0,0)
    // Para isso, somamos half a cada coordenada de cada vértice
    const vertices = [
        [0, 0, 0],              // V1 agora na origem
        [size, 0, 0],           // V2 deslocado
        [size, size, 0],        // V3 deslocado
        [0, size, 0],           // V4 deslocado
        [0, 0, size],           // V5 deslocado
        [size, 0, size],        // V6 deslocado
        [size, size, size],     // V7 deslocado
        [0, size, size]         // V8 deslocado
    ];
    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // Face inferior
        [4, 5], [5, 6], [6, 7], [7, 4], // Face superior
        [0, 4], [1, 5], [2, 6], [3, 7]  // Arestas laterais
    ];
    return { vertices, edges };
}

// Função de projeção 3D para 2D
function projectPoint(x, y, z, applyObjectRotation = true) {
    let point = [x, y, z, 1];
    
    if (applyObjectRotation) {
        const rotX = Matrix3D.rotationX(objectRotationX);
        const rotY = Matrix3D.rotationY(objectRotationY);
        const rotZ = Matrix3D.rotationZ(objectRotationZ);
        let transform = Matrix3D.multiply(rotY, rotX);
        transform = Matrix3D.multiply(rotZ, transform);
        point = Matrix3D.multiplyVector(transform, point);
    }

    // Aplicar rotação da câmera (visualização)
    const camRotX = Matrix3D.rotationX(cameraRotationX);
    const camRotY = Matrix3D.rotationY(cameraRotationY);
    const camRotZ = Matrix3D.rotationZ(cameraRotationZ);
    let cameraTransform = Matrix3D.multiply(camRotY, camRotX);
    cameraTransform = Matrix3D.multiply(camRotZ, cameraTransform);
    point = Matrix3D.multiplyVector(cameraTransform, point);
    
    const f = zoom / 100;
    const px = (point[0] - point[2]) * f * 0.7071 + canvas.width / 2;
    const py = (-point[1] + (point[0] + point[2]) * 0.5) * f * 0.7071 + canvas.height / 2;
    
    return { x: px, y: py };
}

// Função para desenhar eixos fixos
function drawFixedAxes() {
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    const length = 1655 * (zoom / 100);
    
    // Eixo X (vermelho)
    const xEnd = projectPoint(length, 0, 0, false);
    drawLineDDA(center.x, center.y, xEnd.x, xEnd.y, 'red');
    
    // Eixo Y (verde)
    const yEnd = projectPoint(0, length, 0, false);
    drawLineDDA(center.x, center.y, yEnd.x, yEnd.y, 'green');
    
    // Eixo Z (azul)
    const zEnd = projectPoint(0, 0, length, false);
    drawLineDDA(center.x, center.y, zEnd.x, zEnd.y, 'blue');
    
    // Rótulos dos eixos
    ctx.font = '12px Arial';
    ctx.fillStyle = 'red';
    //ctx.fillText('X', xEnd.x + 15, xEnd.y);
    ctx.fillStyle = 'green';
    //ctx.fillText('Y', yEnd.x, yEnd.y - 15);
    ctx.fillStyle = 'blue';
    //ctx.fillText('Z', zEnd.x - 15, zEnd.y);
}

// Função para desenhar eixos rotacionados
function drawRotatedAxes() {
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
    const length = 1655 * (zoom / 100);

    // Eixo X (vermelho)
    const xEnd = projectPoint(length, 0, 0, true); // Aplica rotação
    drawLineDDA(center.x, center.y, xEnd.x, xEnd.y, 'red');

    // Eixo Y (verde)
    const yEnd = projectPoint(0, length, 0, true); // Aplica rotação
    drawLineDDA(center.x, center.y, yEnd.x, yEnd.y, 'green');

    // Eixo Z (azul)
    const zEnd = projectPoint(0, 0, length, true); // Aplica rotação
    drawLineDDA(center.x, center.y, zEnd.x, zEnd.y, 'blue');
}

// Função para desenhar o objeto 3D
function drawObject() {
    // Limpa o canvas principal
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawFixedAxes();

    if (!currentObject) return;

    // Desenha todas as arestas do objeto
    ctx.strokeStyle = '#111';
    for (const edge of objectEdges) {
        const v1 = objectVertices[edge[0]];
        const v2 = objectVertices[edge[1]];
        const p1 = projectPoint(v1[0], v1[1], v1[2]);
        const p2 = projectPoint(v2[0], v2[1], v2[2]);
        drawLineDDA(p1.x, p1.y, p2.x, p2.y, '#111');
    }

    // Desenha os vértices
    for (const vertex of objectVertices) {
        const p = projectPoint(vertex[0], vertex[1], vertex[2]);
        setPixel(p.x, p.y, '#222');
    }

    updateObjectInfo(); // Atualiza informações do objeto

    drawInWorldWindow(); // Desenha na janela do mundo
    drawInViewport();    // Desenha na viewport
}

// Função para atualizar informações do objeto
function updateObjectInfo() {
    const verticesInfo = document.getElementById('vertices-info');
    const centerInfo = document.getElementById('center-info');
    const dimensionsInfo = document.getElementById('dimensions-info');
    const octantInfo = document.getElementById('octant-info');
    
    if (!currentObject) {
        verticesInfo.innerHTML = "Nenhum objeto gerado.";
        centerInfo.innerHTML = "Nenhum objeto gerado.";
        dimensionsInfo.innerHTML = "Nenhum objeto gerado.";
        octantInfo.innerHTML = "Nenhum objeto gerado.";
        return;
    }
    
    // Atualiza informações dos vértices
    let verticesHTML = '';
    objectVertices.forEach((vertex, index) => {
        verticesHTML += `<div class="vertex-info">V${index+1}: (${vertex[0].toFixed(1)}, ${vertex[1].toFixed(1)}, ${vertex[2].toFixed(1)})</div>`;
    });
    verticesInfo.innerHTML = verticesHTML;
    
    // Calcula centro geométrico
    let centerX = 0, centerY = 0, centerZ = 0;
    for (const vertex of objectVertices) {
        centerX += vertex[0];
        centerY += vertex[1];
        centerZ += vertex[2];
    }
    centerX /= objectVertices.length;
    centerY /= objectVertices.length;
    centerZ /= objectVertices.length;
    
    centerInfo.innerHTML = `(${centerX.toFixed(1)}, ${centerY.toFixed(1)}, ${centerZ.toFixed(1)})`;
    
    // Calcula dimensões
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    for (const vertex of objectVertices) {
        minX = Math.min(minX, vertex[0]);
        maxX = Math.max(maxX, vertex[0]);
        minY = Math.min(minY, vertex[1]);
        maxY = Math.max(maxY, vertex[1]);
        minZ = Math.min(minZ, vertex[2]);
        maxZ = Math.max(maxZ, vertex[2]);
    }
    
    dimensionsInfo.innerHTML = `Largura: ${(maxX-minX).toFixed(1)}<br>Altura: ${(maxY-minY).toFixed(1)}<br>Profundidade: ${(maxZ-minZ).toFixed(1)}`;
    
    // Determina octante predominante
    const octantCount = [0,0,0,0,0,0,0,0,0];
    objectVertices.forEach(vertex => {
        const x = vertex[0], y = vertex[1], z = vertex[2];
        let octant = 0;
        if (x >= 0 && y >= 0 && z >= 0) octant = 1;
        else if (x < 0 && y >= 0 && z >= 0) octant = 2;
        else if (x < 0 && y < 0 && z >= 0) octant = 3;
        else if (x >= 0 && y < 0 && z >= 0) octant = 4;
        else if (x >= 0 && y >= 0 && z < 0) octant = 5;
        else if (x < 0 && y >= 0 && z < 0) octant = 6;
        else if (x < 0 && y < 0 && z < 0) octant = 7;
        else if (x >= 0 && y < 0 && z < 0) octant = 8;
        octantCount[octant]++;
    });
    
    const predominantOctant = octantCount.indexOf(Math.max(...octantCount.slice(1)));
    octantInfo.innerHTML = predominantOctant > 0 ? `Octante ${predominantOctant}` : "Indeterminado";
}

// Atualiza o histórico de transformações
function updateTransformationHistory(transformation) {
    transformationHistory.push(transformation);
    const historyElement = document.getElementById('transformation-history');
    historyElement.innerHTML = transformationHistory.map((t, i) => `<div>${i + 1}. ${t}</div>`).join('');
}

// Event Listeners
document.getElementById('generate-object-btn').addEventListener('click', () => {
    const objectType = document.getElementById('object-type-select').value;
    const size = parseInt(document.getElementById('object-size').value) || 50;
    
    switch (objectType) {
        case 'cube':
            currentObject = createCube(size);
            break;
    }
    
    objectRotationX = 0;
    objectRotationY = 0;
    objectRotationZ = 0;
    
    document.getElementById('view-rot-x').value = 0;
    document.getElementById('view-rot-y').value = 0;
    document.getElementById('view-rot-z').value = 0;
    document.getElementById('view-rot-x-value').textContent = '0°';
    document.getElementById('view-rot-y-value').textContent = '0°';
    document.getElementById('view-rot-z-value').textContent = '0°';
    
    objectVertices = currentObject.vertices.map(v => [...v]);
    objectEdges = currentObject.edges;
    drawObject();
});

// Atualiza a rotação da VISUALIZAÇÃO em X
document.getElementById('view-rot-x').addEventListener('input', (e) => {
    cameraRotationX = parseInt(e.target.value);
    document.getElementById('view-rot-x-value').textContent = cameraRotationX + '°';
    drawObject();
});

// Atualiza a rotação da VISUALIZAÇÃO em Y
document.getElementById('view-rot-y').addEventListener('input', (e) => {
    cameraRotationY = parseInt(e.target.value);
    document.getElementById('view-rot-y-value').textContent = cameraRotationY + '°';
    drawObject();
});

// Atualiza a rotação da VISUALIZAÇÃO em Z
document.getElementById('view-rot-z').addEventListener('input', (e) => {
    cameraRotationZ = parseInt(e.target.value);
    document.getElementById('view-rot-z-value').textContent = cameraRotationZ + '°';
    drawObject();
});

//Atualiza o zoom
document.getElementById('view-zoom').addEventListener('input', (e) => {
    zoom = parseInt(e.target.value);
    document.getElementById('view-zoom-value').textContent = zoom + '%';
    drawObject();
});

//Alternar entre as transformaçoes
document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Remove a classe 'active' de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(content => content.classList.remove("active"));

            // Adiciona a classe 'active' ao botão e conteúdo clicado
            button.classList.add("active");
            const tabId = button.getAttribute("data-tab");
            document.getElementById(`${tabId}-tab`).classList.add("active");
        });
    });
});

// Botão Limpar
document.getElementById('clear-btn').addEventListener('click', () => {
    currentObject = null;
    objectVertices = [];
    objectEdges = [];
    objectRotationX = 0;
    objectRotationY = 0;
    objectRotationZ = 0;
    document.getElementById('view-rot-x').value = 0;
    document.getElementById('view-rot-y').value = 0;
    document.getElementById('view-rot-z').value = 0;
    document.getElementById('view-rot-x-value').textContent = '0°';
    document.getElementById('view-rot-y-value').textContent = '0°';
    document.getElementById('view-rot-z-value').textContent = '0°';
    document.getElementById('view-zoom').value = 100;
    document.getElementById('view-zoom-value').textContent = '100%';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFixedAxes();
    updateObjectInfo();
    transformationHistory = [];
    document.getElementById('transformation-history').innerHTML = "Nenhuma transformação aplicada.";
});


document.getElementById('reset-view-btn').addEventListener('click', () => {
    cameraRotationX = 0;
    cameraRotationY = 0;
    cameraRotationZ = 0;
    zoom = 100;

    // Atualiza os sliders visuais também
    document.getElementById('view-rot-x').value = 0;
    document.getElementById('view-rot-y').value = 0;
    document.getElementById('view-rot-z').value = 0;
    document.getElementById('view-zoom').value = 100;

    // Atualiza os textos de valor
    document.getElementById('view-rot-x-value').textContent = '0°';
    document.getElementById('view-rot-y-value').textContent = '0°';
    document.getElementById('view-rot-z-value').textContent = '0°';
    document.getElementById('view-zoom-value').textContent = '100%';

    drawObject();
});

// Navegação - Voltar ao Início
document.getElementById('back').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = this.getAttribute('href');
});


//IMPLEMENTAÇÃO DA VIEWPORT E JANELA DO MUNDO

const worldWindowCanvas = document.getElementById('world-window');
const worldWindowCtx = worldWindowCanvas.getContext('2d');

//TRANSFORMAÇÃO PARA VIEWPORT
function transformToViewport(x, y, xMin, yMin, xMax, yMax, vpXMin, vpYMin, vpXMax, vpYMax) {
    const xViewport = ((x - xMin) / (xMax - xMin)) * (vpXMax - vpXMin) + vpXMin;
    const yViewport = ((y - yMin) / (yMax - yMin)) * (vpYMax - vpYMin) + vpYMin;
    return { x: xViewport, y: yViewport };
}

function drawInWorldWindow() {
    const size = 300;
    worldWindowCtx.fillStyle = 'white';
    worldWindowCtx.fillRect(0, 0, size, size);

    if (!currentObject) return;

    // Define limites da janela do mundo (ex: -100 a 100 em X e Y)
    const xMin = -100, yMin = -100, xMax = 100, yMax = 100;

    // Função auxiliar para mapear coordenadas do mundo para o canvas
    function worldToCanvas(x, y) {
        const cx = ((x - xMin) / (xMax - xMin)) * size;
        const cy = size - ((y - yMin) / (yMax - yMin)) * size; // Inverte Y
        return { x: cx, y: cy };
    }

    // Desenha eixos usando drawLineDDA
    const center = worldToCanvas(0, 0);


    // Desenha vértices e arestas usando drawLineDDA
    worldWindowCtx.strokeStyle = '#111'; // Aqui só para referência, mas o strokeStyle não afeta o drawLineDDA
    
    for (const edge of objectEdges) {
        const v1 = objectVertices[edge[0]];
        const v2 = objectVertices[edge[1]];

        const p1 = worldToCanvas(v1[0], v1[1]);
        const p2 = worldToCanvas(v2[0], v2[1]);

        drawLineDDAWorld(p1.x, p1.y, p2.x, p2.y, '#111');
    }
}

// Viewport state
let viewportActive = false;
let viewport = { xmin: -50, ymin: -50, xmax: 50, ymax: 50 };

// UI listeners para viewport
document.getElementById('viewport-active').addEventListener('change', (e) => {
    viewportActive = e.target.checked;
    drawObject();
});
['viewport-xmin', 'viewport-ymin', 'viewport-xmax', 'viewport-ymax'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        viewport.xmin = parseFloat(document.getElementById('viewport-xmin').value);
        viewport.ymin = parseFloat(document.getElementById('viewport-ymin').value);
        viewport.xmax = parseFloat(document.getElementById('viewport-xmax').value);
        viewport.ymax = parseFloat(document.getElementById('viewport-ymax').value);
        drawObject();
    });
});

// Cohen-Sutherland codes para 3D (usando só X e Y para viewport 2D)
function computeOutCode(x, y, vp) {
    let code = 0;
    if (x < vp.xmin) code |= 1; // esquerda
    else if (x > vp.xmax) code |= 2; // direita
    if (y < vp.ymin) code |= 4; // abaixo
    else if (y > vp.ymax) code |= 8; // acima
    return code;
}

// Cohen-Sutherland para recorte de linhas 3D projetadas no plano XY
function cohenSutherlandClip(x0, y0, x1, y1, vp) {
    let outcode0 = computeOutCode(x0, y0, vp);
    let outcode1 = computeOutCode(x1, y1, vp);
    let accept = false;
    let clipped0 = {x: x0, y: y0};
    let clipped1 = {x: x1, y: y1};

    while (true) {
        if (!(outcode0 | outcode1)) {
            accept = true;
            break;
        } else if (outcode0 & outcode1) {
            break;
        } else {
            let outcodeOut = outcode0 ? outcode0 : outcode1;
            let x, y;
            if (outcodeOut & 8) { // acima
                x = x0 + (x1 - x0) * (vp.ymax - y0) / (y1 - y0);
                y = vp.ymax;
            } else if (outcodeOut & 4) { // abaixo
                x = x0 + (x1 - x0) * (vp.ymin - y0) / (y1 - y0);
                y = vp.ymin;
            } else if (outcodeOut & 2) { // direita
                y = y0 + (y1 - y0) * (vp.xmax - x0) / (x1 - x0);
                x = vp.xmax;
            } else if (outcodeOut & 1) { // esquerda
                y = y0 + (y1 - y0) * (vp.xmin - x0) / (x1 - x0);
                x = vp.xmin;
            }
            if (outcodeOut === outcode0) {
                clipped0.x = x; clipped0.y = y;
                outcode0 = computeOutCode(x, y, vp);
            } else {
                clipped1.x = x; clipped1.y = y;
                outcode1 = computeOutCode(x, y, vp);
            }
        }
    }
    if (accept) {
        return { accept: true, p0: clipped0, p1: clipped1 };
    } else {
        return { accept: false };
    }
}

// Desenha a viewport no canvas principal
function drawViewportRect() {
    if (!viewportActive) return;
    // Projeta os cantos da viewport para o canvas
    const p1 = projectPoint(viewport.xmin, viewport.ymin, 0);
    const p2 = projectPoint(viewport.xmax, viewport.ymin, 0);
    const p3 = projectPoint(viewport.xmax, viewport.ymax, 0);
    const p4 = projectPoint(viewport.xmin, viewport.ymax, 0);

    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

// Altere a função drawObject para usar o recorte
function drawObject() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawFixedAxes();

    if (!currentObject) return;

    // Desenha as arestas com recorte
    for (const edge of objectEdges) {
        const v1 = objectVertices[edge[0]];
        const v2 = objectVertices[edge[1]];
        const p1 = projectPoint(v1[0], v1[1], v1[2]);
        const p2 = projectPoint(v2[0], v2[1], v2[2]);

        if (viewportActive) {
            // Use coordenadas do mundo para clipping
            const clip = cohenSutherlandClip(v1[0], v1[1], v2[0], v2[1], viewport);
            if (clip.accept) {
                // Parte dentro: preto
                const q1 = projectPoint(clip.p0.x, clip.p0.y, v1[2]);
                const q2 = projectPoint(clip.p1.x, clip.p1.y, v2[2]);
                drawLineDDA(q1.x, q1.y, q2.x, q2.y, '#111');
                // Se houve recorte, desenhe as partes fora em vermelho
                if (clip.p0.x !== v1[0] || clip.p0.y !== v1[1]) {
                    const r1 = projectPoint(v1[0], v1[1], v1[2]);
                    drawLineDDA(r1.x, r1.y, q1.x, q1.y, 'red');
                }
                if (clip.p1.x !== v2[0] || clip.p1.y !== v2[1]) {
                    const r2 = projectPoint(v2[0], v2[1], v2[2]);
                    drawLineDDA(r2.x, r2.y, q2.x, q2.y, 'red');
                }
            } else {
                // Totalmente fora: vermelho
                drawLineDDA(p1.x, p1.y, p2.x, p2.y, 'red');
            }
        } else {
            drawLineDDA(p1.x, p1.y, p2.x, p2.y, '#111');
        }
    }

    // Desenha os vértices
    for (const vertex of objectVertices) {
        const p = projectPoint(vertex[0], vertex[1], vertex[2]);
        setPixel(p.x, p.y, '#222');
    }

    drawViewportRect();
    updateObjectInfo();
    drawInWorldWindow();
}

// Altere a função drawInWorldWindow para desenhar a viewport
function drawInWorldWindow() {
    const size = 300;
    worldWindowCtx.fillStyle = 'white';
    worldWindowCtx.fillRect(0, 0, size, size);

    if (!currentObject) return;

    // Limites da janela do mundo
    const xMin = -100, yMin = -100, xMax = 100, yMax = 100;
    function worldToCanvas(x, y) {
        const cx = ((x - xMin) / (xMax - xMin)) * size;
        const cy = size - ((y - yMin) / (yMax - yMin)) * size;
        return { x: cx, y: cy };
    }

    // Eixos
    const center = worldToCanvas(0, 0);
    // Arestas com recorte visual
    for (const edge of objectEdges) {
        const v1 = objectVertices[edge[0]];
        const v2 = objectVertices[edge[1]];

        if (viewportActive) {
            // Use coordenadas do mundo para clipping
            const clip = cohenSutherlandClip(v1[0], v1[1], v2[0], v2[1], viewport);
            if (clip.accept) {
                // Parte dentro: preto
                const q1 = worldToCanvas(clip.p0.x, clip.p0.y);
                const q2 = worldToCanvas(clip.p1.x, clip.p1.y);
                drawLineDDAWorld(q1.x, q1.y, q2.x, q2.y, '#111');
                // Se houve recorte, desenhe as partes fora em vermelho
                if (clip.p0.x !== v1[0] || clip.p0.y !== v1[1]) {
                    const r1 = worldToCanvas(v1[0], v1[1]);
                    drawLineDDAWorld(r1.x, r1.y, q1.x, q1.y, 'red');
                }
                if (clip.p1.x !== v2[0] || clip.p1.y !== v2[1]) {
                    const r2 = worldToCanvas(v2[0], v2[1]);
                    drawLineDDAWorld(r2.x, r2.y, q2.x, q2.y, 'red');
                }
            } else {
                // Totalmente fora: vermelho
                const p1 = worldToCanvas(v1[0], v1[1]);
                const p2 = worldToCanvas(v2[0], v2[1]);
                drawLineDDAWorld(p1.x, p1.y, p2.x, p2.y, 'red');
            }
        } else {
            // Sem viewport, desenha normalmente
            const p1 = worldToCanvas(v1[0], v1[1]);
            const p2 = worldToCanvas(v2[0], v2[1]);
            drawLineDDAWorld(p1.x, p1.y, p2.x, p2.y, '#111');
        }
    }

    // Desenha a viewport
    if (viewportActive) {
        const vp1 = worldToCanvas(viewport.xmin, viewport.ymin);
        const vp2 = worldToCanvas(viewport.xmax, viewport.ymin);
        const vp3 = worldToCanvas(viewport.xmax, viewport.ymax);
        const vp4 = worldToCanvas(viewport.xmin, viewport.ymax);
        worldWindowCtx.save();
        worldWindowCtx.setLineDash([5, 5]);
        worldWindowCtx.strokeStyle = 'blue';
        worldWindowCtx.beginPath();
        worldWindowCtx.moveTo(vp1.x, vp1.y);
        worldWindowCtx.lineTo(vp2.x, vp2.y);
        worldWindowCtx.lineTo(vp3.x, vp3.y);
        worldWindowCtx.lineTo(vp4.x, vp4.y);
        worldWindowCtx.closePath();
        worldWindowCtx.stroke();
        worldWindowCtx.setLineDash([]);
        worldWindowCtx.restore();
    }
}


// Inicialização
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawFixedAxes(); 
drawOctants();
updateObjectInfo();

