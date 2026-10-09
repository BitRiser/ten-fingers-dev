import {LANGUAGES} from './data.mjs';
import {confidence} from './core.mjs';
export function practiceSelection(lang,progress,goal,excluded='',forced=null){
 const available=[...LANGUAGES[lang].alphabet].slice(0,progress.unlocked),denied=new Set(excluded);
 let active=available.filter(c=>!denied.has(c));if(!active.length)active=available.slice(0,1);
 const target=active.includes(forced)?forced:active.find(c=>!progress.letters[c])||active.reduce((a,c)=>confidence(progress.letters[c],goal)<confidence(progress.letters[a],goal)?c:a,active[0]);
 return {letters:active.join(''),target,available};
}
