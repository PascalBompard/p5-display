# Recursive grid

A generative p5.js sketch that fills the window with a mosaic of hand-drawn glyphs. The window is divided into zones, each zone is recursively subdivided into rectangles on a shared unit grid, and every rectangle receives a background colour and a glyph drawn in an ink colour. The mosaic is revealed leaf by leaf, then slowly changes itself, and periodically rebuilds with a new layout.

## Running it

The sketch loads image files, so it needs to be served over HTTP rather than opened directly from the file system. Use a local development server (for example the Live Server extension in VS Code), then open the page it serves.

## Controls

| Input | Action |
|---|---|
| Click a leaf | Reassigns that leaf's background and glyph (once the reveal has finished) |
| `1` / `2` / `3` | Rebuild using the three-column, stacked or mixed layout |
| `r` | Rebuild with the current layout |
| `s` | Save the canvas as a PNG |
| `t` | Debug: draw a random catalogue glyph at the mouse position |
| `n` | Debug: log the most stretched non-square leaves to the console |

The sketch also rebuilds itself with a random layout every `REFRESH_INTERVAL`, and rebuilds once the window has stopped being resized.

## Files

- `sketch.js`: the sketch itself (this document describes it).
- `glyph-catalogue.js`: the glyph data (`SHEETS`, `TAG_VOCAB`, `GLYPH_CATALOGUE`) and the functions that look glyphs up and validate the catalogue.
- A loader file providing `loadAll()` and the `loader` progress object.
- `assets/`: the glyph sprite sheet images (`.webp`).

## How it works

### The big picture

1. The window is divided into **zones**, laid out by one of three layout functions.
2. Each zone is repeatedly split in two until a set of **stop rules** says enough. This is **recursive subdivision**.
3. The rectangles that stop splitting are **leaves**. Each leaf gets a background colour and a glyph.
4. The sketch **reveals** the leaves: all the backgrounds one by one, then all the glyphs one by one.
5. It then **cycles**: every couple of seconds a few random leaves swap their background and glyph.
6. Every `REFRESH_INTERVAL` everything is discarded and a new layout is built.

### Structure of `sketch.js`

| Section | Contents |
|---|---|
| CONFIG: appearance | Background palettes, blank colours, ink colours, the colourways that bundle them, `SMALL_MAX_PX` |
| CONFIG: grid and subdivision | `UNITS_PER_ROW`, depth and aspect limits, stop chances, and the rules objects `DEFAULT_RULES`, `COARSE_RULES`, `FINE_RULES` |
| CONFIG: layouts | Functions returning a list of zones as data, and the `LAYOUTS` array |
| CONFIG: themes, blanks, timing | Theme names, the fraction of blank leaves, every delay and interval |
| STATE | Variables that change while the sketch runs |
| CLASSES | `Region` (one rectangle in the tree) and `Zone` (a top-level rectangle owning a root Region) |
| P5 CORE FUNCTIONS | `setup()` and `draw()` |
| DRAW PHASES | The named steps `draw()` calls: `runStartUp`, `handleResize`, `handleScheduledRefresh`, `revealNextBackground`, `revealNextGlyph`, `runCycle`, `scheduleCycleBatch` |
| LOADING | `drawLoadingScreen`, `prepareSketch` |
| BUILDING | `pickThemes`, `buildZones`, `rebuildTree`, `refreshWithNewLayout`, `onResize` |
| DRAWING | `drawGlyph` |
| INPUT | `windowResized`, `findLeafAt`, `mousePressed`, `keyPressed` |

### The unit grid

`UNIT_SIZE = width / UNITS_PER_ROW`. Every split lands on a whole number of units, so edges always line up and misalignment can't cascade down the tree.

### The Region tree

A `Region` calls `this.subdivide()` in its own constructor. `subdivide()` either stops (the region is a leaf) or creates two child Regions, each of which does the same. The tree therefore builds itself as soon as the root is created. Splits run across the longer side, at a random whole number of units.

### The stop rules

`shouldStopSplitting()` checks, in this order (the first that fires wins):

1. `depth >= maxDepth`: stop (a hard backstop).
2. Aspect ratio above `maxAspect`: keep splitting.
3. Aspect ratio too far from its rounded `aspectClass`: keep splitting.
4. Region is 1 x 1 units: stop.
5. Past `minSplitDepth`: a random chance of stopping that grows with depth.
6. Otherwise: keep splitting.

