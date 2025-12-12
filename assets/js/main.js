// Extracted from index.html inline script
// p5.js 2.0 Sketch with lightweight optimizations
const CONNECTION_DISTANCE = 150;
const GRID_SIZE = 160;
const MAX_CONNECTIONS_PER_PARTICLE = 6;
let particles = [];
let textParticles = [];
let variableWeight = 300;
let weightDirection = 1;
let particleCount = determineParticleCount();
const spatialGrid = new Map();

function determineParticleCount() {
  const isSmallScreen = window.innerWidth < 768;
  const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
  const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const highDensity = (window.devicePixelRatio || 1) > 2;
  let count = isSmallScreen ? 70 : 110;
  if (lowMemory || lowCores || highDensity) { count *= 0.65; }
  return Math.max(40, Math.round(count));
}

function createParticle() {
  const xPct = random(1);
  const yPct = random(1);
  return {
    xPct: xPct, yPct: yPct,
    x: xPct * width, y: yPct * height,
    vx: random(-0.5, 0.5), vy: random(-0.5, 0.5),
    size: random(2, 6), opacityVal: random(0.1, 0.5),
    hue: random([0, 180, 270])
  };
}

function syncParticlePool(targetCount) {
  if (particles.length > targetCount) {
    particles.length = targetCount;
    return;
  }
  for (let i = particles.length; i < targetCount; i++) {
    particles.push(createParticle());
  }
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('p5-canvas');
  syncParticlePool(particleCount);
  
  // Performance: Pause rendering when tab is not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      noLoop();
    } else {
      loop();
    }
  });
}

function draw() {
  clear();
  variableWeight += weightDirection * 2;
  if (variableWeight > 900 || variableWeight < 300) { weightDirection *= -1; }
  updateParticles();
  populateSpatialGrid();
  renderParticles();
}

function updateParticles() {
  for (let p of particles) {
    p.xPct += p.vx / width;
    p.yPct += p.vy / height;
    
    if (p.xPct < 0) p.xPct += 1;
    if (p.xPct > 1) p.xPct -= 1;
    if (p.yPct < 0) p.yPct += 1;
    if (p.yPct > 1) p.yPct -= 1;

    p.x = p.xPct * width;
    p.y = p.yPct * height;
  }
}

function populateSpatialGrid() {
  spatialGrid.clear();
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const key = getCellKey(p.x, p.y);
    let bucket = spatialGrid.get(key);
    if (!bucket) {
      bucket = [];
      spatialGrid.set(key, bucket);
    }
    bucket.push(i);
  }
}

function getCellKey(x, y) {
  return `${Math.floor(x / GRID_SIZE)}:${Math.floor(y / GRID_SIZE)}`;
}

function renderParticles() {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    applyParticleColor(p);
    noStroke();
    circle(p.x, p.y, p.size);
    drawConnectionsFor(i, p);
  }
}

function applyParticleColor(particle) {
  if (particle.hue === 0) { fill(255, 107, 107, particle.opacityVal * 255); }
  else if (particle.hue === 180) { fill(0, 217, 255, particle.opacityVal * 255); }
  else { fill(168, 85, 247, particle.opacityVal * 255); }
}

function drawConnectionsFor(index, particle) {
  let connections = 0;
  for (const neighborIndex of getNeighborIndices(particle)) {
    if (neighborIndex <= index) { continue; }
    const other = particles[neighborIndex];
    const d = dist(particle.x, particle.y, other.x, other.y);
    if (d < CONNECTION_DISTANCE) {
      stroke(255, 255, 255, map(d, 0, CONNECTION_DISTANCE, 35, 0));
      strokeWeight(0.5);
      line(particle.x, particle.y, other.x, other.y);
      if (++connections >= MAX_CONNECTIONS_PER_PARTICLE) { break; }
    }
  }
}

function getNeighborIndices(particle) {
  const cellX = Math.floor(particle.x / GRID_SIZE);
  const cellY = Math.floor(particle.y / GRID_SIZE);
  const neighbors = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const bucket = spatialGrid.get(`${cellX + dx}:${cellY + dy}`);
      if (bucket) { neighbors.push(...bucket); }
    }
  }
  return neighbors;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const desiredCount = determineParticleCount();
  particleCount = desiredCount;
  syncParticlePool(desiredCount);
}

