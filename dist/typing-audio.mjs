export const SWITCHES={
 mac:{name:'MacBook',kind:'Тихий · ножничный',description:'Короткий мягкий щелчок ноутбука.',color:'#91a3b6',frequency:760,body:240,noise:.22,decay:.035},
 red:{name:'Linear Red',kind:'Линейный',description:'Гладкое нажатие и низкий мягкий стук.',color:'#ff7f8d',frequency:520,body:170,noise:.32,decay:.065},
 brown:{name:'Tactile Brown',kind:'Тактильный',description:'Плотный стук с лёгким тактильным щелчком.',color:'#cd9b69',frequency:1100,body:290,noise:.45,decay:.05},
 blue:{name:'Clicky Blue',kind:'Кликающий',description:'Яркий двойной щелчок механики.',color:'#7eaeff',frequency:2600,body:420,noise:.65,decay:.045}
};
export const MEME_CLIPS={
 woo:{file:'gachi-woo.wav',name:'Woo',seconds:.24},
 comeon:{file:'gachi-come-on.wav',name:'Come on',seconds:.22},
 yes:{file:'gachi-yes-sir.wav',name:'Yes sir',seconds:.19},
 round:{file:'gachi-round.wav',name:'One more round',seconds:.25},
 surprise:{file:'gachi-surprise.wav',name:'Big surprise',seconds:.27},
 amazing:{file:'gachi-amazing.wav',name:'That’s amazing',seconds:.28},
 finish:{file:'gachi-finish.wav',name:'That’s power, son',seconds:1.6562}
};
export const MEME_SAMPLES=Object.fromEntries(Object.entries(MEME_CLIPS).map(([id,c])=>[id,'./audio/'+c.file]));
export const KEY_SAMPLE_IDS=Object.keys(MEME_CLIPS).filter(id=>id!=='finish');
export function typingSoundKey(e){return !e.repeat&&!e.isComposing&&!e.ctrlKey&&!e.metaKey&&(e.key?.length===1||e.key==='Backspace'||e.key==='Enter')?e.key:null;}
// Sound is a side effect of physical typing. It never drives the lesson clock,
// input, scoring, or progress, and voices are bounded even at very high speeds.
export function createTypingAudio({getSettings,AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext,fetcher=globalThis.fetch,onError=()=>{},random=Math.random}){
 let ctx=null,master=null,noise=null,loading=null,epoch=0,previousMode=null,memeVoice=null,reported=false;
 const samples=new Map(),voices=new Set(),completedSessions=new WeakSet();let bag=[],lastSample=null;
 function config(){const s=getSettings();return {mode:s.soundMode||'off',volume:Math.max(0,Math.min(100,Number(s.soundVolume)||0))/100,switchType:SWITCHES[s.keyboardSwitch]?s.keyboardSwitch:'mac'};}
 function failure(){if(!reported){reported=true;onError('Звук не удалось запустить. Попробуй предпрослушивание ещё раз.');}}
 function ensure(){
  if(!AudioContext)throw new Error('Web Audio unavailable');
  if(!ctx){ctx=new AudioContext();master=ctx.createGain();master.connect(ctx.destination);noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.1),ctx.sampleRate);const out=noise.getChannelData(0);for(let i=0;i<out.length;i++)out[i]=Math.random()*2-1;}
  if(ctx.state==='suspended')ctx.resume().catch(failure);
  master.gain.setTargetAtTime(config().volume*.45,ctx.currentTime,.006);return ctx;
 }
 function stopVoice(v){if(!v)return;voices.delete(v);try{const now=ctx.currentTime,g=v.gain.gain;if(g.cancelAndHoldAtTime)g.cancelAndHoldAtTime(now);else{const level=g.value;g.cancelScheduledValues(now);g.setValueAtTime(level,now);}g.linearRampToValueAtTime(0,now+.025);v.nodes.forEach(n=>{try{n.stop(now+.03)}catch{}});}catch{}if(memeVoice===v)memeVoice=null;}
 function stop(){epoch++;for(const v of [...voices])stopVoice(v);}
 function sync(){const s=config();if(previousMode!==s.mode||!s.volume)stop();previousMode=s.mode;if(master)master.gain.setTargetAtTime(s.mode==='off'?0:s.volume*.45,ctx.currentTime,.006);}
 async function prepare(){
  ensure();if(samples.size===Object.keys(MEME_SAMPLES).length)return;
  if(!loading)loading=Promise.allSettled(Object.entries(MEME_SAMPLES).map(async([id,url])=>{if(samples.has(id))return;const r=await fetcher(new URL(url,import.meta.url));if(!r.ok)throw new Error('Audio asset unavailable');const buffer=await ctx.decodeAudioData(await r.arrayBuffer());samples.set(id,buffer);})).then(results=>{if(results.some(r=>r.status==='rejected'))throw new Error('Audio asset unavailable');}).finally(()=>{loading=null;});
  await loading;
 }
 function prime(){const s=config();if(s.mode==='off'||!s.volume)return;try{ensure();if(s.mode==='gachi')prepare().catch(failure);}catch{failure();}}
 function voice(duration){
  if(voices.size>=8)stopVoice(voices.values().next().value);
  const gain=ctx.createGain();gain.connect(master);const v={gain,nodes:[]};voices.add(v);
  // An inaudible source cleans the whole voice after the envelope finishes.
  const timer=ctx.createBufferSource();timer.buffer=ctx.createBuffer(1,Math.max(1,Math.ceil(ctx.sampleRate*duration)),ctx.sampleRate);timer.connect(gain);timer.onended=()=>{voices.delete(v);gain.disconnect();for(const n of v.nodes)n.disconnect();if(memeVoice===v)memeVoice=null;};timer.start();v.nodes.push(timer);return v;
 }
 function normal(key){
  const profile=SWITCHES[config().switchType],wide=key===' '||key==='Backspace'||key==='Enter',scale=wide?.72:1+(Math.random()-.5)*.09,now=ctx.currentTime;
  const v=voice(.14),envelope=(node,level,start,duration)=>{const g=ctx.createGain();node.connect(g);g.connect(v.gain);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(level,start+.0015);g.gain.exponentialRampToValueAtTime(.0001,start+duration);node.start(start);node.stop(start+duration+.003);v.nodes.push(node);};
  const tap=ctx.createBufferSource(),filter=ctx.createBiquadFilter();tap.buffer=noise;filter.type='bandpass';filter.frequency.value=profile.frequency*scale;filter.Q.value=.7;tap.connect(filter);const tapGain=ctx.createGain();filter.connect(tapGain);tapGain.connect(v.gain);tapGain.gain.setValueAtTime(profile.noise,now);tapGain.gain.exponentialRampToValueAtTime(.0001,now+profile.decay);tap.start(now);tap.stop(now+profile.decay);v.nodes.push(tap);
  const body=ctx.createOscillator();body.type='sine';body.frequency.setValueAtTime(profile.body*scale,now);body.frequency.exponentialRampToValueAtTime(profile.body*.45*scale,now+.035);envelope(body,.18,now,.055);
  if(config().switchType==='brown'||config().switchType==='blue'){const click=ctx.createOscillator();click.type='triangle';click.frequency.value=profile.frequency*scale;envelope(click,config().switchType==='blue'?.13:.065,now+.007,.014);}
 }
 function nextSample(){
  if(!bag.length){bag=KEY_SAMPLE_IDS.filter(id=>samples.has(id));for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag.length>1&&bag.at(-1)===lastSample)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];}
  return lastSample=bag.pop();
 }
 function meme(id){
  const buffer=samples.get(id);if(!buffer)return;
  stopVoice(memeVoice);const source=ctx.createBufferSource(),rate=id==='finish'?1:1+(random()-.5)*.04,length=Math.min(MEME_CLIPS[id].seconds,buffer.duration),duration=length/rate,now=ctx.currentTime,v=voice(duration+.05),fade=Math.min(id==='finish'?.18:.075,duration*.4),attack=Math.min(.008,duration*.1),g=v.gain.gain;
  source.buffer=buffer;source.playbackRate.value=rate;source.connect(v.gain);g.setValueAtTime(0,now);g.linearRampToValueAtTime(.75,now+attack);g.setValueAtTime(.75,Math.max(now+attack,now+duration-fade));g.linearRampToValueAtTime(0,now+duration);source.start(now,0,length);source.stop(now+duration+.005);v.nodes.push(source);memeVoice=v;
 }
 function key(key){const s=config();if(s.mode==='off'||!s.volume)return;try{ensure();if(s.mode==='gachi'){const id=nextSample();if(!id){prime();return;}meme(id);}else normal(key);}catch{failure();}}
 function finish(session){if(session&&completedSessions.has(session))return false;if(session)completedSessions.add(session);const s=config();if(s.mode!=='gachi'||!s.volume)return false;try{ensure();if(!samples.has('finish')){prime();return false;}meme('finish');return true;}catch{failure();return false;}}
 async function preview(id){const s=config();stop();if(s.mode==='off')return {ok:false,message:'Выбери обычный звук или гачимучи.'};if(!s.volume)return {ok:false,message:'Увеличь громкость для предпрослушивания.'};const ticket=epoch;try{ensure();let clip=null;if(s.mode==='gachi'){await prepare();if(ticket!==epoch)return {ok:false};const selected=MEME_CLIPS[id]?id:nextSample();meme(selected);clip=MEME_CLIPS[selected];}else normal('f');reported=false;return {ok:true,...(clip?{name:clip.name,milliseconds:Math.round(clip.seconds*1000)}:{})};}catch{failure();return {ok:false,message:'Аудио недоступно. Проверь соединение и попробуй снова.'};}}
 return {key,prime,preview,finish,sync,stop};
}
