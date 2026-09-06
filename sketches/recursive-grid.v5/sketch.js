


// Vars
let root;
let leaves = []; // array to hold the leaf regions
let revealedCount = 0; // counter for the number of revealed leaf regions
let lastRevealTime = null; // timestamp of the last revealed leaf region
const REVEAL_DELAY = 10; // interval in milliseconds between revealing leaf regions

let UNITS_PER_ROW = 20;
let UNIT_SIZE;
const MAX_DEPTH = 8; //maximum depth of the quadtree
const MIN_SPLIT_DEPTH = 2; //don't split regions that are shallower than this depth
const MAX_ASPECT = 4;
const STOP_CHANCE_BASE = 0.03; //base chance of stopping the split
const STOP_CHANCE_STEP = 0.06; //additional chance of stopping the split for each depth level
const PALETTE_ASPECT_1 = [
  '#fFF',
  '#CECECE',
  '#BEBEBE',
];
const PALETTE_ASPECT_RECT= [
  '#48481c',
  '#351d3e',
  '#414241',
  '#303131',
  '#121212',
];

const GLYPH_CONFIG = {
    1: {
        path: 'assets/G-1block-1.webp',
        glyphsPerRow: 8,
        glyphsPerColumn: 8
    },
    2: {
        path: 'assets/G-2block-1.webp',
        glyphsPerRow: 8,
        glyphsPerColumn: 4
    },
    3: {
        path: 'assets/G-3block-1.webp',
        glyphsPerRow: 8,
        glyphsPerColumn: 2
    }   
};


let glyphSheets = {1:[], 2:[], 3:[]}; //

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

        const rawAspect = max(this.unitsW, this.unitsH) / min(this.unitsW, this.unitsH);
        this.aspectClass = round(rawAspect);

        if (this.aspectClass === 1) {        
            this.orientation = 'square';
        } else if (this.unitsW > this.unitsH) {
            this.orientation = 'wide';
        } else {
            this.orientation = 'tall';
        }


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
            this.squareCol = color(random(PALETTE_ASPECT_1));
            this.rectCol = color(random(PALETTE_ASPECT_RECT));
            fill(color(random(PALETTE_ASPECT_RECT)));
            this.isLeaf = true;
//            this.col = color(random(PALETTE_ASPECT_1)); //assign a random color from the palette to the leaf region

            const pool = glyphSheets[this.aspectClass]; 

            if (pool && pool.length > 0) { //check if there are glyphs available for the aspect class
                this.glyph = random(pool); //assign a random glyph from the pool to the leaf region
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

    renderLeaf() {
        fill(this.rectCol);
        noStroke();
        rect(this.x, this.y, this.w, this.h);

        if (this.glyph) {
            const g = this.glyph;

            if (this.orientation === 'wide') {
                push();
                translate(this.x + this.w/2, this.y + this.h/2);
                rotate(90);
                image(g, -this.h/2, -this.w/2, this.h, this.w); //draw the glyph in the region
                pop();
            } else {
                image(g, this.x, this.y, this.w, this.h); //draw the glyph in the region
            }

            fill(this.squareCol);
            noStroke();
            rect(this.x, this.y, this.w, this.h); 
            
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
    }

    display() {
        if (this.isLeaf) {
            this.renderLeaf();
        } else {
            for (const child of this.children) {
                child.display();
            }
        }
    }

    collectLeaves(list) {
        if (this.isLeaf) {
            list.push(this);
        } else {
            for (const child of this.children) {
                child.collectLeaves(list);
            }
        }   
    }
}

// Functions



// P5 Core Functions

async function setup() {
    angleMode(DEGREES);
    createCanvas(windowWidth, windowHeight); //create a canvas that fills the window
    //noLoop(); //stop the draw loop from running automatically
     background(123);

    UNIT_SIZE = width / UNITS_PER_ROW; //calculate the size of each unit based on the canvas width and the number of units per row
    const unitsPerColumn = ceil(height / UNIT_SIZE); //calculate the number of units that can fit in the height of the canvas
    const gridHeight = unitsPerColumn * UNIT_SIZE; //calculate the total height of the grid based on the number of units and the unit size


    for (const aspectClass in GLYPH_CONFIG) {
        const config = GLYPH_CONFIG[aspectClass];
        const sheet = await loadImage(config.path);

        for (let i = 0; i < config.glyphsPerColumn; i++) {
            for (let j = 0; j < config.glyphsPerRow; j++) {
                let x = j * (sheet.width / config.glyphsPerRow);
                let y = i * (sheet.height / config.glyphsPerColumn);
                let w = sheet.width / config.glyphsPerRow;
                let h = sheet.height / config.glyphsPerColumn;
                glyphSheets[aspectClass].push(sheet.get(x, y, w, h));
            }
        }
    }


    

    root = new Region(0, 0, windowWidth, gridHeight, 0); //create a new Region object that represents the entire canvas
    root.collectLeaves(leaves); //collect all the leaf regions in the root region and store them in the leaves array

}

function draw() {
    if (revealedCount >= leaves.length) {
        return; //stop the draw loop if all leaf regions have been revealed
    }
    
   

    
    if (lastRevealTime === null || millis() - lastRevealTime >= REVEAL_DELAY) {
        revealedCount++;
        lastRevealTime = millis();

        leaves[revealedCount - 1].renderLeaf();
        
    }

}

function mousePressed() {
    background(123);

    const unitsPerColumn = ceil(height / UNIT_SIZE); //calculate the number of units that can fit in the height of the canvas
    const gridHeight = unitsPerColumn * UNIT_SIZE; //calculate the total height of the grid based on the number of units and the unit size
    root = new Region(0, 0, windowWidth, gridHeight, 0);
    leaves = [];
    root.collectLeaves(leaves);
    revealedCount = 0;
    lastRevealTime = null;
}   