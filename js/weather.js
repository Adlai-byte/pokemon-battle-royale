// js/weather.js - Weather system, random arena events, shrinking storm circle

const WEATHER_TYPES = [
    { name: 'Clear',     icon: '',   color: null },
    { name: 'Rain',      icon: '\uD83C\uDF27\uFE0F', color: 'rgba(50, 100, 200, 0.15)',  boosts: ['water'], weakens: ['fire'] },
    { name: 'Sun',       icon: '\u2600\uFE0F',        color: 'rgba(255, 200, 50, 0.1)',   boosts: ['fire'],  weakens: ['water'] },
    { name: 'Sandstorm', icon: '\uD83C\uDF2A\uFE0F',  color: 'rgba(180, 150, 80, 0.12)',  immune: ['rock', 'ground', 'steel'] },
    { name: 'Hail',      icon: '\u2744\uFE0F',         color: 'rgba(150, 200, 255, 0.12)', immune: ['ice'] },
];

const WEATHER_CHANGE_MIN = 30000; // 30s
const WEATHER_CHANGE_MAX = 60000; // 60s

const EVENT_INTERVAL_MIN = 20000; // 20s
const EVENT_INTERVAL_MAX = 40000; // 40s

export class WeatherManager {
    constructor() {
        this.currentWeather = WEATHER_TYPES[0]; // Clear
        this.weatherTimer = this._randomInterval(WEATHER_CHANGE_MIN, WEATHER_CHANGE_MAX);
        this.eventTimer = this._randomInterval(EVENT_INTERVAL_MIN, EVENT_INTERVAL_MAX);

        // Storm circle
        this.stormRadius = 600; // Start large (arena is 1200x800)
        this.stormTargetRadius = 600;
        this.stormCenterX = 600;
        this.stormCenterY = 400;
        this.stormPhase = 0; // Shrink phases triggered by remaining count
        this.stormDamageTimer = 0;

        // Healing zone
        this.healZone = null; // { x, y, radius, timer }

        // Visual particles for weather
        this.weatherParticles = [];
    }

    _randomInterval(min, max) {
        return min + Math.random() * (max - min);
    }

    update(dt, pokemons, arenaWidth, arenaHeight, effects, onEvent) {
        // Weather timer
        this.weatherTimer -= dt;
        if (this.weatherTimer <= 0) {
            this._changeWeather(onEvent);
            this.weatherTimer = this._randomInterval(WEATHER_CHANGE_MIN, WEATHER_CHANGE_MAX);
        }

        // Weather DOT (sandstorm/hail)
        if (this.currentWeather.name === 'Sandstorm' || this.currentWeather.name === 'Hail') {
            this.stormDamageTimer -= dt;
            if (this.stormDamageTimer <= 0) {
                this.stormDamageTimer = 2000; // Tick every 2s
                const immune = this.currentWeather.immune || [];
                for (const p of pokemons) {
                    if (!p.alive || p.eliminating) continue;
                    if (p.types.some(t => immune.includes(t))) continue;
                    const dmg = Math.round(p.maxHp * 0.02);
                    p.hp -= dmg;
                    p.stats.damageTaken += dmg;
                }
            }
        }

        // Random arena events
        this.eventTimer -= dt;
        if (this.eventTimer <= 0) {
            this._triggerRandomEvent(pokemons, arenaWidth, arenaHeight, effects, onEvent);
            this.eventTimer = this._randomInterval(EVENT_INTERVAL_MIN, EVENT_INTERVAL_MAX);
        }

        // Healing zone tick
        if (this.healZone) {
            this.healZone.timer -= dt;
            if (this.healZone.timer <= 0) {
                this.healZone = null;
            } else {
                // Heal Pokemon inside every 1s
                this.healZone.healTick = (this.healZone.healTick || 0) - dt;
                if (this.healZone.healTick <= 0) {
                    this.healZone.healTick = 1000;
                    for (const p of pokemons) {
                        if (!p.alive || p.eliminating) continue;
                        const dx = p.x - this.healZone.x;
                        const dy = p.y - this.healZone.y;
                        if (dx * dx + dy * dy < this.healZone.radius * this.healZone.radius) {
                            p.heal(0.05);
                        }
                    }
                }
            }
        }

        // Storm circle - shrink based on remaining alive
        const alive = pokemons.filter(p => p.alive && !p.eliminating).length;
        const total = pokemons.length;
        const ratio = alive / Math.max(1, total);
        // Circle shrinks as Pokemon are eliminated
        this.stormTargetRadius = Math.max(120, 600 * ratio);
        // Smoothly lerp toward target
        this.stormRadius += (this.stormTargetRadius - this.stormRadius) * 0.002 * (dt / 16);

        // Storm damage to Pokemon outside circle
        for (const p of pokemons) {
            if (!p.alive || p.eliminating) continue;
            const dx = p.x - this.stormCenterX;
            const dy = p.y - this.stormCenterY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > this.stormRadius) {
                // Push toward center + take damage
                const pushStrength = 0.5 * (dt / 16);
                p.x -= (dx / dist) * pushStrength;
                p.y -= (dy / dist) * pushStrength;
                // DOT outside storm (1% maxHp per second)
                const stormDmg = p.maxHp * 0.01 * (dt / 1000);
                p.hp -= stormDmg;
            }
        }

