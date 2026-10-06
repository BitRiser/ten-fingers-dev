import {LANGUAGES,LAYOUTS,findKey,DEFAULT_SETTINGS,availableLayouts} from './data.mjs';
import {createProgress,generateWords,ensurePracticeProgress} from './core.mjs';

export const METRICS_VERSION=3;
export const CONTENT_VERSION='2026-10-a';
export const median=values=>{let a=values.filter(Number.isFinite).sort((a,b)=>a-b);return a.length?a.length%2?a[a.length>>1]:(a[a.length/2-1]+a[a.length/2])/2:null};
export const profileId=(lang,layout)=>lang+':'+layout;
export function ensureLearning(data){
 data.layoutProgress??={};data.learning??={};data.library??=[];
 for(let lang of Object.keys(LANGUAGES)){let id=profileId(lang,LANGUAGES[lang].layout);data.layoutProgress[id]??=data.progress[lang]||createProgress()}
 for(const [id,progress] of Object.entries(data.layoutProgress)){const [lang]=id.split(':');if(LANGUAGES[lang])ensurePracticeProgress(progress,lang,data.settings.speedGoal);}
 for(const [lang,progress] of Object.entries(data.progress))if(LANGUAGES[lang])ensurePracticeProgress(progress,lang,data.settings.speedGoal);
 return data;
}
export function progressFor(data,lang,layout){ensureLearning(data);return data.layoutProgress[profileId(lang,layout)]??=createProgress()}
export function learningFor(data,lang,layout){ensureLearning(data);return data.learning[profileId(lang,layout)]??={goal:'accuracy',minutes:5,configured:false,keys:{},pairs:{},activities:[],checks:[],seenChecks:[],diagnostics:[],plan:null,lastTarget:null}}

