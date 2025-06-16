const erosion = (img, w, h, k) => operation(img, w, h, k, 'erosion');
const dilation = (img, w, h, k) => operation(img, w, h, k, 'dilation');
const opening = (img, w, h, k) => dilation(erosion(img, w, h, k), w, h, k);
const closing = (img, w, h, k) => erosion(dilation(img, w, h, k), w, h, k);

const complement = (img) => img.map((i) => i.map((j) => 1 - j));

const external = (img, w, h, k) => composition(dilation(img, w, h, k), img, w, h, sub);
const internal = (img, w, h, k) => composition(img, erosion(img, w, h, k), w, h, sub);
const gradient = (img, w, h, k) => composition(dilation(img, w, h, k), erosion(img, w, h, k), w, h, sub);

const thinning = (img, w, h, k) => composition(img, gradient(img, w, h, k), w, h, sub);

// grayscale images

const erosionGray = (img, w, h, k) => operationGray(img, w, h, k, 'erosion');
const dilationGray = (img, w, h, k) => operationGray(img, w, h, k, 'dilation');

const openingGray = (img, w, h, k) => dilationGray(erosionGray(img, w, h, k), w, h, k);
const closingGray = (img, w, h, k) => erosionGray(dilationGray(img, w, h, k), w, h, k);

const gradientGray = (img, w, h, k) => composition(dilationGray(img, w, h, k), erosionGray(img, w, h, k), w, h, sub);

const topHat = (img, w, h, k) => composition(img, openingGray(img, w, h, k), w, h, sub);
const bottomHat = (img, w, h, k) => composition(closingGray(img, w, h, k), img, w, h, sub);

const sub = (a, b) => a - b;

let currentOperator = null;

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

let kernelList = [0, 1, 0, 1, 1, 1, 0, 1, 0];

const downloadBtn = document.getElementById('download-btn');
const applyAgainBtn = document.getElementById('apply-again-btn');

const filterSelector = document.getElementById('input-filter');

const inputMatrix = document.getElementById('input-matrix');
const inputMatrixValues = document.getElementsByName('array[]');

const imgSelector = document.getElementById('img-selector');

let img = new Image();
let processedImg = new Image();

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


new p5(mainCanvas, 'p5sketch');
new p5(processedCanvas, 'p5sketch');

/*
operation: Essa função realiza a operação de erosão ou dilatação em uma imagem binária. Ela recebe uma matriz 
de pixels img, as dimensões da imagem w e h, e um kernel k que define a vizinhança dos pixels. Dependendo da 
operação especificada (operate = 'erosion' ou operate = 'dilation'), a função calcula a erosão ou a dilatação 
em cada pixel da imagem com base no kernel e retorna uma nova matriz de pixels resultante.
*/
function operation(img, w, h, k, operate = 'erosion') {
    let res = [];

    let target = operate === 'dilation' ? 1 : k.reduce((a, b) => a + b, 0);

    for (let i = 0; i < h; i++) {
        res [i] = []
        for (let j = 0; j < w; j++) {
            let acc = 0

            acc += k[0] & (i === 0 || j === 0 ? 0 : img[i - 1][j - 1]);
            acc += k[1] & (i === 0 ? 0 : img[i - 1][j]);
            acc += k[2] & (i === 0 || j === w - 1 ? 0 : img[i - 1][j + 1]);

            acc += k[3] & (j === 0 ? 0 : img[i][j - 1]);
            acc += k[4] & img[i][j];
            acc += k[5] & (j === w - 1 ? 0 : img[i][j + 1]);

            acc += k[6] & (i === h - 1 || j === 0 ? 0 : img[i + 1][j - 1]);
            acc += k[7] & (i === h - 1 ? 0 : img[i + 1][j]);
            acc += k[8] & (i === h - 1 || j === img.w - 1 ? 0 : img[i + 1][j + 1]);

            res[i][j] = acc >= target ? 1 : 0;
        }
    }

    return res;
}

/*
operationGray: Essa função realiza a operação de erosão ou dilatação em uma imagem em tons de cinza. Ela é 
semelhante à função operation, mas trabalha com valores de pixel em tons de cinza em vez de pixels binários. 
Ela recebe os mesmos parâmetros da função operation e retorna uma nova matriz de pixels resultante.
*/
function operationGray(img, w, h, k, value = 'dilation') {
    let arr = [];
    let res = [];

    for (let i = 0; i < h; i++) {
        res[i] = [];

        for (let j = 0; j < w; j++) {
            let acc = -1;

            if (k[0] !== 0) arr[++acc] = i === 0 || j === 0 ? 0 : img[i - 1][j - 1];
            if (k[1] !== 0) arr[++acc] = i === 0 ? 0 : img[i - 1][j];
            if (k[2] !== 0) arr[++acc] = i === 0 || j === w - 1 ? 0 : img[i - 1][j + 1];

            if (k[3] !== 0) arr[++acc] = j === 0 ? 0 : img[i][j - 1];
            if (k[4] !== 0) arr[++acc] = img[i][j];
            if (k[5] !== 0) arr[++acc] = j === w - 1 ? 0 : img[i][j + 1];

            if (k[6] !== 0) arr[++acc] = i === h - 1 || j === 0 ? 0 : img[i + 1][j - 1];
            if (k[7] !== 0) arr[++acc] = i === h - 1 ? 0 : img[i + 1][j];
            if (k[8] !== 0) arr[++acc] = i === h - 1 || j === w - 1 ? 0 : img[i + 1][j + 1];

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