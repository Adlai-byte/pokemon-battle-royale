# Pokemon Abilities Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add game-accurate passive abilities to all 151 Gen 1 Pokemon, replacing existing hardcoded type traits, with ability names shown under sprites and activations logged in the event feed.

**Architecture:** New `js/abilities.js` data module exports a Pokemon ID → ability mapping and an ability effects registry with hook functions. `battle.js` calls these hooks at damage calculation, lethal checks, and DOT phases — replacing the 4 hardcoded type traits. `pokemon.js` stores ability name + state and renders it below the name label.

**Tech Stack:** Vanilla JS (ES modules), Canvas 2D rendering, no build tools.

---

### Task 1: Create `js/abilities.js` — ability data map + effect registry

**Files:**
- Create: `js/abilities.js`

**Step 1: Create the ability data file**

Create `js/abilities.js` with the complete Pokemon ID → ability mapping and the `ABILITY_EFFECTS` registry. Each ability effect has: `description`, `trigger` type, and relevant parameters.

```javascript
// js/abilities.js - Game-accurate abilities for all 151 Gen 1 Pokemon

// Pokemon ID → ability name
export const POKEMON_ABILITIES = {
    // Starters
    1: 'Overgrow', 2: 'Overgrow', 3: 'Overgrow',
    4: 'Blaze', 5: 'Blaze', 6: 'Blaze',
    7: 'Torrent', 8: 'Torrent', 9: 'Torrent',
    // Caterpie line
    10: 'Compound Eyes', 11: 'Compound Eyes', 12: 'Compound Eyes',
    // Weedle line
    13: 'Poison Point', 14: 'Poison Point', 15: 'Poison Point',
    // Pidgey line
    16: 'Keen Eye', 17: 'Keen Eye', 18: 'Keen Eye',
    // Rattata line
    19: 'Guts', 20: 'Guts',
    // Spearow line
    21: 'Keen Eye', 22: 'Keen Eye',
    // Ekans line
    23: 'Intimidate', 24: 'Intimidate',
    // Pikachu line
    25: 'Static', 26: 'Static',
    // Sandshrew line
    27: 'Sand Veil', 28: 'Sand Veil',
    // Nidoran F line
    29: 'Poison Point', 30: 'Poison Point', 31: 'Poison Point',
    // Nidoran M line
    32: 'Poison Point', 33: 'Poison Point', 34: 'Poison Point',
    // Clefairy line
    35: 'Magic Guard', 36: 'Magic Guard',
    // Vulpix line
    37: 'Flash Fire', 38: 'Flash Fire',
    // Jigglypuff line
    39: 'Thick Fat', 40: 'Thick Fat',
    // Zubat line
    41: 'Inner Focus', 42: 'Inner Focus',
    // Oddish line
    43: 'Chlorophyll', 44: 'Chlorophyll', 45: 'Chlorophyll',
    // Paras line
    46: 'Chlorophyll', 47: 'Chlorophyll',
    // Venonat line
    48: 'Compound Eyes', 49: 'Compound Eyes',
    // Diglett line
    50: 'Arena Trap', 51: 'Arena Trap',
    // Meowth line
    52: 'Limber', 53: 'Limber',
    // Psyduck line
    54: 'Damp', 55: 'Damp',
    // Mankey line
    56: 'Guts', 57: 'Guts',
    // Growlithe line
    58: 'Flash Fire', 59: 'Flash Fire',
    // Poliwag line
    60: 'Water Absorb', 61: 'Water Absorb', 62: 'Water Absorb',
    // Abra line
    63: 'Synchronize', 64: 'Synchronize', 65: 'Synchronize',
    // Machop line
    66: 'Guts', 67: 'Guts', 68: 'Guts',
    // Bellsprout line
    69: 'Chlorophyll', 70: 'Chlorophyll', 71: 'Chlorophyll',
    // Tentacool line
    72: 'Poison Point', 73: 'Poison Point',
    // Geodude line
    74: 'Sturdy', 75: 'Sturdy', 76: 'Sturdy',
    // Ponyta line
    77: 'Flash Fire', 78: 'Flash Fire',
    // Slowpoke line
    79: 'Own Tempo', 80: 'Own Tempo',
    // Magnemite line
    81: 'Sturdy', 82: 'Sturdy',
    // Farfetchd
    83: 'Keen Eye',
    // Doduo line
    84: 'Keen Eye', 85: 'Keen Eye',
    // Seel line
    86: 'Thick Fat', 87: 'Thick Fat',
    // Grimer line
    88: 'Sticky Hold', 89: 'Sticky Hold',
    // Shellder line
    90: 'Shell Armor', 91: 'Shell Armor',
    // Gastly line
    92: 'Levitate', 93: 'Levitate', 94: 'Levitate',
    // Onix
    95: 'Sturdy',
    // Drowzee line
    96: 'Insomnia', 97: 'Insomnia',
    // Krabby line
    98: 'Shell Armor', 99: 'Shell Armor',
    // Voltorb line
    100: 'Static', 101: 'Static',
    // Exeggcute line
    102: 'Chlorophyll', 103: 'Chlorophyll',
    // Cubone line
    104: 'Rock Head', 105: 'Rock Head',
    // Hitmonlee
    106: 'Limber',
    // Hitmonchan
    107: 'Inner Focus',
    // Lickitung
    108: 'Own Tempo',
    // Koffing line
    109: 'Levitate', 110: 'Levitate',
    // Rhyhorn line
    111: 'Rock Head', 112: 'Rock Head',
    // Chansey
    113: 'Natural Cure',
    // Tangela
    114: 'Chlorophyll',
    // Kangaskhan
    115: 'Scrappy',
    // Horsea line
    116: 'Swift Swim', 117: 'Swift Swim',
    // Goldeen line
    118: 'Swift Swim', 119: 'Swift Swim',
    // Staryu line
    120: 'Natural Cure', 121: 'Natural Cure',
    // Mr. Mime
    122: 'Soundproof',
    // Scyther
    123: 'Technician',
    // Jynx
    124: 'Oblivious',
    // Electabuzz
    125: 'Static',
    // Magmar
    126: 'Flame Body',
    // Pinsir
    127: 'Hyper Cutter',
    // Tauros
    128: 'Intimidate',
    // Magikarp
    129: 'Swift Swim',
    // Gyarados
    130: 'Intimidate',
    // Lapras
    131: 'Water Absorb',
    // Ditto
    132: 'Imposter',
    // Eevee
    133: 'Adaptability',
    // Vaporeon
    134: 'Water Absorb',
    // Jolteon
    135: 'Volt Absorb',
    // Flareon
    136: 'Flash Fire',
    // Porygon
    137: 'Adaptability',
    // Omanyte line
    138: 'Swift Swim', 139: 'Swift Swim',
    // Kabuto line
    140: 'Swift Swim', 141: 'Swift Swim',
    // Aerodactyl
    142: 'Rock Head',
    // Snorlax
    143: 'Thick Fat',
    // Legendaries
    144: 'Pressure', 145: 'Pressure', 146: 'Flame Body',
    // Dratini line
    147: 'Marvel Scale', 148: 'Marvel Scale', 149: 'Inner Focus',
    // Mewtwo, Mew
    150: 'Pressure', 151: 'Synchronize',
};

// Ability effect definitions
// Each ability has: description (shown in UI), and is looked up by name in battle hooks
export const ABILITY_EFFECTS = {
    // --- Damage boost (low HP) ---
    'Overgrow':      { description: '+50% Grass damage below 33% HP' },
    'Blaze':         { description: '+50% Fire damage below 33% HP' },
    'Torrent':       { description: '+50% Water damage below 33% HP' },

    // --- Damage boost (conditional) ---
    'Guts':          { description: '+50% physical damage when statused' },
    'Adaptability':  { description: 'STAB is 2x instead of 1.5x' },
    'Technician':    { description: 'Moves with power <=60 deal 1.5x' },
    'Hyper Cutter':  { description: 'Attack cannot be lowered' },

    // --- Contact punish ---
    'Static':        { description: '30% chance to paralyze attacker' },
    'Poison Point':  { description: '30% chance to poison attacker' },
    'Flame Body':    { description: '30% chance to burn attacker' },

    // --- Immunities / absorb ---
    'Levitate':      { description: 'Immune to Ground damage' },
    'Flash Fire':    { description: 'Immune to Fire; boosts own Fire damage' },
    'Water Absorb':  { description: 'Immune to Water; heals instead' },
    'Volt Absorb':   { description: 'Immune to Electric; heals instead' },
    'Damp':          { description: 'Nullifies self-destruct moves nearby' },
    'Soundproof':    { description: '50% chance to resist status moves' },

    // --- Damage reduction ---
    'Thick Fat':     { description: 'Halves Fire and Ice damage taken' },
    'Shell Armor':   { description: 'Cannot be critically hit' },
    'Sturdy':        { description: 'Survives first lethal hit at 1 HP' },
    'Marvel Scale':  { description: '+50% defense when statused' },
    'Magic Guard':   { description: 'Immune to DOT damage' },
    'Sand Veil':     { description: '20% dodge chance in sandstorm' },

    // --- Status immunity ---
    'Insomnia':      { description: 'Immune to sleep' },
    'Limber':        { description: 'Immune to paralysis' },
    'Own Tempo':     { description: 'Immune to confusion' },
    'Oblivious':     { description: 'Immune to confusion and sleep' },
    'Natural Cure':  { description: 'Cures status below 50% HP' },

    // --- Speed / weather ---
    'Chlorophyll':   { description: 'Double speed in sun' },
    'Swift Swim':    { description: 'Double speed in rain' },

    // --- Stat / battle control ---
    'Intimidate':    { description: 'Lowers nearby Attack on entry' },
    'Synchronize':   { description: 'Mirrors status back to attacker' },
    'Pressure':      { description: 'Enemies attack 20% slower' },
    'Keen Eye':      { description: 'Immune to accuracy debuffs' },
    'Inner Focus':   { description: 'Immune to confusion; +10% energy' },
    'Arena Trap':    { description: 'Nearby enemies move 30% slower' },
    'Sticky Hold':   { description: 'Stats cannot be lowered' },
    'Scrappy':       { description: 'Normal/Fighting hit Ghost types' },

    // --- Other ---
    'Rock Head':     { description: 'No recoil damage' },
    'Compound Eyes': { description: 'Status moves always land' },
    'Imposter':      { description: 'Copies first target\'s types & stats' },
};

// Helper: get ability name for a Pokemon ID
export function getAbility(pokemonId) {
    return POKEMON_ABILITIES[pokemonId] || null;
}

// Helper: get ability effect info
export function getAbilityEffect(abilityName) {
    return ABILITY_EFFECTS[abilityName] || null;
}
```

