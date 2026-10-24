// ---------- CONFIG: appearance ----------

const PALETTE_1 = [
    '#eceeec',
    '#f2f3f2',
    '#f6f9ef'
];
const PALETTE_2 = [
    '#f8f9fa',
    '#f4f7f9',
    '#f3f8f9'
];
const PALETTE_3 = [
    '#f2efed',
    '#f6f1ed',
    '#f3f1ef',
];    
const BLANK = [
    '#f2f3f2',
    '#eef4f8',
    '#f3f1ef'
];
const INK = [
    '#b2c6bc',
    '#566498',
    '#6d5a71',
    '#ed553a'   
];

// A colourway bundles the colours that always travel together in one zone.
const COLOURWAY_RED = {palette: PALETTE_1, blank: BLANK[0], ink: INK[3]};
const COLOURWAY_SAGE = {palette: PALETTE_2, blank: BLANK[1], ink: INK[0]};
const COLOURWAY_PLUM = {palette: PALETTE_3, blank: BLANK[2], ink: INK[2]};

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
    ...COLOURWAY_RED
};
const COARSE_RULES = {
    ...DEFAULT_RULES, 
    maxDepth: 3,
    minSplitDepth: 4, 
    stopChanceBase: 0.2, 
    ...COLOURWAY_SAGE
};
const FINE_RULES = {
    ...DEFAULT_RULES, 
    minSplitDepth: 8, 
    maxDepth: 12, 
    stopChanceBase: 0.01, 
    stopChanceStep: 0.03, 
    ...COLOURWAY_PLUM    
};

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
let currentLayout = LAYOUTS[0]; // default layout function

// ---------- CONFIG: themes ----------

const THEME_NAMES = ['body', 'botanical', 'symbols'];
const ALLOW_REPEAT_THEMES = false; // if false, each theme can only be used once per sketch

// ---------- CONFIG: blank leaves ----------

const BLANK_MIN = 0.2 
const BLANK_MAX = 0.5


// ---------- CONFIG: timing ----------

const REVEAL_DELAY = 0; // interval in milliseconds between revealing leaf backgrounds
const GLYPH_REVEAL_DELAY = 50; // interval in milliseconds between revealing glyphs

const CYCLE_CHANGE_MIN = 1; // minimum number of leaves refreshed in each cycle batch
const CYCLE_CHANGE_MAX = 4; // maximum number of leaves refreshed in each cycle batch
const CYCLE_STAGGER_DELAY = 500; // delay in milliseconds between each leaf's refresh within a batch
const CYCLE_WITHIN_LEAF_DELAY = 150; // delay in milliseconds between a leaf's background change and its glyph change
const CYCLE_INTERVAL = 2500; // pause in milliseconds after a batch finishes before the next one is scheduled

const REFRESH_INTERVAL = 5 * 60 * 1000; // time period between automatic refreshes of the entire tree

const LOADING_HOLD = 400; // minimum time in milliseconds to keep the loading screen visible after assets have loaded
const RENDER_START_DELAY = 200; // pause in milliseconds after loading finishes before the leaf reveal begins

const RESIZE_SETTLE_DELAY = 200; // milliseconds to wait after the last resize event before rebuilding


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

let resizeTimer = 0; // timestamp of the most recent window resize event
let resizePending = false; // true while we wait for resizing to settle before rebuilding



// ---------- CLASSES ----------

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
        const g = this.pickRelatedGlyph();
        if (g) {
            this.glyph = g;
        }
    }

    makeBlank() {
        this.glyph = null;
        this.rectCol = color(this.rules.blank);
        this.acceptGlyph = false;
    }

    candidatePool() {
        if (this.orientation === 'square') {
            const poolName = this.h < SMALL_MAX_PX ? 'small' : 'large';
            return  glyphsforPool(poolName, this.rules.theme);
        }
        return tileGlyphs();
    }

    pickGlyph() {
        const pool = this.candidatePool();
        return pool.length > 0 ? random(pool) : null;
    }

    pickRelatedGlyph() {
        if (!this.glyph) {
            return this.pickGlyph(); 
        }

        const others = this.candidatePool().filter(g => g !== this.glyph);
        const related = others.filter(g => g.tags.some(t => this.glyph.tags.includes(t)));
        
        if (related.length > 0) {
            return random(related);
        }
        
        if (others.length > 0) {
            return random(others);            
        }
        
        return  this.glyph;
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
        this.applyBlanks();
    }

    applyBlanks() {
        const zoneLeaves = [];
        this.collectLeaves(zoneLeaves);

        const fraction = random(BLANK_MIN,BLANK_MAX);
        const count = round(zoneLeaves.length * fraction);

        const chosen = shuffle(zoneLeaves).slice(0,count);
        for (const leaf of chosen) {
            leaf.makeBlank();            
        }
    }
    
    
    collectLeaves(list) {
        this.root.collectLeaves(list);
    }
}


// ---------- P5 CORE FUNCTIONS ----------

