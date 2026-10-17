// glyph-catalogue.js
// Load this BEFORE sketch.js in index.html:
//   <script src="glyph-catalogue.js"></script>
//   <script src="sketch.js"></script>
//
// Three data blocks live here (helper functions get added underneath later):
//   SHEETS           one entry per sprite sheet: theme, grid, cell size, pool
//   TAG_VOCAB        the fixed list of allowed tags
//   GLYPH_CATALOGUE  one entry per glyph: name, tags, sheet, col, row
//
// Sheet filenames follow theme_size_number.webp, e.g. body_L_1.webp.
//   size S = small pool, cell 256 x 256
//   size L = large pool, cell 768 x 768
// All glyphs are square. The key in SHEETS is the filename without .webp.
// A sheet with tile: true holds textures meant to be tiled into non-square areas.
//
// col and row count from 0, across then down. Pixel position of a glyph's cell:
//   x = col * cell,  y = row * cell
// Rule for tags: 2 to 4 per glyph. The theme is NOT a tag, it lives on the sheet.
// Variations of the same object share identical tags.

const SHEETS = {
  // body
  body_L_1:      { theme: 'body',      cols: 3, rows: 2, cell: 768, pool: 'large' },
  body_L_2:      { theme: 'body',      cols: 3, rows: 2, cell: 768, pool: 'large' },
  body_S_1:      { theme: 'body',      cols: 3, rows: 2, cell: 256, pool: 'small' },
  body_S_2:      { theme: 'body',      cols: 3, rows: 2, cell: 256, pool: 'small' },
  body_S_3:      { theme: 'body',      cols: 3, rows: 2, cell: 256, pool: 'small' },
  // botanical
  botanical_L_1: { theme: 'botanical', cols: 3, rows: 2, cell: 768, pool: 'large' },
  botanical_S_1: { theme: 'botanical', cols: 3, rows: 2, cell: 256, pool: 'small' },
  botanical_S_2: { theme: 'botanical', cols: 3, rows: 2, cell: 256, pool: 'small' },
  botanical_S_3: { theme: 'botanical', cols: 3, rows: 2, cell: 256, pool: 'small' },
  // symbols
  symbols_L_1:   { theme: 'symbols',   cols: 3, rows: 2, cell: 768, pool: 'large' },
  symbols_L_2:   { theme: 'symbols',   cols: 3, rows: 2, cell: 768, pool: 'large' },
  symbols_L_3:   { theme: 'symbols',   cols: 3, rows: 2, cell: 768, pool: 'large' },
  symbols_S_1:   { theme: 'symbols',   cols: 4, rows: 4, cell: 256, pool: 'small' },
  symbols_S_2:   { theme: 'symbols',   cols: 4, rows: 4, cell: 256, pool: 'small' },
  symbols_S_3:   { theme: 'symbols',   cols: 4, rows: 4, cell: 256, pool: 'small' },
  symbols_S_4:   { theme: 'symbols',   cols: 4, rows: 4, cell: 256, pool: 'small' },
  // texture (tiled)
  texture_S_1:   { theme: 'texture',   cols: 3, rows: 2, cell: 256, pool: 'small', tile: true },
  texture_S_2:   { theme: 'texture',   cols: 3, rows: 2, cell: 256, pool: 'small', tile: true },
};

const TAG_VOCAB = [
  'ageing', 'bones', 'build', 'care', 'centre', 'clean', 'clothing', 'communicate',
  'contain', 'cut', 'cycle', 'death', 'decay', 'earth', 'face', 'flower', 'food',
  'fragility', 'fruit', 'growth', 'hand', 'human', 'identity', 'labour', 'leaf', 'life',
  'limb', 'lock', 'love', 'measure', 'memory', 'move', 'open', 'order', 'organ',
  'pattern', 'power', 'protection', 'radial', 'record', 'rest', 'rhythm', 'season',
  'seed', 'sight', 'structure', 'threshold', 'time', 'transformation', 'tree',
  'vessel', 'water',
];

