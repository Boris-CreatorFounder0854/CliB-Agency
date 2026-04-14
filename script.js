/* ============================================
   CliB Agency — Script
   ============================================ */

/* ---------- Always start at top on load ---------- */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

/* ---------- Intro splash ---------- */
const introReady = new Promise((resolve) => {
  const overlay = document.getElementById("introOverlay");
  if (!overlay) { resolve(); return; }

  document.body.classList.add("intro-active");

  const dismiss = () => {
    if (overlay.classList.contains("is-leaving")) return;
    overlay.classList.add("is-leaving");
    document.body.classList.remove("intro-active");
    document.body.classList.add("intro-done");
    setTimeout(() => overlay.remove(), 1100);
    resolve();
  };

  // Auto-dismiss after 1.1s, or early on interaction
  const timer = setTimeout(dismiss, 1100);
  const early = () => { clearTimeout(timer); dismiss(); };
  window.addEventListener("wheel", early, { once: true, passive: true });
  window.addEventListener("keydown", early, { once: true });
  overlay.addEventListener("click", early, { once: true });
});


const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll(".reveal");
const faqItems = document.querySelectorAll(".faq-item");
const filterChips = document.querySelectorAll(".filter-chip");
const thumbCards = document.querySelectorAll(".thumb-card");
const backgroundCanvas = document.querySelector(".background-grid");
const testimonialTracks = document.querySelectorAll(".testimonial-track");

/* ---------- Mobile menu ---------- */
menuToggle?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

/* ---------- Header scroll state ---------- */
let lastScroll = 0;
window.addEventListener("scroll", () => {
  lastScroll = window.scrollY;
}, { passive: true });

/* ---------- FAQ accordion ---------- */
faqItems.forEach((item) => {
  const button = item.querySelector(".faq-question");
  if (!button) return;

  const toggle = () => {
    const isOpen = item.classList.contains("is-open");
    faqItems.forEach((entry) => {
      entry.classList.remove("is-open");
      entry.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
    });
    if (!isOpen) {
      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
    }
  };

  button.addEventListener("click", toggle);
  button.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });
});

/* ---------- Gallery filter ---------- */
filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const category = chip.dataset.filter;
    filterChips.forEach((entry) => {
      entry.classList.remove("is-active");
      entry.setAttribute("aria-pressed", "false");
    });
    chip.classList.add("is-active");
    chip.setAttribute("aria-pressed", "true");
    thumbCards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.category === category);
    });
  });
});

/* ---------- Reveal on scroll (waits for intro to finish) ---------- */
introReady.then(() => {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
});

/* ---------- Testimonial marquee ---------- */
if (testimonialTracks.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const marqueeRows = Array.from(testimonialTracks).map((track) => {
    const row = track.closest(".testimonial-row");
    const isReverse = track.classList.contains("row-two");
    const baseSpeed = track.classList.contains("row-one")
      ? 0.028
      : track.classList.contains("row-two")
        ? 0.022
        : 0.025;

    return {
      row, track, isReverse, baseSpeed,
      currentSpeed: baseSpeed,
      targetSpeed: baseSpeed,
      offset: 0,
      loopWidth: Math.max(track.scrollWidth / 2, 1),
      hoverDepth: 0,
    };
  });

  const updateLoopWidths = () => {
    marqueeRows.forEach((item) => {
      item.loopWidth = Math.max(item.track.scrollWidth / 2, 1);
      item.offset = ((item.offset % item.loopWidth) + item.loopWidth) % item.loopWidth;
    });
  };

  const setRowHoverState = (item, delta) => {
    item.hoverDepth = Math.max(0, item.hoverDepth + delta);
    item.targetSpeed = item.hoverDepth > 0 ? item.baseSpeed * 0.06 : item.baseSpeed;
  };

  marqueeRows.forEach((item) => {
    item.row?.addEventListener("mouseenter", () => setRowHoverState(item, 1));
    item.row?.addEventListener("mouseleave", () => setRowHoverState(item, -1));
    item.track.querySelectorAll(".testimonial-marquee-card").forEach((card) => {
      card.addEventListener("mouseenter", () => setRowHoverState(item, 1));
      card.addEventListener("mouseleave", () => setRowHoverState(item, -1));
    });
  });

  let lastFrame = performance.now();

  const animateTestimonials = (timestamp) => {
    const delta = Math.min(timestamp - lastFrame, 40);
    lastFrame = timestamp;

    marqueeRows.forEach((item) => {
      item.currentSpeed += (item.targetSpeed - item.currentSpeed) * 0.06;
      item.offset += item.currentSpeed * delta;
      if (item.offset >= item.loopWidth) item.offset -= item.loopWidth;
      const tx = item.isReverse ? item.offset - item.loopWidth : -item.offset;
      item.track.style.transform = `translate3d(${tx}px, 0, 0)`;
    });

    window.requestAnimationFrame(animateTestimonials);
  };

  updateLoopWidths();
  window.requestAnimationFrame(animateTestimonials);
  window.addEventListener("resize", updateLoopWidths);
}

