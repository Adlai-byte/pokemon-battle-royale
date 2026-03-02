// js/battle.js - Free-for-all auto-chess battle engine
// Each Pokemon targets nearest enemy, auto-attacks, charges energy from damage,
// and casts special moves when energy is full. No 1v1 locking.
import { getTypeMultiplier, POKEMON_DATA, EVOLUTION_CHAINS } from './data.js';
import { COMBAT_RANGE } from './pokemon.js';
import { MOVE_CAT } from './moves.js';
import { getAbilityEffect } from './abilities.js';

const BASE_ATTACK_COOLDOWN = 1200; // ms base auto-attack interval
const SPECIAL_COOLDOWN = 800;      // ms pause after casting special
const HEAL_PERCENT = 0.10;
const AUTO_DAMAGE = 8;             // base auto-attack damage multiplier
const SPECIAL_DAMAGE = 12;         // base special move damage multiplier
const AOE_RANGE = 150;

// Energy constants
const ENERGY_ON_AUTO = 10;         // attacker gains per auto-attack
const ENERGY_BASE_ON_HIT = 15;     // base energy defender gains when hit
const ENERGY_DAMAGE_SCALE = 40;    // extra energy scaled by damage/maxHp

const COMMENTARY_TEMPLATES = {
    killStreak3: [
        "{name} is on a RAMPAGE!",
        "{name} has a triple kill!",
        "{name} is dominating!"
    ],
    killStreak5: [
        "{name} is UNSTOPPABLE!",
        "{name} can't be stopped!",
        "{name} is on a legendary streak!"
    ],
    upset: [
        "UPSET! {name} takes down {target}!",
        "What a shocker! {name} defeats {target}!",
        "Nobody saw that coming! {name} eliminates {target}!"
    ],
    comeback: [
        "CLUTCH! {name} gets the KO at low HP!",
        "{name} refuses to go down!",
        "Incredible comeback play by {name}!"
    ],
    evolution: [
        "{name} just leveled up! Watch out!",
        "{name} evolved and means business!",
        "A new threat emerges: {name}!"
    ],
    focusSash: [
        "{name} hangs on by a thread!",
        "{name} survives with pure determination!",
    ]
};

function pickTemplate(key, vars) {
    const arr = COMMENTARY_TEMPLATES[key];
    let text = arr[Math.floor(Math.random() * arr.length)];
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, v);
    }
    return text;
}

export class BattleEngine {
    constructor(effects, onElimination, onEvent, onCommentary, musicManager) {
        this.effects = effects;
        this.onElimination = onElimination;
        this.onEvent = onEvent;
        this.onCommentary = onCommentary || null;
        this.music = musicManager || null;
        this.lastCommentaryTime = 0;
        this.weatherManager = null; // Set by main.js
        this.onSlowMo = null;
    }

    _tryCommentary(text, type) {
        const now = Date.now();
        if (now - this.lastCommentaryTime < 4000) return;
        this.lastCommentaryTime = now;
        if (this.onCommentary) this.onCommentary(text, type);
    }

    update(pokemons, dt) {
        const alive = pokemons.filter(p => p.alive && !p.eliminating);

        // Apply DOT (poison/toxic/burn)
        this._applyDOT(alive, dt);

        // Assign/refresh targets - each Pokemon targets nearest enemy
        for (const p of alive) {
            if (!p.target || !p.target.alive || p.target.eliminating) {
                p.target = this._findNearestTarget(p, alive);
            }
        }

        // Process each Pokemon independently
        for (const p of alive) {
            if (p.combatCooldown > 0) continue;
            if (!p.target) continue;
            if (p.distanceTo(p.target) > COMBAT_RANGE) continue;
            if (!this._canAct(p)) {
                // Still get cooldown even if can't act (sleep/freeze/para)
                p.combatCooldown = 500;
                continue;
            }

            // Energy full -> cast special move
            if (p.energy >= p.maxEnergy) {
                this._useSpecialMove(p, p.target, alive);
                p.energy = 0;
                p.combatCooldown = SPECIAL_COOLDOWN;
            } else {
                // Auto-attack
                this._basicAttack(p, p.target);
                // Speed-based cooldown: faster Pokemon attack more often
                p.combatCooldown = BASE_ATTACK_COOLDOWN / Math.max(0.5, p.getSpd() / 80);
            }
        }
    }

