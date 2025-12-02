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
  if (mouseIsPressed) {
    fill(0, 217, 255, 100); noStroke(); circle(mouseX, mouseY, 20);
    for (let i = 0; i < 5; i++) {
      let angle = random(TWO_PI);
      let distance = random(20, 60);
      let x = mouseX + cos(angle) * distance;
      let y = mouseY + sin(angle) * distance;
      fill(168, 85, 247, random(50, 150)); circle(x, y, random(3, 8));
    }
  }
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
