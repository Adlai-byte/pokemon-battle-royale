# Pokemon Battle Royale - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web-based Pokemon Battle Royale where Gen 1 Pokemon fight in an RNG-driven arena with animated sprites and particle effects.

**Architecture:** Single-page vanilla JS app using HTML5 Canvas for the arena. Pokemon data (stats, types) hardcoded. Sprites loaded from PokeAPI CDN. CSS overlay for settings/HUD. Game loop via requestAnimationFrame.

**Tech Stack:** HTML5 Canvas, Vanilla JavaScript (ES modules), CSS3

---

### Task 1: Project Scaffold & HTML Entry Point

**Files:**
- Create: `index.html`
- Create: `css/styles.css`
- Create: `js/main.js`

**Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pokemon Battle Royale</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <canvas id="arena"></canvas>

    <!-- Settings Screen Overlay -->
    <div id="settings-screen" class="overlay">
        <div class="settings-container">
            <h1 class="title">Pokemon Battle Royale</h1>
            <div class="setting-group">
                <label>Roster Size</label>
                <div class="roster-buttons" id="roster-buttons">
                    <button data-count="10">10</button>
                    <button data-count="25">25</button>
                    <button data-count="50" class="active">50</button>
                    <button data-count="100">100</button>
                    <button data-count="151">151</button>
                </div>
            </div>
            <div class="setting-group">
                <label>Speed: <span id="speed-label">1.0x</span></label>
                <input type="range" id="speed-slider" min="0.5" max="3" step="0.1" value="1">
            </div>
            <button id="start-btn" class="start-button">Start Battle Royale</button>
        </div>
    </div>

    <!-- Battle HUD Overlay -->
    <div id="hud" class="overlay hidden">
        <div class="hud-top">
            <span id="remaining-count">Remaining: 0 / 0</span>
            <div class="hud-controls">
                <label>Speed: <span id="hud-speed-label">1.0x</span></label>
                <input type="range" id="hud-speed-slider" min="0.5" max="3" step="0.1" value="1">
                <button id="pause-btn">Pause</button>
            </div>
        </div>
        <div id="event-log" class="event-log"></div>
    </div>

    <!-- Victory Screen Overlay -->
    <div id="victory-screen" class="overlay hidden">
        <div class="victory-container">
            <h1>Winner!</h1>
            <img id="winner-sprite" src="" alt="Winner">
            <h2 id="winner-name"></h2>
            <button id="play-again-btn" class="start-button">Play Again</button>
        </div>
    </div>

    <script type="module" src="js/main.js"></script>
</body>
</html>
```

**Step 2: Create `css/styles.css`** with base layout

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    overflow: hidden;
    background: #000;
    font-family: 'Segoe UI', system-ui, sans-serif;
    color: #fff;
}

canvas#arena {
    display: block;
    width: 100vw;
    height: 100vh;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
}

.overlay > * {
    pointer-events: auto;
}

.hidden {
    display: none !important;
}

/* Settings Screen */
#settings-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.85);
    pointer-events: auto;
}

.settings-container {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 2px solid #e94560;
    border-radius: 16px;
    padding: 40px 50px;
    text-align: center;
    max-width: 500px;
    width: 90%;
}

.title {
    font-size: 2.5rem;
    margin-bottom: 30px;
    background: linear-gradient(to right, #e94560, #f5a623, #e94560);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
    to { background-position: 200% center; }
}

.setting-group {
    margin-bottom: 24px;
    text-align: left;
}

.setting-group label {
    display: block;
    margin-bottom: 10px;
    font-size: 1.1rem;
    color: #a0a0c0;
}

.roster-buttons {
    display: flex;
    gap: 8px;
}

.roster-buttons button {
    flex: 1;
    padding: 10px;
    border: 2px solid #333;
    border-radius: 8px;
    background: #0a0a1a;
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
}

.roster-buttons button:hover {
    border-color: #e94560;
}

.roster-buttons button.active {
    border-color: #e94560;
    background: #e94560;
    color: #fff;
}

input[type="range"] {
    width: 100%;
    accent-color: #e94560;
}

.start-button {
    margin-top: 20px;
    padding: 14px 40px;
    font-size: 1.3rem;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #e94560, #c0392b);
    color: #fff;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
}

.start-button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
}

/* HUD */
.hud-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    font-size: 1.1rem;
}

.hud-controls {
    display: flex;
    align-items: center;
    gap: 12px;
}

.hud-controls label {
    font-size: 0.9rem;
    color: #a0a0c0;
}

.hud-controls input[type="range"] {
    width: 100px;
}

#pause-btn {
    padding: 6px 16px;
    border: 1px solid #e94560;
    border-radius: 6px;
    background: transparent;
    color: #e94560;
    cursor: pointer;
    font-size: 0.9rem;
}

#pause-btn:hover {
    background: #e94560;
    color: #fff;
}

.event-log {
    position: fixed;
    right: 12px;
    top: 60px;
    width: 280px;
    max-height: calc(100vh - 80px);
    overflow-y: auto;
    padding: 8px;
    font-size: 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.event-log::-webkit-scrollbar {
    width: 4px;
}
.event-log::-webkit-scrollbar-thumb {
    background: #e94560;
    border-radius: 2px;
}

.event-log .event {
    background: rgba(0, 0, 0, 0.7);
    padding: 6px 10px;
    border-radius: 6px;
    border-left: 3px solid #e94560;
    animation: slideIn 0.3s ease-out;
}

.event-log .event.elimination {
    border-left-color: #ff4444;
    background: rgba(80, 0, 0, 0.7);
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}

/* Victory Screen */
#victory-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.85);
    pointer-events: auto;
}

.victory-container {
    text-align: center;
}

.victory-container h1 {
    font-size: 3rem;
    color: #f5a623;
    margin-bottom: 20px;
    animation: pulse 1s ease-in-out infinite alternate;
}

@keyframes pulse {
    from { transform: scale(1); }
    to { transform: scale(1.1); }
}

#winner-sprite {
    width: 192px;
    height: 192px;
    image-rendering: pixelated;
    margin-bottom: 16px;
}

.victory-container h2 {
    font-size: 2rem;
    margin-bottom: 30px;
}

/* Elimination Banner */
.elimination-banner {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    border: 2px solid #ff4444;
    border-radius: 12px;
    padding: 16px 32px;
    font-size: 1.3rem;
    z-index: 20;
    animation: bannerPop 2s ease-out forwards;
    white-space: nowrap;
}

@keyframes bannerPop {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    15% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
    25% { transform: translate(-50%, -50%) scale(1); }
    75% { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%, -50%) translateY(-30px); }
}
```

**Step 3: Create `js/main.js`** with a minimal stub

```js
// js/main.js - App entry point
console.log('Pokemon Battle Royale loaded');
```

**Step 4: Verify by opening index.html in browser**

Open `index.html` in a browser. You should see the settings screen with title, roster buttons, speed slider, and start button styled correctly on a dark background.

**Step 5: Commit**

```bash
git add index.html css/styles.css js/main.js
git commit -m "feat: scaffold project with HTML, CSS, and entry point"
```

---

### Task 2: Gen 1 Pokemon Data Module

**Files:**
- Create: `js/data.js`

**Step 1: Create `js/data.js`** with all 151 Gen 1 Pokemon

This file exports an array of all 151 Gen 1 Pokemon with their name, types, and base stats. Sprite URLs follow the pattern `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`.

