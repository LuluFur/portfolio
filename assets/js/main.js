// =============================================================================
// MAIN INITIALIZATION
// =============================================================================

// Page Load Flow

// Page Load Flow

document.addEventListener('DOMContentLoaded', () => {
  // Page Entry Transition (for non-index pages)
  if (document.querySelector('.project-hero') || document.querySelector('.page-hero')) {
    const overlay = document.createElement('div');
    overlay.className = 'page-enter-overlay';
    document.body.appendChild(overlay);

    // Force reflow
    overlay.getBoundingClientRect();

    // Wait for content (all images etc) to load before revealing
    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.remove();
        }, 1500); // Match CSS transition
      });
    });
  }

  // Cleanup on Back Navigation (bfcache)
  window.addEventListener('pageshow', (event) => {
    const clones = document.querySelectorAll('.transition-hero-clone');
    clones.forEach(el => el.remove());

    // Restore opacity of any hidden project items (if user went back)
    document.querySelectorAll('.project-item').forEach(item => {
      item.style.opacity = '';
    });
  });





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

      // Hide content inside the clone for smooth blend
      Array.from(clone.children).forEach(child => {
        child.style.transition = 'opacity 0.3s ease';
        child.style.opacity = '0';
      });

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
        innerCard.style.background = '#000'; // Blend to black
      }

      const backface = document.createElement('div');
      backface.style.position = 'absolute';
      backface.style.inset = '0';
      backface.style.background = '#000'; // Solid black backface
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

// =============================================================================
// MARQUEE CONTROLLER - JS Driven Interactivity
// =============================================================================
// =============================================================================
// PARTICLE SYSTEM - For Marquee Sparkles
// =============================================================================
/**
 * =============================================================================
 * PARTICLE SYSTEM
 * Handles the visual "sparkles" for the marquee Pop-Out animation.
 * Spawns particles on a separate fixed canvas layer.
 * =============================================================================
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // Canvas Setup
    this.canvas.style.position = 'fixed';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw'; // Full screen for absolute positioning calculation
    this.canvas.style.height = '100vh';
    this.canvas.style.zIndex = '1001'; // Above floating item (z-index 1000)

    document.body.appendChild(this.canvas);

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Spawns a burst of particles at a specific coordinate.
   * @param {number} x - Screen X coordinate
   * @param {number} y - Screen Y coordinate
   * @param {string} colorStr - Hex or RGBA string
   * @param {number} count - Number of particles
   */
  spawn(x, y, colorStr, count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 6; // Fast burst (4-10 px/frame)
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.015 + Math.random() * 0.015,
        color: colorStr,
        size: 4 + Math.random() * 4
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Physics
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95; // Drag
      p.vy *= 0.95;
      p.life -= p.decay;

      // Cull dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Render
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      this.ctx.fill();
    }

    requestAnimationFrame(() => this.animate());
  }
}

/**
 * =============================================================================
 * MARQUEE CONTROLLER
 * Manages the infinite scrolling logo marquee in the specific layout.
 * Features:
 *  - Physics-based smooth scrolling.
 *  - Infinite loop buffering by cloning items.
 *  - "Pop-Out" interactivity: items float/scale/color when reaching the center.
 *  - Integration with ParticleSystem for visual effects.
 *  - Syncs start with Page Load for stability.
 * =============================================================================
 */
class MarqueeController {
  constructor() {
    this.track = document.querySelector('.marquee-track');
    this.container = document.querySelector('.logo-marquee');
    if (!this.track || !this.container) return;

    this.particles = new ParticleSystem();

    // Setup Items
    this.items = Array.from(this.track.children);
    this.scrollPos = 0;

    // Speed Settings
    this.baseSpeed = 0.5;  // Normal cruising speed
    this.slowSpeed = 0.05; // Slow-mo during "Pop" interaction
    this.currentSpeed = this.baseSpeed;

    // Interaction Settings
    this.floatDistance = 40;     // Height to raise the active item
    this.floatDuration = 3000;   // Duration of the "Pop" (ms)
    this.detectionThreshold = 40; // Pixel distance from center to trigger pop
    this.cooldown = 0;           // Timer to prevent double-triggering
    this.isFloating = false;     // State flag
    this.lastTriggeredItem = null;
    this.activeClone = null;
    this.activeOriginalItem = null;

    // --- INFINITE SCROLL SETUP ---
    // We clone the item set enough times to fill the screen width + buffer.
    this.originalCount = this.items.length;

    // Clone 2 extra sets for safe looping (Total 3 sets)
    this.items.forEach(item => {
      const clone = item.cloneNode(true);
      this.track.appendChild(clone);
    });
    this.items.forEach(item => {
      const clone = item.cloneNode(true);
      this.track.appendChild(clone);
    });

    // Re-query complete list of items including clones
    this.allItems = Array.from(this.track.querySelectorAll('img'));

    this.init();
  }