// Authored texts. Control material stays separate from training material.
const training={
 ru:{letters:['Сегодня мы спокойно работаем с новым текстом. Важно видеть слово целиком и находить знакомые клавиши без спешки.','После встречи команда обсудила план. Каждый записал свою задачу и отправил короткий ответ.','Утром свет падает на стол. Рядом лежат книга и блокнот, а в окне виден тихий двор.'],shift:['Анна и Борис готовят новый проект. Вера проверяет письмо, а Олег читает ответ.','Маша открыла заметку. После работы Иван и Елена встретились у метро.'],numbers:['Встреча: 12.10, 18:30. Кабинет 204. В плане 3 задачи, а перерыв длится 15 минут.','Заказ 482: 2 книги по 350 рублей. Всего 700 рублей. Доставка: 07.11, с 10:00 до 12:00.'],work:['Добрый день! Пришли, пожалуйста, новую версию документа до пятницы. Я проверю список задач и напишу ответ.','Спасибо за встречу. Мы обсудили сроки, уточнили детали и выбрали следующий шаг. Краткие заметки уже готовы.']},
 en:{letters:['Today we work with a new text at a comfortable pace. Read a little ahead and let your hands find the familiar keys.','The team reviewed the plan after the meeting. Each person wrote a short note and chose the next task.','Morning light falls on the desk. A book and a notebook are ready for a quiet hour of work.'],shift:['Anna and Ben start a new project. Maria checks the message while Oliver reads the reply.','Alex opened the document. After work, Emma and Daniel met near the station.'],numbers:['Meeting: 12.10, 18:30. Room 204. The plan has 3 tasks and a 15 minute break.','Order 482: 2 books at $35 each. Total: $70. Delivery: 07.11, from 10:00 to 12:00.'],work:['Hello! Please send the latest version of the document before Friday. I will review the tasks and write a short reply.','Thank you for the meeting. We discussed the schedule, checked the details, and agreed on the next step.']},
 fr:{letters:['Nous travaillons sur un nouveau texte. Lis les mots calmement et laisse tes mains trouver les touches.','Le groupe regarde le plan. Chaque personne choisit une petite action pour continuer le projet.'],shift:['Anne et Paul ouvrent le document. Marie lit le message et Luc donne une courte remarque.'],numbers:['Rendez-vous: 12.10, 18:30. Salle 204. Le plan contient 3 actions et une pause de 15 minutes.'],work:['Bonjour! Merci pour le message. Le nouveau document est disponible pour la prochaine rencontre.']}
};
const checks={
 ru:[
 'Тихий вечер наступил незаметно. На соседней улице зажглись фонари, а в комнате осталось мягкое тепло. Мы открыли окно и услышали далёкий разговор.',
 'В небольшом саду растут яблони и груши. После дождя дорожка стала тёмной, но листья блестят на солнце. Сосед остановился у ворот и улыбнулся.',
 'Поезд прибыл на станцию вовремя. Пассажиры собрали вещи и вышли на широкую платформу. Впереди был свободный день и несколько новых встреч.',
 'На столе лежали цветные карандаши. Ребёнок нарисовал дом, высокое дерево и маленькую собаку. В рисунке нашлось место даже для знакомой тропинки.',
 'Дорога поворачивает к реке. У берега стоят лодки, а за ними начинается лес. Мы решили немного отдохнуть и продолжить путь после обеда.',
 'Библиотека открывается утром. Читатели выбирают книги, тихо обсуждают находки и делают записи. У большого окна удобно готовиться к следующему занятию.',
 'Новый магазин появился рядом с площадью. На полках аккуратно стоят чашки, тарелки и небольшие коробки. Продавец помог выбрать подарок для друга.',
 'Суббота началась с короткой прогулки. Свежий воздух помог проснуться, а разговор с приятелем поднял настроение. Домой мы вернулись перед завтраком.'
 ],
 en:[
 'A quiet evening arrived before we noticed. Lights came on along the nearby street, and the room stayed warm. We opened the window and heard a distant conversation.',
 'A small garden has apple trees and flowers. The path is dark after the rain, but the leaves shine in the sun. A neighbour stops at the gate and smiles.',
 'The train reached the station on time. People collected their bags and stepped onto the wide platform. A free day and a few new meetings lay ahead.',
 'Coloured pencils were lying on the table. A child drew a house, a tall tree, and a small dog. There was even room for the familiar path.',
 'The road turns towards the river. Small boats wait by the bank, with a forest beyond them. We decided to rest and continue our walk after lunch.',
 'The library opens in the morning. Readers choose books, discuss their discoveries quietly, and make notes. A seat by the large window is a good place to study.',
 'A new shop opened near the square. Cups, plates, and small boxes stand neatly on the shelves. The assistant helped us choose a present for a friend.',
 'Saturday began with a short walk. Fresh air helped us wake up, and a conversation improved our mood. We returned home just before breakfast.'
 ],
 fr:[
 'Le soir arrive doucement. Les lampes brillent dans la rue et la chambre reste calme. Nous ouvrons la porte et regardons le jardin.',
 'Un petit jardin accueille des arbres et des fleurs. Le soleil revient dans le ciel. Une personne sourit devant la maison.',
 'Le train arrive dans la gare. Les voyageurs prennent leurs sacs et sortent tranquillement. Une nouvelle rencontre les attend.',
 'Des crayons attendent sur la table. Un enfant dessine une maison et un arbre. Le petit chemin traverse le jardin.'
 ]
};
export function contentText(lang,type,index=0){let pool=training[lang]?.[type]||training[lang]?.letters;return pool[index%pool.length]}
export function controlText(model,lang){let pool=checks[lang],index=pool.findIndex((_,i)=>!model.seenChecks.includes(lang+'-check-'+i));if(index<0)return null;return{id:lang+'-check-'+index,text:pool[index],type:'control',version:CONTENT_VERSION}}
export function diagnosticText(lang,stage){return contentText(lang,['letters','shift','numbers'][stage],1)}
export function normalizeText(raw){return String(raw).normalize('NFC').replace(/\s+/gu,' ').trim()}
export function validateText(raw,layout){let text=normalizeText(raw);return{text,words:text?text.split(' '):[],unsupported:[...new Set([...text].filter(c=>!findKey(c,layout)))],changed:text!==raw}}