```js
// js/data.js - Gen 1 Pokemon data
// Each entry: { id, name, types: [type1, type2?], stats: { hp, attack, defense, spAtk, spDef, speed } }

export const TYPE_CHART = {
    // type_chart[attackType][defenseType] = multiplier
    normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
    fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
    dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

// For types not listed in a matchup, the multiplier is 1.0 (neutral)
export function getTypeMultiplier(attackType, defenseTypes) {
    let multiplier = 1;
    for (const defType of defenseTypes) {
        const chart = TYPE_CHART[attackType];
        if (chart && chart[defType] !== undefined) {
            multiplier *= chart[defType];
        }
    }
    return multiplier;
}

export const POKEMON_DATA = [
    { id: 1, name: "Bulbasaur", types: ["grass","poison"], stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 }},
    { id: 2, name: "Ivysaur", types: ["grass","poison"], stats: { hp: 60, attack: 62, defense: 63, spAtk: 80, spDef: 80, speed: 60 }},
    { id: 3, name: "Venusaur", types: ["grass","poison"], stats: { hp: 80, attack: 82, defense: 83, spAtk: 100, spDef: 100, speed: 80 }},
    { id: 4, name: "Charmander", types: ["fire"], stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 }},
    { id: 5, name: "Charmeleon", types: ["fire"], stats: { hp: 58, attack: 64, defense: 58, spAtk: 80, spDef: 65, speed: 80 }},
    { id: 6, name: "Charizard", types: ["fire","flying"], stats: { hp: 78, attack: 84, defense: 78, spAtk: 109, spDef: 85, speed: 100 }},
    { id: 7, name: "Squirtle", types: ["water"], stats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 }},
    { id: 8, name: "Wartortle", types: ["water"], stats: { hp: 59, attack: 63, defense: 80, spAtk: 65, spDef: 80, speed: 58 }},
    { id: 9, name: "Blastoise", types: ["water"], stats: { hp: 79, attack: 83, defense: 100, spAtk: 85, spDef: 105, speed: 78 }},
    { id: 10, name: "Caterpie", types: ["bug"], stats: { hp: 45, attack: 30, defense: 35, spAtk: 20, spDef: 20, speed: 45 }},
    { id: 11, name: "Metapod", types: ["bug"], stats: { hp: 50, attack: 20, defense: 55, spAtk: 25, spDef: 25, speed: 30 }},
    { id: 12, name: "Butterfree", types: ["bug","flying"], stats: { hp: 60, attack: 45, defense: 50, spAtk: 90, spDef: 80, speed: 70 }},
    { id: 13, name: "Weedle", types: ["bug","poison"], stats: { hp: 40, attack: 35, defense: 30, spAtk: 20, spDef: 20, speed: 50 }},
    { id: 14, name: "Kakuna", types: ["bug","poison"], stats: { hp: 45, attack: 25, defense: 50, spAtk: 25, spDef: 25, speed: 35 }},
    { id: 15, name: "Beedrill", types: ["bug","poison"], stats: { hp: 65, attack: 90, defense: 40, spAtk: 45, spDef: 80, speed: 75 }},
    { id: 16, name: "Pidgey", types: ["normal","flying"], stats: { hp: 40, attack: 45, defense: 40, spAtk: 35, spDef: 35, speed: 56 }},
    { id: 17, name: "Pidgeotto", types: ["normal","flying"], stats: { hp: 63, attack: 60, defense: 55, spAtk: 50, spDef: 50, speed: 71 }},
    { id: 18, name: "Pidgeot", types: ["normal","flying"], stats: { hp: 83, attack: 80, defense: 75, spAtk: 70, spDef: 70, speed: 101 }},
    { id: 19, name: "Rattata", types: ["normal"], stats: { hp: 30, attack: 56, defense: 35, spAtk: 25, spDef: 35, speed: 72 }},
    { id: 20, name: "Raticate", types: ["normal"], stats: { hp: 55, attack: 81, defense: 60, spAtk: 50, spDef: 70, speed: 97 }},
    { id: 21, name: "Spearow", types: ["normal","flying"], stats: { hp: 40, attack: 60, defense: 30, spAtk: 31, spDef: 31, speed: 70 }},
    { id: 22, name: "Fearow", types: ["normal","flying"], stats: { hp: 65, attack: 90, defense: 65, spAtk: 61, spDef: 61, speed: 100 }},
    { id: 23, name: "Ekans", types: ["poison"], stats: { hp: 35, attack: 60, defense: 44, spAtk: 40, spDef: 54, speed: 55 }},
    { id: 24, name: "Arbok", types: ["poison"], stats: { hp: 60, attack: 95, defense: 69, spAtk: 65, spDef: 79, speed: 80 }},
    { id: 25, name: "Pikachu", types: ["electric"], stats: { hp: 35, attack: 55, defense: 40, spAtk: 50, spDef: 50, speed: 90 }},
    { id: 26, name: "Raichu", types: ["electric"], stats: { hp: 60, attack: 90, defense: 55, spAtk: 90, spDef: 80, speed: 110 }},
    { id: 27, name: "Sandshrew", types: ["ground"], stats: { hp: 50, attack: 75, defense: 85, spAtk: 20, spDef: 30, speed: 40 }},
    { id: 28, name: "Sandslash", types: ["ground"], stats: { hp: 75, attack: 100, defense: 110, spAtk: 45, spDef: 55, speed: 65 }},
    { id: 29, name: "Nidoran♀", types: ["poison"], stats: { hp: 55, attack: 47, defense: 52, spAtk: 40, spDef: 40, speed: 41 }},
    { id: 30, name: "Nidorina", types: ["poison"], stats: { hp: 70, attack: 62, defense: 67, spAtk: 55, spDef: 55, speed: 56 }},
    { id: 31, name: "Nidoqueen", types: ["poison","ground"], stats: { hp: 90, attack: 92, defense: 87, spAtk: 75, spDef: 85, speed: 76 }},
    { id: 32, name: "Nidoran♂", types: ["poison"], stats: { hp: 46, attack: 57, defense: 40, spAtk: 40, spDef: 40, speed: 50 }},
    { id: 33, name: "Nidorino", types: ["poison"], stats: { hp: 61, attack: 72, defense: 57, spAtk: 55, spDef: 55, speed: 65 }},
    { id: 34, name: "Nidoking", types: ["poison","ground"], stats: { hp: 81, attack: 102, defense: 77, spAtk: 85, spDef: 75, speed: 85 }},
    { id: 35, name: "Clefairy", types: ["fairy"], stats: { hp: 70, attack: 45, defense: 48, spAtk: 60, spDef: 65, speed: 35 }},
    { id: 36, name: "Clefable", types: ["fairy"], stats: { hp: 95, attack: 70, defense: 73, spAtk: 95, spDef: 90, speed: 60 }},
    { id: 37, name: "Vulpix", types: ["fire"], stats: { hp: 38, attack: 41, defense: 40, spAtk: 50, spDef: 65, speed: 65 }},
    { id: 38, name: "Ninetales", types: ["fire"], stats: { hp: 73, attack: 76, defense: 75, spAtk: 81, spDef: 100, speed: 100 }},
    { id: 39, name: "Jigglypuff", types: ["normal","fairy"], stats: { hp: 115, attack: 45, defense: 20, spAtk: 45, spDef: 25, speed: 20 }},
    { id: 40, name: "Wigglytuff", types: ["normal","fairy"], stats: { hp: 140, attack: 70, defense: 45, spAtk: 85, spDef: 50, speed: 45 }},
    { id: 41, name: "Zubat", types: ["poison","flying"], stats: { hp: 40, attack: 45, defense: 35, spAtk: 30, spDef: 40, speed: 55 }},
    { id: 42, name: "Golbat", types: ["poison","flying"], stats: { hp: 75, attack: 80, defense: 70, spAtk: 65, spDef: 75, speed: 90 }},
    { id: 43, name: "Oddish", types: ["grass","poison"], stats: { hp: 45, attack: 50, defense: 55, spAtk: 75, spDef: 65, speed: 30 }},
    { id: 44, name: "Gloom", types: ["grass","poison"], stats: { hp: 60, attack: 65, defense: 70, spAtk: 85, spDef: 75, speed: 40 }},
    { id: 45, name: "Vileplume", types: ["grass","poison"], stats: { hp: 75, attack: 80, defense: 85, spAtk: 110, spDef: 90, speed: 50 }},
    { id: 46, name: "Paras", types: ["bug","grass"], stats: { hp: 35, attack: 70, defense: 55, spAtk: 45, spDef: 55, speed: 25 }},
    { id: 47, name: "Parasect", types: ["bug","grass"], stats: { hp: 60, attack: 95, defense: 80, spAtk: 60, spDef: 80, speed: 30 }},
    { id: 48, name: "Venonat", types: ["bug","poison"], stats: { hp: 60, attack: 55, defense: 50, spAtk: 40, spDef: 55, speed: 45 }},
    { id: 49, name: "Venomoth", types: ["bug","poison"], stats: { hp: 70, attack: 65, defense: 60, spAtk: 90, spDef: 75, speed: 90 }},
    { id: 50, name: "Diglett", types: ["ground"], stats: { hp: 10, attack: 55, defense: 25, spAtk: 35, spDef: 45, speed: 95 }},
    { id: 51, name: "Dugtrio", types: ["ground"], stats: { hp: 35, attack: 100, defense: 50, spAtk: 50, spDef: 70, speed: 120 }},
    { id: 52, name: "Meowth", types: ["normal"], stats: { hp: 40, attack: 45, defense: 35, spAtk: 40, spDef: 40, speed: 90 }},
    { id: 53, name: "Persian", types: ["normal"], stats: { hp: 65, attack: 70, defense: 60, spAtk: 65, spDef: 65, speed: 115 }},
    { id: 54, name: "Psyduck", types: ["water"], stats: { hp: 50, attack: 52, defense: 48, spAtk: 65, spDef: 50, speed: 55 }},
    { id: 55, name: "Golduck", types: ["water"], stats: { hp: 80, attack: 82, defense: 78, spAtk: 95, spDef: 80, speed: 85 }},
    { id: 56, name: "Mankey", types: ["fighting"], stats: { hp: 40, attack: 80, defense: 35, spAtk: 35, spDef: 45, speed: 70 }},
    { id: 57, name: "Primeape", types: ["fighting"], stats: { hp: 65, attack: 105, defense: 60, spAtk: 60, spDef: 70, speed: 95 }},
    { id: 58, name: "Growlithe", types: ["fire"], stats: { hp: 55, attack: 70, defense: 45, spAtk: 70, spDef: 50, speed: 60 }},
    { id: 59, name: "Arcanine", types: ["fire"], stats: { hp: 90, attack: 110, defense: 80, spAtk: 100, spDef: 80, speed: 95 }},
    { id: 60, name: "Poliwag", types: ["water"], stats: { hp: 40, attack: 50, defense: 40, spAtk: 40, spDef: 40, speed: 90 }},
    { id: 61, name: "Poliwhirl", types: ["water"], stats: { hp: 65, attack: 65, defense: 65, spAtk: 50, spDef: 50, speed: 90 }},
    { id: 62, name: "Poliwrath", types: ["water","fighting"], stats: { hp: 90, attack: 95, defense: 95, spAtk: 70, spDef: 90, speed: 70 }},
    { id: 63, name: "Abra", types: ["psychic"], stats: { hp: 25, attack: 20, defense: 15, spAtk: 105, spDef: 55, speed: 90 }},
    { id: 64, name: "Kadabra", types: ["psychic"], stats: { hp: 40, attack: 35, defense: 30, spAtk: 120, spDef: 70, speed: 105 }},
    { id: 65, name: "Alakazam", types: ["psychic"], stats: { hp: 55, attack: 50, defense: 45, spAtk: 135, spDef: 95, speed: 120 }},
    { id: 66, name: "Machop", types: ["fighting"], stats: { hp: 70, attack: 80, defense: 50, spAtk: 35, spDef: 35, speed: 35 }},
    { id: 67, name: "Machoke", types: ["fighting"], stats: { hp: 80, attack: 100, defense: 70, spAtk: 50, spDef: 60, speed: 45 }},
    { id: 68, name: "Machamp", types: ["fighting"], stats: { hp: 90, attack: 130, defense: 80, spAtk: 65, spDef: 85, speed: 55 }},
    { id: 69, name: "Bellsprout", types: ["grass","poison"], stats: { hp: 50, attack: 75, defense: 35, spAtk: 70, spDef: 30, speed: 40 }},
    { id: 70, name: "Weepinbell", types: ["grass","poison"], stats: { hp: 65, attack: 90, defense: 50, spAtk: 85, spDef: 45, speed: 55 }},
    { id: 71, name: "Victreebel", types: ["grass","poison"], stats: { hp: 80, attack: 105, defense: 65, spAtk: 100, spDef: 70, speed: 70 }},
    { id: 72, name: "Tentacool", types: ["water","poison"], stats: { hp: 40, attack: 40, defense: 35, spAtk: 50, spDef: 100, speed: 70 }},
    { id: 73, name: "Tentacruel", types: ["water","poison"], stats: { hp: 80, attack: 70, defense: 65, spAtk: 80, spDef: 120, speed: 100 }},
    { id: 74, name: "Geodude", types: ["rock","ground"], stats: { hp: 40, attack: 80, defense: 100, spAtk: 30, spDef: 30, speed: 20 }},
    { id: 75, name: "Graveler", types: ["rock","ground"], stats: { hp: 55, attack: 95, defense: 115, spAtk: 45, spDef: 45, speed: 35 }},
    { id: 76, name: "Golem", types: ["rock","ground"], stats: { hp: 80, attack: 120, defense: 130, spAtk: 55, spDef: 65, speed: 45 }},
    { id: 77, name: "Ponyta", types: ["fire"], stats: { hp: 50, attack: 85, defense: 55, spAtk: 65, spDef: 65, speed: 90 }},
    { id: 78, name: "Rapidash", types: ["fire"], stats: { hp: 65, attack: 100, defense: 70, spAtk: 80, spDef: 80, speed: 105 }},
    { id: 79, name: "Slowpoke", types: ["water","psychic"], stats: { hp: 90, attack: 65, defense: 65, spAtk: 40, spDef: 40, speed: 15 }},
    { id: 80, name: "Slowbro", types: ["water","psychic"], stats: { hp: 95, attack: 75, defense: 110, spAtk: 100, spDef: 80, speed: 30 }},
    { id: 81, name: "Magnemite", types: ["electric","steel"], stats: { hp: 25, attack: 35, defense: 70, spAtk: 95, spDef: 55, speed: 45 }},
    { id: 82, name: "Magneton", types: ["electric","steel"], stats: { hp: 50, attack: 60, defense: 95, spAtk: 120, spDef: 70, speed: 70 }},
    { id: 83, name: "Farfetch'd", types: ["normal","flying"], stats: { hp: 52, attack: 90, defense: 55, spAtk: 58, spDef: 62, speed: 60 }},
    { id: 84, name: "Doduo", types: ["normal","flying"], stats: { hp: 35, attack: 85, defense: 45, spAtk: 35, spDef: 35, speed: 75 }},
    { id: 85, name: "Dodrio", types: ["normal","flying"], stats: { hp: 60, attack: 110, defense: 70, spAtk: 60, spDef: 60, speed: 110 }},
    { id: 86, name: "Seel", types: ["water"], stats: { hp: 65, attack: 45, defense: 55, spAtk: 45, spDef: 70, speed: 45 }},
    { id: 87, name: "Dewgong", types: ["water","ice"], stats: { hp: 90, attack: 70, defense: 80, spAtk: 70, spDef: 95, speed: 70 }},
    { id: 88, name: "Grimer", types: ["poison"], stats: { hp: 80, attack: 80, defense: 50, spAtk: 40, spDef: 50, speed: 25 }},
    { id: 89, name: "Muk", types: ["poison"], stats: { hp: 105, attack: 105, defense: 75, spAtk: 65, spDef: 100, speed: 50 }},
    { id: 90, name: "Shellder", types: ["water"], stats: { hp: 30, attack: 65, defense: 100, spAtk: 45, spDef: 25, speed: 40 }},
    { id: 91, name: "Cloyster", types: ["water","ice"], stats: { hp: 50, attack: 95, defense: 180, spAtk: 85, spDef: 45, speed: 70 }},
    { id: 92, name: "Gastly", types: ["ghost","poison"], stats: { hp: 30, attack: 35, defense: 30, spAtk: 100, spDef: 35, speed: 80 }},
    { id: 93, name: "Haunter", types: ["ghost","poison"], stats: { hp: 45, attack: 50, defense: 45, spAtk: 115, spDef: 55, speed: 95 }},
    { id: 94, name: "Gengar", types: ["ghost","poison"], stats: { hp: 60, attack: 65, defense: 60, spAtk: 130, spDef: 75, speed: 110 }},
    { id: 95, name: "Onix", types: ["rock","ground"], stats: { hp: 35, attack: 45, defense: 160, spAtk: 30, spDef: 45, speed: 70 }},
    { id: 96, name: "Drowzee", types: ["psychic"], stats: { hp: 60, attack: 48, defense: 45, spAtk: 43, spDef: 90, speed: 42 }},
    { id: 97, name: "Hypno", types: ["psychic"], stats: { hp: 85, attack: 73, defense: 70, spAtk: 73, spDef: 115, speed: 67 }},
    { id: 98, name: "Krabby", types: ["water"], stats: { hp: 30, attack: 105, defense: 90, spAtk: 25, spDef: 25, speed: 50 }},
    { id: 99, name: "Kingler", types: ["water"], stats: { hp: 55, attack: 130, defense: 115, spAtk: 50, spDef: 50, speed: 75 }},
    { id: 100, name: "Voltorb", types: ["electric"], stats: { hp: 40, attack: 30, defense: 50, spAtk: 55, spDef: 55, speed: 100 }},
    { id: 101, name: "Electrode", types: ["electric"], stats: { hp: 60, attack: 50, defense: 70, spAtk: 80, spDef: 80, speed: 150 }},
    { id: 102, name: "Exeggcute", types: ["grass","psychic"], stats: { hp: 60, attack: 40, defense: 80, spAtk: 60, spDef: 45, speed: 40 }},
    { id: 103, name: "Exeggutor", types: ["grass","psychic"], stats: { hp: 95, attack: 95, defense: 85, spAtk: 125, spDef: 75, speed: 55 }},
    { id: 104, name: "Cubone", types: ["ground"], stats: { hp: 50, attack: 50, defense: 95, spAtk: 40, spDef: 50, speed: 35 }},
    { id: 105, name: "Marowak", types: ["ground"], stats: { hp: 60, attack: 80, defense: 110, spAtk: 50, spDef: 80, speed: 45 }},
    { id: 106, name: "Hitmonlee", types: ["fighting"], stats: { hp: 50, attack: 120, defense: 53, spAtk: 35, spDef: 110, speed: 87 }},
    { id: 107, name: "Hitmonchan", types: ["fighting"], stats: { hp: 50, attack: 105, defense: 79, spAtk: 35, spDef: 110, speed: 76 }},
    { id: 108, name: "Lickitung", types: ["normal"], stats: { hp: 90, attack: 55, defense: 75, spAtk: 60, spDef: 75, speed: 30 }},
    { id: 109, name: "Koffing", types: ["poison"], stats: { hp: 40, attack: 65, defense: 95, spAtk: 60, spDef: 45, speed: 35 }},
    { id: 110, name: "Weezing", types: ["poison"], stats: { hp: 65, attack: 90, defense: 120, spAtk: 85, spDef: 70, speed: 60 }},
    { id: 111, name: "Rhyhorn", types: ["ground","rock"], stats: { hp: 80, attack: 85, defense: 95, spAtk: 30, spDef: 30, speed: 25 }},
    { id: 112, name: "Rhydon", types: ["ground","rock"], stats: { hp: 105, attack: 130, defense: 120, spAtk: 45, spDef: 45, speed: 40 }},
    { id: 113, name: "Chansey", types: ["normal"], stats: { hp: 250, attack: 5, defense: 5, spAtk: 35, spDef: 105, speed: 50 }},
    { id: 114, name: "Tangela", types: ["grass"], stats: { hp: 65, attack: 55, defense: 115, spAtk: 100, spDef: 40, speed: 60 }},
    { id: 115, name: "Kangaskhan", types: ["normal"], stats: { hp: 105, attack: 95, defense: 80, spAtk: 40, spDef: 80, speed: 90 }},
    { id: 116, name: "Horsea", types: ["water"], stats: { hp: 30, attack: 40, defense: 70, spAtk: 70, spDef: 25, speed: 60 }},
    { id: 117, name: "Seadra", types: ["water"], stats: { hp: 55, attack: 65, defense: 95, spAtk: 95, spDef: 45, speed: 85 }},
    { id: 118, name: "Goldeen", types: ["water"], stats: { hp: 45, attack: 67, defense: 60, spAtk: 35, spDef: 50, speed: 63 }},
    { id: 119, name: "Seaking", types: ["water"], stats: { hp: 80, attack: 92, defense: 65, spAtk: 65, spDef: 80, speed: 68 }},
    { id: 120, name: "Staryu", types: ["water"], stats: { hp: 30, attack: 45, defense: 55, spAtk: 70, spDef: 55, speed: 85 }},
    { id: 121, name: "Starmie", types: ["water","psychic"], stats: { hp: 60, attack: 75, defense: 85, spAtk: 100, spDef: 85, speed: 115 }},
    { id: 122, name: "Mr. Mime", types: ["psychic","fairy"], stats: { hp: 40, attack: 45, defense: 65, spAtk: 100, spDef: 120, speed: 90 }},
    { id: 123, name: "Scyther", types: ["bug","flying"], stats: { hp: 70, attack: 110, defense: 80, spAtk: 55, spDef: 80, speed: 105 }},
    { id: 124, name: "Jynx", types: ["ice","psychic"], stats: { hp: 65, attack: 50, defense: 35, spAtk: 115, spDef: 95, speed: 95 }},
    { id: 125, name: "Electabuzz", types: ["electric"], stats: { hp: 65, attack: 83, defense: 57, spAtk: 95, spDef: 85, speed: 105 }},
    { id: 126, name: "Magmar", types: ["fire"], stats: { hp: 65, attack: 95, defense: 57, spAtk: 100, spDef: 85, speed: 93 }},
    { id: 127, name: "Pinsir", types: ["bug"], stats: { hp: 65, attack: 125, defense: 100, spAtk: 55, spDef: 70, speed: 85 }},
    { id: 128, name: "Tauros", types: ["normal"], stats: { hp: 75, attack: 100, defense: 95, spAtk: 40, spDef: 70, speed: 110 }},
    { id: 129, name: "Magikarp", types: ["water"], stats: { hp: 20, attack: 10, defense: 55, spAtk: 15, spDef: 20, speed: 80 }},
    { id: 130, name: "Gyarados", types: ["water","flying"], stats: { hp: 95, attack: 125, defense: 79, spAtk: 60, spDef: 100, speed: 81 }},
    { id: 131, name: "Lapras", types: ["water","ice"], stats: { hp: 130, attack: 85, defense: 80, spAtk: 85, spDef: 95, speed: 60 }},
    { id: 132, name: "Ditto", types: ["normal"], stats: { hp: 48, attack: 48, defense: 48, spAtk: 48, spDef: 48, speed: 48 }},
    { id: 133, name: "Eevee", types: ["normal"], stats: { hp: 55, attack: 55, defense: 50, spAtk: 45, spDef: 65, speed: 55 }},
    { id: 134, name: "Vaporeon", types: ["water"], stats: { hp: 130, attack: 65, defense: 60, spAtk: 110, spDef: 95, speed: 65 }},
    { id: 135, name: "Jolteon", types: ["electric"], stats: { hp: 65, attack: 65, defense: 60, spAtk: 110, spDef: 95, speed: 130 }},
    { id: 136, name: "Flareon", types: ["fire"], stats: { hp: 65, attack: 130, defense: 60, spAtk: 95, spDef: 110, speed: 65 }},
    { id: 137, name: "Porygon", types: ["normal"], stats: { hp: 65, attack: 60, defense: 70, spAtk: 85, spDef: 75, speed: 40 }},
    { id: 138, name: "Omanyte", types: ["rock","water"], stats: { hp: 35, attack: 40, defense: 100, spAtk: 90, spDef: 55, speed: 35 }},
    { id: 139, name: "Omastar", types: ["rock","water"], stats: { hp: 70, attack: 60, defense: 125, spAtk: 115, spDef: 70, speed: 55 }},
    { id: 140, name: "Kabuto", types: ["rock","water"], stats: { hp: 30, attack: 80, defense: 90, spAtk: 55, spDef: 45, speed: 55 }},
    { id: 141, name: "Kabutops", types: ["rock","water"], stats: { hp: 60, attack: 115, defense: 105, spAtk: 65, spDef: 70, speed: 80 }},
    { id: 142, name: "Aerodactyl", types: ["rock","flying"], stats: { hp: 80, attack: 105, defense: 65, spAtk: 60, spDef: 75, speed: 130 }},
    { id: 143, name: "Snorlax", types: ["normal"], stats: { hp: 160, attack: 110, defense: 65, spAtk: 65, spDef: 110, speed: 30 }},
    { id: 144, name: "Articuno", types: ["ice","flying"], stats: { hp: 90, attack: 85, defense: 100, spAtk: 95, spDef: 125, speed: 85 }},
    { id: 145, name: "Zapdos", types: ["electric","flying"], stats: { hp: 90, attack: 90, defense: 85, spAtk: 125, spDef: 90, speed: 100 }},
    { id: 146, name: "Moltres", types: ["fire","flying"], stats: { hp: 90, attack: 100, defense: 90, spAtk: 125, spDef: 85, speed: 90 }},
    { id: 147, name: "Dratini", types: ["dragon"], stats: { hp: 41, attack: 64, defense: 45, spAtk: 50, spDef: 50, speed: 50 }},
    { id: 148, name: "Dragonair", types: ["dragon"], stats: { hp: 61, attack: 84, defense: 65, spAtk: 70, spDef: 70, speed: 70 }},
    { id: 149, name: "Dragonite", types: ["dragon","flying"], stats: { hp: 91, attack: 134, defense: 95, spAtk: 100, spDef: 100, speed: 80 }},
    { id: 150, name: "Mewtwo", types: ["psychic"], stats: { hp: 106, attack: 110, defense: 90, spAtk: 154, spDef: 90, speed: 130 }},
    { id: 151, name: "Mew", types: ["psychic"], stats: { hp: 100, attack: 100, defense: 100, spAtk: 100, spDef: 100, speed: 100 }},
];

export function getSpriteUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

// Map type names to colors for particles and UI
export const TYPE_COLORS = {
    normal:   { primary: '#A8A878', secondary: '#D8D8C0' },
    fire:     { primary: '#F08030', secondary: '#FFD700' },
    water:    { primary: '#6890F0', secondary: '#98D8F8' },
    electric: { primary: '#F8D030', secondary: '#FFF8A0' },
    grass:    { primary: '#78C850', secondary: '#A8E870' },
    ice:      { primary: '#98D8D8', secondary: '#D0F8F8' },
    fighting: { primary: '#C03028', secondary: '#F08070' },
    poison:   { primary: '#A040A0', secondary: '#D080D0' },
    ground:   { primary: '#E0C068', secondary: '#F8E888' },
    flying:   { primary: '#A890F0', secondary: '#C8B8F8' },
    psychic:  { primary: '#F85888', secondary: '#FF90B0' },
    bug:      { primary: '#A8B820', secondary: '#D0E040' },
    rock:     { primary: '#B8A038', secondary: '#E0D070' },
    ghost:    { primary: '#705898', secondary: '#A088C0' },
    dragon:   { primary: '#7038F8', secondary: '#A078F8' },
    dark:     { primary: '#705848', secondary: '#A89880' },
    steel:    { primary: '#B8B8D0', secondary: '#D8D8E8' },
    fairy:    { primary: '#EE99AC', secondary: '#FFC8D8' },
};
```