  init() {
    this.animate = this.animate.bind(this);
    this.handleResize = this.handleResize.bind(this);

    window.addEventListener('resize', this.handleResize);

    // Wait for page load AND CSS entry animation (0.6s delay + 0.8s duration = 1.4s)
    const start = () => {
      setTimeout(() => {
        requestAnimationFrame(this.animate);
      }, 2000); // 2s delay ensures animation is fully complete
    };

    if (document.readyState === 'complete') {
      start();
    } else {
      window.addEventListener('load', start);
    }
  }

  handleResize() {
    if (this.isFloating && this.activeClone && this.activeOriginalItem) {
      const rect = this.activeOriginalItem.getBoundingClientRect();
      this.activeClone.style.left = `${rect.left + window.scrollX}px`;
      this.activeClone.style.top = `${rect.top + window.scrollY}px`;
      this.activeClone.style.width = `${rect.width}px`;
      this.activeClone.style.height = `${rect.height}px`;
    }
  }

  animate() {
    // 0. Pause if Focus Mode
    if (document.body.classList.contains('focus-mode')) {
      requestAnimationFrame(this.animate);
      return;
    }

    // 1. Move scroll
    // Smoothly lerp speed - Easing adjusted (0.02)
    const targetSpeed = this.isFloating ? this.slowSpeed : this.baseSpeed;
    this.currentSpeed += (targetSpeed - this.currentSpeed) * 0.02;

    this.scrollPos -= this.currentSpeed;

    // 2. Infinite Loop Logic
    // Calculate total width of one set of items
    // We can approximate by measuring track width / 3
    const trackWidth = this.track.scrollWidth;
    const setWidth = trackWidth / 3;

    // If we scrolled past one set, reset
    if (Math.abs(this.scrollPos) >= setWidth) {
      this.scrollPos += setWidth;
    }

    this.track.style.transform = `translateX(${this.scrollPos}px)`;

    // 3. Center Detection (Only if not already floating and cooled down)
    if (!this.isFloating && this.cooldown <= 0) {
      this.checkCenter();
    }

    if (this.cooldown > 0) this.cooldown -= 16; // Approx ms per frame

    requestAnimationFrame(this.animate);
  }

  checkCenter() {
    const containerRect = this.container.getBoundingClientRect();
    const centerX = (containerRect.left + containerRect.width / 2) - 40;

    for (const item of this.allItems) {
      const rect = item.getBoundingClientRect();
      const itemCenterX = rect.left + rect.width / 2;
      const dist = Math.abs(itemCenterX - centerX);

      // Check if center is visible (within container)
      if (rect.left > containerRect.left && rect.right < containerRect.right) {
        if (dist < this.detectionThreshold && item !== this.lastTriggeredItem) {
          this.triggerFloat(item);
          break;
        }
      }
    }
  }

