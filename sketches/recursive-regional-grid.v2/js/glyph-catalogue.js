// glyph-catalogue.js
// Load this BEFORE sketch.js in index.html:
//   <script src="glyph-catalogue.js"></script>
//   <script src="sketch.js"></script>
//
// Three things live here:
//   SHEETS           size and grid of every sprite sheet
//   GLYPH_CATALOGUE  one entry per glyph: name, tags, sheet, col, row
//   TAG_VOCAB        the fixed list of allowed tags
//
// col and row count from 0, across then down. Pixel position of a glyph's cell:
//   x = col * cellW,  y = row * cellH
// Rule for tags: first tag is the category (body, botanic, domestic,
// architecture or time), then 2 to 4 more. 3 to 5 tags per glyph.
// Eye glyphs in eyes_1 also carry 'sequence' and 'frame' for the blink animation.

const SHEETS = {
  domestic_1:     { cols: 3, rows: 2, cellW: 1024, cellH: 1024 },
  domestic_2:     { cols: 3, rows: 2, cellW: 1024, cellH: 1024 },
  domestic_4:     { cols: 4, rows: 2, cellW: 768 , cellH: 1024 },
  architecture_1: { cols: 3, rows: 2, cellW: 1024, cellH: 512  },
  body_1:         { cols: 4, rows: 2, cellW: 768 , cellH: 1024 },
  body_2:         { cols: 3, rows: 2, cellW: 1024, cellH: 1024 },
  body_3:         { cols: 3, rows: 2, cellW: 1024, cellH: 1024 },
  plants_1:       { cols: 3, rows: 2, cellW: 1024, cellH: 768  },
  plants_2:       { cols: 4, rows: 2, cellW: 768 , cellH: 1024 },
  plants_3:       { cols: 3, rows: 2, cellW: 1024, cellH: 1024 },
  plants_4:       { cols: 3, rows: 2, cellW: 1024, cellH: 1024 },
  time_1:         { cols: 3, rows: 2, cellW: 1024, cellH: 1024 },
  time_2:         { cols: 4, rows: 2, cellW: 768 , cellH: 1024 },
  time_3:         { cols: 3, rows: 2, cellW: 1024, cellH: 512  },
  eyes_1:         { cols: 4, rows: 4, cellW: 768 , cellH: 512  },
  eyes_2:         { cols: 3, rows: 4, cellW: 1024, cellH: 512  },
};

const TAG_VOCAB = [
  'ageing', 'architecture', 'body', 'bones', 'botanic', 'brick', 'build', 'care', 'carry',
  'clean', 'clothing', 'communicate', 'contain', 'cut', 'cycle', 'day', 'death', 'decay',
  'domestic', 'earth', 'face', 'flower', 'food', 'fragility', 'fruit', 'furniture', 'glass',
  'growth', 'hand', 'human', 'identity', 'labour', 'leaf', 'life', 'limb', 'lock', 'love',
  'measure', 'memory', 'metal', 'move', 'open', 'order', 'organ', 'pattern', 'power',
  'protection', 'record', 'rest', 'rhythm', 'season', 'seed', 'sight', 'structure',
  'tableware', 'threshold', 'time', 'tool', 'transformation', 'tree', 'vessel', 'water',
  'wood',
];

