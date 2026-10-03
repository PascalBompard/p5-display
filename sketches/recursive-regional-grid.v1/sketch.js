// Vars

// Window resize boilerplate
let resizeTimer = 0;
let resizePending = false;
// ---

// ---------- CONFIG: appearance ----------

const PALETTE_1= [
    '#8ACB8B',
    '#ACDAB9',
    '#E9E684',
];
const PALETTE_2 = [
    '#6184AF',
    '#6BA8CD',
    '#86E8FF'
];
const PALETTE_3 = [
    '#9F7BA1',
    '#DEAFD3',
    '#FFB9CA',
];    
const BLANK = [
    '#414147',
    '#6E6161',
    '#808381'
];
const INK = [
    '#1D734C',
    '#323D66',
    '#582860',
    '#5C361C'   
]

let inkedSets = {}; // cache: inkedSets['main|#ffffff'][aspectClass] = array of recoloured glyphs


// ---------- CONFIG: grid and subdivision ----------

let UNITS_PER_ROW = 20;
let UNIT_SIZE; // calculated in setup() from the canvas width

const MAX_DEPTH = 5; // maximum depth of the tree
const MIN_SPLIT_DEPTH = 3; // minimum depth before a region can stop splitting
const MAX_ASPECT = 6;
const MAX_ASPECT_DEVIATION = 0.05; // how far a leaf's aspect ratio may drift from its rounded aspect class
const STOP_CHANCE_BASE = 0.03; // base chance of stopping the split
const STOP_CHANCE_STEP = 0.06; // additional chance of stopping the split for each depth level

const DEFAULT_RULES = {
    maxDepth: MAX_DEPTH,
    minSplitDepth: MIN_SPLIT_DEPTH,
    maxAspect: MAX_ASPECT,
    maxAspectDeviation: MAX_ASPECT_DEVIATION,
    stopChanceBase: STOP_CHANCE_BASE,
    stopChanceStep: STOP_CHANCE_STEP,
    palette: PALETTE_1,
    blank: BLANK[0],
    glyphSet: 'main',
    ink: INK[3]
};
const COARSE_RULES = {
    ...DEFAULT_RULES, 
    maxDepth: 3,
    minSplitDepth: 4, 
    stopChanceBase: 0.2, 
    palette: PALETTE_2, 
    blank: BLANK[1],
    ink: INK[1]
};
const FINE_RULES = {
    ...DEFAULT_RULES, 
    minSplitDepth: 8, 
    maxDepth: 12, 
    stopChanceBase: 0.01, 
    stopChanceStep: 0.03, 
    palette: PALETTE_3,
    blank: BLANK[2], 
    glyphSet: 'alt',
    ink: INK[3]
};



// ---------- CONFIG: glyph sheets ----------

const GLYPH_CONFIG = {
    main: {
        1: { path: 'assets/G-1block-1.webp', glyphsPerRow: 8, glyphsPerColumn: 8 },
        2: { path: 'assets/G-2block-1.webp', glyphsPerRow: 8, glyphsPerColumn: 4 },
        3: { path: 'assets/G-3block-1.webp', glyphsPerRow: 8, glyphsPerColumn: 2 }
    },
    alt: {
        1: { path: 'assets/G-1block-1.webp', glyphsPerRow: 8, glyphsPerColumn: 8 }
    },
};
let glyphSheets = {}; // glyphSheets[setName][aspectClass] = array of glyph images


// ---------- CONFIG: timing ----------

const REVEAL_DELAY = 1; // interval in milliseconds between revealing leaf backgrounds
const GLYPH_REVEAL_DELAY = 1; // interval in milliseconds between revealing glyphs

const CYCLE_CHANGE_MIN = 1; // minimum number of leaves refreshed in each cycle batch
const CYCLE_CHANGE_MAX = 4; // maximum number of leaves refreshed in each cycle batch
const CYCLE_STAGGER_DELAY = 500; // delay in milliseconds between each leaf's refresh within a batch
const CYCLE_WITHIN_LEAF_DELAY = 150; // delay in milliseconds between a leaf's background change and its glyph change
const CYCLE_INTERVAL = 2500; // pause in milliseconds after a batch finishes before the next one is scheduled


