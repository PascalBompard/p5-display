


// Vars
let root;

const MIN_SIZE = 20; //minimum size of a region
const MAX_DEPTH = 5; //maximum depth of the quadtree
const MIN_SPLIT_DEPTH = 2; //don't split regions that are shallower than this depth
const STOP_CHANCE_BASE = 0.05; //base chance of stopping the split
const STOP_CHANCE_STEP = 0.06; //additional chance of stopping the split for each depth level
const PALETTE = [
  '#F2E9DC',
  '#D9C7A3',
  '#8C6A56',
  '#4A5A4A',
  '#2E2A24'
];

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
            return;
        }

        this.isLeaf = false;

        const splitVertically = this.w >= this.h; // boolean to determine if the region should be split vertically
        const ratio = random(0.3, 0.7); // random ratio to determine where to split the region

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
            stroke('#111111');
            strokeWeight(2);
            rect(this.x, this.y, this.w, this.h);
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