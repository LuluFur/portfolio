// Extracted from index.html inline script
// p5.js 2.0 Sketch with new features
let particles = [];
let textParticles = [];
let variableWeight = 300;
let weightDirection = 1;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('p5-canvas');
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: random(width), y: random(height),
      vx: random(-0.5, 0.5), vy: random(-0.5, 0.5),
      size: random(2, 6), opacityVal: random(0.1, 0.5),
      hue: random([0, 180, 270])
    });
  }
}

function draw() {
  clear();
  variableWeight += weightDirection * 2;
  if (variableWeight > 900 || variableWeight < 300) { weightDirection *= -1; }
  for (let p of particles) {
    if (p.hue === 0) { fill(255, 107, 107, p.opacityVal * 255); }
    else if (p.hue === 180) { fill(0, 217, 255, p.opacityVal * 255); }
    else { fill(168, 85, 247, p.opacityVal * 255); }
    noStroke(); circle(p.x, p.y, p.size);
    for (let other of particles) {
      let d = dist(p.x, p.y, other.x, other.y);
      if (d < 150) { stroke(255, 255, 255, map(d, 0, 150, 30, 0)); strokeWeight(0.5); line(p.x, p.y, other.x, other.y); }
    }
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
  }
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

function windowResized() { resizeCanvas(windowWidth, windowHeight); }

document.addEventListener('DOMContentLoaded', () => {
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
});
