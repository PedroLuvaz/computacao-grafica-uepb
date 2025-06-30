/*
Resumidamente, esse trecho de código define diferentes matrizes de máscaras de convolução que representam 
filtros de imagem, define funções auxiliares para processar imagens com esses filtros, cria uma interface de 
usuário para selecionar e aplicar filtros em imagens e usa a biblioteca p5.js para manipular os canvas e a 
interação do usuário.
*/

// ===============================
// Constantes para cálculos de máscaras
// ===============================
const HALF = 1.0 / 2.0;
const FOURTH = 1.0 / 4.0;
const EIGHTH = 1.0 / 8.0;
const NINTH = 1.0 / 9.0;
const SIXTEENTH = 1.0 / 16.0;

// ===============================
// Definição das máscaras de filtros (Kernels)
// ===============================
const edgeDetection = [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]];
const edgeDetection2 = [[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]];
const laplace = [[0, -1, 0], [-1, 4, -1], [0, -1, 0]];
const sharpen = [[0, -0.2, 0], [-0.2, 1.8, -0.2], [0, -0.2, 0]];
const sharpen2 = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];
const sharpen3 = [[1, -2, 1], [-2, 5, -2], [1, -2, 1]];

const sobelX = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
const sobelY = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
const sobelXY = (img) => magnitude(convolution(img, sobelX, doNormalize), convolution(img, sobelY, doNormalize), img.w, img.h, doNormalize);

const prewittX = [[-1, -1, -1], [0, 0, 0], [1, 1, 1]];
const prewittY = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
const prewittXY = (img) => magnitude(convolution(img, prewittX, doNormalize), convolution(img, prewittY, doNormalize), img.w, img.h, doNormalize);

const average = [[NINTH, NINTH, NINTH], [NINTH, NINTH, NINTH], [NINTH, NINTH, NINTH]];

const gaussianBlur = [
    [SIXTEENTH, EIGHTH, SIXTEENTH],
    [EIGHTH, FOURTH, EIGHTH],
    [SIXTEENTH, EIGHTH, SIXTEENTH]
];

const gradientX = [[0, 0, 0], [0, 1, 0], [0, -1, 0]];
const gradientY = [[0, 0, 0], [0, 1, -1], [0, 0, 0]];
const gradientXY = (img) => magnitude(convolution(img, gradientX, doNormalize), convolution(img, gradientY, doNormalize), img.w, img.h, doNormalize);

const robertsX = [[0, 0, 0], [0, 1, 0], [0, 0, -1]];
const robertsY = [[0, 0, 0], [0, 0, 1], [0, -1, 0]];
const robertsXY = (img) => magnitude(convolution(img, robertsX, doNormalize), convolution(img, robertsY, doNormalize), img.w, img.h, doNormalize);

const none = [[0, 0, 0], [0, 1, 0], [0, 0, 0]];
const custom = [[0, 0, 0], [0, 1, 0], [0, 0, 0]];

// ===============================
// Variáveis de controle de kernel e operadores
// ===============================
let activeKernel = none;

const kernel = {
    0: none,
    2: edgeDetection,
    3: edgeDetection2,
    4: sharpen,
    5: sobelX,
    6: sobelY,
    7: prewittX,
    8: prewittY,
    9: average,
    10: gaussianBlur,
    11: gradientX,
    12: gradientY,
    13: robertsX,
    14: robertsY,
    17: laplace,
    18: sharpen2,
    15: sharpen3,
};

const operators = {
    19: robertsXY,
    20: gradientXY,
    21: sobelXY,
    22: prewittXY,
    23: medianFilter,
    24: highBoostFilter
}

// ===============================
// Caminhos das imagens de exemplo
// ===============================
const imagesPath = {
    0: '../assets/lena.pgm',
    1: '../assets/lenasalp.pgm',
    2: '../assets/lenag.pgm',
    3: '../assets/airplane.pgm',
    4: "../assets/pedrokid.pgm",
    5: "../assets/kidnathan.pgm",
};