**Step 2: Verify** by importing in `main.js` and logging a Pokemon

**Step 3: Commit**

```bash
git add js/data.js
git commit -m "feat: add Gen 1 Pokemon data with types, stats, and type chart"
```

---

### Task 3: Pokemon Class

**Files:**
- Create: `js/pokemon.js`

**Step 1: Create `js/pokemon.js`**

```js
// js/pokemon.js - Pokemon entity with sprite, stats, state, movement, rendering
import { getSpriteUrl, TYPE_COLORS } from './data.js';

const HP_MULTIPLIER = 3; // Scale base HP for longer battles
const SPRITE_SIZE = 64;  // Display size on canvas
const BOB_AMPLITUDE = 3; // Idle bobbing pixels
const BOB_SPEED = 0.003; // Idle bobbing frequency
const MOVE_SPEED = 0.8;  // Base pixels per frame
const WANDER_CHANGE_INTERVAL = 3000; // ms before picking new wander target
const COMBAT_RANGE = 80;  // Pixels - how close to start fighting
const LUNGE_DISTANCE = 20; // Pixels for attack lunge

export class Pokemon {
    constructor(data, arenaWidth, arenaHeight) {
        this.id = data.id;
        this.name = data.name;
        this.types = data.types;
        this.baseStats = data.stats;

        // Battle stats
        this.maxHp = data.stats.hp * HP_MULTIPLIER;
        this.hp = this.maxHp;
        this.attack = data.stats.attack;
        this.defense = data.stats.defense;
        this.spAtk = data.stats.spAtk;
        this.spDef = data.stats.spDef;
        this.speed = data.stats.speed;

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
        this.bobOffset = Math.random() * Math.PI * 2; // Randomize bob phase
        this.alpha = 1;
        this.scale = 1;
        this.flashTimer = 0;    // > 0 means flashing red (got hit)
        this.lungeTimer = 0;    // > 0 means lunging (attacking)
        this.lungeTargetX = 0;
        this.lungeTargetY = 0;
        this.knockbackX = 0;
        this.knockbackY = 0;

        // State
        this.alive = true;
        this.fighting = null; // Reference to opponent Pokemon
        this.combatCooldown = 0;
        this.eliminatedBy = null;

        // Elimination animation
        this.eliminating = false;
        this.elimTimer = 0;

        // Load sprite
        this._loadSprite();
    }

    _loadSprite() {
        this.sprite = new Image();
        this.sprite.crossOrigin = 'anonymous';
        this.sprite.onload = () => { this.spriteLoaded = true; };
        this.sprite.src = getSpriteUrl(this.id);
    }

    update(dt, time) {
        if (!this.alive) return;

        // Elimination animation
        if (this.eliminating) {
            this.elimTimer += dt;
            const progress = this.elimTimer / 500; // 500ms animation
            this.scale = Math.max(0, 1 - progress);
            this.alpha = Math.max(0, 1 - progress);
            if (progress >= 1) {
                this.alive = false;
            }
            return;
        }

        // Flash timer (hit effect)
        if (this.flashTimer > 0) {
            this.flashTimer -= dt;
        }

        // Knockback decay
        this.knockbackX *= 0.85;
        this.knockbackY *= 0.85;

        // Lunge timer (attack animation)
        if (this.lungeTimer > 0) {
            this.lungeTimer -= dt;
        }

        // Combat cooldown
        if (this.combatCooldown > 0) {
            this.combatCooldown -= dt;
        }

        // Wander movement (when not fighting)
        if (!this.fighting) {
            if (time - this.lastWanderChange > WANDER_CHANGE_INTERVAL) {
                this._pickNewWanderTarget();
                this.lastWanderChange = time;
            }
            this._moveTowardTarget(dt);
        }
    }

    _pickNewWanderTarget() {
        const margin = SPRITE_SIZE;
        this.targetX = margin + Math.random() * (this.arenaWidth - margin * 2);
        this.targetY = margin + Math.random() * (this.arenaHeight - margin * 2);
    }

    _moveTowardTarget(dt) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) return;

        const speedFactor = (this.speed / 100) * MOVE_SPEED;
        const step = Math.min(dist, speedFactor * (dt / 16));
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
    }

    startElimination(attacker) {
        this.eliminating = true;
        this.elimTimer = 0;
        this.fighting = null;
        this.eliminatedBy = attacker.name;
    }

    triggerHitFlash() {
        this.flashTimer = 200; // 200ms flash
    }

    triggerLunge(targetX, targetY) {
        this.lungeTimer = 200;
        this.lungeTargetX = targetX;
        this.lungeTargetY = targetY;
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

    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    get isInCombatRange() {
        return COMBAT_RANGE;
    }

    draw(ctx, time) {
        if (!this.alive && !this.eliminating) return;
        if (!this.spriteLoaded) return;

        ctx.save();

        // Position with bobbing + knockback + lunge
        const bob = Math.sin(time * BOB_SPEED + this.bobOffset) * BOB_AMPLITUDE;
        let drawX = this.x + this.knockbackX;
        let drawY = this.y + bob + this.knockbackY;

        // Lunge offset
        if (this.lungeTimer > 0) {
            const lungeProgress = this.lungeTimer / 200;
            const lungeFactor = Math.sin(lungeProgress * Math.PI);
            const ldx = this.lungeTargetX - this.x;
            const ldy = this.lungeTargetY - this.y;
            const ldist = Math.sqrt(ldx * ldx + ldy * ldy) || 1;
            drawX += (ldx / ldist) * LUNGE_DISTANCE * lungeFactor;
            drawY += (ldy / ldist) * LUNGE_DISTANCE * lungeFactor;
        }

        ctx.globalAlpha = this.alpha;

        // Draw sprite
        const halfSize = (SPRITE_SIZE * this.scale) / 2;
        if (this.flashTimer > 0) {
            // Red tint: draw normally then overlay red
            ctx.drawImage(this.sprite, drawX - halfSize, drawY - halfSize, SPRITE_SIZE * this.scale, SPRITE_SIZE * this.scale);
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = 'rgba(255, 50, 50, 0.5)';
            ctx.fillRect(drawX - halfSize, drawY - halfSize, SPRITE_SIZE * this.scale, SPRITE_SIZE * this.scale);
            ctx.globalCompositeOperation = 'source-over';
        } else {
            ctx.drawImage(this.sprite, drawX - halfSize, drawY - halfSize, SPRITE_SIZE * this.scale, SPRITE_SIZE * this.scale);
        }

        // HP Bar (only when alive and not eliminating)
        if (!this.eliminating && this.hp > 0) {
            const barWidth = 50;
            const barHeight = 5;
            const barX = drawX - barWidth / 2;
            const barY = drawY - halfSize - 10;
            const hpPercent = this.hp / this.maxHp;

            // Background
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

            // HP fill (green -> yellow -> red)
            if (hpPercent > 0.5) {
                ctx.fillStyle = `rgb(${Math.floor((1 - hpPercent) * 2 * 255)}, 200, 50)`;
            } else {
                ctx.fillStyle = `rgb(255, ${Math.floor(hpPercent * 2 * 200)}, 50)`;
            }
            ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

            // Name label
            ctx.fillStyle = '#fff';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.name, drawX, barY - 3);
        }

        ctx.restore();
    }
}
```

