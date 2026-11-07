const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

// Read CSS and JS assets
const cssFile = fs.readdirSync(path.join(dist, 'assets')).find(f => f.endsWith('.css'));
const jsFile = fs.readdirSync(path.join(dist, 'assets')).find(f => f.endsWith('.js'));

const css = fs.readFileSync(path.join(dist, 'assets', cssFile), 'utf8');
const js = fs.readFileSync(path.join(dist, 'assets', jsFile), 'utf8');

let out = html;
// Replace CSS link with inline style
out = out.replace(/<link rel="stylesheet"[^>]*>/, `<style>${css}</style>`);
// Replace JS script with inline script
out = out.replace(/<script type="module"[^>]*><\/script>/, `<script type="module">${js}</script>`);

const outPath = path.join(dist, 'standalone.html');
fs.writeFileSync(outPath, out);
console.log(`Standalone HTML: ${outPath} (${(Buffer.byteLength(out) / 1024).toFixed(1)} KB)`);