// ---------- STATE: changes while the sketch runs ----------

let zones = []; // array to hold the zone regions
let leaves = []; // array to hold the leaf regions

let revealedCount = 0; // number of leaf backgrounds revealed so far
let lastRevealTime = null; // timestamp of the last revealed leaf background

let glyphRevealCount = 0; // number of glyphs revealed so far
let lastGlyphRevealTime = null; // timestamp of the last revealed glyph

let nextCycleTime = 0; // timestamp at which the next cycle batch should be scheduled




// Classes
class Region {
    constructor(x, y, w, h, depth, rules) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.depth = depth;
        this.rules = rules;
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
        this.bgChangeTime = null;
        this.glyphChangeTime = null;
        this.acceptGlyph = true; 

        this.subdivide(); //subdivide the region upon creation
    }

    shouldStopSplitting() {
         if (this.depth >= this.rules.maxDepth) {
            return true; // hard backstop, never split deeper than this regardless of aspect ratio
        }

        const aspect = max(this.unitsW, this.unitsH) / min(this.unitsW, this.unitsH);

        if (aspect > this.rules.maxAspect) {
            return false; // allow splitting if the aspect ratio is too extreme
        }

       const aspectDeviation = abs(aspect - this.aspectClass);

       if (aspectDeviation > this.rules.maxAspectDeviation) {
            return false // too far from a clean ratio, so keep splitting
       }
        
        if (this.unitsW <= 1 && this.unitsH <= 1) {
            return true; // stop splitting if the region is too small to be divided into at least 2 units
        }

        if (this.depth >= this.rules.minSplitDepth) {
            const chance = this.rules.stopChanceBase + (this.depth - this.rules.minSplitDepth) * this.rules.stopChanceStep; // calculate the chance of stopping the split based on the depth
            if (random() < chance) { //if a random number between 0 and 1 is less than the chance, stop splitting
                return true;
            }
        }
        return false;
    }

    subdivide() {
        if (this.shouldStopSplitting()) { //if the region should stop splitting, mark it as a leaf and assign a random color
            //this.rectCol = color(random(PALETTE_ASPECT_RECT));
            this.isLeaf = true;

            const pool = this.poolFor(this.aspectClass);

            if (pool && pool.length > 0) { //check if there are glyphs available for the aspect class
                this.rectCol = color(random(this.rules.palette)); //assign a random color from the palette to the leaf region
                this.glyph = random(pool); //assign a random glyph from the pool to the leaf region
            } else {
                this.rectCol = color(this.rules.blank);
                this.glyph = null; // don't assign a glyph if the region is not square
                this.acceptGlyph = false;
            }

            return;
        }

        this.isLeaf = false;

        const splitVertically = this.w >= this.h; // boolean to determine if the region should be split vertically


        if (splitVertically) {
            const totalUnits = this.unitsW; // 
            const splitUnits = floor(random(1, totalUnits)); // choose a random number of units to split off for the first child
            const splitX = splitUnits * UNIT_SIZE; // calculate the x-coordinate of the split based on the number of units
            this.children.push(new Region(this.x, this.y, splitX, this.h, this.depth + 1, this.rules)); 
            this.children.push(new Region(this.x + splitX, this.y, this.w - splitX, this.h, this.depth + 1, this.rules));
        } else {
            const totalUnits = this.unitsH; // calculate the total number of units that can fit in the height of the region
            const splitUnits = floor(random(1, totalUnits)); // choose a random number of units to split off for the first child
            const splitY = splitUnits * UNIT_SIZE; // calculate the y-coordinate of the split based on the number of units
            this.children.push(new Region(this.x, this.y, this.w, splitY, this.depth + 1, this.rules));
            this.children.push(new Region(this.x, this.y + splitY, this.w, this.h - splitY, this.depth + 1, this.rules));
        }
    }

    renderBackground() {
        fill(this.rectCol);
        noStroke();
        rect(this.x, this.y, this.w, this.h);
    }

    assignRandomBackground() {
        this.rectCol = color(random(this.rules.palette));
    }

    renderGlyph() {
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
        }
    }

    assignRandomGlyph() {
        const pool = this.poolFor(this.aspectClass); //get the pool of glyphs for the aspect class

        if (pool && pool.length > 0) { //check if there are glyphs available for the aspect class
            this.glyph = random(pool); //assign a random glyph from the pool to the leaf region
        }
    }

    poolFor(aspectClass) {
        const set = getInkedSet(this.rules.glyphSet, this.rules.ink);
        return set ? set[aspectClass] : undefined; //return the pool of glyphs for the aspect class, or null if the set is not found
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

    scheduleCycleChange(delay){
        if (!this.acceptGlyph) {
            return;
        }
        this.bgChangeTime = millis() + delay;
        this.glyphChangeTime = millis() + delay + CYCLE_WITHIN_LEAF_DELAY;
    }

    updateCycle() {
        const now = millis();

        if (this.bgChangeTime !== null && now >= this.bgChangeTime) {
            this.assignRandomBackground();
            this.renderBackground();
            this.bgChangeTime = null;
        }

        if (this.glyphChangeTime !== null && now >= this.glyphChangeTime) {
            this.assignRandomGlyph();
            this.renderGlyph();
            this.glyphChangeTime = null;
        }
    }

}

