// Vars

// Window resize boilerplate
let resizeTimer = 0;
let resizePending = false;
// ---

// ---------- CONFIG: appearance ----------

const PALETTE_1= [
    '#dce1dc',
    '#e7f2ea',
    '#f7f6e2',
];
const PALETTE_2 = [
    '#6a809c',
    '#6891ab',
    '#8ca8ae'
];
const PALETTE_3 = [
    '#eee9e5',
    '#f6e9dd',
    '#ede6e0',
];    
const BLANK = [
    '#414147',
    '#535760',
    '#808381'
];
const INK = [
    '#eefcf5',
    '#566498',
    '#7e4588',
    '#8b5029'   
]

let inkedSets = {}; // cache: inkedSets['main|#ffffff'][aspectClass] = array of recoloured glyphs

const SMALL_MAX_PX = 257; // maximum pixel size for a glyph to be considered "small"


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
    ink: INK[0]
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
    ink: INK[2]
};

const ALL_RULES = [DEFAULT_RULES, COARSE_RULES, FINE_RULES];

// ---------- CONFIG: layouts ----------

// Each entry describes one zone, measured in grid units.
// col and row are the top left corner, cols and rows are the size.

function layoutThreeColumns(totalRows) {
    const leftCols = floor(random(3, 8)); //number of columns for the left zone
    const midCols = floor(random(3, 10)); //number of columns for the middle zone
    const rightCols = UNITS_PER_ROW - leftCols - midCols; //number of columns for the right zone
    return [
        { col: 0, row: 0, cols: leftCols, rows: totalRows, rules: FINE_RULES },
        { col: leftCols, row: 0, cols: midCols, rows: totalRows, rules: COARSE_RULES },
        { col: leftCols + midCols, row: 0, cols: rightCols, rows: totalRows, rules: DEFAULT_RULES }
    ];
}

function layoutStacked(totalRows) {
const minRows = 3;
    const topRows = floor(random(minRows, min(8, totalRows - minRows * 2 + 1))); // choose a random number of rows for the top zone between 3 and totalRows - 3
    const remaining = totalRows - topRows;
    const midRows = floor(random(minRows, min(10, remaining - minRows + 1))); // choose a random number of rows for the middle zone between 3 and remainingRows - 3
    const bottomRows = remaining - midRows;
    return [
        { col: 0, row: 0, cols: UNITS_PER_ROW, rows: topRows, rules: FINE_RULES },
        { col: 0, row: topRows, cols: UNITS_PER_ROW, rows: midRows, rules: COARSE_RULES },
        { col: 0, row: topRows + midRows, cols: UNITS_PER_ROW, rows: bottomRows, rules: DEFAULT_RULES }
    ];  
}

function layoutMixed(totalRows) {
    const leftCols = floor(random(4, 12)); // choose a random number of columns for the left zone between 4 and 7
    const rightCols = UNITS_PER_ROW - leftCols;
    const topRows = floor(totalRows / random(2, 6)); // choose a random number of rows for the top zone between 1/2 and 1/4 of the total rows
    return [
        { col: 0, row: 0, cols: leftCols, rows: totalRows, rules: COARSE_RULES},
        { col: leftCols, row: 0, cols: rightCols, rows: topRows, rules: DEFAULT_RULES },
        { col: leftCols, row: topRows, cols: rightCols, rows: totalRows - topRows, rules: FINE_RULES }
    ];
}

const LAYOUTS = [layoutThreeColumns, layoutStacked, layoutMixed];
const THEME_NAMES = ['body', 'botanical', 'symbols'];
const ALLOW_REPEAT_THEMES = false; // if false, each theme can only be used once per sketch

let currentLayout = LAYOUTS[0]; // default layout function

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

const REVEAL_DELAY = 0; // interval in milliseconds between revealing leaf backgrounds
const GLYPH_REVEAL_DELAY = 50; // interval in milliseconds between revealing glyphs

const CYCLE_CHANGE_MIN = 1; // minimum number of leaves refreshed in each cycle batch
const CYCLE_CHANGE_MAX = 4; // maximum number of leaves refreshed in each cycle batch
const CYCLE_STAGGER_DELAY = 500; // delay in milliseconds between each leaf's refresh within a batch
const CYCLE_WITHIN_LEAF_DELAY = 150; // delay in milliseconds between a leaf's background change and its glyph change
const CYCLE_INTERVAL = 2500; // pause in milliseconds after a batch finishes before the next one is scheduled

