import assert from 'node:assert/strict';
import {LAYOUTS,findKey,numberRow} from '../dist/data.mjs';
import {keyboardMarkup} from '../dist/keyboard.mjs';
import {BASES,LENGTHS,THUMB_LENGTHS,homePoint,keyPoint,handOffset,solveFinger,jointPose,posePoints,thumbPoints,strokePhase,interpolatePose,hintKeys} from '../dist/hand-model.mjs';
import {keyBox,center} from '../dist/mac-geometry.mjs';
for(const [layout,definition] of Object.entries(LAYOUTS)){
 const markup=keyboardMarkup(layout);
 assert.equal((markup.match(/class="key-cap /g)||[]).length,78,'ANSI has 78 keys, without a duplicate Return/ISO key');
 for(const c of new Set([...definition.rows.join(''),...definition.shift.join(''),...numberRow(layout).base,...numberRow(layout).shift])){
  const key=findKey(c,layout);assert.deepEqual(keyPoint(key),center(keyBox(key.row,key.col)),'Finger target shares the rendered key coordinates');
  const offset=handOffset(key),target=keyPoint(key).map((p,i)=>p-offset[i]),pose=solveFinger(key.finger,target);
  for(let i=0;i<3;i++)assert.ok(Math.abs(Math.hypot(...pose[i+1].map((p,axis)=>p-pose[i][axis]))-LENGTHS[key.finger][i])<1e-8,'A phalanx never stretches in 3D');
  assert.ok(Math.hypot(pose[3][0]-target[0],pose[3][1]-target[1])<.001,'Reach adjustment puts the fingertip on the intended key');
  assert.ok(Math.abs(pose[3][2])<.001,'The fingertip reaches the key plane');
 }
}
for(const key of [{row:4,col:0,finger:0},{row:4,col:1,finger:7}]){
 const box=keyBox(key.row,key.col),point=keyPoint(key),offset=handOffset(key),pose=jointPose(key.finger,point.map((p,i)=>p-offset[i]));
 assert.ok(point[0]>box.x&&point[0]<box.x+box.width,'Shift contact stays inside the key');
 assert.ok(Math.abs(pose.yaw+Math.PI/2)<=.451,'The wrist moves instead of over-spreading the pinky');
}
for(let i=0;i<8;i++){
 const home=jointPose(i,homePoint(i));
 for(let part=0;part<=60;part++){
  const far=jointPose(i,[homePoint(i)[0]+(i<4?40:-40),68]),t=part/60,pose=posePoints(i,{yaw:home.yaw+(far.yaw-home.yaw)*t,pitch:home.pitch+(far.pitch-home.pitch)*t,flex:home.flex+(far.flex-home.flex)*t});
  assert.deepEqual(pose[0].slice(0,2),BASES[i],'Knuckle remains attached to the palm through motion');
  for(let bone=0;bone<3;bone++)assert.ok(Math.abs(Math.hypot(...pose[bone+1].map((p,axis)=>p-pose[bone][axis]))-LENGTHS[i][bone])<1e-8);
 }
}
for(let step=0;step<=100;step++){
 const points=thumbPoints(step/100);for(let i=0;i<2;i++)assert.ok(Math.abs(Math.hypot(...points[i+1].map((p,axis)=>p-points[i][axis]))-THUMB_LENGTHS[i])<1e-8,'Thumb has fixed bones during the space press');
}
console.log('Passed: all layouts, 78-key Mac ANSI geometry, exact fingertip alignment, fixed 3D phalanges throughout motion, palm attachment, articulated thumb.');

// Row changes move the whole palm before fingers finish their reach.
for(const char of ['q','z','1','p','/','0']){
 const key=findKey(char,'qwerty'),offset=handOffset(key);
 assert(Math.hypot(...offset)>3,'Nearby as well as distant row changes move the palm');
}
for(let i=0;i<8;i++){
 assert(LENGTHS[i].reduce((sum,x)=>sum+x,0)<140,'Human finger length remains proportional to the palm');
 // Every intermediate point is bounded when a fast typist changes from the
 // number row to a low key before the palm has caught up.
 for(let shift=-100;shift<=80;shift+=5){
  const pose=jointPose(i,[homePoint(i)[0]+35,homePoint(i)[1]+shift],8),points=posePoints(i,pose);
  assert(Math.abs(pose.yaw+Math.PI/2)<=.501,'No backwards finger or extreme sideways splay');
  assert(points.every(p=>p.every(Number.isFinite)));
  assert(points.slice(1).every((p,j)=>p[1]<points[j][1]),'All phalanges point toward the keys, rather than folding into the palm');
 }
}

for(let i=0;i<8;i++)for(let ms=0;ms<=240;ms+=4){const home=jointPose(i,homePoint(i),12),key={row:2,col:i<4?i:i+2,finger:i},offset=handOffset(key),goal=jointPose(i,keyPoint(key).map((v,a)=>v-offset[a])),phase=strokePhase(ms),points=posePoints(i,interpolatePose(home,goal,phase.amount));assert(points.every(p=>p.every(Number.isFinite)));for(let bone=0;bone<3;bone++)assert(Math.abs(Math.hypot(...points[bone+1].map((p,a)=>p-points[bone][a]))-LENGTHS[i][bone])<1e-8);}
assert.equal(strokePhase(0).amount,0);assert.equal(strokePhase(45).amount,1);assert.equal(strokePhase(100).contact,true);assert.equal(strokePhase(240).amount,0);assert.equal(strokePhase(240).done,true);
assert.deepEqual(hintKeys(null),[]);assert.deepEqual(hintKeys(findKey(' ','qwerty')),[]);
for(const char of ['a','q','z','1','A','?','{']){const key=findKey(char,'qwerty'),hints=hintKeys(key);assert.equal(hints.length,key.shift?2:1);assert.equal(hints[0],key);if(key.shift){assert.equal(hints[1].row,4);assert.equal(hints[1].finger,key.finger<4?7:0);}for(const hint of hints){const offset=handOffset(hint),point=keyPoint(hint),points=posePoints(hint.finger,jointPose(hint.finger,point.map((v,a)=>v-offset[a]),8));assert(Math.hypot(points[3][0]+offset[0]-point[0],points[3][1]+offset[1]-point[1])<.001,'the held hint points at the expected key');assert(Math.abs(points[3][2]-8)<.001,'hint hovers over the key until pressed');}}
