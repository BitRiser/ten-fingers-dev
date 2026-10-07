import {CODE_TEMPLATES} from './code-templates.mjs';
// Authored code blocks. Displayed for typing, never executed.
export const CODE_TRACKS={
  "javascript": {
    "name": "JavaScript",
    "file": "practice.js",
    "mark": "JS",
    "description": "Переменные, функции, массивы и async / await."
  },
  "typescript": {
    "name": "TypeScript",
    "file": "practice.ts",
    "mark": "TS",
    "description": "Типы, интерфейсы, generics и типизированные функции."
  },
  "python": {
    "name": "Python",
    "file": "practice.py",
    "mark": "PY",
    "description": "Списки, словари, comprehensions и f-строки."
  },
  "c": {
    "name": "C",
    "file": "practice.c",
    "mark": "C",
    "description": "Функции, циклы, массивы, указатели и структуры."
  },
  "cpp": {
    "name": "C++",
    "file": "practice.cpp",
    "mark": "C++",
    "description": "Потоки, STL, классы, шаблоны и современный C++."
  }
};
export const CODE_VOLUMES={short:{name:'Короткий',min:15,max:20},medium:{name:'Средний',min:20,max:30},long:{name:'Длинный',min:30,max:40}};
export function codeLines(text){
 let next=0;
 const lines=text.split('\n').map((source,index)=>{
  const indent=source.match(/^ */)[0].length,words=source.trim().match(/\S+/g)||[],start=next;next+=words.length;
  return{number:index+1,indent,start,end:next,words};
 });
 return {lines,words:lines.flatMap(line=>line.words)};
}
export const CODE_NAME_SETS=[
 ['values','value','labels'],['scores','score','players'],['prices','price','products'],
 ['samples','sample','names'],['lengths','length','paths'],['durations','duration','tasks'],
 ['ratings','rating','reviews'],['weights','weight','packages'],['counts','count','groups'],['levels','level','stages']
];
export const CODE_VARIANTS=50;
function identifierNames(track,index){
 const [items,value,words]=CODE_NAME_SETS[index],snake=track==='python'||track==='c'||track==='cpp';
 const join=(a,b)=>snake?a+'_'+b:a+b[0].toUpperCase()+b.slice(1);
 const names={items,value,words};
 for(const role of ['result','index','limit','text','output','count','data','entry','key','record','found','low','high'])names[role]=join(value,role);
 names.count=join(items,'length');
 names.word=join(value,'label');
 for(const role of ['sum','average','select','within','find'])names[role]=join(role,items);
 for(const role of ['frequency','ranking','normalize','group'])names[role]=join(role,words);
 names.describe=join('describe',value);
 return names;
}
export function codeExercise(track,index=0,volume='short'){
 const item=CODE_TRACKS[track];if(!item)throw new Error('Неизвестный набор кода.');
 if(!CODE_VOLUMES[volume])throw new Error('Неизвестный объём кода.');
 if(!Number.isInteger(index))throw new Error('Неверный вариант кода.');
 const selected=((index%CODE_VARIANTS)+CODE_VARIANTS)%CODE_VARIANTS,template=Math.floor(selected/10),nameSet=selected%10;
 const source=CODE_TEMPLATES[track][template],names=identifierNames(track,nameSet);
 const text=source[volume].replace(/\{\{(\w+)\}\}/g,(_,role)=>{if(!names[role])throw new Error('Неизвестное имя: '+role);return names[role];});
 return{track,title:source.title,text,file:item.file,index:selected,template,nameSet,volume,...codeLines(text)};
}
const keywords=new Set('const let var function return if else for of in async await import export from type interface string number boolean public private class new and or not def True False None int void char float double unsigned signed size_t bool auto struct typedef sizeof while do switch case break continue static enum typename template include #include const; return; std::cout std::endl'.split(' '));
export function codeTokenType(token){
 if(keywords.has(token))return 'keyword';
 if(/["'`]/.test(token))return 'string';
 if(/^\d/.test(token))return 'number';
 if(/^[=<>!&|+*/?:;()[\]{}\\-]+$/.test(token))return 'operator';
 return 'plain';
}
