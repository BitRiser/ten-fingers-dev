import {LANGUAGES,DEFAULT_SETTINGS,LESSON_GROUPS,mapPhysicalKeys} from './data.mjs';
import {EXTRA_WORDS} from './vocabulary.mjs';
export function createProgress(){return {unlocked:5,letters:{},history:[],lessons:{},lessonHistory:[],tests:[]}}
export function confidence(key,goal){if(!key||key.samples<5)return 0;return Math.max(0,Math.min(100,Math.round(key.lastCPM/goal*(key.correct/Math.max(1,key.correct+key.errors))*100)))}
export function targetLetter(progress,lang,goal){let active=[...LANGUAGES[lang].alphabet].slice(0,progress.unlocked);return active.find(c=>!progress.letters[c]||progress.letters[c].samples<5)||active.reduce((a,c)=>confidence(progress.letters[c],goal)<confidence(progress.letters[a],goal)?c:a,active[0])}
export function savePractice(progress,result,lang,goal){if(result.sessionId&&progress.history.some(r=>r.sessionId===result.sessionId))return null;for(let [letter,data] of Object.entries(result.keys)){if(!LANGUAGES[lang].alphabet.includes(letter)||!data.avgMs)continue;let k=progress.letters[letter]||{samples:0,correct:0,errors:0,sumMs:0,topCPM:0,lastCPM:0};k.samples++;k.correct+=data.correct;k.errors+=data.errors;k.sumMs+=data.avgMs;k.lastCPM=60000/data.avgMs;k.topCPM=Math.max(k.topCPM,k.lastCPM);progress.letters[letter]=k}progress.history.push({...result,at:Date.now()});if(progress.history.length>1500)progress.history.shift();let alphabet=[...LANGUAGES[lang].alphabet],active=alphabet.slice(0,progress.unlocked);if(progress.unlocked<alphabet.length&&active.every(c=>(progress.letters[c]?.samples||0)>=5&&confidence(progress.letters[c],goal)>=100)){progress.unlocked++;return alphabet[progress.unlocked-1]}return null}
export function dailyProgress(progress,now=new Date()){let start=new Date(now);start.setHours(0,0,0,0);let h=progress.history.filter(r=>r.at>=start.getTime());return{sessions:h.length,minutes:h.reduce((s,r)=>s+r.duration,0)/60000}}
export function wordPool(lang,letters=LANGUAGES[lang].alphabet){
 const allowed=new Set(letters);
 return [...new Set([...(EXTRA_WORDS[lang]||[]),...LANGUAGES[lang].words])].filter(w=>w.length>=2&&w.length<=24&&[...w].every(c=>allowed.has(c)));
}
const randomIndex=(length,random)=>Math.min(length-1,Math.max(0,Math.floor((Number(random())||0)*length)));
export function keyDrills(letters,count=25,random=Math.random){
 const chars=[...new Set(letters)];if(!chars.length)throw new Error('Для упражнения нужны доступные клавиши.');
 const patterns=[];
 for(let i=0;i<chars.length;i++){for(let j=i+1;j<chars.length;j++){patterns.push(chars[i]+chars[j],chars[j]+chars[i]);}patterns.push(chars[i]+chars[i]);}
 const start=randomIndex(patterns.length,random);
 return Array.from({length:count},(_,i)=>patterns[(start+i)%patterns.length]);
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
export function practiceMaterial(lang,letters,focus,random=Math.random){
 const pool=wordPool(lang,letters),count=Math.min(25,Math.max(8,pool.length));
 return {words:generateWords({lang,letters,focus,count,random}),type:pool.length?'words':'drill',available:pool.length,
  note:pool.length<25?'Настоящие слова из доступных букв. Пока словарь небольшой, задания короче; с новыми буквами появятся новые слова.':'Настоящие слова без случайных сочетаний и соседних повторов.'};
}
export function lessonInfo(group,step,layout){let fresh=mapPhysicalKeys(LESSON_GROUPS[group][0],layout);let learned=LESSON_GROUPS.slice(0,group+1).map(([k])=>mapPhysicalKeys(k,layout)).join('');return{fresh,learned,group,step,id:`${layout}:${group}:${step}`}}
export function lessonWords(info,lang,random=Math.random){
 if(info.step<=2)return keyDrills(info.step===0?info.fresh:info.learned,25,random);
 return generateWords({lang,letters:info.learned,focus:info.fresh[info.step%info.fresh.length],count:25,random});
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
  this.words=Object.freeze(words.map(w=>w.normalize('NFC')));this.options=Object.freeze({mode,seconds,spaceToFinish,noWayBack,strictTest});this.now=now;this.word=0;this.values=words.map(()=>'');this.positions=this.words.map(w=>[...w].map(()=>({success:false,error:false,first:null,intervals:[]})));this.extras=words.map(()=>new Set());this.status='idle';this.activeMs=0;this.lastStart=0;this.lastKey=null;this.lastCommitted=null;this.correctRegistrations=0;this.errorRegistrations=0;this.firstCorrect=0;this.firstCount=0;this.keyStats={};this.pairStats={};this.corrections=0;this.deleted=0;this.correctionMs=0;this.correctionStarted=null;this.hints=0;this.pauses=0;this.comparable=true;this.spaces=0;this.result=null;
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
 nextWord(){this.tick();if(this.status==='finished'||!this.current.length)return;this.start();this.spaces++;this.lastCommitted=null;if(this.word===this.words.length-1){this.finish();return}this.word++;this.lastKey=this.now()}
 backspace(){if(this.options.noWayBack||this.status==='finished')return;if(this.current.length)this.setValue(this.current.slice(0,-1));else if(this.word>0){this.word--;this.corrections++;this.lastKey=this.now();this.lastCommitted=null}}
 clearWord(){if(this.options.noWayBack||this.status==='finished')return;if(!this.current.length&&this.word>0)this.word--;if(this.current.length)this.setValue('');this.lastKey=this.now();this.lastCommitted=null}
 tick(){if(this.options.mode==='time'&&this.status==='running'&&this.duration>=this.options.seconds*1000)this.finish()}
 metrics(){
  let counts={correct:0,incorrect:0,missed:0,extra:0},correctWords=0,incorrectWords=0,end=Math.min(this.word+1,this.words.length),expectedCount=0;
  for(let w=0;w<end;w++){let full=w<this.word||(this.status==='finished'&&this.options.mode!=='time'),original=this.words[w],typed=this.values[w],alignment=alignText(original,typed);let remaining=original.length;if(!full){let last=alignment.ops.findLast(o=>o.type!=='missed');remaining=last?last.ref+(last.type==='extra'?0:1):0;alignment.missed=alignment.ops.filter(o=>o.type==='missed'&&o.ref<remaining).length}expectedCount+=remaining;for(let key of Object.keys(counts))counts[key]+=alignment[key];if(full||(this.status==='finished'&&typed===original)){if(typed===original)correctWords++;else incorrectWords++}}
  let correct=counts.correct+Math.min(this.spaces,Math.max(0,end-1)),duration=this.duration,cpm=duration>0?correct/(duration/60000):0,total=this.correctRegistrations+this.errorRegistrations,attemptedFinal=counts.correct+counts.incorrect+counts.missed+counts.extra;
  return{...counts,correct,cpm,wpm:cpm/5,outputCPM:duration?this.values.slice(0,end).reduce((s,v)=>s+v.length,Math.min(this.spaces,Math.max(0,end-1)))/(duration/60000):0,accuracy:total?this.correctRegistrations/total*100:100,firstAttemptAccuracy:this.firstCount?this.firstCorrect/this.firstCount*100:100,finalAccuracy:attemptedFinal?counts.correct/attemptedFinal*100:100,duration,correctWords,incorrectWords,errors:this.errorRegistrations,errorPositions:this.positions.slice(0,end).reduce((s,p)=>s+p.filter(i=>i.error).length,0),corrections:this.corrections,deleted:this.deleted,correctionMs:this.correctionMs,hints:this.hints,pauses:this.pauses,comparable:this.comparable,metricsVersion:3};
 }
 finish(){
  if(this.status==='finished')return this.result;this.activeMs=this.options.mode==='time'?Math.min(this.duration,this.options.seconds*1000):this.duration;this.status='finished';let keys={};
  for(let [c,k] of Object.entries(this.keyStats)){let sorted=k.latencies.slice().sort((a,b)=>a-b),middle=sorted.length>>1;keys[c]={...k,avgMs:sorted.length?sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2:null}}
  let end=Math.min(this.word+1,this.words.length),misspelled=[];
  for(let w=0;w<end;w++){let count=this.positions[w].filter(p=>p.error).length+this.extras[w].size;if(this.values[w]!==this.words[w]&&w<this.word)count=Math.max(1,count);for(let n=0;n<count;n++)misspelled.push(this.words[w])}
  this.result={...this.metrics(),sessionId:this.sessionId,keys,pairs:this.pairStats,misspelled,wordCount:this.words.length};return this.result;
 }
}

export function loadData(storage){let defaults={version:2,settings:structuredClone(DEFAULT_SETTINGS),progress:{ru:createProgress(),en:createProgress(),fr:createProgress()},legacyLessons:{},guideSeen:false};try{let value=JSON.parse(storage.getItem('ten-fingers-v2')||'null');if(value?.version===2){defaults.settings={...defaults.settings,...value.settings,layouts:{...defaults.settings.layouts,...value.settings?.layouts}};for(let l of ['ru','en','fr'])defaults.progress[l]={...createProgress(),...value.progress?.[l]};defaults.guideSeen=!!value.guideSeen;defaults.legacyLessons=value.legacyLessons||{};defaults.layoutProgress=value.layoutProgress||{};defaults.learning=value.learning||{};defaults.library=value.library||[]}else{defaults.legacyLessons=JSON.parse(storage.getItem('ten-fingers')||'{}')}}catch{}return defaults}
