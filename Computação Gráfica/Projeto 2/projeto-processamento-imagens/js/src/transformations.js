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

// ===============================
// Variáveis globais para parâmetros das transformações
// ===============================
let gammaValue = 1;           // Valor do parâmetro gamma para a transformação gama
let logScalarValue = 1;       // Valor escalar para a transformação logarítmica
let aValue = 1;               // Coeficiente 'a' para a transformação linear
let bValue = 1;               // Coeficiente 'b' para a transformação linear
let targetValue = 255;        // Valor alvo para a transformação de alcance dinâmico
let greyCenterValue = 127;    // Centro cinza para a transformação sigmoide
let sigmaValue = 25;          // Sigma para a transformação sigmoide

let maxValue = 255;           // Valor máximo do pixel (depende da imagem)
let minValue = 0;             // Valor mínimo do pixel (depende da imagem)

// ===============================
// Funções de transformação de pixels
// ===============================
// a) Negativo: S = 255 - r
const negative = (r) => 255 - r;

// b) Transformação Gamma: S = c * r^γ, c = 1, 0 ≤ γ ≤ 1
// A fórmula foi ajustada para que valores maiores de 'gammaValue' clareiem a imagem, como solicitado.
const gamma = (r) => {
    if (gammaValue <= 0) return r; // Evita erros matemáticos com gamma <= 0.
    return Math.round(Math.pow(r / 255, 1 / gammaValue) * 255);
};

// c) Transformação Logarítmica: S = a * log(r + 1)
// A fórmula foi corrigida para escalar o resultado para a faixa de 0-255, evitando uma imagem quase preta.
const logarithmic = (r) => {
    // A constante 'c' normaliza o resultado para a faixa de 0-255.
    const c = 255 / Math.log(1 + 255);
    const val = Math.round(logScalarValue * c * Math.log(r + 1));
    return Math.max(0, Math.min(255, val)); // Garante que o valor permaneça em [0, 255].
};

// d) Função de transferência de intensidade geral (sigmoide): 
// S = 255 / (1 + exp(-(r - w) / σ)), w = centro, σ = largura
// Corrigido para evitar divisão por zero quando sigma é 0, o que fazia a imagem "sumir".
const sigmoid = (r) => {
    // Evita divisão por zero, tratando como uma função degrau (contraste máximo).
    if (sigmaValue === 0) return r < greyCenterValue ? 0 : 255;
    return Math.round(255 / (1 + Math.exp(-(r - greyCenterValue) / sigmaValue)));
};

// e) Função de transferência faixa dinâmica: S = (r / 255) * targetValue
const dynamicRange = (r) => Math.round((r / 255) * targetValue);

// f) Função de transferência linear: S = a * r + b
// O resultado agora é limitado a [0, 255] para evitar que a imagem fique toda preta ou branca.
const linear = (r) => {
    const val = Math.round(aValue * r + bValue);
    return Math.max(0, Math.min(255, val)); // Garante que o valor permaneça em [0, 255].
};

// ===============================
// Controle de operadores e kernels
// ===============================
let currentOperator = null; // Operador de transformação atualmente selecionado

// Mapeamento dos operadores disponíveis
const operators = {
    1: negative,
    2: gamma,
    3: logarithmic,
    4: linear,
    5: dynamicRange,
    6: sigmoid,
};

// Caminhos das imagens disponíveis para seleção
const imagesPath = {
    0: '../assets/lena.pgm',
    2: '../assets/airplane.pgm',
};

let kernelList = []; // Lista de kernels (não utilizada neste trecho)

// ===============================
// Elementos da interface do usuário (DOM)
// ===============================
const applyAgainBtn = document.getElementById('apply-again-btn'); // Botão para aplicar novamente
const downloadBtn = document.getElementById('download-btn');      // Botão para download da imagem

const filterSelector = document.getElementById('input-filter');   // Seletor de filtro/transformação
const inputMatrix = document.getElementById('input-matrix');      // Formulário de entrada dos parâmetros
const inputMatrixValues = document.getElementsByName('array[]');  // Inputs dos parâmetros individuais
const imgSelector = document.getElementById('img-selector');      // Seletor de imagem

const normalizeSwitch = document.getElementById('normalizeSwitch'); // Switch para normalização

const gammaInput = document.getElementById('gamma');
const logInput = document.getElementById('log');
const intensidadeInput1 = document.getElementById('intg1');
const intensidadeInput2 = document.getElementById('intg2');
const dynamicInput = document.getElementById('dyn');
const linearInput1 = document.getElementById('lin1'); 
const linearInput2 = document.getElementById('lin2'); 

let doNormalize = false; // Flag para indicar se deve normalizar a imagem

// ===============================
// Objetos para armazenar a imagem original e processada
// ===============================
let img = new Image();
let processedImg = new Image();

