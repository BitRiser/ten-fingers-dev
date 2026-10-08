import assert from 'node:assert/strict';
import {lessonInfo,lessonWords,lessonThreshold,loadData} from '../dist/core.mjs';
import {LESSON_GROUPS} from '../dist/data.mjs';
import {ensureLearning,progressFor} from '../dist/learning.mjs';
import {applyCompletion} from '../dist/progress-store.mjs';
for(const [lang,layout] of [['ru','йцукен'],['en','qwerty']]){
 const first=lessonInfo(0,0,layout),words=lessonWords(first,lang);
 assert(words.length>=8&&words.length<=11);assert(words.every(w=>w.length===1));assert.equal(first.fresh.length,2,'Two home keys before reaching another row');
 for(let group=0;group<LESSON_GROUPS.length;group++){
  let previous=0;
  for(let step=0;step<LESSON_GROUPS[group][1];step++){
   const ctx=lessonInfo(group,step,layout),material=lessonWords(ctx,lang,()=>.42),target=lessonThreshold(ctx);
   assert(material.every(w=>[...w].every(c=>ctx.learned.includes(c))));assert(material.length>=8&&material.length<=20);
   assert(target.accuracy>=65&&target.accuracy<=90);assert(target.cpm>=previous);previous=target.cpm;
   assert(target.cpm>=60&&target.cpm<=320,'Every stage has a meaningful speed target');
   if(step<=2)assert(material.every(w=>w.length<=2));if(group<2)assert(material.every(w=>w.length<=3));
  }
 }
}
const data=ensureLearning(loadData({getItem:()=>null}));
const complete=(ctx,accuracy,cpm=1)=>applyCompletion(data,{sessionId:crypto.randomUUID(),accuracy,firstAttemptAccuracy:accuracy,finalAccuracy:accuracy,cpm,duration:1000,keys:{},pairs:{},correct:8,errors:0,at:1},{kind:'lesson',lang:'en',layout:'qwerty',...ctx});
const first=lessonInfo(0,0,'qwerty');assert.equal(complete(first,75,59.999).result.passed,false);assert.equal(complete(first,74.999,60).result.passed,false);assert.equal(complete(first,75,60).result.passed,true,'First lesson requires both precision and 60 CPM');
const checkpoint=lessonInfo(1,6,'qwerty'),req=lessonThreshold(checkpoint);
assert.equal(complete(checkpoint,req.accuracy,req.cpm).result.passed,false);assert.equal(complete(checkpoint,req.accuracy,req.cpm).result.passed,true,'Later chapter checkpoints still need a stable result');
assert.equal(complete(checkpoint,0,0).result.passed,true,'Passed stages are preserved');
assert(progressFor(data,'en','qwerty').lessons[first.id].passed);
console.log('Passed: short home-key lessons, gradual material and requirements, speed gate from the first lesson, exact accuracy boundaries, later checkpoints and retained progress.');

for(const step of [0,1,3]){const info=lessonInfo(0,step,'qwerty');const variants=Array.from({length:40},()=>lessonWords(info,'en').join(' '));assert(new Set(variants).size>=10,'Random lessons vary their order and lengths');const sizes=variants.map(v=>v.split(' ').length);assert(Math.max(...sizes)-Math.min(...sizes)<=3,'Length only varies slightly');}
