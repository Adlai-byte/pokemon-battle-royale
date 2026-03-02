// js/pokemon.js - Pokemon entity with sprite, stats, state, movement, rendering
import { getSpriteUrl, POKEMON_DATA, EVOLUTION_CHAINS } from './data.js';
import { getMoveset, MOVE_CAT } from './moves.js';
import { getAbility } from './abilities.js';

const HP_MULTIPLIER = 3;
const SPRITE_SIZE = 64;
const BOB_AMPLITUDE = 3;
const BOB_SPEED = 0.003;
const MOVE_SPEED = 0.8;
const WANDER_CHANGE_INTERVAL = 3000;
const LUNGE_DISTANCE = 20;

// BST-based balance scaling: weaker Pokemon get a boost, stronger ones get a slight nerf
function getBstScaling(stats) {
    const bst = stats.hp + stats.attack + stats.defense + stats.spAtk + stats.spDef + stats.speed;
    if (bst >= 600) return 0.88;      // Legendaries/pseudolegendaries nerfed moderately
    if (bst >= 525) return 0.94;      // Strong fully-evolved nerfed slightly
    if (bst >= 450) return 1.0;       // Mid-tier: no change
    if (bst >= 350) return 1.10;      // Weak evolved/strong unevolved: small buff
    if (bst >= 280) return 1.20;      // Weak unevolved: moderate buff
    return 1.30;                       // Very weak (Magikarp, Caterpie): bigger buff
}

export const COMBAT_RANGE = 80;

export class Pokemon {
    constructor(data, arenaWidth, arenaHeight) {
        this.id = data.id;
        this.name = data.name;
        this.types = data.types;
        this.baseStats = data.stats;

        // Battle stats with BST-based scaling for balance
        const scale = getBstScaling(data.stats);
        this.maxHp = Math.round(data.stats.hp * HP_MULTIPLIER * scale);
        this.hp = this.maxHp;
        this.displayHp = this.hp;
        this.attack = Math.round(data.stats.attack * scale);
        this.defense = Math.round(data.stats.defense * scale);
        this.spAtk = Math.round(data.stats.spAtk * scale);
        this.spDef = Math.round(data.stats.spDef * scale);
        this.speed = Math.round(data.stats.speed * (scale > 1 ? (1 + (scale - 1) * 0.5) : scale)); // Speed scales half as much for buffs

        // Stat modifiers (multipliers from buff/debuff moves)
        this.statMods = { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 };

        // Moves
        this.moves = getMoveset(data.id);

        // Status effects
        this.shieldTimer = 0;    // Protect/shield active duration
        this.statusEffect = null; // "sleep", "paralyze", "poison", "confuse"
        this.statusTimer = 0;

        // Position & movement
        this.x = Math.random() * (arenaWidth - SPRITE_SIZE * 2) + SPRITE_SIZE;
        this.y = Math.random() * (arenaHeight - SPRITE_SIZE * 2) + SPRITE_SIZE;
        this.targetX = this.x;
        this.targetY = this.y;
        this.lastWanderChange = 0;
        this.arenaWidth = arenaWidth;
        this.arenaHeight = arenaHeight;

        // Visual state
        this.sprite = null;
        this.spriteLoaded = false;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.alpha = 1;
        this.scale = 1;
        this.flashTimer = 0;
        this.lungeTimer = 0;
        this.lungeTargetX = 0;
        this.lungeTargetY = 0;
        this.knockbackX = 0;
        this.knockbackY = 0;
        this.buffGlowTimer = 0;   // Glow when buffing
        this.buffGlowColor = '';
        this.shieldAlpha = 0;     // Shield bubble visual

        // Fly animation state
        this.flyTimer = 0;        // Total fly animation duration
        this.flyPhase = 'none';   // 'rise', 'swoop', 'none'
        this.flyTargetX = 0;
        this.flyTargetY = 0;
        this.flyStartX = 0;
        this.flyStartY = 0;

        // Energy system (auto-chess style: charges from damage taken)
        this.energy = 0;
        this.maxEnergy = 100;

        // State
        this.alive = true;
        this.target = null;  // Set by battle engine (nearest enemy)
        this.combatCooldown = 0;
        this.eliminatedBy = null;
        this.killCount = 0;
        this.originalId = data.id;
        this.focusSash = false;
        this.evolved = false; // set true after evolving
        this.evolveRegenTimer = 0; // ms remaining for post-evolution regen
        this.lastDamagedAt = 0; // timestamp (ms) of last damage taken, for out-of-combat regen
        this.ability = getAbility(data.id);
        this.abilityState = {}; // Per-ability runtime state (e.g. sturdyUsed, flashFireActive)
        this.weatherSpeedMult = 1;

        // Stats tracking for leaderboard
        this.stats = { damageDealt: 0, damageTaken: 0, kills: 0, itemsPickedUp: 0, movesUsed: 0, biggestHit: 0, survivalTime: 0 };

        // Elimination animation
        this.eliminating = false;
        this.elimTimer = 0;
        this._elimFlash = 0;

        this._loadSprite();
    }

