// BAKE CHÍNH THỨC — non-stream, parse JSON object đầu, parallel.
const fs=require('fs'),path=require('path');
const API='http://127.0.0.1:20128/v1/chat/completions';
const KEY=process.env.HERMES_CUSTOM_9ROUTER_PRIVATE_KKING_STUDIO_API_KEY;
if(!KEY){console.error('missing KEY');process.exit(1);}

const OUT=path.join(__dirname,'..','luandata');
fs.mkdirSync(OUT,{recursive:true});

function firstObj(buf){
  const s=buf.indexOf('{');
  if(s<0) return null;
  let depth=0,inStr=false,esc=false;
  for(let i=s;i<buf.length;i++){
    const c=buf[i];
    if(esc){esc=false;continue;}
    if(c==='\\'&&inStr){esc=true;continue;}
    if(c==='"'){inStr=!inStr;continue;}
    if(inStr) continue;
    if(c==='{') depth++;
    else if(c==='}'){ depth--; if(depth===0){ try{return JSON.parse(buf.slice(s,i+1));}catch(e){return null;} } }
  }
  return null;
}

async function ask(prompt,mt=3500){
  const body={model:'uncensored',messages:[
    {role:'system',content:'Chuyên gia Tử Vi Đẩu Số phái Việt, luận có căn cứ theo tinh đẩu, không mê tín, không hứa hão. Viết thẳng bằng tiếng Việt có dấu vào câu trả lời.'},
    {role:'user',content:prompt}
  ],max_tokens:mt,temperature:0.5,stream:false};
  const res=await fetch(API,{method:'POST',headers:{'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const dec=new TextDecoder(); let buf='';
  for await(const ch of res.body){ buf+=dec.decode(ch,{stream:true}); }
  const o=firstObj(buf);
  if(!o) throw new Error('no json');
  const m=(o.choices&&o.choices[0]&&o.choices[0].message)||{};
  let c=(m.content||'').trim();
  // nếu content rỗng mà reasoning có, suy ra content từ reasoning
  if(!c && m.reasoning_content) c=m.reasoning_content.trim();
  return c;
}

const STARS=['Tử Vi','Thiên Cơ','Thái Dương','Vũ Khúc','Thiên Đồng','Liêm Trinh','Thiên Phủ','Thái Âm','Tham Lang','Cự Môn','Thiên Tướng','Thiên Lương','Thất Sát','Phá Quân'];

function promptFor(star){
  return `Luận giải chi tiết lá số Tử Vi Đẩu Số khi sao "${star}" thủ Mệnh (chiếu cả tam hợp xung chiếu). Tiếng Việt có dấu, mỗi mục 3-5 câu, tổng 1400-1800 từ. Bám sát đặc tính tinh đẩu của "${star}", phân biệt miếu/vượng vs hãm, nêu cách cục, lời thực tế.
Bố cục bắt buộc, heading bằng ##:
## Tổng luận
## Tính cách
## Sự nghiệp
## Tài lộc
## Tình duyên - hôn nhân
## Sức khỏe
## Lục thân (Phụ Mẫu - Huynh Đệ - Phu Thê - Tử Tức)
## Thiên Di - Nô Bộc - Điền Trạch - Phúc Đức
## Lời khuyên`;
}

let idx=0;
async function worker(n){
  while(true){
    const i=idx++; if(i>=STARS.length) return;
    const star=STARS[i];
    const f=path.join(OUT,star.replace(/\s+/g,'_')+'.md');
    if(fs.existsSync(f)&&fs.statSync(f).size>800){console.log('skip',star);continue;}
    try{
      const t=await ask(promptFor(star));
      if(t&&t.length>600){fs.writeFileSync(f,t);console.log('OK',star,t.length);}
      else console.log('SHORT',star,(t||'').length);
    }catch(e){console.log('ERR',star,e.message);}
  }
}
(async()=>{ await Promise.all(Array.from({length:5},worker)); console.log('ALL DONE'); })();
