
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  document.addEventListener('DOMContentLoaded', () => {
    initHeaderMenu();
    initMenuFilters();
    initFooterYear();
    initLiveECG();
  });

  function initHeaderMenu() {
    const toggle = $('.menu-toggle');
    const nav = $('#primary-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    $$('a', nav).forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });
  }

  function initMenuFilters() {
    const filters = $$('.filter');
    const groups = $$('.coffee-menu-group');
    if (!filters.length || !groups.length) return;

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.filter || 'all';
        filters.forEach(item => {
          const active = item === btn;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', String(active));
        });

        groups.forEach(group => {
          const show = target === 'all' || group.dataset.category === target;
          group.style.display = show ? '' : 'none';
        });
      });
    });
  }

  function initFooterYear() {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }

  function initLiveECG() {
    const canvas = document.getElementById('codebrew-live-ecg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const container = canvas.parentElement;

    let width = 0, height = 0, dpr = 1, head = 0, last = 0;
    let raf = null;
    const speed = 245;
    let history = [];
    let lastCycle = 0;

    function resize() {
      const box = container.getBoundingClientRect();
      width = Math.max(240, Math.round(box.width || window.innerWidth));
      height = Math.max(190, Math.round(box.height || 300));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      history = [];
      head = 0;
      last = performance.now();
    }

    // A repeating P-QRS-T beat, with a tall sharp R wave and a distinct S dip.
    // One beat per 270px means several clearly visible heartbeats per screen.
    const anchors = [
      [0.00,0], [0.10,0], [0.14,-0.6],
      [0.19,-9], [0.23,-12], [0.27,-7], [0.31,0],  // P wave
      [0.40,0], [0.445,5],                         // Q
      [0.478,-83],                                 // sharp R spike
      [0.504,33],                                  // deep S dip
      [0.544,0], [0.64,0],
      [0.71,-8], [0.76,-18], [0.80,-17], [0.86,-5], // T wave
      [0.92,0], [1,0]
    ];

    function valueAt(x) {
      const beatWidth = Math.max(215, Math.min(280, width / 3.5));
      const fraction = (((x + 52) % beatWidth) + beatWidth) % beatWidth / beatWidth;
      for (let i = 1; i < anchors.length; i++) {
        const a = anchors[i-1], b = anchors[i];
        if (fraction <= b[0]) {
          const t = (fraction-a[0])/(b[0]-a[0]);
          // Round the P/T humps lightly, preserve abrupt QRS spikes.
          const smooth = (i >= 3 && i <= 6) || (i >= 13 && i <= 17)
            ? t*t*(3-2*t) : t;
          const amplitude = Math.min(1.28, Math.max(0.75, height/320));
          return height * 0.51 + (a[1] + (b[1]-a[1])*smooth)*amplitude;
        }
      }
      return height*0.51;
    }

    function drawGrid() {
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = 'rgba(0,100,220,.045)';
      ctx.beginPath();
      for (let x=0; x<width; x+=44) {ctx.moveTo(x,0);ctx.lineTo(x,height);}
      for (let y=0; y<height; y+=44) {ctx.moveTo(0,y);ctx.lineTo(width,y);}
      ctx.stroke();
    }

    function draw(now) {
      const dt=Math.max(0,Math.min((now-last)/1000,0.05));
      last=now;
      head+=dt*speed;
      if (head>width+8) {
        head=0;
        history=[];
        lastCycle++;
      }
      ctx.clearRect(0,0,width,height);
      drawGrid();

      // A very faint guide remains in front of the scanning point;
      // the actual pulse appears only as the glowing tip draws it.
      ctx.strokeStyle='rgba(0,80,200,.06)';
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(0,height*.51);
      ctx.lineTo(width,height*.51);
      ctx.stroke();

      const visible=Math.max(0,Math.min(width,head));
      const step=2;
      if (visible>0) {
        const drawLine=(startX,endX,stroke,lineWidth,glow)=>{
          ctx.beginPath();
          ctx.moveTo(startX,valueAt(startX));
          for(let x=startX+step;x<endX;x+=step) ctx.lineTo(x,valueAt(x));
          ctx.lineTo(endX,valueAt(endX));
          ctx.strokeStyle=stroke;
          ctx.lineWidth=lineWidth;
          ctx.lineCap='round';
          ctx.lineJoin='round';
          ctx.shadowColor='rgba(0,96,255,.45)';
          ctx.shadowBlur=glow;
          ctx.stroke();
          ctx.shadowBlur=0;
        };
        // The existing trace glows softly. The final 110px are brighter.
        drawLine(0,visible,'#0866d7',4.2,7);
        drawLine(Math.max(0,visible-110),visible,'#1888ff',5,12);
        const y=valueAt(visible);
        const halo=ctx.createRadialGradient(visible,y,0,visible,y,18);
        halo.addColorStop(0,'rgba(255,255,255,1)');
        halo.addColorStop(.28,'rgba(74,173,255,.85)');
        halo.addColorStop(1,'rgba(74,173,255,0)');
        ctx.fillStyle=halo;
        ctx.beginPath();ctx.arc(visible,y,18,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#e4f5ff';
        ctx.beginPath();ctx.arc(visible,y,3.4,0,Math.PI*2);ctx.fill();
      }
      raf=requestAnimationFrame(draw);
    }

    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(container);
    else window.addEventListener('resize',resize);
    raf=requestAnimationFrame(draw);
    document.addEventListener('visibilitychange',()=>{
      if (document.hidden) {cancelAnimationFrame(raf);raf=null;}
      else if (!raf) {last=performance.now();raf=requestAnimationFrame(draw);}
    });
  }
})();