    // Get effective stat with modifiers
    getAtk()   { return this.attack * this._stageMult(this.statMods.atk); }
    getDef()   { return this.defense * this._stageMult(this.statMods.def); }
    getSpAtk() { return this.spAtk * this._stageMult(this.statMods.spAtk); }
    getSpDef() { return this.spDef * this._stageMult(this.statMods.spDef); }
    getSpd()   { return this.speed * this._stageMult(this.statMods.spd) * this.weatherSpeedMult; }

    _stageMult(stage) {
        // Each stage is ~1.5x buff, capped at +-6
        const s = Math.max(-6, Math.min(6, stage));
        if (s >= 0) return (2 + s) / 2;
        return 2 / (2 - s);
    }

    boostStat(stat, stages) {
        if (this.ability === 'Hyper Cutter' && stat === 'atk' && stages < 0) return;
        if (this.ability === 'Keen Eye' && stat === 'spd' && stages < 0) return;
        if (this.ability === 'Sticky Hold' && stages < 0) return;
        this.statMods[stat] = Math.max(-6, Math.min(6, this.statMods[stat] + stages));
    }

    canEvolve() {
        const chain = EVOLUTION_CHAINS[this.id];
        return chain && this.killCount >= chain.killsNeeded;
    }

    getEvolutionData() {
        const chain = EVOLUTION_CHAINS[this.id];
        if (!chain) return null;
        return POKEMON_DATA.find(p => p.id === chain.nextId) || null;
    }

    evolve(newData) {
        const hpRatio = this.hp / this.maxHp;
        const oldName = this.name;

        this.id = newData.id;
        this.name = newData.name;
        this.types = newData.types;
        this.baseStats = newData.stats;

        const scale = getBstScaling(newData.stats);
        this.maxHp = Math.round(newData.stats.hp * HP_MULTIPLIER * scale);
        this.hp = Math.max(1, Math.round(this.maxHp * hpRatio));
        this.attack = Math.round(newData.stats.attack * scale);
        this.defense = Math.round(newData.stats.defense * scale);
        this.spAtk = Math.round(newData.stats.spAtk * scale);
        this.spDef = Math.round(newData.stats.spDef * scale);
        this.speed = Math.round(newData.stats.speed * (scale > 1 ? (1 + (scale - 1) * 0.5) : scale));

        this.moves = getMoveset(newData.id);
        this.statMods = { atk: 0, def: 0, spAtk: 0, spDef: 0, spd: 0 };
        this.gainEnergy(30);
        this.evolved = true;
        this.evolveRegenTimer = 5000; // 5 seconds of post-evolution regen
        this.ability = getAbility(newData.id);
        const sturdyUsed = this.abilityState.sturdyUsed;
        this.abilityState = {};
        if (sturdyUsed) this.abilityState.sturdyUsed = true;

        this._loadSprite();
        return oldName;
    }

    triggerBuffGlow(color) {
        this.buffGlowTimer = 500;
        this.buffGlowColor = color;
    }

    triggerShield() {
        this.shieldTimer = 1500; // Shield lasts 1.5s
    }

    _loadSprite() {
        this.sprite = new Image();
        this.sprite.crossOrigin = 'anonymous';
        this.sprite.onload = () => { this.spriteLoaded = true; };
        this.sprite.src = getSpriteUrl(this.id);
    }