/* ---------- Channels marquee ---------- */
(() => {
  const track = document.querySelector(".channels-track");
  if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const row = track.closest(".channels-row");
  let loopWidth = Math.max(track.scrollWidth / 2, 1);
  let offset = 0;
  let speed = 0.025;
  let currentSpeed = speed;
  let targetSpeed = speed;
  let hoverDepth = 0;
  let lastFrame = performance.now();

  const updateWidth = () => {
    loopWidth = Math.max(track.scrollWidth / 2, 1);
    offset = ((offset % loopWidth) + loopWidth) % loopWidth;
  };

  const setHover = (delta) => {
    hoverDepth = Math.max(0, hoverDepth + delta);
    targetSpeed = hoverDepth > 0 ? speed * 0.06 : speed;
  };

  row?.addEventListener("mouseenter", () => setHover(1));
  row?.addEventListener("mouseleave", () => setHover(-1));
  track.querySelectorAll(".channel-card").forEach((card) => {
    card.addEventListener("mouseenter", () => setHover(1));
    card.addEventListener("mouseleave", () => setHover(-1));
  });

  const animate = (timestamp) => {
    const delta = Math.min(timestamp - lastFrame, 40);
    lastFrame = timestamp;
    currentSpeed += (targetSpeed - currentSpeed) * 0.06;
    offset += currentSpeed * delta;
    if (offset >= loopWidth) offset -= loopWidth;
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    requestAnimationFrame(animate);
  };

  updateWidth();
  requestAnimationFrame(animate);
  window.addEventListener("resize", updateWidth);
})();

/* ---------- Solution carousel ---------- */
(() => {
  const carousel = document.querySelector(".sol-carousel");
  if (!carousel) return;

  const leftBtn = document.querySelector(".sol-arrow--left");
  const rightBtn = document.querySelector(".sol-arrow--right");
  if (!leftBtn || !rightBtn) return;

  function getScrollAmount() {
    const card = carousel.querySelector(".sol-card");
    if (!card) return 300;
    return card.offsetWidth + 24;
  }

  leftBtn.addEventListener("click", () => {
    carousel.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
  });

  rightBtn.addEventListener("click", () => {
    carousel.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
  });
})();