**Step 2: Commit**

```
git add js/abilities.js
git commit -m "feat: add abilities.js with full Gen 1 ability assignments and effect registry"
```

---

### Task 2: Wire ability into Pokemon entity (`js/pokemon.js`)

**Files:**
- Modify: `js/pokemon.js`

**Step 1: Import abilities and store on Pokemon**

At the top of `js/pokemon.js`, add import:
```javascript
import { getAbility } from './abilities.js';
```

In the constructor, after `this.lastDamagedAt = 0;`, add:
```javascript
this.ability = getAbility(data.id);
this.abilityState = {}; // Per-ability runtime state (e.g. sturdyUsed, flashFireActive)
```

In `evolve()`, after `this.evolved = true;`, add:
```javascript
this.ability = getAbility(newData.id);
// Preserve sturdy state across evolution (already used = still used)
const sturdyUsed = this.abilityState.sturdyUsed;
this.abilityState = {};
if (sturdyUsed) this.abilityState.sturdyUsed = true;
```

**Step 2: Render ability name under Pokemon name**

In `draw()`, inside the `if (!this.eliminating && this.hp > 0)` block, after the name label `ctx.fillText(this.name, drawX, barY - 3);`, add:
```javascript
// Ability label
if (this.ability) {
    ctx.fillStyle = 'rgba(180, 180, 210, 0.7)';
    ctx.font = '8px sans-serif';
    ctx.fillText(this.ability, drawX, barY - 13);
}
```