  triggerFloat(originalItem) {
    this.isFloating = true;
    this.activeOriginalItem = originalItem;

    // 1. Create Clone
    const rect = originalItem.getBoundingClientRect();
    const clone = originalItem.cloneNode(true);
    this.activeClone = clone;

    // Style Clone
    clone.classList.add('marquee-float-item');
    clone.style.left = `${rect.left + window.scrollX}px`;
    clone.style.top = `${rect.top + window.scrollY}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';

    // Initial State for Transition (White)
    clone.style.opacity = '1';
    // Start white filter from CSS logic: brightness(0) invert(1)
    // Except C# which is grayscale(100%) brightness(500%)
    // We need to set explicit inline filter to transition FROM
    if (originalItem.alt === "C#") {
      clone.style.filter = 'grayscale(100%) brightness(500%) drop-shadow(0 0 0 rgba(0,0,0,0))';
    } else {
      clone.style.filter = 'brightness(0) invert(1) drop-shadow(0 0 0 rgba(0,0,0,0))';
    }

    document.body.appendChild(clone);

    // 2. Hide Original
    originalItem.classList.add('marquee-item-hidden');

    // Determine Color
    const alt = (originalItem.alt || '').toLowerCase();
    let glowColor = 'rgba(255, 255, 255, 0.8)'; // Default white
    let particleColor = '#ffffff';

    if (alt.includes('unreal')) { glowColor = 'rgba(255, 255, 255, 0.8)'; particleColor = '#ffffff'; }
    if (alt.includes('unity')) { glowColor = 'rgba(200, 200, 200, 0.8)'; particleColor = '#cccccc'; }
    if (alt.includes('roblox')) { glowColor = 'rgba(0, 162, 255, 0.8)'; particleColor = '#00a2ff'; }
    if (alt.includes('gamemaker')) { glowColor = 'rgba(131, 191, 79, 0.8)'; particleColor = '#83bf4f'; }
    if (alt.includes('c++')) { glowColor = 'rgba(0, 89, 156, 0.8)'; particleColor = '#00599c'; }
    if (alt.includes('c#')) { glowColor = 'rgba(130, 48, 133, 0.8)'; particleColor = '#9b4993'; }
    if (alt.includes('js') || alt.includes('javascript')) { glowColor = 'rgba(247, 223, 30, 0.8)'; particleColor = '#f7df1e'; }
    if (alt.includes('blender')) { glowColor = 'rgba(232, 125, 13, 0.8)'; particleColor = '#e87d0d'; }

    // Spawn Particles
    this.particles.spawn(rect.left + rect.width / 2, rect.top + rect.height / 2, particleColor, 40);

    // 3. Animate Clone Up & Color Lerp
    // Need requestAnimationFrame to ensure DOM is updated before adding transform
    requestAnimationFrame(() => {
      clone.style.transform = `translate(0, -${this.floatDistance}px) scale(2.5) rotate(5deg)`;
      // End State (Color + Glow)
      // Note: brightness(1) invert(0) restores original color (except C# devicon needs reset)
      if (originalItem.alt === "C#") {
        // C# Devicon needs to remove the white-forcing filter. 
        // grayscale(0%) brightness(100%) restores it.
        clone.style.filter = `grayscale(0%) brightness(100%) drop-shadow(0 0 15px ${glowColor})`;
      } else {
        clone.style.filter = `brightness(1) invert(0) drop-shadow(0 0 15px ${glowColor})`;
      }
    });

    // 4. Wait, then Return
    setTimeout(() => {
      this.returnFloat(clone, originalItem, glowColor);
    }, this.floatDuration);
  }

  returnFloat(clone, originalItem, glowColor) {
    // Find where the original item is NOW
    const currentRect = originalItem.getBoundingClientRect();

    // Animate clone to that position
    clone.style.transform = 'translate(0, 0) scale(1) rotate(0deg)';
    clone.style.left = `${currentRect.left + window.scrollX}px`;
    clone.style.top = `${currentRect.top + window.scrollY}px`;

    // Lerp Color Back to White
    if (originalItem.alt === "C#") {
      clone.style.filter = 'grayscale(100%) brightness(500%) drop-shadow(0 0 0 rgba(0,0,0,0))';
    } else {
      clone.style.filter = 'brightness(0) invert(1) drop-shadow(0 0 0 rgba(0,0,0,0))';
    }

    setTimeout(() => {
      // Animation complete
      clone.remove();
      this.activeClone = null;
      this.activeOriginalItem = null;
      originalItem.classList.remove('marquee-item-hidden');
      this.isFloating = false;
      this.lastTriggeredItem = originalItem; // Mark as just triggered
      this.cooldown = 2000; // Longer buffer to ensure it scrolls out of detection zone

      // Clear lastTriggeredItem after it has definitely moved away
      setTimeout(() => {
        if (this.lastTriggeredItem === originalItem) {
          this.lastTriggeredItem = null;
        }
      }, 5000); // 5 seconds should be plenty for it to move out of 40px range even at slow speed
    }, 600); // Match CSS transition time
  }
}

// Init Marquee
document.addEventListener('DOMContentLoaded', () => {
  new MarqueeController();
});