class Zone {
    constructor(col, row, cols, rows, rules) {
        this.x = col * UNIT_SIZE;
        this.y = row * UNIT_SIZE;
        this.w = cols *UNIT_SIZE;
        this.h = rows * UNIT_SIZE;
        this.rules = rules;
        
        this.root = new Region(this.x, this.y, this.w, this.h, 0, this.rules);
    }

    collectLeaves(list) {
        this.root.collectLeaves(list);
    }
}


// P5 Core Functions

async function setup() {
    angleMode(DEGREES);
    createCanvas(windowWidth, windowHeight); //create a canvas that fills the window
    //noLoop(); //stop the draw loop from running automatically
     background(123);

    for (const setName in GLYPH_CONFIG) {
        glyphSheets[setName] = {};
    
        for (const aspectClass in GLYPH_CONFIG[setName]) {
        const config = GLYPH_CONFIG[setName][aspectClass];
        const sheet = await loadImage(config.path);
        glyphSheets[setName][aspectClass] = [];

        for (let i = 0; i < config.glyphsPerColumn; i++) {
            for (let j = 0; j < config.glyphsPerRow; j++) {
                let x = j * (sheet.width / config.glyphsPerRow);
                let y = i * (sheet.height / config.glyphsPerColumn);
                let w = sheet.width / config.glyphsPerRow;
                let h = sheet.height / config.glyphsPerColumn;
                glyphSheets[setName][aspectClass].push(sheet.get(x, y, w, h));
                }
            }
        }
    
    }


    buildZones(); //build the zones and their regions
}

function draw() {
    
    // Window Resizing
    if (resizePending && millis() - resizeTimer > 200) {
        onResize();
        resizePending = false;
    }
   

    if (revealedCount < leaves.length) {
        if (lastRevealTime === null || millis() - lastRevealTime >= REVEAL_DELAY) {
            revealedCount++;
            lastRevealTime = millis();
            leaves[revealedCount - 1].renderBackground(); //render the background of the next leaf region
        }
        return; //stop the draw loop if not all leaf regions have been revealed
    }

    if (glyphRevealCount < leaves.length) {
        if (lastGlyphRevealTime === null || millis() - lastGlyphRevealTime >= GLYPH_REVEAL_DELAY) {
            glyphRevealCount++;
            lastGlyphRevealTime = millis();
            leaves[glyphRevealCount - 1].renderGlyph(); //render the glyph of the next leaf region
        }
        return; //stop the draw loop if not all glyphs have been revealed
    }
    
    if (millis() >= nextCycleTime) {
        scheduleCycleBatch();
    }

    for (const leaf of leaves) {
        leaf.updateCycle();
    }
}