**Step 3: Commit**

```
git add js/pokemon.js
git commit -m "feat: store ability on Pokemon, render ability name under sprite"
```

---

### Task 3: Remove hardcoded type traits from `js/battle.js`

**Files:**
- Modify: `js/battle.js`

**Step 1: Remove type trait constants and code**

Remove these constants from the top of `battle.js`:
```javascript
const GHOST_DODGE_CHANCE = 0.20;
const STEEL_DAMAGE_REDUCTION = 0.85;
const GRASS_REGEN_RATE = 0.0005;
const POISON_DOT_REDUCTION = 0.5;
```

In `_applyDOT()`: Remove the grass regen block:
```javascript
// DELETE THIS BLOCK:
if (p.types.includes('grass') && p.hp < p.maxHp && (Date.now() - p.lastDamagedAt) > 3000) {
    p.hp = Math.min(p.maxHp, p.hp + p.maxHp * GRASS_REGEN_RATE * (dt / 16));
}
```

In `_applyDOT()`: Remove the poison DOT reduction:
```javascript
// DELETE THIS LINE:
if (p.types.includes('poison')) dotDmg *= POISON_DOT_REDUCTION;
```

In `_basicAttack()`: Remove the ghost dodge check:
```javascript
// DELETE THIS BLOCK:
if (defender.types.includes('ghost') && Math.random() < GHOST_DODGE_CHANCE) {
    this.onEvent(`${defender.name} phased through the attack!`);
    attacker.combatCooldown = 600;
    return;
}
```