**Step 2: Commit**

```bash
git add js/pokemon.js
git commit -m "feat: add Pokemon class with movement, combat, and rendering"
```

---

### Task 4: Particle Effects System

**Files:**
- Create: `js/effects.js`

**Step 1: Create `js/effects.js`**

```js
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

class DamageNumber {
    constructor(x, y, damage, color) {
        this.x = x;
        this.y = y;
        this.damage = Math.round(damage);
        this.color = color;
        this.life = 1000; // 1 second
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

export class EffectsManager {
    constructor() {
        this.particles = [];
        this.damageNumbers = [];
        this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
    }

    update(dt) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (!this.particles[i].alive) {
                this.particles.splice(i, 1);
            }
        }

        // Update damage numbers
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            this.damageNumbers[i].update(dt);
            if (!this.damageNumbers[i].alive) {
                this.damageNumbers.splice(i, 1);
            }
        }

        // Update screen shake
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
        for (const p of this.particles) {
            p.draw(ctx);
        }
        ctx.globalAlpha = 1;
        for (const d of this.damageNumbers) {
            d.draw(ctx);
        }
    }

    // Spawn attack particles by type
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
                    // Sub-sparks
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

            default:
                // Generic impact stars
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

    // Elimination burst
    spawnEliminationBurst(x, y, types) {
        const colors = TYPE_COLORS[types[0]] || TYPE_COLORS.normal;
        const count = 30;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
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

    // Confetti for winner
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

    // Floating damage number
    addDamageNumber(x, y, damage, superEffective) {
        const color = superEffective ? '#ff4444' : '#ffffff';
        this.damageNumbers.push(new DamageNumber(
            x + (Math.random() - 0.5) * 20,
            y - 30,
            damage,
            color
        ));
    }

    // Trigger screen shake
    shake(intensity = 8, duration = 200) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }
}
```

