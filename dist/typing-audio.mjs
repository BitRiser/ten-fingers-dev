export const SWITCHES={
 mac:{name:'MacBook',kind:'Тихий профиль',description:'Мягкая обработка записанного щелчка.',color:'#91a3b6',pack:'red',level:.65,lowpass:2800},
 red:{name:'Linear Red',kind:'Линейный',description:'Запись Cherry MX Red · гладкое нажатие.',color:'#ff7f8d',pack:'red',level:.95},
 brown:{name:'Tactile Brown',kind:'Тактильный',description:'Запись Cherry MX Brown · плотный стук.',color:'#cd9b69',pack:'brown',level:1},
 blue:{name:'Clicky Blue',kind:'Кликающий',description:'Запись Cherry MX Blue · резкий щелчок.',color:'#7eaeff',pack:'blue',level:.9}
};
export const SWITCH_SAMPLE_KEYS=['a','s','d','f','space','enter','backspace'];
export const SWITCH_SAMPLES=Object.fromEntries(['red','brown','blue'].flatMap(pack=>SWITCH_SAMPLE_KEYS.map(key=>[pack+'-'+key,'./audio/switch-'+pack+'-'+key+'.wav'])));
export const MEME_CLIPS={
 tap:{file:'gachi-tap.wav',name:'Вокальное нажатие',seconds:.1,kind:'key'},
 yes:{file:'gachi-yes-sir.wav',name:'Yes sir',seconds:1.11787,kind:'finish'},
 amazing:{file:'gachi-amazing.wav',name:'That’s amazing',seconds:.70571,kind:'finish'},
 finish:{file:'gachi-finish.wav',name:'That’s power, son',seconds:1.65764,kind:'finish'},
 "come-on":{"file":"gachi-come-on.wav","name":"Come on","seconds":5.45447,"kind":"finish"},
 round:{"file":"gachi-round.wav","name":"One more round","seconds":7.03361,"kind":"finish"},
 surprise:{"file":"gachi-surprise.wav","name":"Big surprise","seconds":4.95841,"kind":"finish"},
 thanks:{"file":"gachi-thanks.wav","name":"Thank you, sir","seconds":0.96336,"kind":"finish"},
 challenges:{"file":"gachi-challenges.wav","name":"You like challenges","seconds":0.69837,"kind":"finish"},
 go:{"file":"gachi-go.wav","name":"You can go now","seconds":0.69361,"kind":"finish"}
};
export const MEME_SAMPLES=Object.fromEntries(Object.entries(MEME_CLIPS).map(([id,c])=>[id,'./audio/'+c.file]));
export const FINAL_SAMPLE_IDS=Object.keys(MEME_CLIPS).filter(id=>MEME_CLIPS[id].kind==='finish');
export function typingSoundKey(e){return !e.repeat&&!e.isComposing&&!e.ctrlKey&&!e.metaKey&&(e.key?.length===1||e.key==='Backspace'||e.key==='Enter')?e.key:null;}
// Sound is a side effect of physical typing. It never drives the lesson clock,
// input, scoring, or progress, and voices are bounded even at very high speeds.
export function createTypingAudio({getSettings,AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext,fetcher=globalThis.fetch,onError=()=>{},random=Math.random}){
 let ctx=null,master=null,epoch=0,previousMode=null,previousSwitch=null,memeVoice=null,reported=false;
 const samples=new Map(),switchSamples=new Map(),loads=new Map(),voices=new Set(),completedSessions=new WeakSet();let bag=[],lastSample=null;
 function config(){const s=getSettings();return {mode:s.soundMode||'off',volume:Math.max(0,Math.min(100,Number(s.soundVolume)||0))/100,switchType:SWITCHES[s.keyboardSwitch]?s.keyboardSwitch:'mac'};}
 function failure(){if(!reported){reported=true;onError('Звук не загрузился. Открой настройки звука и нажми «Послушать». Для скачанной копии используй start.command или start.bat.');}}
 function ensure(){
  if(!AudioContext)throw new Error('Web Audio unavailable');
  if(!ctx){ctx=new AudioContext();master=ctx.createGain();master.connect(ctx.destination);}
  if(ctx.state==='suspended')ctx.resume().catch(failure);
  master.gain.setTargetAtTime(config().volume*.45,ctx.currentTime,.006);return ctx;
 }
 function stopVoice(v){if(!v)return;voices.delete(v);try{const now=ctx.currentTime,g=v.gain.gain;if(g.cancelAndHoldAtTime)g.cancelAndHoldAtTime(now);else{const level=g.value;g.cancelScheduledValues(now);g.setValueAtTime(level,now);}g.linearRampToValueAtTime(0,now+.025);v.nodes.forEach(n=>{try{n.stop(now+.03)}catch{}});}catch{}if(memeVoice===v)memeVoice=null;}
 function stop(){epoch++;for(const v of [...voices])stopVoice(v);}
 function sync(){const s=config();if(previousMode!==s.mode||previousSwitch!==s.switchType||!s.volume)stop();previousMode=s.mode;previousSwitch=s.switchType;if(master)master.gain.setTargetAtTime(s.mode==='off'?0:s.volume*.45,ctx.currentTime,.006);}
 async function prepare(){
  ensure();const s=config(),meme=s.mode==='gachi',pack=SWITCHES[s.switchType].pack,cache=meme?samples:switchSamples,files=meme?Object.entries(MEME_SAMPLES):Object.entries(SWITCH_SAMPLES).filter(([id])=>id.startsWith(pack+'-'));
  await Promise.allSettled(files.map(async([id,url])=>{
   if(cache.has(id))return;const loadId=(meme?'meme:':'switch:')+id;
   if(!loads.has(loadId))loads.set(loadId,(async()=>{const r=await fetcher(new URL(url,import.meta.url));if(!r.ok)throw new Error('Audio asset unavailable');cache.set(id,await ctx.decodeAudioData(await r.arrayBuffer()));})().finally(()=>loads.delete(loadId)));
   await loads.get(loadId);
  })).then(results=>{if(results.some(r=>r.status==='rejected'))throw new Error('Audio asset unavailable');});
 }
 function prime(){const s=config();if(s.mode==='off'||!s.volume)return;try{ensure();prepare().catch(failure);}catch{failure();}}

 function voice(duration){
  if(voices.size>=8)stopVoice(voices.values().next().value);
  const gain=ctx.createGain();gain.connect(master);const v={gain,nodes:[]};voices.add(v);
  // An inaudible source cleans the whole voice after the envelope finishes.
  const timer=ctx.createBufferSource();timer.buffer=ctx.createBuffer(1,Math.max(1,Math.ceil(ctx.sampleRate*duration)),ctx.sampleRate);timer.connect(gain);timer.onended=()=>{voices.delete(v);gain.disconnect();for(const n of v.nodes)n.disconnect();if(memeVoice===v)memeVoice=null;};timer.start();v.nodes.push(timer);return v;
 }
 let lastKeySample=null;
 function normal(key){
  const profile=SWITCHES[config().switchType],wide={' ':'space',Enter:'enter',Backspace:'backspace'}[key];
  let candidates=SWITCH_SAMPLE_KEYS.slice(0,4).filter(id=>id!==lastKeySample);const selected=wide||candidates[Math.min(candidates.length-1,Math.floor(random()*candidates.length))],buffer=switchSamples.get(profile.pack+'-'+selected);
  if(!buffer){prime();return false;}lastKeySample=selected;
  const now=ctx.currentTime,rate=wide?1:1+(random()-.5)*.035,duration=buffer.duration/rate,v=voice(duration+.02),source=ctx.createBufferSource(),g=v.gain.gain;
  source.buffer=buffer;source.playbackRate.value=rate;
  if(profile.lowpass){const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=profile.lowpass;filter.Q.value=.5;source.connect(filter);filter.connect(v.gain);v.nodes.push(filter);}else source.connect(v.gain);
  g.setValueAtTime(0,now);g.linearRampToValueAtTime(profile.level,now+.001);g.setValueAtTime(profile.level,now+Math.max(.002,duration-.015));g.linearRampToValueAtTime(0,now+duration);source.start(now);source.stop(now+duration+.005);v.nodes.push(source);return true;
 }

 function nextFinal(){
  if(!bag.length){bag=FINAL_SAMPLE_IDS.filter(id=>samples.has(id));for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag.length>1&&bag.at(-1)===lastSample)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];}
  return lastSample=bag.pop();
 }
 function meme(id){
  const buffer=samples.get(id);if(!buffer)return;
  const final=MEME_CLIPS[id].kind==='finish',level=final?.75:.42;
  stopVoice(memeVoice);const source=ctx.createBufferSource(),rate=final?1:1+(random()-.5)*.12,length=Math.min(MEME_CLIPS[id].seconds,buffer.duration),duration=length/rate,now=ctx.currentTime,v=voice(duration+.05),fade=Math.min(final?.12:.05,duration*.45),attack=Math.min(.006,duration*.1),g=v.gain.gain;
  source.buffer=buffer;source.playbackRate.value=rate;source.connect(v.gain);g.setValueAtTime(0,now);g.linearRampToValueAtTime(level,now+attack);g.setValueAtTime(level,Math.max(now+attack,now+duration-fade));g.linearRampToValueAtTime(0,now+duration);source.start(now,0,length);source.stop(now+duration+.005);v.nodes.push(source);memeVoice=v;
 }
 function key(key){const s=config();if(s.mode==='off'||!s.volume)return;try{ensure();if(s.mode==='gachi'){if(!samples.has('tap')){prime();return;}meme('tap');}else normal(key);}catch{failure();}}
 function finish(session){if(session&&completedSessions.has(session))return false;if(session)completedSessions.add(session);const s=config();if(s.mode!=='gachi'||!s.volume)return false;try{ensure();const id=nextFinal();if(!id){prime();return false;}meme(id);return true;}catch{failure();return false;}}
 async function preview(id){const s=config();stop();if(s.mode==='off')return {ok:false,message:'Выбери обычный звук или особый звук.'};if(!s.volume)return {ok:false,message:'Увеличь громкость для предпрослушивания.'};const ticket=epoch;try{ensure();if(ctx.state==='suspended')await ctx.resume();if(ctx.state!=='running')return {ok:false,message:'Браузер приостановил звук. Нажми «Послушать» ещё раз.'};let clip=null;if(s.mode==='gachi'){await prepare();if(ticket!==epoch)return {ok:false};const selected=id==='final'?nextFinal():MEME_CLIPS[id]?id:'tap';meme(selected);clip=MEME_CLIPS[selected];}else {await prepare();if(ticket!==epoch)return {ok:false};normal('f');}reported=false;return {ok:true,...(clip?{name:clip.name,milliseconds:Math.round(clip.seconds*1000)}:{})};}catch(error){console.warn('[typing-audio]',error.name,error.message);failure();return {ok:false,message:'Не удалось загрузить звук. В скачанной копии проверь папку dist/audio и запусти start.command или start.bat. На сайте обнови страницу и повтори.'};}}
 return {key,prime,preview,finish,sync,stop};
}
