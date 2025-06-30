/*
Funções de operações morfológicas básicas para imagens binárias:
- erosion: Aplica erosão na imagem binária usando o kernel k.
- dilation: Aplica dilatação na imagem binária usando o kernel k.
- opening: Realiza abertura (erosão seguida de dilatação).
- closing: Realiza fechamento (dilatação seguida de erosão).
*/
// ===============================
// Operações morfológicas binárias
// ===============================
const dilation = function(img, w, h, k) { return operation(img, w, h, k, 'erosion'); };
const erosion = function(img, w, h, k) { return operation(img, w, h, k, 'dilation'); };
const opening = function(img, w, h, k) { return erosion(dilation(img, w, h, k), w, h, k); };
const closing = function(img, w, h, k) { return dilation(erosion(img, w, h, k), w, h, k); };

/*
complement: Calcula o complemento da imagem binária (inverte 0 e 1).
*/
// ===============================
// Complemento e contornos
// ===============================
const complement = (img) => img.map((i) => i.map((j) => 1 - j));

/*
external: Calcula o contorno externo (dilatação menos a imagem original).
internal: Calcula o contorno interno (imagem original menos a erosão).
gradient: Calcula o gradiente morfológico (dilatação menos erosão).
thinning: Realiza afinamento (imagem menos gradiente).
*/
const external = function(img, w, h, k) { return composition(dilation(img, w, h, k), img, w, h, sub); };
const internal = function(img, w, h, k) { return composition(img, erosion(img, w, h, k), w, h, sub); };
const gradient = function(img, w, h, k) { return composition(dilation(img, w, h, k), erosion(img, w, h, k), w, h, sub); };
const thinning = function(img, w, h, k) { return composition(img, gradient(img, w, h, k), w, h, sub); };

// ===============================
// Operações para imagens em tons de cinza
// ===============================
/*
Funções de operações morfológicas para imagens em tons de cinza:
- erosionGray: Erosão em tons de cinza.
- dilationGray: Dilatação em tons de cinza.
- openingGray: Abertura em tons de cinza.
- closingGray: Fechamento em tons de cinza.
- gradientGray: Gradiente morfológico em tons de cinza.
- topHat: Top-hat (imagem menos abertura).
- bottomHat: Bottom-hat (fechamento menos imagem).
*/
const erosionGray = (img, w, h, k) => operationGray(img, w, h, k, 'erosion');
const dilationGray = (img, w, h, k) => operationGray(img, w, h, k, 'dilation');
const openingGray = (img, w, h, k) => dilationGray(erosionGray(img, w, h, k), w, h, k);
const closingGray = (img, w, h, k) => erosionGray(dilationGray(img, w, h, k), w, h, k);
const gradientGray = (img, w, h, k) => composition(dilationGray(img, w, h, k), erosionGray(img, w, h, k), w, h, sub);
const topHat = (img, w, h, k) => composition(img, openingGray(img, w, h, k), w, h, sub);
const bottomHat = (img, w, h, k) => composition(closingGray(img, w, h, k), img, w, h, sub);

/*
sub: Função auxiliar para subtração de dois valores.
*/
// ===============================
// Função auxiliar de subtração
// ===============================
const sub = (a, b) => a - b;

// ===============================
// Controle de operadores e kernels
// ===============================
// Variável para armazenar o operador atual selecionado
let currentOperator = null;

/*
operators: Mapeia índices para funções de operações morfológicas.
*/
const operators = {
    1: complement,
    2: erosion,
    3: dilation,
    4: opening,
    5: closing,
    6: external,
    7: internal,
    8: gradient,
    9: thinning,
    10: erosionGray,
    11: dilationGray,
    12: openingGray,
    13: closingGray,
    14: gradientGray,
    15: topHat,
    16: bottomHat,
};

/*
imagesPath: Mapeia índices para caminhos dos arquivos de imagem.
*/
const imagesPath = {
    0: '../assets/fingerprint.pbm',
    1: '../assets/holes.pbm',
    2: '../assets/text.pbm',
    3: '../assets/map.pbm',
    4: '../assets/lena.pgm',
    5: '../assets/airplane.pgm',
    6: '../assets/cameraman.pgm',
    7: '../assets/supernova.pgm',
    8: '../assets/sea.pgm',
    9: '../assets/tomography.pgm',
    10: '../assets/particles.pgm',
};

// kernelList: Kernel padrão 3x3 para operações morfológicas
let kernelList = [0, 1, 0, 1, 1, 1, 0, 1, 0];

// ===============================
// Elementos da interface (DOM)
// ===============================
const downloadBtn = document.getElementById('download-btn');
const applyAgainBtn = document.getElementById('apply-again-btn');
const filterSelector = document.getElementById('input-filter');
const inputMatrix = document.getElementById('input-matrix');
const inputMatrixValues = document.getElementsByName('array[]');
const imgSelector = document.getElementById('img-selector');

// ===============================
// Objetos de imagem
// ===============================
let img = new Image();
let processedImg = new Image();

