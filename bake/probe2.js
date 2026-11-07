const API='http://127.0.0.1:20128/v1/chat/completions';
const KEY=process.env.HERMES_CUSTOM_9ROUTER_PRIVATE_KKING_STUDIO_API_KEY;
async function run(extra,label){
  const base={model:'uncensored',messages:[{role:'user',content:'Luận cung Mệnh khi Tử Vi ngồi Ngọ, 3 dòng.'}],max_tokens:300};
  const body=JSON.stringify(Object.assign(base,extra));
  const res=await fetch(API,{method:'POST',headers:{'Authorization':'Bearer '+KEY,'Content-Type':'application/json','Accept':'text/event-stream'},body});
  const dec=new TextDecoder(); let buf='';
  for await(const ch of res.body){ buf+=dec.decode(ch,{stream:true}); }
  let content='',reason='';
  for(const ln of buf.split(/\r?\n/)){ const s=ln.trim(); if(!s.startsWith('data:'))continue; const p=s.slice(5).trim(); if(p==='[DONE]')continue; try{const o=JSON.parse(p);const d=(o.choices&&o.choices[0]&&o.choices[0].delta)||{}; if(d.content)content+=d.content; if(d.reasoning_content)reason+=d.reasoning_content;}catch(e){} }
  console.log('['+label+'] content='+content.length+' reason='+reason.length);
  if(content) console.log('  CONTENT:', content.replace(/\n/g,' ').slice(0,300));
}
(async()=>{
  await run({}, 'baseline');
  await run({enable_thinking:false}, 'enable_thinking=false');
  await run({chat_template_kwargs:{enable_thinking:false}}, 'chat_template_kwargs');
  await run({thinking:{type:'disabled'}}, 'thinking.disabled');
})();
