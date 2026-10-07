import assert from 'node:assert/strict';
import {lessonRoute,lessonMapMarkup} from '../dist/lesson-map.mjs';
const lessons={};let route=lessonRoute(lessons,'qwerty');
assert.equal(route.total,81);assert.equal(route.completed,0);assert.equal(route.next.number,1);
assert.equal(route.groups.flatMap(g=>g.steps).filter(s=>s.status==='current').length,1);
lessons['qwerty:0:0']={passed:false,streak:1};assert.equal(lessonRoute(lessons,'qwerty').next.number,1,'one successful attempt still repeats the stage');
lessons['qwerty:0:0']={passed:true};route=lessonRoute(lessons,'qwerty');assert.equal(route.next.number,2);assert.equal(route.completed,1);
lessons['qwerty:0:3']={passed:true};route=lessonRoute(lessons,'qwerty');assert.equal(route.next.number,2);assert.equal(route.groups[0].steps[3].status,'done','previously passed later stages remain available');
assert.equal(lessonRoute(lessons,'йцукен').completed,0,'layout progress stays isolated');
const markup=lessonMapMarkup(lessons,'qwerty');assert(markup.includes('role="progressbar"'));assert(markup.includes('aria-valuenow="2"'));assert(markup.includes('aria-current="step"'));assert(markup.includes('disabled'));
assert.equal((markup.match(/data-chapter="/g)||[]).length,11,'every chapter is present once, including the folded path');
assert.equal((markup.match(/data-from-chapter="/g)||[]).length,10,'all eleven chapter blocks form one connected route');
for(let i=0;i<10;i++)assert(markup.includes(`data-from-chapter="${i}" data-to-chapter="${i+1}"`));
assert.equal((markup.match(/data-chapter="[01]" open/g)||[]).length,2,'only the two nearest maps are expanded by default');
assert(markup.includes('journey-fold future'),'distant chapters are hidden until requested');
for(const step of route.groups[0].steps)lessons[`qwerty:${step.group}:${step.step}`]={passed:true};
const advanced=lessonMapMarkup(lessons,'qwerty');assert(advanced.includes('journey-fold history'));assert.equal((advanced.match(/data-from-chapter="/g)||[]).length,10);assert.equal(lessonRoute(lessons,'qwerty').next.group,1);
for(const group of route.groups)for(const step of group.steps)lessons[`qwerty:${step.group}:${step.step}`]={passed:true};
route=lessonRoute(lessons,'qwerty');assert.equal(route.percent,100);assert.equal(route.next,null);assert.equal(route.completed,81);
console.log('Passed: 81-stage lesson map, next/retry/locked states, saved progress, layout isolation and course completion.');

const {lessonPath,chapterPath}=await import('../dist/lesson-map.mjs');
for(const [from,to,width] of [[[60,46],[180,55],480],[[420,50],[420,150],480],[[300,41],[300,154],360]]){
 const path=lessonPath(from,to),coords=path.match(/-?\d+(?:\.\d+)?/g).map(Number);
 assert.deepEqual(coords.slice(0,2),from);assert.deepEqual(coords.slice(-2),to);
 for(let i=0;i<coords.length;i+=2){assert(coords[i]>=0&&coords[i]<=width);assert(coords[i+1]>=0&&coords[i+1]<=208);}
 assert(path.includes('C'),'soft curves between lesson nodes');
}
const connection=chapterPath([120,190],[180,320]).match(/-?\d+(?:\.\d+)?/g).map(Number);
assert.deepEqual(connection.slice(0,2),[120,190]);assert.deepEqual(connection.slice(-2),[180,320]);
assert(connection.filter((_,i)=>i%2===0).every(x=>x>=120&&x<=180),'chapter links remain between endpoints, not outside cards');
