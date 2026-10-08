export function sessionProgress(session){
 if(session.status==='finished')return 1;
 if(session.options.mode==='time')return Math.max(0,Math.min(1,session.duration/Math.max(1,session.options.seconds*1000)));
 const total=session.words.length;if(!total)return 0;
 const current=session.words[session.word]||'',partial=Math.min(1,session.current.length/Math.max(1,current.length));
 return Math.max(0,Math.min(1,(session.word+partial)/total));
}
