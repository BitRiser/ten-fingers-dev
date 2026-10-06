import assert from 'node:assert/strict';
import {LANGUAGES} from '../dist/data.mjs';
import {TypingSession,createProgress,savePractice,confidence,ensurePracticeProgress,loadData,assessPractice} from '../dist/core.mjs';
import {ensureLearning,progressFor,parseBackup,backupData} from '../dist/learning.mjs';
import {ProgressStore,STORAGE_KEY} from '../dist/progress-store.mjs';
const alphabet=LANGUAGES.ru.alphabet.slice(0,5),goal=250;
const words=['она','они','неон','ион','анна','неон'];
function typeExercise(mode='correct',interval=240){
 let time=0;const s=new TypingSession(words,{now:()=>time});
 for(const word of words){
  if(mode==='wrong'){for(const _ of word){time+=interval;s.setValue(s.current+'x');}}
  else if(mode==='skip'){time+=interval;s.setValue(word[0]);}
  else for(const char of word){
   if(mode==='corrected-spam'){time+=interval;s.setValue(s.current+'x');time+=interval;s.backspace();}
   time+=interval;s.setValue(s.current+char);
  }
  time+=interval;s.nextWord();
 }
 return s.result;
}
const allWrong=typeExercise('wrong',24),skipped=typeExercise('skip',24),correctedSpam=typeExercise('corrected-spam',24);
assert.equal(allWrong.cpm,0,'Wrong words cannot earn CPM from their separating spaces');
assert.equal(allWrong.correct,0);assert.equal(allWrong.accuracy,0);
assert.equal(skipped.accuracy,100);assert.ok(skipped.finalAccuracy<95);
assert.equal(correctedSpam.finalAccuracy,100);assert.ok(correctedSpam.cpm>goal);assert.equal(correctedSpam.firstAttemptAccuracy,0);
for(const attempt of [allWrong,skipped,correctedSpam]){
 const p=createProgress();for(let i=0;i<12;i++)savePractice(p,{...attempt,sessionId:crypto.randomUUID()},'ru',goal);
 assert.equal(p.unlocked,5);assert.ok(Object.values(p.letters).every(k=>k.samples===0),'Spam never adds samples');
 assert.equal(p.history.length,12,'Rejected attempts still appear in history');
}
const correct=typeExercise();assert.equal(correct.cpm,goal);
assert.ok([...alphabet].every(c=>correct.keys[c].correct>=2&&correct.keys[c].avgMs),'Generated exercise measures every available letter');
const withSpeed=(cpm,changes={})=>({...correct,sessionId:crypto.randomUUID(),cpm,...changes});
let p=createProgress();savePractice(p,withSpeed(174.999),'ru',goal);assert.ok(Object.values(p.letters).every(k=>k.samples===0));
savePractice(p,withSpeed(175),'ru',goal);assert.ok(Object.values(p.letters).every(k=>k.samples===1),'Exactly 70% qualifies');
for(let i=0;i<2;i++)savePractice(p,withSpeed(175),'ru',goal);
assert.equal(p.unlocked,5);assert.ok(Object.values(p.letters).every(k=>confidence(k,goal)===70),'70% builds samples but cannot open a letter');
savePractice(p,withSpeed(249.999),'ru',goal);assert.equal(p.unlocked,5);assert.ok(Object.values(p.letters).every(k=>confidence(k,goal)===99),'Rounding cannot cross the full goal');
assert.equal(savePractice(p,withSpeed(250),'ru',goal),LANGUAGES.ru.alphabet[5]);
assert.equal(p.unlocked,6);
// Three full-quality attempts open the next letter; two cannot.
const three=createProgress();for(let i=0;i<2;i++)savePractice(three,withSpeed(250),'ru',goal);assert.equal(three.unlocked,5);assert.ok(Object.values(three.letters).every(k=>confidence(k,goal)===0));
assert.equal(savePractice(three,withSpeed(250),'ru',goal),LANGUAGES.ru.alphabet[5]);assert.equal(three.unlocked,6);
// Very fast transitions and good final text cannot compensate for poor input accuracy.
for(const changes of [{accuracy:94.999},{firstAttemptAccuracy:94.999},{incorrectWords:1,correctWords:5},{finalAccuracy:99.99}]){
 const q=createProgress();for(let i=0;i<8;i++)savePractice(q,withSpeed(3000,changes),'ru',goal);
 assert.equal(q.unlocked,5);assert.ok(Object.values(q.letters).every(k=>k.samples===0));
}
const atAccuracy=assessPractice(withSpeed(250,{accuracy:95,firstAttemptAccuracy:95}),goal,alphabet);
assert.equal(atAccuracy.accepted.length,5,'Exactly 95% qualifies when all words are corrected');
const fastKeys=Object.fromEntries(Object.entries(correct.keys).map(([c,k])=>[c,{...k,avgMs:20,latencies:[20,20]}]));
const capped=createProgress();for(let i=0;i<5;i++)savePractice(capped,withSpeed(175,{keys:fastKeys}),'ru',goal);
assert.equal(capped.unlocked,5);assert.ok(Object.values(capped.letters).every(k=>k.lastCPM===175),'Per-letter speed never exceeds the complete exercise');
const inaccurateKey=structuredClone(correct.keys);inaccurateKey.о.errors=1000;
const keyGate=assessPractice(withSpeed(3000,{keys:inaccurateKey}),goal,alphabet);assert.ok(!keyGate.accepted.includes('о'),'Local accuracy gate is independent of speed');
const few=structuredClone(correct.keys);few.о.correct=1;
assert.ok(!assessPractice(withSpeed(250,{keys:few}),goal,alphabet).accepted.includes('о'),'A single isolated observation is not a sample');
// Replaying a completed session cannot manufacture extra samples.
const replay=createProgress(),one=withSpeed(175);savePractice(replay,one,'ru',goal);savePractice(replay,one,'ru',goal);
assert.equal(replay.history.length,1);assert.ok(Object.values(replay.letters).every(k=>k.samples===1));
// An inaccurate attempt cannot trigger an unlock using earlier qualifying counters.
const previous=createProgress();for(let i=0;i<5;i++)savePractice(previous,withSpeed(175),'ru',goal);
for(const k of Object.values(previous.letters)){k.lastCPM=250;k.lastQualified=true;}
savePractice(previous,{...allWrong,sessionId:crypto.randomUUID()},'ru',goal);assert.equal(previous.unlocked,5);
// Existing legitimate history is reassessed once; available letters/history remain intact.
const legacy={...createProgress(),samplePolicy:undefined,unlocked:7,letters:{о:{samples:900,lastCPM:9000,correct:1,errors:999}},history:[withSpeed(175),{...correctedSpam,sessionId:crypto.randomUUID()}]};
ensurePracticeProgress(legacy,'ru',goal);assert.equal(legacy.unlocked,7);assert.equal(legacy.history.length,2);assert.equal(legacy.letters.о.samples,1);
ensurePracticeProgress(legacy,'ru',goal);assert.equal(legacy.letters.о.samples,1);
const older={version:2,progress:{ru:{...legacy,samplePolicy:undefined}}};
const loaded=ensureLearning(loadData({getItem:key=>key===STORAGE_KEY?JSON.stringify(older):null}));assert.equal(loaded.progress.ru.samplePolicy,2);assert.equal(loaded.progress.ru.letters.о.samples,1);
assert.doesNotThrow(()=>parseBackup(backupData(loaded)));
for(const edit of [k=>k.samples=.5,k=>k.lastCPM=-1,k=>k.lastAccuracy=101,k=>k.lastQualified='yes']){const bad=structuredClone(loaded);edit(bad.progress.ru.letters.о);assert.throws(()=>parseBackup(backupData(bad)));}
// Durable writes, retry, and backup preserve the new assessment and immutable session goal.
let data=ensureLearning(loadData({getItem:()=>null}));const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
const store=new ProgressStore({storage,getData:()=>data,onData:d=>data=d,locks:null});data.settings.speedGoal=500;
const ctx={kind:'practice',lang:'ru',layout:'йцукен',rules:{speedGoal:250}},attempt=withSpeed(175);
await store.complete(attempt,ctx);await store.complete(attempt,ctx);
const saved=parseBackup(backupData(JSON.parse(values.get(STORAGE_KEY)))),profile=progressFor(saved,'ru','йцукен');
assert.equal(profile.history.length,1);assert.equal(profile.history[0].practiceSample.floor,175);assert.ok(Object.values(profile.letters).every(k=>k.samples===1));
console.log('Passed: wrong-key spam, skipped words, correction spam, exact 70%/95% gates, full-goal unlock, unrounded boundary, per-key accuracy, bounded speed, minimum observations, history migration, idempotence, durable storage and backup.');
