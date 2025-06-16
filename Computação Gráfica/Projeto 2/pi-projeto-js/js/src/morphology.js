/*
Funções de operações morfológicas básicas para imagens binárias:
- erosion: Aplica erosão na imagem binária usando o kernel k.
- dilation: Aplica dilatação na imagem binária usando o kernel k.
- opening: Realiza abertura (erosão seguida de dilatação).
- closing: Realiza fechamento (dilatação seguida de erosão).
*/
const erosion = (img, w, h, k) => operation(img, w, h, k, 'erosion');
const dilation = (img, w, h, k) => operation(img, w, h, k, 'dilation');
const opening = (img, w, h, k) => dilation(erosion(img, w, h, k), w, h, k);
const closing = (img, w, h, k) => erosion(dilation(img, w, h, k), w, h, k);

/*
complement: Calcula o complemento da imagem binária (inverte 0 e 1).
*/
const complement = (img) => img.map((i) => i.map((j) => 1 - j));

/*
external: Calcula o contorno externo (dilatação menos a imagem original).
internal: Calcula o contorno interno (imagem original menos a erosão).
gradient: Calcula o gradiente morfológico (dilatação menos erosão).
thinning: Realiza afinamento (imagem menos gradiente).
*/
const external = (img, w, h, k) => composition(dilation(img, w, h, k), img, w, h, sub);
const internal = (img, w, h, k) => composition(img, erosion(img, w, h, k), w, h, sub);
const gradient = (img, w, h, k) => composition(dilation(img, w, h, k), erosion(img, w, h, k), w, h, sub);
const thinning = (img, w, h, k) => composition(img, gradient(img, w, h, k), w, h, sub);

// Operações para imagens em tons de cinza

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
const sub = (a, b) => a - b;

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

// Elementos da interface
const downloadBtn = document.getElementById('download-btn');
const applyAgainBtn = document.getElementById('apply-again-btn');
const filterSelector = document.getElementById('input-filter');
const inputMatrix = document.getElementById('input-matrix');
const inputMatrixValues = document.getElementsByName('array[]');
const imgSelector = document.getElementById('img-selector');

// Objetos de imagem
let img = new Image();
let processedImg = new Image();

/*
mainCanvas: Função para configurar o canvas da imagem original.
- Cria o canvas e carrega a imagem inicial.
- Atualiza a imagem ao trocar a seleção.
- Permite aplicar novamente o último filtro processado.
*/
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

// Inicializa os dois canvas usando p5.js
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
function operation(img, w, h, k, operate = 'erosion') {
    let res = [];

    // Para dilatação, basta 1 pixel ativo; para erosão, soma total do kernel
    let target = operate === 'dilation' ? 1 : k.reduce((a, b) => a + b, 0);

    for (let i = 0; i < h; i++) {
        res[i] = [];
        for (let j = 0; j < w; j++) {
            let acc = 0;

            // Para cada posição do kernel, verifica bordas e soma se o kernel ativa o vizinho
            acc += k[0] & (i === 0 || j === 0 ? 0 : img[i - 1][j - 1]);
            acc += k[1] & (i === 0 ? 0 : img[i - 1][j]);
            acc += k[2] & (i === 0 || j === w - 1 ? 0 : img[i - 1][j + 1]);

            acc += k[3] & (j === 0 ? 0 : img[i][j - 1]);
            acc += k[4] & img[i][j];
            acc += k[5] & (j === w - 1 ? 0 : img[i][j + 1]);

            acc += k[6] & (i === h - 1 || j === 0 ? 0 : img[i + 1][j - 1]);
            acc += k[7] & (i === h - 1 ? 0 : img[i + 1][j]);
            acc += k[8] & (i === h - 1 || j === img.w - 1 ? 0 : img[i + 1][j + 1]);

            // Se atingir o alvo, ativa o pixel (1), senão desativa (0)
            res[i][j] = acc >= target ? 1 : 0;
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
function operationGray(img, w, h, k, value = 'dilation') {
    let arr = [];
    let res = [];

    for (let i = 0; i < h; i++) {
        res[i] = [];

        for (let j = 0; j < w; j++) {
            let acc = -1;

            // Coleta os vizinhos conforme o kernel, tratando bordas
            if (k[0] !== 0) arr[++acc] = i === 0 || j === 0 ? 0 : img[i - 1][j - 1];
            if (k[1] !== 0) arr[++acc] = i === 0 ? 0 : img[i - 1][j];
            if (k[2] !== 0) arr[++acc] = i === 0 || j === w - 1 ? 0 : img[i - 1][j + 1];

            if (k[3] !== 0) arr[++acc] = j === 0 ? 0 : img[i][j - 1];
            if (k[4] !== 0) arr[++acc] = img[i][j];
            if (k[5] !== 0) arr[++acc] = j === w - 1 ? 0 : img[i][j + 1];

            if (k[6] !== 0) arr[++acc] = i === h - 1 || j === 0 ? 0 : img[i + 1][j - 1];
            if (k[7] !== 0) arr[++acc] = i === h - 1 ? 0 : img[i + 1][j];
            if (k[8] !== 0) arr[++acc] = i === h - 1 || j === w - 1 ? 0 : img[i + 1][j + 1];

            // Se só há um valor, retorna ele; senão, ordena e pega mínimo (erosão) ou máximo (dilatação)
            if (acc === 0) {
                res[i][j] = arr[0];
            } else if (acc > 0) {
                insertionSort(arr, acc + 1)
                res[i][j] = arr[value === 'erosion' ? 0 : acc];
            } else {
                res[i][j] = res[i][j];
            }
        }
    }

    return res;
}