/*
mainCanvas: Função para configurar o canvas da imagem original.
- Cria o canvas e carrega a imagem inicial.
- Atualiza a imagem ao trocar a seleção.
- Permite aplicar novamente o último filtro processado.
*/
// ===============================
// Canvas principal (imagem original)
// ===============================
const mainCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("original-img");
        readImage('../assets/fingerprint.pbm', sketch, img);
    }

    imgSelector.onchange = _ => readImage(imagesPath[imgSelector.value], sketch, img);

    applyAgainBtn.onclick = function () {
        if (processedImg.w !== 0) {
            img.data = processedImg.data;
            paintImage(sketch, img);
        }
    }
}

/*
processedCanvas: Função para configurar o canvas da imagem processada.
- Aplica o filtro selecionado.
- Atualiza o kernel conforme o usuário altera a matriz.
- Permite baixar a imagem processada.
*/
// ===============================
// Canvas processado (imagem filtrada)
// ===============================
let processedCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("processed-img");
    };

    filterSelector.onchange = function () {
        let value = filterSelector.value;

        processedImg.type = img.type;
        processedImg.w = img.w;
        processedImg.h = img.h;

        if (value === '0') {
            currentOperator = null;
            processedImg.data = img.data;
        } else {
            currentOperator = operators[value];
            processedImg.data = currentOperator(img.data, img.w, img.h, kernelList);
        }

        paintImage(sketch, processedImg);
    }

    inputMatrix.onchange = function () {
        for (let i = 0; i < 9; i++) {
            kernelList[i] = parseInt(inputMatrixValues[i].value);
        }

        if (currentOperator != null) {
            processedImg.data = currentOperator(img.data, img.w, img.h, kernelList);
            paintImage(sketch, processedImg);
        }
    }

    downloadBtn.onclick = function () {
        if (processedImg.w !== 0) {
            let filename = "image.pbm";
            download(filename, processedImg);
        }
    }
};

// ===============================
// Inicialização dos dois canvas usando p5.js
// ===============================
new p5(mainCanvas, 'p5sketch');
new p5(processedCanvas, 'p5sketch');

/*
operation: Realiza erosão ou dilatação em uma imagem binária.
- img: matriz da imagem (0 ou 1).
- w, h: largura e altura da imagem.
- k: kernel 3x3 (array de 9 elementos).
- operate: 'erosion' ou 'dilation'.
Para cada pixel, calcula a soma dos vizinhos definidos pelo kernel.
Para erosão, exige que todos os pixels do kernel estejam ativos.
Para dilatação, basta um pixel ativo.
*/
// ===============================
// Função de operação morfológica binária
// ===============================
function operation(img, w, h, k, operate = 'erosion') {
    const res = Array.from({ length: h }, () => Array(w).fill(0));
    const kernelSum = k.reduce((a, b) => a + b, 0);

    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            let match = 0;
            // Percorre o kernel 3x3
            for (let ki = -1; ki <= 1; ki++) {
                for (let kj = -1; kj <= 1; kj++) {
                    const kernelIdx = (ki + 1) * 3 + (kj + 1);
                    if (!k[kernelIdx]) continue;
                    const ni = i + ki;
                    const nj = j + kj;
                    if (ni >= 0 && ni < h && nj >= 0 && nj < w) {
                        if (img[ni][nj]) match++;
                    }
                }
            }
            if (operate === 'dilation') {
                res[i][j] = match > 0 ? 1 : 0;
            } else { // erosion
                res[i][j] = match === kernelSum ? 1 : 0;
            }
        }
    }
    return res;
}

/*
operationGray: Realiza erosão ou dilatação em imagem em tons de cinza.
- img: matriz da imagem (valores 0-255).
- w, h: largura e altura.
- k: kernel 3x3.
- value: 'erosion' (mínimo) ou 'dilation' (máximo).
Para cada pixel, coleta os vizinhos definidos pelo kernel.
Para erosão, pega o menor valor; para dilatação, o maior.
*/
// ===============================
// Função de operação morfológica em tons de cinza
// ===============================
function operationGray(img, w, h, k, value = 'dilation') {
    let res = [];

    for (let i = 0; i < h; i++) {
        res[i] = [];
        for (let j = 0; j < w; j++) {
            let neighbors = [];

            // Coleta os vizinhos conforme o kernel, tratando bordas
            if (k[0]) neighbors.push(i > 0 && j > 0 ? img[i - 1][j - 1] : 0);
            if (k[1]) neighbors.push(i > 0 ? img[i - 1][j] : 0);
            if (k[2]) neighbors.push(i > 0 && j < w - 1 ? img[i - 1][j + 1] : 0);

            if (k[3]) neighbors.push(j > 0 ? img[i][j - 1] : 0);
            if (k[4]) neighbors.push(img[i][j]);
            if (k[5]) neighbors.push(j < w - 1 ? img[i][j + 1] : 0);

            if (k[6]) neighbors.push(i < h - 1 && j > 0 ? img[i + 1][j - 1] : 0);
            if (k[7]) neighbors.push(i < h - 1 ? img[i + 1][j] : 0);
            if (k[8]) neighbors.push(i < h - 1 && j < w - 1 ? img[i + 1][j + 1] : 0);

            if (neighbors.length === 0) {
                res[i][j] = img[i][j];
            } else if (value === 'erosion') {
                res[i][j] = Math.min(...neighbors);
            } else {
                res[i][j] = Math.max(...neighbors);
            }
        }
    }

    return res;
}