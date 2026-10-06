export const SWITCHES={
 mac:{name:'MacBook',kind:'Тихий · ножничный',description:'Короткий мягкий щелчок ноутбука.',color:'#91a3b6',frequency:760,body:240,noise:.22,decay:.035},
 red:{name:'Linear Red',kind:'Линейный',description:'Гладкое нажатие и низкий мягкий стук.',color:'#ff7f8d',frequency:520,body:170,noise:.32,decay:.065},
 brown:{name:'Tactile Brown',kind:'Тактильный',description:'Плотный стук с лёгким тактильным щелчком.',color:'#cd9b69',frequency:1100,body:290,noise:.45,decay:.05},
 blue:{name:'Clicky Blue',kind:'Кликающий',description:'Яркий двойной щелчок механики.',color:'#7eaeff',frequency:2600,body:420,noise:.65,decay:.045}
};
export const MEME_SAMPLES={woo:'./audio/gachi-woo.mp3',amazing:'./audio/gachi-amazing.mp3'};
export function typingSoundKey(e){return !e.repeat&&!e.isComposing&&!e.ctrlKey&&!e.metaKey&&(e.key?.length===1||e.key==='Backspace'||e.key==='Enter')?e.key:null;}
// Sound is a side effect of physical typing. It never drives the lesson clock,
// input, scoring, or progress, and voices are bounded even at very high speeds.
export function createTypingAudio({getSettings,AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext,fetcher=globalThis.fetch,onError=()=>{}}){
 let ctx=null,master=null,noise=null,loading=null,epoch=0,previousMode=null,memeVoice=null,reported=false;
 const samples=new Map(),voices=new Set();
 function config(){const s=getSettings();return {mode:s.soundMode||'off',volume:Math.max(0,Math.min(100,Number(s.soundVolume)||0))/100,switchType:SWITCHES[s.keyboardSwitch]?s.keyboardSwitch:'mac'};}
 function failure(){if(!reported){reported=true;onError('Звук не удалось запустить. Попробуй предпрослушивание ещё раз.');}}
 function ensure(){
  if(!AudioContext)throw new Error('Web Audio unavailable');
  if(!ctx){ctx=new AudioContext();master=ctx.createGain();master.connect(ctx.destination);noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.1),ctx.sampleRate);const out=noise.getChannelData(0);for(let i=0;i<out.length;i++)out[i]=Math.random()*2-1;}
  if(ctx.state==='suspended')ctx.resume().catch(failure);
  master.gain.setTargetAtTime(config().volume*.45,ctx.currentTime,.006);return ctx;
 }
 function stopVoice(v){if(!v)return;voices.delete(v);try{v.gain.gain.cancelScheduledValues(ctx.currentTime);v.gain.gain.setTargetAtTime(0,ctx.currentTime,.003);v.nodes.forEach(n=>{try{n.stop(ctx.currentTime+.015)}catch{}});}catch{}if(memeVoice===v)memeVoice=null;}
 function stop(){epoch++;for(const v of [...voices])stopVoice(v);}
 function sync(){const s=config();if(previousMode!==s.mode||!s.volume)stop();previousMode=s.mode;if(master)master.gain.setTargetAtTime(s.mode==='off'?0:s.volume*.45,ctx.currentTime,.006);}
 async function prepare(){
  ensure();if(samples.size===Object.keys(MEME_SAMPLES).length)return;
  if(!loading)loading=Promise.all(Object.entries(MEME_SAMPLES).map(async([id,url])=>{if(samples.has(id))return;const r=await fetcher(new URL(url,import.meta.url));if(!r.ok)throw new Error('Audio asset unavailable');const buffer=await ctx.decodeAudioData(await r.arrayBuffer());samples.set(id,buffer);})).finally(()=>{loading=null;});
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
 function meme(id,key){
  const buffer=samples.get(id);if(!buffer)return;
  stopVoice(memeVoice);const source=ctx.createBufferSource(),rate=key==='Backspace'?.88:key===' '?1:[.97,1,1.04][Math.floor(Math.random()*3)],v=voice(buffer.duration/rate+.1);source.buffer=buffer;source.playbackRate.value=rate;source.connect(v.gain);v.gain.gain.setValueAtTime(.75,ctx.currentTime);source.start();v.nodes.push(source);memeVoice=v;
 }
 function key(key){const s=config();if(s.mode==='off'||!s.volume)return;try{ensure();if(s.mode==='gachi'){const id=key===' '?'amazing':'woo';if(!samples.has(id)){prime();return;}meme(id,key);}else normal(key);}catch{failure();}}
 async function preview(id){const s=config();stop();if(s.mode==='off')return {ok:false,message:'Выбери обычный звук или гачимучи.'};if(!s.volume)return {ok:false,message:'Увеличь громкость для предпрослушивания.'};const ticket=epoch;try{ensure();if(s.mode==='gachi'){await prepare();if(ticket!==epoch)return {ok:false};meme(id==='amazing'?'amazing':'woo',' ');}else normal('f');reported=false;return {ok:true};}catch{failure();return {ok:false,message:'Аудио недоступно. Проверь соединение и попробуй снова.'};}}
 return {key,prime,preview,sync,stop};
}