function setup() {
    angleMode(DEGREES);
    createCanvas(windowWidth, windowHeight);
    inkBuffer = createGraphics(256, 256); // create a small off-screen graphics buffer for recoloring glyphs
    background(230);

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
    
    if (runStartUp()) {
        return; // still loading, or waiting for the reveal to start
    }

    handleResize();
    handleScheduledRefresh();

    if (revealNextBackground()) {
        return; // backgrounds still being revealed
    }

    if (revealNextGlyph()) {
        return; // glyphs still being revealed
    }
    
    runCycle();

}

// ---------- DRAW PHASES ----------

// Start-up: shows the loading screen until assets have loaded and the hold time has passed,
// then builds the sketch and waits briefly before the reveal begins.
// Returns true while start-up is still in progress, false once the reveal can run.
function runStartUp() {
    if (!sketchReady) {
        drawLoadingScreen();
        if (loadFinishedTime !== null && millis() - loadFinishedTime >= LOADING_HOLD) {
            prepareSketch();
            sketchReady = true;
            revealStartTime = millis() + RENDER_START_DELAY;
        }
        return true; // still loading
    }

    if (millis() < revealStartTime) {
        background(30); // same dark colour as the loading screen, so the pause looks seamless
        return true; // built, but waiting for the reveal to start
    }

    return false; // start-up is complete
}

// Rebuilds the sketch once window resizing has settled.
// windowResized() sets the flag and timestamp; this does the delayed rebuild.
function handleResize() {
    if (resizePending && millis() - resizeTimer > RESIZE_SETTLE_DELAY) {
        onResize();
        resizePending = false;
    }
}

// Starts a fresh random layout when the scheduled refresh time arrives.
function handleScheduledRefresh() {
    if (millis() >= nextRefreshTime) {
        refreshWithNewLayout();
    }
}

// Phase A: reveals one leaf background at a time.
// Returns true while there are still backgrounds to reveal, false once finished.
function revealNextBackground() {
    if (revealedCount >= leaves.length) {
        return false; // this phase is finished
    }

    if (lastRevealTime === null || millis() - lastRevealTime >= REVEAL_DELAY) {
        revealedCount++;
        lastRevealTime = millis();
        leaves[revealedCount - 1].renderBackground();
    }

    return true; // still in progress, so draw() should stop here for this frame
}

// Phase B: reveals one glyph at a time.
// Returns true while there are still glyphs to reveal, false once finished.
function revealNextGlyph() {
    if (glyphRevealCount >= leaves.length) {
        return false; // this phase is finished
    }

    if (lastGlyphRevealTime === null || millis() - lastGlyphRevealTime >= GLYPH_REVEAL_DELAY) {
        glyphRevealCount++;
        lastGlyphRevealTime = millis();
        leaves[glyphRevealCount - 1].renderGlyph();
    }

    return true; // still in progress, so draw() should stop here for this frame
}

// Ongoing refresh of random leaves once the reveal is complete.
// Two separate jobs, and both must run on every frame:
//   1. When the interval has passed, schedule a new batch of changes for the near future.
//   2. Check every leaf, so each change is applied the moment its scheduled time arrives.
function runCycle() {
    if (millis() >= nextCycleTime) {
        scheduleCycleBatch();
    }

    for (const leaf of leaves) {
        leaf.updateCycle();
    }
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



// ---------- LOADING ----------

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

function prepareSketch() {
    buildZones();
}

// ---------- BUILDING ----------

function pickThemes(count) {
    const themes = [];
    
    if (ALLOW_REPEAT_THEMES) {
        for (let i = 0; i < count; i++) {
            themes.push(random(THEME_NAMES));
        }
        return themes;
    }

    return shuffle(THEME_NAMES).slice(0, count); // pick a random subset of themes without repetition
}

function buildZones() {
    UNIT_SIZE = width / UNITS_PER_ROW; //recalculate the size of each unit based on the canvas width and the number of units per row
    const totalRows = ceil(height / UNIT_SIZE); //calculate the number of units that can fit in the height of the canvas

    zones = [];
    const layout = currentLayout(totalRows); //get the current layout function and call it with the total number of rows
    const themes = pickThemes(layout.length); //pick a random theme for each zone in the layout

    for (let i = 0; i < layout.length; i++) {
        const z = layout[i];
        const rules = { ...z.rules, theme: themes[i] }; //merge the rules from the layout with the randomly picked theme
        zones.push(new Zone(z.col, z.row, z.cols, z.rows, rules)); //create a new Zone object for each zone in the layout and add it to the zones array
    } 

    console.log('zone themes:', themes.join(', '));



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

function refreshWithNewLayout() {
    currentLayout = random(LAYOUTS);
    rebuildTree();
}

function onResize() {
  rebuildTree();
}


// ---------- DRAWING ----------


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



// ---------- INPUT ----------

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    resizeTimer = millis();
    resizePending = true;
}

function findLeafAt(px,py) {
    for (const leaf of leaves) {
        if (px >= leaf.x && px < leaf.x + leaf.w && py >= leaf.y && py < leaf.y + leaf.h) {
            return leaf;
        }
    }
    return null; //return null if no leaf is found at the given coordinates
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
