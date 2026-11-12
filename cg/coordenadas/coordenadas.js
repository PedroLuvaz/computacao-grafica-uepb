// ===============================
// Seleção de elementos da interface (DOM)
// ===============================
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const liveCoords = document.getElementById("live-coords");
const clickedCoords = document.getElementById("clicked-coords");
let selectedPixel = null;

// ===============================
// Inicialização dos limites do sistema de coordenadas do mundo
// ===============================
let Xmax = 100.3;
let Xmin = 10.5;
let Ymax = 100.4;
let Ymin = 15.2;

// ===============================
// Atualização dos valores dos limites na interface
// ===============================
document.getElementById("xmin").textContent = Xmin;
document.getElementById("xmax").textContent = Xmax;
document.getElementById("ymin").textContent = Ymin;
document.getElementById("ymax").textContent = Ymax;

// ===============================
// Evento para atualizar limites do mundo via interface
// ===============================
document.getElementById("set-coordinates-btn").addEventListener("click", () => {
    const inputXmax = parseFloat(document.getElementById("input-xmax").value);
    const inputXmin = parseFloat(document.getElementById("input-xmin").value);
    const inputYmax = parseFloat(document.getElementById("input-ymax").value);
    const inputYmin = parseFloat(document.getElementById("input-ymin").value);

    if (!isNaN(inputXmax) && !isNaN(inputXmin) && !isNaN(inputYmax) && !isNaN(inputYmin)) {
        Xmax = inputXmax;
        Xmin = inputXmin;
        Ymax = inputYmax;
        Ymin = inputYmin;

        document.getElementById("xmin").textContent = Xmin;
        document.getElementById("xmax").textContent = Xmax;
        document.getElementById("ymin").textContent = Ymin;
        document.getElementById("ymax").textContent = Ymax;
    } else {
        alert("Por favor, insira valores válidos para as coordenadas.");
    }
});

// ===============================
// Função para desenhar um pixel no canvas
// ===============================
const pixelMarker = document.getElementById("pixel-marker");

function setPixel(x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(x, canvas.height - y, 1, 1); // Inverte Y na hora de desenhar

    // Destaca visualmente o pixel (1 px é difícil de enxergar)
    if (pixelMarker) {
        pixelMarker.style.left = `${x + 0.5}px`;
        pixelMarker.style.top = `${canvas.height - y + 0.5}px`;
        pixelMarker.classList.add("visible");
    }
}

// ===============================
// Evento para mostrar as coordenadas em tempo real ao mover o mouse
// ===============================
canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(canvas.height - (event.clientY - rect.top));

    // Calcula as conversões entre os sistemas de coordenadas
    const { ndcx, ndcy } = inpToNdc(x, y, canvas.width, canvas.height);
    const world = ndcToWd(ndcx, ndcy, Xmax, Xmin, Ymax, Ymin);
    const ndcCentral = wdToNdcCentral(world.worldX, world.worldY, Xmax, Xmin, Ymax, Ymin);
    const device = ndcCentralToDc(ndcCentral.ndccx, ndcCentral.ndccy, canvas.width, canvas.height);

    // Atualiza o painel de coordenadas ao vivo
    liveCoords.innerHTML = `
        <strong>Coordenadas de Mundo:</strong><br> (${world.worldX.toFixed(3)}, ${world.worldY.toFixed(3)})<br><br>
        <strong>Coordenadas NDC:</strong><br> (${ndcx.toFixed(3)}, ${ndcy.toFixed(3)})<br><br>
        <strong>Coordenadas NDC Centralizada:</strong><br> (${ndcCentral.ndccx.toFixed(3)}, ${ndcCentral.ndccy.toFixed(3)})<br><br>
        <strong>Coordenadas de Dispositivo:</strong><br> (${x}, ${y})
    `;
});

