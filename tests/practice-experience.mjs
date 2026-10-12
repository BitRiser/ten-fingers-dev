import assert from 'node:assert/strict';
import {filterStats,practiceReviewWords} from '../dist/practice-experience.mjs';
import {parseBackup,backupData,ensureLearning} from '../dist/learning.mjs';
import {loadData} from '../dist/core.mjs';
const rows=[{kind:'practice',cpm:200},{kind:'activity',activity:'code',cpm:100},{kind:'test',cpm:300},{kind:'lesson',cpm:50},{kind:'activity',activity:'mistakes',cpm:80}];
for(const [mode,speed] of [['practice',200],['code',100],['test',300],['lesson',50],['text',80]])assert.deepEqual(filterStats(rows,mode).map(r=>r.cpm),[speed]);
assert.equal(filterStats(rows).length,5);assert.deepEqual(filterStats([], 'code'),[]);
assert.deepEqual(practiceReviewWords({misspelled:['кот','кот','','код',null]}),['кот','код']);assert.equal(practiceReviewWords({misspelled:Array.from({length:20},(_,i)=>'слово'+i)}).length,8);assert.deepEqual(practiceReviewWords({}),[]);
const data=ensureLearning(loadData({getItem:()=>null}));data.settings.practiceMode='mixed';assert.equal(parseBackup(backupData(data)).settings.practiceMode,'mixed');data.settings.practiceMode='bad';assert.throws(()=>parseBackup(backupData(data)));
console.log('Passed: separated statistics, bounded unique review, practice mode backup and validation.');

const {practiceMaterial}=await import('../dist/core.mjs');let previous='';for(let i=0;i<20;i++){const m=practiceMaterial('ru','оеаин',null,()=>.2);assert(!['он','она','они'].includes(m.words[0]));assert.notEqual(m.words[0],previous);previous=m.words[0];assert(m.words.every(w=>[...w].every(c=>'оеаин'.includes(c))));}
