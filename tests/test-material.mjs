import assert from 'node:assert/strict';
import {generateTestWords,testContentLabel,testRecordName} from '../dist/test-material.mjs';
import {LANGUAGES} from '../dist/data.mjs';
import {TypingSession,loadData,wordPool} from '../dist/core.mjs';
import {ensureLearning,backupData,parseBackup,progressFor} from '../dist/learning.mjs';
import {ProgressStore,STORAGE_KEY} from '../dist/progress-store.mjs';

for(const lang of ['ru','en','fr'])for(const count of [1,2,3,10,25,400])for(const numbers of [false,true])for(const punctuation of [false,true]){
 const words=generateTestWords({lang,count,numbers,punctuation,random:()=>.42}),text=words.join(' ');
 assert.equal(words.length,count,'Numbers are part of the requested token count');
 assert.ok(words.every(w=>w.length&&!/\s/.test(w)));
 assert.equal(/\d/.test(text),numbers,'No digits when the option is off; even short tests include digits when on');
 assert.equal(/[,.;:!?]/.test(text),punctuation,'Punctuation is independent from numbers');
 assert.ok([...text].every(c=>c===' '||LANGUAGES[lang].alphabet.includes(c)||numbers&&/\d/.test(c)||punctuation&&/[,.;:!?]/.test(c)));
 if(!numbers&&!punctuation){const vocabulary=new Set(wordPool(lang));assert.ok(words.every(w=>vocabulary.has(w)),'Plain tests contain real dictionary words');}
}
assert.throws(()=>generateTestWords({count:0}));assert.throws(()=>generateTestWords({count:10001}));
assert.equal(generateTestWords({count:10000,numbers:true,punctuation:true,random:()=>0}).length,10000);

// Numeric and punctuation tokens must be typed, not skipped to earn a correct word.
const words=generateTestWords({lang:'en',count:10,numbers:true,punctuation:true,random:()=>.42});
let time=0;const session=new TypingSession(words,{strictTest:true,now:()=>time});
for(const word of words){for(const char of word){time+=200;session.setValue(session.current+char);}time+=200;session.nextWord();}
assert.equal(session.status,'finished');assert.equal(session.result.correctWords,10);assert.equal(session.result.finalAccuracy,100);
assert.ok(session.result.keys['4'].correct>0);assert.ok(session.result.keys['.'].correct>0);
const numberIndex=words.findIndex(w=>/^\d+$/.test(w));
const skipped=new TypingSession(words.slice(numberIndex,numberIndex+1),{strictTest:true,now:()=>time});
time+=200;skipped.setValue('wrong');time+=200;skipped.nextWord();assert.equal(skipped.result.correctWords,0);

// Settings survive reload, backup, and completion; older backups gain a safe default.
let data=ensureLearning(loadData({getItem:()=>null}));
const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
const store=new ProgressStore({storage,getData:()=>data,onData:value=>data=value,locks:null});
data.settings.numbers=true;data.settings.punctuation=true;await store.save();
const reloaded=parseBackup(backupData(ensureLearning(loadData(storage))));assert.equal(reloaded.settings.numbers,true);assert.equal(reloaded.settings.punctuation,true);
const legacy=structuredClone(reloaded);delete legacy.settings.numbers;assert.equal(parseBackup(backupData(legacy)).settings.numbers,false);
const bad=structuredClone(reloaded);bad.settings.numbers='yes';assert.throws(()=>parseBackup(backupData(bad)));
const result={...session.result,at:1,kind:'test',mode:'words',wordLimit:10,numbers:true,punctuation:true};
await store.complete(result,{kind:'test',lang:'en',layout:'qwerty'});
const saved=progressFor(data,'en','qwerty').tests[0];assert.equal(saved.numbers,true);assert.equal(saved.punctuation,true);
assert.ok(values.has(STORAGE_KEY));
assert.equal(new Set([{}, {numbers:true}, {punctuation:true}, {numbers:true,punctuation:true}].map(options=>testRecordName({...result,numbers:false,punctuation:false,...options}))).size,4,'Different test difficulties keep separate records');
assert.equal(testRecordName({mode:'quote',numbers:true,punctuation:true}),'Цитаты');
assert.equal(testRecordName({mode:'time',seconds:30,numbers:true,punctuation:false}),'30с · Слова и цифры');
assert.equal(testContentLabel({}),'Только слова');
console.log('Passed: independent content choices, RU/EN/FR, exact lengths including short and long tests, strict mixed-token input, saved preferences, legacy backup defaults, result metadata and separate records.');