const GLYPH_CATALOGUE = [
  // body_L_1
  { name: 'fingerprint_1', tags: ['hand', 'pattern', 'identity'], sheet: 'body_L_1', col: 0, row: 0 },
  { name: 'brain_1', tags: ['organ', 'memory', 'pattern'], sheet: 'body_L_1', col: 1, row: 0 },
  { name: 'eye_1', tags: ['face', 'sight'], sheet: 'body_L_1', col: 2, row: 0 },
  { name: 'heart_1', tags: ['organ', 'life', 'rhythm'], sheet: 'body_L_1', col: 0, row: 1 },
  { name: 'eye_2', tags: ['face', 'sight'], sheet: 'body_L_1', col: 1, row: 1 },
  { name: 'eye_3', tags: ['face', 'sight'], sheet: 'body_L_1', col: 2, row: 1 },
  // body_L_2
  { name: 'lungs_1', tags: ['organ', 'life', 'rhythm'], sheet: 'body_L_2', col: 0, row: 0 },
  { name: 'eye_4', tags: ['face', 'sight'], sheet: 'body_L_2', col: 1, row: 0 },
  { name: 'brain_2', tags: ['organ', 'memory', 'pattern'], sheet: 'body_L_2', col: 2, row: 0 },
  { name: 'pelvis_1', tags: ['bones', 'human', 'structure'], sheet: 'body_L_2', col: 0, row: 1 },
  { name: 'kidneys_1', tags: ['organ', 'water', 'clean', 'life'], sheet: 'body_L_2', col: 1, row: 1 },
  { name: 'stomach_1', tags: ['organ', 'food', 'contain', 'transformation'], sheet: 'body_L_2', col: 2, row: 1 },
  // body_S_1
  { name: 'woman_1', tags: ['human', 'life', 'clothing'], sheet: 'body_S_1', col: 0, row: 0 },
  { name: 'man_1', tags: ['human', 'life', 'bones', 'death'], sheet: 'body_S_1', col: 1, row: 0 },
  { name: 'eye_5', tags: ['face', 'sight'], sheet: 'body_S_1', col: 2, row: 0 },
  { name: 'man_2', tags: ['human', 'life', 'move'], sheet: 'body_S_1', col: 0, row: 1 },
  { name: 'limbs_1', tags: ['human', 'limb', 'life'], sheet: 'body_S_1', col: 1, row: 1 },
  { name: 'bones_1', tags: ['bones', 'hand', 'limb', 'death'], sheet: 'body_S_1', col: 2, row: 1 },
  // body_S_2
  { name: 'eye_6', tags: ['face', 'sight'], sheet: 'body_S_2', col: 0, row: 0 },
  { name: 'eye_7', tags: ['face', 'sight'], sheet: 'body_S_2', col: 1, row: 0 },
  { name: 'eye_8', tags: ['face', 'sight'], sheet: 'body_S_2', col: 2, row: 0 },
  { name: 'lips_1', tags: ['face', 'communicate'], sheet: 'body_S_2', col: 0, row: 1 },
  { name: 'lips_2', tags: ['face', 'communicate'], sheet: 'body_S_2', col: 1, row: 1 },
  { name: 'lips_3', tags: ['face', 'communicate'], sheet: 'body_S_2', col: 2, row: 1 },
  // body_S_3
  { name: 'eye_9', tags: ['face', 'sight'], sheet: 'body_S_3', col: 0, row: 0 },
  { name: 'hand_1', tags: ['hand', 'human', 'life', 'communicate'], sheet: 'body_S_3', col: 1, row: 0 },
  { name: 'skull_1', tags: ['human', 'bones', 'death', 'face'], sheet: 'body_S_3', col: 2, row: 0 },
  { name: 'eye_10', tags: ['face', 'sight'], sheet: 'body_S_3', col: 0, row: 1 },
  { name: 'tooth_1', tags: ['bones', 'food', 'decay'], sheet: 'body_S_3', col: 1, row: 1 },
  { name: 'heart_2', tags: ['love', 'care', 'life'], sheet: 'body_S_3', col: 2, row: 1 },

  // botanical_L_1
  { name: 'strawberry_1', tags: ['fruit', 'food', 'seed'], sheet: 'botanical_L_1', col: 0, row: 0 },
  { name: 'mushroom_1', tags: ['decay', 'food', 'earth'], sheet: 'botanical_L_1', col: 1, row: 0 },
  { name: 'leaf_1', tags: ['leaf', 'pattern', 'season'], sheet: 'botanical_L_1', col: 2, row: 0 },
  { name: 'dandelion_1', tags: ['seed', 'pattern', 'fragility', 'cycle'], sheet: 'botanical_L_1', col: 0, row: 1 },
  { name: 'sunflower_1', tags: ['flower', 'seed', 'pattern', 'food'], sheet: 'botanical_L_1', col: 1, row: 1 },
  { name: 'cherry_1', tags: ['fruit', 'food', 'season'], sheet: 'botanical_L_1', col: 2, row: 1 },
  // botanical_S_1
  { name: 'pear_1', tags: ['fruit', 'food', 'growth'], sheet: 'botanical_S_1', col: 0, row: 0 },
  { name: 'poppy_1', tags: ['seed', 'ageing', 'contain', 'cycle'], sheet: 'botanical_S_1', col: 1, row: 0 },
  { name: 'pea_pod_1', tags: ['seed', 'food', 'contain'], sheet: 'botanical_S_1', col: 2, row: 0 },
  { name: 'bulb_1', tags: ['growth', 'rest', 'cycle'], sheet: 'botanical_S_1', col: 0, row: 1 },
  { name: 'clover_1', tags: ['leaf', 'growth', 'protection'], sheet: 'botanical_S_1', col: 1, row: 1 },
  { name: 'flower_1', tags: ['flower', 'growth', 'pattern', 'season'], sheet: 'botanical_S_1', col: 2, row: 1 },
  // botanical_S_2
  { name: 'tree_1', tags: ['tree', 'growth', 'pattern'], sheet: 'botanical_S_2', col: 0, row: 0 },
  { name: 'pumpkin_1', tags: ['fruit', 'food', 'season'], sheet: 'botanical_S_2', col: 1, row: 0 },
  { name: 'banana_1', tags: ['fruit', 'food', 'decay'], sheet: 'botanical_S_2', col: 2, row: 0 },
  { name: 'tree_2', tags: ['tree', 'growth', 'season'], sheet: 'botanical_S_2', col: 0, row: 1 },
  { name: 'avocado_1', tags: ['fruit', 'food', 'seed'], sheet: 'botanical_S_2', col: 1, row: 1 },
  { name: 'apple_1', tags: ['fruit', 'food', 'growth'], sheet: 'botanical_S_2', col: 2, row: 1 },
  // botanical_S_3
  { name: 'wheat_1', tags: ['seed', 'food', 'season'], sheet: 'botanical_S_3', col: 0, row: 0 },
  { name: 'leaf_2', tags: ['leaf', 'pattern', 'season'], sheet: 'botanical_S_3', col: 1, row: 0 },
  { name: 'cactus_1', tags: ['water', 'growth'], sheet: 'botanical_S_3', col: 2, row: 0 },
  { name: 'tree_3', tags: ['tree', 'growth', 'life'], sheet: 'botanical_S_3', col: 0, row: 1 },
  { name: 'tree_4', tags: ['tree', 'season', 'ageing'], sheet: 'botanical_S_3', col: 1, row: 1 },
  { name: 'tulip_1', tags: ['flower', 'season', 'growth'], sheet: 'botanical_S_3', col: 2, row: 1 },

  // symbols_L_1
  { name: 'twinkle_1', tags: ['pattern', 'rhythm', 'radial'], sheet: 'symbols_L_1', col: 0, row: 0 },
  { name: 'triangle_1', tags: ['structure', 'order', 'centre'], sheet: 'symbols_L_1', col: 1, row: 0 },
  { name: 'cross_1', tags: ['order', 'measure', 'threshold'], sheet: 'symbols_L_1', col: 2, row: 0 },
  { name: 'landmark_1', tags: ['memory', 'record', 'pattern'], sheet: 'symbols_L_1', col: 0, row: 1 },
  { name: 'lattice_1', tags: ['pattern', 'structure', 'order'], sheet: 'symbols_L_1', col: 1, row: 1 },
  { name: 'orbit_1', tags: ['cycle', 'rhythm', 'centre'], sheet: 'symbols_L_1', col: 2, row: 1 },
  // symbols_L_2
  { name: 'spark_1', tags: ['radial', 'power', 'rhythm'], sheet: 'symbols_L_2', col: 0, row: 0 },
  { name: 'hourglass_1', tags: ['time', 'measure', 'cycle'], sheet: 'symbols_L_2', col: 1, row: 0 },
  { name: 'lattice_2', tags: ['pattern', 'structure', 'order'], sheet: 'symbols_L_2', col: 2, row: 0 },
  { name: 'totem_1', tags: ['structure', 'identity', 'memory'], sheet: 'symbols_L_2', col: 0, row: 1 },
  { name: 'cosmic_eye_1', tags: ['sight', 'cycle', 'centre'], sheet: 'symbols_L_2', col: 1, row: 1 },
  { name: 'hook_1', tags: ['pattern', 'order', 'lock'], sheet: 'symbols_L_2', col: 2, row: 1 },
  // symbols_L_3
  { name: 'matrix_1', tags: ['pattern', 'order', 'centre'], sheet: 'symbols_L_3', col: 0, row: 0 },
  { name: 'division_1', tags: ['cut', 'measure', 'order'], sheet: 'symbols_L_3', col: 1, row: 0 },
  { name: 'rings_1', tags: ['pattern', 'cycle', 'rhythm'], sheet: 'symbols_L_3', col: 2, row: 0 },
  { name: 'compass_points_1', tags: ['order', 'measure', 'centre'], sheet: 'symbols_L_3', col: 0, row: 1 },
  { name: 'rhombus_1', tags: ['structure', 'contain', 'centre'], sheet: 'symbols_L_3', col: 1, row: 1 },
  { name: 'frame_1', tags: ['structure', 'contain', 'protection'], sheet: 'symbols_L_3', col: 2, row: 1 },
  // symbols_S_1
  { name: 'hash_1', tags: ['record', 'measure', 'order'], sheet: 'symbols_S_1', col: 0, row: 0 },
  { name: 'facets_1', tags: ['structure', 'order', 'centre'], sheet: 'symbols_S_1', col: 1, row: 0 },
  { name: 'asterisk_1', tags: ['radial', 'pattern', 'rhythm'], sheet: 'symbols_S_1', col: 2, row: 0 },
  { name: 'strike_1', tags: ['cut', 'centre', 'power'], sheet: 'symbols_S_1', col: 3, row: 0 },
  { name: 'lattice_3', tags: ['pattern', 'structure', 'order'], sheet: 'symbols_S_1', col: 0, row: 1 },
  { name: 'aperture_1', tags: ['sight', 'centre', 'measure'], sheet: 'symbols_S_1', col: 1, row: 1 },
  { name: 'knots_1', tags: ['pattern', 'lock', 'cycle'], sheet: 'symbols_S_1', col: 2, row: 1 },
  { name: 'orbitals_1', tags: ['cycle', 'centre', 'pattern'], sheet: 'symbols_S_1', col: 3, row: 1 },
  { name: 'fold_1', tags: ['structure', 'transformation', 'order'], sheet: 'symbols_S_1', col: 0, row: 2 },
  { name: 'pylon_1', tags: ['structure', 'build', 'power'], sheet: 'symbols_S_1', col: 1, row: 2 },
  { name: 'division_2', tags: ['cut', 'measure', 'order'], sheet: 'symbols_S_1', col: 2, row: 2 },
  { name: 'bolt_1', tags: ['power', 'move', 'rhythm'], sheet: 'symbols_S_1', col: 3, row: 2 },
  { name: 'gate_1', tags: ['threshold', 'open', 'structure'], sheet: 'symbols_S_1', col: 0, row: 3 },
  { name: 'altar_1', tags: ['structure', 'memory', 'rest'], sheet: 'symbols_S_1', col: 1, row: 3 },
  { name: 'beacon_1', tags: ['sight', 'communicate', 'power'], sheet: 'symbols_S_1', col: 2, row: 3 },
  { name: 'wedge_1', tags: ['cut', 'structure', 'build'], sheet: 'symbols_S_1', col: 3, row: 3 },
  // symbols_S_2
  { name: 'sparkle_1', tags: ['radial', 'power', 'pattern'], sheet: 'symbols_S_2', col: 0, row: 0 },
  { name: 'zigzag_1', tags: ['rhythm', 'move', 'pattern'], sheet: 'symbols_S_2', col: 1, row: 0 },
  { name: 'hourglass_2', tags: ['time', 'measure', 'cycle'], sheet: 'symbols_S_2', col: 2, row: 0 },
  { name: 'diamond_1', tags: ['structure', 'contain', 'order'], sheet: 'symbols_S_2', col: 3, row: 0 },
  { name: 'arches_1', tags: ['cycle', 'rhythm', 'threshold'], sheet: 'symbols_S_2', col: 0, row: 1 },
  { name: 'figure_eight_1', tags: ['cycle', 'pattern', 'rhythm'], sheet: 'symbols_S_2', col: 1, row: 1 },
  { name: 'crossing_1', tags: ['cut', 'threshold', 'order'], sheet: 'symbols_S_2', col: 2, row: 1 },
  { name: 'circle_1', tags: ['cycle', 'contain', 'rest'], sheet: 'symbols_S_2', col: 3, row: 1 },
  { name: 'tally_1', tags: ['record', 'measure', 'rhythm'], sheet: 'symbols_S_2', col: 0, row: 2 },
  { name: 'knots_2', tags: ['pattern', 'lock', 'cycle'], sheet: 'symbols_S_2', col: 1, row: 2 },
  { name: 'plus_1', tags: ['measure', 'order', 'centre'], sheet: 'symbols_S_2', col: 2, row: 2 },
  { name: 'triangle_2', tags: ['structure', 'order', 'build'], sheet: 'symbols_S_2', col: 3, row: 2 },
  { name: 'asterisk_2', tags: ['radial', 'pattern', 'rhythm'], sheet: 'symbols_S_2', col: 0, row: 3 },
  { name: 'bar_1', tags: ['measure', 'order', 'structure'], sheet: 'symbols_S_2', col: 1, row: 3 },
  { name: 'slash_1', tags: ['cut', 'move', 'order'], sheet: 'symbols_S_2', col: 2, row: 3 },
  { name: 'square_1', tags: ['structure', 'contain', 'order'], sheet: 'symbols_S_2', col: 3, row: 3 },
  // symbols_S_3
  { name: 'bloom_1', tags: ['growth', 'pattern', 'radial'], sheet: 'symbols_S_3', col: 0, row: 0 },
  { name: 'scallop_1', tags: ['pattern', 'rhythm', 'radial'], sheet: 'symbols_S_3', col: 1, row: 0 },
  { name: 'cluster_1', tags: ['pattern', 'growth', 'contain'], sheet: 'symbols_S_3', col: 2, row: 0 },
  { name: 'pair_1', tags: ['order', 'rhythm', 'rest'], sheet: 'symbols_S_3', col: 3, row: 0 },
  { name: 'disc_1', tags: ['centre', 'cycle', 'rest'], sheet: 'symbols_S_3', col: 0, row: 1 },
  { name: 'orbit_2', tags: ['cycle', 'rhythm', 'centre'], sheet: 'symbols_S_3', col: 1, row: 1 },
  { name: 'lozenge_1', tags: ['structure', 'order', 'rest'], sheet: 'symbols_S_3', col: 2, row: 1 },
  { name: 'frame_2', tags: ['structure', 'contain', 'protection'], sheet: 'symbols_S_3', col: 3, row: 1 },
  { name: 'pyramid_1', tags: ['structure', 'build', 'earth'], sheet: 'symbols_S_3', col: 0, row: 2 },
  { name: 'peaks_1', tags: ['pattern', 'rhythm', 'earth'], sheet: 'symbols_S_3', col: 1, row: 2 },
  { name: 'stamp_1', tags: ['record', 'identity', 'contain'], sheet: 'symbols_S_3', col: 2, row: 2 },
  { name: 'rhombus_2', tags: ['structure', 'contain', 'centre'], sheet: 'symbols_S_3', col: 3, row: 2 },
  { name: 'hourglass_3', tags: ['time', 'measure', 'cycle'], sheet: 'symbols_S_3', col: 0, row: 3 },
  { name: 'asterisk_3', tags: ['radial', 'pattern', 'rhythm'], sheet: 'symbols_S_3', col: 1, row: 3 },
  { name: 'shield_1', tags: ['protection', 'structure', 'contain'], sheet: 'symbols_S_3', col: 2, row: 3 },
  { name: 'halves_1', tags: ['cut', 'order', 'cycle'], sheet: 'symbols_S_3', col: 3, row: 3 },
  // symbols_S_4
  { name: 'columns_1', tags: ['rhythm', 'order', 'structure'], sheet: 'symbols_S_4', col: 0, row: 0 },
  { name: 'diagonals_1', tags: ['rhythm', 'move', 'cut'], sheet: 'symbols_S_4', col: 1, row: 0 },
  { name: 'slab_1', tags: ['structure', 'build', 'rest'], sheet: 'symbols_S_4', col: 2, row: 0 },
  { name: 'pair_2', tags: ['order', 'rhythm', 'rest'], sheet: 'symbols_S_4', col: 3, row: 0 },
  { name: 'ramp_1', tags: ['move', 'build', 'structure'], sheet: 'symbols_S_4', col: 0, row: 1 },
  { name: 'pillars_1', tags: ['rest', 'structure', 'order'], sheet: 'symbols_S_4', col: 1, row: 1 },
  { name: 'crossing_2', tags: ['cut', 'threshold', 'order'], sheet: 'symbols_S_4', col: 2, row: 1 },
  { name: 'sparkle_2', tags: ['radial', 'power', 'pattern'], sheet: 'symbols_S_4', col: 3, row: 1 },
  { name: 'bar_2', tags: ['measure', 'order', 'structure'], sheet: 'symbols_S_4', col: 0, row: 2 },
  { name: 'plus_2', tags: ['measure', 'order', 'centre'], sheet: 'symbols_S_4', col: 1, row: 2 },
  { name: 'bowl_1', tags: ['contain', 'vessel', 'rest'], sheet: 'symbols_S_4', col: 2, row: 2 },
  { name: 'slope_1', tags: ['structure', 'measure', 'build'], sheet: 'symbols_S_4', col: 3, row: 2 },
  { name: 'porthole_1', tags: ['sight', 'threshold', 'structure'], sheet: 'symbols_S_4', col: 0, row: 3 },
  { name: 'funnel_1', tags: ['contain', 'transformation', 'move'], sheet: 'symbols_S_4', col: 1, row: 3 },
  { name: 'disc_2', tags: ['centre', 'cycle', 'rest'], sheet: 'symbols_S_4', col: 2, row: 3 },
  { name: 'quadrant_1', tags: ['measure', 'cycle', 'order'], sheet: 'symbols_S_4', col: 3, row: 3 },

  // texture_S_1
  { name: 'pebbles_1', tags: ['earth', 'pattern', 'rest'], sheet: 'texture_S_1', col: 0, row: 0 },
  { name: 'seeds_1', tags: ['seed', 'pattern', 'rhythm'], sheet: 'texture_S_1', col: 1, row: 0 },
  { name: 'specks_1', tags: ['pattern', 'order', 'ageing'], sheet: 'texture_S_1', col: 2, row: 0 },
  { name: 'reeds_1', tags: ['growth', 'rhythm', 'pattern'], sheet: 'texture_S_1', col: 0, row: 1 },
  { name: 'dashes_1', tags: ['rhythm', 'move', 'pattern'], sheet: 'texture_S_1', col: 1, row: 1 },
  { name: 'scatter_1', tags: ['pattern', 'move', 'earth'], sheet: 'texture_S_1', col: 2, row: 1 },
  // texture_S_2
  { name: 'bands_1', tags: ['rhythm', 'move', 'order'], sheet: 'texture_S_2', col: 0, row: 0 },
  { name: 'flecks_1', tags: ['pattern', 'rhythm', 'order'], sheet: 'texture_S_2', col: 1, row: 0 },
  { name: 'drizzle_1', tags: ['water', 'rhythm', 'pattern'], sheet: 'texture_S_2', col: 2, row: 0 },
  { name: 'crosshatch_1', tags: ['pattern', 'structure', 'labour'], sheet: 'texture_S_2', col: 0, row: 1 },
  { name: 'twigs_1', tags: ['decay', 'earth', 'pattern'], sheet: 'texture_S_2', col: 1, row: 1 },
  { name: 'maze_1', tags: ['pattern', 'order', 'lock'], sheet: 'texture_S_2', col: 2, row: 1 },
];

