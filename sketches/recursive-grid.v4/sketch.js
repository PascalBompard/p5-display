


// Vars
let root;

let UNITS_PER_ROW = 20;
let UNIT_SIZE;
const MAX_DEPTH = 8; //maximum depth of the quadtree
const MIN_SPLIT_DEPTH = 2; //don't split regions that are shallower than this depth
const MAX_ASPECT = 4;
const STOP_CHANCE_BASE = 0.03; //base chance of stopping the split
const STOP_CHANCE_STEP = 0.06; //additional chance of stopping the split for each depth level
const PALETTE = [
  '#fff',
  '#ededed',
  '#fcfcfc',
  '#cacaca',
  '#bfbfbf',
];

let imagePath = 'assets/G-1block-1.webp';
let sheet;
let glyphs = [];
let glyphsPerRow = 8;
let glyphsPerColumn = 8;

// Classes
class Region {
    constructor(x, y, w, h, depth) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.depth = depth;
        this.unitsH = round(this.h / UNIT_SIZE);// calculate the number of units that can fit in the height of the region
        this.unitsW = round(this.w / UNIT_SIZE);// calculate the number of units that can fit in the width of the region

        this.children = [];
        this.isLeaf = true;
        this.col = null;

        this.subdivide(); //subdivide the region upon creation
    }

    shouldStopSplitting() {
        const aspect = max(this.unitsW, this.unitsH) / min(this.unitsW, this.unitsH);

        if (aspect > MAX_ASPECT) {
            return false; // allow splitting if the aspect ratio is too extreme
        }

        if (this.depth >= MAX_DEPTH) {
            return true;
        }
        
        if (this.unitsW <= 1 && this.unitsH <= 1) {
            return true; // stop splitting if the region is too small to be divided into at least 2 units
        }

        if (this.depth >= MIN_SPLIT_DEPTH) {
            const chance = STOP_CHANCE_BASE + (this.depth - MIN_SPLIT_DEPTH) * STOP_CHANCE_STEP; // calculate the chance of stopping the split based on the depth
            if (random() < chance) { //if a random number between 0 and 1 is less than the chance, stop splitting
                return true;
            }
        }
        return false;
    }

    subdivide() {
        if (this.shouldStopSplitting()) { //if the region should stop splitting, mark it as a leaf and assign a random color
            this.isLeaf = true;
            this.col = color(random(PALETTE)); //assign a random color from the palette to the leaf region

            if (this.unitsW === this.unitsH) {
                this.glyph = random(glyphs); //assign a random glyph from the glyphs array to the leaf region
             } else {
                this.glyph = null; // don't assign a glyph if the region is not square
            }

            return;
        }

        this.isLeaf = false;

        const splitVertically = this.w >= this.h; // boolean to determine if the region should be split vertically


        if (splitVertically) {
            const totalUnits = this.unitsW; // 
            const splitUnits = floor(random(1, totalUnits)); // choose a random number of units to split off for the first child
            const splitX = splitUnits * UNIT_SIZE; // calculate the x-coordinate of the split based on the number of units
            this.children.push(new Region(this.x, this.y, splitX, this.h, this.depth + 1)); 
            this.children.push(new Region(this.x + splitX, this.y, this.w - splitX, this.h, this.depth + 1));
        } else {
            const totalUnits = this.unitsH; // calculate the total number of units that can fit in the height of the region
            const splitUnits = floor(random(1, totalUnits)); // choose a random number of units to split off for the first child
            const splitY = splitUnits * UNIT_SIZE; // calculate the y-coordinate of the split based on the number of units
            this.children.push(new Region(this.x, this.y, this.w, splitY, this.depth + 1));
            this.children.push(new Region(this.x, this.y + splitY, this.w, this.h - splitY, this.depth + 1));
        }
    }

    display() {
        if (this.isLeaf) {
            fill(this.col);
            noStroke();
            rect(this.x, this.y, this.w, this.h);

            if (this.glyph) {
                const g = this.glyph;
                const leafAspect = this.w / this.h;

                let sx, sy, sw, sh;

                if (leafAspect > 1) {
                    // wider than tall, crop glyph vertically
                    sw = g.width;
                    sh = g.width / leafAspect;
                    sx = 0;
                    sy = (g.height - sh) / 2;                  
                } else {
                    // taller than wide, crop glyph horizontally
                    sh = g.height;
                    sw = g.height * leafAspect;
                    sy = 0;
                    sx = (g.width - sw) / 2;
                }

                image(g, this.x, this.y, this.w, this.h, sx, sy, sw, sh); //draw the glyph in the region
            }

        } else {
            for (const child of this.children) {
                child.display();
            }
        }
    }
}

// Functions



// P5 Core Functions

async function setup() {
    createCanvas(windowWidth, windowHeight); //create a canvas that fills the window
    noLoop(); //stop the draw loop from running automatically

    UNIT_SIZE = width / UNITS_PER_ROW; //calculate the size of each unit based on the canvas width and the number of units per row
    const unitsPerColumn = ceil(height / UNIT_SIZE); //calculate the number of units that can fit in the height of the canvas
    const gridHeight = unitsPerColumn * UNIT_SIZE; //calculate the total height of the grid based on the number of units and the unit size

    sheet = await loadImage(imagePath); //load the sprite sheet image

    for (let i = 0; i < glyphsPerColumn; i++) {
    for (let j = 0; j < glyphsPerRow; j++) {
        let x = j * (sheet.width / glyphsPerRow);
        let y = i * (sheet.height / glyphsPerColumn);
        let w = sheet.width / glyphsPerRow;
        let h = sheet.height / glyphsPerColumn;
        glyphs.push(sheet.get(x, y, w, h));
        }
    }

    root = new Region(0, 0, windowWidth, gridHeight, 0); //create a new Region object that represents the entire canvas

}

function draw() {
    background(123);
    root.display(); //display the root region, which will recursively display all of its children   
}

function mousePressed() {
    root = new Region(0, 0, windowWidth, windowHeight, 0);
    redraw(); 
}   