// Functions


// Window resize boilerplate
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    resizeTimer = millis();
    resizePending = true;
}
// ---

function findLeafAt(px,py) {
    for (const leaf of leaves) {
        if (px >= leaf.x && px < leaf.x + leaf.w && py >= leaf.y && py < leaf.y + leaf.h) {
            return leaf;
        }
    }
    return null; //return null if no leaf is found at the given coordinates
}

function scheduleCycleBatch() {
    const changeCount = floor( random(CYCLE_CHANGE_MIN, CYCLE_CHANGE_MAX + 1));
    let lastDelay = 0;

    for (let i = 0; i < changeCount; i++) {
        const randomIndex = floor(random(leaves.length));
        const delay = i * CYCLE_STAGGER_DELAY;

        leaves[randomIndex].scheduleCycleChange(delay);
        lastDelay = delay;
    }

    const batchDuration = lastDelay + CYCLE_WITHIN_LEAF_DELAY;
    nextCycleTime = millis() + batchDuration + CYCLE_INTERVAL;
}


function buildZones() {
    UNIT_SIZE = width / UNITS_PER_ROW; //recalculate the size of each unit based on the canvas width and the number of units per row
    const totalRows = ceil(height / UNIT_SIZE); //calculate the number of units that can fit in the height of the canvas
    const leftCols = 4; //number of columns for the left zone
    const midCols = 10; //number of columns for the middle zone
    const rightCols = UNITS_PER_ROW - leftCols - midCols; //number of columns for the right zone

    zones = []; //clear the zones array
    zones.push(new Zone(0, 0, leftCols, totalRows, FINE_RULES)); //create a new Zone object that represents the left zone and add it to the zones array
    zones.push(new Zone(leftCols, 0, midCols, totalRows, COARSE_RULES)); //create a new Zone object that represents the middle zone and add it to the zones array
    zones.push(new Zone(leftCols + midCols, 0, rightCols, totalRows, DEFAULT_RULES)); //create a new Zone object that represents the right zone and add it to the zones array

    leaves = []; //clear the leaves array
    for (const zone of zones) {
        zone.collectLeaves(leaves); //collect all the leaf regions in each zone and store them in the leaves array
    }   
}


function rebuildTree() {
    background(123);
    buildZones(); //rebuild the zones and their regions
    revealedCount = 0;
    lastRevealTime = null;
    glyphRevealCount = 0;
    lastGlyphRevealTime = null;
}

function recolourGlyph(img, inkColour) {
    const out = img.get(0, 0, img.width, img.height); 
    const c = color(inkColour);
    const r = red(c);
    const g = green(c);
    const b = blue(c);

    out.loadPixels();
    for (let i = 0; i < out.pixels.length; i += 4) {
            out.pixels[i] = r;
            out.pixels[i + 1] = g;
            out.pixels[i + 2] = b;
        }
    out.updatePixels();
    return out;
}

function getInkedSet(setName, ink) {
    const raw = glyphSheets[setName];
    if (!raw) {
        return undefined;
    }
    const key = setName + '|' + ink;
    if (!inkedSets[key]) {
        inkedSets[key] = {};
        for (const aspectClass in raw) {
            inkedSets[key][aspectClass] = raw[aspectClass].map(g => recolourGlyph(g, ink));
        }
    }
    return inkedSets[key];
}

function keyPressed() {

    if (key === 's') {
      saveCanvas("canvas", "png");
    } 

    if (key === 'r') {
        rebuildTree();
    }

}

function mousePressed() {
    const fullyRevealed = revealedCount >= leaves.length && glyphRevealCount >= leaves.length;
    if (!fullyRevealed) {
        return; //do nothing if not all leaf regions and glyphs have been revealed
    }
    const leaf = findLeafAt(mouseX, mouseY);
    if (leaf && leaf.acceptGlyph) {        
        leaf.assignRandomBackground();
        leaf.renderBackground();
        leaf.assignRandomGlyph();
        leaf.renderGlyph();
    }
}

// Window Resizing
function onResize() {
  rebuildTree();
}
