import {LANGUAGES} from './data.mjs';
import {confidence,letterSpeed} from './core.mjs';
export function practiceSelection(lang,progress,goal,excluded='',forced=null){
 const available=[...LANGUAGES[lang].alphabet].slice(0,progress.unlocked),denied=new Set(excluded);
 let active=available.filter(c=>!denied.has(c));if(!active.length)active=available.slice(0,1);
 const measured=active.map(letter=>({letter,...letterSpeed(progress,letter,goal)})).filter(item=>item.count>0).sort((a,b)=>a.cpm-b.cpm||b.count-a.count);
 const target=active.includes(forced)?forced:measured[0]?.letter||active.find(c=>!progress.letters[c])||active.reduce((a,c)=>confidence(progress.letters[c],goal)<confidence(progress.letters[a],goal)?c:a,active[0]);
 return {letters:active.join(''),target,available,weak:measured[0]||null};
}
