import {LAYOUTS,findKey,FINGER_NAMES,numberRow} from './data.mjs';
import {homePoint,keyPoint,handOffset,jointPose,posePoints,fingerOutline,crease,thumbPoints,strokePhase,interpolatePose,projectHandPoints,hintKeys} from './hand-model.mjs';
import {handSilhouette} from './hand-silhouette.mjs';
import {keyBox,modifierBoxes} from './mac-geometry.mjs';
import {SWITCHES} from './typing-audio.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const controllers=new WeakMap();
function cap(char,alt,row,col,box,{label=null,legend=null,kind='',home=false}={}){
 const {x,y,width,height}=box,dual=!!legend&&legend.toUpperCase()!==char.toUpperCase(),main=label??(dual?legend.toUpperCase():char.toUpperCase());
 return`<g class="key-cap ${kind}" data-row="${row}" data-col="${col}" transform="translate(${x} ${y})"><rect width="${width}" height="${height}" rx="5"/><text class="key-main" x="${dual?12:width/2}" y="${height/2+1}" ${dual?'text-anchor="start"':''}>${esc(main)}</text>${dual?`<text class="key-language" x="${width-9}" y="${height-10}">${esc(char.toUpperCase())}</text>`:''}${alt&&alt!==char.toUpperCase()&&!label&&!dual?`<text class="key-alt" x="${width/2}" y="10">${esc(alt)}</text>`:''}${home?`<path class="home-mark" d="M${width/2-4} ${height-6}h8"/>`:''}</g>`;
}
const functionIcons=[
 '<circle cx="0" cy="0" r="3"/><path d="M0-7v2m0 10v2m-7-7h2m10 0h2m-12-5 2 2m6 6 2 2m-10 0 2-2m6-6 2-2"/>',
 '<circle cx="0" cy="0" r="4"/><path d="M0-8v2m0 12v2m-8-8h2m12 0h2m-14-6 2 2m8 8 2 2m-12 0 2-2m8-8 2-2"/>',
 '<rect x="-7" y="-5" width="8" height="7"/><rect x="-1" y="-1" width="8" height="6"/>',
 '<circle cx="-2" cy="-2" r="5"/><path d="m2 2 5 5"/>',
 '<rect x="-3" y="-7" width="6" height="10" rx="3"/><path d="M-6 0a6 6 0 0 0 12 0M0 6v2m-3 0h6"/>',
 '<path d="M4-7a8 8 0 1 0 3 12A7 7 0 0 1 4-7Z"/>',
 '<path d="M-7-5v10M0-5l-6 5 6 5Zm7 0L1 0l6 5Z"/>',
 '<path d="m-7-5 6 5-6 5ZM3-5v10m4-10v10"/>',
 '<path d="M7-5v10M0-5l6 5-6 5Zm-7 0 6-5-6-5Z"/>',
 '<path d="M-7-3h4l4-4v14l-4-4h-4Zm11 0 5 6m0-6-5 6"/>',
 '<path d="M-7-3h4l4-4v14l-4-4h-4Zm11 0q4 3 0 6"/>',
 '<path d="M-7-3h4l4-4v14l-4-4h-4Zm11 0q4 3 0 6m3-9q7 6 0 12"/>'
];
function functionRow(){
 let markup=cap('','',-3,0,{x:5,y:8,width:70,height:28},{label:'esc',kind:'function-key'});
 for(let i=0;i<12;i++){const x=80+i*50;markup+=`<g class="key-cap function-key" data-row="-3" data-col="${i+1}" transform="translate(${x} 8)"><rect width="45" height="28" rx="5"/><g class="function-symbol" transform="translate(22.5 10)">${functionIcons[i]}</g><text class="function-name" x="22.5" y="23">F${i+1}</text></g>`;}
 return markup+`<g class="key-cap touch-id" data-row="-3" data-col="13" transform="translate(680 8)"><rect width="70" height="28" rx="5"/><circle cx="35" cy="14" r="9"/></g>`;
}


