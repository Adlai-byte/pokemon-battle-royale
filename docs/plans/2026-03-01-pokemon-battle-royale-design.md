# Pokemon Battle Royale - Design Document

## Overview
A web-based Pokemon Battle Royale simulator where Gen 1 Pokemon fight in a free-for-all arena powered by RNG weighted by actual base stats. Users watch the chaos unfold with smooth sprite-based animations and particle effects.

## Tech Stack
- HTML5 Canvas for arena rendering
- Vanilla JavaScript (no frameworks)
- CSS for UI overlays (settings panel, HUD)
- Pokemon sprites from PokeAPI CDN

## User Flow

### Landing Screen
- Title: "Pokemon Battle Royale"
- Settings panel:
  - **Roster Size:** Presets (10 / 25 / 50 / 100 / 151) - how many Pokemon to randomly draw from Gen 1 pool
  - **Speed Control:** Slider (0.5x to 3x simulation speed)
- "Start Battle Royale" button

### During Battle
- Top HUD: "Remaining: X / Y" counter
- Speed control slider accessible during battle
- Event log: scrolling text feed on side ("Charizard eliminated Bulbasaur!")
- Pause/Resume button

### End Screen
- Winner Pokemon displayed large with celebration effects
- "Play Again" button returns to settings

## Architecture

```
├── index.html          - Single page entry
├── css/
│   └── styles.css      - Settings panel, overlays, UI styling
├── js/
│   ├── main.js         - App entry, game loop, state management
│   ├── arena.js        - Canvas rendering, background, camera
│   ├── pokemon.js      - Pokemon class (stats, sprite, state, HP, movement)
│   ├── battle.js       - Battle engine (RNG combat, type matchups, elimination)
│   ├── effects.js      - Particle system (fire, water, lightning, etc.)
│   ├── ui.js           - Settings panel, HUD, counters, event log
│   └── data.js         - Gen 1 Pokemon data (names, types, base stats, sprite URLs)
└── assets/
    └── (sprites loaded from PokeAPI CDN at runtime)
```

## Battle Mechanics

### Setup
1. N Pokemon randomly selected from 151 Gen 1 Pokemon
2. Each gets real base stats: HP, Attack, Defense, Sp.Atk, Sp.Def, Speed
3. Each Pokemon placed at random position in the arena
4. HP scaled for battle (base HP * multiplier for longer fights)

### Each Tick
1. Pokemon wander the arena randomly (smooth movement)
2. When two Pokemon are close enough, they enter combat
3. Combat resolution:
   - Attacker determined by Speed stat (with random variance ±20%)
   - Damage = `(Attacker's Attack / Defender's Defense) * random(0.8, 1.2) * type_multiplier`
   - Type effectiveness: 2x super effective, 0.5x not very effective, 0x immune
   - Both Pokemon exchange hits each tick until one reaches 0 HP
4. Eliminated Pokemon plays fade-out + particle burst
5. Surviving Pokemon heals small % (10-15%) and moves on

### Victory
Last Pokemon standing wins the battle royale.

## Visual Effects

### Pokemon Sprites
- Official sprites from PokeAPI (96x96, scaled up with image-rendering: pixelated)
- Idle: gentle bobbing animation (sine wave)
- Moving: smooth lerp between positions
- Attacking: quick lunge toward target + white flash
- Hit: red tint flash + small knockback
- Eliminated: shrink + fade + particle burst

### Particle Effects (by type)
- Fire: orange/red particles rising
- Water: blue splash particles
- Electric: yellow lightning bolts
- Grass: green leaf particles
- Poison: purple bubbles
- Ice: white/cyan crystals
- Normal/Other: white impact stars

### Arena Effects
- Screen shake on powerful hits (super effective)
- Floating damage numbers
- HP bar above each Pokemon (green → yellow → red gradient)
- Elimination banner: "X was eliminated by Y!" slides across screen
- Winner celebration: confetti + zoom-in on winner

### Camera
- Full arena overview (all Pokemon visible)
- Arena is a bounded rectangle/circle