        // Weather visual particles
        this._updateWeatherParticles(dt, arenaWidth, arenaHeight);
    }

    _changeWeather(onEvent) {
        const candidates = WEATHER_TYPES.filter(w => w !== this.currentWeather);
        this.currentWeather = candidates[Math.floor(Math.random() * candidates.length)];
        if (this.currentWeather.name !== 'Clear') {
            onEvent(`The weather changed to ${this.currentWeather.name}! ${this.currentWeather.icon}`);
        } else {
            onEvent('The weather cleared up!');
        }
    }

    _triggerRandomEvent(pokemons, arenaW, arenaH, effects, onEvent) {
        const alive = pokemons.filter(p => p.alive && !p.eliminating);
        if (alive.length < 2) return;

        const roll = Math.random();

        if (roll < 0.35) {
            // Meteor strike - AOE at random position
            const x = 100 + Math.random() * (arenaW - 200);
            const y = 100 + Math.random() * (arenaH - 200);
            const radius = 120;
            effects.spawnExplosion(x, y, 'fire');
            effects.rings.push({ x, y, color: '#ff4444', maxRadius: radius, life: 600, maxLife: 600, alive: true,
                update(dt) { this.life -= dt; if (this.life <= 0) this.alive = false; },
                draw(ctx) {
                    const progress = 1 - this.life / this.maxLife;
                    const alpha = 1 - progress;
                    ctx.save();
                    ctx.globalAlpha = alpha * 0.4;
                    ctx.fillStyle = '#ff4444';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.maxRadius * progress, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });
            onEvent('\u2604\uFE0F A meteor struck the arena!');
            for (const p of alive) {
                const dx = p.x - x;
                const dy = p.y - y;
                if (dx * dx + dy * dy < radius * radius) {
                    const dmg = Math.round(p.maxHp * 0.15);
                    p.hp -= dmg;
                    p.stats.damageTaken += dmg;
                    p.triggerHitFlash();
                    p.triggerKnockback(x, y);
                    effects.addDamageNumber(p.x, p.y, dmg, true);
                }
            }
        } else if (roll < 0.65) {
            // Lightning bolt - hits a random Pokemon
            const target = alive[Math.floor(Math.random() * alive.length)];
            const dmg = Math.round(target.maxHp * 0.12);
            target.hp -= dmg;
            target.stats.damageTaken += dmg;
            target.triggerHitFlash();
            effects.spawnBeam(target.x, target.y - 300, target.x, target.y, 'electric');
            effects.addDamageNumber(target.x, target.y, dmg, true);
            onEvent(`\u26A1 Lightning struck ${target.name}! (-${dmg})`);
        } else {
            // Healing zone
            const x = 200 + Math.random() * (arenaW - 400);
            const y = 150 + Math.random() * (arenaH - 300);
            this.healZone = { x, y, radius: 100, timer: 8000, healTick: 0 };
            onEvent('\uD83D\uDC9A A healing zone appeared!');
        }
    }

    _updateWeatherParticles(dt, arenaW, arenaH) {
        // Remove dead particles
        for (let i = this.weatherParticles.length - 1; i >= 0; i--) {
            const p = this.weatherParticles[i];
            p.life -= dt;
            p.x += p.vx * (dt / 16);
            p.y += p.vy * (dt / 16);
            if (p.life <= 0 || p.y > arenaH || p.x < 0 || p.x > arenaW) {
                this.weatherParticles.splice(i, 1);
            }
        }

        // Spawn new weather particles
        if (this.currentWeather.name === 'Rain') {
            for (let i = 0; i < 3; i++) {
                this.weatherParticles.push({
                    x: Math.random() * arenaW,
                    y: -10,
                    vx: -1,
                    vy: 12 + Math.random() * 4,
                    size: 1.5,
                    color: 'rgba(100, 150, 255, 0.5)',
                    life: 2000,
                    maxLife: 2000,
                });
            }
        } else if (this.currentWeather.name === 'Hail') {
            if (Math.random() < 0.3) {
                this.weatherParticles.push({
                    x: Math.random() * arenaW,
                    y: -10,
                    vx: (Math.random() - 0.5) * 2,
                    vy: 6 + Math.random() * 3,
                    size: 3 + Math.random() * 2,
                    color: 'rgba(200, 230, 255, 0.7)',
                    life: 3000,
                    maxLife: 3000,
                });
            }
        } else if (this.currentWeather.name === 'Sandstorm') {
            for (let i = 0; i < 2; i++) {
                this.weatherParticles.push({
                    x: -10,
                    y: Math.random() * arenaH,
                    vx: 5 + Math.random() * 3,
                    vy: (Math.random() - 0.5) * 2,
                    size: 2 + Math.random() * 2,
                    color: 'rgba(200, 170, 100, 0.4)',
                    life: 2500,
                    maxLife: 2500,
                });
            }
        } else if (this.currentWeather.name === 'Sun') {
            if (Math.random() < 0.1) {
                this.weatherParticles.push({
                    x: Math.random() * arenaW,
                    y: Math.random() * arenaH,
                    vx: 0,
                    vy: -0.5,
                    size: 15 + Math.random() * 10,
                    color: 'rgba(255, 220, 50, 0.06)',
                    life: 3000,
                    maxLife: 3000,
                });
            }
        }
    }

    // Get damage multiplier for a move type based on weather
    getWeatherMultiplier(moveType) {
        if (!this.currentWeather.boosts) return 1;
        if (this.currentWeather.boosts.includes(moveType)) return 1.3;
        if (this.currentWeather.weakens && this.currentWeather.weakens.includes(moveType)) return 0.7;
        return 1;
    }

    draw(ctx, arenaW, arenaH, time) {
        // Draw storm circle danger zone
        this._drawStormCircle(ctx, arenaW, arenaH, time);

        // Draw weather overlay tint
        if (this.currentWeather.color) {
            ctx.fillStyle = this.currentWeather.color;
            ctx.fillRect(0, 0, arenaW, arenaH);
        }

        // Draw weather particles
        for (const p of this.weatherParticles) {
            const alpha = Math.min(1, p.life / p.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            if (this.currentWeather.name === 'Rain') {
                // Draw as streaks
                ctx.fillRect(p.x, p.y, p.size, p.size * 6);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;

        // Draw healing zone
        if (this.healZone) {
            const hz = this.healZone;
            const pulse = 0.3 + Math.sin(time * 0.004) * 0.1;
            const fadeAlpha = hz.timer < 2000 ? hz.timer / 2000 : 1;
            ctx.save();
            ctx.globalAlpha = pulse * fadeAlpha;
            ctx.fillStyle = '#44ff88';
            ctx.beginPath();
            ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = (pulse + 0.2) * fadeAlpha;
            ctx.strokeStyle = '#44ff88';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Cross icon
            ctx.globalAlpha = 0.6 * fadeAlpha;
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('+', hz.x, hz.y);
            ctx.restore();
        }
    }

    _drawStormCircle(ctx, arenaW, arenaH, time) {
        const cx = this.stormCenterX;
        const cy = this.stormCenterY;
        const r = this.stormRadius;

        // Only draw if noticeably smaller than arena
        if (r >= 580) return;

        ctx.save();

        // Draw danger zone outside circle
        const pulse = 0.15 + Math.sin(time * 0.003) * 0.05;
        ctx.fillStyle = `rgba(120, 30, 60, ${pulse})`;

        // Fill entire arena, then cut out safe circle
        ctx.beginPath();
        ctx.rect(0, 0, arenaW, arenaH);
        ctx.arc(cx, cy, r, 0, Math.PI * 2, true); // counter-clockwise = cut out
        ctx.fill();

        // Storm circle edge ring
        ctx.strokeStyle = `rgba(255, 50, 80, ${pulse + 0.2})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Inner edge glow
        ctx.strokeStyle = `rgba(255, 100, 120, ${pulse * 0.5})`;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    // Reset for new game
    reset() {
        this.currentWeather = WEATHER_TYPES[0];
        this.weatherTimer = this._randomInterval(WEATHER_CHANGE_MIN, WEATHER_CHANGE_MAX);
        this.eventTimer = this._randomInterval(EVENT_INTERVAL_MIN, EVENT_INTERVAL_MAX);
        this.stormRadius = 600;
        this.stormTargetRadius = 600;
        this.healZone = null;
        this.weatherParticles = [];
    }
}
