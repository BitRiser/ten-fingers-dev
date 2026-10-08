import {database,currentUser,rateLimit} from '../server/db.mjs';
import {sameOrigin,body,response,fail} from '../server/security.mjs';
import {parseBackup,backupData} from '../dist/learning.mjs';
export function createHandler(deps={}){
 const {database: getDatabase=database,currentUser:lookupUser=currentUser,rateLimit:limit=rateLimit}=deps;
 return async function handler(req,res){
 try{
  if(!['GET','PUT'].includes(req.method))return response(res,405,{error:'Метод не поддерживается.'});
  if(req.method==='PUT'&&!sameOrigin(req))return response(res,403,{error:'Запрос отклонён.'});
  const sql=await getDatabase(),user=await lookupUser(req,sql);
  if(!user)return response(res,401,{error:'Войди в аккаунт.'});
  if(req.method==='GET'){const row=(await sql.query('SELECT data,revision FROM typing_progress WHERE user_id=$1',[user.id]))[0];return response(res,200,{userId:user.id,data:row?.data||null,revision:Number(row?.revision||0)});}
  await limit(req,sql,'save',user.id,120,60);
  const input=body(req);if(input.userId!==user.id)return response(res,403,{error:'Аккаунт изменился. Повтори вход.'});
  if(!Number.isSafeInteger(input.revision)||input.revision<0)return response(res,400,{error:'Некорректная версия прогресса.'});
  let data;try{data=parseBackup(backupData(input.data));}catch{return response(res,400,{error:'Некорректный формат прогресса.'});}
  let row;
  if(input.revision===0)row=(await sql.query('INSERT INTO typing_progress(user_id,data) VALUES($1,$2::jsonb) ON CONFLICT(user_id) DO NOTHING RETURNING revision',[user.id,JSON.stringify(data)]))[0];
  else row=(await sql.query('UPDATE typing_progress SET data=$2::jsonb,revision=revision+1,updated_at=now() WHERE user_id=$1 AND revision=$3 RETURNING revision',[user.id,JSON.stringify(data),input.revision]))[0];
  if(!row)return response(res,409,{error:'Прогресс изменился на другом устройстве. Синхронизируем попытки.'});
  return response(res,200,{revision:Number(row.revision)});
 }catch(error){fail(res,error);}
}

}
export default createHandler();