// ---------- helpers ----------
// (to be added step by step: glyphRect, glyphsWithTag, isTileable, checkCatalogue, checkSheetImage)

function glyphRect(glyph) {
  // Return the rectangle of a glyph in its sheet, in pixels.
  const sheet = SHEETS[glyph.sheet];
  return {
    x: glyph.col * sheet.cell,
    y: glyph.row * sheet.cell,
    w: sheet.cell,
    h: sheet.cell,
  };
}

function glyphsWithTag(tag) {
  // Return an array of glyphs that have the given tag.
  return GLYPH_CATALOGUE.filter(g => g.tags.includes(tag));
}

function isTileable(glyph) {
  // Return true if the glyph's sheet is tileable.
  return SHEETS[glyph.sheet].tile === true;
}

function checkCatalogue() {
  // Check that all glyphs have valid sheets and tags.
  const problems = [];
  const seenNames = new Set();
  const seenCells = new Set();

  for (const g of GLYPH_CATALOGUE) {

    if (g.tags.length < 2 || g.tags.length > 4) {
      problems.push(`Glyph ${g.name}: has ${g.tags.length} tags (must be 2 to 4).`);
    }
    
    for (const tag of g.tags) {
      if (!TAG_VOCAB.includes(tag)) {
        problems.push(`Glyph ${g.name}: tag "${tag}" is not in TAG_VOCAB.`);
      } 
    }

    if (seenNames.has(g.name)) {
      problems.push(`Glyph ${g.name}: duplicate name.`);
    }
    seenNames.add(g.name);

    const cellKey = `${g.sheet} col ${g.col} row ${g.row}`;
    if (seenCells.has(cellKey)) {
      problems.push(`Glyph ${g.name}: duplicate cell position.`);
    }
    seenCells.add(cellKey);

    const sheet = SHEETS[g.sheet];

    if (!sheet) {
      problems.push(`Glyph ${g.name}: sheet "${g.sheet}" is not in SHEETS.`);
      continue;
    }

    if (g.col < 0 || g.col >= sheet.cols) {
      problems.push(`Glyph ${g.name}: col ${g.col} is outside ${g.sheet} (0 to ${sheet.cols - 1})`);
    }
    
    if (g.row < 0 || g.row >= sheet.rows) {
      problems.push(`Glyph ${g.name}: row ${g.row} is outside ${g.sheet} (0 to ${sheet.rows - 1})`);
    }
  }

  for (const sheetName in SHEETS) {
    const sheet = SHEETS[sheetName];
    for (let row = 0; row < sheet.rows; row++) {
      for (let col = 0; col < sheet.cols; col++) {
        if(!seenCells.has(`${sheetName} col ${col} row ${row}`)) {
          problems.push(`Sheet ${sheetName}: cell at col ${col}, row ${row} has no glyph.`);
        }
      }
    }
  }
  
  if (problems.length === 0) {
    console.log(`Catalogue OK: ${GLYPH_CATALOGUE.length} glyphs on ${Object.keys(SHEETS).length} sheets.`);
  } else {
    console.warn(`Catalogue has ${problems.length} problems:`);
    for (const p of problems) {
      console.warn(`  ${p}`);
    }
  }

  return problems;
}

