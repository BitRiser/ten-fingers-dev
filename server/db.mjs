import {digest,sessionToken} from './security.mjs';
let client,ready;
export const configured=()=>!!(process.env.DATABASE_URL||process.env.POSTGRES_URL);
export async function database(){
 if(!configured())throw Object.assign(Error('База аккаунтов ещё не подключена.'),{status:503});
 if(!client){const {neon}=await import('@neondatabase/serverless');client=neon(process.env.DATABASE_URL||process.env.POSTGRES_URL);}
 if(!ready)ready=(async()=>{
  await client.query('CREATE TABLE IF NOT EXISTS typing_users (id uuid PRIMARY KEY, username text UNIQUE NOT NULL, password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())');
  await client.query('CREATE TABLE IF NOT EXISTS typing_sessions (token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES typing_users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL)');
  await client.query('CREATE TABLE IF NOT EXISTS typing_progress (user_id uuid PRIMARY KEY REFERENCES typing_users(id) ON DELETE CASCADE, data jsonb NOT NULL, revision bigint NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now())');
  await client.query('CREATE TABLE IF NOT EXISTS typing_rate_limits (key text NOT NULL, window bigint NOT NULL, hits integer NOT NULL, expires_at timestamptz NOT NULL, PRIMARY KEY(key,window))');
 })().catch(error=>{ready=null;throw error;});
 await ready;return client;
}
export async function currentUser(req,sql){const token=sessionToken(req);if(!token)return null;return (await sql.query('SELECT u.id,u.username FROM typing_sessions s JOIN typing_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()',[digest(token)]))[0]||null;}
export async function rateLimit(req,sql,action,identifier='',limit=20,seconds=900){
 const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
 const key=digest(action+':'+(identifier||ip)),window=Math.floor(Date.now()/(seconds*1000));
 const rows=await sql.query('INSERT INTO typing_rate_limits(key,window,hits,expires_at) VALUES($1,$2,1,now()+($3 * interval \'1 second\')) ON CONFLICT(key,window) DO UPDATE SET hits=typing_rate_limits.hits+1 RETURNING hits',[key,window,seconds]);
 if(rows[0].hits>limit)throw Object.assign(Error('Слишком много попыток. Попробуй позже.'),{status:429});
 if(Math.random()<.02){await sql.query('DELETE FROM typing_rate_limits WHERE expires_at<now()');await sql.query('DELETE FROM typing_sessions WHERE expires_at<now()');}
}
