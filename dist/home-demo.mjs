import {keyboardMarkup,updateKeyboard,pressKeyboard} from './keyboard.mjs';
const settings={keyboard:true,hands:true,handsMotion:true,hintMode:'always',keyboardSwitch:'mac',soundMode:'off'};
export const DEMO_TEXTS=['const speed = 400;', 'return users.map(format);', 'if (ready) start();', 'let count = items.length;', 'await loadProject();', 'for (const key of keys)', 'print("hello, world")', 'vector<int> values;', 'const total = sum(data);', 'console.log("done");'];
let demoTextIndex=-1;
export function nextDemoText(previous='',random=Math.random){const choices=DEMO_TEXTS.filter(text=>text!==previous&&text!==DEMO_TEXTS[demoTextIndex]);const text=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];demoTextIndex=DEMO_TEXTS.indexOf(text);return text;}
export function homeDemoMarkup(){return `<figure class="home-demo" aria-label="От медленных нажатий к уверенному набору"><div class="demo-heading"><span>Так растёт твой навык</span><span class="demo-speed">35 CPM</span></div><div class="demo-source"><code><span class="demo-typed"></span><i aria-hidden="true"></i></code></div><div class="demo-keyboard">${keyboardMarkup('qwerty',settings)}</div><figcaption><span class="demo-phase">Первые нажатия · можно ошибаться</span><div class="demo-progress" aria-hidden="true"><i></i></div></figcaption></figure>`;}
export function demoState(seconds){
 const elapsed=Math.max(0,Math.min(20,seconds)),cpm=elapsed<6?35+elapsed*5:elapsed<12?65+(elapsed-6)*22.5:200+(elapsed-12)*25;
 return {cpm:Math.round(cpm),phase:elapsed<6?'Первые нажатия · можно ошибаться':elapsed<12?'Находим ритм · меньше ошибок':'Пишем уверенно · до 400 CPM',mistakes:elapsed<6,progress:elapsed/20};
}
export function mountHomeDemo(root){
 const demo=root.querySelector('.home-demo');if(!demo)return ()=>{};
 const keyboard=demo.querySelector('.demo-keyboard'),output=demo.querySelector('.demo-typed'),speed=demo.querySelector('.demo-speed'),phase=demo.querySelector('.demo-phase'),bar=demo.querySelector('.demo-progress i');
 let text=nextDemoText();const motion=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,start=null,last=0,index=0,pausedAt=null;
 updateKeyboard(keyboard,'qwerty',text[0],settings);
 function tick(now){
  if(!demo.isConnected)return;
  if(start===null)start=now;const seconds=((now-start)/1000)%22,state=demoState(seconds);
  speed.textContent=state.cpm+' CPM';phase.textContent=state.phase;bar.style.width=state.progress*100+'%';demo.classList.toggle('demo-beginner',state.mistakes);
  if(seconds>=20){if(index){text=nextDemoText(text);index=0;output.textContent='';}last=now;}
  else if(now-last>=60000/state.cpm){
   if(index>=text.length){index=0;text=nextDemoText(text);output.textContent='';}
   const char=text[index],wrong=state.mistakes&&index%3===1;
   pressKeyboard(keyboard,'qwerty',wrong?'x':char,settings,{wrong});
   const span=document.createElement('span');span.textContent=wrong?'x':char;if(wrong)span.className='demo-error';output.append(span);
   index++;last=now;updateKeyboard(keyboard,'qwerty',text[index%text.length],settings);
  }
  frame=requestAnimationFrame(tick);
 }
 function refresh(){cancelAnimationFrame(frame);if(document.hidden||motion.matches){pausedAt=performance.now();if(motion.matches){const s=demoState(20);speed.textContent='400 CPM';phase.textContent='От первых нажатий к уверенному набору';output.textContent=text;bar.style.width='100%';}return;}if(pausedAt!==null&&start!==null)start+=performance.now()-pausedAt;pausedAt=null;frame=requestAnimationFrame(tick);}
 document.addEventListener('visibilitychange',refresh);motion.addEventListener('change',refresh);refresh();
 return ()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',refresh);motion.removeEventListener('change',refresh);};
}
