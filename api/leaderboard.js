import {database,currentUser,rateLimit} from '../server/db.mjs';
import {response,fail,sameOrigin,body} from '../server/security.mjs';
import {updateScores} from '../server/leaderboard.mjs';
export function createHandler(deps={}){
 const {database:getDatabase=database,currentUser:lookupUser=currentUser,rateLimit:limit=rateLimit}=deps;
 return async(req,res)=>{try{
 if(!['GET','POST'].includes(req.method))return response(res,405,{error:'Метод не поддерживается.'});
 if(req.method==='POST'&&!sameOrigin(req))return response(res,403,{error:'Запрос отклонён.'});
 const lang=new URL(req.url,'https://localhost').searchParams.get('lang')||'ru';
 if(!['ru','en'].includes(lang))return response(res,400,{error:'Выбери RU или EN.'});
 const sql=await getDatabase(),user=await lookupUser(req,sql);
 if(req.method==='POST'){
 if(!user)return response(res,401,{error:'Войди, чтобы участвовать.'});
 const input=body(req,1024);if(typeof input.visible!=='boolean')return response(res,400,{error:'Некорректный запрос.'});
 await limit(req,sql,'ranking',user.id,20,60);
 await sql.query('UPDATE typing_users SET leaderboard_visible=$2 WHERE id=$1',[user.id,input.visible]);
 if(input.visible){const saved=(await sql.query('SELECT data FROM typing_progress WHERE user_id=$1',[user.id]))[0];if(saved)await updateScores(sql,user.id,saved.data);}
 }
 const visible=user?!!(await sql.query('SELECT leaderboard_visible FROM typing_users WHERE id=$1',[user.id]))[0]?.leaderboard_visible:false;
 const ranked='SELECT u.id,u.username,s.cpm,s.accuracy,RANK() OVER (ORDER BY s.cpm DESC,s.accuracy DESC) AS place FROM typing_rank_scores s JOIN typing_users u ON u.id=s.user_id WHERE u.leaderboard_visible=true AND s.lang=$1';
 const rows=await sql.query('SELECT * FROM ('+ranked+') ranks ORDER BY place,username LIMIT 10',[lang]);
 const own=user&&visible?(await sql.query('SELECT * FROM ('+ranked+') ranks WHERE id=$2',[lang,user.id]))[0]:null;
 const publicRow=r=>({username:r.username,cpm:Number(r.cpm),accuracy:Number(r.accuracy),place:Number(r.place),you:r.id===user?.id});
 response(res,200,{lang,visible,rows:rows.map(publicRow),own:own?publicRow(own):null});
 }catch(error){fail(res,error);}};
}
export default createHandler();
