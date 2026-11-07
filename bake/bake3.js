// BAKE v3 — sạch: không reasoning noise, bắt đủ 9 heading, verify trước khi ghi.
const fs = require('fs');
const path = require('path');
const API = 'http://127.0.0.1:20128/v1/chat/completions';
const KEY = process.env.HERMES_CUSTOM_9ROUTER_PRIVATE_KKING_STUDIO_API_KEY;
if (!KEY) { console.error('missing KEY'); process.exit(1); }

const OUT = path.join(__dirname, '..', 'luandata');
fs.mkdirSync(OUT, { recursive: true });

const HEADINGS = ['Tổng luận','Tính cách','Sự nghiệp','Tài lộc','Tình duyên - hôn nhân','Sức khỏe','Lục thân (Phụ Mẫu - Huynh Đệ - Phu Thê - Tử Tức)','Thiên Di - Nô Bộc - Điền Trạch - Phúc Đức','Lời khuyên'];

// noise markers: model tự thuật quá trình -> loại bỏ
const NOISE = [/^we (need|must|have to)/im, /^suy nghĩ/im, /^phân tích quá trình/im, /\bcount (maybe|is|:\s*\d)/i, /^\d+\|/m, /\bmaybe \d+/i, /\bneed to\b/i];

function firstObj(buf) {
  const s = buf.indexOf('{');
  if (s < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = s; i < buf.length; i++) {
    const c = buf[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) { try { return JSON.parse(buf.slice(s, i + 1)); } catch (e) { return null; } }
    }
  }
  return null;
}

async function ask(prompt, mt = 4000) {
  const body = {
    model: 'uncensored',
    messages: [
      { role: 'system', content: 'Anh là thầy Tử Vi Đẩu Số phái Việt, luận theo tinh đẩu, không mê tín, không hứa hão. Viết thẳng bằng tiếng Việt có dấu. KHÔNG tường thuật quá trình suy nghĩ, KHÔNG viết kiểu "ta cần / we need / có lẽ / đếm số câu". Mỗi mục đúng số câu yêu cầu, viết đủ ý.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: mt, temperature: 0.45, stream: false, thinking: { type: 'disabled' }
  };
  const res = await fetch(API, { method: 'POST', headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const dec = new TextDecoder(); let buf = '';
  for await (const ch of res.body) buf += dec.decode(ch, { stream: true });
  const o = firstObj(buf);
  if (!o) throw new Error('no json');
  const m = (o.choices && o.choices[0] && o.choices[0].message) || {};
  const c = (m.content || '').trim();
  if (!c) throw new Error('empty content (reasoning only)');
  return c;
}

function clean(c) {
  let out = c.replace(/\r/g, '');
  // bỏ block noise đầu bài nếu có
  const lines = out.split('\n');
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ' + HEADINGS[0])) { startIdx = i; break; }
    if (NOISE.some(re => re.test(lines[i]))) startIdx = i + 1;
  }
  out = lines.slice(startIdx).join('\n');
  // xóa các dòng tự đếm/đánh số lẻ
  out = out.split('\n').filter(l => {
    const t = l.trim();
    if (!t) return false;
    if (/^\d+[).]?\s*$/.test(t)) return false;
    if (/^(maybe|count|cần|ta cần|we)\s*[\d:]/i.test(t)) return false;
    return true;
  }).join('\n');
  return out.replace(/\n{3,}/g, '\n\n').trim();
}

function verify(text) {
  const miss = HEADINGS.filter(h => !text.includes('## ' + h));
  if (miss.length) return 'thieu heading: ' + miss.join(' | ');
  if (text.length < 3500) return 'qua ngan: ' + text.length;
  const noise = NOISE.filter(re => re.test(text));
  if (noise.length) return 'con noise: ' + noise.map(String).join(', ');
  return null;
}

const STARS = ['Tử Vi','Thiên Cơ','Thái Dương','Vũ Khúc','Thiên Đồng','Liêm Trinh','Thiên Phủ','Thái Âm','Tham Lang','Cự Môn','Thiên Tướng','Thiên Lương','Thất Sát','Phá Quân'];

function promptFor(star) {
  return `Luận giải chi tiết khi sao "${star}" thủ Mệnh (kèm tam hợp + xung chiếu). Tiếng Việt có dấu, tổng 1400-1800 từ, bố cục bắt buộc đúng 9 heading sau (giữ nguyên chữ, không thêm bớt heading):\n${HEADINGS.map(h => '## ' + h).join('\n')}\nMỗi mục 3-5 câu, mỗi câu 35-50 từ, có nội dung cụ thể về đặc tính tinh đẩu của "${star}", phân biệt miếu/vượng/đắc vs hãm, nêu cách cục cụ thể (tên cách cục + điều kiện thành), và lời khuyên làm được ngay. Không mê tín, không hứa hão, không tường thuật quá trình viết.`;
}

let idx = 0, workersCount = Number(process.env.W || 5);
async function worker(id) {
  while (true) {
    const i = idx++;
    if (i >= STARS.length) return;
    const star = STARS[i];
    const f = path.join(OUT, star.replace(/\s+/g, '_') + '.md');
    let best = null, bestIssue = 'none';
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const raw = await ask(promptFor(star));
        const c = clean(raw);
        const issue = verify(c);
        if (!issue) {
          fs.writeFileSync(f, c + '\n');
          console.log(`[w${id}] OK ${star} ${c.length}B attempt${attempt}`);
          best = 'ok';
          break;
        }
        bestIssue = issue;
        console.log(`[w${id}] retry ${star} attempt${attempt}: ${issue}`);
      } catch (e) {
        bestIssue = e.message;
        console.log(`[w${id}] err ${star} attempt${attempt}: ${e.message}`);
      }
    }
    if (best !== 'ok') console.log(`[w${id}] FAIL ${star}: ${bestIssue}`);
  }
}

(async () => {
  const t0 = Date.now();
  await Promise.all(Array.from({ length: workersCount }, (_, k) => worker(k + 1)));
  console.log(`done in ${Math.round((Date.now() - t0) / 1000)}s`);
  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.md'));
  for (const f of files) {
    const c = fs.readFileSync(path.join(OUT, f), 'utf8');
    const miss = HEADINGS.filter(h => !c.includes('## ' + h));
    console.log(f, c.length + 'B', miss.length ? 'MISS:' + miss.length : 'full');
  }
})();
