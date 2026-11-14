
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
    const parent = canvas.parentElement;
    if (!ctx || !parent) return;

    const lineColor = '#1368ee';
    const glowColor = 'rgba(19, 104, 238, 0.18)';
    const dimColor = 'rgba(19, 104, 238, 0.22)';
    const headColor = '#8fd4ff';
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    let width = 0;
    let height = 0;
    let baseline = 0;
    let points = [];
    let headX = 0;
    let sweepSpeed = 170; // px / second
    let previousTime = performance.now();
    let animationId = null;
    let sweepCycle = 0;

    function resize() {
      const rect = parent.getBoundingClientRect();
      width = Math.max(320, Math.floor(rect.width));
      height = Math.max(170, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      baseline = height * 0.54;
      points = buildWavePoints(width, baseline, height);
      headX = -40;
      sweepCycle = 0;
    }

    function buildWavePoints(totalWidth, base, h) {
      // One authentic-looking ECG sweep: quiet baseline -> P -> QRS -> T -> baseline
      const usable = Math.max(280, totalWidth * 0.9);
      const leftPad = (totalWidth - usable) / 2;
      const p = [];
      const push = (x, y) => p.push({ x: leftPad + x * usable, y: base + y });

      // Y values are offsets from baseline.
      push(0.00, 0);
      push(0.08, 0);
      push(0.12, -1);
      push(0.16, -6);
      push(0.19, -6);     // P wave peak
      push(0.22, -1);
      push(0.27, 0);
      push(0.35, 0);
      push(0.395, 0);
      push(0.415, 6);     // Q dip
      push(0.44, -52);    // R spike
      push(0.465, 20);    // S drop
      push(0.505, 0);
      push(0.57, 0);
      push(0.625, -12);
      push(0.69, -12);    // T wave
      push(0.755, -2);
      push(0.82, 0);
      push(1.00, 0);

      return p;
    }

    function interpolateY(x) {
      if (x <= points[0].x) return points[0].y;
      if (x >= points[points.length - 1].x) return points[points.length - 1].y;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        if (x <= b.x) {
          const t = (x - a.x) / (b.x - a.x || 1);
          return a.y + (b.y - a.y) * t;
        }
      }
      return baseline;
    }

    function pathUntil(limitX) {
      const clamped = Math.max(0, Math.min(limitX, width));
      const path = [];
      path.push({ x: 0, y: baseline });

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        if (pt.x < clamped) {
          path.push(pt);
        } else {
          const prev = path[path.length - 1] || points[Math.max(0, i - 1)];
          path.push({ x: clamped, y: interpolateY(clamped) });
          break;
        }
      }

      if (path[path.length - 1].x < clamped) {
        path.push({ x: clamped, y: interpolateY(clamped) });
      }
      return path;
    }

    function drawPolyline(poly, stroke, lineWidth, glow = false) {
      if (!poly.length) return;
      ctx.beginPath();
      ctx.moveTo(poly[0].x, poly[0].y);
      for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      if (glow) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 14;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function drawBackgroundGrid() {
      ctx.save();
      ctx.strokeStyle = 'rgba(19,104,238,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawFrame(now) {
      const dt = Math.min(0.032, (now - previousTime) / 1000);
      previousTime = now;
      headX += sweepSpeed * dt;

      // Reset only after head clears the right side; starts again from left like a real monitor sweep.
      if (headX > width + 32) {
        headX = -40;
        sweepCycle += 1;
      }

      ctx.clearRect(0, 0, width, height);
      drawBackgroundGrid();

      // Dim baseline ahead of the sweep so it feels like the monitor is ready, but not fully drawn.
      ctx.beginPath();
      ctx.moveTo(0, baseline);
      ctx.lineTo(width, baseline);
      ctx.strokeStyle = 'rgba(19,104,238,0.08)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const visiblePath = pathUntil(headX);
      drawPolyline(visiblePath, lineColor, 4, true);

      // Trailing fade to make it feel like it's actively being drawn.
      const trailStart = Math.max(0, headX - 180);
      const trailPath = pathUntil(headX).filter(pt => pt.x >= trailStart);
      if (trailPath.length) {
        drawPolyline(trailPath, '#2f86ff', 4.5, true);
      }

      // Sweep head / bright dot.
      if (headX >= 0 && headX <= width) {
        const headY = interpolateY(headX);
        const grad = ctx.createRadialGradient(headX, headY, 0, headX, headY, 20);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.2, headColor);
        grad.addColorStop(1, 'rgba(143,212,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(headX, headY, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#d8f2ff';
        ctx.beginPath();
        ctx.arc(headX, headY, 3.8, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(drawFrame);
    }

    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => resize())
      : null;

    resize();
    if (ro) ro.observe(parent);
    else window.addEventListener('resize', resize);
    animationId = requestAnimationFrame(drawFrame);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animationId) cancelAnimationFrame(animationId);
        animationId = null;
      } else if (!animationId) {
        previousTime = performance.now();
        animationId = requestAnimationFrame(drawFrame);
      }
    });
  }
})();
