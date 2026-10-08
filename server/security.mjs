import {randomBytes,scrypt as derive,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(derive),N=131072,r=8,p=1,maxmem=160*1024*1024;
export const digest=value=>createHash('sha256').update(value).digest('hex');
export function credentials(input){
 const username=typeof input?.username==='string'?input.username.normalize('NFC').trim().toLowerCase():'';
 const password=input?.password;
 if(!/^[a-zа-яё0-9_-]{3,32}$/u.test(username))throw Object.assign(Error('Логин: 3–32 буквы, цифры, _ или -.'),{status:400});
 if(typeof password!=='string'||password.length<10||password.length>128)throw Object.assign(Error('Пароль: от 10 до 128 символов.'),{status:400});
 return {username,password};
}
export async function hashPassword(password){const salt=randomBytes(16).toString('hex'),key=await scrypt(password,salt,64,{N,r,p,maxmem});return `scrypt:${N}:${r}:${p}:${salt}:${key.toString('hex')}`;}
export async function checkPassword(password,stored){
 const parts=String(stored||'').split(':');
 if(parts.length!==6||parts[0]!=='scrypt'||+parts[1]!==N||+parts[2]!==r||+parts[3]!==p||!/^[a-f0-9]{32}$/.test(parts[4])||!/^[a-f0-9]{128}$/.test(parts[5]))return false;
 const key=await scrypt(password,parts[4],64,{N,r,p,maxmem});return timingSafeEqual(key,Buffer.from(parts[5],'hex'));
}
export const newSession=()=>randomBytes(32).toString('hex');
export function sessionToken(req){const value=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith('__Host-tenfast-session='))?.split('=')[1];return /^[a-f0-9]{64}$/.test(value||'')?value:null;}
export function cookie(token){return `__Host-tenfast-session=${token||''}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${token?2592000:0}`;}
export function sameOrigin(req){
 try{const origin=new URL(req.headers.origin);return origin.protocol==='https:'&&origin.host===req.headers.host&&req.headers['sec-fetch-site']!=='cross-site';}catch{return false;}
}
export function body(req,maxBytes=3500000){
 if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw Object.assign(Error('Нужен JSON.'),{status:415});
 let value=req.body;
 if(typeof value==='string'){if(Buffer.byteLength(value)>maxBytes)throw Object.assign(Error('Прогресс слишком большой. Сохрани резервную копию.'),{status:413});try{value=JSON.parse(value);}catch{throw Object.assign(Error('Некорректный запрос.'),{status:400});}}
 if(!value||typeof value!=='object'||Array.isArray(value)||Buffer.byteLength(JSON.stringify(value))>maxBytes)throw Object.assign(Error('Некорректный размер запроса.'),{status:400});
 return value;
}
export function response(res,status,value){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Type','application/json; charset=utf-8');res.statusCode=status;res.end(JSON.stringify(value));}
export function fail(res,error){response(res,error.status||503,{error:error.status?error.message:'Сервис сохранения временно недоступен. Прогресс остаётся в этом браузере.'});}
