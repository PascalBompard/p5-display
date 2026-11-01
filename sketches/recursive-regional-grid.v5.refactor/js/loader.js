// loader.js
// Generic image loader. Knows nothing about glyphs or catalogues.
//
// Usage:
//   const images = await loadAll([{ key: 'a', path: 'assets/a.webp' }, ...]);
// Progress and status live in the `loader` object.

const loader = {
  total: 0,
  done: 0,
  failed: [],   // paths that could not be loaded
  ready: false, // true once everything has loaded successfully
};

async function loadAll(items) {
  loader.total = items.length;
  loader.done = 0;
  loader.failed = [];
  loader.ready = false;

  const images = {};

  await Promise.all(items.map(async item => {
    try {
      images[item.key] = await loadImage(item.path);
    } catch (err) {
      loader.failed.push(item.path);
    }
    loader.done++;
  }));

  loader.ready = loader.failed.length === 0;
  return images;
}