/* ---------- Process — pinned scroll-driven storytelling ---------- */
(() => {
  const wrapper = document.querySelector(".ps-wrapper");
  if (!wrapper) return;

  const steps = wrapper.querySelectorAll(".ps-step");
  const visuals = wrapper.querySelectorAll(".ps-visual");
  const stepCount = steps.length;
  if (!stepCount) return;

  let currentStep = -1;

  function update() {
    const wrapperRect = wrapper.getBoundingClientRect();
    const wrapperH = wrapper.offsetHeight;
    const vh = window.innerHeight;

    // How far the wrapper top has scrolled past the viewport top
    // 0 = just entered, wrapperH - vh = fully scrolled through
    const scrolled = -wrapperRect.top;
    const maxScroll = wrapperH - vh;
    if (maxScroll <= 0) return;

    const progress = Math.max(0, Math.min(1, scrolled / maxScroll));

    // Each step owns an equal slice of the progress
    const segmentSize = 1 / stepCount;
    let activeIndex = Math.floor(progress / segmentSize);
    activeIndex = Math.max(0, Math.min(stepCount - 1, activeIndex));

    // Progress within the active step's segment (0→1)
    const stepProgress = Math.min(1,
      (progress - activeIndex * segmentSize) / segmentSize
    );

    // Update step states — only the current step is "active" (description open).
    // Previous steps collapse but keep a "completed" marker.
    steps.forEach((step, i) => {
      const fill = step.querySelector(".ps-progress-fill");
      step.classList.remove("active", "completed");
      if (i < activeIndex) {
        step.classList.add("completed");
        if (fill) fill.style.width = "100%";
      } else if (i === activeIndex) {
        step.classList.add("active");
        if (fill) fill.style.width = (stepProgress * 100) + "%";
      } else {
        if (fill) fill.style.width = "0%";
      }
    });

    // Crossfade visuals
    if (activeIndex !== currentStep) {
      visuals.forEach((v) => v.classList.remove("active"));
      if (visuals[activeIndex]) visuals[activeIndex].classList.add("active");
      currentStep = activeIndex;
    }
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
})();

/* ---------- Background grid canvas ---------- */
if (backgroundCanvas instanceof HTMLCanvasElement) {
  const context = backgroundCanvas.getContext("2d", { alpha: true });
  let animationFrame = 0;
  let gridSize = 72;
  let columns = 0;
  let rows = 0;
  let pulses = [];
  let lastTimestamp = 0;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  let gridCache = null;
  let gridCacheW = 0;
  let gridCacheH = 0;

  const pulseSpeed = 0.12;
  const pulseTrailLength = 6;
  const pulseThickness = 1.2;
  const pulseGlow = 14;
  const pulseTurnChance = 0.35;
  const minStraight = 3;

  const directions = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 },
  ];

  const beamStops = [
    { t: 0.00, r: 89,  g: 0,   b: 255, a: 0.0 },
    { t: 0.20, r: 89,  g: 0,   b: 255, a: 1.0 },
    { t: 0.50, r: 120, g: 99,  b: 255, a: 1.0 },
    { t: 1.00, r: 174, g: 72,  b: 255, a: 0.0 },
  ];

  const beamPasses = [
    { width: 3.5, alpha: 0.22 },
    { width: 1.0, alpha: 1.0 },
  ];

  const sampleBeam = (t, alphaMul = 1) => {
    const clamped = Math.min(1, Math.max(0, t));
    for (let i = 0; i < beamStops.length - 1; i++) {
      const a = beamStops[i];
      const b = beamStops[i + 1];
      if (clamped >= a.t && clamped <= b.t) {
        const k = (clamped - a.t) / (b.t - a.t || 1);
        const r = a.r + (b.r - a.r) * k;
        const g = a.g + (b.g - a.g) * k;
        const bl = a.b + (b.b - a.b) * k;
        const al = (a.a + (b.a - a.a) * k) * alphaMul;
        return `rgba(${r | 0}, ${g | 0}, ${bl | 0}, ${al})`;
      }
    }
    return "rgba(0, 0, 0, 0)";
  };

  const choosePerpendicular = (dir) => {
    if (dir.x !== 0) return Math.random() > 0.5 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    return Math.random() > 0.5 ? { x: 1, y: 0 } : { x: -1, y: 0 };
  };

  const isInsideGrid = (gx, gy) => gx >= 0 && gx <= columns && gy >= 0 && gy <= rows;

  const getNextDirection = (pulse) => {
    const straight = pulse.direction;
    const perp = choosePerpendicular(straight);
    const oppPerp = { x: -perp.x, y: -perp.y };
    const reverse = { x: -straight.x, y: -straight.y };

    const distFromHomeX = pulse.gridX - pulse.homeX;
    const distFromHomeY = pulse.gridY - pulse.homeY;
    if (Math.abs(distFromHomeX) > pulse.homeRadiusX) {
      const homeDir = { x: distFromHomeX > 0 ? -1 : 1, y: 0 };
      if (isInsideGrid(pulse.gridX + homeDir.x, pulse.gridY + homeDir.y)) {
        pulse.straightCount = 0;
        return homeDir;
      }
    }
    if (Math.abs(distFromHomeY) > pulse.homeRadiusY) {
      const homeDir = { x: 0, y: distFromHomeY > 0 ? -1 : 1 };
      if (isInsideGrid(pulse.gridX + homeDir.x, pulse.gridY + homeDir.y)) {
        pulse.straightCount = 0;
        return homeDir;
      }
    }

    const canTurn = pulse.straightCount >= minStraight;
    if (canTurn && Math.random() < pulse.turnChance) {
      const turnDir = Math.random() < 0.5 ? perp : oppPerp;
      if (isInsideGrid(pulse.gridX + turnDir.x, pulse.gridY + turnDir.y)) {
        pulse.straightCount = 0;
        return turnDir;
      }
    }

    if (isInsideGrid(pulse.gridX + straight.x, pulse.gridY + straight.y)) {
      pulse.straightCount += 1;
      return straight;
    }

    for (const c of [perp, oppPerp, reverse]) {
      if (isInsideGrid(pulse.gridX + c.x, pulse.gridY + c.y)) {
        pulse.straightCount = 0;
        return c;
      }
    }
    pulse.straightCount = 0;
    return reverse;
  };

  const createPulse = (index, total) => {
    const dir = directions[Math.floor(Math.random() * 4)];
    const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
    const rowsCount = Math.ceil(total / cols);
    const cellX = index % cols;
    const cellY = Math.floor(index / cols);
    const regionW = columns / cols;
    const regionH = rows / rowsCount;
    const homeX = Math.floor((cellX + 0.5) * regionW);
    const homeY = Math.floor((cellY + 0.5) * regionH);
    return {
      homeX,
      homeY,
      homeRadiusX: Math.max(2, Math.floor(regionW * 0.55)),
      homeRadiusY: Math.max(2, Math.floor(regionH * 0.55)),
      gridX: homeX + Math.floor((Math.random() - 0.5) * regionW * 0.6),
      gridY: homeY + Math.floor((Math.random() - 0.5) * regionH * 0.6),
      direction: dir,
      progress: Math.random(),
      speed: pulseSpeed,
      trail: [],
      maxTrail: pulseTrailLength,
      thickness: pulseThickness,
      glow: pulseGlow,
      color: "89, 0, 255",
      coreColor: "120, 99, 255",
      turnChance: pulseTurnChance,
      straightCount: 0,
    };
  };

  const statsSection = document.querySelector(".stats-strip");

  const computeGridHeight = () => {
    const fallback = Math.max(window.innerHeight + 400, 1400);
    if (!statsSection) return fallback;
    const rect = statsSection.getBoundingClientRect();
    const absoluteBottom = rect.bottom + window.scrollY;
    return Math.max(absoluteBottom + 200, fallback);
  };

  const resizeCanvas = () => {
    pixelRatio = 1;
    const w = window.innerWidth;
    const h = computeGridHeight();
    document.documentElement.style.setProperty("--bg-top-h", `${h}px`);
    backgroundCanvas.style.width = `${w}px`;
    backgroundCanvas.style.height = `${h}px`;
    backgroundCanvas.width = w;
    backgroundCanvas.height = h;
    if (context) context.setTransform(1, 0, 0, 1, 0, 0);
    gridSize = w < 640 ? 48 : w < 980 ? 60 : 72;
    columns = Math.ceil(w / gridSize);
    rows = Math.ceil(h / gridSize);
    const pulseCount = w < 640 ? 4 : w < 980 ? 5 : 6;
    pulses = Array.from({ length: pulseCount }, (_, i) => createPulse(i, pulseCount));
    buildGridCache(w, h);
  };

  const buildGridCache = (w, h) => {
    gridCacheW = w;
    gridCacheH = h;
    gridCache = document.createElement("canvas");
    gridCache.width = w;
    gridCache.height = h;
    const gctx = gridCache.getContext("2d");
    if (!gctx) return;
    gctx.strokeStyle = "rgba(120, 99, 255, 0.16)";
    gctx.lineWidth = 1;
    for (let x = 0; x <= w + gridSize; x += gridSize) {
      gctx.beginPath(); gctx.moveTo(x + 0.5, 0); gctx.lineTo(x + 0.5, h); gctx.stroke();
    }
    for (let y = 0; y <= h + gridSize; y += gridSize) {
      gctx.beginPath(); gctx.moveTo(0, y + 0.5); gctx.lineTo(w, y + 0.5); gctx.stroke();
    }
  };

  const gp = (gx, gy) => ({ x: gx * gridSize, y: gy * gridSize });

  const updatePulse = (pulse, delta) => {
    pulse.progress += pulse.speed * delta;
    while (pulse.progress >= 1) {
      const prev = gp(pulse.gridX, pulse.gridY);
      let dir = pulse.direction;
      if (!isInsideGrid(pulse.gridX + dir.x, pulse.gridY + dir.y)) dir = getNextDirection(pulse);
      pulse.gridX += dir.x;
      pulse.gridY += dir.y;
      const cur = gp(pulse.gridX, pulse.gridY);
      pulse.trail.unshift({ from: prev, to: cur });
      if (pulse.trail.length > pulse.maxTrail) pulse.trail.pop();
      pulse.direction = getNextDirection(pulse);
      pulse.progress -= 1;
    }
  };

  const drawPulse = (pulse) => {
    if (!context) return;
    const cur = gp(pulse.gridX, pulse.gridY);
    const next = gp(pulse.gridX + pulse.direction.x, pulse.gridY + pulse.direction.y);
    const head = {
      x: cur.x + (next.x - cur.x) * pulse.progress,
      y: cur.y + (next.y - cur.y) * pulse.progress,
    };
    const headLen = Math.hypot(head.x - cur.x, head.y - cur.y);
    const totalLen = headLen + pulse.trail.length * gridSize;
    if (totalLen < 0.5) return;

    // Segments ordered from head (t=1) toward tail (t=0).
    // fx/fy is the end closer to head, tx/ty closer to tail.
    const segs = [];
    segs.push({
      fx: head.x, fy: head.y,
      tx: cur.x,  ty: cur.y,
      tFrom: 1,
      tTo: 1 - headLen / totalLen,
    });
    let cumDist = headLen;
    for (let i = 0; i < pulse.trail.length; i++) {
      const s = pulse.trail[i];
      segs.push({
        fx: s.to.x, fy: s.to.y,
        tx: s.from.x, ty: s.from.y,
        tFrom: 1 - cumDist / totalLen,
        tTo: 1 - (cumDist + gridSize) / totalLen,
      });
      cumDist += gridSize;
    }

    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";

    for (let p = 0; p < beamPasses.length; p++) {
      const pass = beamPasses[p];
      context.lineWidth = pass.width;
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        const grad = context.createLinearGradient(seg.fx, seg.fy, seg.tx, seg.ty);
        grad.addColorStop(0, sampleBeam(seg.tFrom, pass.alpha));
        const span = seg.tFrom - seg.tTo;
        if (Math.abs(span) > 1e-4) {
          for (let b = 0; b < beamStops.length; b++) {
            const bs = beamStops[b];
            if (bs.t < seg.tTo || bs.t > seg.tFrom) continue;
            const k = (seg.tFrom - bs.t) / span;
            if (k > 0.0001 && k < 0.9999) {
              grad.addColorStop(
                k,
                `rgba(${bs.r | 0}, ${bs.g | 0}, ${bs.b | 0}, ${bs.a * pass.alpha})`
              );
            }
          }
        }
        grad.addColorStop(1, sampleBeam(seg.tTo, pass.alpha));
        context.strokeStyle = grad;
        context.beginPath();
        context.moveTo(seg.fx, seg.fy);
        context.lineTo(seg.tx, seg.ty);
        context.stroke();
      }
    }

    context.restore();
  };

  const render = (timestamp) => {
    if (!context) return;
    const w = backgroundCanvas.clientWidth;
    const h = backgroundCanvas.clientHeight;
    const delta = Math.min((timestamp - lastTimestamp) / 16.666, 2);
    lastTimestamp = timestamp;
    context.clearRect(0, 0, w, h);

    if (gridCache) {
      context.drawImage(gridCache, 0, 0, gridCacheW, gridCacheH);
    }

    pulses.forEach((p) => { updatePulse(p, delta); drawPulse(p); });
    animationFrame = window.requestAnimationFrame(render);
  };

  let running = false;
  const startAnim = () => {
    if (running) return;
    running = true;
    lastTimestamp = 0;
    animationFrame = window.requestAnimationFrame(render);
  };
  const stopAnim = () => {
    if (!running) return;
    running = false;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  resizeCanvas();
  startAnim();

  const refreshCanvas = () => {
    stopAnim();
    resizeCanvas();
    startAnim();
  };

  const checkVisibility = () => {
    const visible = window.scrollY < backgroundCanvas.height;
    if (visible) startAnim(); else stopAnim();
  };

  window.addEventListener("resize", refreshCanvas);
  window.addEventListener("load", refreshCanvas);
  window.addEventListener("scroll", checkVisibility, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAnim(); else checkVisibility();
  });
}

