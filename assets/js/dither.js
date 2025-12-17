/**
 * Dither Effect System
 * Physics-based interactive dither pattern for desktop devices
 * Falls back to static rendering on touch/mobile devices
 */

// =============================================================================
// CONFIGURATION
// Centralized settings for all dither effects across the site.
// =============================================================================
const DITHER_CONFIG = {
    // Device Detection: Only run heavy physics on desktop with mouse
    isDesktop: window.matchMedia('(pointer: fine)').matches && !('ontouchstart' in window),

    // Physics Settings (only used on desktop)
    physics: {
        tension: 0.015,     // Spring stiffness
        damping: 0.92,      // Friction
        spread: 0.025,      // Wave propagation
        waveForce: 0.15,    // Mouse wake force
        mouseRadius: 150    // Mouse influence radius
    },

    // Circuit Settings
    circuit: {
        nodeCount: 60,
        connectionDist: 200,
        pulseSpeed: 2,
        pulseChance: 0.02
    },

    // Section Definitions
    sections: [
        // Hero: Circuit Board Effect


        // Other Sections: Grid Dither
        { selector: '.about', color: 'rgba(168, 85, 247, 0.15)', spacing: 32, fadeMargin: 120, zIndex: 1 },
        { selector: '.sketches-section', color: 'rgba(255, 107, 107, 0.15)', spacing: 32, fadeMargin: 120, zIndex: 1 },
        { selector: '.programs', color: 'rgba(255, 255, 255, 0.12)', spacing: 32, fadeMargin: 120, zIndex: 1 },
        { selector: '.contact', color: 'rgba(0, 217, 255, 0.15)', spacing: 32, fadeMargin: 120, zIndex: 1 },
        { selector: '.project-hero', color: 'rgba(0, 217, 255, 0.18)', spacing: 28, fadeMargin: 180, zIndex: 1 },
        { selector: '.project-article', color: 'rgba(168, 85, 247, 0.12)', spacing: 32, fadeMargin: 100, zIndex: 1 }
    ],

    baseSize: 6,
    maxSize: 14
};

/**
 * =============================================================================
 * DITHER SECTION CLASS
 * Manages a single dither effect canvas.
 * Supports two modes:
 * 1. 'grid': Standard square grid that reacts to mouse physics (wave equations).
 * 2. 'circuit': Interactive circuit board effect with traces and signals.
 * =============================================================================
 */
class DitherSection {
    constructor(config) {
        this.container = document.querySelector(config.selector);
        if (!this.container) return;

        this.color = config.color;
        this.spacing = config.spacing;
        this.fadeMargin = config.fadeMargin || 100;
        this.zIndex = config.zIndex;
        this.layout = config.layout || 'grid';
        this.usePhysics = DITHER_CONFIG.isDesktop && config.hasPhysics;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        this.points = [];
        this.connections = []; // For circuit layout
        this.pulses = [];      // For circuit layout
        this.width = 0;
        this.height = 0;

        if (this.usePhysics) {
            this.mouseX = -1000;
            this.mouseY = -1000;
            this.prevMouseX = -1000;
            this.prevMouseY = -1000;
            this.isHovering = false;
            this.lastFrameTime = 0;
            this.containerRect = null;
        }

        this.init();
    }

    setupCanvas() {
        const s = this.canvas.style;
        s.position = 'absolute';
        s.top = s.left = '0';
        s.width = s.height = '100%';
        s.zIndex = this.zIndex;
        s.pointerEvents = 'none';

        const style = getComputedStyle(this.container);
        if (style.position === 'static') {
            this.container.style.position = 'relative';
        }
        this.container.insertBefore(this.canvas, this.container.firstChild);
    }

