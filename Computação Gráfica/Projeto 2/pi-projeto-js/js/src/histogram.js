/*
Esse trecho de código faz parte de um programa que permite carregar imagens, exibir os histogramas da imagem 
original e processada, equalizar o histograma da imagem e fazer o download da imagem processada.
*/

const imagesPath = {
    0: '../assets/lena.pgm',
    1: '../assets/cameraman.pgm',
    2: '../assets/airplane.pgm',
    3: '../assets/barbara.pgm',
    4: '../assets/sea.pgm',
    5: '../assets/lenalow.pgm',
    6: '../assets/lenahigh.pgm',
};

const imgSelector = document.getElementById('img-selector');
const showOriginalHist = document.getElementById('show-original-hist');
const showProcessedHist = document.getElementById('show-processed-hist');

const downloadBtn = document.getElementById('download-btn');

const equalizeBtn = document.getElementById('equalize-btn');

let img = new Image();
let processedImg = new Image();

const mainCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("original-img");
        readImage('../assets/lena.pgm', sketch, img);
    }

    imgSelector.onchange = _ => readImage(imagesPath[imgSelector.value], sketch, img);

    showOriginalHist.onclick = _ => img.width !== 0 ? originalHist.setup() : null;
}


let processedCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("processed-img");
    };

    showProcessedHist.onclick = _ => img.width !== 0 ? processedHist.setup() : null;

    equalizeBtn.onclick = function () {
        processedImg.type = img.type;
        processedImg.w = img.w;
        processedImg.h = img.h;
        processedImg.data = equalizeImage(img);
        paintImage(sketch, processedImg);
    }
};


const originalHistCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(400, 200).parent("original-hist");
        if (img.w !== 0) drawHist(sketch, img, 350, 180, true);
    }
}

const processedHistCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(400, 200).parent("processed-hist");
        if (processedImg.w !== 0) drawHist(sketch, processedImg, 350, 180, true);
    }

    downloadBtn.onclick = function () {
        let filename = "image.pgm";
        download(filename, processedImg);
    }

}

new p5(mainCanvas, 'p5sketch');
new p5(processedCanvas, 'p5sketch');
const originalHist = new p5(originalHistCanvas, 'p5sketch');
const processedHist = new p5(processedHistCanvas, 'p5sketch');


function equalizeImage(img) {
    let hist = instantiateHistogram(img);
    let histProb = getHistProb(hist, img.h * img.w);
    let acc = getAccumulatedProba(histProb);
    let scale = getScaleArr(acc);

    let res = [];
    for (let i = 0; i < img.h; i++) {
        res [i] = [];
        for (let j = 0; j < img.w; j++) {
            res[i][j] = scale[img.data[i][j]];
        }
    }

    return res;
}


function instantiateHistogram(img) {
    let hist = new Array(256).fill(0);

    for (let i = 0; i < img.h; i++) {
        for (let j = 0; j < img.w; j++) {
            hist[img.data[i][j]]++;
        }
    }
    return hist;
}


function getHistProb(hist, n) {
    let h = [];
    for (let i = 0; i < 256; i++) {
        h[i] = hist[i] / n;
    }
    return h
}


function getAccumulatedProba(hist) {
    let acc = [];
    let sum = 0;
    for (let i = 0; i < 256; i++) {
        sum += hist[i]
        acc[i] = sum;
    }

    return acc;
}


function getScaleArr(arr) {
    let res = [];

    for (let i = 1; i < 256; i++) {
        res[i] = Math.ceil(arr[i] * 255);
    }

    return res;
}


function drawHist(sketch, img, width, height, showCDF = false) {
    let hist = instantiateHistogram(img);
    let sum = 0;
    let cumulative = hist.map(x => sum += x);

    let min = sketch.min(hist);
    let max = sketch.max(hist);

    sketch.loadPixels();
    sketch.push();

    let range = 256;
    let vPadding = 20;
    let paddingLeft = width * 0.2;


    let graphHeight = height - 2 * vPadding;

    let y1 = height - vPadding;
    let y2;

    // draw lines
    sketch.translate(paddingLeft, vPadding);
    sketch.stroke(0);

    sketch.textSize(8);
    sketch.textFont('Helvetica');

    sketch.line(-2, y1 + 2, range, y1 + 2); // x axis
    sketch.line(-2, y1 + 2, -2, vPadding); // y axis

    sketch.line(0, y1 + 2, 0, y1 + 4); // start x
    sketch.text('0', 2, y1 + 10);

    sketch.text('< Nivel de cinza >', range / 2 - 30, y1 + 10);

    sketch.line(range, y1 + 2, range, y1 + 4); // end x
    sketch.text('255', range + 2, y1 + 10);

    sketch.text('1 - FDA', range + 2, vPadding);

    sketch.line(-4, y1, -2, y1); // start y
    sketch.text(`${min}`, -20, y1);

    sketch.line(-4, vPadding, -2, vPadding); // end y
    sketch.text(`${max}`, -20, vPadding);

    sketch.rotate(sketch.radians(90));
    sketch.text('< Intensidade >', graphHeight / 2 - 10, 20)
    sketch.rotate(sketch.radians(-90));


    sketch.stroke(50);
    for (let i = 0; i < range; i++) {
        y2 = sketch.int(sketch.map(hist[i], min, max, 0, graphHeight));
        if (y2 !== 0) sketch.line(i, y1, i, y1 - y2);
    }

    if (showCDF) {
        sketch.stroke(0);
        sketch.strokeWeight(2);
        let min = sketch.min(cumulative);
        let max = sketch.max(cumulative);

        sketch.beginShape();
        sketch.noFill();

        for (let i = 0; i < range; i++) {
            let y2 = sketch.int(sketch.map(cumulative[i], min, max, 0, graphHeight));
            sketch.curveVertex(i, y1 - y2);
        }
        sketch.endShape();
    }

    sketch.pop();
}