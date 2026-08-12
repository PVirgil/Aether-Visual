(() => {
  const root=document.documentElement,cursor=document.querySelector('.cursor'),ring=document.querySelector('.cursor-ring'),counter=document.getElementById('sceneCounter');
  const reveals=[...document.querySelectorAll('.reveal')],scenes=[...document.querySelectorAll('[data-scene]')],interactive=[...document.querySelectorAll('.interactive')];
  let cx=innerWidth/2,cy=innerHeight/2,rx=cx,ry=cy;
  addEventListener('pointermove',e=>{cx=e.clientX;cy=e.clientY;if(cursor){cursor.style.left=cx+'px';cursor.style.top=cy+'px'}},{passive:true});
  (function loop(){rx+=(cx-rx)*.14;ry+=(cy-ry)*.14;if(ring){ring.style.left=rx+'px';ring.style.top=ry+'px'}requestAnimationFrame(loop)})();
  interactive.forEach(el=>{
    el.addEventListener('pointerenter',()=>ring&&ring.classList.add('big'));
    el.addEventListener('pointerleave',()=>{if(ring)ring.classList.remove('big');el.style.transform='';const art=el.querySelector('.portal-art');if(art)art.style.transform=''});
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(1100px) rotateX(${(-ny*4.4).toFixed(2)}deg) rotateY(${(nx*5.3).toFixed(2)}deg) translateY(-4px)`;
      const art=el.querySelector('.portal-art');if(art)art.style.transform=`translate3d(${nx*13}px,${ny*13}px,18px) scale(1.025)`;
      const orb=el.querySelector('.orb');if(orb)orb.style.translate=`${nx*22}px ${ny*22}px`;
    });
  });
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.13});reveals.forEach(el=>io.observe(el));
  function onScroll(){
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),pct=scrollY/max*100;root.style.setProperty('--scroll',pct.toFixed(3));
    let current=1;for(const s of scenes){if(s.getBoundingClientRect().top<innerHeight*.55)current=Number(s.dataset.scene)||current}
    if(counter)counter.textContent=`${String(current).padStart(2,'0')} / ${String(scenes.length).padStart(2,'0')}`;
    const hero=document.querySelector('.hero-inner');if(hero){hero.style.transform=`translate3d(0,${Math.min(scrollY*.12,90)}px,0)`;hero.style.opacity=Math.max(0,1-scrollY/820)}
    document.querySelectorAll('.ribbon').forEach((r,i)=>r.style.translate=((scrollY*.035)*(i?1:-1))+'px 0');
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();
})();
