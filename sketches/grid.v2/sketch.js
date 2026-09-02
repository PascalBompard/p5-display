
/* Objects in a grid pattern with a color gradient based on their position. 
The grid size is determined by the `spacing` variable, and the color ramp can be adjusted for either black and white or color mode. 
The `setup` function initializes the canvas and draws the objects in the specified pattern, while the `draw` function is currently empty, allowing for future animations or interactions. */


// Vars

let columns; //number of columns in the grid, will be calculated based on the canvas width and spacing
let rows; //number of rows in the grid, will be calculated based on the canvas height and spacing
let spacing = 100; //spacing between the rectangles in the grid, will be set based on the selected size mode
let x0 = 0; //starting x position, allow for half spacing to ensure there is clipping of the rectangles at the edges of the canvas and no visible gaps
let y0 = 0;
let size = spacing; //size of the rectangles, set to twice the spacing to ensure they overlap and create a continuous pattern
let gridObjects = []; //array to hold the grid objects, will be populated in the setup function
let sheet;
let glyphs = [];
let glyphsPerRow = 8; //number of glyphs per row in the sprite sheet, used to calculate the position of each glyph in the sheet
let glyphsPerColumn = 8; //number of glyphs per column in the sprite sheet, used to calculate the position of each glyph in the sheet
let lastChangeTime = 0; //variable to keep track of the last time a change was made to the grid objects
let changeInterval = 1000; //interval in milliseconds between changes to the grid objects, can be adjusted to control the speed of the animation
let staggerDelay = 2000; //delay in milliseconds between changes to individual grid objects, can be adjusted to control the speed of the animation
let withinObjectDelay = 300; //delay in milliseconds between changes to the fill color and glyph of an individual grid object, can be adjusted to control the speed of the animation


// Classes

class GridObject {
    constructor(x, y, size) {
        this.x = x; //x position of the object  
        this.y = y; //y position of the object
        this.glyph = random(glyphs); //randomly select a glyph from the glyphs array
        this.size = size; //size of the grid
        this.glyphSize = size; //size of the glyph, set to the same size as the grid
        this.randomFill = random(50, 250); //fill color of the object

        this.pendingFill= null; //variable to hold the pending fill color for the object, initialized to null
        this.pendingGlyph= null; //variable to hold the pending glyph for the object, initialized to null
        this.fillChangeTime = null; //variable to keep track of the last time a fill color change was made, initialized to null
        this.glyphChangeTime = null; //variable to keep track of the last time a glyph change was made, initialized to null

    }
    
    display() {
        fill(this.randomFill); 
        noStroke(); 
        rect(this.x, this.y, this.size, this.size);
        push();
        imageMode(CENTER);
        image(this.glyph, this.x + this.size / 2, this.y + this.size / 2, this.glyphSize, this.glyphSize);//         
        pop();
    }

    scheduleChange(delay) {
        this.pendingFill = random(50, 250); //randomly select a new fill color for the object
        this.pendingGlyph = random(glyphs); //randomly select a new glyph from the glyphs array for the object
        this.fillChangeTime = millis() + delay; //set the time for the fill color change to occur after the specified delay
        this.glyphChangeTime = millis() + delay + withinObjectDelay; //set the time for the glyph change to occur after the specified delay
    }

    update() {
        let now = millis(); //get the current time in milliseconds

        if (this.fillChangeTime !== null && now >= this.fillChangeTime) { //check if the fill color change time has been reached
            this.randomFill = this.pendingFill; //update the fill color to the pending fill color
            this.pendingFill = null; //reset the pending fill color to null
            this.fillChangeTime = null; //reset the fill change time to null
            this.display(); //display the object with the new fill color
        
        }
        if (this.glyphChangeTime !== null && now >= this.glyphChangeTime) { //check if the glyph change time has been reached
            this.glyph = this.pendingGlyph; //update the glyph to the pending glyph
            this.pendingGlyph = null; //reset the pending glyph to null
            this.glyphChangeTime = null; //reset the glyph change time to null
            this.display(); //display the object with the new glyph
        }
    }
}

// Functions

function changeGridObjects() {
    let randomChange = random(1, 10);
    for (let i = 0; i < randomChange; i++) {
        let randomIndex = floor(random(0, gridObjects.length));
        gridObjects[randomIndex].scheduleChange(i * staggerDelay ); //schedule a change for the randomly selected object with a staggered delay
    }
}


// P5 Core Functions

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
    for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                let go_x = x0 + i * spacing; // calculate the x position of the object based on its column index and spacing            
                let go_y = y0 + j * spacing; // calculate the y position of the object based on its row index and spacing              
                gridObjects.push(new GridObject(go_x, go_y, size)); 
            }
        }
    
    for (let i = 0; i < gridObjects.length; i++) {
        gridObjects[i].display(); //display each object in the grid            
    }    
}

function draw() {

    if (millis() - lastChangeTime > changeInterval) { //check if the time since the last change is greater than the change interval
        changeGridObjects(); //call the function to change the grid objects
        lastChangeTime = millis(); //update the last change time to the current time
    }

    for (let i = 0; i < gridObjects.length; i++) {
        gridObjects[i].update(); //update each object in the grid
    }

}

