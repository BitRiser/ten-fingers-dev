import assert from 'node:assert/strict';
import {credentials,hashPassword,checkPassword,cookie,newSession,digest,sameOrigin,body} from '../server/security.mjs';
import {createHandler as accountHandler} from '../api/account.js';
import {createHandler as progressHandler} from '../api/progress.js';
import {currentUser} from '../server/db.mjs';
import {scopedStorage} from '../dist/account.mjs';
import {mergeCloudProgress} from '../dist/cloud-progress.mjs';
import {loadData} from '../dist/core.mjs';
import {ensureLearning} from '../dist/learning.mjs';
import {nextDemoText,demoState} from '../dist/home-demo.mjs';
assert.deepEqual(credentials({username:' FastCoder ',password:'long password'}),{username:'fastcoder',password:'long password'});
assert.throws(()=>credentials({username:'x',password:'123'}));
const hash=await hashPassword('test password 123');
assert(await checkPassword('test password 123',hash));assert(!await checkPassword('different password',hash));assert.notEqual(await hashPassword('test password 123'),hash);assert(!hash.includes('test password'));
const token=newSession();assert.equal(token.length,64);assert.notEqual(digest(token),token);assert.match(cookie(token),/HttpOnly; Secure; SameSite=Lax/);
const headers={host:'example.com',origin:'https://example.com','content-type':'application/json'};
assert(sameOrigin({headers}));assert(!sameOrigin({headers:{...headers,origin:'https://attacker.com'}}));assert(!sameOrigin({headers:{...headers,origin:'http://example.com'}}));assert.throws(()=>body({headers,body:'x'.repeat(4097)},4096));
const users=new Map(),sessions=new Map(),progress=new Map();
const sql={async query(query,args=[]){
 if(query.startsWith('INSERT INTO typing_users')){if(users.has(args[1]))return [];const u={id:args[0],username:args[1],password_hash:args[2]};users.set(u.username,u);return [{id:u.id,username:u.username}];}
 if(query.startsWith('SELECT id,username'))return users.has(args[0])?[users.get(args[0])]:[];
 if(query.startsWith('INSERT INTO typing_sessions')){sessions.set(args[0],{id:args[1],expires:Date.now()+10000});return [];}
 if(query.startsWith('DELETE FROM typing_sessions')){sessions.delete(args[0]);return [];}
 if(query.startsWith('SELECT u.id')){assert(query.includes('s.expires_at>now()'));const session=sessions.get(args[0]);const u=[...users.values()].find(u=>u.id===session?.id);return session?.expires>Date.now()&&u?[{id:u.id,username:u.username}]:[];}
 if(query.startsWith('SELECT data'))return progress.has(args[0])?[progress.get(args[0])]:[];
 if(query.startsWith('INSERT INTO typing_progress')){if(progress.has(args[0]))return [];progress.set(args[0],{data:JSON.parse(args[1]),revision:1});return [{revision:1}];}
 if(query.startsWith('UPDATE typing_progress')){assert(query.includes('WHERE user_id=$1 AND revision=$3'));const p=progress.get(args[0]);if(!p||p.revision!==args[2])return [];p.data=JSON.parse(args[1]);return [{revision:++p.revision}];}
 throw Error('Unexpected query');
}};
const deps={database:async()=>sql,currentUser,rateLimit:async()=>{},configured:()=>true,updateScores:async()=>{}};
const account=accountHandler(deps),save=progressHandler(deps);
async function call(handler,method,value,session,override={}){let payload;const res={headers:{},setHeader(k,v){this.headers[k]=v;},end(v){payload=JSON.parse(v);}};await handler({method,headers:{...headers,...(session?{cookie:session}:{}),...override},body:value},res);return {status:res.statusCode,headers:res.headers,...payload};}
assert.equal((await call(account,'POST',{action:'register'},null,{origin:'https://evil.com'})).status,403);
const register=await call(account,'POST',{action:'register',username:'tester',password:'long password'});assert.equal(register.status,200);assert(!JSON.stringify(register).includes('password_hash'));const session=register.headers['Set-Cookie'].split(';')[0];
assert.equal((await call(account,'POST',{action:'login',username:'tester',password:'wrong password'})).status,401);
assert.equal((await call(account,'POST',{action:'register',username:'tester',password:'long password'})).status,409);
assert.equal((await call(save,'GET')).status,401);
const data=ensureLearning(loadData({getItem:()=>null}));
assert.equal((await call(save,'PUT',{userId:'other',revision:0,data},session)).status,403);
assert.equal((await call(save,'PUT',{userId:register.user.id,revision:0,data},session)).revision,1);
assert.equal((await call(save,'PUT',{userId:register.user.id,revision:0,data},session)).status,409);
assert.equal((await call(save,'PUT',{userId:register.user.id,revision:1,data},session)).revision,2);
const second=await call(account,'POST',{action:'register',username:'tester2',password:'long password'});const secondSession=second.headers['Set-Cookie'].split(';')[0];assert.equal((await call(save,'GET',null,secondSession)).data,null);
await call(account,'POST',{action:'logout'},session);assert.equal((await call(save,'GET',null,session)).status,401);
for(const entry of sessions.values())entry.expires=0;assert.equal((await call(save,'GET',null,secondSession)).status,401);
let user=null;const items=new Map(),store=scopedStorage({getItem:k=>items.get(k),setItem:(k,v)=>items.set(k,v)},()=>user);store.setItem('ten-fingers-v2','guest');user={id:'first'};store.setItem('ten-fingers-v2','first');user={id:'second'};assert.equal(store.getItem('ten-fingers-v2'),undefined);user=null;assert.equal(store.getItem('ten-fingers-v2'),'guest');
const remote=structuredClone(data);remote.progress.ru.unlocked=6;assert.equal(mergeCloudProgress(remote,data).progress.ru.unlocked,6);
let previous='';for(let i=0;i<30;i++){const next=nextDemoText(previous,()=>.5);assert.notEqual(next,previous);previous=next;}assert.equal(demoState(100).cpm,400);
console.log('Passed: password hashing, login/logout, session expiry, CSRF, account isolation, progress revisions and merging, 400 CPM demo variation.');