document.addEventListener('DOMContentLoaded', () => {
  // Nav active link (scroll spy)
  const navLinks = Array.from(document.querySelectorAll('.site-nav .nav-links a'));

  const getHashSelectorFromHrefAttr = (hrefAttr) => {
    if (!hrefAttr) return null;
    if (hrefAttr.startsWith('#')) return hrefAttr;
    const hashIndex = hrefAttr.indexOf('#');
    if (hashIndex === -1) return null;
    return hrefAttr.slice(hashIndex);
  };

  const sectionTargets = navLinks
    .map((link) => {
      const selector = getHashSelectorFromHrefAttr(link.getAttribute('href'));
      if (!selector) return null;
      try {
        return document.querySelector(selector);
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  const setActiveNav = (hash) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === hash;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const updateActiveNavOnScroll = () => {
    if (sectionTargets.length === 0 || navLinks.length === 0) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const offset = 160; // accounts for fixed nav height
    let activeHash = `#${sectionTargets[0].id}`;

    for (const section of sectionTargets) {
      if (scrollY + offset >= section.offsetTop) {
        activeHash = `#${section.id}`;
      }
    }

    setActiveNav(activeHash);
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setActiveNav(link.getAttribute('href'));
    });
  });

  window.addEventListener('scroll', () => requestAnimationFrame(updateActiveNavOnScroll), { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(updateActiveNavOnScroll));
  updateActiveNavOnScroll();

  // Scroll Prompt Logic
  const scrollPrompt = document.querySelector('.scroll-prompt');
  if (scrollPrompt) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        scrollPrompt.classList.add('hidden');
      } else {
        scrollPrompt.classList.remove('hidden');
      }
    });
  }

  // Dynamic Click Me Prompt Logic
  const clickMePrompt = document.querySelector('.click-me-prompt');
  const projectItems = document.querySelectorAll('.project-item');
  const workingSection = document.querySelector('.working-on-section');

  // One-time mouse cue on first viewport entry (projects)
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && projectItems.length > 0 && 'IntersectionObserver' in window) {
    const makeMouseCueSvg = () => {
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('class', 'mouse-cue');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');

      const path1 = document.createElementNS(svgNS, 'path');
      path1.setAttribute('d', 'M10 2h4');
      const path2 = document.createElementNS(svgNS, 'path');
      path2.setAttribute('d', 'M12 2v8');
      const path3 = document.createElementNS(svgNS, 'path');
      path3.setAttribute('d', 'M9 12l3 3 3-3');
      const path4 = document.createElementNS(svgNS, 'path');
      path4.setAttribute('d', 'M8 10v7a4 4 0 0 0 8 0v-7');

      const clickDot = document.createElementNS(svgNS, 'circle');
      clickDot.setAttribute('cx', '18');
      clickDot.setAttribute('cy', '6');
      clickDot.setAttribute('r', '1.2');

      svg.append(path1, path2, path3, path4, clickDot);
      return svg;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const item = entry.target;
          if (item.dataset.mouseCueShown === '1') {
            observer.unobserve(item);
            return;
          }

          item.dataset.mouseCueShown = '1';
          const screenshot = item.querySelector('.project-screenshot');
          if (!screenshot) {
            observer.unobserve(item);
            return;
          }

          const cue = makeMouseCueSvg();
          screenshot.appendChild(cue);
          screenshot.classList.add('mouse-cue-active');

          window.setTimeout(() => {
            screenshot.classList.remove('mouse-cue-active');
            cue.remove();
          }, 1500);

          observer.unobserve(item);
        });
      },
      { threshold: 0.35 }
    );

    projectItems.forEach((item) => observer.observe(item));
  }

  if (clickMePrompt && projectItems.length > 0 && workingSection) {
    let currentActiveItem = null;

    const updateClickMePrompt = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestItem = null;
      let minDistance = Infinity;

      projectItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        // Check if item is roughly in view
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          const itemCenter = rect.top + rect.height / 2;
          const distance = Math.abs(itemCenter - viewportCenter);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestItem = item;
          }
        }
      });

      if (closestItem) {
        if (currentActiveItem !== closestItem) {
          // Fade out
          clickMePrompt.classList.add('hidden');
          
          // Wait for fade out, then move and fade in
          setTimeout(() => {
            currentActiveItem = closestItem;
            const targetTop = closestItem.offsetTop + (closestItem.offsetHeight / 2) - (clickMePrompt.offsetHeight / 2);
            clickMePrompt.style.top = `${targetTop}px`;
            clickMePrompt.classList.remove('hidden');
          }, 300); // Match CSS transition duration
        } else if (clickMePrompt.classList.contains('hidden') && !clickMePrompt.dataset.fading) {
             // Ensure it's visible if it's the same item but was hidden (e.g. initial load or scrolling back)
             // We check a custom flag or just ensure we don't interrupt the fade-out logic above
             // For simplicity, if it's the same item, just show it.
             clickMePrompt.classList.remove('hidden');
        }
      } else {
        clickMePrompt.classList.add('hidden');
        currentActiveItem = null;
      }
    };

    window.addEventListener('scroll', () => requestAnimationFrame(updateClickMePrompt));
    window.addEventListener('resize', () => requestAnimationFrame(updateClickMePrompt));
    // Initial check
    updateClickMePrompt();
  }

  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
  const fadeElements = document.querySelectorAll('.program-card, .project-item, .social-platform-item');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => { entry.target.style.opacity = '1'; entry.target.style.transform = 'translateY(0)'; }, index * 50);
      }
    });
  }, { threshold: 0.1 });
  fadeElements.forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
  });

  // p5.js Sketch Lazy Loading
  document.querySelectorAll('.sketch-item').forEach(item => {
    const overlay = item.querySelector('.play-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        const embedUrl = item.dataset.embedUrl;
        if (embedUrl) {
          const iframe = document.createElement('iframe');
          iframe.src = embedUrl;
          iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
          iframe.allowFullscreen = true;
          
          const thumb = item.querySelector('.sketch-thumb');
          thumb.innerHTML = ''; // Clear overlay
          thumb.appendChild(iframe);
        }
      });
    }
  });
});
