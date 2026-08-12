(() => {
  const canvas=document.getElementById('gl');
  if(!canvas)return;
  const gl=canvas.getContext('webgl',{antialias:false,alpha:false,powerPreference:'high-performance'});
  if(!gl)return;

  const vs=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const fs=`
  precision highp float;
  uniform vec2 r,m;
  uniform float t,s;

  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
  float noise(vec2 p){
    vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
               mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
  }
  float fbm(vec2 p){
    float v=0.,a=.5;
    mat2 rot=mat2(.8,.6,-.6,.8);
    for(int i=0;i<5;i++){v+=a*noise(p);p=rot*p*2.03+7.1;a*=.5;}
    return v;
  }
  vec3 pal(float x){
    vec3 a=vec3(.035,.03,.065),b=vec3(.24,.16,.42),c=vec3(.95,.63,.9),d=vec3(.0,.21,.34);
    return max(a+b*cos(6.28318*(c*x+d)),0.);
  }
  void main(){
    vec2 uv=(gl_FragCoord.xy*2.-r.xy)/min(r.x,r.y);
    vec2 mm=m*2.-1.; mm.x*=r.x/r.y;
    float tm=t*.07;
    vec2 q=uv+.045*vec2(sin(uv.y*2.4+tm*4.),cos(uv.x*2.-tm*3.2));
    float n=fbm(q*1.35+vec2(tm,-tm*.72));
    float n2=fbm(q*2.1-vec2(tm*.42,tm*.35));
    float d=length(q-mm*.22);
    float lens=exp(-d*d*2.7);
    float ang=atan(q.y,q.x),rad=length(q);
    float wave=.5+.5*sin(ang*4.-rad*7.+tm*7.+n*2.7);
    vec3 col=pal(n*.78+n2*.26+s*.003);
    col*=.47+.68*wave;
    col+=vec3(.28,.20,.55)*lens*.5;
    float halo=exp(-pow(abs(rad-.75),2.)*15.);
    col+=vec3(.08,.16,.32)*halo*(.25+.75*n);
    col*=smoothstep(1.55,.2,length(uv*.72));
    col*=.76;
    col+=(hash(gl_FragCoord.xy+fract(t)*123.)-.5)*.025;
    gl_FragColor=vec4(col,1.);
  }`;

  function compile(type,src){
    const sh=gl.createShader(type); gl.shaderSource(sh,src); gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(sh));return null;}
    return sh;
  }
  const v=compile(gl.VERTEX_SHADER,vs),f=compile(gl.FRAGMENT_SHADER,fs); if(!v||!f)return;
  const prog=gl.createProgram(); gl.attachShader(prog,v); gl.attachShader(prog,f); gl.linkProgram(prog); gl.useProgram(prog);

  const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(prog,'p'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);

  const uR=gl.getUniformLocation(prog,'r'),uM=gl.getUniformLocation(prog,'m'),uT=gl.getUniformLocation(prog,'t'),uS=gl.getUniformLocation(prog,'s');
  let w=1,h=1,dpr=1,mx=.5,my=.5,sx=.5,sy=.5,start=performance.now();

  function resize(){
    dpr=Math.min(devicePixelRatio||1,1.6); w=innerWidth;h=innerHeight;
    canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);gl.viewport(0,0,canvas.width,canvas.height);
  }
  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{mx=e.clientX/w;my=1-e.clientY/h},{passive:true});
  function frame(now){
    sx+=(mx-sx)*.045;sy+=(my-sy)*.045;
    const sc=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
    gl.uniform2f(uR,canvas.width,canvas.height);gl.uniform2f(uM,sx,sy);
    gl.uniform1f(uT,(now-start)/1000);gl.uniform1f(uS,sc*100);
    gl.drawArrays(gl.TRIANGLES,0,6);requestAnimationFrame(frame);
  }
  resize();requestAnimationFrame(frame);
})();
