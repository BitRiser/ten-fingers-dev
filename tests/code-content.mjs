import assert from 'node:assert/strict';
import {CODE_TRACKS,CODE_VOLUMES,codeExercise,codeTokenType,codeLines} from '../dist/code-content.mjs';
import {LANGUAGES,findKey} from '../dist/data.mjs';
import {TypingSession,practiceMaterial,loadData} from '../dist/core.mjs';
import {ensureLearning,progressFor,learningFor,backupData,parseBackup} from '../dist/learning.mjs';
import {applyCompletion} from '../dist/progress-store.mjs';
import {bindTypingInput} from '../dist/input-adapter.mjs';
const data=ensureLearning(loadData({getItem:()=>null}));
const ru=progressFor(data,'ru','йцукен');ru.unlocked=9;
for(const [track,definition] of Object.entries(CODE_TRACKS)){
 for(let index=0;index<definition.items.length;index++){
  const item=codeExercise(track,index);assert.equal(item.words.join(' '),item.text.trim().split(/\s+/).join(' '));
  assert.ok(item.words.every(w=>w.length>0&&w.length<=80),'Tokens fit the typing engine');
  assert.ok(item.lines.every(line=>line.end-line.start===line.words.length));assert.deepEqual(item.lines.flatMap(line=>line.words),item.words);assert.equal(item.lines.map(line=>' '.repeat(line.indent)+line.words.join(' ')).join('\n'),item.text,'Source lines preserve indentation and blank lines');
  assert.ok([...item.words.join(' ')].every(char=>findKey(char,'qwerty')),track+' symbols map to the Mac keyboard');
  let clock=0;const s=new TypingSession(item.words,{now:()=>clock});
  for(const word of item.words){for(const char of word){clock+=120;s.setValue(s.current+char);}clock+=120;s.nextWord();}
  assert.equal(s.status,'finished');assert.equal(s.result.accuracy,100);assert.equal(s.result.finalAccuracy,100);
  applyCompletion(data,{...s.result,kind:'activity',at:1000+index},{kind:'activity',activity:'code',lang:'en',layout:'qwerty',title:item.title,contentId:'code-'+track+'-'+index,rules:{speedGoal:250}});
 }
 assert.equal(codeExercise(track,definition.items.length).text,codeExercise(track,0).text);
 assert.equal(codeExercise(track,-1).text,codeExercise(track,definition.items.length-1).text);
}
for(const track of Object.keys(CODE_TRACKS)){
 let previous=0;
 for(const [volume,option] of Object.entries(CODE_VOLUMES)){const item=codeExercise(track,0,volume);assert.equal(item.parts,option.count);assert.equal(item.words.join(' '),item.text.trim().split(/\s+/).join(' '));assert(item.words.length>previous);previous=item.words.length;for(let i=0;i<option.count;i++)assert(item.text.includes(CODE_TRACKS[track].items[i][1]),'volume keeps complete authored examples');}
}
assert.throws(()=>codeExercise('javascript',0,'missing'));
assert.equal(data.settings.codeTrack,'javascript');data.settings.codeTrack='python';assert.equal(parseBackup(backupData(data)).settings.codeTrack,'python');
assert.equal(data.settings.codeVolume,'short');data.settings.codeVolume='long';assert.equal(parseBackup(backupData(data)).settings.codeVolume,'long');const invalidVolume=structuredClone(data);invalidVolume.settings.codeVolume='invalid';assert.throws(()=>parseBackup(backupData(invalidVolume)));
assert.throws(()=>codeExercise('missing'));
assert.equal(findKey('\\','qwerty').row,5);assert.equal(findKey('|','qwerty').shift,true);assert.equal(findKey('|','qwerty').finger,7);
assert.equal(codeTokenType('const'),'keyword');assert.equal(codeTokenType('"Ada";'),'string');assert.equal(codeTokenType('42'),'number');assert.equal(codeTokenType('=>'),'operator');assert.equal(codeTokenType('values'),'plain');
const en=progressFor(data,'en','qwerty');assert.equal(en.unlocked,5,'Code does not bypass the progressive letter barrier');assert.equal(en.history.length,0);assert.equal(ru.unlocked,9,'English practice does not alter Russian progress');
assert.equal(learningFor(data,'en','qwerty').activities.length,40);
const english=practiceMaterial('en',LANGUAGES.en.alphabet.slice(0,5),'e',()=>.5);
assert.ok(english.words.length>=8);assert.ok(english.words.every(w=>[...w].every(c=>LANGUAGES.en.alphabet.slice(0,5).includes(c))));
assert.ok(LANGUAGES.en.words.includes('async')&&LANGUAGES.en.words.includes('function'),'English includes developer vocabulary');
assert.equal(parseBackup(backupData(data)).layoutProgress['en:qwerty'].unlocked,5,'Code activity survives backup and reload');
assert.deepEqual(codeLines('if (ready) {\n  render();\n}\n\nnext();').lines.map(l=>[l.indent,l.start,l.end]),[[0,0,3],[2,3,4],[0,4,5],[0,5,5],[0,5,6]]);
// Enter cannot advance in the middle of a source line; at its end it acts as
// the line separator without making the user type display-only indentation.
const sample=codeExercise('javascript',0),handlers={},input={value:'',addEventListener:(name,handler)=>handlers[name]=handler};
let clock=0;const codeSession=new TypingSession(sample.words,{now:()=>clock});
bindTypingInput(input,{getSession:()=>codeSession,getSettings:()=>({}),paint:()=>{},showHint:()=>{},message:()=>{},press:()=>{},isLineEnd:i=>sample.lines.some(line=>line.end===i+1)});
const enter=()=>handlers.keydown({key:'Enter',repeat:false,preventDefault:()=>{}});
enter();assert.equal(codeSession.word,0,'Enter in the middle of a line does not skip a token');
for(let i=0;i<sample.words.length;i++){
 clock+=200;codeSession.setValue(sample.words[i]);input.value=codeSession.current;clock+=200;
 if(sample.lines.some(line=>line.end===i+1))enter();else codeSession.nextWord();
}
assert.equal(codeSession.status,'finished');assert.equal(codeSession.result.finalAccuracy,100);
console.log('Passed: formatted blocks and line metadata, 40 authored code exercises, supported ANSI symbols, escaped literals, Shift mapping, full correct input, syntax categories, English beginner material, developer vocabulary, independent language profiles, no code unlock bypass and backup round-trip.');