export function mergeSkills(model,result,context,now=Date.now()){
 if(result.sessionId){let existing=model.activities.find(r=>r.sessionId===result.sessionId);if(existing)return existing;}
 let sample=(target,source)=>{target.observations=(target.observations||0)+(source.observations||source.correct+source.errors||0);target.errors=(target.errors||0)+source.errors;target.latencies=[...(target.latencies||[]),...(source.latencies||[])].slice(-80);target.lastAt=now};
 for(let [key,value] of Object.entries(result.keys||{})){let target=model.keys[key]??={};sample(target,value)}
 for(let [key,value] of Object.entries(result.pairs||{})){let target=model.pairs[key]??={};sample(target,value)}
 let record={...result,at:now,kind:'activity',activity:context.activity||context.kind,title:context.title||'',phase:context.phase,layout:context.layout,lang:context.lang,metricsVersion:METRICS_VERSION,contentVersion:CONTENT_VERSION,contentId:context.contentId||null,independent:context.activity==='control',target:context.target||null};
 model.activities.push(record);model.activities=model.activities.slice(-600);
 if(context.activity==='control'){if(context.contentId&&!model.seenChecks.includes(context.contentId))model.seenChecks.push(context.contentId);model.checks.push(record);model.checks=model.checks.slice(-100)}
 if(context.activity==='diagnostic')model.diagnostics.push(record);
 if(context.phase&&model.plan?.day===dayKey(now))model.plan.done[context.phase]=true;
 if(context.target)model.lastTarget=context.target;
 return record;
}
export function dayKey(now=Date.now()){let d=new Date(now);return[d.getFullYear(),d.getMonth()+1,d.getDate()].join('-')}
export function dailyPlan(model){if(model.plan?.day!==dayKey())model.plan={day:dayKey(),done:{}};return model.plan}
export function recommendations(model,lang){
 let baseline=median(Object.values(model.pairs).flatMap(k=>k.latencies||[]))||250;
 const corpus=(LANGUAGES[lang].words.join(' ')+' '+Object.values(training[lang]).flat().join(' ')).toLowerCase();
 let candidates=[];
 for(let [key,k] of Object.entries(model.pairs)){if(k.observations<5)continue;let ms=median(k.latencies||[]),frequency=corpus.split(key).length-1;if(!frequency)continue;let error=(k.errors+1)/(k.observations+20),delay=ms?Math.max(0,ms/baseline-1):0,score=Math.log2(2+frequency)*(error*4+delay*.3);if(k.errors>=2||delay>.35)candidates.push({type:'pair',key,score,observations:k.observations,errors:k.errors,ms,reason:k.errors>=2?`В сочетании «${key}» было ${k.errors} ошибок за ${k.observations} наблюдений.`:`Переход «${key}» занимает около ${Math.round(ms)} мс; обычный интервал в этом профиле — ${Math.round(baseline)} мс.`})}
 for(let [key,k] of Object.entries(model.keys)){if(k.observations<8||k.errors<2)continue;let score=(k.errors+1)/(k.observations+20)*5;candidates.push({type:'key',key,score,observations:k.observations,errors:k.errors,reason:`Буква «${key.toUpperCase()}»: ${k.errors} ошибок за ${k.observations} вводов. Проверим её в разных словах.`})}
 return candidates.sort((a,b)=>b.score-a.score||a.key.localeCompare(b.key)).slice(0,3);
}
export function chooseTarget(model,lang){let latest=new Map();for(let r of model.diagnostics)latest.set(r.contentId,r);let contextual=[...latest.values()].filter(r=>r.accuracy<95&&r.errors>=2&&r.correct>=20).sort((a,b)=>a.accuracy-b.accuracy)[0];if(contextual){let key=contextual.contentId?.endsWith('-2')?'numbers':contextual.contentId?.endsWith('-1')?'shift':'letters';if(model.lastTarget!=='text:'+key)return{type:'text',key,reason:`В диагностике «${key==='numbers'?'цифры и знаки':key==='shift'?'регистр':'буквы'}» точность была ${Math.round(contextual.accuracy)}%. Потренируем эту задачу на другом фрагменте.`}}let targets=recommendations(model,lang),target=targets.find(t=>t.type+':'+t.key!==model.lastTarget)||targets[0];return target||{type:'text',key:'work',reason:'Пока мало повторных наблюдений. Наберём короткий рабочий текст и продолжим собирать данные.'}}
export function targetWords(lang,target,count=20,letters=LANGUAGES[lang].alphabet,random=Math.random){
 if(target.type==='text')return contentText(lang,target.key||'work').split(' ');
 return generateWords({lang,letters,focus:target.key,count,random,focusFraction:.5});
}
export function controlSummary(model){let usable=model.checks.filter(r=>r.comparable!==false&&!r.hints&&r.metricsVersion===METRICS_VERSION);return{count:usable.length,baseline:usable[0],latest:usable.at(-1),range:usable.length>=3?[Math.min(...usable.slice(-3).map(r=>r.cpm)),Math.max(...usable.slice(-3).map(r=>r.cpm))]:null}}
export function backupData(data){return JSON.stringify({format:'ten-fingers-backup',version:1,exportedAt:new Date().toISOString(),data},null,2)}
export function parseBackup(raw){
 if(typeof raw!=='string'||raw.length>15000000)throw new Error('Файл слишком большой.');
 const backup=JSON.parse(raw,(key,value)=>{if(['__proto__','constructor','prototype'].includes(key))throw new Error('Недопустимые поля в копии.');return value;});
 if(backup.format!=='ten-fingers-backup'||backup.version!==1||backup.data?.version!==2)throw new Error('Это не резервная копия Десяти пальцев.');
 const d=backup.data,object=x=>!!x&&typeof x==='object'&&!Array.isArray(x),fail=()=>{throw new Error('В копии повреждены настройки, история или сохранённые тексты.');};
 if(!object(d.settings)||!object(d.progress)||!LANGUAGES[d.settings.language])fail();
 const settings={...DEFAULT_SETTINGS,...d.settings,layouts:{...DEFAULT_SETTINGS.layouts,...d.settings.layouts}};
 for(const lang of Object.keys(LANGUAGES))if(!availableLayouts(lang).includes(settings.layouts[lang]))fail();
 const enums={keyboardSwitch:['mac','red','brown','blue'],soundMode:['off','normal','gachi'],theme:['dark','light','warm'],unit:['cpm','wpm','cps'],dailyType:['sessions','time'],wordsView:['rows','tape'],caretStyle:['line','block','underline'],caretSpeed:['off','slow','medium','fast'],testMode:['time','words','quote'],hintMode:['always','request','off']};
 for(const [key,values] of Object.entries(enums))if(!values.includes(settings[key]))fail();
 for(const [key,value] of Object.entries(DEFAULT_SETTINGS))if(typeof value==='boolean'&&typeof settings[key]!=='boolean')fail();
 const bounds={soundVolume:[0,100],speedGoal:[1,3000],dailyGoal:[1,200],dailyMinutes:[1,300],tapeMargin:[0,80],fontSize:[18,48],testTime:[1,14400],testWords:[1,10000],letterSpacing:[0,5]};
 for(const [key,[min,max]] of Object.entries(bounds))if(!Number.isFinite(settings[key])||settings[key]<min||settings[key]>max)fail();
 const records=items=>{if(!Array.isArray(items)||items.length>20000)fail();for(const r of items){if(!object(r))fail();for(const key of ['cpm','duration','accuracy','at','correct','errors'])if(r[key]!==undefined&&(!Number.isFinite(r[key])||r[key]<0))fail();if(r.accuracy>100)fail();}};
 const progress=(p,lang)=>{
  if(!object(p)||!Number.isInteger(p.unlocked)||p.unlocked<1||p.unlocked>LANGUAGES[lang].alphabet.length||!object(p.letters)||!object(p.lessons))fail();
  if(p.samplePolicy!==undefined&&(!Number.isInteger(p.samplePolicy)||p.samplePolicy<0))fail();
  for(const [letter,key] of Object.entries(p.letters)){
   if(!LANGUAGES[lang].alphabet.includes(letter)||!object(key))fail();
   for(const field of ['samples','correct','errors','lastCPM','topCPM','lastAccuracy'])if(key[field]!==undefined&&(!Number.isFinite(key[field])||key[field]<0))fail();
   if(key.samples!==undefined&&!Number.isInteger(key.samples)||key.lastAccuracy>100||key.lastQualified!==undefined&&typeof key.lastQualified!=='boolean')fail();
  }
  records(p.history);records(p.tests);if(p.lessonHistory!==undefined)records(p.lessonHistory);
 };
 for(const lang of Object.keys(LANGUAGES))if(d.progress[lang])progress(d.progress[lang],lang);
 if(d.layoutProgress!==undefined){if(!object(d.layoutProgress))fail();for(const [id,p] of Object.entries(d.layoutProgress)){const [lang,layout]=id.split(':');if(!LANGUAGES[lang]||!availableLayouts(lang).includes(layout))fail();progress(p,lang);}}
 if(d.learning!==undefined){if(!object(d.learning))fail();for(const [id,m] of Object.entries(d.learning)){const [lang,layout]=id.split(':');if(!LANGUAGES[lang]||!availableLayouts(lang).includes(layout)||!object(m)||!object(m.keys)||!object(m.pairs))fail();records(m.activities);records(m.checks);records(m.diagnostics||[]);if(!Array.isArray(m.seenChecks)||m.seenChecks.some(x=>typeof x!=='string'))fail();for(const [key,value] of [...Object.entries(m.keys),...Object.entries(m.pairs)]){if(!key||key.length>2||!object(value))fail();for(const field of ['observations','errors'])if(value[field]!==undefined&&(!Number.isFinite(value[field])||value[field]<0))fail();if(value.latencies!==undefined&&(!Array.isArray(value.latencies)||value.latencies.length>500||value.latencies.some(x=>!Number.isFinite(x)||x<0||x>2000)))fail();}}}
 for(const items of [d.library||[],d.trash||[]]){if(!Array.isArray(items)||items.length>1000)fail();for(const t of items)if(!object(t)||typeof t.id!=='string'||t.id.length>120||typeof t.title!=='string'||t.title.length>80||typeof t.text!=='string'||t.text.length>5000||!LANGUAGES[t.lang])fail();}
 if(d.onboarding!=null&&(!object(d.onboarding)||d.onboarding.version!==1||!['completed','skipped'].includes(d.onboarding.status)))fail();
 d.settings=settings;return ensureLearning(d);
}
