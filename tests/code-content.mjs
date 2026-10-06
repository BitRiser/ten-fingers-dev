import assert from 'node:assert/strict';
import {CODE_TRACKS,codeExercise,codeTokenType} from '../dist/code-content.mjs';
import {LANGUAGES,findKey} from '../dist/data.mjs';
import {TypingSession,practiceMaterial,loadData} from '../dist/core.mjs';
import {ensureLearning,progressFor,learningFor,backupData,parseBackup} from '../dist/learning.mjs';
import {applyCompletion} from '../dist/progress-store.mjs';
const data=ensureLearning(loadData({getItem:()=>null}));
const ru=progressFor(data,'ru','йцукен');ru.unlocked=9;
for(const [track,definition] of Object.entries(CODE_TRACKS)){
 for(let index=0;index<definition.items.length;index++){
  const item=codeExercise(track,index);assert.equal(item.text,item.words.join(' '));
  assert.ok(item.words.every(w=>w.length>0&&w.length<=80),'Tokens fit the typing engine');
  assert.ok(!/[\r\n\t]/.test(item.text),'No hidden newlines or indentation');
  assert.ok([...item.text].every(char=>findKey(char,'qwerty')),track+' symbols map to the Mac keyboard');
  let clock=0;const s=new TypingSession(item.words,{now:()=>clock});
  for(const word of item.words){for(const char of word){clock+=120;s.setValue(s.current+char);}clock+=120;s.nextWord();}
  assert.equal(s.status,'finished');assert.equal(s.result.accuracy,100);assert.equal(s.result.finalAccuracy,100);
  applyCompletion(data,{...s.result,kind:'activity',at:1000+index},{kind:'activity',activity:'code',lang:'en',layout:'qwerty',title:item.title,contentId:'code-'+track+'-'+index,rules:{speedGoal:250}});
 }
 assert.equal(codeExercise(track,definition.items.length).text,codeExercise(track,0).text);
 assert.equal(codeExercise(track,-1).text,codeExercise(track,definition.items.length-1).text);
}
assert.throws(()=>codeExercise('missing'));
assert.equal(findKey('\\','qwerty').row,5);assert.equal(findKey('|','qwerty').shift,true);assert.equal(findKey('|','qwerty').finger,7);
assert.equal(codeTokenType('const'),'keyword');assert.equal(codeTokenType('"Ada";'),'string');assert.equal(codeTokenType('42'),'number');assert.equal(codeTokenType('=>'),'operator');assert.equal(codeTokenType('values'),'plain');
const en=progressFor(data,'en','qwerty');assert.equal(en.unlocked,5,'Code does not bypass the progressive letter barrier');assert.equal(en.history.length,0);assert.equal(ru.unlocked,9,'English practice does not alter Russian progress');
assert.equal(learningFor(data,'en','qwerty').activities.length,40);
const english=practiceMaterial('en',LANGUAGES.en.alphabet.slice(0,5),'e',()=>.5);
assert.ok(english.words.length>=8);assert.ok(english.words.every(w=>[...w].every(c=>LANGUAGES.en.alphabet.slice(0,5).includes(c))));
assert.ok(LANGUAGES.en.words.includes('async')&&LANGUAGES.en.words.includes('function'),'English includes developer vocabulary');
assert.equal(parseBackup(backupData(data)).layoutProgress['en:qwerty'].unlocked,5,'Code activity survives backup and reload');
console.log('Passed: 40 authored code exercises, supported ANSI symbols, escaped literals, Shift mapping, full correct input, syntax categories, English beginner material, developer vocabulary, independent language profiles, no code unlock bypass and backup round-trip.');