function fingerMarkup(i){const points=projectHandPoints(posePoints(i,jointPose(i,homePoint(i),12)));return`<g class="articulated-finger" data-finger="${i}"><path class="finger-skin" d="${fingerOutline(points,i)}"/><path class="finger-edge" d="${fingerOutline(points,i)}"/><path class="joint-crease pip" d="${crease(points,i,1)}"/><path class="joint-crease dip" d="${crease(points,i,2)}"/><ellipse class="joint-pad"/><ellipse class="fingernail"/></g>`;}
function thumbMarkup(){const points=projectHandPoints(thumbPoints());return`<g class="thumb"><path class="thumb-skin" d="${fingerOutline(points,8)}"/><path class="joint-crease" d="${crease(points,8,1)}"/><ellipse class="fingernail"/></g>`;}
export function keyboardMarkup(layout,settings={}){
 const l=LAYOUTS[layout],n=numberRow(layout),english=LAYOUTS.qwerty;let keys=functionRow();
 const printed=layout==='йцукен'?numberRow('qwerty'):n;
 keys+=[...printed.base].map((c,i)=>cap(layout==='йцукен'&&i===0?'ё':c,printed.shift[i],-1,i,keyBox(-1,i),{legend:layout==='йцукен'&&i===0?c:null})).join('');
 keys+=cap('','',-2,0,{x:655,y:46,width:95,height:44},{label:'delete',kind:'modifier-key'});
 keys+=cap('','',-2,1,{x:5,y:96,width:70,height:44},{label:'⇥',kind:'modifier-key'});
 keys+=cap('','',-2,2,{x:5,y:146,width:82.5,height:44},{label:'⇪',kind:'modifier-key'});
 keys+=l.rows.map((row,r)=>[...row].map((c,i)=>cap(c,l.shift[r][i],r,i,keyBox(r,i),{legend:layout==='йцукен'?english.rows[r][i]:null,home:r===1&&(i===3||i===6)})).join('')).join('');
 keys+=cap('\\','|',5,0,keyBox(5,0));
 keys+=cap('','',-2,3,{x:642.5,y:146,width:107.5,height:44},{label:'return ↵',kind:'modifier-key'});
 keys+=cap('','',4,0,keyBox(4,0),{label:'⇧ shift',kind:'modifier-key'})+cap('','',4,1,keyBox(4,1),{label:'shift ⇧',kind:'modifier-key'});
 keys+=cap(' ','',3,0,keyBox(3,0),{label:'',kind:'space-key'});
 const labels={fn:'fn',control:'⌃',option:'⌥',command:'⌘',left:'◀',up:'▲',down:'▼',right:'▶'};
 keys+=modifierBoxes().map(([name,box],i)=>{let html=cap('','',6,i,box,{label:labels[name],kind:'modifier-key '+name});if(name==='fn')html=html.replace('</g>','<g class="function-symbol globe-symbol" transform="translate(34 32)"><circle r="5"/><ellipse rx="2.5" ry="5"/><path d="M-5 0h10"/></g></g>');else if(['control','option','command'].includes(name))html=html.replace('</g>',`<text class="modifier-title" x="${box.width/2}" y="9">${name}</text></g>`);return html;}).join('');
 return`<div class="keyboard-wrap mac-keyboard"><div class="keyboard-model"><span>MacBook Air M1</span><span>ANSI · ${esc(l.name)}</span></div><div class="keyboard-sound-toolbar"><button class="keyboard-sound-button" data-action="sound-settings" aria-label="Настроить свитчи и звук"><i class="switch-profile-dot" aria-hidden="true"></i><span class="current-switch">${SWITCHES[settings.keyboardSwitch]?.name||'MacBook'}</span><span class="sound-mode-value">${({off:'Звук выключен',normal:'Обычный звук',gachi:'Особый звук'})[settings.soundMode]||'Звук выключен'}</span><span aria-hidden="true">⌄</span></button><button class="outline-button enable-sound" data-action="enable-sound" ${settings.soundMode&&settings.soundMode!=='off'?'hidden':''}>Включить звук</button></div><svg viewBox="0 0 760 420" class="keyboard-svg articulated-keyboard" role="img" aria-label="Клавиатура MacBook Air M1 ANSI, ${esc(l.name)}, и подсказка движений рук"><defs><linearGradient id="handSkin" gradientUnits="userSpaceOnUse" x1="100" y1="165" x2="265" y2="525"><stop stop-color="color-mix(in srgb,var(--hand-fill) 80%,white)"/><stop offset=".48" stop-color="var(--hand-fill)"/><stop offset="1" stop-color="color-mix(in srgb,var(--hand-fill) 60%,var(--bg))"/></linearGradient><linearGradient id="wholeHandFade" gradientUnits="userSpaceOnUse" x1="0" y1="240" x2="0" y2="420"><stop stop-color="white"/><stop offset=".65" stop-color="white" stop-opacity=".85"/><stop offset="1" stop-color="black"/></linearGradient><mask id="handOpacityMask"><rect width="760" height="420" fill="url(#wholeHandFade)"/></mask></defs><g class="key-layer">${keys}</g><g class="hands-layer" mask="url(#handOpacityMask)"><g id="leftHand"><path class="hand-silhouette"/><path class="palm-detail" d="M128 302 Q137 323 131 342 M178 310 Q190 340 183 356 M227 305 Q245 328 247 350 M258 340 Q249 361 235 372"/>${[0,1,2,3].map(fingerMarkup).join('')}<g id="leftThumb">${thumbMarkup()}</g></g><g id="rightHand"><g transform="translate(680 0) scale(-1 1)"><path class="hand-silhouette"/><path class="palm-detail" d="M128 302 Q137 323 131 342 M178 310 Q190 340 183 356 M227 305 Q245 328 247 350 M258 340 Q249 361 235 372"/></g>${[4,5,6,7].map(fingerMarkup).join('')}<g transform="translate(680 0) scale(-1 1)"><g id="rightThumb">${thumbMarkup()}</g></g></g></g></svg><p class="finger-hint" id="fingerHint"></p><p class="hand-caption">Домашний ряд: F и J · подсказка по стандартной карте пальцев</p></div>`;
}
function controller(wrap){let c=controllers.get(wrap);if(c)return c;c={wrap,target:null,hints:[],pressed:null,pressUntil:0,errorFlashes:new Map(),motion:true,frame:null,time:0,poses:Array.from({length:8},(_,i)=>jointPose(i,homePoint(i),12)),offsets:[[0,0],[0,0]],strokes:Array(8).fill(null),thumbStroke:null,thumb:0};controllers.set(wrap,c);return c;}
function draw(c,time){
 if(!c.wrap.isConnected){c.frame=null;return;}
 const dt=Math.min(32,time-c.time||16),factor=c.motion?1-Math.exp(-dt/55):1,poseFactor=c.motion?1-Math.exp(-dt/60):1;c.time=time;let unsettled=false;const handPoints=[];
 for(let i=0;i<8;i++){const stroke=c.strokes[i];if(stroke&&strokePhase(time-stroke.start).done)c.strokes[i]=null;else if(stroke&&c.motion)unsettled=true;}
 for(let hand=0;hand<2;hand++){
  const moving=c.motion?c.strokes.slice(hand*4,hand*4+4).filter(Boolean).sort((a,b)=>b.start-a.start)[0]:null;
  const hint=c.hints.find(key=>(key.finger<4?0:1)===hand),preview=hint?handOffset(hint):[0,0],amount=moving?strokePhase(time-moving.start).amount:0,pressed=moving?handOffset(moving.key):preview;
  const goal=preview.map((v,axis)=>v+(pressed[axis]-v)*amount+(hand===0&&axis===1&&c.thumbStroke?2*strokePhase(time-c.thumbStroke).amount:0));
  for(let axis=0;axis<2;axis++){c.offsets[hand][axis]+=(goal[axis]-c.offsets[hand][axis])*factor;if(Math.abs(c.offsets[hand][axis]-goal[axis])>.05)unsettled=true;}
  c.wrap.querySelector(hand?'#rightHand':'#leftHand').setAttribute('transform',`translate(${c.offsets[hand].join(' ')})`);
 }
 for(let i=0;i<8;i++){
  const stroke=c.motion?c.strokes[i]:null,phase=stroke?strokePhase(time-stroke.start):null,hand=i<4?0:1,hint=c.hints.find(key=>key.finger===i);
  const preview=hint?jointPose(i,keyPoint(hint).map((v,axis)=>v-c.offsets[hand][axis]),8):jointPose(i,homePoint(i),12);
  let goal=preview;
  if(stroke){const contact=jointPose(i,keyPoint(stroke.key).map((v,axis)=>v-c.offsets[hand][axis]),0);goal=time-stroke.start<=100?interpolatePose(stroke.from,contact,phase.amount):interpolatePose(preview,contact,phase.amount);}
  // A held hint remains over the upcoming key. Each stroke then returns to that hint.
  const pose=stroke?goal:interpolatePose(c.poses[i],goal,poseFactor);
  if(c.motion&&Object.keys(pose).some(k=>Math.abs(pose[k]-goal[k])>.001))unsettled=true;
  c.poses[i]=pose;const points=projectHandPoints(posePoints(i,pose)),finger=c.wrap.querySelector(`[data-finger="${i}"]`);
  handPoints[i]=points;finger.dataset.mcp=pose.pitch.toFixed(3);finger.dataset.pip=pose.flex.toFixed(3);finger.dataset.dip=(pose.flex*.65).toFixed(3);
  finger.dataset.tipX=(points[3][0]+c.offsets[hand][0]).toFixed(2);finger.dataset.tipY=(points[3][1]+c.offsets[hand][1]).toFixed(2);
  finger.classList.toggle('active-finger',!!hint||!!stroke);finger.classList.toggle('finger-press',!!phase?.contact);
  const outline=fingerOutline(points,i);for(const selector of ['.finger-skin','.finger-edge'])finger.querySelector(selector).setAttribute('d',outline);
  finger.querySelector('.pip').setAttribute('d',crease(points,i,1));finger.querySelector('.dip').setAttribute('d',crease(points,i,2));
  const tip=points[3],dx=points[0][0]-tip[0],dy=points[0][1]-tip[1],length=Math.hypot(dx,dy)||1,angle=Math.atan2(-dx,dy)*180/Math.PI;
  const curl=Math.abs(Math.cos(pose.pitch-1.65*pose.flex)),nailLength=Math.max(4.5,10*curl),nx=tip[0]+dx/length*(nailLength+2),ny=tip[1]+dy/length*(nailLength+2);
  for(const [attr,value] of Object.entries({cx:nx,cy:ny,rx:i===0||i===7?6.5:8,ry:nailLength,transform:`rotate(${angle} ${nx} ${ny})`}))finger.querySelector('.fingernail').setAttribute(attr,value);
  const joint=points[1];for(const [attr,value] of Object.entries({cx:joint[0],cy:joint[1],rx:i===0||i===7?8:10,ry:3,transform:`rotate(${angle} ${joint[0]} ${joint[1]})`}))finger.querySelector('.joint-pad').setAttribute(attr,value);
 }
 const thumbPhase=c.thumbStroke?strokePhase(time-c.thumbStroke):null;if(thumbPhase?.done)c.thumbStroke=null;
 const thumbPreview=c.target?.finger===8?.8:0,thumbGoal=c.motion?thumbPreview+(1-thumbPreview)*(thumbPhase?.amount||0):thumbPreview;c.thumb+=(thumbGoal-c.thumb)*factor;if(Math.abs(c.thumb-thumbGoal)>.001||c.thumbStroke)unsettled=true;
 for(const [id,amount] of [['leftThumb',c.thumb],['rightThumb',0]]){const thumb=c.wrap.querySelector('#'+id),points=projectHandPoints(thumbPoints(amount)),tip=points.at(-1);thumb.querySelector('.thumb-skin').setAttribute('d',fingerOutline(points,8));thumb.querySelector('.joint-crease').setAttribute('d',crease(points,8,1));const nail=thumb.querySelector('.fingernail');for(const [attr,value] of Object.entries({cx:tip[0]-4,cy:tip[1]+8,rx:7,ry:8,transform:`rotate(27 ${tip[0]-4} ${tip[1]+8})`}))nail.setAttribute(attr,value);thumb.classList.toggle('active-thumb',amount>.1);}
 const leftThumbPoints=projectHandPoints(thumbPoints(c.thumb)),rightThumbPoints=projectHandPoints(thumbPoints());
 c.wrap.querySelector('#leftHand .hand-silhouette').setAttribute('d',handSilhouette(handPoints.slice(0,4),leftThumbPoints));
 c.wrap.querySelector('#rightHand .hand-silhouette').setAttribute('d',handSilhouette([7,6,5,4].map(i=>handPoints[i].map(([x,y,z])=>[680-x,y,z])),rightThumbPoints));
 if(time>=c.pressUntil)c.wrap.querySelectorAll('.key-cap.pressed').forEach(k=>k.classList.remove('pressed'));else unsettled=true;
 for(const [cap,until] of c.errorFlashes){if(time>=until){cap.classList.remove('wrong-key');c.errorFlashes.delete(cap);}else unsettled=true;}
 c.frame=unsettled?requestAnimationFrame(t=>draw(c,t)):null;
}
function schedule(c){if(c.frame===null)c.frame=requestAnimationFrame(t=>draw(c,t));}
export function updateKeyboard(root,layout,char,{keyboard=true,hands=true,handsMotion=true,hintMode='always',reveal=false,keyboardSwitch='mac',soundMode='off'}={}){
 const wrap=root.querySelector('.keyboard-wrap');if(!wrap)return;wrap.dataset.switch=keyboardSwitch;wrap.querySelector('.current-switch').textContent=SWITCHES[keyboardSwitch]?.name||'MacBook';wrap.querySelector('.sound-mode-value').textContent=({off:'Звук выключен',normal:'Обычный звук',gachi:'Особый звук'})[soundMode]||'Звук выключен';const enable=wrap.querySelector('.enable-sound');if(enable)enable.hidden=soundMode!=='off';wrap.hidden=!keyboard||hintMode!=='always'&&!reveal;wrap.classList.toggle('no-hands',!hands);if(wrap.hidden)return;
 const c=controller(wrap),key=findKey(char||'',layout);c.target=key;c.hints=hintKeys(key);c.motion=handsMotion&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 wrap.querySelectorAll('.key-cap.target,.key-cap.shift-target').forEach(k=>k.classList.remove('target','shift-target'));
 if(key){wrap.querySelector(`.key-cap[data-row="${key.row}"][data-col="${key.col}"]`)?.classList.add('target');if(key.shift)wrap.querySelector(`.key-cap[data-row="4"][data-col="${key.finger<4?1:0}"]`)?.classList.add('shift-target');}
 wrap.querySelector('#fingerHint').textContent=key?`Нажми ${char===' '?'пробел':char.toUpperCase()} · ${FINGER_NAMES[key.finger].toLowerCase()}${key.shift?' · Shift другой рукой':''}`:char?`Набери «${char}»`:'Пальцы спокойно лежат на F и J';schedule(c);
}
export function pressKeyboard(root,layout,char,settings,{wrong=false}={}){
 const wrap=root.querySelector('.keyboard-wrap');if(!wrap||wrap.hidden)return;const key=findKey(char,layout);if(!key)return;const c=controller(wrap),time=performance.now();
 if(wrong){const cap=wrap.querySelector(`.key-cap[data-row="${key.row}"][data-col="${key.col}"]`);if(cap){cap.classList.add('wrong-key');c.errorFlashes.set(cap,time+260);}schedule(c);return;}
 c.pressed=key;c.pressUntil=time+110;
 if(key.finger<8)c.strokes[key.finger]={key,start:time,from:{...c.poses[key.finger]}};else c.thumbStroke=time;
 if(key.shift){const i=key.finger<4?7:0;c.strokes[i]={key:{finger:i,row:4,col:i===7?1:0},start:time,from:{...c.poses[i]}};}
 wrap.querySelectorAll('.key-cap.pressed').forEach(k=>k.classList.remove('pressed'));wrap.querySelector(`.key-cap[data-row="${key.row}"][data-col="${key.col}"]`)?.classList.add('pressed');schedule(c);
}
