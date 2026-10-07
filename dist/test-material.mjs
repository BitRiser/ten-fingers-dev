import {generateWords} from './core.mjs';

// Each space-separated token counts toward the selected length, including numbers.
export function generateTestWords({lang='ru',count=25,numbers=false,punctuation=false,random=Math.random}={}){
 const words=generateWords({lang,count,random});
 const firstNumber=Math.min(2,count-1);
 if(numbers)for(let i=firstNumber;i<words.length;i+=6){
  const digits=2+(Math.floor(i/6)%3),limit=10**digits;
  const value=Math.min(limit-1,Math.max(0,Math.floor((Number(random())||0)*limit)));
  words[i]=String(value).padStart(digits,'0');
 }
 if(punctuation){
  const endings=[',','.','?','!',':',';'];
  for(let i=3;i<words.length;i+=4)words[i]+=endings[Math.floor(i/4)%endings.length];
  if((words.length-1)%4!==3)words[words.length-1]+='.';
 }
 return words;
}

export function testContentLabel({numbers=false,punctuation=false}={}){
 return numbers&&punctuation?'Слова, цифры и знаки':numbers?'Слова и цифры':punctuation?'Слова и знаки':'Только слова';
}

export function testRecordName(result){
 const n=result.wordLimit,label=n%10===1&&n%100!==11?'слово':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'слова':'слов';
 const base=result.mode==='time'?`${result.seconds}с`:result.mode==='quote'?'Цитаты':`${n} ${label}`;
 return result.mode==='quote'?base:`${base} · ${testContentLabel(result)}`;
}
