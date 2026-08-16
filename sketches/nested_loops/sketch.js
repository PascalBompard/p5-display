let spacing = 100;
let x0 = spacing/2;
let y0 = spacing/2;
let size = spacing * 2;
let columns;
let rows;
let colourRampSpeed;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    stroke('rgba(0, 0, 0, 0.1)');
    strokeWeight(2);
    columns = ceil(width / spacing);
    rows = ceil(height / spacing);
    colourRampSpeed = 185 / (columns + rows);
    print("columns = " + columns + "  rows = " + rows);
    print("colourRampSpeed = " + colourRampSpeed);

    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            fill(
                100 + colourRampSpeed * i + colourRampSpeed * j, 
                30 + colourRampSpeed * i + colourRampSpeed * j, 
                1 + colourRampSpeed * i + colourRampSpeed * j);
            ellipse(x0 + i * spacing, y0 + j * spacing, size, size);
        }
    }
}

function draw() {
    
}