const GLYPH_CATALOGUE = [
  // domestic_1
  { name: 'cup_1'              , tags: ['domestic', 'vessel', 'tableware', 'contain', 'rest'], sheet: 'domestic_1', col: 0, row: 0 },
  { name: 'picture_frame_1'    , tags: ['domestic', 'memory', 'contain', 'glass', 'sight'], sheet: 'domestic_1', col: 1, row: 0 },
  { name: 'kettle_1'           , tags: ['domestic', 'water', 'rest'], sheet: 'domestic_1', col: 2, row: 0 },
  { name: 'teapot_1'           , tags: ['domestic', 'vessel', 'tableware', 'water', 'care'], sheet: 'domestic_1', col: 0, row: 1 },
  { name: 'padlock_1'          , tags: ['domestic', 'protection', 'lock', 'metal', 'open'], sheet: 'domestic_1', col: 1, row: 1 },
  { name: 'utensils_1'         , tags: ['domestic', 'tableware', 'tool', 'food', 'metal'], sheet: 'domestic_1', col: 2, row: 1 },
  // domestic_2
  { name: 'welcome_mat_1'      , tags: ['domestic', 'threshold', 'care', 'clean'], sheet: 'domestic_2', col: 0, row: 0 },
  { name: 'keyhole_1'          , tags: ['domestic', 'lock', 'threshold', 'protection', 'sight'], sheet: 'domestic_2', col: 1, row: 0 },
  { name: 'door_handle_1'      , tags: ['domestic', 'threshold', 'open', 'metal'], sheet: 'domestic_2', col: 2, row: 0 },
  { name: 'chair_1'            , tags: ['domestic', 'furniture', 'rest', 'wood'], sheet: 'domestic_2', col: 0, row: 1 },
  { name: 'house_2'            , tags: ['domestic', 'protection', 'structure', 'rest'], sheet: 'domestic_2', col: 1, row: 1 },
  { name: 'brick_2'            , tags: ['architecture', 'build', 'brick', 'structure'], sheet: 'domestic_2', col: 2, row: 1 },
  // domestic_4
  { name: 'gate_1'             , tags: ['architecture', 'threshold', 'protection', 'wood', 'open'], sheet: 'domestic_4', col: 0, row: 0 },
  { name: 'rake_1'             , tags: ['domestic', 'tool', 'labour', 'earth', 'care'], sheet: 'domestic_4', col: 1, row: 0 },
  { name: 'window_1'           , tags: ['architecture', 'threshold', 'glass', 'structure', 'sight'], sheet: 'domestic_4', col: 2, row: 0 },
  { name: 'bucket_1'           , tags: ['domestic', 'vessel', 'carry', 'contain', 'water'], sheet: 'domestic_4', col: 3, row: 0 },
  { name: 'door_1'             , tags: ['architecture', 'threshold', 'protection', 'lock', 'open'], sheet: 'domestic_4', col: 0, row: 1 },
  { name: 'ladder_1'           , tags: ['architecture', 'tool', 'build', 'wood', 'labour'], sheet: 'domestic_4', col: 1, row: 1 },
  { name: 'stool_1'            , tags: ['domestic', 'furniture', 'rest', 'wood'], sheet: 'domestic_4', col: 2, row: 1 },
  { name: 'goblet_1'           , tags: ['domestic', 'vessel', 'tableware', 'contain', 'fragility'], sheet: 'domestic_4', col: 3, row: 1 },
  // architecture_1
  { name: 'house_1'            , tags: ['architecture', 'protection', 'structure', 'build'], sheet: 'architecture_1', col: 0, row: 0 },
  { name: 'level_1'            , tags: ['architecture', 'tool', 'measure', 'order', 'build'], sheet: 'architecture_1', col: 1, row: 0 },
  { name: 'brick_1'            , tags: ['architecture', 'build', 'brick', 'structure'], sheet: 'architecture_1', col: 2, row: 0 },
  { name: 'spade_1'            , tags: ['architecture', 'tool', 'earth', 'labour'], sheet: 'architecture_1', col: 0, row: 1 },
  { name: 'saw_1'              , tags: ['architecture', 'tool', 'cut', 'build', 'labour'], sheet: 'architecture_1', col: 1, row: 1 },
  { name: 'factory_1'          , tags: ['architecture', 'structure', 'labour', 'power'], sheet: 'architecture_1', col: 2, row: 1 },
  // body_1
  { name: 'woman_1'            , tags: ['body', 'human', 'life'], sheet: 'body_1', col: 0, row: 0 },
  { name: 'man_1'              , tags: ['body', 'human', 'life'], sheet: 'body_1', col: 1, row: 0 },
  { name: 'skeleton_1'         , tags: ['body', 'human', 'bones', 'death'], sheet: 'body_1', col: 2, row: 0 },
  { name: 'hand_1'             , tags: ['body', 'hand', 'bones', 'death', 'communicate'], sheet: 'body_1', col: 3, row: 0 },
  { name: 'man_2'              , tags: ['body', 'human', 'life', 'clothing', 'move'], sheet: 'body_1', col: 0, row: 1 },
  { name: 'woman_2'            , tags: ['body', 'human', 'life', 'clothing'], sheet: 'body_1', col: 1, row: 1 },
  { name: 'arm_1'              , tags: ['body', 'human', 'hand', 'limb', 'life'], sheet: 'body_1', col: 2, row: 1 },
  { name: 'leg_1'              , tags: ['body', 'human', 'bones', 'limb', 'death'], sheet: 'body_1', col: 3, row: 1 },
  // body_2
  { name: 'fingerprint_1'      , tags: ['body', 'hand', 'pattern', 'identity'], sheet: 'body_2', col: 0, row: 0 },
  { name: 'hand_2'             , tags: ['body', 'hand', 'human', 'life', 'communicate'], sheet: 'body_2', col: 1, row: 0 },
  { name: 'skull_1'            , tags: ['body', 'human', 'bones', 'death', 'face'], sheet: 'body_2', col: 2, row: 0 },
  { name: 'heart_1'            , tags: ['body', 'organ', 'life', 'rhythm'], sheet: 'body_2', col: 0, row: 1 },
  { name: 'tooth_1'            , tags: ['body', 'bones', 'food', 'decay'], sheet: 'body_2', col: 1, row: 1 },
  { name: 'heart_2'            , tags: ['body', 'love', 'care', 'life'], sheet: 'body_2', col: 2, row: 1 },
  // body_3
  { name: 'lungs_1'            , tags: ['body', 'organ', 'life', 'rhythm'], sheet: 'body_3', col: 0, row: 0 },
  { name: 'brain_1'            , tags: ['body', 'organ', 'memory', 'order'], sheet: 'body_3', col: 1, row: 0 },
  { name: 'brain_2'            , tags: ['body', 'organ', 'memory', 'pattern'], sheet: 'body_3', col: 2, row: 0 },
  { name: 'pelvis_1'           , tags: ['body', 'bones', 'human', 'structure'], sheet: 'body_3', col: 0, row: 1 },
  { name: 'kidneys_1'          , tags: ['body', 'organ', 'water', 'clean', 'life'], sheet: 'body_3', col: 1, row: 1 },
  { name: 'stomach_1'          , tags: ['body', 'organ', 'food', 'contain', 'transformation'], sheet: 'body_3', col: 2, row: 1 },
  // plants_1
  { name: 'trees_1'            , tags: ['botanic', 'tree', 'growth', 'pattern'], sheet: 'plants_1', col: 0, row: 0 },
  { name: 'pumpkin_1'          , tags: ['botanic', 'fruit', 'food', 'season'], sheet: 'plants_1', col: 1, row: 0 },
  { name: 'bananas_1'          , tags: ['botanic', 'fruit', 'food', 'decay'], sheet: 'plants_1', col: 2, row: 0 },
  { name: 'tree_1'             , tags: ['botanic', 'tree', 'growth', 'season'], sheet: 'plants_1', col: 0, row: 1 },
  { name: 'avocado_1'          , tags: ['botanic', 'fruit', 'food', 'seed'], sheet: 'plants_1', col: 1, row: 1 },
  { name: 'apple_1'            , tags: ['botanic', 'fruit', 'food', 'growth'], sheet: 'plants_1', col: 2, row: 1 },
  // plants_2
  { name: 'bamboo_1'           , tags: ['botanic', 'growth', 'build', 'pattern'], sheet: 'plants_2', col: 0, row: 0 },
  { name: 'wheat_1'            , tags: ['botanic', 'seed', 'food', 'season'], sheet: 'plants_2', col: 1, row: 0 },
  { name: 'leaf_1'             , tags: ['botanic', 'leaf', 'growth', 'pattern'], sheet: 'plants_2', col: 2, row: 0 },
  { name: 'cactus_1'           , tags: ['botanic', 'water', 'growth'], sheet: 'plants_2', col: 3, row: 0 },
  { name: 'tree_2'             , tags: ['botanic', 'tree', 'growth', 'life'], sheet: 'plants_2', col: 0, row: 1 },
  { name: 'tree_3'             , tags: ['botanic', 'tree', 'growth', 'cycle'], sheet: 'plants_2', col: 1, row: 1 },
  { name: 'tree_4'             , tags: ['botanic', 'tree', 'season', 'ageing'], sheet: 'plants_2', col: 2, row: 1 },
  { name: 'tulip_1'            , tags: ['botanic', 'flower', 'season', 'growth'], sheet: 'plants_2', col: 3, row: 1 },
  // plants_3
  { name: 'pear_1'             , tags: ['botanic', 'fruit', 'food', 'growth'], sheet: 'plants_3', col: 0, row: 0 },
  { name: 'poppy_1'            , tags: ['botanic', 'seed', 'ageing', 'contain', 'cycle'], sheet: 'plants_3', col: 1, row: 0 },
  { name: 'pea_pod_1'          , tags: ['botanic', 'seed', 'food', 'contain'], sheet: 'plants_3', col: 2, row: 0 },
  { name: 'dandelion_1'        , tags: ['botanic', 'seed', 'pattern', 'fragility', 'cycle'], sheet: 'plants_3', col: 0, row: 1 },
  { name: 'sunflower_1'        , tags: ['botanic', 'flower', 'seed', 'pattern', 'food'], sheet: 'plants_3', col: 1, row: 1 },
  { name: 'bulb_1'             , tags: ['botanic', 'growth', 'rest', 'cycle'], sheet: 'plants_3', col: 2, row: 1 },
  // plants_4
  { name: 'strawberry_1'       , tags: ['botanic', 'fruit', 'food', 'seed'], sheet: 'plants_4', col: 0, row: 0 },
  { name: 'mushroom_1'         , tags: ['botanic', 'decay', 'food', 'earth'], sheet: 'plants_4', col: 1, row: 0 },
  { name: 'leaf_2'             , tags: ['botanic', 'leaf', 'pattern', 'season'], sheet: 'plants_4', col: 2, row: 0 },
  { name: 'cherry_1'           , tags: ['botanic', 'fruit', 'food', 'season'], sheet: 'plants_4', col: 0, row: 1 },
  { name: 'clover_1'           , tags: ['botanic', 'leaf', 'growth', 'protection'], sheet: 'plants_4', col: 1, row: 1 },
  { name: 'flower_1'           , tags: ['botanic', 'flower', 'growth', 'pattern', 'season'], sheet: 'plants_4', col: 2, row: 1 },
  // time_1
  { name: 'tree_rings_1'       , tags: ['time', 'ageing', 'pattern', 'record', 'tree'], sheet: 'time_1', col: 0, row: 0 },
  { name: 'tally_marks_1'      , tags: ['time', 'measure', 'record', 'pattern'], sheet: 'time_1', col: 1, row: 0 },
  { name: 'clock_1'            , tags: ['time', 'measure', 'rhythm', 'day'], sheet: 'time_1', col: 2, row: 0 },
  { name: 'calendar_1'         , tags: ['time', 'measure', 'day', 'season', 'order'], sheet: 'time_1', col: 0, row: 1 },
  { name: 'diary_1'            , tags: ['time', 'memory', 'record', 'day', 'communicate'], sheet: 'time_1', col: 1, row: 1 },
  { name: 'polaroid_1'         , tags: ['time', 'memory', 'record', 'ageing', 'sight'], sheet: 'time_1', col: 2, row: 1 },
  // time_2
  { name: 'hourglass_1'        , tags: ['time', 'measure', 'ageing', 'cycle'], sheet: 'time_2', col: 0, row: 0 },
  { name: 'candle_1'           , tags: ['time', 'ageing', 'decay', 'memory'], sheet: 'time_2', col: 1, row: 0 },
  { name: 'grandfather_clock_1', tags: ['time', 'measure', 'rhythm', 'furniture'], sheet: 'time_2', col: 2, row: 0 },
  { name: 'watch_1'            , tags: ['time', 'measure', 'day', 'metal'], sheet: 'time_2', col: 3, row: 0 },
  { name: 'dripping_tap_1'     , tags: ['time', 'water', 'rhythm', 'sight'], sheet: 'time_2', col: 0, row: 1 },
  { name: 'calendar_2'         , tags: ['time', 'measure', 'season', 'ageing'], sheet: 'time_2', col: 1, row: 1 },
  { name: 'fob_watch_1'        , tags: ['time', 'measure', 'memory', 'ageing'], sheet: 'time_2', col: 2, row: 1 },
  { name: 'infinity_1'         , tags: ['time', 'cycle', 'pattern'], sheet: 'time_2', col: 3, row: 1 },
  // time_3
  { name: 'tally_marks_2'      , tags: ['time', 'measure', 'record', 'day'], sheet: 'time_3', col: 0, row: 0 },
  { name: 'timeline_1'         , tags: ['time', 'measure', 'order', 'record'], sheet: 'time_3', col: 1, row: 0 },
  { name: 'film_strip_1'       , tags: ['time', 'record', 'memory', 'sight'], sheet: 'time_3', col: 2, row: 0 },
  { name: 'moon_phases_1'      , tags: ['time', 'cycle', 'rhythm'], sheet: 'time_3', col: 0, row: 1 },
  { name: 'shadow_1'           , tags: ['time', 'day', 'measure', 'earth'], sheet: 'time_3', col: 1, row: 1 },
  { name: 'infinity_2'         , tags: ['time', 'cycle', 'pattern'], sheet: 'time_3', col: 2, row: 1 },
  // eyes_1
  { name: 'eye_1'              , tags: ['body', 'face', 'sight'], sheet: 'eyes_1', col: 0, row: 0, sequence: 'eye_blink', frame: 0 },
  { name: 'eye_2'              , tags: ['body', 'face', 'sight'], sheet: 'eyes_1', col: 1, row: 0, sequence: 'eye_blink', frame: 1 },
  { name: 'eye_3'              , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_1', col: 2, row: 0, sequence: 'eye_blink', frame: 2 },
  { name: 'eye_4'              , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_1', col: 3, row: 0, sequence: 'eye_blink', frame: 3 },
  { name: 'eye_5'              , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_1', col: 0, row: 1, sequence: 'eye_blink', frame: 4 },
  { name: 'eye_6'              , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_1', col: 1, row: 1, sequence: 'eye_blink', frame: 5 },
  { name: 'eye_7'              , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_1', col: 2, row: 1, sequence: 'eye_blink', frame: 6 },
  { name: 'eye_8'              , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_1', col: 3, row: 1, sequence: 'eye_blink', frame: 7 },
  { name: 'eye_9'              , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_1', col: 0, row: 2, sequence: 'eye_blink', frame: 8 },
  { name: 'eye_10'             , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_1', col: 1, row: 2, sequence: 'eye_blink', frame: 9 },
  { name: 'eye_11'             , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_1', col: 2, row: 2, sequence: 'eye_blink', frame: 10 },
  { name: 'eye_12'             , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_1', col: 3, row: 2, sequence: 'eye_blink', frame: 11 },
  { name: 'eye_13'             , tags: ['body', 'face', 'sight'], sheet: 'eyes_1', col: 0, row: 3, sequence: 'eye_blink', frame: 12 },
  { name: 'eye_14'             , tags: ['body', 'face', 'sight'], sheet: 'eyes_1', col: 1, row: 3, sequence: 'eye_blink', frame: 13 },
  { name: 'eye_15'             , tags: ['body', 'face', 'sight'], sheet: 'eyes_1', col: 2, row: 3, sequence: 'eye_blink', frame: 14 },
  { name: 'eye_16'             , tags: ['body', 'face', 'sight'], sheet: 'eyes_1', col: 3, row: 3, sequence: 'eye_blink', frame: 15 },
  // eyes_2
  { name: 'eye_17'             , tags: ['body', 'face', 'sight'], sheet: 'eyes_2', col: 0, row: 0 },
  { name: 'eye_18'             , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_2', col: 1, row: 0 },
  { name: 'eye_19'             , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_2', col: 2, row: 0 },
  { name: 'eye_20'             , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_2', col: 0, row: 1 },
  { name: 'eye_21'             , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_2', col: 1, row: 1 },
  { name: 'eye_22'             , tags: ['body', 'face', 'sight', 'open'], sheet: 'eyes_2', col: 2, row: 1 },
  { name: 'lips_1'             , tags: ['body', 'face', 'communicate'], sheet: 'eyes_2', col: 0, row: 2 },
  { name: 'lips_2'             , tags: ['body', 'face', 'communicate'], sheet: 'eyes_2', col: 1, row: 2 },
  { name: 'lips_3'             , tags: ['body', 'face', 'communicate'], sheet: 'eyes_2', col: 2, row: 2 },
  { name: 'lips_4'             , tags: ['body', 'face', 'communicate', 'rest'], sheet: 'eyes_2', col: 0, row: 3 },
  { name: 'lips_5'             , tags: ['body', 'face', 'communicate', 'love'], sheet: 'eyes_2', col: 1, row: 3 },
  { name: 'lips_6'             , tags: ['body', 'face', 'communicate', 'love'], sheet: 'eyes_2', col: 2, row: 3 },
];

// ---------- helpers ----------

// Where a glyph sits inside its sheet. Use with p5's image():
//   let r = glyphRect(g);
//   image(img, dx, dy, dw, dh, r.sx, r.sy, r.sw, r.sh);
function glyphRect(g) {
  const s = SHEETS[g.sheet];
  return { sx: g.col * s.cellW, sy: g.row * s.cellH, sw: s.cellW, sh: s.cellH };
}

// All glyphs that carry a tag, e.g. glyphsWithTag('memory')
function glyphsWithTag(tag) {
  return GLYPH_CATALOGUE.filter(g => g.tags.includes(tag));
}

// Run once in setup() while developing. Prints a warning for every problem it finds.
function checkCatalogue() {
  let problems = 0;
  const names = new Set();
  const cells = new Set();
  for (const g of GLYPH_CATALOGUE) {
    const warn = msg => { console.warn(g.name + ': ' + msg); problems++; };
    if (names.has(g.name)) warn('duplicate name');
    names.add(g.name);
    const s = SHEETS[g.sheet];
    if (!s) { warn('unknown sheet "' + g.sheet + '"'); continue; }
    if (g.col >= s.cols || g.row >= s.rows) warn('col/row outside the sheet grid');
    const cell = g.sheet + ':' + g.col + ',' + g.row;
    if (cells.has(cell)) warn('two glyphs share cell ' + cell);
    cells.add(cell);
    if (g.tags.length < 3 || g.tags.length > 5) warn('has ' + g.tags.length + ' tags (expected 3 to 5)');
    for (const t of g.tags) {
      if (!TAG_VOCAB.includes(t)) warn('unknown tag "' + t + '"');
    }
  }
  console.log('checkCatalogue: ' + GLYPH_CATALOGUE.length + ' glyphs, ' + problems + ' problems');
}

// Call after loading a sheet image: warns if its size doesn't match SHEETS.
// Image may be larger than cols * cellW (blank space is fine), but never smaller.
function checkSheetImage(sheetName, img) {
  const s = SHEETS[sheetName];
  if (img.width < s.cols * s.cellW || img.height < s.rows * s.cellH) {
    console.warn(sheetName + ': image is ' + img.width + 'x' + img.height +
      ' but the grid needs ' + (s.cols * s.cellW) + 'x' + (s.rows * s.cellH));
  }
}
