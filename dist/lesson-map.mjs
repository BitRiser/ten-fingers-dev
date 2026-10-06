import {LESSON_GROUPS,STEP_NAMES,mapPhysicalKeys} from './data.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
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
function position(i,columns){const row=Math.floor(i/columns),column=row%2?columns-1-i%columns:i%columns;return[column*120+60,row*112+52];}
function mapMarkup(steps,columns){
 const points=steps.map((_,i)=>position(i,columns)),height=Math.ceil(steps.length/columns)*112;
 return `<div class="route-map route-${columns}" style="--route-height:${height}px"><svg viewBox="0 0 ${columns*120} ${height}" aria-hidden="true" preserveAspectRatio="none">${points.slice(1).map(([x,y],i)=>{const [px,py]=points[i];return `<path class="route-edge ${steps[i].status==='done'?'traveled':''}" d="M${px} ${py} ${py===y?`L${x} ${y}`:`C${px} ${py+56} ${x} ${y-56} ${x} ${y}`}"/>`;}).join('')}</svg>${steps.map((node,i)=>{const [x,y]=points[i];return `<div class="route-stop ${node.status}" style="left:${x/(columns*120)*100}%;top:${y-24.5}px"><button class="route-node ${node.status}" data-group="${node.group}" data-step="${node.step}" ${node.status==='locked'?'disabled':''} ${node.status==='current'?'aria-current="step"':''} aria-label="Этап ${node.group+1}.${node.step+1}: ${esc(node.name)}${node.status==='done'?', пройден':node.status==='locked'?', пройди предыдущий этап':', следующий'}"><span>${node.status==='done'?'✓':node.status==='locked'?'⌑':node.number}</span>${node.status==='current'?'<i class="route-player" aria-hidden="true">⌨</i>':''}</button><small>${esc(node.name)}</small></div>`;}).join('')}</div>`;
}
export function lessonMapMarkup(lessons,layout){
 const route=lessonRoute(lessons,layout),next=route.next;
 return `<section class="journey"><div class="journey-heading"><div><p class="eyebrow">ОБУЧЕНИЕ С НУЛЯ</p><h2>Твой путь к слепой печати</h2><p>Каждый этап знакомит с клавишами и закрепляет навык. Начни с выделенной точки.</p></div>${next?`<button class="primary-button" data-group="${next.group}" data-step="${next.step}">${route.completed?'Продолжить':'Начать обучение'} →</button>`:'<button class="primary-button" data-view="practice">Перейти к практике →</button>'}</div><div class="journey-progress-label"><strong>${route.percent}% курса пройдено</strong><span>${route.completed} из ${route.total} этапов</span></div><div class="journey-progress" role="progressbar" aria-label="Прогресс курса" aria-valuemin="0" aria-valuemax="${route.total}" aria-valuenow="${route.completed}"><i style="width:${route.percent}%"></i></div><div class="journey-chapters">${route.groups.map(group=>{const done=group.steps.filter(s=>s.status==='done').length,current=group.steps.some(s=>s.status==='current');return `<details class="journey-chapter ${current?'current-chapter':''}" ${current?'open':''}><summary><span class="chapter-marker">${done===group.steps.length?'✓':group.group+1}</span><span><strong>Клавиши ${esc(group.keys.toUpperCase().split('').join(' · '))}</strong><small>${current?'Ты здесь':done===group.steps.length?'Глава пройдена':'Следующая часть пути'}</small></span><span class="chapter-score">${done} / ${group.steps.length}</span></summary><div class="chapter-route">${mapMarkup(group.steps,4)}${mapMarkup(group.steps,3)}</div></details>`;}).join('')}</div><p class="journey-note">Две уверенные попытки подряд открывают следующий этап. Цель — точность от 95%; скорость постепенно растёт. Пройденные этапы можно повторять.</p></section>`;
}