    update(dt, time, remainingCount = 999) {
        if (!this.alive) return;

        const hpLerp = Math.min(1, dt * 0.008);
        this.displayHp += (this.hp - this.displayHp) * hpLerp;

        if (this.eliminating) {
            this.elimTimer += dt;
            const t = this.elimTimer;
            if (t < 150) {
                // Phase 1: White flash, scale bumps to 1.1
                const p = t / 150;
                this._elimFlash = 1 - p * 0.5;
                this.scale = 1 + p * 0.1;
                this.alpha = 1;
            } else if (t < 400) {
                // Phase 2: Scale expands to 1.3, alpha fading
                const p = (t - 150) / 250;
                this._elimFlash = 0;
                this.scale = 1.1 + p * 0.2;
                this.alpha = 1 - p * 0.6;
            } else if (t < 800) {
                // Phase 3: Rapid collapse to 0
                const p = (t - 400) / 400;
                this._elimFlash = 0;
                this.scale = Math.max(0, 1.3 * (1 - p * p));
                this.alpha = Math.max(0, 0.4 * (1 - p));
            } else {
                this.alive = false;
            }
            return;
        }

        if (this.flashTimer > 0) this.flashTimer -= dt;
        if (this.lungeTimer > 0) this.lungeTimer -= dt;
        if (this.combatCooldown > 0) this.combatCooldown -= dt;
        if (this.flyTimer > 0) {
            this.flyTimer -= dt;
            if (this.flyTimer <= 300 && this.flyPhase === 'rise') {
                this.flyPhase = 'swoop';
            }
            if (this.flyTimer <= 0) {
                this.flyPhase = 'none';
                this.flyTimer = 0;
            }
        }
        if (this.buffGlowTimer > 0) this.buffGlowTimer -= dt;
        if (this.shieldTimer > 0) {
            this.shieldAlpha = Math.min(0.4, this.shieldTimer / 1500 * 0.4);
            this.shieldTimer -= dt;
        } else {
            this.shieldAlpha *= 0.9;
        }
        if (this.statusTimer > 0) {
            this.statusTimer -= dt;
            if (this.statusTimer <= 0) this.statusEffect = null;
        }

        this.knockbackX *= 0.85;
        this.knockbackY *= 0.85;

        // Post-evolution HP regen (0.1% maxHp per frame-tick, lasts 5s)
        if (this.evolveRegenTimer > 0) {
            this.evolveRegenTimer -= dt;
            if (this.hp < this.maxHp) {
                this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.001 * (dt / 16));
            }
        }

