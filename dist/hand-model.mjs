export const HOME_COLUMNS=[0,1,2,3,6,7,8,9];
export const BASES=[[79,269],[126,290],[173,306],[220,294],[407,294],[454,306],[501,290],[548,269]];
export const LENGTHS=[[70,53,32],[80,61,40],[87,65,44],[82,63,42],[82,63,42],[87,65,44],[80,61,40],[70,53,32]];
export const homePoint=i=>[66+HOME_COLUMNS[i]*55,160];
export function keyPoint(key){if(key.point)return key.point;if(key.row===-1)return[34+key.col*52,44];if(key.row===3)return[312,276];return[[22,42,73][key.row]+key.col*55+24,102+key.row*58]}
export function handOffset(key){if(!key||key.finger>7)return[0,0];let base=BASES[key.finger],tip=keyPoint(key),dx=tip[0]-base[0],dy=tip[1]-base[1],d=Math.hypot(dx,dy),max=LENGTHS[key.finger].reduce((a,b)=>a+b)*.88,travel=Math.max(0,d-max);return[dx/d*travel,dy/d*travel]}
// Top-view projection: flexion shortens the visible phalanges, never stretches them.
export function solveFinger(index,target){
 const base=BASES[index],lengths=LENGTHS[index],sum=lengths.reduce((a,b)=>a+b),dx=target[0]-base[0],dy=target[1]-base[1],distance=Math.hypot(dx,dy),scale=Math.min(.96,sum*.96/Math.max(1,distance));
 const tip=[base[0]+dx*scale,base[1]+dy*scale],bend=Math.min(3,Math.max(0,sum-distance)*.035)*(index<4?-1:1),f1=lengths[0]/sum,f2=(lengths[0]+lengths[1])/sum;
 return[base,[base[0]+(tip[0]-base[0])*f1+bend,base[1]+(tip[1]-base[1])*f1],[base[0]+(tip[0]-base[0])*f2+bend*.4,base[1]+(tip[1]-base[1])*f2],tip];
}
export function fingerOutline(points,index){let widths=index===0||index===7?[15,14,12,11]:[19,17,15,13];let sides=[[],[]];for(let i=0;i<points.length;i++){let before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)],dx=after[0]-before[0],dy=after[1]-before[1],length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;for(let sign of [0,1]){let w=widths[i]*(sign?1:-1);sides[sign].push([points[i][0]+nx*w,points[i][1]+ny*w])}}
 let [left,right]=sides,r=widths.at(-1),p=a=>a.map(n=>n.toFixed(2)).join(' ');return`M${p(left[0])} Q${p(left[1])} ${p([(left[1][0]+left[2][0])/2,(left[1][1]+left[2][1])/2])} Q${p(left[2])} ${p(left[3])} A${r} ${r} 0 0 1 ${p(right[3])} Q${p(right[2])} ${p([(right[1][0]+right[2][0])/2,(right[1][1]+right[2][1])/2])} Q${p(right[1])} ${p(right[0])} Z`;
}
export function crease(points,index,joint){let center=points[joint],before=points[joint-1],after=points[joint+1],dx=after[0]-before[0],dy=after[1]-before[1],length=Math.hypot(dx,dy)||1,width=(index===0||index===7?8:10);return`M${center[0]+dy/length*width} ${center[1]-dx/length*width} Q${center[0]} ${center[1]+3} ${center[0]-dy/length*width} ${center[1]+dx/length*width}`}
