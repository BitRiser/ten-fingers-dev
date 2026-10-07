import {SAMPLE_ACCURACY} from './core.mjs';
import {LESSON_GROUPS,STEP_NAMES,mapPhysicalKeys} from './data.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const CHAPTER_NAMES=['Первые клавиши','Следующие клавиши','Расширяем навык','Ловим ритм','Продолжаем путь','Новые сочетания','Собираем слова','Ещё немного практики','Правая сторона','Уверенный набор','Последние клавиши'];
export function lessonRoute(lessons,layout){
 let next=null,number=0,completed=0;
 const groups=LESSON_GROUPS.map(([keys,count],group)=>({group,keys:mapPhysicalKeys(keys,layout),steps:Array.from({length:count},(_,step)=>{
  const record=lessons[`${layout}:${group}:${step}`],passed=!!record?.passed;
  if(passed)completed++;const current=!passed&&!next;
  const node={group,step,number:++number,name:STEP_NAMES[step],record,status:passed?'done':current?'current':'locked'};
  if(current)next=node;return node;
 })}));
 return{groups,next,completed,total:number,percent:Math.round(completed/number*100)};
}
function position(i,columns){const row=Math.floor(i/columns),column=row%2?columns-1-i%columns:i%columns;return[column*120+60,row*94+43];}
function mapMarkup(steps,columns){
 const points=steps.map((_,i)=>position(i,columns)),height=Math.ceil(steps.length/columns)*94;
 return `<div class="route-map route-${columns}" style="--route-height:${height}px"><svg viewBox="0 0 ${columns*120} ${height}" aria-hidden="true" preserveAspectRatio="none">${points.slice(1).map(([x,y],i)=>{const [px,py]=points[i];return `<path class="route-edge ${steps[i].status==='done'?'traveled':''}" d="M${px} ${py} ${py===y?`L${x} ${y}`:`C${px} ${py+47} ${x} ${y-47} ${x} ${y}`}"/>`;}).join('')}</svg>${steps.map((node,i)=>{const [x,y]=points[i];return `<div class="route-stop ${node.status}" style="left:${x/(columns*120)*100}%;top:${y-21.5}px"><button class="route-node ${node.status}" data-group="${node.group}" data-step="${node.step}" ${node.status==='locked'?'disabled':''} ${node.status==='current'?'aria-current="step"':''} aria-label="Этап ${node.group+1}.${node.step+1}: ${esc(node.name)}${node.status==='done'?', пройден':node.status==='locked'?', пройди предыдущий этап':', следующий'}"><span>${node.status==='done'?'✓':node.step+1}</span>${node.status==='current'?'<i class="route-player" aria-hidden="true">⌨</i>':''}</button><small>${node.status==='current'?'Сейчас':node.status==='done'?'Пройдено':''}</small></div>`;}).join('')}</div>`;
}
function chapterMarkup(group,expanded=false){
 const done=group.steps.filter(s=>s.status==='done').length,current=group.steps.find(s=>s.status==='current');
 return `<details class="journey-chapter ${current?'current-chapter':''}" data-chapter="${group.group}" ${current||expanded?'open':''}><i class="chapter-gate entry" aria-hidden="true"></i><summary><span class="chapter-marker">${done===group.steps.length?'✓':group.group+1}</span><span class="chapter-title"><strong>${esc(CHAPTER_NAMES[group.group])}</strong><small>Клавиши ${esc(group.keys.toUpperCase().split('').join(' · '))}</small></span><span class="chapter-score">${current?'Ты здесь · ':''}${done} / ${group.steps.length}</span></summary><div class="chapter-route"><p>${current?`Следующий шаг: <strong>${esc(current.name)}</strong>`:done===group.steps.length?'Глава пройдена. Любой шаг можно повторить.':'Эта глава откроется после предыдущей.'}</p>${mapMarkup(group.steps,4)}${mapMarkup(group.steps,3)}</div><i class="chapter-gate exit" aria-hidden="true"></i></details>`;
}
function bridge(group){const done=group.steps.every(s=>s.status==='done');return `<div class="route-bridge ${done?'traveled':''}" data-from-chapter="${group.group}" data-to-chapter="${group.group+1}" aria-hidden="true"><span>↓</span></div>`;}
function chaptersMarkup(groups,expanded=false){return groups.map((group,i)=>chapterMarkup(group,expanded)+(i<groups.length-1?bridge(group):'')).join('');}
export function lessonMapMarkup(lessons,layout){
 const route=lessonRoute(lessons,layout),next=route.next,currentIndex=next?.group??route.groups.length-1,current=route.groups[currentIndex],previous=route.groups.slice(0,currentIndex),visible=route.groups.slice(currentIndex,currentIndex+2),later=route.groups.slice(currentIndex+2);
 const keys=[...current.keys].map(c=>`<kbd>${esc(c.toUpperCase())}</kbd>`).join('');
 return `<section class="journey"><div class="journey-heading"><p class="eyebrow">УРОКИ С НУЛЯ</p><h2>${next?'Один маленький шаг за раз.':'Ты прошёл весь путь!'}</h2><p>${route.completed?'Продолжай с того места, где остановился. Здесь можно учиться в своём темпе.':'Начнём всего с нескольких клавиш. Руки покажут, куда нажимать. Скорость придёт с практикой.'}</p></div><div class="journey-progress-label"><strong>Глава ${currentIndex+1} из ${route.groups.length}</strong><span>Пройдено ${route.completed} ${route.completed===1?'этап':route.completed>1&&route.completed<5?'этапа':'этапов'}</span></div><div class="journey-progress" role="progressbar" aria-label="Прогресс курса" aria-valuemin="0" aria-valuemax="${route.total}" aria-valuenow="${route.completed}"><i style="width:${route.percent}%"></i></div><div class="journey-next"><div><small>${next?`Сейчас · шаг ${next.group+1}.${next.step+1}`:'Курс завершён'}</small><h3>${next?esc(next.name):'Продолжим в практике?'}</h3><p>${next?'Клавиши':'Ты освоил все клавиши'} <span class="journey-keys">${next?keys:''}</span></p><p>Без спешки. Точность важнее скорости.</p></div>${next?`<button class="primary-button" data-group="${next.group}" data-step="${next.step}">${route.completed?'Продолжить':'Начать первый урок'} →</button>`:'<button class="primary-button" data-view="practice">Открыть практику →</button>'}</div><div class="journey-track"><p class="journey-section-label">Твой маршрут · главы связаны по порядку</p>${previous.length?`<details class="journey-fold history"><summary>Пройденный путь · ${previous.length} глав ↓</summary>${chaptersMarkup(previous)}</details>${bridge(previous.at(-1))}`:''}${chaptersMarkup(visible,true)}${later.length?`${bridge(visible.at(-1))}<details class="journey-fold future"><summary>Посмотреть весь путь · ещё ${later.length} глав ↓</summary>${chaptersMarkup(later)}</details>`:''}</div><details class="journey-note"><summary>Как открываются следующие шаги?</summary><p>Две уверенные попытки подряд открывают следующий этап. Точность — от ${SAMPLE_ACCURACY}%, скорость растёт постепенно. Пройденные шаги можно повторять. Всего в курсе ${route.total} этап.</p></details></section>`;
}
// The actual last/first lesson nodes are the endpoints. Closed chapters use
// their header marker until opened, then the path follows the revealed node.
export function connectLessonMap(root){
 const track=root.querySelector('.journey-track');if(!track)return ()=>{};
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.classList.add('journey-links');svg.setAttribute('aria-hidden','true');track.prepend(svg);
 let frame=0;
 function visible(node){
  if(!node)return false;
  for(let parent=node.parentElement;parent&&parent!==track;parent=parent.parentElement){
   if(parent.tagName==='DETAILS'&&!parent.open&&!parent.querySelector(':scope > summary')?.contains(node))return false;
  }
  return node.getClientRects().length&&getComputedStyle(node).display!=='none';
 }
 function endpoint(chapter,last){
  if(!visible(chapter))return null;
  if(chapter.open){const nodes=[...chapter.querySelectorAll('.route-node')].filter(visible);if(nodes.length)return last?nodes.at(-1):nodes[0];}
  return chapter.querySelector('.chapter-marker');
 }
 function draw(){
  frame=0;if(!track.isConnected)return;svg.replaceChildren();const box=track.getBoundingClientRect();svg.setAttribute('width',box.width);svg.setAttribute('height',box.height);
  for(const bridge of track.querySelectorAll('.route-bridge')){
   const from=track.querySelector(`[data-chapter="${bridge.dataset.fromChapter}"]`),to=track.querySelector(`[data-chapter="${bridge.dataset.toChapter}"]`),a=endpoint(from,true),b=endpoint(to,false);
   if(!a||!b||!visible(bridge))continue;
   const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect(),x1=ra.left-box.left+ra.width/2,y1=ra.bottom-box.top,x2=rb.left-box.left,y2=rb.top-box.top+rb.height/2;
   const lane=-18,path=document.createElementNS(ns,'path'),bend=18;
   path.setAttribute('d',`M ${x1} ${y1} C ${x1+32} ${y1+7} ${x1+32} ${y1+32} ${x1} ${y1+32} L ${lane+bend} ${y1+32} Q ${lane} ${y1+32} ${lane} ${y1+32+bend} L ${lane} ${y2-bend} Q ${lane} ${y2} ${lane+bend} ${y2} L ${x2} ${y2}`);
   path.setAttribute('class','route-edge chapter-link'+(bridge.classList.contains('traveled')?' traveled':''));path.dataset.fromChapter=bridge.dataset.fromChapter;path.dataset.toChapter=bridge.dataset.toChapter;svg.append(path);
  }
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
 const observer=new ResizeObserver(schedule);observer.observe(track);root.addEventListener('toggle',schedule,true);window.addEventListener('resize',schedule);schedule();
 return ()=>{observer.disconnect();root.removeEventListener('toggle',schedule,true);window.removeEventListener('resize',schedule);cancelAnimationFrame(frame);};
}
