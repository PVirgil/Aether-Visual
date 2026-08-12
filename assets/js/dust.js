(() => {
  const c=document.getElementById('dust');if(!c)return;
  const ctx=c.getContext('2d');let w=0,h=0,dpr=1,pts=[],mx=.5,my=.5,tx=.5,ty=.5;
  const COUNT=145;
  function build(){
    dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;
    c.width=w*dpr;c.height=h*dpr;c.style.width=w+'px';c.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
    pts=Array.from({length:COUNT},()=>({x:Math.random()*w,y:Math.random()*h,z:Math.random()*.95+.05,r:Math.random()*1.15+.15,a:Math.random()*.38+.06,vy:Math.random()*.17+.025,p:Math.random()*Math.PI*2}));
  }
  addEventListener('resize',build,{passive:true});
  addEventListener('pointermove',e=>{tx=e.clientX/w;ty=e.clientY/h},{passive:true});
  function frame(t){
    mx+=(tx-mx)*.025;my+=(ty-my)*.025;ctx.clearRect(0,0,w,h);
    const sc=scrollY*.018;
    for(const p of pts){
      p.y-=p.vy*(.45+p.z);if(p.y<-8){p.y=h+8;p.x=Math.random()*w}
      const x=p.x+(mx-.5)*38*p.z+Math.sin(t*.0004+p.p)*2.4;
      const y=p.y+(my-.5)*24*p.z-(sc*p.z)%h;
      const a=p.a*p.z*(.78+.22*Math.sin(t*.001+p.p));
      ctx.beginPath();ctx.arc(x,y,p.r*p.z,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${Math.max(0,a)})`;ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  build();requestAnimationFrame(frame);
})();