// ===============================
// Evento para mostrar e desenhar o pixel clicado
// ===============================
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - rect.left);
    const y = Math.round(canvas.height - (event.clientY - rect.top));
    selectedPixel = { x, y };
    setPixel(x, y);

    // Calcula as conversões entre os sistemas de coordenadas
    const { ndcx, ndcy } = inpToNdc(x, y, canvas.width, canvas.height);
    const world = ndcToWd(ndcx, ndcy, Xmax, Xmin, Ymax, Ymin);
    const ndcCentral = wdToNdcCentral(world.worldX, world.worldY, Xmax, Xmin, Ymax, Ymin);

    // Atualiza o painel de coordenadas do clique
    clickedCoords.innerHTML = 
    `   <strong>Coordenadas de Mundo:</strong><br> (${world.worldX.toFixed(3)}, ${world.worldY.toFixed(3)})<br><br>
        <strong>Coordenadas NDC:</strong><br> (${ndcx.toFixed(3)}, ${ndcy.toFixed(3)})<br><br>
        <strong>Coordenadas NDC Centralizada:</strong><br> (${ndcCentral.ndccx.toFixed(3)}, ${ndcCentral.ndccy.toFixed(3)})<br><br>
        <strong>Coordenadas de Dispositivo:</strong><br> (${x}, ${y})
    `;
});

// ===============================
// Evento para definir um ponto do mundo e desenhar no canvas
// ===============================
document.getElementById("set-world-btn").addEventListener("click", () => {
    const inputX = parseFloat(document.getElementById("input-x").value);
    const inputY = parseFloat(document.getElementById("input-y").value);

    if (isNaN(inputX) || isNaN(inputY)) {
        alert("Por favor, insira coordenadas válidas.");
        return;
    }

    if (inputX < Xmin || inputX > Xmax || inputY < Ymin || inputY > Ymax) {
        alert(`As coordenadas estão fora do intervalo permitido:\nX: [${Xmin}, ${Xmax}], Y: [${Ymin}, ${Ymax}]`);
        return;
    }

    // Calcula as conversões entre os sistemas de coordenadas
    const ndcx = (inputX - Xmin) / (Xmax - Xmin);
    const ndcy = (inputY - Ymin) / (Ymax - Ymin); 

    const pixelX = Math.round(ndcx * (canvas.width - 1)); 
    const pixelY = Math.round(ndcy * (canvas.height - 1));  

    const ndccx = 2 * ndcx - 1;
    const ndccy = 2 * ndcy - 1; 

    setPixel(pixelX, pixelY);

    // Atualiza o painel de coordenadas do clique
    clickedCoords.innerHTML = `
        <strong>Coordenadas de Mundo:</strong><br> (${inputX.toFixed(3)}, ${inputY.toFixed(3)})<br><br>
        <strong>Coordenadas NDC:</strong><br> (${ndcx.toFixed(3)}, ${ndcy.toFixed(3)})<br><br>
        <strong>Coordenadas NDC Centralizada:</strong><br> (${ndccx.toFixed(3)}, ${ndccy.toFixed(3)})<br><br>
        <strong>Coordenadas de Dispositivo:</strong><br> (${pixelX}, ${pixelY}) 
    `;
});

// ===============================
// Funções de cálculo e conversão de coordenadas
// ===============================

// Converte coordenadas de pixel para NDC (Normalized Device Coordinates)
function inpToNdc(x, y, width, height) {
    return { 
        ndcx: x / (width - 1),
        ndcy: y / (height - 1) 
    };
}

// Converte coordenadas NDC para coordenadas do mundo
function ndcToWd(ndcx, ndcy, Xmax, Xmin, Ymax, Ymin) {
    return {
        worldX: ndcx * (Xmax - Xmin) + Xmin,
        worldY: ndcy * (Ymax - Ymin) + Ymin
    };
}

// Converte coordenadas do mundo para NDC centralizada na origem
function wdToNdcCentral(x, y, Xmax, Xmin, Ymax, Ymin) {
    return {
        ndccx: 2 * ((x - Xmin) / (Xmax - Xmin)) - 1,
        ndccy: 2 * ((y - Ymin) / (Ymax - Ymin)) - 1
    };
}

// Converte NDC centralizada para coordenadas de dispositivo (pixel)
function ndcCentralToDc(ndcx, ndcy, width, height) {
    return {
        dcx: Math.round(ndcx * (width - 1)),
        dcy: Math.round((1 - ndcy) * (height - 1))  // Inverte a coordenada Y
    };
}