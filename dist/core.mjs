import {LANGUAGES,DEFAULT_SETTINGS,LESSON_GROUPS,mapPhysicalKeys} from './data.mjs';
import {EXTRA_WORDS} from './vocabulary.mjs';
import {PRACTICE_PHRASES} from './practice-phrases.mjs';
export const PRACTICE_POLICY=4, SAMPLE_SPEED_RATIO=.7, SAMPLE_ACCURACY=85, REQUIRED_SAMPLES=3;
export function lessonThreshold(ctx){
 const group=ctx.group||0,step=ctx.step||0;
 if(group===0)return {cpm:[60,75,90,110,130][step]||130,accuracy:[75,78,80,82,85][step]||85,attempts:1};
 const accuracy=Math.min(90,78+Math.floor(group/3)*2+step*2);
 const base=75+group*13,cpm=Math.min(320,base+(step<3?[0,20,35][step]:40+(step-3)*15));
 return {cpm,accuracy,attempts:step===LESSON_GROUPS[group][1]-1?2:1};
}
export function createProgress(){return {unlocked:5,letters:{},history:[],lessons:{},lessonHistory:[],tests:[],samplePolicy:PRACTICE_POLICY}}
export function confidence(key,goal){
 if(!key||!key.lastQualified||key.lastAccuracy<SAMPLE_ACCURACY||!Number.isFinite(goal)||goal<=0)return 0;
 // Rounding 99.9% up to 100% must never open a letter below the actual goal.
 return Math.max(0,Math.min(100,Math.floor(key.lastCPM/goal*100)));
}
// Estimated mastery is anchored to the real session pace, never the inverse
// of one quick key transition. Delays and errors reduce the estimate.
export function letterEstimate(result,letter){
 const key=result.keys?.[letter];
 const intervals=(key?.latencies||[]).filter(ms=>Number.isFinite(ms)&&ms>=20&&ms<=2000);
 if(!key||key.correct<2||!intervals.length||!Number.isFinite(result.cpm)||result.cpm<0)return null;
 const all=Object.values(result.keys).flatMap(k=>(k.latencies||[]).filter(ms=>Number.isFinite(ms)&&ms>=20&&ms<=2000));
 const mean=values=>values.reduce((sum,ms)=>sum+ms,0)/values.length;
 const tempo=Math.min(1,mean(all)/mean(intervals));
 const accuracy=key.correct/Math.max(1,key.correct+(key.errors||0));
 return result.cpm*tempo*accuracy;
}
export function letterSpeed(progress,letter,goal){
 const values=[],seen=new Set();
 for(let i=progress.history.length-1;i>=0&&values.length<5;i--){
  const result=progress.history[i],key=result.keys?.[letter];
  if(!key||!((key.correct||0)+(key.errors||0)))continue;
  if(result.sessionId&&seen.has(result.sessionId))continue;
  if(result.sessionId)seen.add(result.sessionId);
  const estimate=letterEstimate(result,letter);
  if(estimate===null&&key.correct)continue;
  values.push(estimate??0);
 }
 const cpm=values.length?values.reduce((sum,value)=>sum+value,0)/values.length:0;
 return {cpm,count:values.length,percent:goal>0?Math.max(0,Math.min(100,cpm/goal*100)):0};
}
export const letterHue=percent=>Math.max(0,Math.min(120,(Number(percent)-60)*3||0));
export function weakestLetter(progress,lang,goal){
 const measured=[...LANGUAGES[lang].alphabet].slice(0,progress.unlocked).map(letter=>({letter,...letterSpeed(progress,letter,goal)})).filter(item=>item.count>0);
 return measured.sort((a,b)=>a.cpm-b.cpm||b.count-a.count)[0]||null;
}
export function practiceUnlockStatus(progress,lang,goal){
 const alphabet=[...LANGUAGES[lang].alphabet],active=alphabet.slice(0,progress.unlocked);
 const pending=active.filter(c=>confidence(progress.letters[c],goal)<100).map(letter=>{const key=progress.letters[letter];return {letter,reason:!key||!key.lastCPM?'measurement':key.lastAccuracy<SAMPLE_ACCURACY?'accuracy':key.lastCPM<goal?'speed':!key.lastQualified?'quality':'speed',percent:goal>0?Math.min(100,Math.floor((key?.lastCPM||0)/goal*100)):0};});
 return {next:alphabet[progress.unlocked]||null,pending,ready:pending.length===0};
}
export function targetLetter(progress,lang,goal){let active=[...LANGUAGES[lang].alphabet].slice(0,progress.unlocked);return active.find(c=>!progress.letters[c])||active.reduce((a,c)=>confidence(progress.letters[c],goal)<confidence(progress.letters[a],goal)?c:a,active[0])}
export function assessPractice(result,goal,letters){
 const floor=goal*SAMPLE_SPEED_RATIO,reasons=[],keys={},accepted=[];
 if(!Number.isFinite(goal)||goal<=0||!Number.isFinite(result.cpm)||result.cpm<0||!Number.isFinite(result.duration)||result.duration<=0)reasons.push('measurement');
 if(!Number.isFinite(result.accuracy)||result.accuracy<SAMPLE_ACCURACY||!Number.isFinite(result.firstAttemptAccuracy)||result.firstAttemptAccuracy<SAMPLE_ACCURACY||!Number.isFinite(result.finalAccuracy)||result.finalAccuracy<SAMPLE_ACCURACY)reasons.push('accuracy');
 if(!Number.isInteger(result.wordCount)||result.wordCount<1||result.correctWords+result.incorrectWords!==result.wordCount)reasons.push('unfinished');
 if(result.cpm<floor)reasons.push('speed');
 for(const [letter,data] of Object.entries(result.keys||{})){
  if(!letters.includes(letter))continue;
  const correct=Number.isFinite(data.correct)?data.correct:0,errors=Number.isFinite(data.errors)?data.errors:0;
  const accuracy=correct/Math.max(1,correct+errors)*100;
  const measured=correct>=2&&Number.isFinite(data.avgMs)&&data.avgMs>=20&&data.avgMs<=2000&&Array.isArray(data.latencies)&&data.latencies.some(ms=>Number.isFinite(ms)&&ms>=20&&ms<=2000);
  // A short, fast burst cannot hide slow typing, corrections, or skipped words.
  const cpm=measured&&Number.isFinite(result.cpm)&&result.cpm>=0?Math.min(60000/data.avgMs,result.cpm):0;
  const qualified=!reasons.length&&measured&&accuracy>=SAMPLE_ACCURACY&&cpm>=floor;
  keys[letter]={cpm,accuracy:Math.min(accuracy,result.accuracy||0,result.firstAttemptAccuracy||0),measured,qualified,correct,errors};
  if(qualified)accepted.push(letter);
 }
 return {policy:PRACTICE_POLICY,goal,floor,minAccuracy:SAMPLE_ACCURACY,reasons,accepted,keys};
}
function recordPracticeKeys(progress,assessment){
 for(const [letter,sample] of Object.entries(assessment.keys)){
  const key=progress.letters[letter]??={samples:0,correct:0,errors:0,topCPM:0,lastCPM:0,lastAccuracy:0,lastQualified:false};
  key.correct+=sample.correct;key.errors+=sample.errors;
  if(sample.measured||assessment.reasons.length||sample.accuracy<SAMPLE_ACCURACY){key.lastCPM=sample.cpm;key.lastAccuracy=sample.accuracy;key.lastQualified=sample.qualified;}
  if(sample.qualified){key.samples++;key.topCPM=Math.max(key.topCPM,sample.cpm);}
 }
}
export function ensurePracticeProgress(progress,lang,goal){
 if(progress.samplePolicy===PRACTICE_POLICY)return progress;
 // Reassess old samples; keep the user's history and already available letters.
 const trusted=[2,3].includes(progress.samplePolicy)?progress.letters:null,newly={};
 progress.letters={};const seen=new Set(),letters=[...LANGUAGES[lang].alphabet].slice(0,progress.unlocked);
 for(const result of progress.history){
  if(result.sessionId&&seen.has(result.sessionId))continue;if(result.sessionId)seen.add(result.sessionId);
  const assessment=assessPractice(result,result.practiceSample?.goal||goal,letters);
  if(trusted)for(const c of assessment.accepted)if(result.practiceSample? !result.practiceSample.accepted?.includes(c): progress.samplePolicy===2&&(result.accuracy<95||result.firstAttemptAccuracy<95||assessment.keys[c].accuracy<95))newly[c]=(newly[c]||0)+1;
  recordPracticeKeys(progress,assessment);
 }
 if(trusted)for(const [c,old] of Object.entries(trusted)){const key=progress.letters[c]??={...old};key.samples=Math.max(key.samples||0,(old.samples||0)+(newly[c]||0));key.topCPM=Math.max(key.topCPM||0,old.topCPM||0);}
 progress.samplePolicy=PRACTICE_POLICY;return progress;
}
export function savePractice(progress,result,lang,goal){
 ensurePracticeProgress(progress,lang,goal);
 if(result.sessionId&&progress.history.some(r=>r.sessionId===result.sessionId))return null;
 const alphabet=[...LANGUAGES[lang].alphabet],active=alphabet.slice(0,progress.unlocked),assessment=assessPractice(result,goal,active);
 const {keys,...summary}=assessment;result.practiceSample={...summary,observed:Object.keys(keys)};recordPracticeKeys(progress,assessment);
 progress.history.push({...result,at:result.at??Date.now()});if(progress.history.length>1500)progress.history.shift();
 if(!assessment.reasons.length&&assessment.accepted.length&&progress.unlocked<alphabet.length&&active.every(c=>confidence(progress.letters[c],goal)===100)){
  progress.unlocked++;return alphabet[progress.unlocked-1];
 }
 return null;
}
export function dailyProgress(progress,now=new Date()){let start=new Date(now);start.setHours(0,0,0,0);let h=progress.history.filter(r=>r.at>=start.getTime());return{sessions:h.length,minutes:h.reduce((s,r)=>s+r.duration,0)/60000}}
export function wordPool(lang,letters=LANGUAGES[lang].alphabet){
 const allowed=new Set(letters);
 return [...new Set([...(EXTRA_WORDS[lang]||[]),...LANGUAGES[lang].words])].filter(w=>w.length>=2&&w.length<=24&&[...w].every(c=>allowed.has(c)));
}
const randomIndex=(length,random)=>Math.min(length-1,Math.max(0,Math.floor((Number(random())||0)*length)));
export function keyDrills(letters,count=25,random=Math.random){
 const chars=[...new Set(letters)];if(!chars.length)throw new Error('Для упражнения нужны доступные клавиши.');
 const patterns=[];
 for(let i=0;i<chars.length;i++){
  for(let j=i+1;j<chars.length;j++){
   const a=chars[i],b=chars[j];patterns.push(a+b,b+a,a+b+a,b+a+b,a+a+b+b,a+b+a+b);
  }
  patterns.push(chars[i]+chars[i]);
 }
 const words=[];let bag=[];
 while(words.length<count){
  if(!bag.length){
   bag=[...patterns];
   for(let i=bag.length-1;i>0;i--){const j=randomIndex(i+1,random);[bag[i],bag[j]]=[bag[j],bag[i]];}
   if(bag.length>1&&bag.at(-1)===words.at(-1))[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];
  }
  words.push(bag.pop());
 }
 return words;
}
export function generateWords({lang='ru',letters=LANGUAGES[lang].alphabet,focus=null,count=25,random=Math.random,punctuation=false,focusFraction=.5}){
 if(!Number.isInteger(count)||count<1||count>10000)throw new Error('Количество слов должно быть от 1 до 10000.');
 const allowed=new Set(letters),pool=wordPool(lang,letters);if(!allowed.size)throw new Error('Для упражнения нужны доступные буквы.');
 const validFocus=focus&&[...focus].every(c=>allowed.has(c))?focus:null,target=validFocus?pool.filter(w=>w.includes(validFocus)):pool;
 if(!pool.length)return keyDrills([...allowed].join(''),count,random);
 const uses=new Map(),words=[],quota=validFocus?Math.round(count*Math.max(0,Math.min(1,focusFraction))):0;
 let focused=0;
 for(let i=0;i<count;i++){
  const aim=focused<Math.round((i+1)*quota/count),source=aim&&target.length?target:pool;
  let candidates=source.filter(w=>w!==words.at(-1));if(!candidates.length)candidates=source;
  const minimum=Math.min(...candidates.map(w=>uses.get(w)||0));candidates=candidates.filter(w=>(uses.get(w)||0)===minimum);
  const word=candidates[randomIndex(candidates.length,random)];words.push(word);uses.set(word,(uses.get(word)||0)+1);if(validFocus&&word.includes(validFocus))focused++;
 }
 return words.map((word,i)=>punctuation&&i>0&&i%6===0?word+(i%12===0?'.':','):word);
}
export const PRACTICE_WORD_COUNT=16;
const lastPracticePhrase=new Map();
// Real connecting phrases become available with their letters. At the start
// nouns may be invented; later the vocabulary supplies mostly genuine words.
const PRACTICE_FRAMES={
 ru:[['она','на'],['они','не'],['он','на'],['она','не'],['мы','нашли'],['это','новый'],['там','стоит'],['они','видят'],['ты','читаешь'],['мы','пишем']],
 en:[['at','the'],['the','tea'],['eat','the'],['the','heat'],['we','have'],['they','read'],['this','is'],['we','write']],
 fr:[['il','est'],['elle','est'],['nous','avons'],['avec','les']]
};
const lastFocusedOpening=new Map();
export function practiceMaterial(lang,letters,focus,random=Math.random,{everyWordFocus=false}={}){
 const valid=w=>w.length>=2&&w.length<=8&&[...w].every(c=>letters.includes(c)),extra=lang==='ru'?['анне','неона','неоне','анион','аниона','анионе','иона','ионе','нони']:[],real=[...new Set([...wordPool(lang,letters),...extra])].filter(valid),invented=syllableWords(lang,letters,focus,random);
 if(everyWordFocus&&focus&&letters.includes(focus)){
  const pool=[...new Set([...real,...invented])].filter(w=>valid(w)&&w.includes(focus));
  if(!pool.length)return {words:keyDrills(letters,PRACTICE_WORD_COUNT,random).map(w=>w.includes(focus)?w:(focus+w).slice(0,8)),type:'drill',available:0,note:'16 коротких сочетаний выбранных клавиш. Буква «'+focus.toUpperCase()+'» есть в каждом сочетании.'};
  const used=new Map(),words=[],lengths=[2,3,4,5,6,7,8,3,4,5,6,7,8,2,4,6],offset=randomIndex(lengths.length,random);
  for(let i=0;i<PRACTICE_WORD_COUNT;i++){
   let choices=pool.filter(w=>w.length===lengths[(i+offset)%lengths.length]&&w!==words.at(-1));
   if(!choices.length)choices=pool.filter(w=>w!==words.at(-1));
   if(!choices.length)choices=pool;
   const least=Math.min(...choices.map(w=>used.get(w)||0));choices=choices.filter(w=>(used.get(w)||0)===least);
   const realChoices=choices.filter(w=>real.includes(w));if(realChoices.length)choices=realChoices;
   if(i===0){const openingKey=lang+':'+letters+':'+focus,previous=lastFocusedOpening.get(openingKey);let varied=choices.filter(w=>w!==previous&&!['он','она','они'].includes(w));if(!varied.length)varied=pool.filter(w=>w!==previous&&!['он','она','они'].includes(w));if(varied.length)choices=varied;}
   const word=choices[randomIndex(choices.length,random)];if(i===0)lastFocusedOpening.set(lang+':'+letters+':'+focus,word);words.push(word);used.set(word,(used.get(word)||0)+1);
  }
  return {words,type:'focused',available:real.length,note:`16 слов · 2–8 букв. Буква «${focus.toUpperCase()}» есть в каждом слове. Настоящие слова и учебные сочетания.`};
 }
 const phraseKey=lang+':'+letters,phrases=(PRACTICE_PHRASES[lang]||[]).filter(text=>text.split(' ').every(valid)&&(!focus||text.split(focus).length>2)&&text!==lastPracticePhrase.get(phraseKey));
 if(phrases.length&&random()<.65){const text=phrases[randomIndex(phrases.length,random)];lastPracticePhrase.set(phraseKey,text);return {words:text.split(' '),type:'words',available:real.length,note:'16 слов · 2–8 букв. Короткий связный текст из уже доступных букв.'};}
 const pool=[...new Set([...real,...invented])];
 if(!pool.length)return {words:keyDrills(letters,PRACTICE_WORD_COUNT,random),type:'drill',available:0,note:'16 коротких сочетаний доступных клавиш.'};
 const frames=(PRACTICE_FRAMES[lang]||[]).filter(frame=>frame.every(valid)),words=[],used=new Set(),starts=new Map(),observed=new Map();
 const add=word=>{words.push(word);used.add(word);starts.set(word[0],(starts.get(word[0])||0)+1);for(const c of word)observed.set(c,(observed.get(c)||0)+1);};
 // Each fragment has two real words and two practice words. Slot lengths
 // deliberately span 2..8, instead of a fixed number of CV syllables.
 const lengths=[4,5,6,3,7,4,8,5],frameOffset=randomIndex(frames.length||1,random);let slot=0;
 for(let part=0;part<4;part++){
  if(frames.length){const frame=frames[(frameOffset+part)%frames.length];frame.forEach(add);}
  for(let n=0;n<(frames.length?2:4);n++){
   const length=lengths[slot%lengths.length],double=slot===0||slot===5;
   let choices=pool.filter(w=>!used.has(w)&&(!focus||w.includes(focus))&&w.length===length&&(!double||/(.)\1/u.test(w)));
   if(!choices.length)choices=pool.filter(w=>!used.has(w)&&(!focus||w.includes(focus))&&w.length===length);
   if(!choices.length)choices=pool.filter(w=>!used.has(w)&&(!focus||w.includes(focus))&&(!double||/(.)\1/u.test(w)));
   if(!choices.length)choices=pool.filter(w=>!used.has(w));if(!choices.length)choices=pool.filter(w=>w!==words.at(-1));if(!choices.length)choices=pool;
   const score=w=>(starts.get(w[0])||0)*4-[...new Set(w)].filter(c=>(observed.get(c)||0)<2).length*3-(real.includes(w)?1:0);
   const best=Math.min(...choices.map(score));choices=choices.filter(w=>score(w)===best);add(choices[randomIndex(choices.length,random)]);slot++;
  }
 }
 return {words,type:invented.length?'syllables':'words',available:real.length,note:'16 слов · 2–8 букв. Настоящие слова связывают учебные сочетания в короткие фразы. Только доступные буквы.'};
}
export function syllableWords(lang,letters,focus,random=Math.random){
 const allowed=[...new Set(letters)],vowels=allowed.filter(c=>(lang==='ru'?'аеёиоуыэюя':'aeiouy').includes(c)),consonants=allowed.filter(c=>!(lang==='ru'?'аеёиоуыэюяьъй':'aeiouy').includes(c));
 if(!vowels.length||!consonants.length)return [];
 const words=new Set(),seed=randomIndex(0x7fffffff,random);
 for(let attempt=0;attempt<6000&&words.size<700;attempt++){
  let state=(seed+Math.imul(attempt+1,2654435761))>>>0;
  const pick=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n);};
  const length=2+attempt%7;let vowel=pick(2)===0,word='',run=0;
  for(let i=0;i<length;i++){
   const chars=vowel?vowels:consonants;
   const repeat=i>0&&pick(5)===0&&chars.includes(word.at(-1));
   word+=repeat?word.at(-1):chars[pick(chars.length)];run++;
   if(run>=2||pick(5)!==0){vowel=!vowel;run=0;}
  }
  // No triples, no repeated two/three-letter chant, no all-consonant words.
  if(![...word].some(c=>vowels.includes(c))||/(.)\1\1/u.test(word)||/(.{2})\1/u.test(word)||/^(.)\1/u.test(word)||/(.)\1$/u.test(word)||(word.match(/(.)\1/gu)||[]).length>1)continue;
  words.add(word);
 }
 return [...words];
}
export function lessonInfo(group,step,layout){let fresh=mapPhysicalKeys(LESSON_GROUPS[group][0],layout);let learned=LESSON_GROUPS.slice(0,group+1).map(([k])=>mapPhysicalKeys(k,layout)).join('');if(group===0&&step<2){fresh=fresh.slice(0,2);learned=fresh;}return{fresh,learned,group,step,id:`${layout}:${group}:${step}`}}
export function lessonWords(info,lang,random=Math.random){
 const {step,group,fresh,learned}=info,base=step===0?9:step<3?11:Math.min(18,12+group),count=base-1+randomIndex(4,random);
 if(step===0){
  const words=[];while(words.length<count){const bag=[...fresh];for(let i=bag.length-1;i>0;i--){const j=randomIndex(i+1,random);[bag[i],bag[j]]=[bag[j],bag[i]];}words.push(...bag);}return words.slice(0,count);
 }
 if(step<=2){const chars=[...fresh],pairs=chars.flatMap(a=>chars.map(b=>a+b)),words=[];let bag=[];while(words.length<count){if(!bag.length){bag=[...pairs];for(let i=bag.length-1;i>0;i--){const j=randomIndex(i+1,random);[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag.at(-1)===words.at(-1)&&bag.length>1)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];}words.push(bag.pop());}return words;}
 const max=Math.min(8,group<2?3:group<5?4:group<8?6:8),real=wordPool(lang,learned).filter(w=>w.length<=max),pool=real.length>=6?real:[...new Set([...real,...syllableWords(lang,learned,null,random).filter(w=>w.length<=max)])];
 if(!pool.length)return keyDrills(learned,count,random).map(w=>w.slice(0,max));
 const words=[],uses=new Map(),focus=fresh[step%fresh.length];
 for(let i=0;i<count;i++){let choices=pool.filter(w=>w!==words.at(-1)&&(!(i%2===0)||w.includes(focus)));if(!choices.length)choices=pool.filter(w=>w!==words.at(-1));if(!choices.length)choices=pool;const min=Math.min(...choices.map(w=>uses.get(w)||0));choices=choices.filter(w=>(uses.get(w)||0)===min);if(i===0){const openingKey=lang+':'+letters+':'+focus,previous=lastFocusedOpening.get(openingKey);let varied=choices.filter(w=>w!==previous&&!['он','она','они'].includes(w));if(!varied.length)varied=pool.filter(w=>w!==previous&&!['он','она','они'].includes(w));if(varied.length)choices=varied;}
   const word=choices[randomIndex(choices.length,random)];if(i===0)lastFocusedOpening.set(lang+':'+letters+':'+focus,word);words.push(word);uses.set(word,(uses.get(word)||0)+1);}
 return words;
}
// Alignment keeps a single insertion from turning the rest of a word into errors.
export function alignText(reference,typed){
 const a=[...reference],b=[...typed],dp=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
 for(let i=0;i<=a.length;i++)dp[i][0]=i;for(let j=0;j<=b.length;j++)dp[0][j]=j;
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=Math.min(dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1),dp[i-1][j]+1,dp[i][j-1]+1);
 let i=a.length,j=b.length,ops=[];
 while(i||j){if(i&&j&&a[i-1]===b[j-1]&&dp[i][j]===dp[i-1][j-1]){ops.push({type:'correct',ref:--i,input:--j})}else if(j&&dp[i][j]===dp[i][j-1]+1){ops.push({type:'extra',ref:i,input:--j})}else if(i&&j&&dp[i][j]===dp[i-1][j-1]+1){ops.push({type:'incorrect',ref:--i,input:--j})}else{ops.push({type:'missed',ref:--i,input:j})}}
 ops.reverse();let counts={correct:0,incorrect:0,missed:0,extra:0};for(let o of ops)counts[o.type]++;
 return{...counts,distance:dp[a.length][b.length],ops};
}
export class TypingSession{
 constructor(words,{mode='words',seconds=0,spaceToFinish=true,noWayBack=false,strictTest=false,now=()=>performance.now(),sessionId=globalThis.crypto?.randomUUID?.()||'session-'+Date.now()+'-'+Math.random().toString(36).slice(2)}={}){
  if(!Array.isArray(words)||!words.length||words.length>10000||words.some(w=>typeof w!=='string'||!w.length||w.length>80||/\s/u.test(w)))throw new Error('Упражнение должно содержать непустые слова длиной до 80 символов.');
  if(mode==='time'&&(!Number.isFinite(seconds)||seconds<=0))throw new Error('Продолжительность теста должна быть больше нуля.');this.sessionId=sessionId;
  this.words=Object.freeze(words.map(w=>w.normalize('NFC')));this.options=Object.freeze({mode,seconds,spaceToFinish,noWayBack,strictTest});this.now=now;this.word=0;this.values=words.map(()=>'');this.positions=this.words.map(w=>[...w].map(()=>({success:false,error:false,first:null,intervals:[]})));this.extras=words.map(()=>new Set());this.omissions=words.map(()=>new Set());this.omittedErrors=0;this.status='idle';this.activeMs=0;this.lastStart=0;this.lastKey=null;this.lastCommitted=null;this.correctRegistrations=0;this.errorRegistrations=0;this.firstCorrect=0;this.firstCount=0;this.keyStats={};this.pairStats={};this.corrections=0;this.deleted=0;this.correctionMs=0;this.correctionStarted=null;this.hints=0;this.pauses=0;this.comparable=true;this.spaces=0;this.result=null;
 }
 start(){if(this.status==='idle'||this.status==='paused'){this.status='running';this.lastStart=this.now();this.lastKey=null;this.lastCommitted=null}}
 get duration(){return this.activeMs+(this.status==='running'?Math.max(0,this.now()-this.lastStart):0)}
 pause(){if(this.status==='running'){this.activeMs=this.duration;this.status='paused';this.lastKey=null;this.lastCommitted=null;this.correctionStarted=null;this.pauses++;if(this.options.strictTest)this.comparable=false}}
 resume(){if(this.status==='paused')this.start()}
 get current(){return this.values[this.word]||''}
 get nextChar(){return this.words[this.word]?.[this.current.length]||' '}
 hint(){this.hints++;this.lastKey=null;this.lastCommitted=null}
 setValue(value){
  this.tick();if(this.status==='finished')return;if(this.options.noWayBack&&value.length<this.current.length)return;
  value=value.normalize('NFC').slice(0,this.words[this.word].length+13);let prev=this.current;if(value===prev)return;this.start();
  let prefix=0;while(prefix<prev.length&&prefix<value.length&&prev[prefix]===value[prefix])prefix++;
  let suffix=0;while(suffix<prev.length-prefix&&suffix<value.length-prefix&&prev.at(-1-suffix)===value.at(-1-suffix))suffix++;
  let removed=prev.length-prefix-suffix;if(this.options.noWayBack&&removed)return;let added=value.slice(prefix,value.length-suffix),now=this.now(),dt=this.lastKey===null?null:now-this.lastKey;
  if(removed){this.corrections++;this.deleted+=removed;this.lastCommitted=null;this.correctionStarted??=now;dt=null}
  let prior=alignText(this.words[this.word],prev),cursor=0;
  for(let o of prior.ops){if(o.input>=prefix)break;if(o.type!=='extra')cursor=o.ref+1}
  if(prefix===prev.length)cursor=prev.length;
  for(let offset=0;offset<added.length;offset++){
   let char=added[offset],index=cursor+offset,expected=this.words[this.word][index],position=this.positions[this.word][index],correct=char===expected;
   if(correct)this.correctRegistrations++;else this.errorRegistrations++;
   if(position){if(position.first===null){position.first=correct;this.firstCount++;if(correct)this.firstCorrect++}if(correct)position.success=true;else position.error=true;
    let key=expected.toLowerCase(),stat=this.keyStats[key]??={observations:0,correct:0,errors:0,latencies:[]};stat.observations++;if(correct)stat.correct++;else stat.errors++;
    if(correct&&added.length===1&&!removed&&this.lastCommitted?.correct&&dt>=20&&dt<=2000){stat.latencies.push(dt);position.intervals.push(dt)}
    if(added.length===1&&!removed&&this.lastCommitted?.correct&&dt>=20&&dt<=2000&&this.lastCommitted.word===this.word){let pair=(this.lastCommitted.expected+expected).toLowerCase(),pairStat=this.pairStats[pair]??={observations:0,correct:0,errors:0,latencies:[]};pairStat.observations++;if(correct){pairStat.correct++;pairStat.latencies.push(dt)}else pairStat.errors++}
   }else this.extras[this.word].add(index);
   if(correct&&this.correctionStarted!==null){this.correctionMs+=Math.max(0,now-this.correctionStarted);this.correctionStarted=null}
   this.lastCommitted={expected,correct,word:this.word};
  }
  this.values[this.word]=value;this.lastKey=now;if(added.length!==1||removed)this.lastCommitted=null;
  if(!this.options.spaceToFinish&&this.options.mode!=='time'&&this.word===this.words.length-1&&value.length>=this.words[this.word].length)this.finish();
 }
 nextWord(){this.tick();if(this.status==='finished')return;this.start();this.registerOmissions(this.word,true);this.spaces++;this.lastCommitted=null;if(this.word===this.words.length-1){this.finish();return}this.word++;this.lastKey=this.now()}
 registerOmissions(word,complete){
  const alignment=alignText(this.words[word],this.values[word]),last=alignment.ops.findLast(o=>o.type!=='missed'),end=complete?this.words[word].length:last?last.ref+(last.type==='extra'?0:1):0;
  for(const op of alignment.ops){
   if(op.type!=='missed'||op.ref>=end||this.omissions[word].has(op.ref))continue;
   this.omissions[word].add(op.ref);this.omittedErrors++;this.errorRegistrations++;
   const position=this.positions[word][op.ref];position.error=true;
   if(position.first===null){position.first=false;this.firstCount++;}
   const key=this.words[word][op.ref].toLowerCase(),stat=this.keyStats[key]??={observations:0,correct:0,errors:0,latencies:[]};stat.observations++;stat.errors++;
  }
 }
 backspace(){if(this.options.noWayBack||this.status==='finished')return;if(this.current.length)this.setValue(this.current.slice(0,-1));else if(this.word>0){this.word--;this.corrections++;this.lastKey=this.now();this.lastCommitted=null}}
 clearWord(){if(this.options.noWayBack||this.status==='finished')return;if(!this.current.length&&this.word>0)this.word--;if(this.current.length)this.setValue('');this.lastKey=this.now();this.lastCommitted=null}
 tick(){if(this.options.mode==='time'&&this.status==='running'&&this.duration>=this.options.seconds*1000)this.finish()}
 metrics(){
  let counts={correct:0,incorrect:0,missed:0,extra:0},correctWords=0,incorrectWords=0,correctSpaces=0,end=Math.min(this.word+1,this.words.length),expectedCount=0;
  for(let w=0;w<end;w++){let full=w<this.word||(this.status==='finished'&&this.options.mode!=='time'),original=this.words[w],typed=this.values[w],alignment=alignText(original,typed);let remaining=original.length;if(!full){let last=alignment.ops.findLast(o=>o.type!=='missed');remaining=last?last.ref+(last.type==='extra'?0:1):0;alignment.missed=alignment.ops.filter(o=>o.type==='missed'&&o.ref<remaining).length}expectedCount+=remaining;for(let key of Object.keys(counts))counts[key]+=alignment[key];if(full||(this.status==='finished'&&typed===original)){if(typed===original)correctWords++;else incorrectWords++}}
  for(let w=0;w<end-1;w++)if(this.values[w]===this.words[w])correctSpaces++;
  let correct=counts.correct+Math.min(this.spaces,correctSpaces),duration=this.duration,cpm=duration>0?correct/(duration/60000):0,total=this.correctRegistrations+this.errorRegistrations,attemptedFinal=counts.correct+counts.incorrect+counts.missed+counts.extra;
  return{...counts,correct,cpm,wpm:cpm/5,outputCPM:duration?this.values.slice(0,end).reduce((s,v)=>s+v.length,Math.min(this.spaces,Math.max(0,end-1)))/(duration/60000):0,accuracy:total?this.correctRegistrations/total*100:100,firstAttemptAccuracy:this.firstCount?this.firstCorrect/this.firstCount*100:100,finalAccuracy:attemptedFinal?counts.correct/attemptedFinal*100:100,duration,correctWords,incorrectWords,errors:this.errorRegistrations,omittedErrors:this.omittedErrors,errorPositions:this.positions.slice(0,end).reduce((s,p)=>s+p.filter(i=>i.error).length,0),corrections:this.corrections,deleted:this.deleted,correctionMs:this.correctionMs,hints:this.hints,pauses:this.pauses,comparable:this.comparable,metricsVersion:3};
 }
 finish(){
  if(this.status==='finished')return this.result;this.registerOmissions(this.word,this.options.mode!=='time');this.activeMs=this.options.mode==='time'?Math.min(this.duration,this.options.seconds*1000):this.duration;this.status='finished';let keys={};
  for(let [c,k] of Object.entries(this.keyStats)){let sorted=k.latencies.slice().sort((a,b)=>a-b),middle=sorted.length>>1;keys[c]={...k,avgMs:sorted.length?sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2:null}}
  let end=Math.min(this.word+1,this.words.length),misspelled=[];
  for(let w=0;w<end;w++){let count=this.positions[w].filter(p=>p.error).length+this.extras[w].size;if(this.values[w]!==this.words[w]&&w<this.word)count=Math.max(1,count);for(let n=0;n<count;n++)misspelled.push(this.words[w])}
  this.result={...this.metrics(),sessionId:this.sessionId,keys,pairs:this.pairStats,misspelled,wordCount:this.words.length};return this.result;
 }
}

export function loadData(storage){let defaults={version:2,settings:structuredClone(DEFAULT_SETTINGS),progress:{ru:createProgress(),en:createProgress(),fr:createProgress()},legacyLessons:{},guideSeen:false,onboarding:null};try{let value=JSON.parse(storage.getItem('ten-fingers-v2')||'null');if(value?.version===2){defaults.settings={...defaults.settings,...value.settings,layouts:{...defaults.settings.layouts,...value.settings?.layouts}};for(let l of ['ru','en','fr'])defaults.progress[l]={...createProgress(),...value.progress?.[l],samplePolicy:value.progress?.[l]?.samplePolicy??0};defaults.guideSeen=!!value.guideSeen;defaults.onboarding=value.onboarding??null;defaults.legacyLessons=value.legacyLessons||{};defaults.layoutProgress=value.layoutProgress||{};defaults.learning=value.learning||{};defaults.library=value.library||[]}else{defaults.legacyLessons=JSON.parse(storage.getItem('ten-fingers')||'{}')}}catch{}return defaults}
