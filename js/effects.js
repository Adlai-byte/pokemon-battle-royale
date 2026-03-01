// js/effects.js - Particle system for battle effects
import { TYPE_COLORS } from './data.js';

class Particle {
    constructor(x, y, vx, vy, color, size, life, gravity = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        this.gravity = gravity;
        this.alive = true;
    }

    update(dt) {
        const t = dt / 16;
        this.x += this.vx * t;
        this.y += this.vy * t;
        this.vy += this.gravity * t;
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Beam effect - a line of particles from source to target that fades
class BeamEffect {
    constructor(x1, y1, x2, y2, color1, color2, width) {
        this.x1 = x1; this.y1 = y1;
        this.x2 = x2; this.y2 = y2;
        this.color1 = color1;
        this.color2 = color2;
        this.width = width;
        this.life = 350;
        this.maxLife = 350;
        this.alive = true;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        const fadeWidth = this.width * (0.5 + alpha * 0.5);
        ctx.save();
        ctx.globalAlpha = alpha;
        // Glow layer
        ctx.strokeStyle = this.color2;
        ctx.lineWidth = fadeWidth + 6;
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        // Core beam
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = this.color1;
        ctx.lineWidth = fadeWidth;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        // Bright center
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1, fadeWidth * 0.3);
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        ctx.restore();
    }
}

// Expanding ring effect for wave/AOE animations
class RingEffect {
    constructor(x, y, color, maxRadius) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.maxRadius = maxRadius;
        this.life = 500;
        this.maxLife = 500;
        this.alive = true;
    }

    update(dt) {
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }

