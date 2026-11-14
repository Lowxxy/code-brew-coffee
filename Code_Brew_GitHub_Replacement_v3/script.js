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
  // Monitor-style ECG: the bright trace is progressively drawn in place.
  // The screen no longer scrolls a pre-drawn zigzag sideways.
  const ecgPath = document.querySelector('#codebrew-ecg-trace');
  const ecgHead = document.querySelector('#codebrew-ecg-head');
  if (ecgPath && ecgHead) {
    const pathLength = ecgPath.getTotalLength();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
      ecgPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
      ecgPath.style.strokeDashoffset = String(pathLength);
      const duration = 6000;
      let started;
      function drawMonitorFrame(time) {
        if (started === undefined) started = time;
        const progress = ((time - started) % duration) / duration;
        const lengthDrawn = progress * pathLength;
        ecgPath.style.strokeDashoffset = String(pathLength - lengthDrawn);
        const point = ecgPath.getPointAtLength(lengthDrawn);
        ecgHead.setAttribute('cx', point.x.toFixed(2));
        ecgHead.setAttribute('cy', point.y.toFixed(2));
        requestAnimationFrame(drawMonitorFrame);
      }
      requestAnimationFrame(drawMonitorFrame);
    }
  }
  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
