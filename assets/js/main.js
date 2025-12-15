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
  // Page Entry Transition (for non-index pages)
  if (document.querySelector('.project-hero') || document.querySelector('.page-hero')) {
    const overlay = document.createElement('div');
    overlay.className = 'page-enter-overlay';
    document.body.appendChild(overlay);

    // Force reflow
    overlay.getBoundingClientRect();

    requestAnimationFrame(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.remove();
      }, 800);
    });
  }



  // Dynamic Text Rotation (Hero)
  const dynamicText = document.getElementById('hero-dynamic-text');
  if (dynamicText) {
    const roles = [
      "Game Development",
      "Gameplay Systems",
      "Rapid Prototyping",
      "Interactive UI / UX",
      "Level Design"
    ];
    let roleIndex = 0;

    setInterval(() => {
      roleIndex = (roleIndex + 1) % roles.length;

      // Slide out
      dynamicText.classList.add('swapping');

      setTimeout(() => {
        // Change text
        dynamicText.textContent = roles[roleIndex];
        // Slide in
        dynamicText.classList.remove('swapping');
      }, 300); // Wait for opacity            
    }, 3000); // 3 seconds per role
  }

  // --- Global Scroll Animations ---

  // 1. Intersection Observer for Reveal on Scroll
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1 // Trigger when 10% visible
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;

        // Add stagger delay if part of a grid
        if (target.dataset.delay) {
          target.style.transitionDelay = target.dataset.delay;
        }

        target.classList.add('is-visible');
        observer.unobserve(target); // Only animate once
      }
    });
  }, observerOptions);

  // Target elements
  const scrollTargets = document.querySelectorAll('.reveal-on-scroll, .project-item, .program-card, .sketch-item, .asset-item, .section-title, .about-text');

  // Auto-assign stagger delays to grids
  const grids = document.querySelectorAll('.programs-grid, .projects-showcase, .sketch-grid, .gallery-grid, .logo-marquee');
  grids.forEach(grid => {
    const children = grid.children;
    Array.from(children).forEach((child, index) => {
      // Apply delay based on index (max 5 items staggered to prevent long waits)
      const delay = (index % 5) * 0.1;
      child.dataset.delay = `${delay}s`;
      scrollObserver.observe(child);
    });
  });

  // Observe standalone elements
  scrollTargets.forEach(el => {
    if (!el.parentElement.classList.contains('programs-grid') &&
      !el.parentElement.classList.contains('projects-showcase') &&
      !el.parentElement.classList.contains('sketch-grid')) {
      scrollObserver.observe(el);
    }
  });


  // 2. Typewriter Effect for Hero Title
  const heroName = document.querySelector('.hero-name');
  if (heroName) {
    const text = heroName.textContent;
    heroName.textContent = '';
    heroName.classList.add('typewriter-cursor');

    let i = 0;
    function typeWriter() {
      if (i < text.length) {
        heroName.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 100); // Typing speed
      } else {
        // Remove cursor after finished
        setTimeout(() => {
          heroName.classList.remove('typewriter-cursor');
          // Add the halo glow back if needed, or trigger subtitle reveal
          const subtitle = document.querySelector('.hero-subtitle');
          if (subtitle) subtitle.classList.add('is-visible');
        }, 1000);
      }
    }
    // Start typing after a short delay
    setTimeout(typeWriter, 500);
  }

  // Typewriter for Project Titles (on page load)
  const projectTitle = document.querySelector('.hero-title'); // Detail pages
  if (projectTitle && !document.querySelector('.hero-name')) { // Only if not homepage
    const text = projectTitle.textContent;
    projectTitle.textContent = '';
    projectTitle.classList.add('typewriter-cursor');

    let j = 0;
    function typeProject() {
      if (j < text.length) {
        projectTitle.textContent += text.charAt(j);
        j++;
        setTimeout(typeProject, 80);
      } else {
        setTimeout(() => {
          projectTitle.classList.remove('typewriter-cursor');
        }, 500);
      }
    }
    setTimeout(typeProject, 300);
  }

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

  // Copy Email Functionality
  const emailContact = document.getElementById('email-contact');
  const emailText = document.getElementById('email-text');
  const copyFeedback = document.querySelector('.copy-feedback');
  const copyIcon = document.getElementById('copy-icon');

  if (emailContact && emailText && copyFeedback) {
    emailContact.addEventListener('click', (e) => {
      e.preventDefault();
      const email = emailText.textContent;
      navigator.clipboard.writeText(email).then(() => {
        // Show feedback
        copyFeedback.style.opacity = '1';

        // Optional: Change icon to checkmark temporarily
        const originalIconHTML = copyIcon.innerHTML;
        copyIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        copyIcon.style.color = '#00D9FF'; // Cyan

        setTimeout(() => {
          copyFeedback.style.opacity = '0';
          copyIcon.innerHTML = originalIconHTML;
          copyIcon.style.color = ''; // Reset color
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy email: ', err);
      });
    });
  }


  // Project Card Transition Logic
  const allProjectItems = document.querySelectorAll('.project-item');
  allProjectItems.forEach(item => {
    item.addEventListener('click', function (e) {
      if (this.getAttribute('target') === '_blank') return; // Ignore external links
      e.preventDefault();
      const href = this.getAttribute('href');

      // 1. Get current rect
      const rect = this.getBoundingClientRect();

      // 2. Clone the card
      const clone = this.cloneNode(true);
      clone.classList.remove('featured'); // Remove animation/glow

      // 3. Create wrapper for 3D context
      const wrapper = document.createElement('div');
      wrapper.classList.add('transition-hero-clone');
      wrapper.style.width = `${rect.width}px`;
      wrapper.style.height = `${rect.height}px`;
      wrapper.style.top = `${rect.top}px`;
      wrapper.style.left = `${rect.left}px`;

      // 4. Append clone to wrapper and wrapper to body
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // 5. Hide original
      this.style.opacity = '0';

      // 6. Force reflow
      wrapper.getBoundingClientRect();

      // 7. Animate
      wrapper.style.transition = 'all 1s cubic-bezier(0.6, 0.05, 0.2, 1)';
      wrapper.style.top = '0';
      wrapper.style.left = '0';
      wrapper.style.width = '100vw';
      wrapper.style.height = '100vh';
      wrapper.style.borderRadius = '0';
      wrapper.style.transform = 'rotateY(180deg)';

      // Animate child radius too
      const innerCard = wrapper.querySelector('.project-item');
      if (innerCard) {
        innerCard.style.transition = 'border-radius 1s ease';
        innerCard.style.borderRadius = '0';
      }

      const backface = document.createElement('div');
      backface.style.position = 'absolute';
      backface.style.inset = '0';
      backface.style.background = '#13141f';
      backface.style.transform = 'rotateY(180deg)';
      backface.style.backfaceVisibility = 'hidden';
      backface.style.borderRadius = '0';
      backface.style.zIndex = '-1';

      // 8. Navigate after animation
      setTimeout(() => {
        window.location.href = href;
      }, 1000);
    });
  });
});