In `_basicAttack()`: Remove the steel damage reduction:
```javascript
// DELETE THIS BLOCK:
if (defender.types.includes('steel')) {
    damage = Math.max(1, Math.round(damage * STEEL_DAMAGE_REDUCTION));
}
```

In `_executeDamagingMove()`: Remove the ghost dodge check:
```javascript
// DELETE THIS BLOCK:
if (defender.types.includes('ghost') && move.type !== 'ghost' && move.type !== 'dark' && Math.random() < GHOST_DODGE_CHANCE) {
    ...
    return;
}
```

In `_executeDamagingMove()`: Remove the steel damage reduction:
```javascript
// DELETE THIS BLOCK:
if (defender.types.includes('steel')) {
    damage = Math.max(1, Math.round(damage * STEEL_DAMAGE_REDUCTION));
}
```

**Step 2: Commit**

```
git add js/battle.js
git commit -m "refactor: remove hardcoded type traits (ghost dodge, steel reduction, grass regen, poison DOT)"
```

---

### Task 4: Add ability hooks to `js/battle.js` — damage phase

**Files:**
- Modify: `js/battle.js`

**Step 1: Import abilities**

At the top of `battle.js`, add:
```javascript
import { getAbilityEffect } from './abilities.js';
```

**Step 2: Add `_applyAbilityOnDealDamage()` helper**

Add this method to BattleEngine. It modifies the damage multiplier based on attacker abilities. Called during damage calculation in both `_basicAttack` and `_executeDamagingMove`:

```javascript
_applyAbilityOnDealDamage(attacker, defender, damage, move) {
    const ability = attacker.ability;
    if (!ability) return damage;

    const hpRatio = attacker.hp / attacker.maxHp;

    // Overgrow / Blaze / Torrent: +50% when below 33% HP
    if (ability === 'Overgrow' && hpRatio < 0.33 && move && move.type === 'grass') {
        damage = Math.round(damage * 1.5);
    } else if (ability === 'Blaze' && hpRatio < 0.33 && move && move.type === 'fire') {
        damage = Math.round(damage * 1.5);
    } else if (ability === 'Torrent' && hpRatio < 0.33 && move && move.type === 'water') {
        damage = Math.round(damage * 1.5);
    }

    // Guts: +50% physical when statused
    if (ability === 'Guts' && attacker.statusEffect && move && move.cat === MOVE_CAT.PHYSICAL) {
        damage = Math.round(damage * 1.5);
    }

    // Technician: +50% for moves with power <= 60
    if (ability === 'Technician' && move && move.power && move.power <= 60) {
        damage = Math.round(damage * 1.5);
    }

    // Flash Fire: +50% fire damage when activated
    if (ability === 'Flash Fire' && attacker.abilityState.flashFireActive && move && move.type === 'fire') {
        damage = Math.round(damage * 1.5);
    }

    // Scrappy: Normal/Fighting moves hit Ghost types (handled via type multiplier override)
    // This is handled in the type multiplier section, not here

    return damage;
}
```

**Step 3: Add `_applyAbilityOnBeforeHit()` helper**

This runs before damage is applied to the defender. Can nullify damage entirely (immunity) or reduce it:

