# How the recursive-grid sketch works

Updated 24 October 2026, after the tidy-up. This is my map. The learning step is yours: under each "In your own words" prompt, rewrite the idea in plain language, as if explaining it to a friend. Where you can't, that is a useful signal about what to revisit.

---

## 1. The big picture

The sketch fills the window with a mosaic.

1. The window is divided into **zones** (three of them, laid out by one of three layout functions).
2. Each zone is repeatedly split in two, over and over, until a set of **stop rules** says "enough". This is **recursive subdivision**.
3. The rectangles that stop splitting are **leaves**. Each leaf gets a background colour and a glyph (a hand drawn image) drawn in an ink colour.
4. The sketch **reveals** the leaves: first all the backgrounds one by one, then all the glyphs one by one.
5. After that it quietly **cycles**: every couple of seconds a few random leaves swap their background and glyph.
6. Every `REFRESH_INTERVAL` it throws everything away and builds a new layout.

**In your own words:**

---

## 2. Pieces that live outside this file

This file calls several functions and uses several variables it never defines. They live in other files.

- `glyph-catalogue.js`: `SHEETS`, `TAG_VOCAB`, `GLYPH_CATALOGUE`, `checkCatalogue()`, `glyphRect()`, `glyphsforPool()`, `tileGlyphs()`, `checkSheetImage()`.
- A loader file: `loadAll()` and the `loader` object (`loader.total`, `loader.done`, `loader.ready`).

Note that `col` appears in three unrelated places: a glyph's column in its sprite sheet, a zone's starting column in a layout, and nothing at all on a Region. A text search can't tell these apart, so always ask what object sits to the left of the dot.

---

## 3. The file, top to bottom

| Section | What it holds |
|---|---|
| CONFIG: appearance | Background palettes, blank colours, ink colours, the **colourways** that bundle them, and `SMALL_MAX_PX`. |
| CONFIG: grid and subdivision | `UNITS_PER_ROW`, depth and aspect limits, stop chances, and three **rules objects**: `DEFAULT_RULES`, `COARSE_RULES`, `FINE_RULES`. |
| CONFIG: layouts | Three functions that return a list of zones as plain data, plus the `LAYOUTS` array. |
| CONFIG: themes, blanks, timing | Theme names, the fraction of blank leaves, and every delay and interval, including `RESIZE_SETTLE_DELAY`. |
| STATE | Variables that change while the sketch runs: zones, the flat list of leaves, counters and timestamps for each phase, and the resize flags. |
| CLASSES | `Region` (one rectangle in the tree) and `Zone` (a top level rectangle that owns a root Region). |
| P5 CORE FUNCTIONS | `setup()` and `draw()`. |
| DRAW PHASES | The named steps that `draw()` calls: `runStartUp`, `handleResize`, `handleScheduledRefresh`, `revealNextBackground`, `revealNextGlyph`, `runCycle`, `scheduleCycleBatch`. |
| LOADING | `drawLoadingScreen`, `prepareSketch`. |
| BUILDING | `pickThemes`, `buildZones`, `rebuildTree`, `refreshWithNewLayout`, `onResize`. |
| DRAWING | `drawGlyph`. |
| INPUT | `windowResized`, `findLeafAt`, `mousePressed`, `keyPressed`. |

---

## 4. The core ideas

### 4.1 The unit grid

`UNIT_SIZE = width / UNITS_PER_ROW`. Every split lands on a whole number of units, so edges always line up and misalignment can't cascade down the tree. `totalRows` is how many units fit in the window height (rounded up).

**In your own words:**

### 4.2 The Region tree and recursion

A `Region` calls `this.subdivide()` inside its own constructor. `subdivide()` either stops (this region is a leaf) or creates **two child Regions**, and each of those does the same thing in its own constructor. That is the recursion: the tree builds itself the moment the root is created.

- It splits across the longer side (`w >= h` means a vertical split).
- The split position is a random whole number of units.
- Children get `depth + 1` and the same `rules`.

**In your own words:**

### 4.3 The stop rules (`shouldStopSplitting`)

The order matters. Each check can return early, so the first one that fires wins.

