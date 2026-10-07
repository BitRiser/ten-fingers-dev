import {loadData,savePractice,lessonThreshold} from './core.mjs';
import {ensureLearning,progressFor,learningFor,mergeSkills,parseBackup,backupData} from './learning.mjs';
import {mergeOnboarding} from './onboarding.mjs';
export const STORAGE_KEY='ten-fingers-v2';
const clone=value=>structuredClone(value),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function mergeItems(base=[],local=[],remote=[]){
 const before=new Set(base.map(t=>t.id)),now=new Map(local.map(t=>[t.id,t]));
 const result=remote.filter(t=>!before.has(t.id)||now.has(t.id));
 for(const item of local){const previous=base.find(t=>t.id===item.id);if(previous&&same(previous,item))continue;const index=result.findIndex(t=>t.id===item.id);if(index<0)result.push(item);else result[index]=item;}
 return result;
}
// Only user preferences are patched into the latest durable state. A stale tab
// never replaces histories or skill counters with its older copy.
export function mergePreferences(base,local,remote){
 const result=ensureLearning(clone(remote));
 for(const [key,value] of Object.entries(local.settings)){
  if(key==='layouts'){for(const [lang,layout] of Object.entries(value))if(!same(base.settings.layouts?.[lang],layout))result.settings.layouts[lang]=layout;}
  else if(!same(base.settings[key],value))result.settings[key]=clone(value);
 }
 result.library=mergeItems(base.library,local.library,result.library);result.trash=mergeItems(base.trash,local.trash,result.trash);
 for(const [id,model] of Object.entries(local.learning||{})){
  const previous=base.learning?.[id],target=result.learning[id]||learningFor(result,...id.split(':'));
  for(const field of ['goal','minutes','configured'])if(!same(previous?.[field],model[field]))target[field]=model[field];
  if(model.plan){if(target.plan?.day===model.plan.day)target.plan.done={...model.plan.done,...target.plan.done};else if(!same(previous?.plan,model.plan))target.plan=clone(model.plan);}
 }
 result.guideSeen=local.guideSeen||result.guideSeen;result.onboarding=mergeOnboarding(local.onboarding,result.onboarding);return result;
}
export function applyCompletion(data,result,context){
 const model=learningFor(data,context.lang,context.layout),existing=model.activities.find(r=>r.sessionId===result.sessionId);
 if(existing)return {result:existing,opened:null};
 const progress=progressFor(data,context.lang,context.layout);let opened=null;
 if(context.kind==='practice')opened=savePractice(progress,result,context.lang,context.rules.speedGoal);
 else if(context.kind==='lesson'){
  const old=progress.lessons[context.id],threshold=lessonThreshold(context),success=Number.isFinite(result.cpm)&&result.cpm>=threshold.cpm&&result.accuracy>=threshold.accuracy&&result.finalAccuracy>=threshold.accuracy&&result.firstAttemptAccuracy>=threshold.accuracy,streak=success?(old?.streak||0)+1:0;
  result.lessonSuccess=success;result.lessonStreak=streak;result.passed=!!old?.passed||streak>=threshold.attempts;
  progress.lessons[context.id]={...result,streak,attempts:(old?.attempts||0)+1};progress.lessonHistory??=[];progress.lessonHistory.push(result);progress.lessonHistory=progress.lessonHistory.slice(-1000);
 }else if(context.kind==='test'){progress.tests.push(result);progress.tests=progress.tests.slice(-1000);}
 mergeSkills(model,result,context,result.at);return {result,opened};
}
export class ProgressStore{
 constructor({storage,getData,onData,locks=globalThis.navigator?.locks}){this.storage=storage;this.getData=getData;this.onData=onData;this.locks=locks;this.baseline=clone(getData());this.queue=Promise.resolve();}
 read(){const raw=this.storage.getItem(STORAGE_KEY);if(raw){const value=JSON.parse(raw);if(value?.version!==2||!value.settings||!value.progress)throw new Error('Сохранённые данные имеют неизвестный формат.');}return parseBackup(backupData(ensureLearning(loadData(this.storage))));}
 write(operation){const run=()=>this.locks?.request?this.locks.request('ten-fingers-progress-write',operation):operation();const pending=this.queue.then(run);this.queue=pending.catch(()=>{});return pending;}
 save({replace=false}={}){
  const local=clone(this.getData()),base=clone(this.baseline);
  return this.write(()=>{const merged=replace?local:mergePreferences(base,local,this.read());this.storage.setItem(STORAGE_KEY,JSON.stringify(merged));const current=this.getData();this.onData(mergePreferences(local,current,merged));this.baseline=clone(merged);return true;});
 }
 complete(result,context){
  return this.write(()=>{
   const fresh=mergePreferences(this.baseline,this.getData(),this.read()),outcome=applyCompletion(fresh,{...result,savedLocally:true},context);
   try{this.storage.setItem(STORAGE_KEY,JSON.stringify(fresh));this.baseline=clone(fresh);outcome.saved=true;}
   catch(error){outcome.saved=false;outcome.error=error;outcome.result.savedLocally=false;}
   this.onData(fresh);return outcome;
  });
 }
}
