const API='http://127.0.0.1:20128/v1/chat/completions';
const KEY=process.env.HERMES_CUSTOM_9ROUTER_PRIVATE_KKING_STUDIO_API_KEY;
const body=JSON.stringify({model:'uncensored',messages:[{role:'user',content:'Luận cung Mệnh khi Tử Vi ngồi Ngọ, ~500 chữ tiếng Việt.'}],max_tokens:1500,stream:true});
fetch(API,{method:'POST',headers:{'Authorization':'Bearer '+KEY,'Content-Type':'application/json','Accept':'text/event-stream'},body}).then(async res=>{
  const dec=new TextDecoder(); let buf='';
  for await(const ch of res.body){ buf+=dec.decode(ch,{stream:true}); }
  const lines=buf.split(/\r?\n/); let content='',reason='',fin=null,events=0;
  for(const ln of lines){ const s=ln.trim(); if(!s.startsWith('data:'))continue; events++; const p=s.slice(5).trim(); if(p==='[DONE]')continue; try{const o=JSON.parse(p);const d=(o.choices&&o.choices[0]&&o.choices[0].delta)||{}; if(d.content)content+=d.content; if(d.reasoning_content)reason+=d.reasoning_content; if(o.choices&&o.choices[0]&&o.choices[0].finish_reason)fin=o.choices[0].finish_reason;}catch(e){} }
  console.log('events',events,'finish',fin,'content',content.length,'reason',reason.length);
  console.log('=== CONTENT ==='); console.log(content);
  console.log('=== REASON (head 300) ==='); console.log(reason.slice(0,300));
});
