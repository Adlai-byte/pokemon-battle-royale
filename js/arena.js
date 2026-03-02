// js/arena.js - Canvas arena setup, background rendering, camera
// Supports multiple arena tilesets with offscreen canvas caching

const ARENA_TYPES = [
    {
        name: 'Grassland',
        tile1: '#1e4a12',
        tile2: '#245818',
        gridColor: 'rgba(255, 255, 255, 0.03)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        drawDetail(ctx, w, h) {
            // Grass tuft triangles scattered around
            ctx.fillStyle = '#2d6a1e';
            for (let i = 0; i < 40; i++) {
                const x = (i * 137 + 50) % w;
                const y = (i * 211 + 30) % h;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - 4, y + 8);
                ctx.lineTo(x + 4, y + 8);
                ctx.closePath();
                ctx.fill();
            }
            ctx.fillStyle = '#1a5a0e';
            for (let i = 0; i < 25; i++) {
                const x = (i * 191 + 80) % w;
                const y = (i * 173 + 60) % h;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - 3, y + 6);
                ctx.lineTo(x + 3, y + 6);
                ctx.closePath();
                ctx.fill();
            }
        }
    },
    {
        name: 'Cave',
        tile1: '#1a1a2e',
        tile2: '#222238',
        gridColor: 'rgba(100, 100, 180, 0.04)',
        borderColor: 'rgba(100, 120, 200, 0.2)',
        drawDetail(ctx, w, h) {
            // Rocky edges along borders
            ctx.fillStyle = '#2a2a44';
            for (let i = 0; i < 30; i++) {
                const x = (i * 157) % w;
                const size = 6 + (i % 5) * 3;
                // Top edge rocks
                ctx.fillRect(x, 0, size, size + 2);
                // Bottom edge rocks
                ctx.fillRect(x, h - size - 2, size, size + 2);
            }
            for (let i = 0; i < 20; i++) {
                const y = (i * 193) % h;
                const size = 5 + (i % 4) * 3;
                ctx.fillRect(0, y, size + 2, size);
                ctx.fillRect(w - size - 2, y, size + 2, size);
            }
            // Crystal dots
            ctx.fillStyle = '#6060ff';
            ctx.globalAlpha = 0.4;
            for (let i = 0; i < 15; i++) {
                const x = (i * 223 + 100) % w;
                const y = (i * 179 + 70) % h;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = '#8080ff';
            for (let i = 0; i < 10; i++) {
                const x = (i * 271 + 200) % w;
                const y = (i * 197 + 150) % h;
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
    },
    {
        name: 'Water',
        tile1: '#0e2a48',
        tile2: '#143050',
        gridColor: 'rgba(80, 160, 255, 0.04)',
        borderColor: 'rgba(80, 160, 255, 0.2)',
        drawDetail(ctx, w, h) {
            // Wave lines
            ctx.strokeStyle = 'rgba(100, 180, 255, 0.15)';
            ctx.lineWidth = 2;
            for (let row = 0; row < 8; row++) {
                const y = 60 + row * (h / 8);
                ctx.beginPath();
                for (let x = 0; x < w; x += 4) {
                    const wy = y + Math.sin(x * 0.03 + row * 1.5) * 8;
                    if (x === 0) ctx.moveTo(x, wy);
                    else ctx.lineTo(x, wy);
                }
                ctx.stroke();
            }
            // Lily pads
            ctx.fillStyle = 'rgba(30, 100, 50, 0.3)';
            for (let i = 0; i < 12; i++) {
                const x = (i * 241 + 80) % w;
                const y = (i * 187 + 60) % h;
                ctx.beginPath();
                ctx.ellipse(x, y, 8, 6, 0, 0, Math.PI * 1.7);
                ctx.fill();
            }
        }
    },
    {
        name: 'Indoors',
        tile1: '#2a1a0e',
        tile2: '#342010',
        gridColor: 'rgba(200, 150, 100, 0.05)',
        borderColor: 'rgba(200, 150, 100, 0.2)',
        drawDetail(ctx, w, h) {
            // Floor plank lines (horizontal)
            ctx.strokeStyle = 'rgba(100, 70, 40, 0.3)';
            ctx.lineWidth = 1;
            for (let y = 0; y < h; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
            // Vertical plank joints (staggered)
            for (let y = 0; y < h; y += 40) {
                const offset = (y / 40) % 2 === 0 ? 0 : 60;
                for (let x = offset; x < w; x += 120) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + 40);
                    ctx.stroke();
                }
            }
            // Center pokeball logo
            const cx = w / 2;
            const cy = h / 2;
            ctx.strokeStyle = 'rgba(200, 150, 100, 0.12)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, 80, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx - 80, cy);
            ctx.lineTo(cx + 80, cy);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, 20, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
];

const CUSTOM_THEMES = {
    'neon-night': { bg: '#0a001a', tile1: '#1a0033', tile2: '#0d001a', border: '#ff00ff', accent: '#00ffff', line: '#330066' },
    'classic-green': { bg: '#0a2a0a', tile1: '#0d3d0d', tile2: '#082808', border: '#00ff00', accent: '#88ff88', line: '#1a4a1a' },
    'lava-caves': { bg: '#1a0800', tile1: '#2d0f00', tile2: '#1a0800', border: '#ff4400', accent: '#ff8800', line: '#331100' },
    'frozen-tundra': { bg: '#001a2a', tile1: '#002244', tile2: '#001a33', border: '#44aaff', accent: '#88ccff', line: '#003355' },
};

export class Arena {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 1200;
        this.height = 800;
        this.currentArena = ARENA_TYPES[0];
        this._bgCanvas = null;
        this._bgDirty = true;
        this.camera = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
        this.autoCam = true;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    selectRandomArena() {
        this.currentArena = ARENA_TYPES[Math.floor(Math.random() * ARENA_TYPES.length)];
        this._bgDirty = true;
    }

    setTheme(themeId) {
        this.customTheme = CUSTOM_THEMES[themeId] || null;
        this._renderOffscreenBg();
    }

    resize() {
        const parent = this.canvas.parentElement;
        const w = parent && parent.classList.contains('arena-wrapper')
            ? parent.clientWidth : window.innerWidth;
        const h = parent && parent.classList.contains('arena-wrapper')
            ? parent.clientHeight : window.innerHeight;

        this.canvas.width = w;
        this.canvas.height = h;

        this.scaleX = this.canvas.width / this.width;
        this.scaleY = this.canvas.height / this.height;
        this.scale = Math.min(this.scaleX, this.scaleY);

        this.offsetX = (this.canvas.width - this.width * this.scale) / 2;
        this.offsetY = (this.canvas.height - this.height * this.scale) / 2;
    }

    beginFrame(shakeX = 0, shakeY = 0) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();

        ctx.translate(
            this.offsetX + shakeX * this.scale,
            this.offsetY + shakeY * this.scale
        );
        ctx.scale(this.scale, this.scale);

        // Apply camera transform
        const cx = this.width / 2;
        const cy = this.height / 2;
        ctx.translate(cx, cy);
        ctx.scale(this.camera.zoom, this.camera.zoom);
        ctx.translate(-this.camera.x - cx, -this.camera.y - cy);

        this._drawBackground(ctx);
    }

    endFrame() {
        this.ctx.restore();
    }

    updateCamera(dt) {
        const lerp = Math.min(1, dt * 0.002);
        this.camera.x += (this.camera.targetX - this.camera.x) * lerp;
        this.camera.y += (this.camera.targetY - this.camera.y) * lerp;
        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * lerp;
    }

    resetCamera() {
        this.camera = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
    }

    _renderOffscreenBg() {
        if (!this._bgCanvas) {
            this._bgCanvas = document.createElement('canvas');
        }
        this._bgCanvas.width = this.width;
        this._bgCanvas.height = this.height;
        const ctx = this._bgCanvas.getContext('2d');
        const arena = this.currentArena;

        // If a custom theme is active, use its colors; otherwise use the arena tileset
        const palette = this.customTheme
            ? { tile1: this.customTheme.tile1, tile2: this.customTheme.tile2, borderColor: this.customTheme.border, gridColor: this.customTheme.line }
            : arena;

        // Checkerboard tiles
        const tileSize = 40;
        for (let y = 0; y < this.height; y += tileSize) {
            for (let x = 0; x < this.width; x += tileSize) {
                const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
                ctx.fillStyle = isAlt ? palette.tile1 : palette.tile2;
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }

        // Arena border
        ctx.strokeStyle = palette.borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, this.width - 20, this.height - 20);

        // Grid lines
        ctx.strokeStyle = palette.gridColor;
        ctx.lineWidth = 1;
        const gridSize = 80;
        for (let x = gridSize; x < this.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = gridSize; y < this.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }

        // Center circle
        ctx.strokeStyle = palette.borderColor;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, 150, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Detail decorations
        arena.drawDetail(ctx, this.width, this.height);

        this._bgDirty = false;
    }

    _drawBackground(ctx) {
        if (this._bgDirty || !this._bgCanvas) {
            this._renderOffscreenBg();
        }
        ctx.drawImage(this._bgCanvas, 0, 0);
    }
}