// ===============================
// Elementos da interface (DOM)
// ===============================
const applyFilterBtn = document.getElementById('apply-filter-btn');
const applyHBBtn = document.getElementById('apply-hb-btn');
const applyAgainBtn = document.getElementById('apply-again-btn');
const downloadBtn = document.getElementById('download-btn');

const filterSelector = document.getElementById('input-filter');
const inputMatrix = document.getElementById('input-matrix');
const inputMatrixValues = document.getElementsByName('array[]');
const imgSelector = document.getElementById('img-selector');
const ahb = document.getElementById('ahb');

const normalizeSwitch = document.getElementById('normalizeSwitch');

// ===============================
// Variáveis globais de controle de estado
// ===============================
let doNormalize = false;

let img = new Image();
let processedImg = new Image();
let originalImageData = []; // Para guardar uma cópia dos dados originais

// ===============================
// Configuração do canvas principal (imagem original)
// ===============================
const mainCanvas = function (sketch) {
    const normalizeOriginalSwitch = document.getElementById('normalizeOriginalSwitch');

    // Função a ser chamada após o carregamento de uma imagem
    const onImageLoaded = (loadedImg) => {
        // Guarda uma cópia profunda para evitar modificações
        originalImageData = JSON.parse(JSON.stringify(loadedImg.data));
        // Renderiza a tabela com os dados brutos por padrão
        renderPixelTable('original-pixels-table', originalImageData);
        // Garante que o switch de normalização comece desmarcado
        if (normalizeOriginalSwitch) normalizeOriginalSwitch.checked = false;
    };

    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("original-img");
        // Usa o callback para renderizar a tabela após o carregamento
        readImage('../assets/lena.pgm', sketch, img, onImageLoaded);
    }

    imgSelector.onchange = _ => readImage(imagesPath[imgSelector.value], sketch, img, onImageLoaded);

    if (normalizeOriginalSwitch) {
        normalizeOriginalSwitch.onchange = function () {
            if (originalImageData.length === 0) return;

            if (this.checked) {
                const normalizedData = normalize(originalImageData, img.w, img.h);
                renderPixelTable('original-pixels-table', normalizedData);
            } else {
                renderPixelTable('original-pixels-table', originalImageData);
            }
        };
    }

    applyAgainBtn.onclick = function () {
        if (processedImg.w !== 0) {
            img.data = processedImg.data;
            paintImage(sketch, img);
            // A imagem "original" agora é a processada. Atualiza a cópia e a tabela.
            onImageLoaded(img);
        }
    }
}

// ===============================
// Configuração do canvas processado (imagem filtrada)
// ===============================
const processedCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("processed-img");
        // Define um valor padrão para o scalar
        ahb.value = "1.5";  
    };

    filterSelector.onchange = function () {
        let value = parseInt(filterSelector.value);
        processedImg.type = img.type;
        processedImg.w = img.w;
        processedImg.h = img.h;

        if (value === 24) {
            ahb.disabled = false; // ou ahb.readOnly = false;
        } else {
            ahb.disabled = true;  // ou ahb.readOnly = true;
        }

        if (value >= 19) { // filtros de magnitude > 18
            processedImg.data = operators[value](img);
        } else {
            activeKernel = kernel[value];
            let k = 0;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    inputMatrixValues[k++].value = `${activeKernel[i][j]}`;
                }
            }
            processedImg.data = convolution(img, activeKernel, doNormalize);
        }
        paintImage(sketch, processedImg);
        renderPixelTable('processed-pixels-table', processedImg.data);
    };

    normalizeSwitch.onchange = function () {
        doNormalize = !doNormalize;
        // Re-apply the current filter to update processedImg.data with new normalization setting
        let value = parseInt(filterSelector.value);
        if (value !== 0) { // Check if a filter is active (not 'none')
            processedImg.type = img.type;
            processedImg.w = img.w;
            processedImg.h = img.h;

            if (value >= 19) { // filters de magnitude > 18
                processedImg.data = operators[value](img);
            } else if (value === 24) { // High-Boost filter
                processedImg.data = highBoostFilter(img, ahb.value);
            } else { // Convolution filters
                activeKernel = kernel[value];
                processedImg.data = convolution(img, activeKernel, doNormalize);
            }
        } else {
            processedImg.data = img.data; // If no filter, processed is same as original
        }
        paintImage(sketch, processedImg);
        renderPixelTable('processed-pixels-table', processedImg.data);
    };

    downloadBtn.onclick = function () {
        let filename = "image.pgm";
        download(filename, processedImg);
    };

    ahb.onchange = function () {
        let value = parseInt(filterSelector.value);
        if(value == 24) {
            processedImg.type = img.type; processedImg.w = img.w; processedImg.h = img.h; // Ensure properties are set
            processedImg.data = highBoostFilter(img, ahb.value);
            paintImage(sketch, processedImg);
        }
    }
};