**Step 2: Commit**

```bash
git add js/effects.js
git commit -m "feat: add particle effects system with type-specific effects and screen shake"
```

---

### Task 5: Battle Engine

**Files:**
- Create: `js/battle.js`

**Step 1: Create `js/battle.js`**

```js
// js/battle.js - RNG battle engine with type effectiveness
import { getTypeMultiplier } from './data.js';

const COMBAT_RANGE = 80;
const ATTACK_COOLDOWN = 800;  // ms between attacks
const HEAL_PERCENT = 0.12;    // 12% heal after winning a fight
const BASE_DAMAGE = 15;

export class BattleEngine {
    constructor(effects, onElimination, onEvent) {
        this.effects = effects;
        this.onElimination = onElimination;
        this.onEvent = onEvent;
    }

    update(pokemons, dt) {
        const alive = pokemons.filter(p => p.alive && !p.eliminating);

        // Clear dead fighting references
        for (const p of alive) {
            if (p.fighting && (!p.fighting.alive || p.fighting.eliminating)) {
                p.fighting = null;
            }
        }

        // Find new combats
        for (let i = 0; i < alive.length; i++) {
            const a = alive[i];
            if (a.fighting || a.combatCooldown > 0) continue;

            for (let j = i + 1; j < alive.length; j++) {
                const b = alive[j];
                if (b.fighting || b.combatCooldown > 0) continue;

                if (a.distanceTo(b) < COMBAT_RANGE) {
                    a.fighting = b;
                    b.fighting = a;
                    this.onEvent(`${a.name} vs ${b.name}!`);
                    break;
                }
            }
        }

        // Process active combats
        for (const p of alive) {
            if (!p.fighting) continue;
            if (p.combatCooldown > 0) continue;

            const target = p.fighting;
            if (!target.alive || target.eliminating) {
                p.fighting = null;
                continue;
            }

            // Determine who attacks this tick (speed-based with variance)
            const pSpeed = p.speed * (0.8 + Math.random() * 0.4);
            const tSpeed = target.speed * (0.8 + Math.random() * 0.4);

            if (pSpeed >= tSpeed) {
                this._doAttack(p, target);
            }

            p.combatCooldown = ATTACK_COOLDOWN;
        }
    }

    _doAttack(attacker, defender) {
        // Pick attacker's type for the attack
        const attackType = attacker.types[Math.floor(Math.random() * attacker.types.length)];
        const typeMultiplier = getTypeMultiplier(attackType, defender.types);

        // Use higher of atk/spAtk vs lower of def/spDef for simplicity
        const atkStat = Math.max(attacker.attack, attacker.spAtk);
        const defStat = Math.max(defender.defense, defender.spDef);

        // Damage formula
        const rawDamage = BASE_DAMAGE * (atkStat / defStat) * (0.8 + Math.random() * 0.4);
        const damage = Math.max(1, Math.round(rawDamage * typeMultiplier));

        defender.hp -= damage;

        // Visual effects
        attacker.triggerLunge(defender.x, defender.y);
        defender.triggerHitFlash();
        defender.triggerKnockback(attacker.x, attacker.y);
        this.effects.spawnAttackEffect(defender.x, defender.y, attackType);
        this.effects.addDamageNumber(defender.x, defender.y, damage, typeMultiplier > 1);

        if (typeMultiplier > 1) {
            this.effects.shake(10, 250);
        }

        if (typeMultiplier === 0) {
            this.onEvent(`${defender.name} is immune to ${attackType}!`);
        } else if (typeMultiplier > 1) {
            this.onEvent(`Super effective! ${attacker.name} hits ${defender.name} for ${damage}!`);
        }

        // Check elimination
        if (defender.hp <= 0) {
            defender.hp = 0;
            defender.startElimination(attacker);
            this.effects.spawnEliminationBurst(defender.x, defender.y, defender.types);
            this.effects.shake(15, 400);
            attacker.fighting = null;
            attacker.heal(HEAL_PERCENT);
            attacker.combatCooldown = 500;
            this.onElimination(attacker, defender);
        }
    }
}
```

