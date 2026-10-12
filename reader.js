/* Independent browser narration for The Biography of Safety. */
(()=>{
const init=()=>{
const article=document.querySelector('article');
if(!article)return;
const blocks=[...article.querySelectorAll('.movement h2,.movement p,.movement .document')].filter(el=>el.textContent.trim());
let at=0,running=false,paused=false,voice=null,utterance=null;
const key='biography-of-safety-reading-place-v1';
let saved=0;
try{const value=Number(localStorage.getItem(key));if(Number.isInteger(value)&&value>=0&&value<blocks.length)saved=value}catch{}
const style=document.createElement('style');
style.textContent=`
.listen-dock{position:fixed;z-index:1000;bottom:max(.9rem,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:min(96%,720px);background:#faf7f1f2;color:#28282a;border:1px solid #d8d1cb;border-radius:20px;box-shadow:0 9px 32px #2921212b;padding:.55rem .7rem;display:flex;align-items:center;flex-wrap:wrap;gap:.4rem;font:13px/1.3 Arial,sans-serif;backdrop-filter:blur(10px)}
.listen-dock button,.listen-dock select{font:inherit;border-radius:100px;border:1px solid #d8d1cb;padding:.58rem .76rem;background:transparent;color:inherit;cursor:pointer}
.listen-dock button.primary{background:#713c46;color:white;border-color:#713c46}.listen-dock button:focus-visible,.audio-passage:focus-visible{outline:3px solid #713c46;outline-offset:3px}
.listen-dock .listen-label{flex:1;min-width:115px;color:#6b6260;font-size:11px}.listen-dock select{max-width:130px}
.audio-passage{cursor:pointer;scroll-margin-top:2rem}.audio-passage:hover{background:#713c4609}.audio-passage.speaking{background:#713c461b;box-shadow:0 0 0 .35rem #713c461b;border-radius:3px}
body{padding-bottom:5rem}.reader-note{font:12px Arial,sans-serif;color:#746e6a;margin:0 auto 1.5rem;max-width:760px;padding:0 25px}
@media(max-width:520px){.listen-dock{gap:.25rem;padding:.5rem}.listen-dock button,.listen-dock select{padding:.55rem;font-size:11px}.listen-dock .listen-label{display:none}}
@media print{.listen-dock,.reader-note{display:none!important}body{padding-bottom:0}}
`;
document.head.appendChild(style);
const dock=document.createElement('div');dock.className='listen-dock';dock.setAttribute('role','region');dock.setAttribute('aria-label','Essay audio reader');
dock.innerHTML='<button class="primary" id="b-play" type="button">▶ Listen</button><button id="b-continue" type="button">↳ Continue</button><button id="b-stop" type="button">Stop</button><span class="listen-label" id="b-label" aria-live="polite">Tap a paragraph to listen from there</span><label for="b-rate" style="font-size:11px">Speed</label><select id="b-rate" aria-label="Narration speed"><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.35">1.35×</option></select><select id="b-voice" aria-label="Narration voice"><option value="">Auto voice</option></select>';
document.body.appendChild(dock);
const play=dock.querySelector('#b-play'),cont=dock.querySelector('#b-continue'),stop=dock.querySelector('#b-stop'),label=dock.querySelector('#b-label'),rate=dock.querySelector('#b-rate'),voiceSelect=dock.querySelector('#b-voice');
const supported='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
if(!supported){play.disabled=true;label.textContent='Audio unavailable in this browser';}
let voices=[];
function loadVoices(){if(!supported)return;voices=speechSynthesis.getVoices().filter(v=>/^en([-_]|$)/i.test(v.lang));const prior=voiceSelect.value;voiceSelect.innerHTML='<option value="">Auto voice</option>';voices.forEach((v,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=v.name+' ('+v.lang+')';voiceSelect.appendChild(o)});if(prior&&[...voiceSelect.options].some(o=>o.value===prior))voiceSelect.value=prior;else{const pk=voices.findIndex(v=>/^en[-_]PK$/i.test(v.lang));if(pk>=0)voiceSelect.value=String(pk)}}
if(supported){loadVoices();speechSynthesis.addEventListener?.('voiceschanged',loadVoices);}
blocks.forEach((el,i)=>{el.classList.add('audio-passage');el.tabIndex=0;el.title='Listen from this passage';const begin=()=>start(i);el.addEventListener('click',e=>{if(e.target.closest('a,button'))return;const selection=window.getSelection();if(selection&&!selection.isCollapsed)return;begin()});el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();begin()}})});
function remember(i){try{localStorage.setItem(key,String(i))}catch{}}
function clear(){blocks.forEach(el=>el.classList.remove('speaking'))}
function stopAudio(){if(supported)speechSynthesis.cancel();running=false;paused=false;clear();play.textContent='▶ Listen'}
function speak(){if(!running)return;if(at>=blocks.length){stopAudio();return}clear();const el=blocks[at];el.classList.add('speaking');remember(at);label.textContent='Listening · '+(at+1)+' / '+blocks.length;el.scrollIntoView({behavior:'smooth',block:'center'});utterance=new SpeechSynthesisUtterance(el.textContent.replace(/\s+/g,' ').trim());utterance.rate=Number(rate.value);if(voiceSelect.value!=='')utterance.voice=voices[Number(voiceSelect.value)]||null;utterance.onend=()=>{if(running){at++;speak()}};utterance.onerror=e=>{if(running&&e.error!=='canceled'&&e.error!=='interrupted'){at++;speak()}};speechSynthesis.speak(utterance)}
function start(i){if(!supported)return;stopAudio();at=Math.max(0,Math.min(blocks.length-1,i));running=true;play.textContent='Ⅱ Pause';speak()}
play.addEventListener('click',()=>{if(!running){start(at||saved);return}if(paused){speechSynthesis.resume();paused=false;play.textContent='Ⅱ Pause'}else{speechSynthesis.pause();paused=true;play.textContent='▶ Resume'}});
cont.addEventListener('click',()=>{let i=saved;try{i=Number(localStorage.getItem(key))||0}catch{}if(supported)start(i);else blocks[i]?.scrollIntoView({behavior:'smooth',block:'center'})});
stop.addEventListener('click',stopAudio);
rate.addEventListener('change',()=>{if(running)start(at)});
voiceSelect.addEventListener('change',()=>{if(running)start(at)});
window.addEventListener('pagehide',stopAudio);
const note=document.createElement('p');note.className='reader-note';note.textContent='Listening uses the voices installed in your browser. The essay and documentary appendix remain unchanged in the source repository.';
document.querySelector('.hero')?.appendChild(note);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();