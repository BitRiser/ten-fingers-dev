import {STORAGE_KEY} from './progress-store.mjs';
import {parseBackup,backupData} from './learning.mjs';
import {mergeCloudProgress} from './cloud-progress.mjs';
export function scopedStorage(storage,getUser){return {getItem:key=>storage.getItem(key===STORAGE_KEY&&getUser()?`ten-fingers-account:${getUser().id}`:key),setItem:(key,value)=>storage.setItem(key===STORAGE_KEY&&getUser()?`ten-fingers-account:${getUser().id}`:key,value)};}
export function createAccount({getData,replaceData,openDialog,closeDialog,refresh,toast}){
 let user=null,configured=false,checked=false,status='guest',revision=0,timer,epoch=0,queue=Promise.resolve();
 const storage=scopedStorage(localStorage,()=>user),esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 async function request(path,options={}){const response=await fetch('/api/'+path,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...options.headers}});let result;try{result=await response.json();}catch{throw Error('Сохранение в аккаунт пока недоступно.');}if(!response.ok){const error=Error(result.error||'Не удалось сохранить.');error.status=response.status;throw error;}return result;}
 const post=value=>request('account',{method:'POST',body:JSON.stringify(value)});
 function button(){return `<button class="profile-button account-button" data-account="open">${user?'◉ '+esc(user.username):'Войти'}${user?`<small>${status==='saved'?'сохранено':status==='saving'?'сохранение…':status==='error'?'повторить сохранение':'в аккаунте'}</small>`:''}</button>`;}
 function cache(){storage.setItem(STORAGE_KEY,JSON.stringify(getData()));}
 async function apply(value){const validated=parseBackup(backupData(value));storage.setItem(STORAGE_KEY,JSON.stringify(validated));await replaceData(validated);}
 async function sync(owned,who,snapshot){
  if(owned!==epoch||who!==user?.id)return;
  status='saving';refresh();
  try{
   for(let tries=0;tries<3;tries++){
    if(owned!==epoch||who!==user?.id)return;
    try{const saved=await request('progress',{method:'PUT',body:JSON.stringify({userId:who,revision,data:snapshot})});if(owned!==epoch)return;revision=saved.revision;status='saved';refresh();return;}
    catch(error){if(error.status!==409)throw error;const remote=await request('progress');if(owned!==epoch||who!==user?.id)return;if(remote.userId!==who)throw Error('Аккаунт изменился.');revision=remote.revision;snapshot=mergeCloudProgress(remote.data,snapshot);const combined=mergeCloudProgress(snapshot,getData());await apply(combined);snapshot=combined;}
   }
   throw Error('Прогресс меняется на другом устройстве. Повтори сохранение.');
  }catch(error){if(owned!==epoch)return;status='error';refresh();toast(error.message);}
 }
 function schedule(){if(!user)return;clearTimeout(timer);const owned=epoch,who=user.id;timer=setTimeout(()=>{const snapshot=structuredClone(getData());queue=queue.then(()=>sync(owned,who,snapshot)).catch(()=>{});},700);}
 async function init(){
  try{const result=await request('account');configured=result.configured;checked=true;
   if(result.user){user=result.user;epoch++;await replaceData(null,storage);const remote=await request('progress'),raw=storage.getItem(STORAGE_KEY);revision=remote.revision;const cached=raw?parseBackup(backupData(JSON.parse(raw))):null;
    if(remote.data||cached){await apply(remote.data&&cached?mergeCloudProgress(remote.data,cached):remote.data||cached);schedule();}status='saved';
   }
  }catch{checked=true;status='error';}refresh();
 }
 function dialog(mode='login'){
  if(user){openDialog('Твой аккаунт',`<div class="help-copy"><p>Логин: <b>${esc(user.username)}</b></p><p>${status==='error'?'Последние изменения пока только в этом браузере. Повтори сохранение перед выходом.':'Прогресс сохраняется в аккаунте и доступен после входа на другом устройстве.'}</p></div><div class="account-actions"><button class="primary-button" data-account="sync">Сохранить сейчас</button><button class="outline-button" data-account="logout">Выйти</button></div>`);return;}
  const register=mode==='register';
  openDialog(register?'Создать аккаунт':'Войти в аккаунт',`<div class="account-tabs"><button data-account="login" class="${register?'':'active'}">Вход</button><button data-account="register" class="${register?'active':''}">Регистрация</button></div><form id="accountForm" data-mode="${mode}"><label>Логин<input name="username" autocomplete="username" minlength="3" maxlength="32" required placeholder="Например, fastcoder"></label><label>Пароль<input name="password" type="password" autocomplete="${register?'new-password':'current-password'}" minlength="10" maxlength="128" required placeholder="От 10 символов"></label>${register?'<label class="account-import"><input name="importGuest" type="checkbox" checked> Перенести мой прогресс из этого браузера</label>':''}<p class="account-note">${register?'Только логин и пароль. Запомни их: восстановления через почту нет.':'После входа загрузится прогресс этого аккаунта.'}</p><p id="accountError" role="status">${checked&&!configured?'Регистрация появится после подключения базы. Пока прогресс сохраняется в браузере.':''}</p><button class="primary-button" type="submit" ${checked&&!configured?'disabled':''}>${register?'Создать аккаунт':'Войти'}</button></form>`);
  document.getElementById('accountForm').addEventListener('submit',async event=>{
   event.preventDefault();const form=event.currentTarget,submit=form.querySelector('button[type=submit]'),error=form.querySelector('#accountError'),fields=new FormData(form),guest=structuredClone(getData());submit.disabled=true;error.textContent='';
   try{clearTimeout(timer);const result=await post({action:mode,username:fields.get('username'),password:fields.get('password')});form.querySelector('[name=password]').value='';user=result.user;epoch++;revision=0;await replaceData(null,storage);if(register&&fields.has('importGuest'))await apply(guest);const remote=await request('progress');revision=remote.revision;
    // Never merge someone else's guest profile into an existing account.
    const value=remote.data?mergeCloudProgress(remote.data,getData()):getData();
    if(value)await apply(value);else await replaceData(null,storage);
    closeDialog();status='saving';refresh();schedule();toast(register?'Аккаунт создан. Сохраняем прогресс.':'Вход выполнен. Прогресс загружен.');
   }catch(e){if(user){status='error';closeDialog();refresh();dialog();toast(e.message);}else{error.textContent=e.message;submit.disabled=false;}}
  });
 }
 async function handle(action){
  if(['open','login','register'].includes(action)){dialog(action==='register'?'register':'login');return;}
  if(action==='sync'){clearTimeout(timer);const owned=epoch,who=user?.id,snapshot=structuredClone(getData());queue=queue.then(()=>sync(owned,who,snapshot));await queue;dialog();}
  if(action==='logout'){
   clearTimeout(timer);await queue;if(status==='error'){toast('Сначала сохрани изменения или скачай резервную копию.');return;}
   const who=user?.id;await sync(epoch,who,structuredClone(getData()));if(status==='error')return;
   try{cache();await post({action:'logout'});epoch++;user=null;revision=0;status='guest';await replaceData(null,storage);closeDialog();refresh();toast('Выход выполнен. Прогресс аккаунта сохранён.');}catch(error){toast(error.message);}
  }
 }
 window.addEventListener('online',schedule);
 return {storage,button,init,schedule,handle,get user(){return user;}};
}