    draw(ctx) {
        const progress = 1 - this.life / this.maxLife;
        const alpha = Math.max(0, 1 - progress);
        const radius = this.maxRadius * progress;
        ctx.save();
        ctx.globalAlpha = alpha * 0.6;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4 * (1 - progress) + 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.15;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class DamageNumber {
    constructor(x, y, damage, color) {
        this.x = x;
        this.y = y;
        this.damage = Math.round(damage);
        this.color = color;
        this.life = 1000;
        this.maxLife = 1000;
        this.vy = -1.5;
        this.alive = true;
    }

    update(dt) {
        this.y += this.vy * (dt / 16);
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeText(`-${this.damage}`, this.x, this.y);
        ctx.fillText(`-${this.damage}`, this.x, this.y);
        ctx.restore();
    }
}

class MoveLabel {
    constructor(x, y, text, typeColor) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = typeColor;
        this.life = 1200;
        this.maxLife = 1200;
        this.vy = -0.8;
        this.alive = true;
    }

    update(dt) {
        this.y += this.vy * (dt / 16);
        this.life -= dt;
        if (this.life <= 0) this.alive = false;
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        const scale = 0.8 + (1 - alpha) * 0.3; // Slight grow as it fades
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${Math.round(12 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        // Background pill
        const metrics = ctx.measureText(this.text);
        const pw = metrics.width + 10;
        const ph = 16;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.roundRect(this.x - pw / 2, this.y - ph / 2 - 2, pw, ph, 4);
        ctx.fill();
        // Text
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y + 4);
        ctx.restore();
    }
}

export class EffectsManager {
    constructor() {
        this.particles = [];
        this.damageNumbers = [];
        this.moveLabels = [];
        this.beams = [];
        this.rings = [];
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (!this.particles[i].alive) this.particles.splice(i, 1);
        }

        for (let i = this.beams.length - 1; i >= 0; i--) {
            this.beams[i].update(dt);
            if (!this.beams[i].alive) this.beams.splice(i, 1);
        }

        for (let i = this.rings.length - 1; i >= 0; i--) {
            this.rings[i].update(dt);
            if (!this.rings[i].alive) this.rings.splice(i, 1);
        }

        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            this.damageNumbers[i].update(dt);
            if (!this.damageNumbers[i].alive) this.damageNumbers.splice(i, 1);
        }

        for (let i = this.moveLabels.length - 1; i >= 0; i--) {
            this.moveLabels[i].update(dt);
            if (!this.moveLabels[i].alive) this.moveLabels.splice(i, 1);
        }

        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= dt;
            const factor = this.screenShake.duration > 0 ? this.screenShake.intensity : 0;
            this.screenShake.x = (Math.random() - 0.5) * factor;
            this.screenShake.y = (Math.random() - 0.5) * factor;
        } else {
            this.screenShake.x = 0;
            this.screenShake.y = 0;
        }
    }

    draw(ctx) {
        for (const b of this.beams) b.draw(ctx);
        for (const r of this.rings) r.draw(ctx);
        for (const p of this.particles) p.draw(ctx);
        ctx.globalAlpha = 1;
        for (const d of this.damageNumbers) d.draw(ctx);
        for (const m of this.moveLabels) m.draw(ctx);
    }

    spawnAttackEffect(x, y, type) {
        const colors = TYPE_COLORS[type] || TYPE_COLORS.normal;
        const count = 12;

        switch (type) {
            case 'fire':
                for (let i = 0; i < count; i++) {
                    this.particles.push(new Particle(
                        x + (Math.random() - 0.5) * 20,
                        y + (Math.random() - 0.5) * 20,
                        (Math.random() - 0.5) * 3,
                        -Math.random() * 4 - 1,
                        Math.random() > 0.5 ? colors.primary : colors.secondary,
                        Math.random() * 6 + 3,
                        500 + Math.random() * 300,
                        -0.1
                    ));
                }
                break;

            case 'water':
                for (let i = 0; i < count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 4 + 2;
                    this.particles.push(new Particle(
                        x, y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        Math.random() > 0.5 ? colors.primary : colors.secondary,
                        Math.random() * 5 + 2,
                        400 + Math.random() * 200,
                        0.15
                    ));
                }
                break;

            case 'electric':
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    this.particles.push(new Particle(
                        x, y,
                        Math.cos(angle) * 6,
                        Math.sin(angle) * 6,
                        colors.primary,
                        Math.random() * 3 + 2,
                        250 + Math.random() * 150
                    ));
                    this.particles.push(new Particle(
                        x + Math.cos(angle) * 15,
                        y + Math.sin(angle) * 15,
                        Math.cos(angle + 0.5) * 3,
                        Math.sin(angle + 0.5) * 3,
                        colors.secondary,
                        2,
                        200
                    ));
                }
                break;

            case 'grass':
                for (let i = 0; i < count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    this.particles.push(new Particle(
                        x, y,
                        Math.cos(angle) * (Math.random() * 3 + 1),
                        Math.sin(angle) * (Math.random() * 3 + 1) - 1,
                        Math.random() > 0.5 ? colors.primary : colors.secondary,
                        Math.random() * 5 + 2,
                        600 + Math.random() * 300,
                        -0.05
                    ));
                }
                break;

            case 'psychic':
                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 2;
                    const radius = 20 + Math.random() * 10;
                    this.particles.push(new Particle(
                        x + Math.cos(angle) * radius,
                        y + Math.sin(angle) * radius,
                        Math.cos(angle) * 1.5,
                        Math.sin(angle) * 1.5,
                        colors.primary,
                        Math.random() * 4 + 2,
                        500 + Math.random() * 200
                    ));
                }
                break;

            case 'ice':
                for (let i = 0; i < count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    this.particles.push(new Particle(
                        x + (Math.random() - 0.5) * 30,
                        y + (Math.random() - 0.5) * 30,
                        Math.cos(angle) * 2,
                        Math.sin(angle) * 2,
                        Math.random() > 0.5 ? colors.primary : '#ffffff',
                        Math.random() * 4 + 2,
                        600 + Math.random() * 300
                    ));
                }
                break;

            case 'ghost':
                for (let i = 0; i < 8; i++) {
                    this.particles.push(new Particle(
                        x + (Math.random() - 0.5) * 30,
                        y + (Math.random() - 0.5) * 30,
                        (Math.random() - 0.5) * 2,
                        -Math.random() * 2,
                        colors.primary,
                        Math.random() * 6 + 3,
                        700 + Math.random() * 400,
                        -0.03
                    ));
                }
                break;

            case 'poison':
                for (let i = 0; i < count; i++) {
                    this.particles.push(new Particle(
                        x + (Math.random() - 0.5) * 25,
                        y + (Math.random() - 0.5) * 25,
                        (Math.random() - 0.5) * 2,
                        -Math.random() * 3 - 0.5,
                        Math.random() > 0.5 ? colors.primary : colors.secondary,
                        Math.random() * 5 + 3,
                        500 + Math.random() * 300,
                        -0.08
                    ));
                }
                break;

            case 'fighting':
                for (let i = 0; i < count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 5 + 3;
                    this.particles.push(new Particle(
                        x, y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        Math.random() > 0.5 ? colors.primary : '#ffffff',
                        Math.random() * 4 + 2,
                        300 + Math.random() * 200,
                        0.1
                    ));
                }
                break;

            case 'ground':
                for (let i = 0; i < count; i++) {
                    this.particles.push(new Particle(
                        x + (Math.random() - 0.5) * 40,
                        y + Math.random() * 10,
                        (Math.random() - 0.5) * 4,
                        -Math.random() * 5 - 2,
                        Math.random() > 0.5 ? colors.primary : colors.secondary,
                        Math.random() * 5 + 3,
                        500 + Math.random() * 300,
                        0.2
                    ));
                }
                break;

            case 'rock':
                for (let i = 0; i < 8; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 3 + 1;
                    this.particles.push(new Particle(
                        x, y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed - 2,
                        Math.random() > 0.5 ? colors.primary : '#8B7355',
                        Math.random() * 6 + 4,
                        400 + Math.random() * 200,
                        0.25
                    ));
                }
                break;

            case 'flying':
                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 2;
                    this.particles.push(new Particle(
                        x + Math.cos(angle) * 15,
                        y + Math.sin(angle) * 15,
                        Math.cos(angle) * 3,
                        Math.sin(angle) * 3 - 2,
                        Math.random() > 0.5 ? colors.primary : '#ffffff',
                        Math.random() * 3 + 2,
                        400 + Math.random() * 200,
                        -0.1
                    ));
                }
                break;

            case 'dragon':
                for (let i = 0; i < count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 5 + 2;
                    this.particles.push(new Particle(
                        x, y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        Math.random() > 0.5 ? colors.primary : colors.secondary,
                        Math.random() * 5 + 3,
                        500 + Math.random() * 300,
                        0.05
                    ));
                }
                break;

            case 'bug':
                for (let i = 0; i < count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    this.particles.push(new Particle(
                        x, y,
                        Math.cos(angle) * (Math.random() * 3 + 1),
                        Math.sin(angle) * (Math.random() * 3 + 1),
                        Math.random() > 0.5 ? colors.primary : colors.secondary,
                        Math.random() * 3 + 2,
                        400 + Math.random() * 200,
                        0.05
                    ));
                }
                break;

            default:
                for (let i = 0; i < count; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 4 + 2;
                    this.particles.push(new Particle(
                        x, y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        Math.random() > 0.5 ? '#ffffff' : '#ffeeaa',
                        Math.random() * 4 + 2,
                        350 + Math.random() * 200,
                        0.1
                    ));
                }
        }
    }

    spawnEliminationBurst(x, y, types) {
        const colors = TYPE_COLORS[types[0]] || TYPE_COLORS.normal;
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = Math.random() * 6 + 3;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.random() > 0.3 ? colors.primary : colors.secondary,
                Math.random() * 5 + 3,
                600 + Math.random() * 400,
                0.08
            ));
        }
    }

    spawnConfetti(x, y) {
        const confettiColors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff', '#f5a623'];
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * 100,
                y - 50,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 3,
                confettiColors[Math.floor(Math.random() * confettiColors.length)],
                Math.random() * 5 + 3,
                2000 + Math.random() * 1000,
                0.15
            ));
        }
    }

    addDamageNumber(x, y, damage, superEffective) {
        const color = superEffective ? '#ff4444' : '#ffffff';
        this.damageNumbers.push(new DamageNumber(
            x + (Math.random() - 0.5) * 20,
            y - 30,
            damage,
            color
        ));
    }

    shake(intensity = 8, duration = 200) {
        // Disabled for now
    }

    // Floating move name label
    addMoveLabel(x, y, moveName, moveType) {
        const colors = TYPE_COLORS[moveType] || TYPE_COLORS.normal;
        this.moveLabels.push(new MoveLabel(
            x + (Math.random() - 0.5) * 10,
            y,
            moveName,
            colors.primary
        ));
    }

    // Defense sparkle ring
    spawnDefenseEffect(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const radius = 30;
            this.particles.push(new Particle(
                x + Math.cos(angle) * radius,
                y + Math.sin(angle) * radius,
                Math.cos(angle) * 0.5,
                Math.sin(angle) * 0.5,
                Math.random() > 0.5 ? '#88ccff' : '#aaeeff',
                Math.random() * 3 + 2,
                600 + Math.random() * 200
            ));
        }
    }

    // Buff arrows rising
    spawnBuffEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 1,
                -Math.random() * 3 - 1.5,
                Math.random() > 0.5 ? '#ffdd44' : '#ffaa22',
                Math.random() * 4 + 2,
                500 + Math.random() * 300,
                -0.05
            ));
        }
    }

    // Beam animation: line from attacker to defender with trailing particles
    spawnBeam(x1, y1, x2, y2, type) {
        const colors = TYPE_COLORS[type] || TYPE_COLORS.normal;
        this.beams.push(new BeamEffect(x1, y1, x2, y2, colors.primary, colors.secondary, 5));

        // Trail particles along the beam
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(dist / 12);
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const px = x1 + dx * t;
            const py = y1 + dy * t;
            const perpX = -dy / dist;
            const perpY = dx / dist;
            this.particles.push(new Particle(
                px + perpX * (Math.random() - 0.5) * 10,
                py + perpY * (Math.random() - 0.5) * 10,
                perpX * (Math.random() - 0.5) * 2,
                perpY * (Math.random() - 0.5) * 2,
                Math.random() > 0.4 ? colors.primary : colors.secondary,
                Math.random() * 3 + 2,
                200 + Math.random() * 200
            ));
        }

        // Impact burst at target
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push(new Particle(
                x2, y2,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                colors.primary,
                Math.random() * 4 + 2,
                300 + Math.random() * 200,
                0.05
            ));
        }
    }

    // Projectile: cluster of particles traveling from source to target
    spawnProjectile(x1, y1, x2, y2, type) {
        const colors = TYPE_COLORS[type] || TYPE_COLORS.normal;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 8;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;
        const travelTime = (dist / speed) * 16; // approximate life in ms

        // Core projectile particles
        for (let i = 0; i < 6; i++) {
            this.particles.push(new Particle(
                x1 + (Math.random() - 0.5) * 8,
                y1 + (Math.random() - 0.5) * 8,
                vx + (Math.random() - 0.5) * 1.5,
                vy + (Math.random() - 0.5) * 1.5,
                Math.random() > 0.5 ? colors.primary : colors.secondary,
                Math.random() * 5 + 4,
                travelTime + 50
            ));
        }

        // Trailing particles (slower, fade faster)
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(
                x1 + (Math.random() - 0.5) * 12,
                y1 + (Math.random() - 0.5) * 12,
                vx * 0.7 + (Math.random() - 0.5) * 2,
                vy * 0.7 + (Math.random() - 0.5) * 2,
                colors.secondary,
                Math.random() * 3 + 2,
                travelTime * 0.6
            ));
        }

        // Delayed impact burst (approximated with high-speed particles starting midway)
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const burstSpeed = Math.random() * 3 + 1;
            this.particles.push(new Particle(
                x2 + (Math.random() - 0.5) * 10,
                y2 + (Math.random() - 0.5) * 10,
                Math.cos(angle) * burstSpeed,
                Math.sin(angle) * burstSpeed,
                colors.primary,
                Math.random() * 4 + 3,
                300 + Math.random() * 200,
                0.08
            ));
        }
    }

    // Explosion: expanding burst at target position
    spawnExplosion(x, y, type) {
        const colors = TYPE_COLORS[type] || TYPE_COLORS.normal;

        // Expanding ring
        this.rings.push(new RingEffect(x, y, colors.primary, 60));

        // Central flash
        this.particles.push(new Particle(
            x, y, 0, 0, '#ffffff', 20, 200
        ));

        // Explosion particles burst outward
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.3;
            const speed = Math.random() * 5 + 3;
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * 10,
                y + (Math.random() - 0.5) * 10,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.random() > 0.4 ? colors.primary : colors.secondary,
                Math.random() * 6 + 3,
                400 + Math.random() * 300,
                0.08
            ));
        }

        // Smoke/debris particles
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 2,
                -Math.random() * 2 - 0.5,
                'rgba(80, 80, 80, 0.8)',
                Math.random() * 5 + 4,
                500 + Math.random() * 300,
                -0.03
            ));
        }

        this.shake(12, 300);
    }

    // Wave: expanding ring centered on the attacker (for AOE like Earthquake, Surf)
    spawnWave(x, y, type) {
        const colors = TYPE_COLORS[type] || TYPE_COLORS.normal;

        // Multiple expanding rings staggered
        this.rings.push(new RingEffect(x, y, colors.primary, 120));
        // Second ring slightly delayed effect via smaller max radius
        this.rings.push(new RingEffect(x, y, colors.secondary, 90));

        // Ground/surface particles spreading outward
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = Math.random() * 4 + 3;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.random() > 0.5 ? colors.primary : colors.secondary,
                Math.random() * 4 + 3,
                500 + Math.random() * 200,
                type === 'ground' ? 0.15 : -0.02
            ));
        }

        // Extra detail particles for specific types
        if (type === 'water') {
            for (let i = 0; i < 12; i++) {
                const angle = Math.random() * Math.PI * 2;
                this.particles.push(new Particle(
                    x + Math.cos(angle) * 30,
                    y + Math.sin(angle) * 30,
                    Math.cos(angle) * 2,
                    -Math.random() * 3 - 1,
                    '#98D8F8',
                    Math.random() * 3 + 2,
                    400,
                    0.15
                ));
            }
        } else if (type === 'ground') {
            for (let i = 0; i < 12; i++) {
                this.particles.push(new Particle(
                    x + (Math.random() - 0.5) * 60,
                    y + (Math.random() - 0.5) * 30,
                    (Math.random() - 0.5) * 3,
                    -Math.random() * 4 - 2,
                    '#8B7355',
                    Math.random() * 5 + 3,
                    400 + Math.random() * 200,
                    0.25
                ));
            }
        }

        this.shake(8, 250);
    }

    // Evolution effect: white expanding rings + golden sparkle burst
    spawnEvolutionEffect(x, y) {
        // White expanding rings
        this.rings.push(new RingEffect(x, y, '#ffffff', 80));
        this.rings.push(new RingEffect(x, y, '#ffd700', 60));

        // Golden sparkle burst
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.random() > 0.5 ? '#ffd700' : '#ffffff',
                Math.random() * 5 + 3,
                600 + Math.random() * 400,
                -0.05
            ));
        }

        // Inner white flash
        this.particles.push(new Particle(x, y, 0, 0, '#ffffff', 25, 300));

        this.shake(10, 300);
    }

    // Focus Sash save effect
    spawnFocusSashEffect(x, y) {
        this.rings.push(new RingEffect(x, y, '#ffffff', 50));
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            this.particles.push(new Particle(
                x + Math.cos(angle) * 20,
                y + Math.sin(angle) * 20,
                Math.cos(angle) * 1,
                Math.sin(angle) * 1,
                '#ffffff',
                Math.random() * 3 + 2,
                400 + Math.random() * 200
            ));
        }
    }

    // Fly swooping trail - wind streaks from attacker toward target
    spawnFlyTrail(x1, y1, x2, y2) {
        // Rising wind particles at start
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(
                x1 + (Math.random() - 0.5) * 30,
                y1 + (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 2,
                -Math.random() * 4 - 2,
                Math.random() > 0.5 ? '#aaddff' : '#ffffff',
                Math.random() * 3 + 2,
                500 + Math.random() * 200,
                -0.1
            ));
        }
        // Swooping trail particles from sky to target
        const dx = x2 - x1;
        const dy = y2 - y1;
        for (let i = 0; i < 12; i++) {
            const t = i / 12;
            const px = x1 + dx * t;
            const py = (y1 - 80) + (y2 - y1 + 80) * t * t; // Arc path
            this.particles.push(new Particle(
                px + (Math.random() - 0.5) * 15,
                py + (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                Math.random() > 0.5 ? '#aaddff' : '#eeeeff',
                Math.random() * 3 + 1,
                300 + t * 300,
                -0.05
            ));
        }
        // Impact burst at target
        this.rings.push(new RingEffect(x2, y2, '#aaddff', 50));
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            this.particles.push(new Particle(
                x2, y2,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.random() > 0.5 ? '#ffffff' : '#aaddff',
                Math.random() * 4 + 2,
                300 + Math.random() * 200,
                0.1
            ));
        }
    }

    // Slash: X pattern of particles
    spawnSlash(x, y, type) {
        const colors = TYPE_COLORS[type] || TYPE_COLORS.normal;
        // 16 particles in X pattern
        for (let i = 0; i < 16; i++) {
            const angle = (i < 8)
                ? (Math.PI / 4 + (i / 8) * Math.PI)   // Top-left to bottom-right
                : (3 * Math.PI / 4 + ((i - 8) / 8) * Math.PI); // Top-right to bottom-left
            const speed = 3 + Math.random() * 3;
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * 10,
                y + (Math.random() - 0.5) * 10,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.random() > 0.5 ? colors.primary : '#ffffff',
                Math.random() * 4 + 2,
                300 + Math.random() * 200
            ));
        }
        // Central flash
        this.particles.push(new Particle(x, y, 0, 0, '#ffffff', 12, 150));
    }

    // Punch: central flash + ring + radial starburst
    spawnPunch(x, y, type) {
        const colors = TYPE_COLORS[type] || TYPE_COLORS.normal;
        // Central white flash
        this.particles.push(new Particle(x, y, 0, 0, '#ffffff', 18, 200));
        // Ring effect
        this.rings.push(new RingEffect(x, y, colors.primary, 40));
        // 8 radial star-burst particles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 4 + Math.random() * 2;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                Math.random() > 0.5 ? colors.primary : '#ffffff',
                Math.random() * 5 + 3,
                250 + Math.random() * 150,
                0.05
            ));
        }
    }

    // Drain: orbs travel from defender to attacker
    spawnDrainEffect(ax, ay, dx, dy, type) {
        const colors = TYPE_COLORS[type] || TYPE_COLORS.normal;
        const drainColor = type === 'psychic' ? '#cc66ff' : '#66ff66';
        for (let i = 0; i < 8; i++) {
            const vx = (ax - dx) * (0.008 + Math.random() * 0.006);
            const vy = (ay - dy) * (0.008 + Math.random() * 0.006);
            this.particles.push(new Particle(
                dx + (Math.random() - 0.5) * 20,
                dy + (Math.random() - 0.5) * 20,
                vx * 16 + (Math.random() - 0.5) * 1,
                vy * 16 + (Math.random() - 0.5) * 1,
                Math.random() > 0.5 ? drainColor : colors.primary,
                Math.random() * 4 + 3,
                600 + Math.random() * 300,
                -0.02
            ));
        }
    }

    // Status inflict: themed ring + particles
    spawnStatusInflict(x, y, statusType) {
        const configs = {
            sleep:    { color: '#9090ff', ringColor: '#6060cc' },
            paralyze: { color: '#F8D030', ringColor: '#c0a020' },
            poison:   { color: '#A040A0', ringColor: '#803080' },
            toxic:    { color: '#A040A0', ringColor: '#602060' },
            confuse:  { color: '#ff6090', ringColor: '#cc4070' },
            burn:     { color: '#F08030', ringColor: '#c06020' },
            freeze:   { color: '#98D8D8', ringColor: '#70b0b0' },
        };
        const cfg = configs[statusType] || { color: '#ffffff', ringColor: '#cccccc' };
        this.rings.push(new RingEffect(x, y, cfg.ringColor, 35));
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const speed = 1.5 + Math.random() * 2;
            this.particles.push(new Particle(
                x + Math.cos(angle) * 15,
                y + Math.sin(angle) * 15,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - (statusType === 'sleep' ? 1.5 : 0),
                cfg.color,
                Math.random() * 3 + 2,
                400 + Math.random() * 200,
                statusType === 'sleep' ? -0.05 : 0.02
            ));
        }
    }

    // Item pickup sparkle
    spawnItemPickupEffect(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 1,
                color,
                Math.random() * 3 + 2,
                400 + Math.random() * 200,
                -0.05
            ));
        }
    }

    // Continuous status effect particles (call each frame for affected Pokemon)
    spawnStatusParticles(x, y, status, dt) {
        // Only spawn periodically (roughly every 200ms worth of dt)
        if (Math.random() > dt / 200) return;

        switch (status) {
            case 'burn':
                this.particles.push(new Particle(
                    x + (Math.random() - 0.5) * 20,
                    y + (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 0.5,
                    -Math.random() * 2 - 0.5,
                    Math.random() > 0.5 ? '#F08030' : '#FFD700',
                    Math.random() * 3 + 2,
                    400 + Math.random() * 200,
                    -0.06
                ));
                break;
            case 'poison':
            case 'toxic':
                this.particles.push(new Particle(
                    x + (Math.random() - 0.5) * 16,
                    y + Math.random() * 5,
                    (Math.random() - 0.5) * 0.5,
                    -Math.random() * 1.5 - 0.3,
                    Math.random() > 0.5 ? '#A040A0' : '#D080D0',
                    Math.random() * 3 + 2,
                    500 + Math.random() * 200,
                    -0.04
                ));
                break;
            case 'paralyze':
                // Small electric sparks
                for (let i = 0; i < 2; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    this.particles.push(new Particle(
                        x + Math.cos(angle) * 12,
                        y + Math.sin(angle) * 12,
                        Math.cos(angle) * 2,
                        Math.sin(angle) * 2,
                        '#F8D030',
                        Math.random() * 2 + 1,
                        150 + Math.random() * 100
                    ));
                }
                break;
            case 'freeze':
                this.particles.push(new Particle(
                    x + (Math.random() - 0.5) * 20,
                    y + (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 0.3,
                    -Math.random() * 0.5,
                    Math.random() > 0.5 ? '#98D8D8' : '#ffffff',
                    Math.random() * 3 + 2,
                    600 + Math.random() * 300
                ));
                break;
            case 'sleep':
                // Floating "z" particles
                this.particles.push(new Particle(
                    x + (Math.random() - 0.5) * 10,
                    y - 20,
                    Math.random() * 0.5 + 0.2,
                    -Math.random() * 1 - 0.5,
                    '#9090ff',
                    Math.random() * 2 + 2,
                    800 + Math.random() * 400,
                    -0.02
                ));
                break;
            case 'confuse':
                const angle = Math.random() * Math.PI * 2;
                this.particles.push(new Particle(
                    x + Math.cos(angle) * 15,
                    y - 15 + Math.sin(angle) * 8,
                    Math.cos(angle) * 1,
                    Math.sin(angle) * 1,
                    Math.random() > 0.5 ? '#ff6090' : '#ffcc44',
                    Math.random() * 2 + 1,
                    300 + Math.random() * 200
                ));
                break;
        }
    }
}
