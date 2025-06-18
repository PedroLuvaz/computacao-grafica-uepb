// Função para ler arquivo PGM (P2 ou P5)
// Interpreta a imagem como um vetor de dimensão (width * height)
function parsePGM(buffer) {
    // Detecta tipo do arquivo (P2: texto, P5: binário)
    const header = new TextDecoder().decode(buffer.slice(0, 15));
    const isP2 = header.startsWith('P2');
    const isP5 = header.startsWith('P5');
    if (!isP2 && !isP5) {
        alert('Formato PGM não suportado (apenas P2 e P5)');
        return null;
    }

    // Lê cabeçalho (magic, dimensões, maxVal)
    let text = new TextDecoder().decode(buffer);
    let lines = text.split('\n');
    let idx = 0;

    // Função auxiliar para pular comentários e linhas vazias
    function nextLine() {
        while (idx < lines.length) {
            let l = lines[idx].trim();
            idx++;
            if (l.length > 0 && l[0] !== '#') return l;
        }
        return null;
    }

    let magic = nextLine(); // P2 ou P5
    let dims = nextLine();
    while (dims.startsWith('#') || dims.trim() === '') dims = nextLine();
    let [width, height] = dims.split(/\s+/).map(Number);
    let maxValLine = nextLine();
    while (maxValLine.startsWith('#') || maxValLine.trim() === '') maxValLine = nextLine();
    let maxVal = parseInt(maxValLine);

    // Para P5, encontra o offset do início dos dados binários
    if (isP5) {
        let headerText = '';
        let count = 0;
        idx = 0;
        while (count < 3) {
            let l = lines[idx].trim();
            if (l.length > 0 && l[0] !== '#') count++;
            headerText += lines[idx] + '\n';
            idx++;
        }
        let offset = headerText.length;
        let arr = new Uint8Array(buffer.slice(offset));
        let pixels = Array.from(arr.slice(0, width * height));
        return { width, height, maxVal, pixels };
    } else {
        // P2: lê pixels como texto
        let pixels = [];
        let pixelLines = lines.slice(idx);
        for (let line of pixelLines) {
            if (line.trim() === '' || line.trim()[0] === '#') continue;
            pixels = pixels.concat(line.trim().split(/\s+/).map(Number));
        }
        if (pixels.length !== width * height) {
            alert('Número de pixels não bate com largura x altura');
            return null;
        }
        return { width, height, maxVal, pixels };
    }
}

// Exibe imagem PGM em um canvas
function showPGM(containerId, pgm) {
    if (!pgm) return;
    const canvas = document.createElement('canvas');
    canvas.width = pgm.width;
    canvas.height = pgm.height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(pgm.width, pgm.height);

    // Normaliza cada pixel para [0,255] e preenche RGBA
    for (let i = 0; i < pgm.pixels.length; i++) {
        const val = Math.round((pgm.pixels[i] / pgm.maxVal) * 255);
        imgData.data[i * 4 + 0] = val; // R
        imgData.data[i * 4 + 1] = val; // G
        imgData.data[i * 4 + 2] = val; // B
        imgData.data[i * 4 + 3] = 255; // A
    }
    ctx.putImageData(imgData, 0, 0);
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.appendChild(canvas);
}

// Morfismo linear entre duas imagens (interpolação convexa)
// Para cada pixel i: M_i(t) = (1-t)*A_i + t*B_i
function morphPGM(pgmA, pgmB, t) {
    if (!pgmA || !pgmB) return null;
    if (pgmA.width !== pgmB.width || pgmA.height !== pgmB.height) {
        alert('As imagens devem ter o mesmo tamanho!');
        return null;
    }
    const pixels = [];
    for (let i = 0; i < pgmA.pixels.length; i++) {
        // Interpolação linear entre os pixels correspondentes
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

// Variáveis globais para armazenar as imagens carregadas
let pgmKid = null;
let pgmCurrent = null;

// Carrega imagem "kid"
document.getElementById('kidImage').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    file.arrayBuffer().then(buffer => {
        const pgm = parsePGM(buffer);
        if (pgm) {
            pgmKid = pgm;
            showPGM('kid-img', pgmKid);
        } else {
            pgmKid = null;
            document.getElementById('kid-img').innerHTML = '';
        }
    });
});

// Carrega imagem "current"
document.getElementById('currentImage').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    file.arrayBuffer().then(buffer => {
        const pgm = parsePGM(buffer);
        if (pgm) {
            pgmCurrent = pgm;
            showPGM('current-img', pgmCurrent);
        } else {
            pgmCurrent = null;
            document.getElementById('current-img').innerHTML = '';
        }
    });
});

// Gera animação do morfismo linear (GIF)
document.getElementById('animate-morphing-btn').addEventListener('click', function () {
    if (!pgmKid || !pgmCurrent) {
        alert('Carregue as duas imagens PGM válidas!');
        return;
    }
    if (pgmKid.width !== pgmCurrent.width || pgmKid.height !== pgmCurrent.height) {
        alert('As imagens devem ter o mesmo tamanho!');
        return;
    }

    const gifContainer = document.getElementById('morphed-gif');
    gifContainer.innerHTML = '<div style="color:#333;font-weight:bold;">Gerando animação...</div>';

    // Inicializa objeto GIF
    const gif = new GIF({
        workers: 2,
        quality: 10,
        width: pgmKid.width,
        height: pgmKid.height,
        workerScript: 'js/src/gif.worker.js'
    });

    const frames = 90; // Mais frames = transição mais suave
    for (let i = 0; i <= frames; i++) {
        const t = i / frames; // t ∈ [0,1]
        // Calcula imagem intermediária: M(t) = (1-t)A + tB
        const morphed = morphPGM(pgmKid, pgmCurrent, t);
        if (!morphed) continue;
        const canvas = document.createElement('canvas');
        canvas.width = morphed.width;
        canvas.height = morphed.height;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(morphed.width, morphed.height);
        for (let j = 0; j < morphed.pixels.length; j++) {
            const val = Math.round((morphed.pixels[j] / morphed.maxVal) * 255);
            imgData.data[j * 4 + 0] = val;
            imgData.data[j * 4 + 1] = val;
            imgData.data[j * 4 + 2] = val;
            imgData.data[j * 4 + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
        gif.addFrame(canvas, { delay: 80, copy: true });
    }

    gif.on('finished', function(blob) {
        gifContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        gifContainer.appendChild(img);

        // Botão para baixar o GIF
        const downloadBtn = document.createElement('a');
        downloadBtn.href = img.src;
        downloadBtn.download = 'morfismo.gif';
        downloadBtn.className = 'btn btn-success mt-3';
        downloadBtn.textContent = 'Baixar GIF';
        gifContainer.appendChild(downloadBtn);
    });

    gif.render();
});