/* ---------- Background grid canvas (BOTTOM mirror) ---------- */
const backgroundCanvasBottom = document.querySelector(".background-grid-bottom");
if (backgroundCanvasBottom instanceof HTMLCanvasElement) {
  const context = backgroundCanvasBottom.getContext("2d", { alpha: true });
  let animationFrame = 0;
  let gridSize = 72;
  let columns = 0;
  let rows = 0;
  let pulses = [];
  let lastTimestamp = 0;
  let gridCache = null;
  let gridCacheW = 0;
  let gridCacheH = 0;

  const pulseSpeed = 0.12;
  const pulseTrailLength = 6;
  const pulseThickness = 1.2;
  const pulseGlow = 14;
  const pulseTurnChance = 0.35;
  const minStraight = 3;

  const directions = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 },
  ];

  const beamStops = [
    { t: 0.00, r: 89,  g: 0,   b: 255, a: 0.0 },
    { t: 0.20, r: 89,  g: 0,   b: 255, a: 1.0 },
    { t: 0.50, r: 120, g: 99,  b: 255, a: 1.0 },
    { t: 1.00, r: 174, g: 72,  b: 255, a: 0.0 },
  ];

  const beamPasses = [
    { width: 3.5, alpha: 0.22 },
    { width: 1.0, alpha: 1.0 },
  ];

  const sampleBeam = (t, alphaMul = 1) => {
    const clamped = Math.min(1, Math.max(0, t));
    for (let i = 0; i < beamStops.length - 1; i++) {
      const a = beamStops[i];
      const b = beamStops[i + 1];
      if (clamped >= a.t && clamped <= b.t) {
        const k = (clamped - a.t) / (b.t - a.t || 1);
        const r = a.r + (b.r - a.r) * k;
        const g = a.g + (b.g - a.g) * k;
        const bl = a.b + (b.b - a.b) * k;
        const al = (a.a + (b.a - a.a) * k) * alphaMul;
        return `rgba(${r | 0}, ${g | 0}, ${bl | 0}, ${al})`;
      }
    }
    return "rgba(0, 0, 0, 0)";
  };

  const choosePerpendicular = (dir) => {
    if (dir.x !== 0) return Math.random() > 0.5 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    return Math.random() > 0.5 ? { x: 1, y: 0 } : { x: -1, y: 0 };
  };

  const isInsideGrid = (gx, gy) => gx >= 0 && gx <= columns && gy >= 0 && gy <= rows;

  const getNextDirection = (pulse) => {
    const straight = pulse.direction;
    const perp = choosePerpendicular(straight);
    const oppPerp = { x: -perp.x, y: -perp.y };
    const reverse = { x: -straight.x, y: -straight.y };

    const distFromHomeX = pulse.gridX - pulse.homeX;
    const distFromHomeY = pulse.gridY - pulse.homeY;
    if (Math.abs(distFromHomeX) > pulse.homeRadiusX) {
      const homeDir = { x: distFromHomeX > 0 ? -1 : 1, y: 0 };
      if (isInsideGrid(pulse.gridX + homeDir.x, pulse.gridY + homeDir.y)) {
        pulse.straightCount = 0;
        return homeDir;
      }
    }
    if (Math.abs(distFromHomeY) > pulse.homeRadiusY) {
      const homeDir = { x: 0, y: distFromHomeY > 0 ? -1 : 1 };
      if (isInsideGrid(pulse.gridX + homeDir.x, pulse.gridY + homeDir.y)) {
        pulse.straightCount = 0;
        return homeDir;
      }
    }

    const canTurn = pulse.straightCount >= minStraight;
    if (canTurn && Math.random() < pulse.turnChance) {
      const turnDir = Math.random() < 0.5 ? perp : oppPerp;
      if (isInsideGrid(pulse.gridX + turnDir.x, pulse.gridY + turnDir.y)) {
        pulse.straightCount = 0;
        return turnDir;
      }
    }

    if (isInsideGrid(pulse.gridX + straight.x, pulse.gridY + straight.y)) {
      pulse.straightCount += 1;
      return straight;
    }

    for (const c of [perp, oppPerp, reverse]) {
      if (isInsideGrid(pulse.gridX + c.x, pulse.gridY + c.y)) {
        pulse.straightCount = 0;
        return c;
      }
    }
    pulse.straightCount = 0;
    return reverse;
  };

  const createPulse = (index, total) => {
    const dir = directions[Math.floor(Math.random() * 4)];
    const cols = Math.max(1, Math.ceil(Math.sqrt(total)));
    const rowsCount = Math.ceil(total / cols);
    const cellX = index % cols;
    const cellY = Math.floor(index / cols);
    const regionW = columns / cols;
    const regionH = rows / rowsCount;
    const homeX = Math.floor((cellX + 0.5) * regionW);
    const homeY = Math.floor((cellY + 0.5) * regionH);
    return {
      homeX,
      homeY,
      homeRadiusX: Math.max(2, Math.floor(regionW * 0.55)),
      homeRadiusY: Math.max(2, Math.floor(regionH * 0.55)),
      gridX: homeX + Math.floor((Math.random() - 0.5) * regionW * 0.6),
      gridY: homeY + Math.floor((Math.random() - 0.5) * regionH * 0.6),
      direction: dir,
      progress: Math.random(),
      speed: pulseSpeed,
      trail: [],
      maxTrail: pulseTrailLength,
      thickness: pulseThickness,
      glow: pulseGlow,
      color: "89, 0, 255",
      coreColor: "120, 99, 255",
      turnChance: pulseTurnChance,
      straightCount: 0,
    };
  };

  // anchor: top of the bottom zone ≈ just above FAQ section so the grid
  // fades in after the last FAQ item and covers contact + footer.
  const faqSection = document.querySelector(".faq-section");
  const contactSection = document.querySelector(".cta-section");

  const computeBottomHeight = () => {
    const fallback = Math.max(window.innerHeight + 400, 1400);
    const doc = document.documentElement;
    const pageHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
    const anchor = faqSection || contactSection;
    if (!anchor) return fallback;
    const rect = anchor.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;
    return Math.max(pageHeight - absoluteTop + 200, fallback);
  };

  const resizeCanvas = () => {
    const w = window.innerWidth;
    const h = computeBottomHeight();
    document.documentElement.style.setProperty("--bg-bottom-h", `${h}px`);
    backgroundCanvasBottom.style.width = `${w}px`;
    backgroundCanvasBottom.style.height = `${h}px`;
    backgroundCanvasBottom.width = w;
    backgroundCanvasBottom.height = h;
    if (context) context.setTransform(1, 0, 0, 1, 0, 0);
    gridSize = w < 640 ? 48 : w < 980 ? 60 : 72;
    columns = Math.ceil(w / gridSize);
    rows = Math.ceil(h / gridSize);
    const pulseCount = w < 640 ? 4 : w < 980 ? 5 : 6;
    pulses = Array.from({ length: pulseCount }, (_, i) => createPulse(i, pulseCount));
    buildGridCache(w, h);
  };

  const buildGridCache = (w, h) => {
    gridCacheW = w;
    gridCacheH = h;
    gridCache = document.createElement("canvas");
    gridCache.width = w;
    gridCache.height = h;
    const gctx = gridCache.getContext("2d");
    if (!gctx) return;
    gctx.strokeStyle = "rgba(120, 99, 255, 0.16)";
    gctx.lineWidth = 1;
    for (let x = 0; x <= w + gridSize; x += gridSize) {
      gctx.beginPath(); gctx.moveTo(x + 0.5, 0); gctx.lineTo(x + 0.5, h); gctx.stroke();
    }
    for (let y = 0; y <= h + gridSize; y += gridSize) {
      gctx.beginPath(); gctx.moveTo(0, y + 0.5); gctx.lineTo(w, y + 0.5); gctx.stroke();
    }
  };

  const gp = (gx, gy) => ({ x: gx * gridSize, y: gy * gridSize });

  const updatePulse = (pulse, delta) => {
    pulse.progress += pulse.speed * delta;
    while (pulse.progress >= 1) {
      const prev = gp(pulse.gridX, pulse.gridY);
      let dir = pulse.direction;
      if (!isInsideGrid(pulse.gridX + dir.x, pulse.gridY + dir.y)) dir = getNextDirection(pulse);
      pulse.gridX += dir.x;
      pulse.gridY += dir.y;
      const cur = gp(pulse.gridX, pulse.gridY);
      pulse.trail.unshift({ from: prev, to: cur });
      if (pulse.trail.length > pulse.maxTrail) pulse.trail.pop();
      pulse.direction = getNextDirection(pulse);
      pulse.progress -= 1;
    }
  };

  const drawPulse = (pulse) => {
    if (!context) return;
    const cur = gp(pulse.gridX, pulse.gridY);
    const next = gp(pulse.gridX + pulse.direction.x, pulse.gridY + pulse.direction.y);
    const head = {
      x: cur.x + (next.x - cur.x) * pulse.progress,
      y: cur.y + (next.y - cur.y) * pulse.progress,
    };
    const headLen = Math.hypot(head.x - cur.x, head.y - cur.y);
    const totalLen = headLen + pulse.trail.length * gridSize;
    if (totalLen < 0.5) return;

    const segs = [];
    segs.push({
      fx: head.x, fy: head.y,
      tx: cur.x,  ty: cur.y,
      tFrom: 1,
      tTo: 1 - headLen / totalLen,
    });
    let cumDist = headLen;
    for (let i = 0; i < pulse.trail.length; i++) {
      const s = pulse.trail[i];
      segs.push({
        fx: s.to.x, fy: s.to.y,
        tx: s.from.x, ty: s.from.y,
        tFrom: 1 - cumDist / totalLen,
        tTo: 1 - (cumDist + gridSize) / totalLen,
      });
      cumDist += gridSize;
    }

    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";

    for (let p = 0; p < beamPasses.length; p++) {
      const pass = beamPasses[p];
      context.lineWidth = pass.width;
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        const grad = context.createLinearGradient(seg.fx, seg.fy, seg.tx, seg.ty);
        grad.addColorStop(0, sampleBeam(seg.tFrom, pass.alpha));
        const span = seg.tFrom - seg.tTo;
        if (Math.abs(span) > 1e-4) {
          for (let b = 0; b < beamStops.length; b++) {
            const bs = beamStops[b];
            if (bs.t < seg.tTo || bs.t > seg.tFrom) continue;
            const k = (seg.tFrom - bs.t) / span;
            if (k > 0.0001 && k < 0.9999) {
              grad.addColorStop(
                k,
                `rgba(${bs.r | 0}, ${bs.g | 0}, ${bs.b | 0}, ${bs.a * pass.alpha})`
              );
            }
          }
        }
        grad.addColorStop(1, sampleBeam(seg.tTo, pass.alpha));
        context.strokeStyle = grad;
        context.beginPath();
        context.moveTo(seg.fx, seg.fy);
        context.lineTo(seg.tx, seg.ty);
        context.stroke();
      }
    }

    context.restore();
  };

  const render = (timestamp) => {
    if (!context) return;
    const w = backgroundCanvasBottom.clientWidth;
    const h = backgroundCanvasBottom.clientHeight;
    const delta = Math.min((timestamp - lastTimestamp) / 16.666, 2);
    lastTimestamp = timestamp;
    context.clearRect(0, 0, w, h);

    if (gridCache) {
      context.drawImage(gridCache, 0, 0, gridCacheW, gridCacheH);
    }

    pulses.forEach((p) => { updatePulse(p, delta); drawPulse(p); });
    animationFrame = window.requestAnimationFrame(render);
  };

  let running = false;
  const startAnim = () => {
    if (running) return;
    running = true;
    lastTimestamp = 0;
    animationFrame = window.requestAnimationFrame(render);
  };
  const stopAnim = () => {
    if (!running) return;
    running = false;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  resizeCanvas();
  startAnim();

  const refreshCanvas = () => {
    stopAnim();
    resizeCanvas();
    startAnim();
  };

  const checkVisibility = () => {
    const rect = backgroundCanvasBottom.getBoundingClientRect();
    const visible = rect.top < window.innerHeight && rect.bottom > 0;
    if (visible) startAnim(); else stopAnim();
  };

  window.addEventListener("resize", refreshCanvas);
  window.addEventListener("load", refreshCanvas);
  window.addEventListener("scroll", checkVisibility, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAnim(); else checkVisibility();
  });
}

/* ---------- Stats counter animation ---------- */
const statNumbers = document.querySelectorAll(".stat-number[data-target]");

if (statNumbers.length) {
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const startTime = performance.now();

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach((el) => statsObserver.observe(el));
}


/* ---------- Parallax floaters on scroll ---------- */
const heroFloaters = document.querySelector(".hero-floaters");
if (heroFloaters && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    heroFloaters.style.transform = `translateY(${y * 0.15}px)`;
  }, { passive: true });
}

/* ---------- Hero ambient glow fade on scroll ---------- */
const heroGlowBeam = document.querySelector(".hero-glow-beam");
if (heroGlowBeam) {
  heroGlowBeam.classList.add("is-visible");
  window.addEventListener("scroll", () => {
    const fade = Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.8));
    heroGlowBeam.style.opacity = fade;
  }, { passive: true });
}

