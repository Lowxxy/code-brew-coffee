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
  // Real-time monitor: an EKG waveform emerges as the scanner passes,
  // with a bright leading spark and fading phosphor glow. No sideways SVG scrolling.
  const ecgCanvas = document.querySelector('#codebrew-live-ecg');
  if (ecgCanvas) {
    const ctx = ecgCanvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, ratio = 1, start = null;
    function resizeMonitor() {
      const rect = ecgCanvas.getBoundingClientRect();
      w = Math.max(1, rect.width); h = Math.max(1, rect.height);
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      ecgCanvas.width = Math.round(w * ratio);
      ecgCanvas.height = Math.round(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    // Smooth P-QRS-T ECG morphology at each beat. Height is relative to canvas size.
    function signal(x) {
      const spacing = Math.max(235, Math.min(w * .32, 410));
      let t = ((x - 85) % spacing + spacing) % spacing;
      const p = Math.exp(-Math.pow((t - 40) / 14, 2)) * -0.11;
      const q = Math.exp(-Math.pow((t - 87) / 8, 2)) * 0.18;
      const r = Math.exp(-Math.pow((t - 107) / 7, 2)) * -0.95;
      const s = Math.exp(-Math.pow((t - 129) / 10, 2)) * 0.34;
      const twave = Math.exp(-Math.pow((t - 188) / 27, 2)) * -0.16;
      return h * .51 + (p + q + r + s + twave) * (h * .35);
    }
    function traceTo(end) {
      ctx.beginPath();
      const step = 2;
      for (let x = 0; x <= end; x += step) {
        const y = signal(x);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(end, signal(end));
    }
    function renderMonitor(t) {
      if (start === null) start = t;
      ctx.clearRect(0, 0, w, h);
      const duration = 6800;
      const progress = reduceMotion ? 1 : ((t - start) % duration) / duration;
      const head = progress * w;
      const baseline = h * .51;
      // Faint monitor baseline extending to the future, like a live hospital display.
      ctx.strokeStyle = 'rgba(0,100,220,.16)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(0, baseline); ctx.lineTo(w, baseline); ctx.stroke();
      ctx.save();
      ctx.shadowColor = 'rgba(0,115,255,.7)'; ctx.shadowBlur = 11;
      ctx.strokeStyle = '#075cea'; ctx.lineWidth = 5;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      traceTo(head); ctx.stroke();
      ctx.restore();
      // Extra bright last segment gives a live travelling electrical pulse.
      if (!reduceMotion) {
        ctx.save(); ctx.beginPath(); ctx.rect(Math.max(0,head - 95), 0, 95, h); ctx.clip();
        ctx.shadowColor = '#20abff'; ctx.shadowBlur = 19;
        ctx.strokeStyle = '#38adff'; ctx.lineWidth = 5.5;
        traceTo(head); ctx.stroke(); ctx.restore();
        ctx.beginPath(); ctx.arc(head, signal(head), 5.2, 0, Math.PI * 2);
        ctx.fillStyle = '#e6faff'; ctx.shadowColor = '#0785ff'; ctx.shadowBlur = 20; ctx.fill();
        ctx.shadowBlur = 0;
        requestAnimationFrame(renderMonitor);
      }
    }
    resizeMonitor();
    window.addEventListener('resize', resizeMonitor, {passive:true});
    requestAnimationFrame(renderMonitor);
  }
  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
