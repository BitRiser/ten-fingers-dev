import assert from 'node:assert/strict';
import {bestScore} from '../server/leaderboard.mjs';
import {createHandler} from '../api/leaderboard.js';
import {demoState,DEMO_CYCLE_SECONDS} from '../dist/home-demo.mjs';
const valid={kind:'test',mode:'time',seconds:60,duration:60000,accuracy:96,finalAccuracy:100,comparable:true,pauses:0,hints:0,numbers:false,punctuation:false,cpm:400,correct:400,at:1};
const data=tests=>({progress:{ru:{tests}}});
assert.equal(bestScore(data([valid]),'ru').cpm,400);
for(const change of [{duration:20000},{seconds:30},{accuracy:94.99},{finalAccuracy:80},{pauses:1},{hints:1},{comparable:false},{mode:'words'},{kind:'lesson'},{numbers:true},{punctuation:true},{cpm:999},{cpm:Infinity}])assert.equal(bestScore(data([{...valid,...change}]),'ru'),null,JSON.stringify(change));
assert.equal(bestScore(data([valid,{...valid,cpm:450,correct:450}]),'ru').cpm,450);assert.equal(bestScore(data([valid]),'en'),null);
assert.equal(bestScore({layoutProgress:{'en:qwerty':{tests:[valid]}}},'en').cpm,400);
for(let seconds=20;seconds<DEMO_CYCLE_SECONDS;seconds++)assert.equal(demoState(seconds).cpm,400);assert.equal(DEMO_CYCLE_SECONDS,32);
async function call(handler,method,url,body,headers={}){let output;const res={setHeader(){},end(raw){output=JSON.parse(raw);}};await handler({method,url,body,headers:{host:'app.test',origin:'https://app.test','content-type':'application/json',...headers}},res);return {status:res.statusCode,...output};}
const sql={query:async(query,args)=>{if(query.startsWith('SELECT *'))return [{id:'owner',username:'fast',cpm:400,accuracy:96,place:1}];throw Error('Unexpected query');}};
const guest=createHandler({database:async()=>sql,currentUser:async()=>null});
const list=await call(guest,'GET','/api/leaderboard?lang=ru');assert.equal(list.status,200);assert.equal(list.rows[0].id,undefined);assert.equal(list.rows[0].username,'fast');
assert.equal((await call(guest,'POST','/api/leaderboard',{visible:true})).status,401);
assert.equal((await call(guest,'POST','/api/leaderboard',{visible:true},{origin:'https://evil.test'})).status,403);
assert.equal((await call(guest,'GET','/api/leaderboard?lang=sql')).status,400);
console.log('Passed: ranking eligibility, language isolation, score consistency, public data minimization, participation authentication, CSRF, 12 seconds typing at 400 CPM.');
