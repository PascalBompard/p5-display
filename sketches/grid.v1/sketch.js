
/* Objects in a grid pattern with a color gradient based on their position. 
The grid size is determined by the `spacing` variable, and the color ramp can be adjusted for either black and white or color mode. 
The `setup` function initializes the canvas and draws the ellipses in the specified pattern, while the `draw` function is currently empty, allowing for future animations or interactions. */


// Vars

let columns; //number of columns in the grid, will be calculated based on the canvas width and spacing
let rows; //number of rows in the grid, will be calculated based on the canvas height and spacing
let spacing = 200;; //spacing between the ellipses in the grid, will be set based on the selected size mode
let x0 = spacing/2; //starting x position, allow for half spacing to ensure there is clipping of the ellipses at the edges of the canvas and no visible gaps
let y0 = spacing/2;
let size = spacing * 2; //size of the ellipses, set to twice the spacing to ensure they overlap and create a continuous pattern
let colourRampSpeed; //speed at which the color changes across the grid, will be calculated based on the number of columns and rows
let gridObjects = []; //array to hold the grid objects, will be populated in the setup function


// Classes

class GridObject {
    constructor(x, y, size, fillColour, strokeColour, strokeAlpha,strokeWeight) {
        this.x = x; //x position of the object  
        this.y = y; //y position of the object
        this.size = size; //size of the object
        this.fillColour = fillColour; //fill color of the object
        this.strokeColour = strokeColour; //stroke color of the object
        this.strokeAlpha = strokeAlpha; //stroke alpha of the object
        this.strokeWeight = strokeWeight; //stroke weight of the object
    }
    
    display() {
        push();
        fill(this.fillColour);
        // stroke(this.strokeColour, this.strokeAlpha);
        // strokeWeight(this.strokeWeight);
        noStroke(); //disable stroke for the large ellipse
        ellipse(this.x, this.y, this.size, this.size); //draw ellipse at the specified position with the specified size
        pop();
        push();
        fill(100); //set fill color to red for the small ellipse
        noStroke(); //disable stroke for the small ellipse
        ellipse(this.x, this.y, 50, 50); //draw small ellipse at the specified position
        pop();
        push();
        noFill(); //disable fill for the small ellipse
        stroke(255,0,255,50); //set stroke color to white for the small ellipse
        strokeWeight(20); //set stroke weight to 2 for the small ellipse
        ellipse(this.x, this.y, 150, 150); //draw small ellipse at the specified position
        pop();
    }
}

// P5 Functions

function setup() {
    createCanvas(windowWidth, windowHeight); //create a canvas that fills the window
    background(0);

    columns = width / spacing; //calculate the number of columns based on the canvas width and spacing
    rows = height / spacing; //calculate the number of rows based on the canvas height and spacing
    colourRampSpeed = 255 / (columns + rows);

    // Create a grid of objects with a color gradient based on their position
    for (let i = 0; i < columns+1; i++) {
            for (let j = 0; j < rows+1; j++) {
                let go_x = x0 + i * spacing; // calculate the x position of the object based on its column index and spacing
                print("x = " + go_x);
                let go_y = y0 + j * spacing; // calculate the y position of the object based on its row index and spacing
                print("y = " + go_y);
                let go_fillColour = colourRampSpeed * i + colourRampSpeed * j; // calculate the fill color of the object based on its position in the grid, creating a gradient effect
                let goStrokeColour = 0; 
                let goStrokeAlpha = 100;
                let goStrokeWeight = 1; 
                gridObjects.push(new GridObject(go_x, go_y, size, go_fillColour, goStrokeColour, goStrokeAlpha, goStrokeWeight)); 
            }
        }
    
    for (let i = 0; i < gridObjects.length; i++) {
        gridObjects[i].display(); //display each object in the grid            
    }    
}

function draw() {
// Not needed for this static pattern    
}
