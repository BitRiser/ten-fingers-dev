import {WordView} from './word-view.mjs';

// Code is paged at source-line boundaries. Spaces never reflow the reference.
export class CodeView extends WordView{
 constructor(root,session,{lines,onLayout}={}){
  super(root,session,{syntax:true,onLayout});this.lines=lines;
  root.classList.add('code-lines');
 }
 buildPage(start){
  const first=Math.max(0,this.lines.findIndex(line=>line.end>start));
  const pageLines=this.lines.slice(first,first+(this.root.clientWidth<520?5:8));
  const nodes=new Map(),fragment=document.createDocumentFragment();
  for(const line of pageLines){
   const row=document.createElement('div');row.className='code-source-line';row.dataset.line=line.number;
   const number=document.createElement('span');number.className='code-line-number';number.textContent=String(line.number).padStart(2,'0');row.append(number);
   const body=document.createElement('span');body.className='code-line-body';body.style.setProperty('--indent',line.indent);
   for(let i=line.start;i<line.end;i++){if(i>line.start)body.append(document.createTextNode(' '));const item=this.createWord(i);nodes.set(i,item);body.append(item.node);}
   if(line.start===line.end)body.append(document.createTextNode('\u00a0'));
   row.append(body);fragment.append(row);
  }
  this.root.replaceChildren(fragment);this.root.style.height='auto';
  const page={start:pageLines[0].start,end:pageLines.at(-1).end};this.nodes=nodes;this.page=page;return page;
 }
 update(settings){
  super.update(settings);
  for(const row of this.root.children){const line=this.lines[Number(row.dataset.line)-1];row.classList.toggle('active-code-line',this.session.word>=line.start&&this.session.word<line.end);}
 }
}