```javascript
_applyAbilityOnBeforeHit(attacker, defender, damage, move) {
    const ability = defender.ability;
    if (!ability) return { damage, nullified: false };

    const moveType = move ? move.type : (attacker.getAtk() >= attacker.getSpAtk() ? 'normal' : 'normal');

    // Levitate: immune to ground
    if (ability === 'Levitate' && moveType === 'ground') {
        this.onEvent(`${defender.name}'s Levitate made it immune!`);
        return { damage: 0, nullified: true };
    }

    // Water Absorb: immune to water, heals
    if (ability === 'Water Absorb' && moveType === 'water') {
        const heal = Math.round(defender.maxHp * 0.10);
        defender.heal(heal / defender.maxHp);
        this.effects.addDamageNumber(defender.x, defender.y, -heal, false);
        this.onEvent(`${defender.name}'s Water Absorb restored HP!`);
        return { damage: 0, nullified: true };
    }

    // Volt Absorb: immune to electric, heals
    if (ability === 'Volt Absorb' && moveType === 'electric') {
        const heal = Math.round(defender.maxHp * 0.10);
        defender.heal(heal / defender.maxHp);
        this.effects.addDamageNumber(defender.x, defender.y, -heal, false);
        this.onEvent(`${defender.name}'s Volt Absorb restored HP!`);
        return { damage: 0, nullified: true };
    }

    // Flash Fire: immune to fire, activates boost
    if (ability === 'Flash Fire' && moveType === 'fire') {
        defender.abilityState.flashFireActive = true;
        this.onEvent(`${defender.name}'s Flash Fire powered up its Fire moves!`);
        return { damage: 0, nullified: true };
    }

    // Thick Fat: halves fire and ice damage
    if (ability === 'Thick Fat' && (moveType === 'fire' || moveType === 'ice')) {
        damage = Math.round(damage * 0.5);
    }

    // Shell Armor: cannot be crit (handled at crit roll, but also enforce here)
    // (Crit nullification handled inline in damage calc)

    // Marvel Scale: +50% defense when statused (applied as damage reduction)
    if (ability === 'Marvel Scale' && defender.statusEffect) {
        damage = Math.round(damage * 0.67); // ~50% more defense = ~33% less damage
    }

    // Sand Veil: 20% dodge (always active, no sandstorm weather in game currently)
    if (ability === 'Sand Veil' && Math.random() < 0.10) {
        this.onEvent(`${defender.name} avoided the attack with Sand Veil!`);
        return { damage: 0, nullified: true };
    }

    return { damage, nullified: false };
}
```

**Step 4: Add `_applyAbilityOnTakeDamage()` helper**

Called after damage is applied — handles contact-punish effects:

```javascript
_applyAbilityOnTakeDamage(attacker, defender) {
    const ability = defender.ability;
    if (!ability) return;

    // Static: 30% chance to paralyze attacker
    if (ability === 'Static' && Math.random() < 0.30 && !attacker.statusEffect) {
        attacker.statusEffect = 'paralyze';
        attacker.statusTimer = 4000;
        attacker.boostStat('spd', -1);
        this.onEvent(`${defender.name}'s Static paralyzed ${attacker.name}!`);
    }

    // Poison Point: 30% chance to poison attacker
    if (ability === 'Poison Point' && Math.random() < 0.30 && !attacker.statusEffect) {
        attacker.statusEffect = 'poison';
        attacker.statusTimer = 6000;
        this.onEvent(`${defender.name}'s Poison Point poisoned ${attacker.name}!`);
    }

    // Flame Body: 30% chance to burn attacker
    if (ability === 'Flame Body' && Math.random() < 0.30 && !attacker.statusEffect) {
        attacker.statusEffect = 'burn';
        attacker.statusTimer = 6000;
        this.onEvent(`${defender.name}'s Flame Body burned ${attacker.name}!`);
    }

    // Synchronize: mirror status to attacker
    if (ability === 'Synchronize' && defender.statusEffect && !attacker.statusEffect) {
        if (Math.random() < 0.50) {
            const status = defender.statusEffect;
            if (status === 'poison' || status === 'paralyze' || status === 'burn') {
                attacker.statusEffect = status;
                attacker.statusTimer = 4000;
                this.onEvent(`${defender.name}'s Synchronize passed ${status} to ${attacker.name}!`);
            }
        }
    }
}
```

**Step 5: Integrate hooks into `_basicAttack()`**

In `_basicAttack()`, after calculating `damage` and before `defender.hp -= damage`:

```javascript
// Ability: before-hit (immunity, reduction)
const beforeHit = this._applyAbilityOnBeforeHit(attacker, defender, damage, null);
if (beforeHit.nullified) {
    attacker.combatCooldown = 600;
    return;
}
damage = beforeHit.damage;

