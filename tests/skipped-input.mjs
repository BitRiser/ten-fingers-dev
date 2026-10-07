import assert from 'node:assert/strict';
import {TypingSession} from '../dist/core.mjs';
import {bindTypingInput} from '../dist/input-adapter.mjs';
let clock=0;const session=new TypingSession(['hello','code'],{now:()=>clock});
clock+=200;session.setValue('h');clock+=200;session.nextWord();
assert.equal(session.metrics().errors,4);assert.equal(session.metrics().omittedErrors,4);assert.equal(session.metrics().accuracy,20);assert.equal(session.metrics().firstAttemptAccuracy,20);
for(const key of ['e','l','o'])assert(session.keyStats[key].errors>0,'Omissions affect the expected letter statistics');
clock+=200;session.nextWord();assert.equal(session.status,'finished');assert.equal(session.result.errors,8);assert.equal(session.result.missed,8);assert.equal(session.result.correctWords,0);assert.equal(session.result.accuracy,100/9);
// Coming back to a skipped word cannot register the same omission repeatedly,
// and later correcting it does not erase the original error from accuracy.
const corrected=new TypingSession(['abc','end'],{now:()=>clock});corrected.setValue('a');corrected.nextWord();corrected.backspace();corrected.nextWord();assert.equal(corrected.metrics().errors,2);
corrected.backspace();corrected.setValue('abc');corrected.nextWord();corrected.setValue('end');corrected.nextWord();assert.equal(corrected.result.finalAccuracy,100);assert.equal(corrected.result.errors,2);assert(corrected.result.accuracy<100);assert(corrected.result.firstAttemptAccuracy<100);
const timed=new TypingSession(['hello','untouched'],{mode:'time',seconds:1,now:()=>clock});timed.setValue('h');clock+=1000;timed.tick();assert.equal(timed.result.omittedErrors,0,'A timer expiry does not penalize text the user has not reached');
const empty=new TypingSession(['ab','cd'],{now:()=>clock});empty.nextWord();empty.nextWord();assert.equal(empty.result.errors,4);assert.equal(empty.result.accuracy,0);assert.equal(empty.result.firstAttemptAccuracy,0);assert.equal(empty.result.cpm,0);
const handlers={},input={value:'',addEventListener:(n,h)=>handlers[n]=h},flashes=[],s=new TypingSession(['ab'],{now:()=>clock});
bindTypingInput(input,{getSession:()=>s,getSettings:()=>({}),paint:()=>{},message:()=>{},showHint:()=>{},press:(char,feedback)=>flashes.push([char,feedback.wrong])});
const key=k=>handlers.keydown({key:k,preventDefault:()=>{},repeat:false});
key('x');key('a');s.setValue('a');input.value='a';key(' ');
assert.deepEqual(flashes,[['x',true],['a',false],[' ',true]],'Wrong physical keys and prematurely pressed space are flagged; the next expected key is correct');
console.log('Passed: every omitted letter, completely skipped words, inclusive accuracy denominator, expected-key errors, correction persistence, deduplication, timer expiry and wrong-key feedback.');
