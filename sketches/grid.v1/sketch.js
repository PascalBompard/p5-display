
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
    constructor(x, y, size, fillColour) {
        this.x = x; //x position of the object  
        this.y = y; //y position of the object
        this.size = size; //size of the object
        this.fillColour = fillColour; //fill color of the object
    }
    
    display() { 
        push();
            fill(0, 20);
            noStroke(); 
            ellipse(this.x, this.y, this.size*1.1, this.size*1.1); 
        pop();
        push();
            fill(-20+this.fillColour,30+(this.fillColour),75+(this.fillColour/1.5));
            noStroke(); 
            ellipse(this.x, this.y, this.size, this.size); 
        pop();
         push();
            //fill(0,185,155,100);
            fill(100+(this.fillColour/20),this.fillColour/50,255-(this.fillColour/2),50+(this.fillColour/100)); 
            noStroke(); 
            ellipse(this.x, this.y, this.size/2, this.size/2); 
        pop();
        push();
            fill(0, 50);
            noStroke();
            ellipse(this.x, this.y, this.size/3.5, this.size/3.5);
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
                let go_y = y0 + j * spacing; // calculate the y position of the object based on its row index and spacing
                let go_fillColour = colourRampSpeed * (i + j); // calculate the fill color of the object based on its position in the grid, creating a gradient effect
                gridObjects.push(new GridObject(go_x, go_y, size, go_fillColour)); 
            }
        }
    
    for (let i = 0; i < gridObjects.length; i++) {
        gridObjects[i].display(); //display each object in the grid            
    }    
}

function draw() {
// Not needed for this static pattern    
}
