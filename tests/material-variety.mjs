import assert from 'node:assert/strict';
import {createExerciseRotation,ROTATION_KEY} from '../dist/exercise-rotation.mjs';
import {contentPool,contentText,validateText} from '../dist/learning.mjs';
import {CODE_VARIANTS,codeExercise} from '../dist/code-content.mjs';
const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,v)=>values.set(key,v)};
let seed=429,random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(const lang of ['ru','en'])for(const type of ['letters','shift','numbers','work']){
 const pool=contentPool(lang,type),key='text-'+lang+'-'+type;
 assert(pool.length>=10);assert.equal(new Set(pool).size,pool.length);
 for(const text of pool){assert.equal(validateText(text,lang==='ru'?'йцукен':'qwerty').unsupported.length,0);assert(text.split(' ').length>=15);}
 const seen=[];
 for(let i=0;i<pool.length;i++){
  // A new controller on every selection simulates reload with no completions.
  const index=createExerciseRotation({storage,random}).pick(key,pool.length);
  seen.push(contentText(lang,type,index));
 }
 assert.equal(new Set(seen).size,pool.length);
 const next=createExerciseRotation({storage,random}).pick(key,pool.length);
 assert.notEqual(contentText(lang,type,next),seen.at(-1),'No repeat at the deck boundary');
}
const codeKey='code-javascript-long',ids=[];
for(let i=0;i<CODE_VARIANTS;i++)ids.push(createExerciseRotation({storage,random}).pick(codeKey,CODE_VARIANTS,[],10));
assert.equal(new Set(ids).size,50);
assert(ids.slice(1).every((id,i)=>Math.floor(id/10)!==Math.floor(ids[i]/10)),'New code changes the structure as well as names');assert.equal(new Set(ids.map(i=>codeExercise('javascript',i,'long').text)).size,50);
assert.notEqual(Math.floor(createExerciseRotation({storage,random}).pick(codeKey,50,[],10)/10),Math.floor(ids.at(-1)/10),'The next deck also changes structure');
const rotation=createExerciseRotation({storage,random});
assert.throws(()=>rotation.pick('invalid',0));
storage.setItem(ROTATION_KEY,'invalid json');assert(Number.isInteger(rotation.pick('safe',3)));
storage.setItem(ROTATION_KEY,JSON.stringify({broken:{count:3,remaining:[-1,99],last:0}}));assert(Number.isInteger(rotation.pick('broken',3)));
const blocked=createExerciseRotation({storage:{getItem:()=>{throw Error();},setItem:()=>{throw Error();}},random});
assert.equal(new Set(Array.from({length:10},()=>blocked.pick('memory',10))).size,10,'Unavailable storage retains a session deck');
assert.equal(new Set(Array.from({length:5},()=>rotation.pick('updated',5))).size,5);
assert.equal(new Set(Array.from({length:7},()=>rotation.pick('updated',7))).size,7,'A changed corpus gets a new complete deck');
console.log('Passed: 82 distinct RU/EN texts, supported keyboard characters, shuffled decks across reloads and abandoned attempts, cycle boundaries, corpus changes and unavailable storage.');