### Aspect class and orientation

`aspectClass` is the long side divided by the short side, rounded. `orientation` is `square`, `wide` or `tall`. A non-square leaf tiles its glyph `aspectClass` times along the long side so the glyph is never distorted.

### Rules objects and colourways

A rules object bundles the settings for one zone. A colourway bundles the three colours that travel together: `palette`, `blank` and `ink`. Both use the spread syntax (`...`) to copy properties, and later properties override earlier ones, so `COARSE_RULES` starts from `DEFAULT_RULES` and replaces a few values. Each zone passes its rules to its root Region, and every child receives the same object.

### Layouts as data

A layout function returns a list of `{ col, row, cols, rows, rules }` objects, measured in grid units. `buildZones()` loops over that list and creates a `Zone` for each entry, merging in a randomly picked theme.

### Drawing a glyph

Glyph images are black on transparent. `drawGlyph()` draws the glyph into an off-screen buffer, switches the buffer's compositing mode to `source-in` and fills it with the ink colour (which keeps the colour only where the glyph exists), switches back to normal, and draws the buffer onto the main canvas.

### Timing and `draw()`

`draw()` is a list of named steps, in this order:

1. `runStartUp()`: returns `true` while loading or waiting to begin, so `draw()` stops for this frame.
2. `handleResize()` and `handleScheduledRefresh()`: act if their time has come, then `draw()` carries on.
3. `revealNextBackground()`: returns `true` while backgrounds are still being revealed.
4. `revealNextGlyph()`: returns `true` while glyphs are still being revealed.
5. `runCycle()`: runs once everything is revealed.

Timing uses timestamps from `millis()` compared with the current time, not frame counts. Functions that report progress must return `true` or `false` on every path: a bare `return;` gives `undefined`, which counts as false, and the phases would then run over each other without any error.

### The cycle

`runCycle()` does two jobs, both on every frame. When `nextCycleTime` arrives, `scheduleCycleBatch()` stores a future change time on a few random leaves. Every frame, each leaf's `updateCycle()` checks whether its stored time has arrived and applies the change if so. The applying loop must stay outside the scheduling `if`, otherwise changes would only be applied on the one frame a batch is scheduled.

### The life of the sketch

1. `setup()` creates the canvas and ink buffer and starts loading the sheet images (asynchronously).
2. `runStartUp()` shows the loading screen until loading finishes and `LOADING_HOLD` has passed.
3. `prepareSketch()` runs once and calls `buildZones()`, which builds every zone and tree and flattens the leaves into the `leaves` array.
4. After `RENDER_START_DELAY`, backgrounds are revealed, then glyphs.
5. `runCycle()` then loops indefinitely.
6. At `nextRefreshTime`, `refreshWithNewLayout()` calls `rebuildTree()`, which resets all counters and starts again from step 4.
7. Resizing is debounced: `windowResized()` resizes the canvas at once and sets a flag, and `handleResize()` rebuilds only after `RESIZE_SETTLE_DELAY` has passed since the last resize event.

## Gotchas

- **Order of top-level `const`s matters.** A `const` must be defined before any code that uses it at load time (for example colourways before the rules objects that spread them). Function declarations are hoisted and can appear in any order.
- **Randomness must happen at build time, not load time.** `random()` doesn't exist until p5 has started, and a top-level constant is evaluated only once. Anything random that should change on each rebuild must be decided inside a function such as `buildZones()`.
- **Assigning to a global inside a function.** Without `let` or `const` it changes the global. With them, it creates a separate local variable and the global silently stays unchanged.
- **A search for `col` is ambiguous.** It means a sprite sheet column on a glyph, a starting column on a layout zone, and nothing on a Region.
- **A missing property is not an error.** Reading a property that doesn't exist gives `undefined` without complaint, so removing a property needs a project-wide search rather than relying on the console.

## Possible next steps

- Choose colourways randomly per zone in `buildZones()` (a `COLOURWAYS` array and a `pickColourways()` function beside `pickThemes()`).
- Move the repeated layout key handling and the debug keys out of `keyPressed()`.
- Check `REFRESH_INTERVAL` (currently 60 seconds) is the intended value.
- Add a short comment above each `Region` method saying what it does and why.
