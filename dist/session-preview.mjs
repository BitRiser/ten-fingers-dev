// The preview owns its timeout. Replacing a session or leaving the page cancels
// it before it can focus a different exercise. Preview time is never typing time.
export function createSessionPreview({delay=2000,setTimer=setTimeout,clearTimer=clearTimeout,onShow=()=>{},onHide=()=>{},onReady=()=>{}}={}){
 let owner=null,ready=false,timer=null;
 function cancel(){if(timer!==null)clearTimer(timer);timer=null;onHide();}
 return {
  reset(next){cancel();owner=next;ready=false;},
  cancel,
  get pending(){return timer!==null;},
  get ready(){return ready;},
  start(next){
   if(next!==owner||timer!==null)return;
   if(ready){onReady(next);return;}
   onShow(next);
   timer=setTimer(()=>{timer=null;if(next!==owner)return;ready=true;onHide();onReady(next);},delay);
  }
 };
}
