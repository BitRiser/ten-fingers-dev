import assert from 'node:assert/strict';
import {lessonInfo,lessonWords,lessonThreshold,loadData} from '../dist/core.mjs';
import {LESSON_GROUPS} from '../dist/data.mjs';
import {ensureLearning,progressFor} from '../dist/learning.mjs';
import {applyCompletion} from '../dist/progress-store.mjs';
for(const [lang,layout] of [['ru','йцукен'],['en','qwerty']]){
 const first=lessonInfo(0,0,layout),words=lessonWords(first,lang);
 assert.equal(words.length,8);assert(words.every(w=>w.length===1));assert.equal(first.fresh.length,2,'Two home keys before reaching another row');
 for(let group=0;group<LESSON_GROUPS.length;group++){
  let previous=0;
  for(let step=0;step<LESSON_GROUPS[group][1];step++){
   const ctx=lessonInfo(group,step,layout),material=lessonWords(ctx,lang,()=>.42),target=lessonThreshold(ctx);
   assert(material.every(w=>[...w].every(c=>ctx.learned.includes(c))));assert(material.length>=8&&material.length<=18);
   assert(target.accuracy>=65&&target.accuracy<=90);assert(target.cpm>=previous);previous=target.cpm;
   if(step<2)assert.equal(target.cpm,0,'Each new key group starts without a speed requirement');
   if(step<=2)assert(material.every(w=>w.length<=2));if(group<2)assert(material.every(w=>w.length<=3));
  }
 }
}
const data=ensureLearning(loadData({getItem:()=>null}));
const complete=(ctx,accuracy,cpm=1)=>applyCompletion(data,{sessionId:crypto.randomUUID(),accuracy,firstAttemptAccuracy:accuracy,finalAccuracy:accuracy,cpm,duration:1000,keys:{},pairs:{},correct:8,errors:0,at:1},{kind:'lesson',lang:'en',layout:'qwerty',...ctx});
const first=lessonInfo(0,0,'qwerty');assert.equal(complete(first,64.999).result.passed,false);assert.equal(complete(first,65).result.passed,true,'One slow, accurate enough beginner attempt is sufficient');
const checkpoint=lessonInfo(1,6,'qwerty'),req=lessonThreshold(checkpoint);
assert.equal(complete(checkpoint,req.accuracy,req.cpm).result.passed,false);assert.equal(complete(checkpoint,req.accuracy,req.cpm).result.passed,true,'Later chapter checkpoints still need a stable result');
assert.equal(complete(checkpoint,0,0).result.passed,true,'Passed stages are preserved');
assert(progressFor(data,'en','qwerty').lessons[first.id].passed);
console.log('Passed: short home-key lessons, gradual material and requirements, no initial speed gate, exact accuracy boundaries, later checkpoints and retained progress.');