// ===============================
// Canvas principal (imagem original)
// ===============================
/*
 * Função principal do canvas da imagem original.
 * Utiliza p5.js para desenhar a imagem original na tela.
 */
const mainCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("original-img"); // Cria o canvas e adiciona ao elemento HTML
        readImage('../assets/lena.pgm', sketch, img);         // Lê a imagem padrão (Lena)
    }

    // Callback para mudança de imagem selecionada
    imgSelector.onchange = _ => readImage(imagesPath[imgSelector.value], sketch, img);

    // Callback para aplicar novamente a transformação na imagem processada
    applyAgainBtn.onclick = function () {
        img.data = processedImg.data;     // Atualiza os dados da imagem original com a processada
        paintImage(sketch, img);          // Redesenha a imagem original
    }
}

// ===============================
// Canvas processado (imagem transformada)
// ===============================
/*
 * Função principal do canvas da imagem processada.
 * Utiliza p5.js para desenhar a imagem após a transformação.
 */
let processedCanvas = function (sketch) {
    sketch.setup = function () {
        sketch.createCanvas(256, 256).parent("processed-img"); // Cria o canvas para imagem processada
    };

    // Callback para mudança de filtro/transformação selecionada
    filterSelector.onchange = function () {
        let value = filterSelector.value;

        processedImg.type = img.type; // Copia o tipo da imagem
        processedImg.w = img.w;       // Copia a largura
        processedImg.h = img.h;       // Copia a altura

        if (value === '0') {
            currentOperator = null;           // Nenhuma transformação
            processedImg.data = img.data;     // Copia os dados originais
        } else {
            currentOperator = operators[value];           // Seleciona o operador
            processedImg.data = transform(img, currentOperator); // Aplica a transformação
        }
        paintImage(sketch, processedImg); // Desenha a imagem processada

        // Habilita/desabilita campos de acordo com o filtro selecionado
        if(value == 2) {
            gammaInput.disabled = false;
        } else {
            gammaInput.disabled = true;
        }
        
        if(value == 3) {
            logInput.disabled = false;
        } else {
            logInput.disabled = true;
        }

        if(value == 6) {
            intensidadeInput1.disabled = false;
            intensidadeInput2.disabled = false;
        } else {
            intensidadeInput1.disabled = true;
            intensidadeInput2.disabled = true;
        }

        if(value == 5) {
            dynamicInput.disabled = false;
        } else {
            dynamicInput.disabled = true;
        }

        if(value == 4) {
            linearInput1.disabled = false;
            linearInput2.disabled = false;
        } else {
            linearInput1.disabled = true;
            linearInput2.disabled = true;
        }
    }

    // Callback para mudança nos parâmetros das transformações
    inputMatrix.onchange = function () {
        // Corrige a leitura dos valores para corresponder à ordem dos inputs no HTML.
        // A ordem no HTML é: Gamma, Log, Intensidade(w,σ), Faixa Dinâmica, Linear(a,b)
        gammaValue = parseFloat(inputMatrixValues[0].value);
        logScalarValue = parseFloat(inputMatrixValues[1].value);
        greyCenterValue = parseFloat(inputMatrixValues[2].value);
        sigmaValue = parseFloat(inputMatrixValues[3].value);
        targetValue = parseFloat(inputMatrixValues[4].value);
        aValue = parseFloat(inputMatrixValues[5].value);
        bValue = parseFloat(inputMatrixValues[6].value);

        if (currentOperator != null) {
            processedImg.data = transform(img, currentOperator); // Aplica a transformação com novos parâmetros
            paintImage(sketch, processedImg)
        }
    }

    // Callback para alternar a normalização
    normalizeSwitch.onchange = function () {
        doNormalize = !doNormalize;
    }

    // Callback para download da imagem processada
    downloadBtn.onclick = function () {
        if (processedImg.w !== 0) {
            let filename = "image.pgm";
            download(filename, processedImg);
        }
    }
};

// ===============================
// Função para aplicar a transformação em cada pixel da imagem
// ===============================
/*
 * Função responsável por aplicar a transformação em cada pixel da imagem.
 * Se doNormalize for verdadeiro, normaliza o resultado.
 * @param img - objeto da imagem original
 * @param operation - função de transformação a ser aplicada
 * @returns matriz de pixels transformados (e normalizados, se aplicável)
 */
function transform(img, operation) {
    let res = [];
    [minValue, maxValue] = getRange(img); // Atualiza os valores mínimo e máximo da imagem
    for (let i = 0; i < img.h; i++) {
        res[i] = [];
        for (let j = 0; j < img.w; j++) {
            res[i][j] = operation(img.data[i][j]); // Aplica a operação ao pixel
        }
    }
    return doNormalize ? normalize(res, img.w, img.h) : res; // Normaliza se necessário
}

// ===============================
// Inicialização dos dois canvases usando p5.js
// ===============================
new p5(mainCanvas, 'p5sketch');
new p5(processedCanvas, 'p5sketch');