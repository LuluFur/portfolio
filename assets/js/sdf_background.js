/**
 * =============================================================================
 * SDF INTERACTABLE BACKGROUND
 * WebGL-based Signed Distance Field renderer.
 * Features:
 * - 3 Interactable shapes (Circle, Box, Equilateral Triangle).
 * - Smooth blending (smin) between shapes.
 * - Blueprint/Tech aesthetic with grid.
 * - Focus Mode: Hides page content when interacting.
 * =============================================================================
 */

const SDF_VS = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

const SDF_FS = `
    precision highp float;
    
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec2 u_shapes[3]; 
    uniform int u_active_shape;
    uniform float u_pixel_ratio;

    // --- SDF FUNCTIONS ---

    float sdCircle(vec2 p, float r) {
        return length(p) - r;
    }

    float sdBox(vec2 p, vec2 b) {
        vec2 d = abs(p) - b;
        return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    }

    float sdEquilateralTriangle(vec2 p, float r) {
        const float k = sqrt(3.0);
        p.x = abs(p.x) - 1.0;
        p.y = p.y + 1.0/k;
        if(p.x+k*p.y>0.0) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
        p.x -= clamp(p.x, -2.0, 0.0);
        return -length(p)*sign(p.y);
    }

    mat2 rotate2d(float angle) {
        return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    }

    // Return vec3(distance, mix_factor) triggers strict type error in GLSL ES 1.0
    // So we manually blend in main() locally.

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
        
        // 1. GRID BACKGROUND
        float gridSize = 0.15;
        vec2 gridUv = fract(uv / gridSize) - 0.5;
        float distToGrid = min(abs(gridUv.x), abs(gridUv.y)) * gridSize;
        float gridLine = 1.0 - smoothstep(0.0, 2.0 / u_resolution.y, distToGrid);
        
        vec3 bgColor = vec3(0.05, 0.1, 0.15); 
        bgColor += vec3(0.0, 0.2, 0.4) * gridLine * 0.2;

        // 2. SHAPE DEFINITIONS
        
        // Shape 1: Circle (Cyan)
        vec2 p1 = uv - (u_shapes[0] - 0.5 * u_resolution.xy) / u_resolution.y;
        float d1 = sdCircle(p1, 0.12);
        vec3 c1 = vec3(0.0, 0.85, 1.0); // Cyan

        // Shape 2: Box (Purple)
        vec2 p2 = uv - (u_shapes[1] - 0.5 * u_resolution.xy) / u_resolution.y;
        p2 = rotate2d(u_time * 0.1) * p2;
        float d2 = sdBox(p2, vec2(0.1, 0.1));
        vec3 c2 = vec3(0.66, 0.33, 0.96); // Purple

        // Shape 3: Triangle (Coral)
        vec2 p3 = uv - (u_shapes[2] - 0.5 * u_resolution.xy) / u_resolution.y;
        p3 = rotate2d(-u_time * 0.15) * p3; 
        float d3 = sdEquilateralTriangle(p3 * 6.0, 1.0) / 6.0; 
        vec3 c3 = vec3(1.0, 0.42, 0.42); // Coral

        // 3. SMOOTH BLENDING
        float k = 0.15; // Blend radius

        // Blend S1 & S2
        float h1 = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
        float d12 = mix(d2, d1, h1) - k * h1 * (1.0 - h1);
        vec3 col12 = mix(c2, c1, h1);

        // Blend Result & S3
        float h2 = clamp(0.5 + 0.5 * (d3 - d12) / k, 0.0, 1.0);
        float finalD = mix(d3, d12, h2) - k * h2 * (1.0 - h2);
        vec3 finalCol = mix(c3, col12, h2);

        // 4. RENDER
        
        float fillMask = 1.0 - smoothstep(0.0, 2.0 / u_resolution.y, finalD);
        float glow = exp(-20.0 * abs(finalD));
        float outline = 1.0 - smoothstep(0.003, 0.006, abs(finalD));

        vec3 color = bgColor;
        color += finalCol * fillMask * 0.2; 
        color += finalCol * glow * 0.6;     
        color += vec3(1.0) * outline * 0.8; 

        // Slight brightness boost on interaction (global)
        if (u_active_shape != -1) {
            color += finalCol * 0.1;
        }

        gl_FragColor = vec4(color, 1.0);
    }
`;

class SDFBackground {
    constructor() {
        this.canvas = document.getElementById('sdf-canvas');
        if (!this.canvas) return;

        // PERF: Only run heavy SDF shaders on Desktop
        // "Mobile" here implies touch devices or non-fine pointers
        this.isDesktop = window.matchMedia('(pointer: fine)').matches && !('ontouchstart' in window);

        if (!this.isDesktop) {
            return;
        }

        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            console.error("WebGL not supported");
            return;
        }

        // State
        // Store percentage positions (px, py) to maintain relative layout on resize
        // 0.0 to 1.0 relative to screen width/height.
        this.shapes = [
            { px: 0.05, py: 0.05, type: 'circle', radius: 40 },    // Blue Circle: Top Left
            { px: 0.95, py: 0.5, type: 'box', size: 40 },         // Purple Square: Middle Right
            { px: 0.05, py: 0.95, type: 'triangle', size: 40 }     // Red Triangle: Bottom Left
        ];

