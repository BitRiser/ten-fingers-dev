import {ensureLearning,parseBackup,backupData,mergeSkills} from './learning.mjs';
import {ensurePracticeProgress} from './core.mjs';
const union=(a=[],b=[],limit=1500)=>{const items=new Map();for(const item of [...a,...b]){const key=item.sessionId||item.id||JSON.stringify(item);items.set(key,item);}return [...items.values()].sort((x,y)=>(x.at||0)-(y.at||0)).slice(-limit);};
export function mergeCloudProgress(remote,local){
 const a=parseBackup(backupData(remote)),b=parseBackup(backupData(local)),out=ensureLearning(structuredClone(b));
 for(const name of ['progress','layoutProgress']){
  out[name]??={};
  for(const id of new Set([...Object.keys(a[name]||{}),...Object.keys(b[name]||{})])){
   const x=a[name]?.[id],y=b[name]?.[id];if(!x||!y){out[name][id]=structuredClone(x||y);continue;}
   const p=out[name][id];p.unlocked=Math.max(x.unlocked,y.unlocked);
   for(const list of ['history','tests','lessonHistory'])p[list]=union(x[list],y[list]);
   p.lessons={...x.lessons,...y.lessons};for(const lesson of Object.keys(p.lessons)){const r=x.lessons[lesson],l=y.lessons[lesson];if(r&&l)p.lessons[lesson]={...((r.at||0)>(l.at||0)?r:l),passed:!!r.passed||!!l.passed,streak:Math.max(r.streak||0,l.streak||0),attempts:Math.max(r.attempts||0,l.attempts||0)};}
   const lang=id.split(':')[0];p.samplePolicy=undefined;ensurePracticeProgress(p,lang,out.settings.speedGoal);
   for(const letter of new Set([...Object.keys(x.letters),...Object.keys(y.letters)])){p.letters[letter]??=structuredClone(x.letters[letter]||y.letters[letter]);p.letters[letter].samples=Math.max(p.letters[letter].samples||0,x.letters[letter]?.samples||0,y.letters[letter]?.samples||0);}
  }
 }
 for(const id of new Set([...Object.keys(a.learning||{}),...Object.keys(b.learning||{})])){
  const x=a.learning?.[id],y=b.learning?.[id];if(!x||!y){out.learning[id]=structuredClone(x||y);continue;}
  const m=out.learning[id];for(const list of ['activities','checks','diagnostics'])m[list]=union(x[list],y[list],600);m.seenChecks=[...new Set([...x.seenChecks,...y.seenChecks])];
  const records=m.activities;m.activities=[];m.keys={};m.pairs={};
  for(const record of records)mergeSkills(m,record,{kind:record.kind,activity:record.activity,layout:record.layout,lang:record.lang,title:record.title,contentId:record.contentId},record.at);
  // mergeSkills handles the activity list; control history already merged above.
  m.checks=union(x.checks,y.checks,100);m.diagnostics=union(x.diagnostics,y.diagnostics,600);
 }
 out.library=union(a.library,b.library,500);out.trash=union(a.trash,b.trash,500);out.library=out.library.filter(item=>!out.trash.some(deleted=>deleted.id===item.id));out.guideSeen=a.guideSeen||b.guideSeen;
 return parseBackup(backupData(out));
}