**Step 2: Commit**

```bash
git add js/battle.js
git commit -m "feat: add battle engine with type effectiveness and stat-weighted RNG"
```

---

### Task 6: Arena Renderer

**Files:**
- Create: `js/arena.js`

**Step 1: Create `js/arena.js`**

```js
// js/arena.js - Canvas arena setup, background rendering, camera
export class Arena {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 1200;
        this.height = 800;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Scale to fit arena in viewport
        this.scaleX = this.canvas.width / this.width;
        this.scaleY = this.canvas.height / this.height;
        this.scale = Math.min(this.scaleX, this.scaleY);

        // Center offset
        this.offsetX = (this.canvas.width - this.width * this.scale) / 2;
        this.offsetY = (this.canvas.height - this.height * this.scale) / 2;
    }

    beginFrame(shakeX = 0, shakeY = 0) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();

        // Apply camera transform (scale + center + shake)
        ctx.translate(
            this.offsetX + shakeX * this.scale,
            this.offsetY + shakeY * this.scale
        );
        ctx.scale(this.scale, this.scale);

        // Draw arena background
        this._drawBackground(ctx);
    }

    endFrame() {
        this.ctx.restore();
    }

    _drawBackground(ctx) {
        // Arena ground - grassy battlefield
        const gradient = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 100,
            this.width / 2, this.height / 2, this.width / 2
        );
        gradient.addColorStop(0, '#2d5a1e');
        gradient.addColorStop(0.7, '#1e4a12');
        gradient.addColorStop(1, '#0d2a08');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Arena border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, this.width - 20, this.height - 20);

        // Subtle grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, 150, 0, Math.PI * 2);
        ctx.stroke();
    }
}
```

