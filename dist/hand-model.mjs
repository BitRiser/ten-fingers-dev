import {keyBox,center} from './mac-geometry.mjs';
export const HOME_COLUMNS=[0,1,2,3,6,7,8,9];
export const BASES=[[108,265],[157,285],[207,290],[258,277],[422,277],[473,290],[523,285],[572,265]];
export const LENGTHS=[[53,36,25],[61,41,28],[63,44,29],[59,40,28],[59,40,28],[63,44,29],[61,41,28],[53,36,25]];
const ROOT_HEIGHT=32;
export const homePoint=i=>center(keyBox(1,HOME_COLUMNS[i]));
export function keyPoint(key){
 if(key.point)return key.point;
 const box=keyBox(key.row,key.col);
 // Pinkies press the inner part of a wide Shift, rather than its distant centre.
 if(key.row===4)return[key.col===0?box.x+box.width-22:box.x+22,box.y+box.height/2];
 return center(box);
}
export function handOffset(key){
 if(!key||key.finger>7)return[0,0];
 const base=BASES[key.finger],tip=keyPoint(key),home=homePoint(key.finger);
 // The forearm carries the palm a little even for nearby row changes.
 const drift=[(tip[0]-home[0])*.22,(tip[1]-home[1])*.28];
 const dx=tip[0]-base[0]-drift[0],dy=tip[1]-base[1]-drift[1];
 const sideways=Math.sign(dx)*Math.max(0,Math.abs(dx)-Math.abs(dy)*Math.tan(.42));
 const remainingX=dx-sideways,distance=Math.hypot(remainingX,dy),sum=LENGTHS[key.finger].reduce((a,b)=>a+b);
 const reach=Math.sqrt((sum*.94)**2-ROOT_HEIGHT**2),minimum=sum*.72;
 const travel=distance<minimum?distance-minimum:Math.max(0,distance-reach);
 return distance?[drift[0]+sideways+remainingX/distance*travel,drift[1]+dy/distance*travel]:drift;
}
// Fixed-length 3D phalanges. MCP sets pitch; PIP and DIP curl towards the key.
// Flexion shortens the projection; the skin never stretches sideways.
export function jointPose(index,target,tipHeight=0){
 const base=BASES[index],lengths=LENGTHS[index],dx=target[0]-base[0],dy=target[1]-base[1],yaw=Math.max(-Math.PI/2-.5,Math.min(-Math.PI/2+.5,Math.atan2(dy,dx)));
 const drop=ROOT_HEIGHT-tipHeight,sum=lengths.reduce((a,b)=>a+b);
 // During rapid row changes the palm is still travelling. Let the fingertip
 // glide toward its reachable position instead of folding back through the palm.
 const distance=Math.max(sum*.70,Math.min(Math.sqrt((sum*.995)**2-drop**2),Math.hypot(dx,dy))),radius=Math.hypot(distance,drop);
 const vector=q=>{const angles=[0,-q,-1.65*q];return[lengths.reduce((v,l,i)=>v+l*Math.cos(angles[i]),0),lengths.reduce((v,l,i)=>v+l*Math.sin(angles[i]),0)];};
 let low=0,high=1.65;for(let n=0;n<32;n++){const q=(low+high)/2,v=vector(q);if(Math.hypot(...v)>radius)low=q;else high=q;}
 const flex=(low+high)/2,v=vector(flex),pitch=Math.atan2(-drop,Math.max(1,distance))-Math.atan2(v[1],v[0]);
 return{yaw,pitch,flex};
}
export function posePoints(index,pose){
 const points=[[...BASES[index],ROOT_HEIGHT]],angles=[pose.pitch,pose.pitch-pose.flex,pose.pitch-1.65*pose.flex];
 for(let part=0;part<3;part++){const previous=points.at(-1),length=LENGTHS[index][part],projected=length*Math.cos(angles[part]);points.push([previous[0]+Math.cos(pose.yaw)*projected,previous[1]+Math.sin(pose.yaw)*projected,previous[2]+length*Math.sin(angles[part])]);}
 return points;
}
export const solveFinger=(index,target)=>posePoints(index,jointPose(index,target));
// Slightly oblique projection reveals the arch; contact at z=0 stays on the key.
export const projectHandPoints=points=>points.map(([x,y,z])=>[x,y+z*.38,z]);
export function strokePhase(elapsed){
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
 return{amount:elapsed<45?smooth(elapsed/45):elapsed<=100?1:1-smooth((elapsed-100)/140),contact:elapsed>=45&&elapsed<=100,done:elapsed>=240};
}
export function interpolatePose(from,to,amount){const yaw=Math.atan2(Math.sin(to.yaw-from.yaw),Math.cos(to.yaw-from.yaw));return{yaw:from.yaw+yaw*amount,pitch:from.pitch+(to.pitch-from.pitch)*amount,flex:from.flex+(to.flex-from.flex)*amount};}
export function fingerOutline(points,index){
 points=points.map(p=>p.slice());points[0]=points[0].map((v,i)=>v+(points[1][i]-v)*(index===8?.25:.48));
 const widths=index===0||index===7?[16,15,14,12]:index===8?[24,20,16]:[20,18,16,14];
 const before=points[0],tip=points.at(-1),dx=tip[0]-before[0],dy=tip[1]-before[1],length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length,p=a=>a.map(n=>n.toFixed(2)).join(' ');
 const side=sign=>points.map((point,i)=>[point[0]+nx*widths[i]*sign,point[1]+ny*widths[i]*sign]);
 const a=side(1),b=side(-1),mid=(x,y)=>[(x[0]+y[0])/2,(x[1]+y[1])/2];
 const flank=arr=>arr.slice(1,-1).map((point,i)=>`Q${p(point)} ${p(mid(point,arr[i+2]))}`).join(' ')+` L${p(arr.at(-1))}`;
 const cap=[tip[0]+dx/length*widths.at(-1),tip[1]+dy/length*widths.at(-1)];
 const rootCap=[before[0]-dx/length*widths[0]*.6,before[1]-dy/length*widths[0]*.6];
 const capA=[a.at(-1)[0]+dx/length*widths.at(-1)*1.33,a.at(-1)[1]+dy/length*widths.at(-1)*1.33],capB=[b.at(-1)[0]+dx/length*widths.at(-1)*1.33,b.at(-1)[1]+dy/length*widths.at(-1)*1.33];
 return`M${p(a[0])} ${flank(a)} C${p(capA)} ${p(capB)} ${p(b.at(-1))} ${flank(b.slice().reverse())} Q${p(rootCap)} ${p(a[0])} Z`;
}
export function crease(points,index,joint){
 const c=points[joint],before=points[joint-1],after=points[joint+1],dx=after[0]-before[0],dy=after[1]-before[1],length=Math.hypot(dx,dy)||1,w=index===0||index===7?9:12,nx=-dy/length,ny=dx/length,p=a=>a.map(n=>n.toFixed(2)).join(' ');
 return`M${p([c[0]-nx*w,c[1]-ny*w])} Q${p([c[0]+dx/length*3,c[1]+dy/length*3])} ${p([c[0]+nx*w,c[1]+ny*w])}`;
}
export const THUMB_LENGTHS=[43,39];
export function thumbPoints(amount=0){
 const base=[270,335,18],target=[306+amount*15,278-amount*10],dx=target[0]-base[0],dy=target[1]-base[1],distance=Math.hypot(dx,dy),yaw=Math.atan2(dy,dx),drop=base[2]-12*(1-amount),radius=Math.hypot(distance,drop),[a,b]=THUMB_LENGTHS;
 const flex=Math.acos(Math.max(-1,Math.min(1,(radius*radius-a*a-b*b)/(2*a*b)))),pitch=Math.atan2(-drop,distance)-Math.atan2(-b*Math.sin(flex),a+b*Math.cos(flex));
 const points=[base];for(let i=0;i<2;i++){const previous=points.at(-1),angle=pitch-i*flex,length=THUMB_LENGTHS[i],projected=length*Math.cos(angle);points.push([previous[0]+Math.cos(yaw)*projected,previous[1]+Math.sin(yaw)*projected,previous[2]+length*Math.sin(angle)]);}return points;
}

// The expected character is a persistent pose hint, including opposite-hand Shift.
export function hintKeys(target){
 if(!target)return[];
 const keys=target.finger<8?[target]:[];
 if(target.shift)keys.push({finger:target.finger<4?7:0,row:4,col:target.finger<4?1:0});
 return keys;
}
