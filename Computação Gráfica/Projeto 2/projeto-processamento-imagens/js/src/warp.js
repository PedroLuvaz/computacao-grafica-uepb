/*
Nesse trecho de código, temos a definição de várias funções e a configuração de interações com elementos HTML 
para criar uma interface interativa para realizar um efeito de morphing entre duas imagens utilizando 
triangulação.
*/

// Imagens e dados globais
const startImg = new Image();
const endImg = new Image();
const generatedImages = [];

const pointsA = [];
let trianglesA = [];

const pointsB = [];
let trianglesB = [];

// Elementos DOM
const applyBtn = document.getElementById('apply-btn');
const triangulateA = document.getElementById('triangulate-a-btn');
const triangulateB = document.getElementById('triangulate-b-btn');
const slideControl = document.getElementById('range-control');

// Utilitários
function makeTriangles(indices, pts) {
    return Array.from({ length: indices.length / 3 }, (_, i) => {
        const idx = i * 3;
        return {
            a: { x: pts[indices[idx]][0], y: pts[indices[idx]][1] },
            b: { x: pts[indices[idx + 1]][0], y: pts[indices[idx + 1]][1] },
            c: { x: pts[indices[idx + 2]][0], y: pts[indices[idx + 2]][1] }
        };
    });
}

function drawTriangles(sketch, points, triangles) {
    for (let i = 0; i < triangles.length; i += 3) {
        sketch.beginShape();
        sketch.noFill();
        sketch.stroke(255, 0, 0);
        sketch.strokeWeight(1);
        sketch.vertex(points[triangles[i]][0], points[triangles[i]][1]);
        sketch.vertex(points[triangles[i + 1]][0], points[triangles[i + 1]][1]);
        sketch.vertex(points[triangles[i + 2]][0], points[triangles[i + 2]][1]);
        sketch.endShape(sketch.CLOSE);
    }
}

// Canvas inicial
const startCanvas = sketch => {
    sketch.setup = () => {
        sketch.createCanvas(400, 400).parent('start-img');
        readImage('assets/start.pgm', sketch, startImg);
    };

    document.getElementById("start-img").addEventListener("mousedown", () => {
        const x = Math.round(sketch.mouseX);
        const y = Math.round(sketch.mouseY);
        pointsA.push([x, y]);
        trianglesA = Delaunay.triangulate(pointsA);
        sketch.circle(x, y, 5);
        document.getElementById('start-pts').textContent = `Pts: ${pointsA.length}`;
    });

    triangulateA.onclick = () => drawTriangles(sketch, pointsA, trianglesA);
};

// Canvas final
const endCanvas = sketch => {
    sketch.setup = () => {
        sketch.createCanvas(300, 300).parent("end-img");
        readImage('assets/end.pgm', sketch, endImg);
    };

    document.getElementById("end-img").addEventListener("mousedown", () => {
        const x = Math.round(sketch.mouseX);
        const y = Math.round(sketch.mouseY);
        pointsB.push([x, y]);
        sketch.circle(x, y, 5);
        document.getElementById('end-pts').textContent = `Pts: ${pointsB.length}`;
    });

    triangulateB.onclick = () => {
        trianglesB = Delaunay.triangulate(pointsB);
        return drawTriangles(sketch, pointsB, trianglesB);
    };
};

// Canvas de resultado
const resultCanvas = sketch => {
    const resultsImg = [];
    const resultPoints = [];

    sketch.setup = () => {
        sketch.createCanvas(300, 300).parent("result-img");
    };

    slideControl.onchange = () => {
        if (resultsImg.length > 0) {
            paintImage(sketch, resultsImg[slideControl.value]);
            const t = Delaunay.triangulate(resultPoints[slideControl.value]);
            drawTriangles(sketch, resultPoints[slideControl.value], t);
        }
    };

    applyBtn.onclick = () => {
        for (let i = 0; i < 10; i++) {
            const img = new Image();
            img.type = startImg.type;
            img.w = startImg.w;
            img.h = startImg.h;
            img.data = [];

            const pts = [];
            const time = 1 / (10 - i);

            for (let j = 0; j < pointsA.length; j++) {
                const x = Math.round((1 - time) * pointsA[j][0] + time * pointsB[j][0]);
                const y = Math.round((1 - time) * pointsA[j][1] + time * pointsB[j][1]);
                pts.push([x, y]);
            }

            const t = Delaunay.triangulate(pts);
            const tt = makeTriangles(t, pts);

            for (let row = 0; row < startImg.h; row++) {
                img.data[row] = [];
                for (let col = 0; col < startImg.w; col++) {
                    for (let k = 0; k < tt.length; k++) {
                        img.data[row][col] = startImg.data[row][col] + (endImg.data[row][col] - startImg.data[row][col]) * time;
                    }
                }
            }

            resultsImg.push(img);
            resultPoints.push(pts);
        }
    };
};

// Inicialização dos sketches
new p5(startCanvas, 'p5sketch');
new p5(endCanvas, 'p5sketch');
new p5(resultCanvas, 'p5sketch');


