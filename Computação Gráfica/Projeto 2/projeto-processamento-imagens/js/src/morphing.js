// ===============================
// Caminhos das imagens de exemplo (PGM)
// ===============================
const imagesPath = {
  0: 'assets/kid.pgm',
  1: 'assets/adult.pgm',
  2: 'assets/pedrokid.pgm',
  3: 'assets/pedroadult.pgm',
  4: 'assets/kidnathan.pgm',
  5: 'assets/nathanadult.pgm',
};

// ===============================
// Seletores de elementos da interface (DOM)
// ===============================
const imgASelector = document.getElementById('img-a-selector');
const imgBSelector = document.getElementById('img-b-selector');

// ===============================
// Variáveis globais de controle de estado
// ===============================
let pgmKid = null;
let pgmCurrent = null;
let processedSketch = null;

// ===============================
// Função para parsear PGM P2 (ASCII)
// ===============================
function parsePGMP2(text) {
  // Remove comentários e linhas em branco
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.startsWith('#'));
  
  if (lines[0] !== 'P2') throw new Error('Formato PGM inválido, deve começar com P2');

  const [width, height] = lines[1].split(/\s+/).map(Number);
  const maxVal = parseInt(lines[2]);

  // A partir da linha 3 tem os pixels, separados por espaços ou quebras de linha
  const pixelStrings = lines.slice(3).join(' ').split(/\s+/);
  const pixels = pixelStrings.map(Number);

  if (pixels.length !== width * height) throw new Error('Número de pixels diferente da largura*altura');

  return { width, height, maxVal, pixels };
}

// ===============================
// Função para desenhar PGM em canvas p5
// ===============================
function drawPGMOnCanvas(pgm, sketch) {
  const img = sketch.createImage(pgm.width, pgm.height);
  img.loadPixels();

  for (let i = 0; i < pgm.pixels.length; i++) {
    const val = Math.round((pgm.pixels[i] / pgm.maxVal) * 255);
    img.pixels[i * 4 + 0] = val;
    img.pixels[i * 4 + 1] = val;
    img.pixels[i * 4 + 2] = val;
    img.pixels[i * 4 + 3] = 255;
  }

  img.updatePixels();
  sketch.image(img, 0, 0);
}

// ===============================
// Função para ler PGM de uma URL e carregar no p5
// ===============================
function readImage(path, sketch, setPgmCallback) {
  fetch(path)
    .then(res => res.text())
    .then(text => {
      try {
        const pgm = parsePGMP2(text);
        setPgmCallback(pgm);
        drawPGMOnCanvas(pgm, sketch);
      } catch (e) {
        alert('Erro ao carregar imagem PGM: ' + e.message);
      }
    })
    .catch(err => alert('Erro ao buscar arquivo: ' + err.message));
}

// ===============================
// Função de morphing entre dois PGM
// ===============================
function morphPGM(pgmA, pgmB, t) {
  if (!pgmA || !pgmB) return null;
  if (pgmA.width !== pgmB.width || pgmA.height !== pgmB.height) {
    alert('As imagens devem ter o mesmo tamanho!');
    return null;
  }
  const pixels = [];
  for (let i = 0; i < pgmA.pixels.length; i++) {
    const val = Math.round((1 - t) * pgmA.pixels[i] + t * pgmB.pixels[i]);
    pixels.push(val);
  }
  return {
    width: pgmA.width,
    height: pgmA.height,
    maxVal: Math.max(pgmA.maxVal, pgmB.maxVal),
    pixels
  };
}

// ===============================
// Canvas principal (Imagem Criança)
// ===============================
const mainCanvas = function (sketch) {
  sketch.setup = function () {
    sketch.createCanvas(256, 256).parent("img-a");
    readImage(imagesPath[0], sketch, pgm => { pgmKid = pgm; });
  }

  imgASelector.onchange = () => {
    const idx = imgASelector.value;
    readImage(imagesPath[idx], sketch, pgm => { pgmKid = pgm; });
  }
}

// ===============================
// Canvas secundário (Imagem Adulto)
// ===============================
const secondaryCanvas = function (sketch) {
  sketch.setup = function () {
    sketch.createCanvas(256, 256).parent("img-b");
    readImage(imagesPath[1], sketch, pgm => { pgmCurrent = pgm; });
  }

  imgBSelector.onchange = () => {
    const idx = imgBSelector.value;
    readImage(imagesPath[idx], sketch, pgm => { pgmCurrent = pgm; });
  }
}

// ===============================
// Canvas processado (Morfismo Temporal)
// ===============================
const processedCanvas = function (sketch) {
  processedSketch = sketch;
  sketch.setup = function () {
    sketch.createCanvas(256, 256).parent("processed-img");
    sketch.background(220);
  }
}

// ===============================
// Inicialização dos três canvases p5.js
// ===============================
new p5(mainCanvas, 'img-a');
new p5(secondaryCanvas, 'img-b');
new p5(processedCanvas, 'processed-img');

// ===============================
// Botão para iniciar morfismo temporal animado
// ===============================
document.getElementById('start-morphing-btn').addEventListener('click', function () {
  if (!pgmKid || !pgmCurrent) {
    alert('Carregue as duas imagens PGM válidas!');
    return;
  }
  if (pgmKid.width !== pgmCurrent.width || pgmKid.height !== pgmCurrent.height) {
    alert('As imagens devem ter o mesmo tamanho!');
    return;
  }

  let t = 0;
  const steps = 60; // frames
  const interval = setInterval(() => {
    if (t > 1) {
      clearInterval(interval);
      return;
    }
    const morphed = morphPGM(pgmKid, pgmCurrent, t);
    if (!morphed) return;

    const sketch = processedSketch;
    const img = sketch.createImage(morphed.width, morphed.height);
    img.loadPixels();

    for (let i = 0; i < morphed.pixels.length; i++) {
      const val = Math.round((morphed.pixels[i] / morphed.maxVal) * 255);
      img.pixels[i * 4 + 0] = val;
      img.pixels[i * 4 + 1] = val;
      img.pixels[i * 4 + 2] = val;
      img.pixels[i * 4 + 3] = 255;
    }

    img.updatePixels();
    sketch.background(220);
    sketch.image(img, 0, 0);

    t += 1 / steps;
  }, 80);
});