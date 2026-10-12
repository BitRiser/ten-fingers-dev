export function filterStats(history,mode='all'){
 if(mode==='all')return history;
 return history.filter(r=>mode==='code'?r.activity==='code':mode==='text'?r.kind==='activity'&&r.activity!=='code':r.kind===mode);
}
export function practiceReviewWords(result){return [...new Set(result.misspelled||[])].filter(w=>typeof w==='string'&&w.length).slice(0,8);}
