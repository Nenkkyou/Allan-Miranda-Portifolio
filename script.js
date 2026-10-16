const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
document.documentElement.classList.add('js');
const nav=q('.nav'),progress=q('.nav__progress'),toggle=q('.nav__toggle'),links=q('.nav__links'),main=q('main');
const navLinks=qa('.nav__links a'),sections=qa('main>section');

// Navegação, foco e menu funcionam mesmo sem o CDN de animações.
const closeMenu=(restoreFocus=false)=>{toggle.classList.remove('open');links.classList.remove('open');document.body.classList.remove('menu-open');main.inert=false;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menu');if(restoreFocus)toggle.focus()};
toggle.addEventListener('click',()=>{if(toggle.classList.contains('open')){closeMenu(true);return}toggle.classList.add('open');links.classList.add('open');document.body.classList.add('menu-open');main.inert=true;toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Fechar menu');requestAnimationFrame(()=>{if(links.classList.contains('open'))navLinks[0].focus({preventScroll:true})})});
navLinks.forEach(a=>a.addEventListener('click',()=>closeMenu()));
q('.nav__brand').addEventListener('click',()=>closeMenu());
addEventListener('keydown',e=>{if(!toggle.classList.contains('open'))return;if(e.key==='Escape'){closeMenu(true);return}if(e.key==='Tab'){const first=toggle,last=navLinks.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
matchMedia('(max-width:820px)').addEventListener('change',()=>closeMenu());
const updateNavigation=()=>{nav.classList.toggle('is-scrolled',scrollY>30);const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max?Math.min(1,Math.max(0,scrollY/max)):0})`;const current=sections.filter(s=>s.getBoundingClientRect().top<=innerHeight*.38).at(-1);navLinks.forEach(a=>{if(a.hash===`#${current?.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})};
let scrollPending=false;
addEventListener('scroll',()=>{if(scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{updateNavigation();scrollPending=false})},{passive:true});
addEventListener('resize',updateNavigation);addEventListener('pageshow',updateNavigation);updateNavigation();

// Uma superfície de Möbius em contornos, projetada em 3D sem biblioteca gráfica.
function createSculpture(canvas){
 const ctx=canvas.getContext('2d'),state={angle:0,unfold:0,tiltX:0,tiltY:0,reveal:1};
 if(!ctx)return {state,render:()=>{}};
 let width=0,height=0,visible=true,last=0,curves=[];
 const resize=()=>{
  const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
  const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  const count=width>500?72:48,samples=width>500?132:100;curves=[];
  for(let i=0;i<count;i++){
   const v=i/(count-1)*2-1,curve=[];
   for(let j=0;j<=samples;j++){
    const u=j/samples*Math.PI*2,r=1.28+.16*Math.cos(u*3)+v*.52*Math.cos(u*.5);
    curve.push({x:r*Math.cos(u)*1.06,y:r*Math.sin(u),z:v*.7*Math.sin(u*.5)+.18*Math.sin(u*2),u,v});
   }
   curves.push(curve);
  }
  render(0,true);
 };
 function render(time=0,force=false){
  if(!force&&(!visible||document.hidden||time-last<1/30))return;last=time;
  ctx.clearRect(0,0,width,height);
  const paths=Array.from({length:7},()=>new Path2D()),accent=new Path2D();
  const ax=.98+state.tiltY,ay=-.5+state.angle+state.tiltX,az=-.4+state.tiltX*.2;
  const cx=Math.cos(ax),sx=Math.sin(ax),cy=Math.cos(ay),sy=Math.sin(ay),cz=Math.cos(az),sz=Math.sin(az);
  const scale=Math.min(width,height)*.245,spread=state.unfold;
  curves.forEach((curve,i)=>{
   let prev;
   curve.forEach(p=>{
    const waveX=(p.u/Math.PI-1)*1.85,waveY=Math.sin(p.u*1.3+state.angle)*.22+p.v*.6;
    const x=p.x+(waveX-p.x)*spread,y=p.y+(waveY-p.y)*spread,z=p.z*(1-spread);
    const y1=y*cx-z*sx,z1=y*sx+z*cx,x2=x*cy+z1*sy,z2=-x*sy+z1*cy;
    const x3=x2*cz-y1*sz,y3=x2*sz+y1*cz,perspective=4.8/(4.8-z2);
    const point={x:width*.5+x3*scale*perspective,y:height*.49+y3*scale*perspective,z:z2};
    if(prev){
     const bin=Math.max(0,Math.min(6,Math.floor(((point.z+prev.z)*.5+1.8)/3.6*7)));
     const path=i===Math.floor(curves.length*.52)?accent:paths[bin];path.moveTo(prev.x,prev.y);path.lineTo(point.x,point.y);
    }
    prev=point;
   });
  });
  ctx.lineCap='round';
  paths.forEach((path,i)=>{ctx.lineWidth=.65+i*.055;ctx.strokeStyle=`rgba(235,238,231,${[.06,.1,.17,.28,.43,.62,.85][i]*state.reveal})`;ctx.stroke(path)});
  ctx.lineWidth=1.05;ctx.strokeStyle=`rgba(19,169,200,${.85*state.reveal})`;ctx.stroke(accent);
 }
 new ResizeObserver(resize).observe(canvas);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting},{rootMargin:'80px'}).observe(canvas);
 resize();
 return {state,render};
}
const sculpture=createSculpture(q('.hero__canvas'));

if(window.gsap&&window.ScrollTrigger){
 gsap.registerPlugin(ScrollTrigger);
 const motion=gsap.matchMedia();
 motion.add('(prefers-reduced-motion:no-preference)',()=>{
  const loader=q('.loader'),counter={n:0};
  let intro;
  const safety=setTimeout(()=>{intro?.kill();loader.classList.remove('is-active');gsap.set('.hero__title .line>span,.hero__meta,.hero__intro,.hero__actions,.hero__scroll,.hero__index',{clearProps:'transform,opacity'})},2800);
  if(scrollY<40&&!location.hash&&performance.now()<2500){
   loader.classList.add('is-active');
   intro=gsap.timeline({onComplete:()=>{loader.classList.remove('is-active');clearTimeout(safety)}})
    .to(counter,{n:100,duration:.45,ease:'power2.inOut',onUpdate:()=>q('.loader__count').textContent=String(Math.round(counter.n)).padStart(2,'0')})
    .to('.loader__line span',{scaleX:1,duration:.45},0)
    .to(loader,{yPercent:-100,duration:.65,ease:'power4.inOut'})
    .from('.hero__title .line>span',{yPercent:145,rotate:4,transformOrigin:'0% 100%',stagger:.11,duration:1.15,ease:'power4.out'},'-=.3')
    .from(['.hero__meta','.hero__intro','.hero__actions','.hero__scroll','.hero__index'],{opacity:0,y:22,stagger:.06,duration:.7},'-=.7');
  }else clearTimeout(safety);

  // A escultura gira continuamente; o scroll abre a superfície em uma fita.
  gsap.to(sculpture.state,{angle:Math.PI*2,duration:42,repeat:-1,ease:'none'});
  gsap.to(sculpture.state,{unfold:1,ease:'power1.inOut',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.1}});
  gsap.to('.hero__sculpture',{yPercent:30,opacity:0,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
  const animateSculpture=time=>sculpture.render(time);gsap.ticker.add(animateSculpture);
  const tiltX=gsap.quickTo(sculpture.state,'tiltX',{duration:1.2,ease:'power3.out'}),tiltY=gsap.quickTo(sculpture.state,'tiltY',{duration:1.2,ease:'power3.out'});
  const move=e=>{if(e.pointerType==='touch')return;const r=q('.hero').getBoundingClientRect();tiltX((e.clientX/r.width-.5)*.5);tiltY((e.clientY/r.height-.5)*.4)},leave=()=>{tiltX(0);tiltY(0)};
  q('.hero').addEventListener('pointermove',move);q('.hero').addEventListener('pointerleave',leave);
  gsap.timeline({scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}})
   .to('.hero__title .line:nth-child(1)',{xPercent:-12,yPercent:-35,rotate:-3,opacity:0,ease:'power1.in'},0)
   .to('.hero__title .line:nth-child(2)',{xPercent:14,yPercent:-10,rotate:2,opacity:0,ease:'power1.in'},0)
   .to('.hero__title .line:nth-child(3)',{xPercent:-7,yPercent:20,rotate:-2,opacity:0,ease:'power1.in'},0);

  // As palavras conservam o itálico original e são preenchidas em sequência.
  qa('.reveal-text').forEach(p=>{
   if(!p.querySelector('.reveal-word')){
    const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(!word)return;if(/^\s+$/.test(word))fragment.append(document.createTextNode(word));else{const span=document.createElement('span');span.className='reveal-word';span.textContent=word;fragment.append(span)}});node.replaceWith(fragment)});
   }
   gsap.fromTo(p.querySelectorAll('.reveal-word'),{backgroundPosition:'100% 0'},{backgroundPosition:'0% 0',duration:1,stagger:.16,ease:'none',scrollTrigger:{trigger:p,start:'top 78%',end:'bottom 42%',scrub:.65}});
  });
  gsap.from('.manifesto__facts>div',{y:65,opacity:0,stagger:.12,duration:1,ease:'power3.out',scrollTrigger:{trigger:'.manifesto__facts',start:'top 88%',toggleActions:'play none none reverse'}});
  gsap.from('.work__head h2',{y:120,rotate:3,opacity:0,duration:1.2,ease:'power4.out',scrollTrigger:{trigger:'.work__head',start:'top 72%',toggleActions:'play none none reverse'}});
  gsap.from('.portrait__mask',{clipPath:'inset(46% 0 46% 0)',duration:1.5,ease:'power4.inOut',scrollTrigger:{trigger:'.about__portrait',start:'top 78%',toggleActions:'play none none reverse'}});
  gsap.to('.portrait__mask img',{yPercent:-8,ease:'none',scrollTrigger:{trigger:'.about__portrait',start:'top bottom',end:'bottom top',scrub:1}});
  gsap.from('.portrait__type span',{yPercent:95,opacity:0,stagger:.12,duration:1.1,ease:'power4.out',scrollTrigger:{trigger:'.portrait__type',start:'top 93%',toggleActions:'play none none reverse'}});
  gsap.from('.about__copy>*',{y:50,opacity:0,stagger:.1,duration:.9,ease:'power3.out',scrollTrigger:{trigger:'.about__copy',start:'top 82%',toggleActions:'play none none reverse'}});
  gsap.from('.contact h2',{y:95,rotate:2,opacity:0,duration:1.2,ease:'power4.out',scrollTrigger:{trigger:'.contact h2',start:'top 87%',toggleActions:'play none none reverse'}});
  gsap.from('.contact__bottom>*',{y:40,opacity:0,stagger:.15,duration:.8,scrollTrigger:{trigger:'.contact__bottom',start:'top 90%',toggleActions:'play none none reverse'}});
  return()=>{clearTimeout(safety);loader.classList.remove('is-active');gsap.ticker.remove(animateSculpture);q('.hero').removeEventListener('pointermove',move);q('.hero').removeEventListener('pointerleave',leave);sculpture.render(0,true)};
 });
 motion.add('(min-height:661px) and (prefers-reduced-motion:no-preference)',()=>{
  qa('.project').forEach(project=>{
   const img=project.querySelector('img'),halo=project.querySelector('.project__halo'),copy=project.querySelector('.project__copy'),word=project.querySelector('.project__word');
   // O centro da cena reserva tempo de leitura entre a abertura e a saída.
   gsap.timeline({scrollTrigger:{trigger:project,start:'top top',end:'bottom bottom',scrub:.85}})
    .fromTo(img,{scale:.48,rotate:-14,clipPath:'circle(8% at 50% 50%)'},{scale:1,rotate:0,clipPath:'circle(50% at 50% 50%)',duration:.28,ease:'power2.out'},0)
    .fromTo(halo,{scale:.45,opacity:0},{scale:1,opacity:1,duration:.32,ease:'power2.out'},0)
    .fromTo(copy.children,{y:75,opacity:0},{y:0,opacity:1,duration:.18,stagger:.035,ease:'power2.out'},.06)
    .to(img,{scale:1.36,rotate:8,opacity:.14,filter:'blur(9px)',duration:.22,ease:'power1.in'},.78)
    .to(copy,{y:-65,opacity:0,duration:.18,ease:'power1.in'},.82)
    .fromTo(word,{xPercent:5,opacity:.035},{xPercent:-20,opacity:.17,duration:.4,ease:'none'},.6);
  });
 });
 motion.add('(prefers-reduced-motion:no-preference)',()=>{
  qa('.project').forEach(project=>{
   gsap.to(project.querySelector('.orbit--one'),{rotate:360,duration:24,repeat:-1,ease:'none'});
   gsap.to(project.querySelector('.orbit--two'),{rotate:-180,duration:32,repeat:-1,ease:'none'});
  });
 });
 motion.add('(min-width:821px) and (pointer:fine) and (prefers-reduced-motion:no-preference)',()=>{
  const cursor=q('.cursor'),cleanup=[];document.body.classList.add('has-cursor');
  const on=(el,event,fn)=>{el.addEventListener(event,fn);cleanup.push(()=>el.removeEventListener(event,fn))};
  const x=gsap.quickTo(cursor,'x',{duration:.18}),y=gsap.quickTo(cursor,'y',{duration:.18});
  on(window,'pointermove',e=>{x(e.clientX);y(e.clientY);gsap.set(cursor,{opacity:1})});
  on(document.documentElement,'pointerleave',()=>gsap.set(cursor,{opacity:0}));
  qa('a,button').forEach(el=>{on(el,'mouseenter',()=>gsap.to(cursor,{scale:1.5,duration:.2}));on(el,'mouseleave',()=>gsap.to(cursor,{scale:1,duration:.2}))});
  qa('.magnetic').forEach(el=>{on(el,'mousemove',e=>{const r=el.getBoundingClientRect();gsap.to(el,{x:(e.clientX-r.left-r.width/2)*.06,y:(e.clientY-r.top-r.height/2)*.06,duration:.3})});on(el,'mouseleave',()=>gsap.to(el,{x:0,y:0,duration:.4,ease:'power3.out'}))});
  return()=>{cleanup.forEach(fn=>fn());document.body.classList.remove('has-cursor')};
 });
 const refresh=()=>{ScrollTrigger.refresh();updateNavigation()};
 if(document.fonts)document.fonts.ready.then(refresh);
 addEventListener('load',refresh,{once:true});
 refresh();
}
