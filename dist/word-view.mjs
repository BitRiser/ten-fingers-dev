// A page keeps the same nodes and geometry until its final word is finished.
// Typing changes colour and the caret, never the width of the reference text.
export class WordView{
 constructor(root,session,{rows=3,onLayout=()=>{}}={}){
  this.root=root;this.session=session;this.rows=rows;this.onLayout=onLayout;this.pages=[];this.page=null;this.nodes=new Map();this.width=root.clientWidth;this.font='';
  this.observer=new ResizeObserver(()=>{if(!root.isConnected)return;const width=root.clientWidth;if(width!==this.width){this.width=width;this.invalidate();onLayout();}});
  this.observer.observe(root);document.fonts?.ready.then(()=>{if(root.isConnected){this.invalidate();onLayout();}});
 }
 destroy(){this.observer.disconnect();}
 invalidate(){this.pages=[];this.page=null;this.nodes.clear();}
 createWord(index){
  const node=document.createElement('span');node.className='word';node.dataset.word=index;
  for(const letter of this.session.words[index]){const char=document.createElement('span');char.className='char';char.textContent=letter;node.append(char);}
  const extra=document.createElement('span');extra.className='word-extras';extra.setAttribute('aria-hidden','true');node.append(extra);
  return {node,chars:[...node.querySelectorAll('.char')],extra,value:null,active:null};
 }
 buildPage(start){
  const nodes=new Map(),fragment=document.createDocumentFragment();
  // Bounded measuring window: even a four-hour test mounts at most 80 words.
  for(let i=start;i<Math.min(this.session.words.length,start+80);i++){const item=this.createWord(i);nodes.set(i,item);fragment.append(item.node);}
  this.root.replaceChildren(fragment);this.root.scrollTop=0;this.root.scrollLeft=0;
  const lineHeight=parseFloat(getComputedStyle(this.root).lineHeight),first=nodes.get(start).node.offsetTop;
  let end=start;
  for(const [index,{node}] of nodes){if(index>start&&node.offsetTop-first>=lineHeight*this.rows-1)break;end=index+1;}
  const page={start,end};
  for(const [index,item] of nodes){if(index>=end){item.node.remove();nodes.delete(index);}}
  const last=nodes.get(end-1).node;this.root.style.height=Math.max(lineHeight*this.rows,last.offsetTop-first+last.offsetHeight)+'px';this.nodes=nodes;this.page=page;
  return page;
 }
 showCurrentPage(){
  const current=this.session.word;if(this.page&&current>=this.page.start&&current<this.page.end)return;
  const known=this.pages.find(p=>current>=p.start&&current<p.end);
  if(known){this.buildPage(known.start);return;}
  let start=this.pages.at(-1)?.end||0;
  while(start<=current){const page=this.buildPage(start);this.pages.push(page);if(current<page.end)return;start=page.end;}
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
   // Additional input is a small badge outside text flow, so it cannot rewrap a row.
   const extra=value.slice(this.session.words[index].length);item.extra.textContent=extra&&!settings.hideExtra?'+'+extra:'';
   item.value=value;item.active=active;item.done=done;item.hideExtra=settings.hideExtra;
  }
 }
 caretRect(){
  const item=this.nodes.get(this.session.word);if(!item)return null;
  const count=this.session.current.length,index=Math.min(count,item.chars.length-1),rect=item.chars[index]?.getBoundingClientRect();
  if(!rect)return null;
  return {left:count>=item.chars.length?rect.right:rect.left,top:rect.top,width:rect.width,height:rect.height};
 }
}
