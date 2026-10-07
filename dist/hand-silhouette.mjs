// A continuous outer contour joins the articulated fingers to one palm.
const point=a=>a.map(n=>n.toFixed(2)).join(' ');
function sides(points,widths){
 points=points.map(p=>p.slice());points[0]=points[0].map((v,i)=>v+(points[1][i]-v)*.48);
 const first=points[0],tip=points.at(-1),dx=tip[0]-first[0],dy=tip[1]-first[1],length=Math.hypot(dx,dy)||1;
 const nx=-dy/length,ny=dx/length;
 return {left:points.map((p,i)=>[p[0]-nx*widths[i],p[1]-ny*widths[i]]),right:points.map((p,i)=>[p[0]+nx*widths[i],p[1]+ny*widths[i]]),cap:[tip[0]+dx/length*widths.at(-1),tip[1]+dy/length*widths.at(-1)]};
}
const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
function flank(points){return points.slice(1,-1).map((p,i)=>`Q${point(p)} ${point(mid(p,points[i+2]))}`).join(' ')+` L${point(points.at(-1))}`;}
export function handSilhouette(fingers,thumb){
 const outlines=fingers.map((points,i)=>sides(points,i===0?[16,15,14,12]:[20,18,16,14]));
 let d=`M78 480 C84 406 72 330 ${point(outlines[0].left[0])}`;
 for(let i=0;i<outlines.length;i++){
  const {left,right,cap}=outlines[i];
  if(i){const before=outlines[i-1].right[0],next=left[0];d+=` Q${point([(before[0]+next[0])/2,Math.max(before[1],next[1])+6])} ${point(next)}`;}
  d+=` ${flank(left)} C${point([left.at(-1)[0]+(cap[0]-(left.at(-1)[0]+right.at(-1)[0])/2)*1.33,left.at(-1)[1]+(cap[1]-(left.at(-1)[1]+right.at(-1)[1])/2)*1.33])} ${point([right.at(-1)[0]+(cap[0]-(left.at(-1)[0]+right.at(-1)[0])/2)*1.33,right.at(-1)[1]+(cap[1]-(left.at(-1)[1]+right.at(-1)[1])/2)*1.33])} ${point(right.at(-1))} ${flank(right.slice().reverse())}`;
 }
 const t=sides(thumb,[24,20,16]);
 d+=` Q281 293 ${point(t.left.at(-1))} Q${point(t.cap)} ${point(t.right.at(-1))} ${flank(t.right.slice().reverse())} C296 364 250 395 236 480 Z`;
 return d;
}
