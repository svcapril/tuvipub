'use strict';
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
var A=iztro.astro, LANG='vi-VN';

var LUAN=(window.LUAN)||{};
function luanOf(n){ return LUAN[n]||null; }

// ring clockwise, Dần at top-left. each [row,col]
var RING=[['1','1'],['1','2'],['1','3'],['1','4'],['2','4'],['3','4'],['4','4'],['4','3'],['4','2'],['4','1'],['3','1'],['2','1']];
var CHI=['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
function ringOfBranch(br){ var ci=CHI.indexOf(br); return (ci-2+12)%12; }
function fmtDate(s){ var a=s.split('-'); return a[2]+'/'+a[1]+'/'+a[0]; }

var G=null;

function starTag(st){
  var s=st.name;
  if(st.brightness) s+=' ('+st.brightness+')';
  if(st.mutagen) s+=' [Hóa '+st.mutagen+']';
  return '<span class="'+(st.mutagen?'mut':'')+'">'+s+'</span>';
}

function renderGrid(){
  var wrap=$('#tabChart'); wrap.innerHTML='';
  // 12 perimeter cells
  G.palaces.forEach(function(p){
    var rp=ringOfBranch(p.earthlyBranch);
    var cell=document.createElement('div');
    cell.className='cell';
    cell.style.gridColumn=RING[rp][1];
    cell.style.gridRow=RING[rp][0];
    var mj=p.majorStars.map(starTag).join(' ');
    var mn=p.minorStars.length?('<div class="min">'+p.minorStars.map(starTag).join(' ')+'</div>'):'';
    var ad=p.adjectiveStars.length?('<div class="adj">'+p.adjectiveStars.map(function(x){return x.name;}).join(' ')+'</div>'):'';
    var dv=p.decadal&&p.decadal.range?(p.decadal.range[0]+'–'+p.decadal.range[1]):'';
    cell.innerHTML=
      '<span class="cn">'+p.heavenlyStem+' '+p.earthlyBranch+'</span>'+
      '<div class="stars"><div>'+mj+'</div>'+mn+ad+'</div>'+
      '<div class="bottom"><span class="pal">'+p.name+(p.isBodyPalace?'<i>(Thân)</i>':'')+'</span>'+
      '<span class="dv">'+dv+'</span></div>';
    cell.onclick=function(){ openPalace(p); };
    wrap.appendChild(cell);
  });
  // center info
  var mid=document.createElement('div');
  mid.className='center-block';
  mid.innerHTML=
    '<div class="center-top">Lá Số Tử Vi</div>'+
    '<div class="meta">'+
    '<b>Can chi:</b> '+G.chineseDate+'<br>'+
    '<b>Dương:</b> '+fmtDate(G.solarDate)+'<br>'+
    '<b>Âm:</b> '+G.lunarDate+' '+G.time+'<br>'+
    '<b>Mệnh:</b> '+G.soul+' · <b>Thân:</b> '+G.body+'<br>'+
    '<b>Cục:</b> '+G.fiveElementsClass+'<br>'+
    '<b>Chiếu Mệnh:</b> '+G.sign+' ('+G.zodiac+')'+
    '</div>';
  mid.style.gridColumn='2 / span 2'; mid.style.gridRow='2 / span 2';
  wrap.appendChild(mid);
}

function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function md2html(md){
  return esc(md).split('\n').map(function(l){
    var t=l.trim();
    if(t.indexOf('### ')===0) return '<h5>'+t.slice(4)+'</h5>';
    if(t.indexOf('## ')===0) return '<h4>'+t.slice(3)+'</h4>';
    if(t.indexOf('# ')===0) return '<h4>'+t.slice(2)+'</h4>';
    if(t==='') return '';
    return '<p>'+t+'</p>';
  }).join('');
}

function openPalace(p){
  var b=$('#tabDetail');
  var h='<h3>'+p.name+' · '+p.heavenlyStem+' '+p.earthlyBranch+'</h3>';
  p.majorStars.forEach(function(st){
    var bt=st.brightness?(' ('+st.brightness+')'):'', mg=st.mutagen?(' — hóa '+st.mutagen):'';
    var lu=luanOf(st.name)||('(Độ '+(st.brightness||'?')+': '+'tra độ sáng để biết mạnh yếu; xem tam hợp/xung bên dưới.)');
    h+='<div class="luan-block"><h4>'+st.name+bt+mg+'</h4>'+md2html(lu)+'</div>';
  });
  // tam hợp / xung
  var i=p.index, th=[G.palaces[(i+4)%12],G.palaces[(i+8)%12]], xk=G.palaces[(i+6)%12];
  function nm(x){return x.name+' ('+x.earthlyBranch+'): '+x.majorStars.map(function(s){return s.name;}).join(',');}
  h+='<div class="pal-note"><b>Tam hợp:</b> '+nm(th[0])+' + '+nm(th[1])+'<br><b>Xung chiếu:</b> '+nm(xk)+'</div>';
  b.innerHTML=h;
  showTab('detail');
}

// tứ hóa theo CAN (Lộc,Quyền,Khoa,Kỵ) — trích iztro, khớp 四化 kinh điển
var TUHOA={
'Giáp':['Liêm Trinh','Phá Quân','Vũ Khúc','Thái Dương'],
'Ất':['Thiên Cơ','Thiên Lương','Tử Vi','Thái Âm'],
'Bính':['Thiên Đồng','Thiên Cơ','Văn Xương','Liêm Trinh'],
'Đinh':['Thái Âm','Thiên Đồng','Thiên Cơ','Cự Môn'],
'Mậu':['Tham Lang','Thái Âm','Hữu Bật','Thiên Cơ'],
'Kỷ':['Vũ Khúc','Tham Lang','Thiên Lương','Văn Khúc'],
'Canh':['Thái Dương','Vũ Khúc','Thái Âm','Thiên Đồng'],
'Tân':['Cự Môn','Thái Dương','Văn Khúc','Văn Xương'],
'Nhâm':['Thiên Lương','Tử Vi','Tả Phù','Vũ Khúc'],
'Quý':['Phá Quân','Cự Môn','Thái Âm','Tham Lang']
};
var NHAN=['Lộc','Quyền','Khoa','Kỵ'];

// đại vận 12 cung
function renderDecadal(){
  var bornYear=parseInt(G.solarDate.split('-')[0],10);
  var ageNow=(new Date()).getFullYear()-bornYear+1;
  var h='<table class="dvt"><tr><th>Cung</th><th>Can chi ĐV</th><th>Tuổi</th><th>Tứ hóa đại vận</th></tr>';
  G.palaces.forEach(function(p){
    var rg=p.decadal&&p.decadal.range?p.decadal.range:[0,0];
    var r=(rg[0]+'–'+rg[1]);
    var cc=p.decadal?(p.decadal.heavenlyStem+' '+p.decadal.earthlyBranch):'—';
    var th=p.decadal?TUHOA[p.decadal.heavenlyStem]:null;
    var mu='—';
    if(th){ mu=NHAN.map(function(n,i){return n+': '+th[i];}).join(' · '); }
    var hot=(ageNow>=rg[0]&&ageNow<=rg[1])?' style="background:#2a2410"':'';
    h+='<tr'+hot+'><td>'+p.name+(hot?' ⬅':'')+'</td><td>'+cc+'</td><td>'+r+'</td><td>'+mu+'</td></tr>';
  });
  h+='</table><div class="note">Bạn hiện '+ageNow+' tuổi, đang ứng đại vận cung có đánh dấu ⬅.</div>';
  $('#tabDv').innerHTML=h;
}

function showTab(t){
  $$('.tabbtn').forEach(function(x){x.classList.remove('on');});
  var b=$('.tabbtn[data-tab="'+t+'"]'); if(b)b.classList.add('on');
  $('#tabChart').style.display=(t==='chart')?'grid':'none';
  $('#tabDetail').style.display=(t==='detail')?'block':'none';
  $('#tabDv').style.display=(t==='dv')?'block':'none';
  var pn=$('#tabHn'); if(pn)pn.style.display=(t==='hn')?'block':'none';
}

// Hạn năm: sao lưu tinh + tứ hóa năm rơi vào cung nào
function renderHN(year){
  var h;
  try{ h=G.horoscope(year+'-06-01'); }catch(e){ h=G.horoscope(G.solarDate); }
  var y=h.yearly;
  var mn=y.mutagen||[];
  function tagStar(s){
    var i=mn.indexOf(s.name);
    return i>=0?('<b class="mut">'+s.name+' ('+NHAN[i]+')</b>'):s.name;
  }
  var out='<table class="dvt"><tr><th>Cung</th><th>Ứng Hạn (chiếu)</th><th>Sao Hạn năm rơi vào</th></tr>';
  G.palaces.forEach(function(p,idx){
    var stars=(y.stars[idx]||[]).map(tagStar).join(', ')||'—';
    out+='<tr><td>'+p.name+'</td><td>'+y.palaceNames[idx]+'</td><td>'+stars+'</td></tr>';
  });
  out+='</table><div class="note">Năm '+y.heavenlyStem+' '+y.earthlyBranch+' ('+year+'). Tứ hóa năm: '+mn.map(function(s,i){return NHAN[i]+'→'+s;}).join(' · ')+'. Xem cung nào có sao đỏ mà luận.</div>';
  $('#tabHn').innerHTML=out;
}

function draw(){
  var d=$('#d').value, g=$('#g').value, h=parseInt($('#h').value,10);
  if(!d){$('#err').textContent='Chọn ngày sinh';return;}
  var ast;
  try{ast=A.bySolar(d,h,g,true,LANG);}catch(e){$('#err').textContent='Lỗi: '+e.message;return;}
  $('#err').textContent='';
  G=ast;
  renderGrid();
  renderDecadal();
  renderHN(new Date().getFullYear());
  openPalace(ast.palaces.filter(function(x){return x.name==='Mệnh';})[0]);
  $('#out').hidden=false;
  showTab('chart');
}

document.addEventListener('DOMContentLoaded',function(){
  var hs=$('#h');
  var HO=[
   ['Giờ Tý','00:00–00:59 (Tý sớm)'],['Giờ Sửu','01:00–02:59'],['Giờ Dần','03:00–04:59'],
   ['Giờ Mão','05:00–06:59'],['Giờ Thìn','07:00–08:59'],['Giờ Tỵ','09:00–10:59'],
   ['Giờ Ngọ','11:00–12:59'],['Giờ Mùi','13:00–14:59'],['Giờ Thân','15:00–16:59'],
   ['Giờ Dậu','17:00–18:59'],['Giờ Tuất','19:00–20:59'],['Giờ Hợi','21:00–22:59'],
   ['Giờ Tý','23:00–23:59 (Tý muộn)']];
  HO.forEach(function(t,i){var o=document.createElement('option');o.value=i;o.textContent=t[0]+' '+t[1];hs.appendChild(o);});
  hs.value='7'; // Mùi mặc định
  $('#f').addEventListener('submit',function(e){e.preventDefault();draw();});
  $$('.tabbtn').forEach(function(b){b.onclick=function(){showTab(b.dataset.tab);};});
  var n=new Date();
  $('#d').value=n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');
});