        this.mouse = { x: 0, y: 0 };
        this.draggedShapeIndex = -1;
        this.isInteracting = false;

        this.startTime = performance.now();

        // Setup WebGL
        this.program = this.createProgram(SDF_VS, SDF_FS);
        this.locations = {
            position: this.gl.getAttribLocation(this.program, 'position'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
            shapes: this.gl.getUniformLocation(this.program, 'u_shapes'),
            activeShape: this.gl.getUniformLocation(this.program, 'u_active_shape'),
        };

        this.initBuffers();
        this.resize();
        this.addListeners();
        this.animate();
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(vsSource, fsSource) {
        const vs = this.createShader(this.gl.VERTEX_SHADER, vsSource);
        const fs = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error(this.gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    initBuffers() {
        const positions = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]);
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.locations.position);
        this.gl.vertexAttribPointer(this.locations.position, 2, this.gl.FLOAT, false, 0, 0);
    }

    resize() {
        // Handle High DPI
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Device Detection (Simple pointer check)
        this.isDesktop = window.matchMedia('(pointer: fine)').matches && !('ontouchstart' in window);

        const w = window.innerWidth;
        const h = window.innerHeight;

        // Update shape positions based on stored percentages
        this.shapes.forEach(s => {
            s.x = w * s.px;
            s.y = h * s.py;
        });
    }

    addListeners() {
        window.addEventListener('resize', () => this.resize());

        // Global pointer events to catch drags initiated on shapes
        window.addEventListener('pointerdown', (e) => this.handleDown(e));
        window.addEventListener('pointermove', (e) => this.handleMove(e));
        window.addEventListener('pointerup', () => this.handleUp());
    }

    // Interaction Logic (Simple JS Circle Check for Hit Testing)
    // We map shader space (bottom-left 0,0) to screen space (top-left 0,0) carefully.
    // Shader uses gl_FragCoord which is bottom-left. 
    // Mouse/Touch events are top-left.
    // We'll store shape positions in top-left screen coords (px) for easier DOM mapping,
    // and flip Y when passing to shader.

    handleDown(e) {
        // 0. Disable interaction on non-desktop
        if (!this.isDesktop) return;

        // 1. Prioritize Interaction: Ignore if clicking buttons, links, inputs.
        const target = e.target;
        const tag = target.tagName;

        // Check for specific interactive tags or overrides
        const interactiveTags = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL'];
        if (interactiveTags.includes(tag) || target.closest('a, button, label')) {
            return;
        }

        // REMOVED: Text content checks (cursor:text, P/H1 tags etc.)
        // This allows dragging to start even if clicking on text, unless it's a button/link.

        const mx = e.clientX;
        const my = e.clientY;

        // Hit test
        const hitRadius = 60;

        for (let i = 0; i < this.shapes.length; i++) {
            const s = this.shapes[i];
            const dx = mx - s.x;
            const dy = my - s.y;
            if (dx * dx + dy * dy < hitRadius * hitRadius) {
                this.draggedShapeIndex = i;
                this.isInteracting = true;
                this.enableFocusMode();
                this.canvas.style.cursor = 'grabbing';
                e.preventDefault(); // Prevent text selection/image drag
                break;
            }
        }
    }

    handleMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        if (this.draggedShapeIndex !== -1) {
            const s = this.shapes[this.draggedShapeIndex];
            s.x = e.clientX;
            s.y = e.clientY;

            // Update percentage positions so they persist correctly on resize
            s.px = s.x / window.innerWidth;
            s.py = s.y / window.innerHeight;

            e.preventDefault(); // Prevent scroll/selection while dragging
        }
    }

    handleUp() {
        if (this.draggedShapeIndex !== -1) {
            this.draggedShapeIndex = -1;
            this.isInteracting = false;
            this.disableFocusMode();
            this.canvas.style.cursor = 'default';
        }
    }

    enableFocusMode() {
        document.body.classList.add('focus-mode');
    }

    disableFocusMode() {
        document.body.classList.remove('focus-mode');
    }

    animate() {
        const time = (performance.now() - this.startTime) / 1000;
        const dpr = window.devicePixelRatio || 1;

        this.gl.uniform2f(this.locations.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.locations.time, time);

        // Convert mouse top-left to bottom-left for shader
        this.gl.uniform2f(this.locations.mouse, this.mouse.x * dpr, (window.innerHeight - this.mouse.y) * dpr);

        // Flatten shape positions and convert Y
        // uniform vec2 u_shapes[3]
        const shapeData = [];
        for (let s of this.shapes) {
            shapeData.push(s.x * dpr);
            shapeData.push((window.innerHeight - s.y) * dpr);
        }
        this.gl.uniform2fv(this.locations.shapes, new Float32Array(shapeData));
        this.gl.uniform1i(this.locations.activeShape, this.draggedShapeIndex);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        requestAnimationFrame(() => this.animate());
    }
}

// Init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new SDFBackground();
});
