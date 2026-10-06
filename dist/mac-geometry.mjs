// MacBook Air M1, US ANSI. Rendering and finger targets share one geometry.
export const KEY_UNIT=50,KEY_GAP=5,KEY_HEIGHT=44;
export const ROW_Y={number:46,top:96,home:146,bottom:196,modifiers:246};
const box=(unit,y,width=1,height=KEY_HEIGHT)=>({x:5+unit*KEY_UNIT,y,width:width*KEY_UNIT-KEY_GAP,height});
export function keyBox(row,col){
 if(row===-1)return box(col,ROW_Y.number);
 if(row===0)return box(1.5+col,ROW_Y.top);
 if(row===1)return box(1.75+col,ROW_Y.home);
 if(row===2)return box(2.25+col,ROW_Y.bottom);
 if(row===3)return box(4.25,ROW_Y.modifiers,5.75);
 if(row===4)return col===0?box(0,ROW_Y.bottom,2.25):box(12.25,ROW_Y.bottom,2.75);
 if(row===5)return box(13.5,ROW_Y.top,1.5);
 return null;
}
export const center=box=>[box.x+box.width/2,box.y+box.height/2];
export function modifierBoxes(){return[
 ['fn',box(0,ROW_Y.modifiers)],['control',box(1,ROW_Y.modifiers)],['option',box(2,ROW_Y.modifiers)],['command',box(3,ROW_Y.modifiers,1.25)],
 ['command',box(10,ROW_Y.modifiers,1.25)],['option',box(11.25,ROW_Y.modifiers)],
 ['left',box(12.25,ROW_Y.modifiers+24,11/12,20)],['up',box(12.25+11/12,ROW_Y.modifiers,11/12,20)],['down',box(12.25+11/12,ROW_Y.modifiers+24,11/12,20)],['right',box(12.25+22/12,ROW_Y.modifiers+24,11/12,20)]
 ];}