// ===============================
// Função de filtro da mediana
// ===============================
function medianFilter(img) {
    let arr = [];
    let res = [];
    let h = img.h;
    let w = img.w;
    let data = img.data;

    for (let i = 0; i < h; i++) {
        res[i] = [];

        for (let j = 0; j < w; j++) {
            arr[0] = i === 0 || j === 0 ? 0 : data[i - 1][j - 1];
            arr[1] = i === 0 ? 0 : data[i - 1][j];
            arr[2] = i === 0 || j === w - 1 ? 0 : data[i - 1][j + 1];

            arr[3] = j === 0 ? 0 : data[i][j - 1];
            arr[4] = data[i][j];
            arr[5] = j === w - 1 ? 0 : data[i][j + 1];

            arr[6] = i === h - 1 || j === 0 ? 0 : data[i + 1][j - 1];
            arr[7] = i === h - 1 ? 0 : data[i + 1][j];
            arr[8] = i === h - 1 || j === w - 1 ? 0 : data[i + 1][j + 1];

            insertionSort(arr, 9);
            res[i][j] = arr[4]
        }
    }

    return doNormalize ? normalize(res, w, h) : res;
}

// ===============================
// Função de filtro High-Boost
// ===============================
function highBoostFilter(img, A) {
    A = parseFloat(A);
    if (isNaN(A)) A = 1.5;

    // Etapa 1: Obter a versão suavizada (passa-baixa) da imagem.
    const blurred = convolution(img, gaussianBlur, false); // ou 'average'
    const h = img.h;
    const w = img.w;
    const result = [];

    for (let i = 0; i < h; i++) {
        result[i] = [];
        for (let j = 0; j < w; j++) {
            const original = img.data[i][j];
            const smooth = blurred[i][j];

            // Etapa 2: Calcular a máscara de nitidez (unsharp mask ou g_mascara).
            // Passa alta = original – passa baixa
            const g_mascara = original - smooth;

            // Etapa 3: Aplicar o filtro High-Boost.
            // A fórmula é: High-boost = original + A * g_mascara
            // Onde 'A' é o fator de realce (boost factor). Se A = 1, o filtro é o unsharp masking padrão.
            let boosted = original + (A * g_mascara);

            // Garante que o valor do pixel permaneça no intervalo válido [0, 255].
            boosted = Math.min(255, Math.max(0, boosted));
            result[i][j] = boosted;
        }
    }

    return doNormalize ? normalize(result, w, h) : result;
}

// ===============================
// Função para renderizar tabela de pixels (descomentada e ativada)
// ===============================
function renderPixelTable(containerId, imageMatrix) {
    let html = '<table class="table table-sm table-bordered" style="font-size:10px"><tbody>';
    for (let row of imageMatrix) {
        html += '<tr>';
        for (let val of row) {
            html += `<td style="text-align:center">${val}</td>`; // Added text-align for better readability
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    document.getElementById(containerId).innerHTML = html;
}

// ===============================
// Inicialização dos canvases p5.js
// ===============================
new p5(mainCanvas, 'p5sketch');
new p5(processedCanvas, 'p5sketch');