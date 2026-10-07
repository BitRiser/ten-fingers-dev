// Remember shown material separately from completed, scored exercises.
// A shuffled deck survives reloads; abandoning an exercise still consumes it.
export const ROTATION_KEY='ten-fingers-material-v1';
export function createExerciseRotation({storage,random=Math.random}={}){
 let memory={};
 const shuffle=items=>{for(let i=items.length-1;i>0;i--){const j=Math.max(0,Math.min(i,Math.floor((Number(random())||0)*(i+1))));[items[i],items[j]]=[items[j],items[i]];}return items;};
 return {pick(key,count,recent=[],groupSize=1){
  if(!Number.isInteger(count)||count<1||count>1000)throw new Error('Неверное число вариантов.');
  if(!Number.isInteger(groupSize)||groupSize<1||count%groupSize)throw new Error('Неверная группа вариантов.');
  let state=memory;
  try{const raw=JSON.parse(storage?.getItem(ROTATION_KEY)||'null');if(raw&&typeof raw==='object'&&!Array.isArray(raw))state=raw;}catch{}
  let deck=state[key],valid=deck?.count===count&&(deck.groupSize||1)===groupSize&&Array.isArray(deck.remaining)&&deck.remaining.every(i=>Number.isInteger(i)&&i>=0&&i<count)&&new Set(deck.remaining).size===deck.remaining.length;
  if(!valid)deck={count,groupSize,remaining:[],last:recent.at(-1)};
  if(!deck.remaining.length){
   deck.remaining=shuffle(Array.from({length:count},(_,i)=>i));
   if(groupSize>1){
    const groups=Array.from({length:count/groupSize},(_,g)=>deck.remaining.filter(i=>Math.floor(i/groupSize)===g)),order=[];
    let lastGroup=Math.floor(deck.last/groupSize);
    for(let round=0;round<groupSize;round++){
     const turn=shuffle(groups.map((_,i)=>i));
     if(turn[0]===lastGroup&&turn.length>1)[turn[0],turn[1]]=[turn[1],turn[0]];
     for(const group of turn)order.push(groups[group].pop());
     lastGroup=turn.at(-1);
    }
    deck.remaining=order.reverse();
   }
   // Prefer fresh material after a corpus update; oldest seen material comes first.
   if(groupSize===1){
    if(!valid&&recent.length)deck.remaining.sort((a,b)=>(recent.includes(b)?1:0)-(recent.includes(a)?1:0));
    if(count>1&&deck.remaining.at(-1)===deck.last){[deck.remaining[0],deck.remaining[count-1]]=[deck.remaining[count-1],deck.remaining[0]];}
   }
  }
  const index=deck.remaining.pop();deck.last=index;state[key]=deck;
  memory=Object.fromEntries(Object.entries(state).slice(-100));
  try{storage?.setItem(ROTATION_KEY,JSON.stringify(memory));}catch{}
  return index;
 }};
}
