import {codeTokenType} from './code-content.mjs';
// Reference nodes stay fixed within each line. Only crossing a visual line
// scrolls the bounded strip, keeping the active line at the same eye level.
export class WordView{
 constructor(root,session,{rows=3,syntax=false,onLayout=()=>{}}={}){
  this.root=root;this.session=session;this.rows=rows;this.syntax=syntax;this.onLayout=onLayout;this.pages=[];this.page=null;this.nodes=new Map();this.width=root.clientWidth;this.font='';this.strip=null;
  this.observer=new ResizeObserver(()=>{if(!root.isConnected)return;const width=root.clientWidth;if(width!==this.width){this.width=width;this.invalidate();onLayout();}});
  this.observer.observe(root);document.fonts?.ready.then(()=>{if(root.isConnected){this.invalidate();onLayout();}});
 }
 destroy(){this.observer.disconnect();}
 invalidate(){this.pages=[];this.page=null;this.nodes.clear();}
 createWord(index){
  const node=document.createElement('span');node.className='word';node.dataset.word=index;
  if(this.syntax)node.classList.add('syntax-'+codeTokenType(this.session.words[index]));
  for(const letter of this.session.words[index]){const char=document.createElement('span');char.className='char';char.textContent=letter;node.append(char);}
  const extra=document.createElement('span');extra.className='word-extras';extra.setAttribute('aria-hidden','true');node.append(extra);
  return {node,chars:[...node.querySelectorAll('.char')],extra,value:null,active:null};
 }
 mount(fragment){this.strip=document.createElement('div');this.strip.className='reference-strip';this.strip.append(fragment);this.root.replaceChildren(this.strip);this.root.scrollTop=0;this.root.scrollLeft=0;}
 buildPage(start){
  const nodes=new Map(),fragment=document.createDocumentFragment(),limit=Math.min(this.session.words.length,start+80);
  for(let i=start;i<limit;i++){const item=this.createWord(i);nodes.set(i,item);fragment.append(item.node);}
  this.mount(fragment);
  const lineHeight=parseFloat(getComputedStyle(this.root).lineHeight),first=nodes.get(start).node.offsetTop;
  let end=start,lastRow=start,lastTop=first;
  for(const [index,{node}] of nodes){
   if(index>start&&node.offsetTop-first>=lineHeight*6-1)break;
   if(node.offsetTop!==lastTop){lastRow=index;lastTop=node.offsetTop;}end=index+1;
  }
  // Don't split a partially measured row when the 80-word bound was reached.
  if(end===limit&&limit<this.session.words.length&&lastRow>start)end=lastRow;
  for(const [index,item] of nodes){if(index>=end){item.node.remove();nodes.delete(index);}}
  const page={start,end};this.nodes=nodes;this.page=page;return page;
 }
 showCurrentPage(){
  const current=this.session.word;if(this.page&&current>=this.page.start&&current<this.page.end)return;
  const known=this.pages.find(p=>current>=p.start&&current<p.end);
  if(known){this.buildPage(known.start);return;}
  let start=this.pages.at(-1)?.end||0;
  while(start<=current){const page=this.buildPage(start);this.pages.push(page);if(current<page.end)return;start=page.end;}
 }
 anchorCurrentRow(){
  const lineHeight=parseFloat(getComputedStyle(this.root).lineHeight),active=document.body.classList.contains('session-active');
  const visibleRows=this.syntax?(active?3:6):(active?2:this.rows);
  this.root.style.height=lineHeight*visibleRows+'px';
  // Trailing space lets even the final line reach the top of the viewport.
  this.strip.style.paddingBottom=lineHeight*visibleRows+'px';
  const item=this.nodes.get(this.session.word),first=this.nodes.values().next().value;
  const char=item?.chars[Math.min(this.session.current.length,item.chars.length-1)];
  if(!char||!first)return;
  const origin=first.chars[0].getBoundingClientRect(),target=char.getBoundingClientRect();
  const offset=Math.max(0,Math.round(target.top-origin.top));
  if(Math.abs(this.root.scrollTop-offset)>.5)this.root.scrollTop=offset;
 }
 update(settings){
  const style=getComputedStyle(this.root),font=style.fontSize+':'+style.letterSpacing+':'+this.root.clientWidth;
  if(font!==this.font){this.font=font;this.invalidate();}
  this.showCurrentPage();
  for(const [index,item] of this.nodes){
   const value=this.session.values[index],active=index===this.session.word,done=index<this.session.word;
   if(item.value===value&&item.active===active&&item.done===done&&item.hideExtra===settings.hideExtra)continue;
   item.node.classList.toggle('bad-word',done&&value!==this.session.words[index]);
   item.chars.forEach((char,i)=>{const classes=['char'];if(i<value.length)classes.push(value[i]===this.session.words[index][i]?this.session.positions[index][i].error?'corrected':'correct':'incorrect');if(active&&i===value.length)classes.push('caret');const next=classes.join(' ');if(char.className!==next)char.className=next;});
   const extra=value.slice(this.session.words[index].length);item.extra.textContent=extra&&!settings.hideExtra?'+'+extra:'';
   item.value=value;item.active=active;item.done=done;item.hideExtra=settings.hideExtra;
  }
  this.anchorCurrentRow();
 }
 caretRect(){
  const item=this.nodes.get(this.session.word);if(!item)return null;
  const count=this.session.current.length,index=Math.min(count,item.chars.length-1),rect=item.chars[index]?.getBoundingClientRect();
  if(!rect)return null;
  return {left:count>=item.chars.length?rect.right:rect.left,top:rect.top,width:rect.width,height:rect.height};
 }
}
