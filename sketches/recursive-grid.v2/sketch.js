


// Vars
let root;

const MIN_SIZE = 20; //minimum size of a region
const MAX_DEPTH = 6; //maximum depth of the quadtree
const MIN_SPLIT_DEPTH = 2; //don't split regions that are shallower than this depth
const STOP_CHANCE_BASE = 0.05; //base chance of stopping the split
const STOP_CHANCE_STEP = 0.06; //additional chance of stopping the split for each depth level
const PALETTE = [
  '#dab2c6',
  '#D9C7A3',
  '#B5835D',
  '#709a81',
  '#eee1ad'
];

let imagePath = 'assets/glyphs-v2.PNG';
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

        this.children = [];
        this.isLeaf = true;
        this.col = null;

        this.subdivide(); //subdivide the region upon creation
    }

    shouldStopSplitting() {
        if (this.depth >= MAX_DEPTH) {
            return true;
        }
        if (this.w < MIN_SIZE || this.h < MIN_SIZE) {
            return true;
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
            this.glyph = random(glyphs); //assign a random glyph from the glyphs array to the leaf region
            return;
        }

        this.isLeaf = false;

        const splitVertically = this.w >= this.h; // boolean to determine if the region should be split vertically
        const aspect = max(this.w, this.h) / min(this.w, this.h);
        let ratio;
        if (aspect > 1.6) { //
        ratio = random(0.45, 0.55);
        } else {
        ratio = random(0.35, 0.65);
        }


        if (splitVertically) {
            const splitX = this.w * ratio;
            this.children.push(new Region(this.x, this.y, splitX, this.h, this.depth + 1)); 
            this.children.push(new Region(this.x + splitX, this.y, this.w - splitX, this.h, this.depth + 1));
        } else {
            const splitY = this.h * ratio;
            this.children.push(new Region(this.x, this.y, this.w, splitY, this.depth + 1));
            this.children.push(new Region(this.x, this.y + splitY, this.w, this.h - splitY, this.depth + 1));
        }
    }

    display() {
        if (this.isLeaf) {
            fill(this.col);
            noStroke();
            rect(this.x, this.y, this.w, this.h);

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

    root = new Region(0, 0, width, height, 0); //create a new Region object that represents the entire canvas

}

function draw() {
    background(123);
    root.display(); //display the root region, which will recursively display all of its children   
}

function mousePressed() {
    root = new Region(0, 0, width, height, 0); 
    redraw(); 
}   