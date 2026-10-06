import {LANGUAGES,LAYOUTS} from './data.mjs';

export const ONBOARDING_VERSION=1;
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export function onboardingSeen(value){return value?.version===ONBOARDING_VERSION&&['completed','skipped'].includes(value.status);}
export function mergeOnboarding(local,remote){
 if(remote?.status==='completed'&&onboardingSeen(remote))return {...remote};
 if(onboardingSeen(local))return {...local};
 return onboardingSeen(remote)?{...remote}:null;
}
export function tutorialWords(layout){const home=LAYOUTS[layout].rows[1];return [home[3]+home[6],home[6]+home[3]];}
export class TutorialDrill{
 constructor(words){this.words=words;this.index=0;this.value='';}
 get done(){return this.index===this.words.length;}
 get expected(){return this.words[this.index]||'';}
 set(value){if(!this.done)this.value=value.normalize('NFC');}
 get correct(){return !this.done&&this.value===this.expected;}
 advance(){if(!this.correct)return false;this.index++;this.value='';return true;}
}

const labels=['Старт','Руки','Попробуй','Прогресс','Маршрут'];
export function createOnboarding(api){
 let active=false,step=0,lang='ru',selectedLayout='йцукен',path='lesson',drill=null;
 const dialog=()=>document.getElementById('dialog');
 const button=(action,text,style='outline-button')=>`<button class="${style}" data-onboard="${action}">${text}</button>`;
 function homeKeys(){return LAYOUTS[selectedLayout].rows[1];}
 function content(){
  const home=homeKeys(),left=[...home.slice(0,4)],right=[...home.slice(6,10)],anchors=[home[3],home[6]];
  if(step===0)return `<span class="onboarding-tag">&lt;/&gt; FIRST RUN</span><h3 id="onboardingHeading" tabindex="-1">Начнём с самого начала.</h3><p class="onboarding-lead">За пару минут разберёмся с тренажёром и попробуем печатать, глядя на экран.</p><div class="onboarding-promise"><span><b>01</b> Поставим руки</span><span><b>02</b> Наберём две пары букв</span><span><b>03</b> Выберем первый урок</span></div><h4>На каком языке хочешь учиться?</h4><div class="onboarding-languages" role="group" aria-label="Язык обучения">${['ru','en',...(lang==='fr'?['fr']:[])].map(id=>`<button data-onboard-language="${id}" aria-pressed="${lang===id}" class="${lang===id?'selected':''}"><b>${LANGUAGES[id].code}</b><span>${LANGUAGES[id].name}<small>${LAYOUTS[api.getData().settings.layouts[id]||LANGUAGES[id].layout].name}</small></span><i aria-hidden="true">${lang===id?'✓':'○'}</i></button>`).join('')}</div><p class="onboarding-note">RU / EN в шапке меняет язык упражнений. Раскладку на компьютере переключай отдельно. Прогресс каждого языка сохраняется отдельно.</p>`;
  if(step===1)return `<span class="onboarding-tag">// HOME ROW · ${esc(LAYOUTS[selectedLayout].name)}</span><h3 id="onboardingHeading" tabindex="-1">У каждого пальца своё место.</h3><p class="onboarding-lead">Найди выступы на клавишах <b>${esc(anchors[0].toUpperCase())}</b> и <b>${esc(anchors[1].toUpperCase())}</b> указательными пальцами. От них расставь остальные пальцы.</p><div class="onboarding-home"><div><span>Левая рука</span><div>${left.map(c=>`<kbd class="${c===anchors[0]?'anchor':''}">${esc(c.toUpperCase())}</kbd>`).join('')}</div><small>мизинец → указательный</small></div><div><span>Правая рука</span><div>${right.map(c=>`<kbd class="${c===anchors[1]?'anchor':''}">${esc(c.toUpperCase())}</kbd>`).join('')}</div><small>указательный → мизинец</small></div></div><div class="onboarding-space"><kbd>Пробел</kbd><span>Нажимай большим пальцем</span></div><p class="onboarding-note">Смотри на экран. Подсвеченная клавиша и палец под полем набора подскажут движение. После нажатия возвращай палец на домашний ряд.</p>`;
  if(step===2)return `<span class="onboarding-tag">// TRY IT · БЕЗ ТАЙМЕРА</span><h3 id="onboardingHeading" tabindex="-1">Две пары букв. Без спешки.</h3><p class="onboarding-lead">Набери выделенную пару и нажми <kbd>Пробел</kbd>. Ошибся? Исправь через <kbd>Backspace</kbd>. Здесь можно спокойно попробовать.</p><div class="onboarding-demo"><div class="onboarding-demo-bar"><span>first-steps.txt</span><span>${LANGUAGES[lang].code} · ${esc(LAYOUTS[selectedLayout].name)}</span></div><div id="onboardingWords" class="onboarding-words" aria-label="Образец для набора"></div><label for="onboardingInput">Твой ввод</label><input id="onboardingInput" class="onboarding-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Нажми здесь и начни печатать" aria-describedby="onboardingFeedback"><p id="onboardingFeedback" class="onboarding-feedback" role="status" aria-live="polite"></p></div><div class="onboarding-demo-actions">${button('reset','↻ Попробовать ещё раз','soft-button')}${button('skip-demo','Пропустить пример →','soft-button')}</div><p class="onboarding-note">Это знакомство с управлением: оно не влияет на скорость, образцы и статистику.</p>`;
  if(step===3){const goal=api.getData().settings.speedGoal;return `<span class="onboarding-tag">// READ YOUR PROGRESS</span><h3 id="onboardingHeading" tabindex="-1">Как понять, что получается?</h3><p class="onboarding-lead">В обычной практике сначала открыты пять букв. Тренажёр подбирает слова из знакомых клавиш и помогает освоить новые.</p><div class="onboarding-metrics"><div><b>CPM</b><span>Правильные знаки в минуту. Сейчас цель — ${Math.round(goal)} CPM.</span></div><div><b>95%</b><span>Ориентир точности. Исправленная опечатка остаётся в статистике ввода.</span></div><div><b>0 / 5</b><span>Образцы — качественные попытки для каждой буквы. Они показывают устойчивость навыка.</span></div></div><details class="onboarding-details"><summary>Когда засчитывается образец и открывается буква?</summary><p>Образец: от 70% цели (${Math.ceil(goal*.7)} CPM) для задания и буквы, точность ввода и с первого раза от 95%, все слова допечатаны и исправлены. Для измерения букву нужно верно набрать минимум дважды.</p><p>Новая буква: у каждой доступной буквы минимум пять образцов, а последняя качественная попытка достигает полной цели скорости. Нажимать случайные клавиши недостаточно.</p></details><p class="onboarding-note">Нажми на букву в практике, чтобы увидеть её прогресс. Результат упражнения остаётся на экране до твоего следующего действия.</p>`;}
  return `<span class="onboarding-tag">// YOUR NEXT STEP</span><h3 id="onboardingHeading" tabindex="-1">Теперь понятно, с чего начать.</h3><p class="onboarding-lead">Если ещё учишься положению пальцев, начни с первого урока. На знакомстве с клавишами нет требования к скорости.</p><div class="onboarding-paths" role="group" aria-label="Первое занятие">${[['lesson','01','Первый урок','Знакомство с клавишами по шагам. Рекомендуем для начала.'],['practice','02','Практика букв','Слова из доступных клавиш и постепенное открытие букв.'],['code','03','Практика кода','JavaScript, TypeScript, Python и символы. Для знакомых с клавиатурой.']].map(([id,n,title,copy])=>`<button data-onboard-path="${id}" aria-pressed="${path===id}" class="${path===id?'selected':''}"><b>${n}</b><span><strong>${title}</strong><small>${copy}</small></span><i aria-hidden="true">${path===id?'✓':'○'}</i></button>`).join('')}</div><p id="onboardingRouteNote" class="onboarding-note">${path==='code'?'Практика кода использует английскую раскладку.':'Выбран язык: '+esc(LANGUAGES[lang].name)+'.'} Обучение можно повторить через «Справка» → «Пройти обучение».</p>`;
 }
 function show(){
  api.openDialog('Знакомство с тренажёром',`<div class="onboarding-progress" aria-label="Шаг ${step+1} из 5">${labels.map((text,i)=>`<span class="${i===step?'current':i<step?'done':''}" ${i===step?'aria-current="step"':''}><b>${i<step?'✓':i+1}</b>${text}</span>`).join('')}</div><div class="onboarding-body">${content()}</div>`,`<div class="onboarding-footer"><button class="soft-button" data-onboard="skip">Пропустить обучение</button><div>${step?button('back','← Назад'):''}<button id="onboardingNext" class="primary-button" data-onboard="${step===4?'finish':'next'}" ${step===2&&!drill?.done?'disabled':''}>${step===4?'Начать занятие →':'Дальше →'}</button></div></div>`);
  dialog().classList.add('onboarding-dialog');dialog().setAttribute('aria-labelledby','onboardingHeading');
  if(step===2)bindDrill();
  document.getElementById('onboardingHeading').focus({preventScroll:true});
 }
 function updateDrill(message=''){
  const words=document.getElementById('onboardingWords');if(!words)return;
  words.innerHTML=drill.words.map((word,i)=>`<span class="${i<drill.index?'complete':i===drill.index?'current':''}">${[...word].map((char,j)=>`<i class="${i===drill.index&&j<drill.value.length?(drill.value[j]===char?'correct':'wrong'):''}">${esc(char)}</i>`).join('')}</span>`).join('');
  const feedback=document.getElementById('onboardingFeedback');feedback.textContent=message||(drill.done?'Получилось! Так устроен набор: буквы → пробел → следующее слово.':drill.correct?'Верно. Теперь нажми пробел.':drill.value&&!drill.expected.startsWith(drill.value)?'Есть опечатка. Исправь её с помощью Backspace.':`Сейчас набери «${drill.expected.toUpperCase()}» и нажми пробел.`);
  feedback.classList.toggle('success',drill.done);document.getElementById('onboardingInput').disabled=drill.done;document.getElementById('onboardingNext').disabled=!drill.done;
 }
 function bindDrill(){
  const input=document.getElementById('onboardingInput');input.value=drill.value;let composing=false;
  const accept=()=>{if(composing)return;const value=input.value.normalize('NFC');if(/\s/.test(value)){input.value=drill.value;updateDrill('Печатай текущую пару. Пробел нажми после неё.');return;}const expected=drill.expected,wrongScript=expected&&(/[а-яё]/iu.test(expected)&&/[a-z]/iu.test(value)||/[a-z]/iu.test(expected)&&/[а-яё]/iu.test(value));if(wrongScript){input.value=drill.value;updateDrill('Переключи раскладку на компьютере: '+LAYOUTS[selectedLayout].name+'.');return;}drill.set(value);updateDrill();};
  input.addEventListener('focus',()=>api.onTypingFocus?.());input.addEventListener('blur',()=>api.onTypingBlur?.());
  input.addEventListener('compositionstart',()=>{composing=true});input.addEventListener('compositionend',()=>{composing=false;accept()});input.addEventListener('input',accept);
  input.addEventListener('paste',e=>{e.preventDefault();updateDrill('Попробуй набрать пару с клавиатуры.');});input.addEventListener('drop',e=>e.preventDefault());
  input.addEventListener('keydown',e=>{if(e.isComposing||composing)return;api.onTypingKey?.(e);if(e.key===' '){e.preventDefault();if(drill.advance())input.value='';updateDrill();if(drill.done)document.getElementById('onboardingNext').focus();}else if(e.key==='Enter'){e.preventDefault();updateDrill('Для перехода к следующему слову нажми пробел.');}});
  updateDrill();
 }
 function start(){active=true;step=0;const s=api.getData().settings;lang=s.language;selectedLayout=s.layouts[lang];path='lesson';drill=new TutorialDrill(tutorialWords(selectedLayout));show();}
 function end(status,launch=false){
  if(!active)return;active=false;dialog().classList.remove('onboarding-dialog');dialog().removeAttribute('aria-labelledby');
  const data=api.getData();data.onboarding=mergeOnboarding({version:ONBOARDING_VERSION,status},data.onboarding);
  api.closeDialog();
  if(launch)api.launch(path,path==='code'?'en':lang,selectedLayout);
  api.persist();
 }
 function handleClick(b){
  if(b.dataset.action==='onboarding'){start();return true;}
  if(!active)return false;
  if(b.dataset.onboardLanguage){lang=b.dataset.onboardLanguage;selectedLayout=api.getData().settings.layouts[lang]||LANGUAGES[lang].layout;drill=new TutorialDrill(tutorialWords(selectedLayout));show();return true;}
  if(b.dataset.onboardPath){path=b.dataset.onboardPath;show();return true;}
  if(!b.dataset.onboard)return false;
  switch(b.dataset.onboard){case'back':step=Math.max(0,step-1);show();break;case'next':if(step===2&&!drill.done)return true;step=Math.min(4,step+1);show();break;case'skip-demo':step=3;show();break;case'reset':drill=new TutorialDrill(tutorialWords(selectedLayout));show();document.getElementById('onboardingInput').focus();break;case'skip':end('skipped');break;case'finish':end('completed',true);break;}
  return true;
 }
 return {start,handleClick,get active(){return active;},dismiss:()=>end('skipped'),maybeStart:()=>{if(!api.getData().recoveryNeeded&&!onboardingSeen(api.getData().onboarding))start();}};
}
