
/* Objects in a grid pattern with a color gradient based on their position. 
The grid size is determined by the `spacing` variable, and the color ramp can be adjusted for either black and white or color mode. 
The `setup` function initializes the canvas and draws the ellipses in the specified pattern, while the `draw` function is currently empty, allowing for future animations or interactions. */

let spacing; //spacing between the ellipses in the grid, will be set based on the selected size mode
let columns; //number of columns in the grid, will be calculated based on the canvas width and spacing
let rows; //number of rows in the grid, will be calculated based on the canvas height and spacing
let saturationRamp;
let brightnessRamp; 
let modeSizeOptions = ["Small", "Medium", "Large"]; //available size modes
let modeSize = modeSizeOptions[0]; //Toggle between modes
let x0;
let y0;
let size;
let hueIndex = 0;
let hueFactor = 1; //allows for cycling through the color ramps, will be incremented in the draw function to create a dynamic effect

function setup() {
    angleMode(DEGREES);
    colorMode(HSB, 360, 100, 100); //set color mode to HSB with a range of 0-360 for hue and 0-100 for saturation and brightness
    rectMode(CENTER);
    createCanvas(windowWidth, windowHeight); //create a canvas that fills the window

    strokeWeight(1);
    if (modeSize == "Small") {
        spacing = 50; //set spacing for small size mode
    } else if (modeSize == "Medium") {
        spacing = 100; //set spacing for medium size mode
    } else if (modeSize == "Large") {
        spacing = 200; //set spacing for large size mode
    }

    x0 = 0 - spacing; //starting x position, allow for half spacing to ensure there is clipping of the ellipses at the edges of the canvas and no visible gaps
    y0 = 0 - spacing; //starting y position, allow for half spacing to ensure there is clipping of the ellipses at the edges of the canvas and no visible gaps
    size = spacing * 0.95; //size of the ellipses, set to twice the spacing to ensure they overlap and create a continuous pattern    

    columns = ceil(width / spacing); //calculate the number of columns based on the canvas width and spacing
    rows = ceil(height / spacing); //calculate the number of rows based on the canvas height and spacing

    
    // saturationRamp = 5;
    //brightnessRamp = 2;
    //print(saturationRamp);
}
    


function draw() {
    background(0);
    stroke(0, 150)
    if (hueIndex > 360) {
        hueFactor = -1;
    } else if (hueIndex < 1) {
        hueFactor = 1;
    };
    hueIndex = hueIndex + 0.5 * hueFactor; //allow for cycling with a boomerang effect
    //print(hueFactor);

    
    for (let i = 0; i < columns+2; i++) {
        for (let j = 0; j < rows+3; j++) {
            fill(hueIndex, 50+i, 50+j);
            let x = x0 + i * spacing; //calculate the x position of the ellipse based on its column index and spacing
            let y = y0 + j * spacing; //calculate the y position of the ellipse based on its row index and spacing
            
            push();
                translate(x,y)
                rotate(frameCount * 0.05); //rotate the square based on its position in the grid to create a dynamic effect
                square(0, 0, size);                
            pop();
            
        }
    }       


}
