// js/items.js - Item drops system: items spawn on elimination, picked up by proximity

const ITEM_TYPES = [
    { name: 'Oran Berry',  color: '#4CAF50', icon: '\uD83C\uDF4F', weight: 40, effect: 'healSmall' },  // 🍏
    { name: 'Sitrus Berry', color: '#FFD700', icon: '\uD83C\uDF4B', weight: 25, effect: 'healLarge' }, // 🍋
    { name: 'X Attack',    color: '#F44336', icon: '\u2694\uFE0F',  weight: 15, effect: 'atkBoost' },  // ⚔️
    { name: 'X Speed',     color: '#2196F3', icon: '\uD83D\uDCA8',  weight: 12, effect: 'spdBoost' },  // 💨
    { name: 'Focus Sash',  color: '#FFFFFF', icon: '\uD83C\uDF80',  weight: 8,  effect: 'focusSash' }, // 🎀
];

const TOTAL_WEIGHT = ITEM_TYPES.reduce((sum, t) => sum + t.weight, 0);
const DROP_CHANCE = 0.7;
const PICKUP_RANGE = 40;
const MAGNET_RANGE = 200;
const MAGNET_SPEED = 3;
const ITEM_LIFETIME = 10000; // 10 seconds

function pickRandomItem() {
    let r = Math.random() * TOTAL_WEIGHT;
    for (const item of ITEM_TYPES) {
        r -= item.weight;
        if (r <= 0) return item;
    }
    return ITEM_TYPES[0];
}

class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.lifetime = ITEM_LIFETIME;
        this.alive = true;
        this.bobPhase = Math.random() * Math.PI * 2;
    }

    update(dt, nearestPokemon) {
        this.lifetime -= dt;
        if (this.lifetime <= 0) this.alive = false;

        // Magnet: attract toward nearest Pokemon
        if (nearestPokemon) {
            const dx = nearestPokemon.x - this.x;
            const dy = nearestPokemon.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAGNET_RANGE && dist > 1) {
                // Accelerate as it gets closer
                const pull = MAGNET_SPEED * (1 - dist / MAGNET_RANGE) * (dt / 16);
                this.x += (dx / dist) * pull;
                this.y += (dy / dist) * pull;
            }
        }
    }

    draw(ctx, time) {
        if (!this.alive) return;
        const bob = Math.sin(time * 0.004 + this.bobPhase) * 3;
        const fadeAlpha = this.lifetime < 2000 ? this.lifetime / 2000 : 1;
        const pulse = 0.6 + Math.sin(time * 0.006 + this.bobPhase) * 0.2;

        ctx.save();

        // Outer glow ring
        ctx.fillStyle = this.type.color;
        ctx.globalAlpha = fadeAlpha * 0.2 * pulse;
        ctx.beginPath();
        ctx.arc(this.x, this.y + bob, 16, 0, Math.PI * 2);
        ctx.fill();

        // Icon
        ctx.globalAlpha = fadeAlpha;
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.icon, this.x, this.y + bob);

        // Item name label (small, below)
        ctx.globalAlpha = fadeAlpha * 0.7;
        ctx.font = 'bold 7px sans-serif';
        ctx.fillStyle = this.type.color;
        ctx.fillText(this.type.name, this.x, this.y + bob + 16);

        ctx.restore();
    }
}

export class ItemManager {
    constructor() {
        this.items = [];
    }

    spawnItem(x, y) {
        if (Math.random() > DROP_CHANCE) return;
        const type = pickRandomItem();
        this.items.push(new Item(x, y, type));
    }

    _findNearest(item, pokemons) {
        let nearest = null;
        let nearestDist = Infinity;
        for (const p of pokemons) {
            if (!p.alive || p.eliminating) continue;
            const dx = p.x - item.x;
            const dy = p.y - item.y;
            const dist = dx * dx + dy * dy;
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = p;
            }
        }
        return nearest;
    }

    update(dt, pokemons, effects, onEvent, music) {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const nearest = this._findNearest(item, pokemons);
            item.update(dt, nearest);
            if (!item.alive) {
                this.items.splice(i, 1);
                continue;
            }

            // Check proximity pickup
            for (const p of pokemons) {
                if (!p.alive || p.eliminating) continue;
                const dx = p.x - item.x;
                const dy = p.y - item.y;
                if (dx * dx + dy * dy < PICKUP_RANGE * PICKUP_RANGE) {
                    this._applyItem(item, p, effects, onEvent, music);
                    item.alive = false;
                    this.items.splice(i, 1);
                    break;
                }
            }
        }
    }

    _applyItem(item, pokemon, effects, onEvent, music) {
        effects.spawnItemPickupEffect(pokemon.x, pokemon.y, item.type.color);
        music?.playSFX('itemPickup');
        pokemon.stats.itemsPickedUp++;

        switch (item.type.effect) {
            case 'healSmall':
                pokemon.heal(0.2);
                onEvent(`${pokemon.name} picked up ${item.type.name}! HP restored!`);
                break;
            case 'healLarge':
                pokemon.heal(0.4);
                onEvent(`${pokemon.name} picked up ${item.type.name}! HP greatly restored!`);
                break;
            case 'atkBoost':
                pokemon.boostStat('atk', 2);
                pokemon.triggerBuffGlow('rgba(255, 80, 80, 0.6)');
                onEvent(`${pokemon.name} picked up ${item.type.name}! Attack sharply rose!`);
                break;
            case 'spdBoost':
                pokemon.boostStat('spd', 2);
                pokemon.triggerBuffGlow('rgba(80, 150, 255, 0.6)');
                onEvent(`${pokemon.name} picked up ${item.type.name}! Speed sharply rose!`);
                break;
            case 'focusSash':
                pokemon.focusSash = true;
                pokemon.triggerBuffGlow('rgba(255, 255, 255, 0.6)');
                onEvent(`${pokemon.name} picked up ${item.type.name}! It will survive a lethal hit!`);
                break;
        }
    }

    draw(ctx, time) {
        for (const item of this.items) {
            item.draw(ctx, time);
        }
    }

    clear() {
        this.items = [];
    }
}
