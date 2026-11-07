const API='http://127.0.0.1:20128/v1/chat/completions';
const KEY=process.env.HERMES_CUSTOM_9ROUTER_PRIVATE_KKING_STUDIO_API_KEY;
const body={model:'uncensored',messages:[{role:'system',content:'Chuyên gia Tử Vi Đẩu Số phái Việt. Trả lời bằng nội dung thật trong trường content, không để trống.'},{role:'user',content:'Luận cung Mệnh khi Tử Vi ngồi Ngọ, ~600 chữ tiếng Việt, có ## heading.'}],max_tokens:2000};
fetch(API,{method:'POST',headers:{'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).then(o=>{
  const m=o.choices[0].message; const fin=o.choices[0].finish_reason;
  console.log('finish',fin,'content len',(m.content||'').length,'reason len',(m.reasoning_content||'').length);
  console.log('CONTENT:\n',(m.content||'').slice(0,700));
}).catch(e=>console.log('ERR',e.message));
