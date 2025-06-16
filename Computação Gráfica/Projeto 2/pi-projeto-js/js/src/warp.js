/*
Nesse trecho de código, temos a definição de várias funções e a configuração de interações com elementos HTML 
para criar uma interface interativa para realizar um efeito de morphing entre duas imagens utilizando 
triangulação.
*/

let startImg = new Image();
let endImg = new Image();
let generatedImages = [];

let pointsA = [];
let trianglesA = [];

let pointsB = [];
let trianglesB = [];

const applyBtn = document.getElementById('apply-btn');
const triangulateA = document.getElementById('triangulate-a-btn');
const triangulateB = document.getElementById('triangulate-b-btn');

const slideControl = document.getElementById('range-control');

const startCanvas = function (sketch) {
    let canvas = document.getElementById("start-img");

    sketch.setup = function () {
        sketch.createCanvas(400, 400).parent('start-img');
        readImage('../assets/start.pgm', sketch, startImg);
    }

    canvas.addEventListener("mousedown", function () {
        let x = Math.round(sketch.mouseX);
        let y = Math.round(sketch.mouseY);
        pointsA.push([x, y]);
        trianglesA = Delaunay.triangulate(pointsA);
        sketch.circle(x, y, 5);
        document.getElementById('start-pts').innerHTML = `Pts: ${pointsA.length}`;
    });

    triangulateA.onclick = function () {
        return drawTriangles(sketch, pointsA, trianglesA)
    }
}

const endCanvas = function (sketch) {
    let canvas = document.getElementById("end-img");

    sketch.setup = function () {
        sketch.createCanvas(300, 300).parent("end-img");
        readImage('../assets/end.pgm', sketch, endImg);
    }

    canvas.addEventListener("mousedown", function () {
        let x = Math.round(sketch.mouseX);
        let y = Math.round(sketch.mouseY);
        pointsB.push([x, y]);
        sketch.circle(x, y, 5);
        document.getElementById('end-pts').innerHTML = `Pts: ${pointsB.length}`;
    });

    triangulateB.onclick = function () {
        trianglesB = Delaunay.triangulate(pointsB);
        return drawTriangles(sketch, pointsB, trianglesB);
    }
}


const resultCanvas = function (sketch) {
    let resultsImg = [];
    let resultPoints = [];

    sketch.setup = function () {
        sketch.createCanvas(300, 300).parent("result-img");
    }

    slideControl.onchange = function () {
        if (resultsImg.length > 0) {
            paintImage(sketch, resultsImg[slideControl.value]);
            let t = Delaunay.triangulate(resultPoints[slideControl.value]);
            drawTriangles(sketch, resultPoints[slideControl.value], t);
        }
    }

    applyBtn.onclick = function () {
        for (let i = 0; i < 10; i++) {
            let img = new Image();
            img.type = startImg.type;
            img.w = startImg.w;
            img.h = startImg.h;
            img.data = [];

            let pts = [];
            let time = 1 / (10 - i);

            for (let i = 0; i < pointsA.length; i++) {
                let x = Math.round(((1 - time) * pointsA[i][0]) + (time * pointsB[i][0]));
                let y = Math.round(((1 - time) * pointsA[i][1]) + (time * pointsB[i][1]));

                pts.push([x, y]);
            }

            let t = Delaunay.triangulate(pts)
            let tt = makeTriangles(t, pts);

            for (let i = 0; i < startImg.h; i++) {
                img.data [i] = [];
                for (let j = 0; j < startImg.w; j++) {
                    for (let k = 0; k < tt.length; k++) {
                        img.data[i][j] = startImg.data[i][j] + (endImg.data[i][j] - startImg.data[i][j]) * time;
                    }
                }
            }

            resultsImg.push(img);
            resultPoints.push(pts);
        }
    }

}

function makeTriangles(t, pts) {
    let res = [];
    for (let i = 0; i < t.length; i += 3) {
        res.push({
            a: {x: pts[t[i]][0], y: pts[t[i]][1]},
            b: {x: pts[t[i + 1]][0], y: pts[t[i + 1]][1]},
            c: {x: pts[t[i + 2]][0], y: pts[t[i + 2]][1]}
        })
    }
    return res;
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

new p5(startCanvas, 'p5sketch');
new p5(endCanvas, 'p5sketch');
new p5(resultCanvas, 'p5sketch');


