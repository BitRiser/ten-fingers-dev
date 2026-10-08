import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseBackup,backupData,ensureLearning} from '../dist/learning.mjs';
import {loadData} from '../dist/core.mjs';
import {demoState} from '../dist/home-demo.mjs';
const data=ensureLearning(loadData({getItem:()=>null}));
for(const field of ['__proto__','constructor','prototype']){
 const raw=JSON.parse(backupData(data));Object.defineProperty(raw.data.settings,field,{value:{polluted:true},enumerable:true});
 assert.throws(()=>parseBackup(JSON.stringify(raw)),'Reject prototype-pollution fields');
}
assert.equal({}.polluted,undefined);
for(const mutate of [d=>d.settings.fontSize='28px; background:url(https://example.com)',d=>d.settings.theme='"><img src=x onerror=alert(1)>',d=>d.settings.layouts.en='../../private']){const copy=structuredClone(data);mutate(copy);assert.throws(()=>parseBackup(backupData(copy)));}
const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
assert(html.includes('script-src &#39;self&#39;')||html.includes("script-src 'self'"));assert(!/<script(?:\s[^>]*)?>\s*[^<\s]/.test(html),'No inline executable scripts');
assert(html.includes("object-src 'none'"));assert(html.includes("base-uri 'none'"));
assert(demoState(0).mistakes);assert(!demoState(8).mistakes);assert.equal(demoState(20).cpm,320);assert(demoState(12).cpm>demoState(6).cpm);
console.log('Passed: backup pollution and malicious settings, CSP without inline scripts, demo acceleration.');