// Ability: deal-damage boost
damage = this._applyAbilityOnDealDamage(attacker, defender, damage, null);
```

After `defender.hp -= damage` and the visual effects, add:
```javascript
// Ability: on-take-damage (contact punish)
this._applyAbilityOnTakeDamage(attacker, defender);
```

**Step 6: Integrate hooks into `_executeDamagingMove()`**

In `_executeDamagingMove()`, handle Scrappy before type multiplier:
```javascript
let typeMultiplier = getTypeMultiplier(move.type, defender.types);
// Scrappy: Normal/Fighting hit Ghost types
if (attacker.ability === 'Scrappy' && (move.type === 'normal' || move.type === 'fighting') && defender.types.includes('ghost')) {
    typeMultiplier = 1;
}
```

Handle Shell Armor at crit roll:
```javascript
const critChance = move.effect === 'highCrit' ? 0.25 : 0.06;
const isCrit = defender.ability === 'Shell Armor' ? false : Math.random() < critChance;
```

Handle Adaptability at STAB calculation:
```javascript
const stab = attacker.types.includes(move.type) ? (attacker.ability === 'Adaptability' ? 2.0 : 1.5) : 1;
```

After calculating raw damage but before applying to HP, add ability hooks:
```javascript
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
```

After damage is applied and visuals play, add:
```javascript
// Ability: on-take-damage
this._applyAbilityOnTakeDamage(attacker, defender);
```

Handle Rock Head — after the recoil block:
```javascript
if (move.effect === 'recoil' && attacker.ability !== 'Rock Head') {
    const recoil = Math.round(damage * 0.25);
    attacker.hp -= recoil;
    attacker.triggerHitFlash();
}
```
(Replace the existing recoil block with this one that checks Rock Head.)

Handle Damp — before self-destruct block:
```javascript
if (move.effect === 'selfKO') {
    // Check if any alive Pokemon nearby has Damp
    const hasDamp = allAlive.some(p => p.ability === 'Damp' && p.distanceTo(attacker) < AOE_RANGE);
    if (hasDamp) {
        this.onEvent(`A Pokemon's Damp prevented the explosion!`);
        attacker.combatCooldown = SPECIAL_COOLDOWN;
        return; // after move label already shown
    }
    // ...existing self-destruct code...
}
```

Handle Compound Eyes — in `_executeStatusMove()`, replace the miss check:
```javascript
if (user.ability !== 'Compound Eyes' && Math.random() > 0.75) {
    this.onEvent(`${user.name} used ${move.name}! But it missed!`);
    return;
}
```

Handle Soundproof — in `_executeStatusMove()`, after miss check:
```javascript
if (target.ability === 'Soundproof' && Math.random() < 0.50) {
    this.onEvent(`${target.name}'s Soundproof blocked ${move.name}!`);
    return;
}
```

**Step 7: Commit**

```
git add js/battle.js
git commit -m "feat: add ability hooks for damage, immunity, contact-punish, and move modifiers"
```

---

### Task 5: Add ability hooks to `js/battle.js` — status, DOT, lethal, and passive phases

**Files:**
- Modify: `js/battle.js`

**Step 1: Status immunity in `_executeStatusMove()`**

After the existing `target.statusEffect` check (line that returns "But it failed!"), add:
```javascript
// Ability: status immunities
if (this._abilityBlocksStatus(target, move.effect)) return;
```

Add the helper method:
```javascript
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
```

**Step 2: DOT immunity in `_applyDOT()`**

In the DOT block, before applying DOT damage:
```javascript
// Magic Guard: immune to DOT
if (p.ability === 'Magic Guard') continue;
```

Also handle Sticky Hold — prevent stat lowering. In `_executeEnhanceMove()`, for debuff effects:
```javascript
// Before applying debuff to target:
if (move.effect && move.effect.includes('Down') && target.ability === 'Sticky Hold') {
    this.onEvent(`${target.name}'s Sticky Hold prevents stat loss!`);
    // Still show the move but skip the debuff
    user.triggerBuffGlow('rgba(255, 100, 100, 0.6)');
    this.onEvent(`${user.name} used ${move.name}! But it failed!`);
    this.effects.spawnBuffEffect(user.x, user.y);
    return;
}
```

Handle Hyper Cutter — in `boostStat()` in `pokemon.js`:
```javascript
boostStat(stat, stages) {
    // Hyper Cutter: attack cannot be lowered
    if (this.ability === 'Hyper Cutter' && stat === 'atk' && stages < 0) return;
    // Keen Eye: accuracy/evasion cannot be lowered (mapped to spd)
    if (this.ability === 'Keen Eye' && stat === 'spd' && stages < 0) return;
    // Sticky Hold: no stat lowering at all
    if (this.ability === 'Sticky Hold' && stages < 0) return;

    this.statMods[stat] = Math.max(-6, Math.min(6, this.statMods[stat] + stages));
}
```

**Step 3: Sturdy in `_checkLethal()`**

In `_checkLethal()`, before the existing focusSash check:
```javascript
// Sturdy: survive first lethal hit at 1 HP
if (target.ability === 'Sturdy' && !target.abilityState.sturdyUsed) {
    target.hp = 1;
    target.abilityState.sturdyUsed = true;
    this.onEvent(`${target.name}'s Sturdy held on!`);
    return;
}
```

**Step 4: Natural Cure — in `_basicAttack` and `_executeDamagingMove`**

After damage is applied to a Pokemon with Natural Cure, check if they dropped below 50%:
```javascript
// Natural Cure: cure status when dropping below 50% HP
if (defender.ability === 'Natural Cure' && defender.statusEffect && defender.hp > 0 && defender.hp / defender.maxHp < 0.5) {
    defender.statusEffect = null;
    defender.statusTimer = 0;
    this.onEvent(`${defender.name}'s Natural Cure removed its status!`);
}
```

**Step 5: Commit**

```
git add js/battle.js js/pokemon.js
git commit -m "feat: add ability hooks for status immunity, DOT, lethal (Sturdy), and stat protection"
```

---

### Task 6: Add passive/entry ability hooks — Intimidate, Pressure, weather speed, Arena Trap, Imposter

**Files:**
- Modify: `js/battle.js`
- Modify: `js/main.js`

**Step 1: Intimidate on battle start**

In `js/main.js`, in `_startBattle()`, inside the countdown callback (after `this.running = true`), add:
```javascript
// Trigger entry abilities (Intimidate)
this.battleEngine.triggerEntryAbilities(this.pokemons);
```

Add method in `BattleEngine`:
```javascript
triggerEntryAbilities(pokemons) {
    const alive = pokemons.filter(p => p.alive);
    for (const p of alive) {
        if (p.ability === 'Intimidate') {
            const nearby = alive.filter(other =>
                other !== p && other.distanceTo(p) < 150
            );
            for (const target of nearby) {
                target.boostStat('atk', -1);
            }
            if (nearby.length > 0) {
                this.onEvent(`${p.name}'s Intimidate lowered nearby Pokemon's Attack!`);
            }
        }
    }
}
```

**Step 2: Pressure — in target selection cooldown**

In `_basicAttack()` and `_executeDamagingMove()`, when setting `combatCooldown`, check if defender has Pressure:
```javascript
// Pressure: enemies attack 20% slower
const pressureMult = defender.ability === 'Pressure' ? 1.2 : 1;
```

In `_basicAttack`, the cooldown line becomes:
```javascript
p.combatCooldown = (BASE_ATTACK_COOLDOWN / Math.max(0.5, p.getSpd() / 80)) * pressureMult;
```

(The pressureMult is applied in the main `update()` loop where cooldown is set. Since it's set after the attack, adjust accordingly — the Pressure check goes where the cooldown is assigned.)

Actually, Pressure is simplest to apply in the main combat loop. In the `update()` method, when setting cooldown after special or auto attack, check if `p.target` has Pressure.

**Step 3: Chlorophyll / Swift Swim — speed modifier**

In `pokemon.js`, modify `getSpd()` to account for weather abilities. The Pokemon needs access to the current weather. Instead of coupling Pokemon to weather, add a `weatherSpeedMult` property:

In `pokemon.js` constructor: `this.weatherSpeedMult = 1;`

In `getSpd()`:
```javascript
getSpd() { return this.speed * this._stageMult(this.statMods.spd) * this.weatherSpeedMult; }
```

In `main.js`, in the `_loop()` update section, before `battleEngine.update()`:
```javascript
// Update weather-based ability speed modifiers
const weatherName = this.weather.currentWeather?.name || 'Clear';
for (const p of this.pokemons) {
    if (!p.alive) continue;
    if (p.ability === 'Chlorophyll' && weatherName === 'Sun') {
        p.weatherSpeedMult = 2;
    } else if (p.ability === 'Swift Swim' && weatherName === 'Rain') {
        p.weatherSpeedMult = 2;
    } else {
        p.weatherSpeedMult = 1;
    }
}
```

**Step 4: Arena Trap — slow nearby enemies**

In the main `_loop()` update, after the weather speed modifiers and before `battleEngine.update()`:
```javascript
// Arena Trap: slow nearby enemies
for (const p of alivePokemons) {
    if (p.ability === 'Arena Trap') {
        for (const other of alivePokemons) {
            if (other !== p && other.distanceTo(p) < COMBAT_RANGE && !other._arenaTrapSlowed) {
                other._arenaTrapSlowed = true;
            }
        }
    }
}
```

This approach is complex. Simpler: handle Arena Trap as a speed debuff in the movement code. In `pokemon.js` `_moveTowardTarget()`, check if any nearby Pokemon has Arena Trap and reduce step. But this requires access to all Pokemon.

Simplest approach: apply Arena Trap as a -1 speed debuff on entry (same as Intimidate), one-time. In `triggerEntryAbilities()`:
```javascript
if (p.ability === 'Arena Trap') {
    const nearby = alive.filter(other =>
        other !== p && other.distanceTo(p) < 150
    );
    for (const target of nearby) {
        target.boostStat('spd', -1);
    }
    if (nearby.length > 0) {
        this.onEvent(`${p.name}'s Arena Trap slowed nearby Pokemon!`);
    }
}
```

**Step 5: Imposter (Ditto)**

In `BattleEngine.update()`, at the start, check for unactivated Imposter:
```javascript
for (const p of alive) {
    if (p.ability === 'Imposter' && !p.abilityState.imposterUsed && p.target) {
        p.abilityState.imposterUsed = true;
        const t = p.target;
        p.types = [...t.types];
        p.attack = t.attack;
        p.defense = t.defense;
        p.spAtk = t.spAtk;
        p.spDef = t.spDef;
        p.speed = t.speed;
        this.onEvent(`${p.name} transformed into ${t.name}'s likeness!`);
    }
}
```

**Step 6: Inner Focus energy boost**

In the energy gain sections of `_basicAttack` and `_executeDamagingMove`, for the defender:
```javascript
const energyMult = defender.ability === 'Inner Focus' ? 1.1 : 1;
defender.gainEnergy((ENERGY_BASE_ON_HIT + (damage / defender.maxHp) * ENERGY_DAMAGE_SCALE) * energyMult);
```

**Step 7: Commit**

```
git add js/battle.js js/main.js js/pokemon.js
git commit -m "feat: add Intimidate, Pressure, weather speed, Arena Trap, Imposter, Inner Focus abilities"
```

---

### Task 7: Show ability on champion select cards (`js/ui.js`)

**Files:**
- Modify: `js/ui.js`
- Modify: `css/styles.css`

**Step 1: Import abilities**

At the top of `js/ui.js`:
```javascript
import { getSpriteUrl } from './data.js';
import { getAbility, getAbilityEffect } from './abilities.js';
```

**Step 2: Add ability to champion cards**

In `showChampionSelect()`, inside the card creation loop, after `name.textContent = poke.name;` and before `card.appendChild(img);`:
```javascript
const abilityName = getAbility(poke.id);
const abilitySpan = document.createElement('span');
abilitySpan.className = 'champion-ability';
abilitySpan.textContent = abilityName || '';
const abilityEffect = getAbilityEffect(abilityName);
if (abilityEffect) abilitySpan.title = abilityEffect.description;
```

Then append it after name:
```javascript
card.appendChild(img);
card.appendChild(name);
card.appendChild(abilitySpan);
```

**Step 3: Add CSS for ability text**

In `css/styles.css`, after `.champion-card span`:
```css
.champion-ability {
    font-size: 0.55rem;
    color: #8888bb;
    margin-top: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 76px;
}
```

**Step 4: Commit**

```
git add js/ui.js css/styles.css
git commit -m "feat: show ability name on champion select cards with tooltip"
```

---

### Task 8: Handle Guts burn interaction and final polish

**Files:**
- Modify: `js/battle.js`

**Step 1: Guts overrides burn attack penalty**

In `_basicAttack()` and `_executeDamagingMove()`, the existing burn check:
```javascript
if (attacker.statusEffect === 'burn') atkStat *= 0.5;
```
Should be modified to:
```javascript
if (attacker.statusEffect === 'burn' && attacker.ability !== 'Guts') atkStat *= 0.5;
```

**Step 2: Commit**

```
git add js/battle.js
git commit -m "fix: Guts overrides burn attack penalty"
```

---

### Task 9: Smoke test in browser

**Step 1: Start local server and open in browser**

```
cd "D:/Pokemon Battle Royale" && npx http-server -p 8080 -c-1
```

**Step 2: Verify checklist**

- [ ] Landing page loads without console errors
- [ ] Champion select shows ability names under each Pokemon
- [ ] Hovering ability shows description tooltip
- [ ] Start battle with 10 Pokemon — countdown works
- [ ] Event log shows ability activations (Intimidate at start, Static/Poison Point during combat)
- [ ] Ability names render under sprites in the arena
- [ ] Watch for an evolution — Pokemon keeps or updates ability
- [ ] No "undefined" or "NaN" in the event log
- [ ] Sturdy triggers when a Pokemon that has it takes lethal damage

**Step 3: Fix any issues found, commit**

```
git add -A
git commit -m "fix: address issues found during smoke test"
```