        // Movement: seek target or wander
        const hasTarget = this.target && this.target.alive && !this.target.eliminating;
        if (hasTarget) {
            const dist = this.distanceTo(this.target);
            if (dist > COMBAT_RANGE * 0.85) {
                this.targetX = this.target.x;
                this.targetY = this.target.y;
                this._moveTowardTarget(dt, remainingCount);
            }
        } else {
            const wanderInterval = remainingCount <= 5 ? 1000 : WANDER_CHANGE_INTERVAL;
            if (time - this.lastWanderChange > wanderInterval) {
                this._pickNewWanderTarget(remainingCount);
                this.lastWanderChange = time;
            }
            this._moveTowardTarget(dt, remainingCount);
        }
    }

    _pickNewWanderTarget(remainingCount) {
        const margin = SPRITE_SIZE;
        const centerX = this.arenaWidth / 2;
        const centerY = this.arenaHeight / 2;

        if (remainingCount <= 5) {
            // Bias heavily toward center when few remain
            const spread = Math.max(80, (remainingCount / 5) * (this.arenaWidth / 3));
            this.targetX = centerX + (Math.random() - 0.5) * spread;
            this.targetY = centerY + (Math.random() - 0.5) * spread;
        } else {
            this.targetX = margin + Math.random() * (this.arenaWidth - margin * 2);
            this.targetY = margin + Math.random() * (this.arenaHeight - margin * 2);
        }
    }

    _moveTowardTarget(dt, remainingCount) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) return;

        // Move faster when fewer Pokemon remain
        const urgency = remainingCount <= 5 ? 2.5 : 1;
        const speedFactor = (this.speed / 100) * MOVE_SPEED * urgency;
        const step = Math.min(dist, speedFactor * (dt / 16));
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
    }

    startElimination(attacker) {
        this.eliminating = true;
        this.elimTimer = 0;
        this.target = null;
        this.eliminatedBy = attacker.name;
    }

    triggerHitFlash() {
        this.flashTimer = 200;
    }

    triggerLunge(targetX, targetY) {
        this.lungeTimer = 200;
        this.lungeTargetX = targetX;
        this.lungeTargetY = targetY;
    }

    triggerFly(targetX, targetY) {
        this.flyPhase = 'rise';
        this.flyTimer = 600; // 600ms total: 300 rise + 300 swoop
        this.flyTargetX = targetX;
        this.flyTargetY = targetY;
        this.flyStartX = this.x;
        this.flyStartY = this.y;
    }

    triggerKnockback(fromX, fromY) {
        const dx = this.x - fromX;
        const dy = this.y - fromY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        this.knockbackX = (dx / dist) * 8;
        this.knockbackY = (dy / dist) * 8;
    }

    heal(percent) {
        this.hp = Math.min(this.maxHp, this.hp + this.maxHp * percent);
    }

    gainEnergy(amount) {
        this.energy = Math.min(this.maxEnergy, this.energy + amount);
    }

    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    draw(ctx, time) {
        if (!this.alive && !this.eliminating) return;
        if (!this.spriteLoaded) return;

        ctx.save();

        const bob = Math.sin(time * BOB_SPEED + this.bobOffset) * BOB_AMPLITUDE;
        let drawX = this.x + this.knockbackX;
        let drawY = this.y + bob + this.knockbackY;

        // Fly animation override
        if (this.flyPhase === 'rise') {
            // Rise up: progress from 0->1 over 300ms (flyTimer goes 600->300)
            const riseProgress = 1 - (this.flyTimer - 300) / 300;
            const ease = riseProgress * riseProgress; // ease-in
            drawY -= ease * 80; // Rise 80px up
            // Scale down as if flying away
            const flyScale = 1 - ease * 0.4;
            ctx.globalAlpha = this.alpha * (1 - ease * 0.3);
            // Apply scaled sprite by adjusting halfSize later
            this._flyScale = flyScale;
        } else if (this.flyPhase === 'swoop') {
            // Swoop down to target: progress from 0->1 over 300ms (flyTimer goes 300->0)
            const swoopProgress = 1 - this.flyTimer / 300;
            const ease = swoopProgress * swoopProgress; // ease-in for impact
            // Interpolate from above start position to target
            drawX = this.flyStartX + (this.flyTargetX - this.flyStartX) * ease;
            drawY = (this.flyStartY - 80) + (this.flyTargetY - (this.flyStartY - 80)) * ease;
            const flyScale = 0.6 + ease * 0.5; // Grow back as swooping in
            ctx.globalAlpha = this.alpha * (0.7 + ease * 0.3);
            this._flyScale = flyScale;
        } else {
            this._flyScale = 1;

            // Lunge offset (only when not flying)
            if (this.lungeTimer > 0) {
                const lungeProgress = this.lungeTimer / 200;
                const lungeFactor = Math.sin(lungeProgress * Math.PI);
                const ldx = this.lungeTargetX - this.x;
                const ldy = this.lungeTargetY - this.y;
                const ldist = Math.sqrt(ldx * ldx + ldy * ldy) || 1;
                drawX += (ldx / ldist) * LUNGE_DISTANCE * lungeFactor;
                drawY += (ldy / ldist) * LUNGE_DISTANCE * lungeFactor;
            }
        }

        ctx.globalAlpha = this.alpha;

        const effectiveScale = this.scale * (this._flyScale || 1);
        const halfSize = (SPRITE_SIZE * effectiveScale) / 2;

        // Buff glow (behind sprite)
        if (this.buffGlowTimer > 0) {
            const glowAlpha = (this.buffGlowTimer / 500) * 0.5;
            ctx.fillStyle = this.buffGlowColor || 'rgba(255, 255, 100, 0.5)';
            ctx.globalAlpha = glowAlpha * this.alpha;
            ctx.beginPath();
            ctx.arc(drawX, drawY, halfSize + 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = this.alpha;
        }

        // Shield bubble (behind sprite)
        if (this.shieldAlpha > 0.01) {
            ctx.strokeStyle = `rgba(100, 200, 255, ${this.shieldAlpha})`;
            ctx.fillStyle = `rgba(100, 200, 255, ${this.shieldAlpha * 0.3})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(drawX, drawY, halfSize + 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // "Your Pick" golden ring
        if (this.isPlayerPick && this.alive) {
            ctx.save();
            ctx.strokeStyle = '#f5a623';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5 + Math.sin(time * 0.005) * 0.3;
            ctx.beginPath();
            ctx.arc(drawX, drawY - 8, 28, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // Kill streak aura
        if (this.alive && this.stats.kills >= 3) {
            ctx.save();
            const intensity = Math.min(this.stats.kills, 7) / 7;
            const pulse = 0.5 + Math.sin(time * 0.004) * 0.3;
            ctx.globalAlpha = intensity * pulse * 0.4;
            ctx.fillStyle = this.stats.kills >= 5 ? '#ffd700' : '#f5a623';
            ctx.beginPath();
            ctx.arc(drawX, drawY - 8, 30 + intensity * 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw sprite
        ctx.drawImage(
            this.sprite,
            drawX - halfSize, drawY - halfSize,
            SPRITE_SIZE * effectiveScale, SPRITE_SIZE * effectiveScale
        );

        // Elimination white flash overlay
        if (this._elimFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this._elimFlash})`;
            ctx.fillRect(
                drawX - halfSize, drawY - halfSize,
                SPRITE_SIZE * effectiveScale, SPRITE_SIZE * effectiveScale
            );
        }

        // Hit flash overlay
        if (this.flashTimer > 0) {
            const flashAlpha = (this.flashTimer / 200) * 0.6;
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
            ctx.fillRect(
                drawX - halfSize, drawY - halfSize,
                SPRITE_SIZE * effectiveScale, SPRITE_SIZE * effectiveScale
            );
        }

        // Status effect indicator
        if (this.statusEffect && !this.eliminating) {
            const statusColors = { sleep: '#9090ff', paralyze: '#f0d030', poison: '#a040a0', confuse: '#ff6090', toxic: '#a040a0' };
            const statusIcons = { sleep: 'Zzz', paralyze: '⚡', poison: 'PSN', confuse: '?!', toxic: 'TOX' };
            ctx.fillStyle = statusColors[this.statusEffect] || '#fff';
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(statusIcons[this.statusEffect] || '', drawX, drawY + halfSize + 12);
        }

        // HP Bar + Energy Bar
        if (!this.eliminating && this.hp > 0) {
            const barWidth = 50;
            const barHeight = 5;
            const barX = drawX - barWidth / 2;
            const barY = drawY - halfSize - 14;
            const hpPercent = this.displayHp / this.maxHp;

            // HP bar background
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

            if (this._isPlayerTeam === false) {
                // Enemy in endless mode: red-tinted HP bar
                if (hpPercent > 0.5) {
                    ctx.fillStyle = `rgb(255, ${Math.floor(hpPercent * 100)}, ${Math.floor(hpPercent * 60)})`;
                } else {
                    ctx.fillStyle = `rgb(${Math.floor(120 + hpPercent * 135)}, ${Math.floor(hpPercent * 60)}, ${Math.floor(hpPercent * 40)})`;
                }
            } else if (hpPercent > 0.5) {
                ctx.fillStyle = `rgb(${Math.floor((1 - hpPercent) * 2 * 255)}, 200, 50)`;
            } else {
                ctx.fillStyle = `rgb(255, ${Math.floor(hpPercent * 2 * 200)}, 50)`;
            }
            ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

            // Energy bar (below HP bar)
            const energyBarY = barY + barHeight + 2;
            const energyBarH = 3;
            const energyPercent = Math.min(1, this.energy / this.maxEnergy);
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(barX - 1, energyBarY - 1, barWidth + 2, energyBarH + 2);

            if (energyPercent >= 1) {
                // Full energy - pulsing gold
                const pulse = 0.7 + Math.sin(time * 0.008) * 0.3;
                ctx.fillStyle = `rgba(255, 220, 50, ${pulse})`;
            } else {
                ctx.fillStyle = '#44ddff';
            }
            ctx.fillRect(barX, energyBarY, barWidth * energyPercent, energyBarH);

            // Name label
            ctx.fillStyle = '#fff';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.name, drawX, barY - 3);
            // Ability label
            if (this.ability) {
                ctx.fillStyle = 'rgba(180, 180, 210, 0.7)';
                ctx.font = '8px sans-serif';
                ctx.fillText(this.ability, drawX, barY - 13);
            }
        }

        ctx.restore();
    }
}
