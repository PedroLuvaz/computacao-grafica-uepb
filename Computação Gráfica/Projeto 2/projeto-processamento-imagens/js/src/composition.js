
/*
Em resumo, esse trecho de código define funções e comportamentos para manipulação de imagens usando a 
biblioteca P5.js. Ele cria três canvases: um para exibir a imagem "lena.pgm", outro para exibir a imagem 
"airplane.pgm" e um terceiro para exibir a imagem processada. Os usuários podem selecionar filtros, 
ativar/desativar a normalização e fazer o download da imagem processada.
*/
const add = (a, b) => a + b;
const sub = (a, b) => a - b;
const mul = (a, b) => a * b;
const divide = (a, b) => b === 0 ? 0 : a / b;

const or = (a, b) => a | b;
const and = (a, b) => a & b;
const xor = (a, b) => a ^ b;

const operators = {
    1: add,
    2: sub,
    3: mul,
    4: divide,
    5: or,
    6: and,
    7: xor,
};

let selectedOperator = null;

const imagesPath = {
    0: '../assets/lena.pgm',
    1: '../assets/airplane.pgm',
    2: '../assets/pedrokid.pgm',
    3: '../assets/kidnathan.pgm'
};

const filterSelector = document.getElementById('input-filter');
const imgASelector = document.getElementById('img-a-selector');
const imgBSelector = document.getElementById('img-b-selector');

const normalizeSwitch = document.getElementById('normalizeSwitch');
const downloadBtn = document.getElementById('download-btn');

let doNormalize = true;

let imgA = new Image();
let imgB = new Image();
let processedImg = new Image();

const mainCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("img-a");
        readImage('../assets/lena.pgm', sketch, imgA);
    }

    imgASelector.onchange = _ => readImage(imagesPath[imgASelector.value], sketch, imgA);
}


const secondaryCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("img-b");
        readImage('../assets/airplane.pgm', sketch, imgB);
    }

    imgBSelector.onchange = _ => readImage(imagesPath[imgBSelector.value], sketch, imgB);
}


const processedCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("processed-img");
    };

    filterSelector.onchange = function () {
        let val = filterSelector.value;

        if (val !== '0') {
            processedImg.type = imgA.type;
            processedImg.w = imgA.w;
            processedImg.h = imgA.h;
            processedImg.data = composition(imgA.data, imgB.data, imgA.w, imgA.h, operators[val], doNormalize);

            paintImage(sketch, processedImg);
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


new p5(mainCanvas, 'p5sketch');
new p5(secondaryCanvas, 'p5sketch');
new p5(processedCanvas, 'p5sketch');