**Step 2: Commit**

```bash
git add js/arena.js
git commit -m "feat: add arena canvas renderer with background and camera transform"
```

---

### Task 7: UI Manager

**Files:**
- Create: `js/ui.js`

**Step 1: Create `js/ui.js`**

```js
// js/ui.js - Settings panel, HUD, event log, elimination banners
export class UIManager {
    constructor() {
        // Screens
        this.settingsScreen = document.getElementById('settings-screen');
        this.hud = document.getElementById('hud');
        this.victoryScreen = document.getElementById('victory-screen');

        // Settings
        this.rosterButtons = document.querySelectorAll('#roster-buttons button');
        this.speedSlider = document.getElementById('speed-slider');
        this.speedLabel = document.getElementById('speed-label');
        this.startBtn = document.getElementById('start-btn');

        // HUD
        this.remainingCount = document.getElementById('remaining-count');
        this.hudSpeedSlider = document.getElementById('hud-speed-slider');
        this.hudSpeedLabel = document.getElementById('hud-speed-label');
        this.pauseBtn = document.getElementById('pause-btn');
        this.eventLog = document.getElementById('event-log');

        // Victory
        this.winnerSprite = document.getElementById('winner-sprite');
        this.winnerName = document.getElementById('winner-name');
        this.playAgainBtn = document.getElementById('play-again-btn');

        // State
        this.selectedRosterSize = 50;
        this.speed = 1;
        this.paused = false;

        // Callbacks
        this.onStart = null;
        this.onPlayAgain = null;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        // Roster size buttons
        this.rosterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.rosterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedRosterSize = parseInt(btn.dataset.count);
            });
        });

        // Speed sliders (sync both)
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            this.speedLabel.textContent = `${this.speed.toFixed(1)}x`;
            this.hudSpeedSlider.value = this.speed;
            this.hudSpeedLabel.textContent = `${this.speed.toFixed(1)}x`;
        });

        this.hudSpeedSlider.addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            this.hudSpeedLabel.textContent = `${this.speed.toFixed(1)}x`;
            this.speedSlider.value = this.speed;
            this.speedLabel.textContent = `${this.speed.toFixed(1)}x`;
        });

        // Start button
        this.startBtn.addEventListener('click', () => {
            if (this.onStart) this.onStart(this.selectedRosterSize, this.speed);
        });

        // Pause button
        this.pauseBtn.addEventListener('click', () => {
            this.paused = !this.paused;
            this.pauseBtn.textContent = this.paused ? 'Resume' : 'Pause';
        });

        // Play again
        this.playAgainBtn.addEventListener('click', () => {
            if (this.onPlayAgain) this.onPlayAgain();
        });
    }

    showSettings() {
        this.settingsScreen.classList.remove('hidden');
        this.hud.classList.add('hidden');
        this.victoryScreen.classList.add('hidden');
        this.eventLog.innerHTML = '';
        this.paused = false;
        this.pauseBtn.textContent = 'Pause';
    }

    showBattle(total) {
        this.settingsScreen.classList.add('hidden');
        this.hud.classList.remove('hidden');
        this.victoryScreen.classList.add('hidden');
        this.updateRemaining(total, total);
    }

    showVictory(winner) {
        this.hud.classList.add('hidden');
        this.victoryScreen.classList.remove('hidden');
        this.winnerSprite.src = winner.sprite.src;
        this.winnerName.textContent = winner.name;
    }

    updateRemaining(remaining, total) {
        this.remainingCount.textContent = `Remaining: ${remaining} / ${total}`;
    }

    addEvent(text, isElimination = false) {
        const div = document.createElement('div');
        div.className = 'event' + (isElimination ? ' elimination' : '');
        div.textContent = text;
        this.eventLog.appendChild(div);
        this.eventLog.scrollTop = this.eventLog.scrollHeight;

        // Keep only last 50 events
        while (this.eventLog.children.length > 50) {
            this.eventLog.removeChild(this.eventLog.firstChild);
        }
    }

    showEliminationBanner(attackerName, defenderName) {
        const banner = document.createElement('div');
        banner.className = 'elimination-banner';
        banner.innerHTML = `<strong>${defenderName}</strong> was eliminated by <strong>${attackerName}</strong>!`;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 2000);
    }
}
```