1. `depth >= maxDepth`: stop. A hard backstop so recursion can never run away.
2. Aspect ratio above `maxAspect`: keep splitting (too stretched).
3. Aspect ratio too far from its rounded `aspectClass`: keep splitting (not a clean ratio).
4. Region is 1 x 1 units: stop (can't divide further).
5. Past `minSplitDepth`: a random chance of stopping that grows with depth.
6. Otherwise: keep splitting.

**In your own words:**

### 4.4 aspectClass and orientation

`aspectClass` is the long side divided by the short side, rounded. A 3 x 1 leaf is class 3. `orientation` is `square`, `wide` or `tall`. A non-square leaf draws its glyph **tiled** `aspectClass` times along the long side (see `renderGlyph()`), so the glyph stays undistorted.

**In your own words:**

### 4.5 Rules objects and colourways

A rules object is a bundle of settings for one zone: depth limits, stop chances, and colours. A **colourway** is a smaller bundle of the three colours that always travel together: `palette`, `blank` and `ink`. Each is named once (for example `COLOURWAY_SAGE`), so the pairing is visible in the code instead of living in your head.

Both use the spread syntax (`...`), which copies properties from one object into another. Later properties override earlier ones, which is how `COARSE_RULES` starts from `DEFAULT_RULES` and then replaces a few values. `buildZones()` spreads in a `theme` in the same way.

Each zone passes its rules to its root Region, and every child receives the same object. That is how different zones get different character.

**In your own words:**

### 4.6 Layouts as data

A layout function does not draw anything. It returns a list like `{ col, row, cols, rows, rules }`, one per zone, measured in grid units, with some randomness in the sizes. `buildZones()` loops over that list and turns each entry into a real `Zone`. `currentLayout` holds whichever layout function is active.

**In your own words:**

### 4.7 Drawing a glyph (`drawGlyph`)

The glyph images are black on transparent. To draw one in an ink colour:

1. Draw the glyph into a small off-screen canvas (`inkBuffer`), scaled to the target size.
2. Switch the buffer's compositing mode to `'source-in'`, then fill a rectangle in the ink colour. `source-in` keeps the new colour only where something already exists, so the glyph's shape survives and its colour changes.
3. Switch the mode back to `'source-over'` (normal drawing).
4. Draw the buffer onto the main canvas.

**In your own words:**

### 4.8 Timing and `draw()` as a list of phases

`draw()` runs about 60 times a second, but the sketch only wants to do things at certain moments. So it stores **timestamps** from `millis()` and compares them with the current time.

`draw()` is now a short list of named steps, in this order:

1. `runStartUp()` returns `true` while loading or waiting to begin, so `draw()` stops for this frame.
2. `handleResize()` and `handleScheduledRefresh()` act if their time has come, then `draw()` carries on.
3. `revealNextBackground()` returns `true` while backgrounds are still being revealed.
4. `revealNextGlyph()` returns `true` while glyphs are still being revealed.
5. `runCycle()` runs once everything is revealed.

Functions that **report** (the first, third and fourth) return `true` or `false`. A bare `return;` would give `undefined`, which counts as false, and the phases would run over each other with no error message. Functions that **act** return nothing.

**In your own words:**

### 4.9 The cycle: two jobs at two rhythms

`runCycle()` does two things, and both must run on every frame.

- **Scheduling:** when `nextCycleTime` arrives, `scheduleCycleBatch()` picks a few leaves and stores a *future* change time on each.
- **Applying:** every frame, each leaf's `updateCycle()` checks whether its stored time has arrived, and if so changes it.

If the applying loop sat inside the scheduling `if`, it would only run for one frame every few seconds, and the staggered changes would arrive late and bunched together.

**In your own words:**

---

## 5. The life of the sketch, in order

1. `setup()` makes the canvas, the ink buffer, and starts loading every sheet image. This is asynchronous: `setup()` finishes before the images arrive.
2. `draw()` calls `runStartUp()`, which shows the loading screen until the images arrive and `LOADING_HOLD` has passed.
3. `prepareSketch()` runs once, calling `buildZones()`. This builds all zones, trees, themes and blanks, and flattens every leaf into the `leaves` array.
4. After `RENDER_START_DELAY`, `revealNextBackground()` reveals one leaf background per step.
5. When that finishes, `revealNextGlyph()` reveals one glyph per step.
6. When that finishes, `runCycle()` loops, scheduling small batches of random changes and applying them as their times arrive.
7. At `nextRefreshTime`, `refreshWithNewLayout()` picks a random layout and calls `rebuildTree()`, which resets all counters, so we are back at step 4.
8. Window resize, a key press (`1`, `2`, `3`, `r`) or a click can also interrupt this flow. Resizing is **debounced**: `windowResized()` resizes the canvas immediately and sets a flag, but `handleResize()` only rebuilds once `RESIZE_SETTLE_DELAY` has passed since the last resize event.

**In your own words:**

---

## 6. The tricky parts, ranked

1. **The order and return values in `draw()`.** The order of the calls is the logic, and each reporting function must return `true` or `false` on every path.
2. **Recursion started from a constructor** (4.2). Hard to see because nothing visibly "calls" the children.
3. **`shouldStopSplitting()` ordering** (4.3). Reordering the checks would change behaviour.
4. **`drawGlyph()` compositing** (4.7). Mode switching is invisible state on the buffer.
5. **Cycle scheduling** (4.9). `bgChangeTime` and `glyphChangeTime` are `null` when nothing is pending, a timestamp when something is.
6. **Globals inside functions.** Assigning to a global name inside a function changes the global. Adding `let` or `const` creates a separate local copy, and the global silently stays unchanged.

---

## 7. Tidy-up log

**Done**

- Standardised section headings and grouped functions by job.
- Split `draw()` into named phase functions.
- Bundled palette, blank and ink into named colourways.
- Named `RESIZE_SETTLE_DELAY` and corrected misleading comments.
- Removed the old glyph pool code (`poolFor`, `getInkedSet`, `recolourGlyph`, `inkedSets`, `glyphSheets`, `GLYPH_CONFIG`, `glyphSet`) and unused `ALL_RULES`, after confirming by search that nothing used them.

**Possible next steps**

- A `COLOURWAYS` array and a `pickColourways()` function beside `pickThemes()`, so colourways vary on each rebuild. This changes behaviour, so it counts as a new feature. The choice must be made inside `buildZones()`, not in a top level constant, because `random()` doesn't exist yet when the file first loads and the choice would only happen once.
- `keyPressed()` repeats two lines for each layout key and holds two debug tools (`t` and `n`) that could move into their own function.
- Check `REFRESH_INTERVAL`: it is currently 60 seconds, but earlier notes mention five minutes.
- Add a short comment above each function in `Region` saying *what* it does and *why*.