const REFRESH_INTERVAL = 10 * 6 * 1000; //  interval in milliseconds between automatic refreshes of the entire tree

const LOADING_HOLD = 400;
const RENDER_START_DELAY = 200; // duration of the fade-out of the loading screen after assets have loaded

// ---------- STATE: changes while the sketch runs ----------

let zones = []; // array to hold the zone regions
let leaves = []; // array to hold the leaf regions

let revealedCount = 0; // number of leaf backgrounds revealed so far
let lastRevealTime = null; // timestamp of the last revealed leaf background

let glyphRevealCount = 0; // number of glyphs revealed so far
let lastGlyphRevealTime = null; // timestamp of the last revealed glyph

let nextCycleTime = 0; // timestamp at which the next cycle batch should be scheduled
let nextRefreshTime = Infinity; // timestamp at which the next automatic refresh should occur

let sheetImages = {}; // sheetImages[sheetName] = the loaded image for that sheet
let sketchReady = false; // false until loading and preparation are both finished
let loadFinishedTime = null; // timestamp when the loading finished, used to hold the loading screen for a minimum time
let revealStartTime = null; // timestamp at which the leaf reveal is allowed to begin

let inkBuffer;



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
          
            this.glyph = this.pickGlyph(); //pick a glyph for the leaf region

            if (this.glyph) {
                this.rectCol = color(random(this.rules.palette)); //assign a random color from the palette to the leaf region
            } else {
                this.rectCol = color(this.rules.blank); //assign a blank color to the leaf region if no glyph is available
                this.acceptGlyph = false; //mark the leaf region as not accepting glyphs
            }

            return; //exit the function after assigning the color and glyph

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
        if (!this.glyph){
            return; //do nothing if there is no glyph assigned to the region
        }

        if (this.orientation === 'square') {
            drawGlyph(this.glyph, this.x, this.y, this.w, this.h, this.rules.ink); //draw the glyph in the region with the specified ink color
            return; //exit the function after drawing the glyph
        }

        // 
        const n = this.aspectClass;
        const tileW = this.orientation === 'wide' ? this.w / n : this.w;
        const tileH = this.orientation === 'tall' ? this.h / n : this.h;

        // Non-square: repeat the texture aspectClass times along the long side
        for (let i = 0; i < n; i++) {
            const tx = this.x + (this.orientation === 'wide' ? i * tileW : 0);
            const ty = this.y + (this.orientation === 'tall' ? i * tileH : 0);
            drawGlyph(this.glyph, tx, ty, tileW, tileH, this.rules.ink); //draw the glyph in each tile of the region with the specified ink color
        }

    }

    assignRandomGlyph() {
        const g = this.pickGlyph();
        if (g) {
            this.glyph = g;
        }
    }

    pickGlyph() {
        let pool;
        if (this.orientation === 'square') {
            const poolName = this.h < SMALL_MAX_PX ? 'small' : 'large';
            pool = glyphsforPool(poolName);
        } else {
            pool = tileGlyphs();
        }
        return pool.length > 0 ? random(pool) : null; //return a random glyph from the pool, or null if the pool is empty
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

function setup() {
    angleMode(DEGREES);
    createCanvas(windowWidth, windowHeight);
    inkBuffer = createGraphics(256, 256); // create a small off-screen graphics buffer for recoloring glyphs
    background(30);

    checkCatalogue(); // check if the catalogue is available and load it if necessary


    const items = Object.keys(SHEETS).map(name => ({
        key: name,
        path: `assets/${name}.webp`
    }));

    loadAll(items).then(images => {
        sheetImages = images;
        console.log('sheets loaded:', Object.keys(sheetImages).length);
        for (const name in images) {
            checkSheetImage(name, images[name]);
        }
        if (loader.ready) {
            loadFinishedTime = millis();
        }
    });
}

function draw() {
    
    if (!sketchReady) {
        drawLoadingScreen();
        if (loadFinishedTime !== null && millis() - loadFinishedTime >= LOADING_HOLD) {
            prepareSketch();
            sketchReady = true;
            revealStartTime = millis() + RENDER_START_DELAY; // set the time at which the leaf reveal is allowed to begin
        }
        return;
    }

    if (millis() < revealStartTime) {
        background(30);
        return; // hold the loading screen for a minimum time before starting the reveal
    }

    // Window Resizing
    if (resizePending && millis() - resizeTimer > 200) {
        onResize();
        resizePending = false;
    }

    if (millis() >= nextRefreshTime) {
        refreshWithNewLayout();
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

// Loading function
function drawLoadingScreen() {
    background(30);

    const progress = loader.total > 0 ? loader.done / loader.total : 0;

    // Text
    fill(230);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text('Loading assets...', width / 2, height / 2 - 20);

    // Progress bar
    const barWidth = min(width * 0.5, 400);
    const barHeight = 6;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 + 10;
    
    noFill();
    stroke(230);
    strokeWeight(1);
    rect(barX, barY, barWidth, barHeight);

    noStroke();
    fill(230);
    rect(barX, barY, barWidth * progress, barHeight);
}

// ---

function prepareSketch() {
    buildZones();
}

function drawGlyph(glyph, x, y, w, h, inkColour) {
    const r = glyphRect(glyph);
    const img = sheetImages[glyph.sheet];

    // Draw the glyph onto the off-screen buffer with the specified dimensions
    const bw = round(w);
    const bh = round(h);

    if (inkBuffer.width !== bw || inkBuffer.height !== bh) {
        inkBuffer.resizeCanvas(bw, bh);
    }

    inkBuffer.drawingContext.clearRect(0, 0, inkBuffer.width, inkBuffer.height);

    // 1. Draw the glyph onto the off-screen buffer
    inkBuffer.image(img, 0, 0, bw, bh, r.x, r.y, r.w, r.h);

    // 2. keep the alpha channel and recolor the glyph
    inkBuffer.drawingContext.globalCompositeOperation = 'source-in';
    inkBuffer.noStroke();
    inkBuffer.fill(inkColour);
    inkBuffer.rect(0, 0, bw, bh);

    // 3. Draw the recolored glyph from the off-screen buffer onto the main canvas
    inkBuffer.drawingContext.globalCompositeOperation = 'source-over';

    // 4. Draw the recolored glyph onto the main canvas
    image(inkBuffer, x, y, w, h);
}


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

    zones = [];
    for (const z of currentLayout(totalRows)) {
        zones.push(new Zone(z.col, z.row, z.cols, z.rows, z.rules));
    }

    leaves = []; //clear the leaves array
    for (const zone of zones) {
        zone.collectLeaves(leaves); //collect all the leaf regions in each zone and store them in the leaves array
    }
    
    nextRefreshTime = millis() + REFRESH_INTERVAL; // schedule the next automatic refresh
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


function refreshWithNewLayout() {
    currentLayout = random(LAYOUTS);
    rebuildTree();
}

function keyPressed() {

    if (!sketchReady) return;

    if (key === '1') {
        currentLayout = layoutThreeColumns;
        rebuildTree();
    }

    if (key === '2') {
        currentLayout = layoutStacked;
        rebuildTree();
    }

    if (key === '3') {
        currentLayout = layoutMixed;
        rebuildTree();
    }

    if (key === 's') {
      saveCanvas("canvas", "png");
    } 

    if (key === 'r') {
        rebuildTree();
    }

    if (key === 't') {
        const g = random(GLYPH_CATALOGUE);
        drawGlyph(g, mouseX, mouseY, 200, 200,random(INK));
        console.log(g.name, g.sheet, g.tags);
    }
    
    if (key === 'n') {
        const rows = [];
        for (const leaf of leaves) {
            if (leaf.unitsW === leaf.unitsH) continue; // exactly square, never stretched
            const ratio = max(leaf.unitsW, leaf.unitsH) / min(leaf.unitsW, leaf.unitsH);
            rows.push({
                units: leaf.unitsW + ' x ' + leaf.unitsH,
                ratio: round(ratio * 100) / 100,
                aspectClass: leaf.aspectClass,
                stretch: round(ratio / leaf.aspectClass * 100) / 100,
                depth: leaf.depth,
                maxDepth: leaf.rules.maxDepth
            });
        }
        rows.sort((a, b) => abs(b.stretch - 1) - abs(a.stretch - 1));
        console.log(rows.length + ' non-square leaves');
        console.table(rows.slice(0, 15));
    }

}


// Window Resizing
function onResize() {
  rebuildTree();
}
