import assert from 'node:assert/strict';
import {createTypingAudio,typingSoundKey,SWITCHES,MEME_SAMPLES} from '../dist/typing-audio.mjs';
import {loadData} from '../dist/core.mjs';
import {parseBackup,backupData,ensureLearning} from '../dist/learning.mjs';
import {readFile} from 'node:fs/promises';
const setting={soundMode:'off',soundVolume:35,keyboardSwitch:'mac'};
let instance;
class Param{setValueAtTime(v){this.value=v}setTargetAtTime(v){this.value=v}exponentialRampToValueAtTime(v){this.value=v}cancelScheduledValues(){}}
class Node{constructor(ctx,type){this.ctx=ctx;this.type=type;this.gain=new Param();this.frequency=new Param();this.playbackRate=new Param();this.Q={};ctx.nodes.push(this)}connect(){}disconnect(){this.disconnected=true}start(){this.started=true}stop(){this.stopped=true}}
class Context{constructor(){instance=this;this.nodes=[];this.sampleRate=8000;this.currentTime=0;this.state='running';this.destination={}}createGain(){return new Node(this,'gain')}createBufferSource(){return new Node(this,'source')}createOscillator(){return new Node(this,'oscillator')}createBiquadFilter(){return new Node(this,'filter')}createBuffer(c,n,s){return {duration:n/s,getChannelData:()=>new Float32Array(n)}}async decodeAudioData(){return {duration:1,decoded:true}}async resume(){}}
let fetches=0;
const audio=createTypingAudio({getSettings:()=>setting,AudioContext:Context,fetcher:async()=>{fetches++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(4)}}});
audio.key('f');audio.prime();assert.equal(instance,undefined,'off never creates an audio context');
setting.soundMode='normal';audio.sync();
for(const keyboardSwitch of Object.keys(SWITCHES)){setting.keyboardSwitch=keyboardSwitch;assert.equal((await audio.preview()).ok,true)}
for(let i=0;i<80;i++)audio.key('f');
const timers=instance.nodes.filter(n=>n.type==='source'&&n.buffer?.duration===.14);
assert.equal(timers.filter(n=>!n.stopped).length,8,'fast normal typing retains at most eight voice groups');
audio.stop();assert(timers.every(n=>n.stopped),'pause stops all voices');
setting.soundMode='gachi';audio.sync();audio.prime();audio.prime();await audio.preview('woo');assert.equal(fetches,2,'samples decode once and concurrent priming shares loads');
for(let i=0;i<80;i++)audio.key('f');
const memes=instance.nodes.filter(n=>n.buffer?.decoded);
assert.equal(memes.filter(n=>!n.stopped).length,1,'meme voices replace each other rather than stack');
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
for(const path of Object.values(MEME_SAMPLES)){const file=await readFile(new URL(path.replace('./','../dist/'),import.meta.url));assert(file.length>2000,'bundled audio is present');assert.equal(file.subarray(0,3).toString(),'ID3','asset is an MP3, not an HTML error page');}
console.log('Passed: lazy/off/mute, four switch profiles, bounded voices, shared sample loading, preview cancellation, failed loads, physical-key filtering, old backups and bundled MP3 assets.');
