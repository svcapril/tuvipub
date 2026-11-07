// robust call: đọc stream, gộp delta.content, fallback reasoning_content cuối
const API='http://127.0.0.1:20128/v1/chat/completions';
const KEY=process.env.HERMES_CUSTOM_9ROUTER_PRIVATE_KKING_STUDIO_API_KEY;
function extract(buf){
  // buf có thể là: (a) 1 JSON object, (b) nhiều "data: {...}" (SSE)
  let content='';
  const seen=[];
  for(const line of buf.split(/\r?\n/)){
    const s=line.trim();
    if(!s.startsWith('data:')) continue;
    const p=s.slice(5).trim();
    if(p==='[DONE]'||!p) continue;
    let o; try{o=JSON.parse(p);}catch(e){continue;}
    const ch=(o.choices&&o.choices[0])||{};
    const d=ch.delta||ch.message||{};
    if(d.content) content+=d.content;
    seen.push({hasC:!!d.content,len:(d.content||'').length,hasR:!!(d.reasoning_content)});
  }
  return {content, lines:buf.split(/\r?\n/).filter(l=>l.trim().startsWith('data:')).length, sample:seen.slice(0,4)};
}
async function main(){
  const body={model:'uncensored',messages:[{role:'system',content:'Chuyên gia Tử Vi Đẩu Số phái Việt. Viết thẳng vào câu trả lời.'},{role:'user',content:'Luận 400 chữ về Thái Dương ngồi Ngọ.'}],max_tokens:2200,stream:true};
  const res=await fetch(API,{method:'POST',headers:{'Authorization':'Bearer '+KEY,'Content-Type':'application/json','Accept':'text/event-stream'},body:JSON.stringify(body)});
  const dec=new TextDecoder(); let buf='';
  for await(const ch of res.body){ buf+=dec.decode(ch,{stream:true}); }
  const r=extract(buf);
  console.log('http',res.status,'http',res.status,'lines',r.lines,'contentLen',r.content.length);
  console.log('SAMPLE',JSON.stringify(r.sample));
  console.log('--- CONTENT ---');
  console.log(r.content);
}
main().catch(e=>console.log('ERR',e.message));
