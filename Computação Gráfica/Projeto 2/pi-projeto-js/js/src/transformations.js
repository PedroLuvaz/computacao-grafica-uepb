/*
As funções transform e normalize são responsáveis por aplicar a transformação selecionada em cada pixel da 
imagem. A função transform itera sobre a matriz de pixels da imagem img e aplica a função de transformação 
operation em cada pixel, armazenando o resultado na matriz res. Se a variável doNormalize for verdadeira, a 
função normalize será chamada para normalizar a matriz de pixels resultante.

No restante do código, há a definição de callbacks para os elementos da interface do usuário, como os botões, 
seletores e caixas de entrada. Essas callbacks são responsáveis por atualizar as variáveis e executar as 
operações de transformação de imagem de acordo com as seleções e entradas do usuário. Também são criadas 
instâncias do p5.js para lidar com o desenho da imagem original e processada na tela.
*/
let gammaValue = 1;
let logScalarValue = 1;
let aValue = 1;
let bValue = 1;
let targetValue = 255;
let greyCenterValue = 127;
let sigmaValue = 25;

let maxValue = 255;
let minValue = 0;

const negative = (r) => maxValue - r;
const gamma = (r) => Math.round((((1 + r) / maxValue) ** gammaValue) * maxValue);
const logarithmic = (r) => Math.round((logScalarValue * Math.log(1 + (r / maxValue))) * maxValue);
const linear = (r) => Math.round(aValue * r + bValue);
const dynamicRange = (r) => Math.round((r / maxValue) * targetValue);
const sigmoid = (r) => Math.round(maxValue * (1 / (1 + Math.exp(-(r - greyCenterValue) / sigmaValue))));

let currentOperator = null;

const operators = {
    1: negative,
    2: gamma,
    3: logarithmic,
    4: linear,
    5: dynamicRange,
    6: sigmoid,
};

const imagesPath = {
    0: '../assets/lena.pgm',
    1: '../assets/cameraman.pgm',
    2: '../assets/airplane.pgm',
    3: '../assets/pepper.pgm',
    4: '../assets/brain.pgm',
    5: '../assets/barbara.pgm',
    6: '../assets/tyre.pgm',
    7: '../assets/einstein.pgm',
    8: '../assets/sea.pgm',
};

let kernelList = [];

const applyAgainBtn = document.getElementById('apply-again-btn');
const downloadBtn = document.getElementById('download-btn');

const filterSelector = document.getElementById('input-filter');
const inputMatrix = document.getElementById('input-matrix');
const inputMatrixValues = document.getElementsByName('array[]');
const imgSelector = document.getElementById('img-selector');

const normalizeSwitch = document.getElementById('normalizeSwitch');

let doNormalize = false;

let img = new Image();
let processedImg = new Image();

const mainCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("original-img");
        readImage('../assets/lena.pgm', sketch, img);
    }

    imgSelector.onchange = _ => readImage(imagesPath[imgSelector.value], sketch, img);

    applyAgainBtn.onclick = function () {
        img.data = processedImg.data;
        paintImage(sketch, img);
    }
}


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
            processedImg.data = transform(img, currentOperator);
        }
        paintImage(sketch, processedImg);
    }

    inputMatrix.onchange = function () {
        gammaValue = parseFloat(inputMatrixValues[0].value);
        logScalarValue = parseFloat(inputMatrixValues[1].value);
        aValue = parseFloat(inputMatrixValues[2].value);
        bValue = parseFloat(inputMatrixValues[3].value);
        targetValue = parseFloat(inputMatrixValues[4].value);
        greyCenterValue = parseFloat(inputMatrixValues[5].value);
        sigmaValue = parseFloat(inputMatrixValues[6].value);

        if (currentOperator != null) {
            processedImg.data = transform(img, currentOperator);
            paintImage(sketch, processedImg)
        }
    }

    normalizeSwitch.onchange = function () {
        doNormalize = !doNormalize;
    }

    downloadBtn.onclick = function () {
        if (processedImg.w !== 0) {
            let filename = "image.pgm";
            download(filename, processedImg);
        }
    }
};


function transform(img, operation) {
    let res = [];
    [minValue, maxValue] = getRange(img);
    for (let i = 0; i < img.h; i++) {
        res[i] = [];
        for (let j = 0; j < img.w; j++) {
            res[i][j] = operation(img.data[i][j]);
        }
    }
    return doNormalize ? normalize(res, img.w, img.h) : res;
}


new p5(mainCanvas, 'p5sketch');
new p5(processedCanvas, 'p5sketch');
