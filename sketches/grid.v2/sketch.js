
/* Objects in a grid pattern with a color gradient based on their position. 
The grid size is determined by the `spacing` variable, and the color ramp can be adjusted for either black and white or color mode. 
The `setup` function initializes the canvas and draws the objects in the specified pattern, while the `draw` function is currently empty, allowing for future animations or interactions. */


// Vars

let columns; //number of columns in the grid, will be calculated based on the canvas width and spacing
let rows; //number of rows in the grid, will be calculated based on the canvas height and spacing
let spacing = 50;; //spacing between the rectangles in the grid, will be set based on the selected size mode
let x0 = 0; //starting x position, allow for half spacing to ensure there is clipping of the rectangles at the edges of the canvas and no visible gaps
let y0 = 0;
let size = spacing; //size of the rectangles, set to twice the spacing to ensure they overlap and create a continuous pattern
let gridObjects = []; //array to hold the grid objects, will be populated in the setup function
let sheet;
let glyphs = [];
let glyphsPerRow = 8; //number of glyphs per row in the sprite sheet, used to calculate the position of each glyph in the sheet
let glyphsPerColumn = 8; //number of glyphs per column in the sprite sheet, used to calculate the position of each glyph in the sheet

// Classes

class GridObject {
    constructor(x, y, size, fillColour) {
        this.x = x; //x position of the object  
        this.y = y; //y position of the object
        this.glyph = random(glyphs); //randomly select a glyph from the glyphs array
        this.size = size; //size of the object
        this.fillColour = random(125,255); //fill color of the object

    }
    
    display() { 
        fill(this.fillColour); 
        noStroke(); 
        rect(this.x, this.y, this.size, this.size);
        push();
        translate(this.x, this);
        imageMode(CENTER);
        image(this.glyph, this.x + this.size / 2, this.y + this.size / 2, this.size, this.size);        
        pop();
    }
}

// P5 Functions

async function setup() {
    createCanvas(windowWidth, windowHeight); //create a canvas that fills the window
    background(255);

     // waits for asset to load
    sheet = await loadImage("assets/glyphs-v1.png");
    // Calculate the position and size of each glyph in the sprite sheet and store them in the glyphs array
    for (let i = 0; i < glyphsPerColumn; i++) {
        for (let j = 0; j < glyphsPerRow; j++) {
            let x = j * (sheet.width / glyphsPerRow); //calculate the x position of the glyph in the sprite sheet based on its column index and the width of each glyph
            let y = i * (sheet.height / glyphsPerColumn);//calculate the y position of the glyph in the sprite sheet based on its row index and the height of each glyph
            let w = sheet.width / glyphsPerRow;//calculate the width of each glyph based on the total width of the sprite sheet and the number of glyphs per row
            let h = sheet.height / glyphsPerColumn;//calculate the height of each glyph based on the total height of the sprite sheet and the number of glyphs per column
            let glyph = sheet.get(x, y, w, h);
            glyphs.push(glyph);
        }
    }
  

    columns = width / spacing; //calculate the number of columns based on the canvas width and spacing
    rows = height / spacing; //calculate the number of rows based on the canvas height and spacing
 


    // Create a grid of objects with a color gradient based on their position
    for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                let go_x = x0 + i * spacing; // calculate the x position of the object based on its column index and spacing            
                let go_y = y0 + j * spacing; // calculate the y position of the object based on its row index and spacing
                let go_fillColour = 150 + (i*j *10) // calculate the fill color of the object based on its position in the grid, creating a gradient effect                
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