function checkSheetImage(sheetName, img) {
  // Check that the image dimensions match the sheet definition.
  const sheet = SHEETS[sheetName];
  if (!sheet) {
    console.warn(`checkSheetImage: Sheet ${sheetName} is not in SHEETS.`);
    return false;
  }

  const expectedWidth = sheet.cols * sheet.cell;
  const expectedHeight = sheet.rows * sheet.cell;

  if (img.width !== expectedWidth || img.height !== expectedHeight) {
    console.warn(`checkSheetImage: Sheet ${sheetName} image dimensions ${img.width}x${img.height} do not match expected ${expectedWidth}x${expectedHeight}.`);
    return false;
  }

  return true;
}

function glyphsforPool(pool) {
  // Return an array of glyphs that belong to the given pool ('small' or 'large').
  return GLYPH_CATALOGUE.filter(g => SHEETS[g.sheet].pool === pool && !isTileable(g));
}

function tileGlyphs() {
  // Return an array of glyphs that are tileable.
  return GLYPH_CATALOGUE.filter(isTileable);
}

function tagCoverage() {
  // Count how many glyphs carry each tag, split into small, large and texture.
  const counts = {};
  for (const tag of TAG_VOCAB) {
    counts[tag] = { small: 0, large: 0, texture: 0 };
  }

  for (const g of GLYPH_CATALOGUE) {
    const kind = isTileable(g) ? 'texture' : SHEETS[g.sheet].pool;
    for (const tag of g.tags) {
      counts[tag][kind]++;
    }
  }

  console.table(counts);
  return counts;
}