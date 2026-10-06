import assert from 'node:assert/strict';
import {createTypingAudio,typingSoundKey,SWITCHES,MEME_SAMPLES,MEME_CLIPS,FINAL_SAMPLE_IDS} from '../dist/typing-audio.mjs';
import {loadData} from '../dist/core.mjs';
import {parseBackup,backupData,ensureLearning} from '../dist/learning.mjs';
import {readFile} from 'node:fs/promises';
const setting={soundMode:'off',soundVolume:35,keyboardSwitch:'mac'};
let instance;
class Param{constructor(){this.events=[];this.value=1}setValueAtTime(v,t){this.value=v;this.events.push({kind:'set',value:v,at:t})}setTargetAtTime(v){this.value=v}exponentialRampToValueAtTime(v){this.value=v}linearRampToValueAtTime(v,t){this.value=v;this.events.push({kind:'ramp',value:v,at:t})}cancelScheduledValues(){}}
class Node{constructor(ctx,type){this.ctx=ctx;this.type=type;this.gain=new Param();this.frequency=new Param();this.playbackRate=new Param();this.Q={};ctx.nodes.push(this)}connect(node){this.output=node}disconnect(){this.disconnected=true}start(...args){this.started=true;this.startArgs=args}stop(at){this.stopped=true;this.stopAt=at;this.stops=(this.stops||0)+1}}
class Context{constructor(){instance=this;this.nodes=[];this.sampleRate=8000;this.currentTime=0;this.state='running';this.destination={}}createGain(){return new Node(this,'gain')}createBufferSource(){return new Node(this,'source')}createOscillator(){return new Node(this,'oscillator')}createBiquadFilter(){return new Node(this,'filter')}createBuffer(c,n,s){return {duration:n/s,getChannelData:()=>new Float32Array(n)}}async decodeAudioData(){return {duration:3,decoded:true}}async resume(){}}
let fetches=0;
const audio=createTypingAudio({getSettings:()=>setting,AudioContext:Context,fetcher:async()=>{fetches++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(4)}}});
audio.key('f');audio.prime();assert.equal(instance,undefined,'off never creates an audio context');
setting.soundMode='normal';audio.sync();
for(const keyboardSwitch of Object.keys(SWITCHES)){setting.keyboardSwitch=keyboardSwitch;assert.equal((await audio.preview()).ok,true)}
for(let i=0;i<80;i++)audio.key('f');
const timers=instance.nodes.filter(n=>n.type==='source'&&n.buffer?.duration===.14);
assert.equal(timers.filter(n=>!n.stopped).length,8,'fast normal typing retains at most eight voice groups');
audio.stop();assert(timers.every(n=>n.stopped),'pause stops all voices');
setting.soundMode='gachi';audio.sync();audio.prime();audio.prime();await audio.preview('tap');assert.equal(fetches,Object.keys(MEME_SAMPLES).length,'samples decode once and concurrent priming shares loads');
for(let i=0;i<80;i++)audio.key('f');
const memes=instance.nodes.filter(n=>n.buffer?.decoded);
assert(memes.every(n=>n.stopAt<.34),'every typing fragment has a bounded short lifetime');
const tapBuffer=memes[0].buffer;
assert(memes.every(n=>n.buffer===tapBuffer),'typing plays only the short vocal sound, never a final phrase');
assert(memes.every(n=>n.stopAt<.115),'vocal keys decay in about 100 milliseconds');
assert(memes.every(n=>n.output.gain.events.some(e=>e.kind==='ramp'&&e.value===0&&e.at>0)),'all fragments ramp down to silence');
assert(memes.slice(0,-1).every(n=>n.stops>=2),'new key crossfades the previous fragment');
const finals=[];
for(let i=0;i<15;i++){const exercise={};assert.equal(audio.finish(exercise),true);const finished=instance.nodes.filter(n=>n.buffer?.decoded).at(-1);finals.push(finished.buffer);assert.notEqual(finished.buffer,tapBuffer);assert(finished.startArgs[2]>.6&&finished.startArgs[2]<2);const count=instance.nodes.length;assert.equal(audio.finish(exercise),false);assert.equal(instance.nodes.length,count,'finishing the same exercise cannot replay the final line');}
assert(finals.every((b,i)=>!i||b!==finals[i-1]),'final phrases never repeat consecutively');
for(let i=0;i<finals.length;i+=FINAL_SAMPLE_IDS.length)assert.equal(new Set(finals.slice(i,i+FINAL_SAMPLE_IDS.length)).size,FINAL_SAMPLE_IDS.length);
setting.soundVolume=0;audio.sync();assert(memes.every(n=>n.stopped));const count=instance.nodes.length;audio.key('f');assert.equal(instance.nodes.length,count,'zero volume is silent');assert.equal((await audio.preview()).ok,false);
setting.soundVolume=35;setting.soundMode='off';audio.sync();assert.equal((await audio.preview()).ok,false);
for(const e of [{key:'f',repeat:true},{key:'f',isComposing:true},{key:'v',metaKey:true},{key:'v',ctrlKey:true},{key:'Escape'},{key:'Shift'},{key:'F1'}])assert.equal(typingSoundKey(e),null);
for(const key of ['f','а',' ','Backspace','Enter'])assert.equal(typingSoundKey({key}),key);
let unblock;setting.soundMode='gachi';const delayed=createTypingAudio({getSettings:()=>setting,AudioContext:Context,fetcher:()=>new Promise(resolve=>{unblock??=[];unblock.push(()=>resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(4)}))})});
const pending=delayed.preview();delayed.stop();unblock.forEach(resolve=>resolve());assert.equal((await pending).ok,false,'closing settings cancels late preview');assert(!instance.nodes.some(n=>n.buffer?.decoded&&n.started));
const failed=createTypingAudio({getSettings:()=>setting,AudioContext:Context,fetcher:async()=>({ok:false})});assert.equal((await failed.preview()).ok,false,'missing samples cannot block input or produce an unhandled rejection');
const legacy=ensureLearning(loadData({getItem:()=>null}));delete legacy.settings.soundMode;delete legacy.settings.soundVolume;delete legacy.settings.keyboardSwitch;
const migrated=parseBackup(backupData(legacy));assert.equal(migrated.settings.soundMode,'off');assert.equal(migrated.settings.soundVolume,35);
for(const [key,value] of [['soundVolume',101],['soundVolume',-1],['soundMode','unknown'],['keyboardSwitch','unknown']]){const copy=structuredClone(migrated);copy.settings[key]=value;assert.throws(()=>parseBackup(backupData(copy)));}
for(const [id,path] of Object.entries(MEME_SAMPLES)){const file=await readFile(new URL(path.replace('./','../dist/'),import.meta.url));assert.equal(file.subarray(0,4).toString(),'RIFF');assert.equal(file.subarray(8,12).toString(),'WAVE');assert.equal(file.readUInt16LE(22),1,'compact mono asset');assert.equal(file.readUInt16LE(34),16);const duration=file.readUInt32LE(40)/file.readUInt32LE(28);assert(Math.abs(duration-MEME_CLIPS[id].seconds)<.001,'file itself is trimmed to advertised duration');assert.equal(file.readInt16LE(44),0,'soft attack starts at silence');assert.equal(file.readInt16LE(file.length-2),0,'soft end avoids clicks');}
console.log('Passed: neutral 100 ms vocal keys, shuffled complete final phrases without repeats, fade-out and replacement crossfade, one final per exercise, lazy/off/mute, switch profiles, bounded voices, shared loading, cancellation, failed loads, physical-key filtering, backups and trimmed WAV assets.');
