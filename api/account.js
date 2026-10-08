import {randomUUID} from 'node:crypto';
import {configured,database,currentUser,rateLimit} from '../server/db.mjs';
import {credentials,hashPassword,checkPassword,newSession,digest,cookie,sessionToken,sameOrigin,body,response,fail} from '../server/security.mjs';
// Matching work factor prevents a cheap username-existence timing oracle.
const dummy='scrypt:131072:8:1:'+'0'.repeat(32)+':'+'0'.repeat(128);
export function createHandler(deps={}){
 const {database: getDatabase=database,currentUser:lookupUser=currentUser,rateLimit:limit=rateLimit,configured:isConfigured=configured}=deps;
 return async function handler(req,res){
 try{
  if(req.method==='GET'){
   if(!isConfigured())return response(res,200,{configured:false,user:null});
   const sql=await getDatabase();return response(res,200,{configured:true,user:await lookupUser(req,sql)});
  }
  if(req.method!=='POST')return response(res,405,{error:'Метод не поддерживается.'});
  if(!sameOrigin(req))return response(res,403,{error:'Запрос отклонён.'});
  const input=body(req,4096),sql=await getDatabase();
  if(input.action==='logout'){const token=sessionToken(req);if(token)await sql.query('DELETE FROM typing_sessions WHERE token_hash=$1',[digest(token)]);res.setHeader('Set-Cookie',cookie(null));return response(res,200,{user:null});}
  if(!['login','register'].includes(input.action))return response(res,400,{error:'Неизвестное действие.'});
  const {username,password}=credentials(input);
  await limit(req,sql,input.action,'',input.action==='register'?5:20,input.action==='register'?3600:900);
  await limit(req,sql,'username',username,20,900);
  let user;
  if(input.action==='register'){
   const hash=await hashPassword(password);
   const rows=await sql.query('INSERT INTO typing_users(id,username,password_hash) VALUES($1,$2,$3) ON CONFLICT(username) DO NOTHING RETURNING id,username',[randomUUID(),username,hash]);user=rows[0];
   if(!user)return response(res,409,{error:'Этот логин уже занят.'});
  }else{
   const rows=await sql.query('SELECT id,username,password_hash FROM typing_users WHERE username=$1',[username]);
   const valid=await checkPassword(password,rows[0]?.password_hash||dummy);
   if(!rows[0]||!valid)return response(res,401,{error:'Неверный логин или пароль.'});
   user={id:rows[0].id,username:rows[0].username};
  }
  const old=sessionToken(req);if(old)await sql.query('DELETE FROM typing_sessions WHERE token_hash=$1',[digest(old)]);
  const token=newSession();await sql.query('INSERT INTO typing_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval \'30 days\')',[digest(token),user.id]);
  res.setHeader('Set-Cookie',cookie(token));return response(res,200,{user});
 }catch(error){fail(res,error);}
}

}
export default createHandler();
