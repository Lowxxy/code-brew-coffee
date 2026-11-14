(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('open', !expanded);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    }));
  }
  const filters = [...document.querySelectorAll('.filter')];
  const cards = [...document.querySelectorAll('.coffee-menu-group[data-category]')];
  filters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    cards.forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; });
  }));
  // LIVE ECG: draws each heartbeat as it occurs, not a pre-drawn zigzag sliding sideways.
  const canvas = document.getElementById('codebrew-live-ecg');
  if (canvas) {
    const c = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width=0, height=0, dpr=1, startTime=null;
    const rate = 1320; // 45-ish bpm: visibly distinct individual beats
    const beats = [
      [0,0],[0.08,0],[0.12,-0.08],[0.17,-0.08],[0.22,0],
      [0.32,0],[0.35,0.10],[0.39,-0.95],[0.425,0.33],[0.47,0],
      [0.57,0],[0.66,-0.14],[0.75,-0.16],[0.84,0],[1,0]
    ];
    function wave(phase){
      phase=((phase%1)+1)%1;
      for(let i=1;i<beats.length;i++){
        const a=beats[i-1], b=beats[i];
        if(phase<=b[0]){
          let t=(phase-a[0])/(b[0]-a[0]);
          // Rounded P and T waves, crisp QRS complex.
          if(i===2||i===3||i===11||i===12||i===13) t=t*t*(3-2*t);
          return a[1]+(b[1]-a[1])*t;
        }
      }
      return 0;
    }
    function resize(){
      const r=canvas.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);
      dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      c.setTransform(dpr,0,0,dpr,0,0);
    }
    function render(ms){
      if(startTime===null)startTime=ms;
      const elapsed=reduced?3100:ms-startTime;
      c.clearRect(0,0,width,height);
      const center=height*.54, amp=height*.36;
      // Shared flat monitored baseline; beats are generated from elapsed time.
      c.lineCap='round';c.lineJoin='round';
      c.strokeStyle='rgba(0,95,225,.17)';c.lineWidth=1.5;
      c.beginPath();c.moveTo(0,center);c.lineTo(width,center);c.stroke();
      const step=2;
      const head=reduced?width:Math.min(width, (elapsed*.105)% (width+180));
      const offset=elapsed/rate;
      const freq=3.45; // multiple beats visible on both sides of menu
      function y(x){return center+wave((x/width)*freq-offset)*amp;}
      // Traced history is drawn in cyan-blue; no moving pre-built SVG.
      c.beginPath();
      for(let x=0;x<=width;x+=step){
        const yy=y(x);
        if(x===0)c.moveTo(x,yy);else c.lineTo(x,yy);
      }
      c.lineTo(width,y(width));
      c.shadowColor='rgba(0,105,255,.55)';c.shadowBlur=13;
      c.strokeStyle='#075be5';c.lineWidth=5.5;c.stroke();c.shadowBlur=0;
      // Moving scan head highlights the actively generating electric impulse.
      if(!reduced){
        const x=head%width;
        c.save();c.beginPath();c.rect(Math.max(0,x-100),0,102,height);c.clip();
        c.beginPath();
        for(let xx=Math.max(0,x-100);xx<=x;xx+=2){
          if(xx===Math.max(0,x-100))c.moveTo(xx,y(xx));else c.lineTo(xx,y(xx));
        }
        c.shadowColor='#12aaff';c.shadowBlur=22;c.strokeStyle='#32baff';c.lineWidth=6;c.stroke();
        c.restore();
        c.beginPath();c.arc(x,y(x),5,0,Math.PI*2);
        c.fillStyle='#d9faff';c.shadowColor='#009bff';c.shadowBlur=17;c.fill();c.shadowBlur=0;
        requestAnimationFrame(render);
      }
    }
    resize();window.addEventListener('resize',resize,{passive:true});requestAnimationFrame(render);
  }
  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