**Step 2: Commit**

```bash
git add js/ui.js
git commit -m "feat: add UI manager for settings, HUD, event log, and victory screen"
```

---

### Task 8: Main Game Loop - Tie Everything Together

**Files:**
- Modify: `js/main.js`

**Step 1: Write the full `js/main.js`**

```js
// js/main.js - App entry point, game loop, state management
import { POKEMON_DATA } from './data.js';
import { Pokemon } from './pokemon.js';
import { BattleEngine } from './battle.js';
import { EffectsManager } from './effects.js';
import { Arena } from './arena.js';
import { UIManager } from './ui.js';

class Game {
    constructor() {
        this.arena = new Arena(document.getElementById('arena'));
        this.effects = new EffectsManager();
        this.ui = new UIManager();
        this.pokemons = [];
        this.totalCount = 0;
        this.running = false;
        this.lastTime = 0;
        this.winner = null;

        this.battleEngine = new BattleEngine(
            this.effects,
            (attacker, defender) => this._onElimination(attacker, defender),
            (text) => this.ui.addEvent(text)
        );

        // UI callbacks
        this.ui.onStart = (rosterSize, speed) => this.start(rosterSize);
        this.ui.onPlayAgain = () => this.ui.showSettings();

        // Show settings on load
        this.ui.showSettings();

        // Start render loop (always runs for background)
        this._loop(0);
    }

    start(rosterSize) {
        // Shuffle and pick N pokemon
        const shuffled = [...POKEMON_DATA].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, rosterSize);

        this.pokemons = selected.map(data =>
            new Pokemon(data, this.arena.width, this.arena.height)
        );
        this.totalCount = rosterSize;
        this.winner = null;
        this.running = true;
        this.lastTime = performance.now();

        this.ui.showBattle(this.totalCount);
    }

    _onElimination(attacker, defender) {
        const remaining = this.pokemons.filter(p => p.alive && !p.eliminating).length;
        this.ui.updateRemaining(remaining, this.totalCount);
        this.ui.addEvent(`${defender.name} eliminated by ${attacker.name}!`, true);
        this.ui.showEliminationBanner(attacker.name, defender.name);

        // Check for winner
        if (remaining <= 1) {
            setTimeout(() => {
                this.winner = attacker;
                this.running = false;
                this.effects.spawnConfetti(attacker.x, attacker.y);
                this.ui.showVictory(attacker);
            }, 1000);
        }
    }

    _loop(timestamp) {
        requestAnimationFrame((t) => this._loop(t));

        if (!this.running || this.ui.paused) {
            // Still render the arena when paused
            if (this.running) {
                this.arena.beginFrame(this.effects.screenShake.x, this.effects.screenShake.y);
                for (const p of this.pokemons) {
                    p.draw(this.arena.ctx, timestamp);
                }
                this.effects.draw(this.arena.ctx);
                this.arena.endFrame();
            }
            this.lastTime = timestamp;
            return;
        }

        const rawDt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        const dt = Math.min(rawDt, 50) * this.ui.speed; // Cap dt, apply speed

        // Update
        for (const p of this.pokemons) {
            p.update(dt, timestamp);
        }
        this.battleEngine.update(this.pokemons, dt);
        this.effects.update(dt);

        // Render
        this.arena.beginFrame(this.effects.screenShake.x, this.effects.screenShake.y);
        for (const p of this.pokemons) {
            p.draw(this.arena.ctx, timestamp);
        }
        this.effects.draw(this.arena.ctx);
        this.arena.endFrame();
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
```

**Step 2: Open `index.html` in browser and verify**

- Settings screen should display correctly
- Click "Start Battle Royale" with 50 Pokemon selected
- Pokemon should load sprites, wander the arena, fight when close, show HP bars, particles, damage numbers
- Eliminations should show banners and log entries
- Speed slider should affect simulation speed
- Pause should freeze the action
- Last Pokemon standing triggers victory screen

**Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: add main game loop tying together arena, pokemon, battle, effects, and UI"
```

---

### Task 9: Polish & Bug Fixes

**Files:**
- Modify: `js/pokemon.js` (fix hit flash rendering with offscreen canvas)
- Modify: `css/styles.css` (responsive tweaks)

**Step 1: Fix the red flash rendering**

The red flash in `pokemon.js` uses `source-atop` composite which won't work as expected on a shared canvas. Fix by using a temporary tint approach:

In `pokemon.js`, update the `draw` method's flash section to use a simpler approach - draw the sprite, then draw a red rectangle clipped to the sprite area:

```js
// Replace the flash drawing section in draw():
if (this.flashTimer > 0) {
    ctx.drawImage(this.sprite, drawX - halfSize, drawY - halfSize, SPRITE_SIZE * this.scale, SPRITE_SIZE * this.scale);
    // Simple red overlay using globalAlpha
    const flashAlpha = (this.flashTimer / 200) * 0.4;
    ctx.fillStyle = `rgba(255, 50, 50, ${flashAlpha})`;
    ctx.fillRect(drawX - halfSize, drawY - halfSize, SPRITE_SIZE * this.scale, SPRITE_SIZE * this.scale);
} else {
    ctx.drawImage(this.sprite, drawX - halfSize, drawY - halfSize, SPRITE_SIZE * this.scale, SPRITE_SIZE * this.scale);
}
```

**Step 2: Verify visuals look correct**

Open browser, start a battle, watch for hit flashes appearing as red overlays on hit Pokemon.

**Step 3: Commit**

```bash
git add js/pokemon.js css/styles.css
git commit -m "fix: improve hit flash rendering and responsive styling"
```

---

### Task 10: Final Integration Test

**Step 1: Full playthrough test**

Open `index.html` in browser and verify:
- [ ] Settings screen loads with roster buttons and speed slider
- [ ] Starting with 10 Pokemon works (quick test)
- [ ] Starting with 151 Pokemon works (stress test)
- [ ] Pokemon sprites load from PokeAPI
- [ ] Pokemon wander and engage in combat
- [ ] Type effectiveness affects damage (super effective shows red numbers)
- [ ] HP bars display and deplete correctly
- [ ] Particle effects fire for different types
- [ ] Screen shake on super effective hits
- [ ] Elimination banners appear
- [ ] Event log scrolls and shows events
- [ ] Speed slider works during battle
- [ ] Pause/Resume works
- [ ] Victory screen shows with winner name and sprite
- [ ] "Play Again" returns to settings
- [ ] No console errors

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete Pokemon Battle Royale v1.0"
```
