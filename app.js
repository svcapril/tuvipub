'use strict';
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
var A=iztro.astro, LANG='vi-VN';

var LUAN={
'Tử Vi':'Đế tinh: đứng đắn, muốn được nể, hợp làm chủ. Có Tả Hữu phụ tá mới thật quyền; đơn tinh thì danh trước hư sau.',
'Thiên Cơ':'Máy móc, tính nhanh, đa mưu thiếu quyết, đổi liên tục. Hợp phân tích, cố vấn, kỹ thuật.',
'Vũ Khúc':'Cứng, thực tế, giỏi tiền, chịu cô độc. Tài đến bằng sức mình, không bằng nịnh.',
'Thiên Đồng':'Hưởng thụ, né xung đột, cảm xúc dẫn đường. Đủ ăn thì an, thiếu thì than. Kỵ cạnh tranh khốc liệt.',
'Liêm Trinh':'Sắc, tham quyền, tình và pháp đan xen. Làm lớn phải giữ liêm, không thì dính tai tiếng.',
'Thiên Phủ':'Cái kho: quản tài giỏi, cầu an, chậm mà chắc, không mạo hiểm. Hợp quản thủ, điều hành.',
'Thái Dương':'Quang minh, trọng danh, thích thể hiện, bao đồng, hao tài vì thể diện. Nữ cần chồng thành đạt.',
'Thái Âm':'Tài kín, trực giác tốt, nặng tình gia đình. Nữ hiền đảm giữ của; nam đa tình.',
'Tham Lang':'Đa dục, ngoại giao, mê hưởng lạc, dễ dính tửu sắc. Có tu thì hóa quyền biến.',
'Cự Môn':'Khẩu nghiệp, hay nghi, lời sinh chuyện. Cách nghề ăn nói: luật, tư vấn, môi giới. Hóa Lộc thì khẩu nghiệp thành nghiệp kiếm tiền.',
'Thiên Tướng':'Trọng hình thức, thích làm trọng tài, bao che người dưới, sống vì danh phận.',
'Thiên Lương':'Thọ, che chở, bênh vực, gánh phần người. Hợp y, giáo dục. Tai qua nạn khỏi nhưng khổ ôm về mình.',
'Thất Sát':'Quyết liệt, đi thẳng, làm lớn hoặc hỏng lớn. Không chịu nhàn. Hợp lĩnh vực đối đầu.',
'Phá Quân':'Phá cái cũ mới có cái mới, không ở yên một chỗ. Đời có ít nhất một lần đổi lớn.',
'Tả Phụ':'Quý nhân phù trợ, được người giúp.',
'Hữu Bật':'Quý âm phù trợ, kín đáo giúp đỡ.',
'Văn Xương':'Văn chương, học hành, bằng cấp.',
'Văn Khúc':'Nghệ thuật, tài hoa, ca nhạc.',
'Thiên Khôi':'Quý nam giúp.',
'Thiên Việt':'Quý nữ giúp.',
'Kình Dương':'Hung燥, thị phi, tai nạn, cô khắc.',
'Đà La':'Ì ạch, dây dưa, âm ỉ trở ngại.',
'Hỏa Tinh':'Nóng nảy, đột biến.',
'Linh Tinh':'Bế tắc, uất ức.',
'Thiên Mã':'Dịch chuyển, đi lại, thay đổi nơi.',
'Thoát Thần':'Thoát nạn, di chuyển xa.',
'Thiên Khốc':'Phiền muộn, khóc.',
'Thiên Hư':'Hư hao, dở dang.',
'Tài Tinh':'Tài lộc nhỏ.',
'Thổ Linh':'Đất cát, mộ trạch.',
'Tam Thai':'Tăng chức.',
'Bát Tọa':'Địa vị.',
'Ân Quang':'Ân điển, quý nhân.',
'Thiên Quý':'Quý hiển.',
'Kiếp Sát':'Hao tán, cướp đoạt.',
'Địa Không':'Không trung gian hư.',
'Tượng_break':'',
'Kim Thần':'Tai ách.',
'Thiên Trù':'Lộc trời, ăn lộc.',
'Phong Cáo':'Sắc phong.',
'Giải Thần':'Giải tai ách.',
'Liêm' :'',
'Phượng Các':'QuÝ hiển.'
};
function luanOf(n){ if(LUAN[n]) return LUAN[n]; return null; }

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

function openPalace(p){
  var b=$('#tabDetail');
  var h='<h3>'+p.name+' · '+p.heavenlyStem+' '+p.earthlyBranch+'</h3>';
  p.majorStars.forEach(function(st){
    var bt=st.brightness?(' ('+st.brightness+')'):'', mg=st.mutagen?(' — hóa '+st.mutagen):'';
    var lu=luanOf(st.name)||('(Độ '+(st.brightness||'?')+': '+'tra độ sáng để biết mạnh yếu; xem tam hợp/xung bên dưới.)');
    h+='<h4>'+st.name+bt+mg+'</h4>'+lu+'<br>';
  });
  // tam hợp / xung
  var i=p.index, th=[G.palaces[(i+4)%12],G.palaces[(i+8)%12]], xk=G.palaces[(i+6)%12];
  function nm(x){return x.name+' ('+x.earthlyBranch+'): '+x.majorStars.map(function(s){return s.name;}).join(',');}
  h+='<div class="pal-note"><b>Tam hợp:</b> '+nm(th[0])+' + '+nm(th[1])+'<br><b>Xung chiếu:</b> '+nm(xk)+'</div>';
  b.innerHTML=h;
  showTab('detail');
}

// đại vận 12 cung
function renderDecadal(){
  var h='<table class="dvt"><tr><th>Cung</th><th>Can chi</th><th>Tuổi</th><th>Tứ hóa đại vận</th></tr>';
  G.palaces.forEach(function(p){
    var r=p.decadal&&p.decadal.range?(p.decadal.range[0]+'–'+p.decadal.range[1]):'—';
    var cc=p.decadal?(p.decadal.heavenlyStem+' '+p.decadal.earthlyBranch):'—';
    var mu=p.decadal&&p.decadal.mutagen?p.decadal.mutagen.join(', '):'—';
    h+='<tr><td>'+p.name+'</td><td>'+cc+'</td><td>'+r+'</td><td>'+mu+'</td></tr>';
  });
  h+='</table>';
  $('#tabDv').innerHTML=h;
}

function showTab(t){
  $$('.tabbtn').forEach(function(x){x.classList.remove('on');});
  var b=$('.tabbtn[data-tab="'+t+'"]'); if(b)b.classList.add('on');
  $('#tabChart').style.display=(t==='chart')?'grid':'none';
  $('#tabDetail').style.display=(t==='detail')?'block':'none';
  $('#tabDv').style.display=(t==='dv')?'block':'none';
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
