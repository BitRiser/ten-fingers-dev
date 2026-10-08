import assert from 'node:assert/strict';
import {practiceSelection} from '../dist/practice-selection.mjs';
import {createProgress,practiceMaterial,loadData} from '../dist/core.mjs';
import {LANGUAGES} from '../dist/data.mjs';
import {ensureLearning,parseBackup,backupData} from '../dist/learning.mjs';
import {mergePreferences} from '../dist/progress-store.mjs';
for(const lang of ['ru','en','fr']){
 const p=createProgress();p.unlocked=LANGUAGES[lang].alphabet.length;
 const alphabet=LANGUAGES[lang].alphabet;
 for(const active of [alphabet.slice(0,4),alphabet.slice(-3),alphabet[0],alphabet.at(-1)]){
  const excluded=[...alphabet].filter(c=>!active.includes(c)).join('');
  const selected=practiceSelection(lang,p,250,excluded,excluded[0]);assert.equal(selected.letters,active);assert(active.includes(selected.target));
  for(const focus of [false,true])for(let attempt=0;attempt<5;attempt++){
   const m=practiceMaterial(lang,selected.letters,selected.target,Math.random,{everyWordFocus:focus});assert(m.words.length);assert(m.words.every(w=>[...w].every(c=>active.includes(c))));if(focus)assert(m.words.every(w=>w.includes(selected.target)));
  }
 }
 assert(practiceSelection(lang,p,250,alphabet).letters.length===1,'Never generates an empty alphabet');
}
const base=ensureLearning(loadData({getItem:()=>null})),local=structuredClone(base),remote=structuredClone(base);local.settings.excludedLetters.ru='н';remote.settings.excludedLetters.en='e';const combined=mergePreferences(base,local,remote);assert.equal(combined.settings.excludedLetters.ru,'н');assert.equal(combined.settings.excludedLetters.en,'e');
const restored=parseBackup(backupData(combined));assert.equal(restored.settings.excludedLetters.ru,'н');assert.equal(restored.settings.excludedLetters.en,'e');
const old=structuredClone(base);delete old.settings.excludedLetters;assert.deepEqual(parseBackup(backupData(old)).settings.excludedLetters,{ru:'',en:'',fr:''});
for(const value of [{ru:'<script>'},{ru:'нн'},{en:3},'no']){const d=structuredClone(base);d.settings.excludedLetters=value;assert.throws(()=>parseBackup(backupData(d)));}
console.log('Passed: excluded letters absent across RU/EN/FR, single consonant drills, target filtering, separate preferences, backup migration and validation.');
