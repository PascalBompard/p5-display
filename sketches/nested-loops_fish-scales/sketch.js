
/* Objects in a grid pattern with a color gradient based on their position. 
The grid size is determined by the `spacing` variable, and the color ramp can be adjusted for either black and white or color mode. 
The `setup` function initializes the canvas and draws the ellipses in the specified pattern, while the `draw` function is currently empty, allowing for future animations or interactions. */

let spacing; //spacing between the ellipses in the grid, will be set based on the selected size mode
let columns; //number of columns in the grid, will be calculated based on the canvas width and spacing
let rows; //number of rows in the grid, will be calculated based on the canvas height and spacing
let colourRampKoi = [100, 30, 1]; //starting color for the Koi color ramp, will be adjusted based on the position of the ellipses in the grid
let colourRampPurple = [20, 0, 40];
let colourRampSpeed; //speed at which the color changes across the grid, will be calculated based on the number of columns and rows
let modeColourOptions = ["BW", "Koi", "Purple"]; //available color modes
let modeColour = modeColourOptions[0]; //Toggle between modes
let modeSizeOptions = ["Small", "Medium", "Large"]; //available size modes
let modeSize = modeSizeOptions[2]; //Toggle between modes


function setup() {
    createCanvas(windowWidth, windowHeight); //create a canvas that fills the window
    background(0);
    strokeWeight(2);
    if (modeSize == "Small") {
        spacing = 50; //set spacing for small size mode
    } else if (modeSize == "Medium") {
        spacing = 100; //set spacing for medium size mode
    } else if (modeSize == "Large") {
        spacing = 200; //set spacing for large size mode
    }
    let x0 = spacing/2; //starting x position, allow for half spacing to ensure there is clipping of the ellipses at the edges of the canvas and no visible gaps
    let y0 = spacing/2;
    let size = spacing * 2; //size of the ellipses, set to twice the spacing to ensure they overlap and create a continuous pattern

    columns = ceil(width / spacing); //calculate the number of columns based on the canvas width and spacing
    rows = ceil(height / spacing); //calculate the number of rows based on the canvas height and spacing
    
    if (modeColour == "Koi") {
        stroke(0, 30);
        colourRampSpeed = 185 / (columns + rows); // Start color ramp a bit lower to ensure the colors are more vibrant and not too bright
        for (let i = 0; i < columns; i++) { //loop through each column
            for (let j = 0; j < rows; j++) { //loop through each row
                fill( //set the fill color based on the Koi color ramp and the position of the ellipse in the grid
                    colourRampKoi[0] + colourRampSpeed * i + colourRampSpeed * j, 
                    colourRampKoi[1] + colourRampSpeed * i + colourRampSpeed * j, 
                    colourRampKoi[2] + colourRampSpeed * i + colourRampSpeed * j);
                ellipse(x0 + i * spacing, y0 + j * spacing, size, size); //draw the ellipse at the calculated position with the specified size
            }
        }       
    } else if (modeColour == "Purple") {
        stroke(0, 30);
        colourRampSpeed = 200 / (columns + rows);
        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                fill(
                    colourRampPurple[0] + colourRampSpeed * i + colourRampSpeed * j, 
                    colourRampPurple[1] + colourRampSpeed * i + colourRampSpeed * j, 
                    colourRampPurple[2] + colourRampSpeed * i + colourRampSpeed * j);
                ellipse(x0 + i * spacing, y0 + j * spacing, size, size);
            }
        }       
    } else {
        stroke(0, 100);
        colourRampSpeed = 255 / (columns + rows);
        for (let i = 0; i < columns; i++) {
            for (let j = 0; j < rows; j++) {
                fill(0 + colourRampSpeed * i + colourRampSpeed * j);
                ellipse(x0 + i * spacing, y0 + j * spacing, size, size);
            }
        }       
    }    
}

function draw() {
// Not needed for this static pattern    
}
