let spacing = 100;
let x0 = spacing/2;
let y0 = spacing/2;
let size = 200;
let columns
let rows


function setup() {
    createCanvas(800, 600);
    background(220);
    columns = width / spacing;
    rows = height / spacing;
    print("columns = " + columns + "  rows = " + rows);

    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            fill(20*i + 20*j);
            ellipse(x0 + i * spacing, y0 + j * spacing, size, size);
        }
    }
}

function draw() {
    
}