    _findNearestTarget(pokemon, alive) {
        let nearest = null;
        let nearestDist = Infinity;
        for (const other of alive) {
            if (other === pokemon) continue;
            // In endless mode, only target the opposing side
            if (pokemon._isPlayerTeam !== undefined && other._isPlayerTeam !== undefined) {
                if (pokemon._isPlayerTeam === other._isPlayerTeam) continue;
            }
            const dist = pokemon.distanceTo(other);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = other;
            }
        }
        return nearest;
    }

    _applyDOT(alive, dt) {
        for (const p of alive) {
            // Magic Guard: immune to DOT
            if (p.ability === 'Magic Guard') continue;
            if (p.statusEffect === 'poison' || p.statusEffect === 'toxic' || p.statusEffect === 'burn') {
                const rate = p.statusEffect === 'toxic' ? 0.003 : 0.002;
                let dotDmg = p.maxHp * rate * (dt / 16);
                p.hp -= dotDmg;
                // DOT also charges energy
                p.gainEnergy(dotDmg / p.maxHp * 10);
                if (p.hp <= 0) {
                    p.hp = 0;
                    if (!p.eliminating) {
                        const cause = p.statusEffect === 'burn' ? 'Burn' : 'Poison';
                        p.startElimination({ name: cause });
                        this.effects.spawnEliminationBurst(p.x, p.y, p.types);
                        this.onElimination({ name: cause, x: p.x, y: p.y, sprite: p.sprite, heal() {} }, p);
                    }
                }
            }
        }
    }

    _canAct(pokemon) {
        if (pokemon.statusEffect === 'sleep') {
            if (Math.random() < 0.4) {
                pokemon.statusEffect = null;
                pokemon.statusTimer = 0;
                this.onEvent(`${pokemon.name} woke up!`);
                return true;
            }
            return false;
        }
        if (pokemon.statusEffect === 'paralyze' && Math.random() < 0.25) {
            return false;
        }
        if (pokemon.statusEffect === 'freeze') {
            if (Math.random() < 0.2) {
                pokemon.statusEffect = null;
                pokemon.statusTimer = 0;
                this.onEvent(`${pokemon.name} thawed out!`);
                return true;
            }
            return false;
        }
        return true;
    }

    // --- BASIC AUTO-ATTACK (no move, just stat-based hit) ---
    _basicAttack(attacker, defender) {
        const isPhysical = attacker.getAtk() >= attacker.getSpAtk();
        let atkStat = isPhysical ? attacker.getAtk() : attacker.getSpAtk();
        const defStat = isPhysical ? defender.getDef() : defender.getSpDef();

        if (attacker.statusEffect === 'burn' && isPhysical && attacker.ability !== 'Guts') atkStat *= 0.5;

        let damage = Math.max(1, Math.round(
            AUTO_DAMAGE * (atkStat / defStat) * (0.85 + Math.random() * 0.3)
        ));

        // Shield reduces damage
        if (defender.shieldTimer > 0) {
            damage = Math.round(damage * 0.3);
            defender.shieldTimer = 0;
        }

        // Ability: before-hit (immunity, reduction)
        const beforeHit = this._applyAbilityOnBeforeHit(attacker, defender, damage, null);
        if (beforeHit.nullified) {
            attacker.combatCooldown = 600;
            return;
        }
        damage = beforeHit.damage;

        // Ability: deal-damage boost
        damage = this._applyAbilityOnDealDamage(attacker, defender, damage, null);

        defender.hp -= damage;
        defender.lastDamagedAt = Date.now();

        // Track stats
        attacker.stats.damageDealt += damage;
        defender.stats.damageTaken += damage;

        // Visuals: simple lunge + hit
        attacker.triggerLunge(defender.x, defender.y);
        defender.triggerHitFlash();
        defender.triggerKnockback(attacker.x, attacker.y);
        this.effects.addDamageNumber(defender.x, defender.y, damage, false);
        this.effects.spawnAttackEffect(defender.x, defender.y, attacker.types[0] || 'normal');
        this.music?.playSFX('hit');
        // Ability: contact punish
        this._applyAbilityOnTakeDamage(attacker, defender);

        // Energy: attacker gains some, defender gains more (charge from damage)
        attacker.gainEnergy(ENERGY_ON_AUTO);
        const energyMult = defender.ability === 'Inner Focus' ? 1.1 : 1;
        defender.gainEnergy((ENERGY_BASE_ON_HIT + (damage / defender.maxHp) * ENERGY_DAMAGE_SCALE) * energyMult);

        // Natural Cure
        if (defender.ability === 'Natural Cure' && defender.statusEffect && defender.hp > 0 && defender.hp / defender.maxHp < 0.5) {
            defender.statusEffect = null;
            defender.statusTimer = 0;
            this.onEvent(`${defender.name}'s Natural Cure removed its status!`);
        }

        this._checkLethal(defender, attacker);
    }

    // --- SPECIAL MOVE (energy-charged ability) ---
    _useSpecialMove(user, target, allAlive) {
        // Confusion self-hit
        if (user.statusEffect === 'confuse' && Math.random() < 0.33) {
            const selfDmg = Math.round(user.maxHp * 0.05);
            user.hp -= selfDmg;
            user.triggerHitFlash();
            this.effects.addDamageNumber(user.x, user.y, selfDmg, false);
            this.onEvent(`${user.name} hurt itself in confusion!`);
            this._checkLethal(user, target);
            return;
        }

        const move = this._pickMove(user, target);

        if (move.cat === MOVE_CAT.PHYSICAL || move.cat === MOVE_CAT.SPECIAL) {
            this._executeDamagingMove(user, target, move, allAlive);
        } else if (move.cat === MOVE_CAT.DEFENSE) {
            this._executeDefenseMove(user, move);
        } else if (move.cat === MOVE_CAT.ENHANCE) {
            this._executeEnhanceMove(user, target, move);
        } else if (move.cat === MOVE_CAT.STATUS) {
            this._executeStatusMove(user, target, move);
        }
    }

    _pickMove(user, target) {
        const moves = user.moves;
        const hpRatio = user.hp / user.maxHp;
        const targetHpRatio = target.hp / target.maxHp;

        const weights = moves.map(move => {
            let w = 1;
            if (move.cat === MOVE_CAT.PHYSICAL || move.cat === MOVE_CAT.SPECIAL) {
                w = 3;
                if (targetHpRatio < 0.3) w = 6;
                if (user.types.includes(move.type)) w += 1;
                const mult = getTypeMultiplier(move.type, target.types);
                if (mult > 1) w += 2;
                if (mult === 0) w = 0.1;
                if (move.aoe) w += 1;
            } else if (move.cat === MOVE_CAT.DEFENSE) {
                w = hpRatio < 0.4 ? 3 : 1;
                if (move.effect === 'heal' && hpRatio < 0.5) w = 4;
            } else if (move.cat === MOVE_CAT.ENHANCE) {
                w = hpRatio > 0.6 ? 2 : 0.5;
                const totalBuffs = Object.values(user.statMods).reduce((a, b) => a + b, 0);
                if (totalBuffs > 4) w *= 0.3;
            } else if (move.cat === MOVE_CAT.STATUS) {
                w = target.statusEffect ? 0.2 : 2;
            }
            return w;
        });

        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * totalWeight;
        for (let i = 0; i < moves.length; i++) {
            r -= weights[i];
            if (r <= 0) return moves[i];
        }
        return moves[0];
    }

    _executeDamagingMove(attacker, defender, move, allAlive) {
        let typeMultiplier = getTypeMultiplier(move.type, defender.types);
        // Scrappy: Normal/Fighting hit Ghost
        if (attacker.ability === 'Scrappy' && (move.type === 'normal' || move.type === 'fighting') && defender.types.includes('ghost')) {
            typeMultiplier = 1;
        }

        let atkStat, defStat;
        if (move.cat === MOVE_CAT.PHYSICAL) {
            atkStat = attacker.getAtk();
            defStat = defender.getDef();
            if (attacker.statusEffect === 'burn' && attacker.ability !== 'Guts') atkStat *= 0.5;
        } else {
            atkStat = attacker.getSpAtk();
            defStat = defender.getSpDef();
        }

        const stab = attacker.types.includes(move.type) ? (attacker.ability === 'Adaptability' ? 2.0 : 1.5) : 1;
        const critChance = move.effect === 'highCrit' ? 0.25 : 0.06;
        const isCrit = defender.ability === 'Shell Armor' ? false : Math.random() < critChance;
        const critMult = isCrit ? 1.5 : 1;

        const weatherMult = this.weatherManager ? this.weatherManager.getWeatherMultiplier(move.type) : 1;
        const powerFactor = (move.power / 100);
        const rawDamage = SPECIAL_DAMAGE * powerFactor * (atkStat / defStat) * stab * critMult * weatherMult * (0.85 + Math.random() * 0.3);
        let damage = Math.max(1, Math.round(rawDamage * typeMultiplier));

        // Shield reduces damage
        if (defender.shieldTimer > 0) {
            damage = Math.round(damage * 0.3);
            defender.shieldTimer = 0;
            this.onEvent(`${defender.name}'s shield absorbed the hit!`);
        }

        // Ability: before-hit
        const beforeHit = this._applyAbilityOnBeforeHit(attacker, defender, damage, move);
        if (beforeHit.nullified) {
            this.effects.addMoveLabel(attacker.x, attacker.y - 45, move.name, move.type);
            attacker.stats.movesUsed++;
            return;
        }
        damage = beforeHit.damage;

        // Ability: deal-damage boost
        damage = this._applyAbilityOnDealDamage(attacker, defender, damage, move);

        defender.hp -= damage;
        defender.lastDamagedAt = Date.now();

        // Track stats
        attacker.stats.damageDealt += damage;
        defender.stats.damageTaken += damage;
        attacker.stats.movesUsed++;
        if (damage > attacker.stats.biggestHit) attacker.stats.biggestHit = damage;

        // Energy charge for defender (taking special damage charges more)
        defender.gainEnergy(ENERGY_BASE_ON_HIT + (damage / defender.maxHp) * ENERGY_DAMAGE_SCALE * 1.5);

        // --- ANIMATIONS ---
        const animType = move.anim || 'strike';

        if (animType === 'fly') {
            attacker.triggerFly(defender.x, defender.y);
            this.effects.spawnFlyTrail(attacker.x, attacker.y, defender.x, defender.y);
        } else if (animType === 'beam') {
            this.effects.spawnBeam(attacker.x, attacker.y, defender.x, defender.y, move.type);
        } else if (animType === 'projectile') {
            this.effects.spawnProjectile(attacker.x, attacker.y, defender.x, defender.y, move.type);
        } else if (animType === 'explosion') {
            this.effects.spawnExplosion(defender.x, defender.y, move.type);
        } else if (animType === 'wave') {
            this.effects.spawnWave(attacker.x, attacker.y, move.type);
        } else if (animType === 'slash') {
            attacker.triggerLunge(defender.x, defender.y);
            this.effects.spawnSlash(defender.x, defender.y, move.type);
        } else if (animType === 'punch') {
            attacker.triggerLunge(defender.x, defender.y);
            this.effects.spawnPunch(defender.x, defender.y, move.type);
        } else if (animType === 'drain') {
            this.effects.spawnDrainEffect(attacker.x, attacker.y, defender.x, defender.y, move.type);
        } else {
            attacker.triggerLunge(defender.x, defender.y);
        }

        defender.triggerHitFlash();
        defender.triggerKnockback(attacker.x, attacker.y);
        this.effects.spawnAttackEffect(defender.x, defender.y, move.type);
        this.effects.addDamageNumber(defender.x, defender.y, damage, typeMultiplier > 1);
        this.effects.addMoveLabel(attacker.x, attacker.y - 45, move.name, move.type);
        // Ability: contact punish
        this._applyAbilityOnTakeDamage(attacker, defender);

        if (typeMultiplier > 1) this.effects.shake(10, 250);
        if (typeMultiplier >= 1.5) this.music?.playSFX('superEffective');
        if (isCrit) this.effects.shake(12, 300);
        if (isCrit) this.music?.playSFX('crit');
        if (isCrit && this.onSlowMo) this.onSlowMo();

        // Event log
        let msg = `${attacker.name} used ${move.name}!`;
        if (typeMultiplier === 0) msg += ` No effect...`;
        else if (typeMultiplier > 1) msg += ` Super effective! (-${damage})`;
        else if (typeMultiplier < 1 && typeMultiplier > 0) msg += ` Not very effective... (-${damage})`;
        else msg += ` (-${damage})`;
        if (isCrit) msg += ' CRIT!';
        this.onEvent(msg);

        // Drain moves
        if (move.effect === 'drain') {
            const healAmt = Math.round(damage * 0.5);
            attacker.heal(healAmt / attacker.maxHp);
            this.effects.addDamageNumber(attacker.x, attacker.y, -healAmt, false);
        }

        // Recoil
        if (move.effect === 'recoil' && attacker.ability !== 'Rock Head') {
            const recoil = Math.round(damage * 0.25);
            attacker.hp -= recoil;
            attacker.triggerHitFlash();
        }

        // Self-destruct KOs user
        if (move.effect === 'selfKO') {
            const hasDamp = allAlive && allAlive.some(p => p.ability === 'Damp' && p.distanceTo(attacker) < AOE_RANGE);
            if (hasDamp) {
                this.onEvent(`A Pokemon's Damp prevented the explosion!`);
                return;
            }
            attacker.hp = 0;
            this.onEvent(`${attacker.name} fainted from the explosion!`);
            if (!attacker.eliminating) {
                attacker.startElimination(defender);
                this.effects.spawnEliminationBurst(attacker.x, attacker.y, attacker.types);
                this.effects.shake(20, 500);
                this.onElimination(defender, attacker);
            }
        }

        // AOE: hit nearby Pokemon
        if (move.aoe && allAlive) {
            const origin = animType === 'wave' ? attacker : defender;
            const bystanders = allAlive.filter(p => {
                if (p === attacker || p === defender) return false;
                if (!p.alive || p.eliminating) return false;
                if (p.distanceTo(origin) >= AOE_RANGE) return false;
                // In endless mode, AOE only hits enemies
                if (attacker._isPlayerTeam !== undefined && p._isPlayerTeam !== undefined) {
                    if (attacker._isPlayerTeam === p._isPlayerTeam) return false;
                }
                return true;
            });
            for (const bystander of bystanders) {
                const bMult = getTypeMultiplier(move.type, bystander.types);
                const bDmg = Math.max(1, Math.round(damage * 0.6 * bMult));
                bystander.hp -= bDmg;
                bystander.lastDamagedAt = Date.now();
                attacker.stats.damageDealt += bDmg;
                bystander.stats.damageTaken += bDmg;
                bystander.triggerHitFlash();
                bystander.triggerKnockback(origin.x, origin.y);
                this.effects.addDamageNumber(bystander.x, bystander.y, bDmg, bMult > 1);
                this.effects.spawnAttackEffect(bystander.x, bystander.y, move.type);
                // AOE damage also charges energy
                bystander.gainEnergy(ENERGY_BASE_ON_HIT + (bDmg / bystander.maxHp) * ENERGY_DAMAGE_SCALE);
                if (bMult > 1) {
                    this.onEvent(`${bystander.name} caught in AOE! Super effective! (-${bDmg})`);
                } else {
                    this.onEvent(`${bystander.name} caught in AOE! (-${bDmg})`);
                }
                this._checkLethal(bystander, attacker);
            }
        }

        // Check primary target elimination
        this._checkLethal(defender, attacker);
        if (attacker.hp <= 0 && !attacker.eliminating) {
            this._handleElimination(attacker, defender);
        }
    }

    _executeDefenseMove(user, move) {
        this.effects.addMoveLabel(user.x, user.y - 45, move.name, move.type);

        switch (move.effect) {
            case 'defUp':
                user.boostStat('def', 1);
                user.triggerBuffGlow('rgba(100, 150, 255, 0.6)');
                this.onEvent(`${user.name} used ${move.name}! Defense rose!`);
                break;
            case 'defUp2':
                user.boostStat('def', 2);
                user.triggerBuffGlow('rgba(100, 150, 255, 0.6)');
                this.onEvent(`${user.name} used ${move.name}! Defense sharply rose!`);
                break;
            case 'spDefUp':
                user.boostStat('spDef', 1);
                user.triggerBuffGlow('rgba(200, 100, 255, 0.6)');
                this.onEvent(`${user.name} used ${move.name}! Sp. Def rose!`);
                break;
            case 'spDefUp2':
                user.boostStat('spDef', 2);
                user.triggerBuffGlow('rgba(200, 100, 255, 0.6)');
                this.onEvent(`${user.name} used ${move.name}! Sp. Def sharply rose!`);
                break;
            case 'shield':
                user.triggerShield();
                user.triggerBuffGlow('rgba(100, 220, 255, 0.6)');
                this.onEvent(`${user.name} used ${move.name}! Protected!`);
                break;
            case 'heal':
                user.heal(0.4);
                user.triggerBuffGlow('rgba(100, 255, 100, 0.6)');
                this.effects.addDamageNumber(user.x, user.y, -Math.round(user.maxHp * 0.4), false);
                this.onEvent(`${user.name} used ${move.name}! HP restored!`);
                break;
            case 'evasionUp':
                user.boostStat('spd', 1);
                user.triggerBuffGlow('rgba(255, 255, 200, 0.6)');
                this.onEvent(`${user.name} used ${move.name}! Evasion rose!`);
                break;
            default:
                user.boostStat('def', 1);
                user.triggerBuffGlow('rgba(100, 150, 255, 0.6)');
                this.onEvent(`${user.name} used ${move.name}!`);
        }
        this.effects.spawnDefenseEffect(user.x, user.y);
    }

    _executeEnhanceMove(user, target, move) {
        this.effects.addMoveLabel(user.x, user.y - 45, move.name, move.type);

        const boosts = {
            'atkUp':        () => { user.boostStat('atk', 1); return 'Attack rose!'; },
            'atkUp2':       () => { user.boostStat('atk', 2); return 'Attack sharply rose!'; },
            'spAtkUp2':     () => { user.boostStat('spAtk', 2); return 'Sp. Atk sharply rose!'; },
            'spdUp2':       () => { user.boostStat('spd', 2); return 'Speed sharply rose!'; },
            'atkSpdUp':     () => { user.boostStat('atk', 1); user.boostStat('spd', 1); return 'Attack and Speed rose!'; },
            'atkDefUp':     () => { user.boostStat('atk', 1); user.boostStat('def', 1); return 'Attack and Defense rose!'; },
            'atkSpAtkUp':   () => { user.boostStat('atk', 1); user.boostStat('spAtk', 1); return 'Attack and Sp. Atk rose!'; },
            'spAtkSpDefUp': () => { user.boostStat('spAtk', 1); user.boostStat('spDef', 1); return 'Sp. Atk and Sp. Def rose!'; },
            'critUp':       () => { user.boostStat('atk', 1); return 'Getting pumped!'; },
            'atkDown':      () => { target.boostStat('atk', -1); return `${target.name}'s Attack fell!`; },
            'defDown':      () => { target.boostStat('def', -1); return `${target.name}'s Defense fell!`; },
            'defDown2':     () => { target.boostStat('def', -2); return `${target.name}'s Defense harshly fell!`; },
            'allBoost':     () => { for (const s of ['atk','def','spAtk','spDef','spd']) user.boostStat(s, 1); return 'All stats rose!'; },
        };

        const fn = boosts[move.effect] || (() => { user.boostStat('atk', 1); return 'Attack rose!'; });
        const resultMsg = fn();
        const isDebuff = move.effect && move.effect.includes('Down');

        user.triggerBuffGlow(isDebuff ? 'rgba(255, 100, 100, 0.6)' : 'rgba(255, 200, 50, 0.6)');
        this.onEvent(`${user.name} used ${move.name}! ${resultMsg}`);
        this.effects.spawnBuffEffect(user.x, user.y);
    }

    _executeStatusMove(user, target, move) {
        this.effects.addMoveLabel(user.x, user.y - 45, move.name, move.type);

        if (user.ability !== 'Compound Eyes' && Math.random() > 0.75) {
            this.onEvent(`${user.name} used ${move.name}! But it missed!`);
            return;
        }

        if (target.statusEffect) {
            this.onEvent(`${user.name} used ${move.name}! But it failed!`);
            return;
        }

        // Ability: status immunity
        if (this._abilityBlocksStatus(target, move.effect)) {
            this.effects.addMoveLabel(user.x, user.y - 45, move.name, move.type);
            return;
        }

        // Soundproof
        if (target.ability === 'Soundproof' && Math.random() < 0.50) {
            this.onEvent(`${target.name}'s Soundproof blocked ${move.name}!`);
            this.effects.addMoveLabel(user.x, user.y - 45, move.name, move.type);
            return;
        }

        const statuses = {
            'sleep':    { status: 'sleep',    timer: 4000, msg: `${target.name} fell asleep!` },
            'paralyze': { status: 'paralyze', timer: 6000, msg: `${target.name} is paralyzed!`, extra: () => target.boostStat('spd', -1) },
            'poison':   { status: 'poison',   timer: 8000, msg: `${target.name} was poisoned!` },
            'toxic':    { status: 'toxic',    timer: 10000, msg: `${target.name} was badly poisoned!` },
            'confuse':  { status: 'confuse',  timer: 4000, msg: `${target.name} became confused!` },
            'burn':     { status: 'burn',     timer: 8000, msg: `${target.name} was burned!` },
            'freeze':   { status: 'freeze',   timer: 5000, msg: `${target.name} was frozen!` },
            'leechSeed':{ status: 'poison',   timer: 6000, msg: `${target.name} was seeded!` },
            'speedDown':{ status: null, timer: 0, msg: `${target.name}'s Speed fell!`, extra: () => target.boostStat('spd', -1) },
            'accDown':  { status: null, timer: 0, msg: `${target.name}'s accuracy fell!`, extra: () => target.boostStat('spd', -1) },
        };

        const s = statuses[move.effect];
        if (s) {
            if (s.status) {
                target.statusEffect = s.status;
                target.statusTimer = s.timer;
                this.effects.spawnStatusInflict(target.x, target.y, s.status);
            }
            if (s.extra) s.extra();
            this.onEvent(`${user.name} used ${move.name}! ${s.msg}`);
        } else {
            this.onEvent(`${user.name} used ${move.name}!`);
        }

        this.effects.spawnAttackEffect(target.x, target.y, move.type);
    }

    _checkLethal(target, attacker) {
        if (target.hp <= 0) {
            // Sturdy: survive first lethal hit
            if (target.ability === 'Sturdy' && !target.abilityState.sturdyUsed) {
                target.hp = 1;
                target.abilityState.sturdyUsed = true;
                this.onEvent(`${target.name}'s Sturdy held on!`);
                this._tryCommentary(pickTemplate('focusSash', { name: target.name }), 'clutch');
                return;
            }
            if (target.focusSash) {
                target.hp = 1;
                target.focusSash = false;
                this.effects.spawnFocusSashEffect(target.x, target.y);
                this.onEvent(`${target.name}'s Focus Sash saved it from fainting!`);
                this._tryCommentary(pickTemplate('focusSash', { name: target.name }), 'clutch');
            } else {
                this._handleElimination(target, attacker);
            }
        }
    }

    _handleElimination(eliminated, eliminator) {
        eliminated.hp = 0;
        if (!eliminated.eliminating) {
            eliminated.startElimination(eliminator);
            this.effects.spawnEliminationBurst(eliminated.x, eliminated.y, eliminated.types);
            this.effects.shake(15, 400);
            this.music?.playSFX('elimination');
            eliminator.target = null; // Will reassign next frame
            eliminator.heal(HEAL_PERCENT);
            eliminator.combatCooldown = 500;
            // Partial stat reset after elimination
            for (const stat in eliminator.statMods) {
                eliminator.statMods[stat] = Math.round(eliminator.statMods[stat] * 0.7);
            }

            // Track kills and check evolution
            if (eliminator.alive && !eliminator.eliminating) {
                eliminator.killCount++;
                eliminator.stats.kills++;

                // Commentary: kill streaks
                if (eliminator.stats.kills === 3) {
                    this._tryCommentary(pickTemplate('killStreak3', { name: eliminator.name }), 'hype');
                } else if (eliminator.stats.kills >= 5 && eliminator.stats.kills % 2 === 1) {
                    this._tryCommentary(pickTemplate('killStreak5', { name: eliminator.name }), 'hype');
                }

                // Commentary: upset kill (attacker BST much lower than defender)
                if (eliminator.baseStats && eliminated.baseStats) {
                    const aBst = Object.values(eliminator.baseStats).reduce((a, b) => a + b, 0);
                    const dBst = Object.values(eliminated.baseStats).reduce((a, b) => a + b, 0);
                    if (aBst < dBst - 100) {
                        this._tryCommentary(pickTemplate('upset', { name: eliminator.name, target: eliminated.name }), 'upset');
                    }
                }

                // Commentary: comeback kill (attacker at low HP)
                if (eliminator.hp / eliminator.maxHp < 0.2) {
                    this._tryCommentary(pickTemplate('comeback', { name: eliminator.name }), 'clutch');
                }

                if (eliminator.canEvolve()) {
                    const evoData = eliminator.getEvolutionData();
                    if (evoData) {
                        const oldName = eliminator.evolve(evoData);
                        this.effects.spawnEvolutionEffect(eliminator.x, eliminator.y);
                        this.music?.playSFX('evolution');
                        this.onEvent(`${oldName} evolved into ${eliminator.name}!`);
                        this._tryCommentary(pickTemplate('evolution', { name: eliminator.name }), 'hype');
                    }
                }
            }

            this.onElimination(eliminator, eliminated);
        }
    }

    // --- ABILITY HELPERS ---

    _applyAbilityOnBeforeHit(attacker, defender, damage, move) {
        const ability = defender.ability;
        if (!ability) return { damage, nullified: false };

        const moveType = move ? move.type : (attacker.getAtk() >= attacker.getSpAtk() ? 'normal' : 'normal');

        if (ability === 'Levitate' && moveType === 'ground') {
            this.onEvent(`${defender.name}'s Levitate made it immune!`);
            return { damage: 0, nullified: true };
        }
        if (ability === 'Water Absorb' && moveType === 'water') {
            const heal = Math.round(defender.maxHp * 0.10);
            defender.heal(heal / defender.maxHp);
            this.effects.addDamageNumber(defender.x, defender.y, -heal, false);
            this.onEvent(`${defender.name}'s Water Absorb restored HP!`);
            return { damage: 0, nullified: true };
        }
        if (ability === 'Volt Absorb' && moveType === 'electric') {
            const heal = Math.round(defender.maxHp * 0.10);
            defender.heal(heal / defender.maxHp);
            this.effects.addDamageNumber(defender.x, defender.y, -heal, false);
            this.onEvent(`${defender.name}'s Volt Absorb restored HP!`);
            return { damage: 0, nullified: true };
        }
        if (ability === 'Flash Fire' && moveType === 'fire') {
            defender.abilityState.flashFireActive = true;
            this.onEvent(`${defender.name}'s Flash Fire powered up its Fire moves!`);
            return { damage: 0, nullified: true };
        }
        if (ability === 'Thick Fat' && (moveType === 'fire' || moveType === 'ice')) {
            damage = Math.round(damage * 0.5);
        }
        if (ability === 'Marvel Scale' && defender.statusEffect) {
            damage = Math.round(damage * 0.67);
        }
        if (ability === 'Sand Veil' && Math.random() < 0.10) {
            this.onEvent(`${defender.name} avoided the attack with Sand Veil!`);
            return { damage: 0, nullified: true };
        }
        return { damage, nullified: false };
    }

    _applyAbilityOnDealDamage(attacker, defender, damage, move) {
        const ability = attacker.ability;
        if (!ability) return damage;

        const hpRatio = attacker.hp / attacker.maxHp;

        if (ability === 'Overgrow' && hpRatio < 0.33 && move && move.type === 'grass') {
            damage = Math.round(damage * 1.5);
        } else if (ability === 'Blaze' && hpRatio < 0.33 && move && move.type === 'fire') {
            damage = Math.round(damage * 1.5);
        } else if (ability === 'Torrent' && hpRatio < 0.33 && move && move.type === 'water') {
            damage = Math.round(damage * 1.5);
        }
        if (ability === 'Guts' && attacker.statusEffect && move && move.cat === MOVE_CAT.PHYSICAL) {
            damage = Math.round(damage * 1.5);
        }
        if (ability === 'Technician' && move && move.power && move.power <= 60) {
            damage = Math.round(damage * 1.5);
        }
        if (ability === 'Flash Fire' && attacker.abilityState.flashFireActive && move && move.type === 'fire') {
            damage = Math.round(damage * 1.5);
        }
        return damage;
    }

    _applyAbilityOnTakeDamage(attacker, defender) {
        const ability = defender.ability;
        if (!ability) return;

        if (ability === 'Static' && Math.random() < 0.30 && !attacker.statusEffect) {
            attacker.statusEffect = 'paralyze';
            attacker.statusTimer = 4000;
            attacker.boostStat('spd', -1);
            this.onEvent(`${defender.name}'s Static paralyzed ${attacker.name}!`);
        }
        if (ability === 'Poison Point' && Math.random() < 0.30 && !attacker.statusEffect) {
            attacker.statusEffect = 'poison';
            attacker.statusTimer = 6000;
            this.onEvent(`${defender.name}'s Poison Point poisoned ${attacker.name}!`);
        }
        if (ability === 'Flame Body' && Math.random() < 0.30 && !attacker.statusEffect) {
            attacker.statusEffect = 'burn';
            attacker.statusTimer = 6000;
            this.onEvent(`${defender.name}'s Flame Body burned ${attacker.name}!`);
        }
        if (ability === 'Synchronize' && defender.statusEffect && !attacker.statusEffect && Math.random() < 0.50) {
            const status = defender.statusEffect;
            if (status === 'poison' || status === 'paralyze' || status === 'burn') {
                attacker.statusEffect = status;
                attacker.statusTimer = 4000;
                this.onEvent(`${defender.name}'s Synchronize passed ${status} to ${attacker.name}!`);
            }
        }
    }

    _abilityBlocksStatus(target, statusType) {
        const ability = target.ability;
        if (!ability) return false;

        if (ability === 'Insomnia' && statusType === 'sleep') {
            this.onEvent(`${target.name}'s Insomnia prevents sleep!`);
            return true;
        }
        if (ability === 'Limber' && statusType === 'paralyze') {
            this.onEvent(`${target.name}'s Limber prevents paralysis!`);
            return true;
        }
        if (ability === 'Own Tempo' && statusType === 'confuse') {
            this.onEvent(`${target.name}'s Own Tempo prevents confusion!`);
            return true;
        }
        if (ability === 'Oblivious' && (statusType === 'confuse' || statusType === 'sleep')) {
            this.onEvent(`${target.name}'s Oblivious prevents ${statusType}!`);
            return true;
        }
        if (ability === 'Inner Focus' && statusType === 'confuse') {
            this.onEvent(`${target.name}'s Inner Focus prevents confusion!`);
            return true;
        }
        return false;
    }

    triggerEntryAbilities(pokemons) {
        const alive = pokemons.filter(p => p.alive);
        for (const p of alive) {
            if (p.ability === 'Intimidate') {
                const nearby = alive.filter(other => {
                    if (other === p || other.distanceTo(p) >= 150) return false;
                    if (p._isPlayerTeam !== undefined && other._isPlayerTeam !== undefined && p._isPlayerTeam === other._isPlayerTeam) return false;
                    return true;
                });
                for (const target of nearby) {
                    target.boostStat('atk', -1);
                }
                if (nearby.length > 0) {
                    this.onEvent(`${p.name}'s Intimidate lowered nearby Pokemon's Attack!`);
                }
            }
            if (p.ability === 'Arena Trap') {
                const nearby = alive.filter(other => {
                    if (other === p || other.distanceTo(p) >= 150) return false;
                    if (p._isPlayerTeam !== undefined && other._isPlayerTeam !== undefined && p._isPlayerTeam === other._isPlayerTeam) return false;
                    return true;
                });
                for (const target of nearby) {
                    target.boostStat('spd', -1);
                }
                if (nearby.length > 0) {
                    this.onEvent(`${p.name}'s Arena Trap slowed nearby Pokemon!`);
                }
            }
        }
    }
}
