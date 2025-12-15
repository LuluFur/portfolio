class DitherSection {
    constructor(selector, options = {}) {
        // Accept either a CSS selector string or a direct Element
        if (typeof selector === 'string') {
            this.container = document.querySelector(selector);
        } else if (selector && selector.nodeType === 1) {
            this.container = selector;
        } else {
            this.container = null;
        }

        if (!this.container) return;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.config = Object.assign({
            spacing: 24,
            size: 10,
            color: '#5d5d8a',
            fadeRadius: 1200,
            moveStrength: 30,
            ease: 0.01
        }, options);

        this.width = 0;
        this.height = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.currentX = 0;
        this.currentY = 0;

        // Performance flags
        this.isVisible = false;
        this.isAnimating = false;
        this.animationFrameId = null;

        this.init();
    }

    init() {
        this.canvas.style.position = 'absolute';
        // Expand canvas to prevent clipping during parallax
        this.canvas.style.top = '-50px';
        this.canvas.style.left = '-50px';
        this.canvas.style.width = 'calc(100% + 100px)';
        this.canvas.style.height = 'calc(100% + 100px)';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';

        // Ensure container has relative positioning if not already
        const style = getComputedStyle(this.container);
        if (style.position === 'static') {
            this.container.style.position = 'relative';
        }

        this.container.insertBefore(this.canvas, this.container.firstChild);

        this.resize = this.resize.bind(this);
        this.draw = this.draw.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);

        window.addEventListener('resize', this.resize);
        window.addEventListener('mousemove', this.handleMouseMove);

        // Optimization 1: Intersection Observer to only render when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
                if (this.isVisible) {
                    this.startLoop();
                } else {
                    this.stopLoop();
                }
            });
        }, { threshold: 0 });

        observer.observe(this.container);

        this.resize();
    }

    startLoop() {
        if (!this.isAnimating && this.isVisible) {
            this.isAnimating = true;
            this.draw();
        }
    }

    stopLoop() {
        this.isAnimating = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        // Match the expanded CSS size (container + 100px)
        this.width = rect.width + 100;
        this.height = rect.height + 100;

        // Handle High DPI
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);

        // Force a redraw after resize
        if (this.isVisible) {
            this.renderFrame();
        }
    }

    handleMouseMove(e) {
        if (!this.isVisible) return;

        // Calculate mouse position relative to window center for parallax direction
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        this.targetX = x * this.config.moveStrength;
        this.targetY = y * this.config.moveStrength;

        // Optimization 2: Restart loop if it was idle
        this.startLoop();
    }

    draw() {
        if (!this.isVisible) {
            this.isAnimating = false;
            return;
        }

        // Calculate delta
        const dx = this.targetX - this.currentX;
        const dy = this.targetY - this.currentY;

        // Optimization: Stop if movement is negligible
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
            this.currentX = this.targetX;
            this.currentY = this.targetY;
            this.renderFrame();
            this.isAnimating = false;
            return;
        }

        // Smooth movement
        this.currentX += dx * this.config.ease;
        this.currentY += dy * this.config.ease;

        this.renderFrame();

        this.animationFrameId = requestAnimationFrame(this.draw);
    }

    renderFrame() {
        // Clear
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = this.config.color;

        const cx = this.width / 2;
        const cy = this.height / 2;

        // Grid properties
        const gridSpacing = this.config.spacing; // Fixed spacing

        // Offset grid by current parallax position to create movement
        // We use % gridSpacing to keep the grid "locked" but moving effectively
        const offsetX = this.currentX % gridSpacing;
        const offsetY = this.currentY % gridSpacing;

        // Draw Grid
        this.ctx.beginPath();

        // Expand buffer to cover parallax movement
        const buffer = gridSpacing * 2;

        for (let x = -buffer; x < this.width + buffer; x += gridSpacing) {
            for (let y = -buffer; y < this.height + buffer; y += gridSpacing) {

                // Effective Grid Coordinates (with Parallax)
                const drawX = x + this.currentX;
                const drawY = y + this.currentY;

                // Distance from CENTER of the canvas
                const dist = Math.sqrt((drawX - cx) ** 2 + (drawY - cy) ** 2);

                // Calculate Scale Factor (1.0 at center, 0.0 at fadeRadius)
                let scale = 1 - (dist / this.config.fadeRadius);
                if (scale < 0) continue; // Skip if too far

                // Non-linear fade for better vignette look
                scale = scale * scale;

                // Draw Plus Sign (+)
                // Base size from config, modulated by scale
                const size = this.config.size * scale;
                const halfSize = size / 2;
                const thickness = Math.max(1, size * 0.3); // Dynamic thickness but at least 1px

                // Horizontal arm
                this.ctx.rect(drawX - halfSize, drawY - thickness / 2, size, thickness);
                // Vertical arm
                this.ctx.rect(drawX - thickness / 2, drawY - halfSize, thickness, size);
            }
        }

        this.ctx.fill();
    }
}

// Initialize for sections
document.addEventListener('DOMContentLoaded', () => {
    // Hero Section
    new DitherSection('.hero', {
        color: 'rgba(0, 217, 255, 0.2)', // Cyan tint
        spacing: 30,
        fadeRadius: 1500
    });

    // About Section
    new DitherSection('.about', {
        color: 'rgba(168, 85, 247, 0.2)', // Purple tint
        spacing: 30,
        fadeRadius: 1500
    });

    // Sketches Section
    new DitherSection('.sketches-section', {
        color: 'rgba(255, 107, 107, 0.2)', // Coral tint
        spacing: 30,
        fadeRadius: 1500
    });

    // Programs Section
    new DitherSection('.programs', {
        color: 'rgba(255, 255, 255, 0.2)', // White tint
        spacing: 30,
        fadeRadius: 1500
    });

    // Contact Section
    new DitherSection('.contact', {
        color: 'rgba(0, 217, 255, 0.2)', // Cyan tint again
        spacing: 30,
        fadeRadius: 1500
    });
});
