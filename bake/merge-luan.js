// Gộp luandata/*.md -> luan.js (window.LUAN) để frontend đọc, không cần fetch.
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'luandata');
const OUT = path.join(__dirname, '..', 'luan.js');

const data = {};
for (const f of fs.readdirSync(SRC).filter(x => x.endsWith('.md'))) {
  const name = f.replace(/\.md$/, '').replace(/_/g, ' ');
  let txt = fs.readFileSync(path.join(SRC, f), 'utf8').trim();
  if (txt.length < 500) { console.log('skip(short)', name); continue; }
  data[name] = txt;
}
fs.writeFileSync(OUT, 'window.LUAN=' + JSON.stringify(data) + ';\n');
const bytes = fs.statSync(OUT).size;
console.log('wrote luan.js', bytes + 'B', Object.keys(data).length, 'stars');
