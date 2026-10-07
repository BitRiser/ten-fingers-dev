import assert from 'node:assert/strict';
import {TutorialDrill,tutorialWords,onboardingSeen,mergeOnboarding} from '../dist/onboarding.mjs';
import {loadData} from '../dist/core.mjs';
import {ensureLearning,learningFor,progressFor,backupData,parseBackup} from '../dist/learning.mjs';
import {mergePreferences,ProgressStore,STORAGE_KEY} from '../dist/progress-store.mjs';

const fresh=()=>ensureLearning(loadData({getItem:()=>null}));
assert.equal(onboardingSeen(fresh().onboarding),false);
for(const layout of ['йцукен','qwerty','dvorak','azerty']){
 const drill=new TutorialDrill(tutorialWords(layout));
 drill.set('wrong');assert.equal(drill.advance(),false);assert.equal(drill.index,0);
 for(const word of drill.words){drill.set(word);assert.equal(drill.correct,true);assert.equal(drill.advance(),true);}
 assert.equal(drill.done,true);assert.equal(drill.advance(),false);
}
assert.deepEqual(tutorialWords('йцукен'),['ао','оа']);
assert.deepEqual(tutorialWords('qwerty'),['fj','jf']);
for(const status of ['completed','skipped']){
 const data=fresh();data.guideSeen=false;data.onboarding={version:1,status};
 const restored=parseBackup(backupData(data));assert.equal(onboardingSeen(restored.onboarding),true);
 const loaded=loadData({getItem:key=>key===STORAGE_KEY?JSON.stringify(restored):null});
 assert.equal(loaded.onboarding.status,status);
}
const complete={version:1,status:'completed'},skip={version:1,status:'skipped'};
assert.deepEqual(mergeOnboarding(skip,complete),complete);
assert.deepEqual(mergeOnboarding(complete,skip),complete);
assert.equal(onboardingSeen({version:0,status:'completed'}),false);
const base=fresh(),stale=structuredClone(base),remote=structuredClone(base);
remote.onboarding=complete;remote.progress.ru.unlocked=9;
assert.deepEqual(mergePreferences(base,stale,remote).onboarding,complete);
assert.equal(mergePreferences(base,stale,remote).progress.ru.unlocked,9);
const broken=fresh();broken.onboarding={version:1,status:'anything'};
assert.throws(()=>parseBackup(backupData(broken)));

const data=fresh(),model=learningFor(data,'en','qwerty'),progress=progressFor(data,'en','qwerty');
const storage=new Map([[STORAGE_KEY,JSON.stringify(data)]]),mem={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
let local=structuredClone(data);const store=new ProgressStore({storage:mem,getData:()=>local,onData:value=>{local=value;},locks:null});
local.onboarding=complete;learningFor(local,'en','qwerty').configured=true;learningFor(local,'en','qwerty').minutes=10;
const original=JSON.stringify(local.progress);await store.save();
assert.equal(loadData(mem).onboarding.status,'completed');assert.equal(learningFor(loadData(mem),'en','qwerty').minutes,10);
assert.equal(JSON.stringify(local.progress),original,'Tutorial/preferences do not change history or unlock letters');
console.log('Onboarding: first-visit, skip/completion, backup, stale tabs and legacy preference preservation passed.');