    init() {
        this.resize = this.resize.bind(this);
        this.draw = this.draw.bind(this);
        window.addEventListener('resize', this.resize);

        if (this.usePhysics) {
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleMouseLeave = this.handleMouseLeave.bind(this);
            window.addEventListener('mousemove', this.handleMouseMove);
            this.container.addEventListener('mouseleave', this.handleMouseLeave);
        }

        new IntersectionObserver(entries => {
            entries.forEach(e => {
                this.isVisible = e.isIntersecting;
                if (this.isVisible) this.startLoop();
                else this.stopLoop();
            });
        }, { threshold: 0 }).observe(this.container);

        this.resize();
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        if (this.usePhysics) this.containerRect = rect;

        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);

        this.points = [];
        this.connections = [];

        // Always grid for stability now
        this.generateGrid();

        if (this.isVisible) this.render();
    }

    generateGrid() {
        // Use wider spacing for circuit feel
        const spacing = this.layout === 'circuit' ? 32 : this.spacing;
        const cols = Math.ceil(this.width / spacing) + 2;
        const rows = Math.ceil(this.height / spacing) + 2;
        const offX = (this.width - (cols - 2) * spacing) / 2 - spacing;
        const offY = (this.height - (rows - 2) * spacing) / 2 - spacing;

        this.grid = []; // 2D array for neighbor access if needed, or just flattened

        for (let ix = 0; ix < cols; ix++) {
            for (let iy = 0; iy < rows; iy++) {
                const isEdge = ix === 0 || ix === cols - 1 || iy === 0 || iy === rows - 1;
                this.points.push({
                    x: offX + ix * spacing,
                    y: offY + iy * spacing,
                    z: 0, vz: 0,
                    pinned: isEdge,
                    // Circuit Props
                    signal: 0,
                    signalDecay: 0.02 + Math.random() * 0.03,
                    ix, iy // Grid coords
                });
            }
        }
    }

    // Removed generateCircuit (old graph style)

    startLoop() {
        if (this.isAnimating || !this.isVisible) return;
        this.isAnimating = true;
        this.lastFrameTime = performance.now();
        this.draw();
    }

    stopLoop() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    handleMouseMove(e) {
        if (!this.isVisible || !this.containerRect) return;
        this.mouseX = e.clientX - this.containerRect.left;
        this.mouseY = e.clientY - this.containerRect.top;
        this.isHovering = this.mouseX >= 0 && this.mouseX <= this.width &&
            this.mouseY >= 0 && this.mouseY <= this.height;
        this.startLoop();
    }

    handleMouseLeave() {
        this.isHovering = false;
        // Don't reset immediately, let signals decay
    }

    // ===============================================
    // DRAW & RENDER LOOP
    // ===============================================
    draw() {
        if (!this.isVisible) {
            this.isAnimating = false;
            return;
        }

        const now = performance.now();
        // const dt = ... (unused for simple decay)

        let active = false;
        const spacing = this.layout === 'circuit' ? 32 : this.spacing;

        // 1. Inject Energy from Mouse
        if (this.isHovering) {
            const range = 250; // Interaction radius
            const rangeSq = range * range;

            for (const p of this.points) {
                const dx = p.x - this.mouseX;
                const dy = p.y - this.mouseY;
                const distSq = dx * dx + dy * dy;

                if (distSq < rangeSq) {
                    const power = 1 - (distSq / rangeSq);
                    // Add signal based on proximity
                    p.signal = Math.max(p.signal, power);
                    active = true;
                }
            }
        }

        // ---------------------------------------------------------------------
        // 2. AMBIENT ANIMATION (Heartbeat)
        // ---------------------------------------------------------------------
        // Randomly light up nodes in circuit mode to make it feel alive
        if (this.layout === 'circuit' && Math.random() < 0.05) {
            const p = this.points[Math.floor(Math.random() * this.points.length)];
            p.signal = 1;
            active = true;
        }

        // ---------------------------------------------------------------------
        // 3. RENDER LOGIC
        // ---------------------------------------------------------------------
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // --- LAYER 1: CIRCUIT CONNECTIONS ---
        if (this.layout === 'circuit') {
            ctx.lineWidth = 1.5;

            // We iterate points and check Right and Down neighbors to avoid double drawing
            // We need a way to look up neighbors efficiently. 
            // Since points are pushed in order (ix loop outer, iy loop inner?), let's assume index logic or simple proximity check
            // Or just iterate standard loops if we had 2D grid.
            // Simple approach: Iterate all, check dist spacing * 1.1 

            for (let i = 0; i < this.points.length; i++) {
                const p = this.points[i];

                // Decay
                if (p.signal > 0) {
                    p.signal -= p.signalDecay;
                    if (p.signal < 0) p.signal = 0;
                    else active = true;
                }

                if (p.signal > 0.05) {
                    // Find neighbors (optimization: grid logic would be better but searching nearby in sorted buffer is okay-ish)
                    // Actually, since generated in order, neighbors are at i+1 (if same col) and i+rows (next col)
                    // Let's use the ix/iy we stored

                    // Draw vertical line (to iy + 1)
                    const pDown = this.points[i + 1];
                    // Check if valid neighbor
                    if (pDown && pDown.ix === p.ix && pDown.iy === p.iy + 1) {
                        const strength = (p.signal + pDown.signal) / 2;
                        if (strength > 0.05) {
                            ctx.strokeStyle = `rgba(0, 217, 255, ${strength * 0.4})`;
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(pDown.x, pDown.y);
                            ctx.stroke();
                        }
                    }

                    // Draw horizontal line (to ix + 1)
                    // We need to know Rows count to find horizontal neighbor index
                    const rows = Math.ceil(this.height / spacing) + 2;
                    const pRight = this.points[i + rows];
                    if (pRight && pRight.ix === p.ix + 1 && pRight.iy === p.iy) {
                        const strength = (p.signal + pRight.signal) / 2;
                        if (strength > 0.05) {
                            ctx.strokeStyle = `rgba(0, 217, 255, ${strength * 0.4})`;
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(pRight.x, pRight.y);
                            ctx.stroke();
                        }
                    }
                }
            }
        }

        // --- LAYER 2: NODES / DOTS ---
        for (const p of this.points) {
            // Draw Dots
            // Circuit mode: Nodes allow glow
            if (this.layout === 'circuit') {
                // Always visible weak dot
                ctx.fillStyle = `rgba(0, 217, 255, ${0.1 + p.signal * 0.5})`;
                const size = 2 + p.signal * 4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Standard Dither Grid Logic for other sections
                // Vignette
                const margin = this.fadeMargin;
                const minDist = Math.min(p.x, this.width - p.x, p.y, this.height - p.y);
                if (minDist < 0) continue;
                const t = Math.min(minDist / margin, 1);
                const vignette = 1 - (1 - t) ** 3;

                const size = (DITHER_CONFIG.baseSize * vignette);
                if (size < 0.5) continue;

                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.rect(p.x - size / 2, p.y - size / 2, size, size);
                ctx.fill();
            }
        }

        if (active || this.isHovering) {
            this.animationId = requestAnimationFrame(this.draw);
        } else {
            this.isAnimating = false;
        }
    }


    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = this.color;

        ctx.beginPath();

        const baseSize = DITHER_CONFIG.baseSize;
        const maxSize = DITHER_CONFIG.maxSize;
        const margin = this.fadeMargin;

        for (const p of this.points) {
            // Vignette
            let vignette = 1;
            const minDist = Math.min(p.x, this.width - p.x, p.y, this.height - p.y);
            if (minDist < 0) continue;
            const t = Math.min(minDist / margin, 1);
            vignette = 1 - (1 - t) ** 3;

            const wave = this.usePhysics ? (1 + p.z * 0.15) : 1;
            let size = baseSize * vignette * wave;
            size = Math.min(size, maxSize);

            if (size < 0.5) continue;
            if (size < 1.5) continue;

            ctx.rect(p.x - size / 2, p.y - size / 2, size, size);
        }
        ctx.fill();
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    DITHER_CONFIG.sections.forEach(config => new DitherSection(config));
});
