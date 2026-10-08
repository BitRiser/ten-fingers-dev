export function bestScore(data,lang){
 const lists=[data?.progress?.[lang]?.tests||[],...Object.entries(data?.layoutProgress||{}).filter(([key])=>key.startsWith(lang+':')).map(([,p])=>p.tests||[])];
 return lists.flat().filter(r=>r.kind==='test'&&r.mode==='time'&&r.seconds===60&&r.duration>=59000&&r.duration<=61000&&r.accuracy>=95&&r.finalAccuracy>=95&&r.comparable===true&&!r.pauses&&!r.hints&&r.numbers===false&&r.punctuation===false&&Number.isFinite(r.cpm)&&r.cpm>0&&r.cpm<=2000&&Number.isFinite(r.correct)&&Math.abs(r.cpm-r.correct*60000/r.duration)<1).sort((a,b)=>b.cpm-a.cpm||b.accuracy-a.accuracy)[0]||null;
}
export async function updateScores(sql,userId,data){
 for(const lang of ['ru','en']){const score=bestScore(data,lang);if(!score)continue;
 await sql.query('INSERT INTO typing_rank_scores(user_id,lang,cpm,accuracy,achieved_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id,lang) DO UPDATE SET cpm=EXCLUDED.cpm,accuracy=EXCLUDED.accuracy,achieved_at=EXCLUDED.achieved_at WHERE EXCLUDED.cpm>typing_rank_scores.cpm OR (EXCLUDED.cpm=typing_rank_scores.cpm AND EXCLUDED.accuracy>typing_rank_scores.accuracy)',[userId,lang,Math.floor(score.cpm),score.accuracy,Number.isFinite(score.at)?score.at:Date.now()]);}
}
