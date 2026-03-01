# Feature Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 7 features across 3 phases: sound FX, mobile responsive, share card, auto-camera, enhanced animations, all-time leaderboard, points shop.

**Architecture:** All features extend existing vanilla JS modules. No build tools, no new dependencies. Audio is synthesized via Web Audio API. Data persisted in localStorage. Share card rendered client-side via offscreen canvas.

**Tech Stack:** Vanilla JS (ES modules), Canvas 2D, Web Audio API, CSS3, localStorage

---

## Phase 1: Quick Polish

### Task 1: Add Sound Effects to MusicManager

**Files:**
- Modify: `js/music.js` (add SFX methods after `_playDrum` at line 309)
- Modify: `js/battle.js` (pass music reference, call SFX on hits/elims/evolutions)
- Modify: `js/main.js` (pass music to BattleEngine and ItemManager)
- Modify: `js/items.js` (call SFX on item pickup)

**Step 1: Add SFX methods to MusicManager**

Add these methods to the `MusicManager` class in `js/music.js` before the closing `}`:

```js
playSFX(type) {
    if (!this.ctx || this.muted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t = this.ctx.currentTime;
    switch (type) {
        case 'hit': this._sfxHit(t); break;
        case 'superEffective': this._sfxSuperEffective(t); break;
        case 'crit': this._sfxCrit(t); break;
        case 'elimination': this._sfxElimination(t); break;
        case 'evolution': this._sfxEvolution(t); break;
        case 'itemPickup': this._sfxItemPickup(t); break;
    }
}

_sfxHit(t) {
    const bufSize = this.ctx.sampleRate * 0.06;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    src.connect(g);
    g.connect(this.masterGain);
    src.start(t);
    src.stop(t + 0.06);
}

_sfxSuperEffective(t) {
    // Higher pitch impact + ring
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.15);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
}

_sfxCrit(t) {
    // Sharp crack + bass thud
    const bufSize = this.ctx.sampleRate * 0.04;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    src.connect(g);
    g.connect(this.masterGain);
    src.start(t);
    src.stop(t + 0.04);
    // Bass thud
    const osc = this.ctx.createOscillator();
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.15, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g2);
    g2.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.12);
}

_sfxElimination(t) {
    // Descending tone sweep
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.35);
}

_sfxEvolution(t) {
    // Ascending 3-note arpeggio
    const notes = [261.6, 329.6, 392.0];
    notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;
        const g = this.ctx.createGain();
        const start = t + i * 0.15;
        g.gain.setValueAtTime(0.1, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(start);
        osc.stop(start + 0.2);
    });
}

_sfxItemPickup(t) {
    // Quick chime
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.3, t);
    osc.frequency.setValueAtTime(784.0, t + 0.05);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.12);
}
```

**Step 2: Wire SFX into BattleEngine**

In `js/battle.js`, the constructor takes `(effects, onElimination, onEvent, onCommentary)`. Add a 5th param `musicManager`:

- Modify constructor to accept and store `this.music = musicManager`
- In `_basicAttack()`: after damage is dealt, call `this.music?.playSFX('hit')`
- In `_executeDamagingMove()`: after super-effective check, call `this.music?.playSFX('superEffective')` when `mult >= 1.5`; call `this.music?.playSFX('crit')` when crit occurs
- In `_handleElimination()`: call `this.music?.playSFX('elimination')`; call `this.music?.playSFX('evolution')` when evolution triggers

**Step 3: Wire SFX into main.js and items.js**

In `js/main.js` constructor, pass `this.music` as 5th arg to `BattleEngine`:
```js
this.battleEngine = new BattleEngine(
    this.effects,
    (attacker, defender) => this._onElimination(attacker, defender),
    (text) => this.ui.addEvent(text),
    (text, type) => this.ui.showCommentaryBanner(text, type),
    this.music
);
```

In `js/items.js` `_applyItem()`, accept and call music SFX. Modify `update()` to accept a music param from main.js, or pass a callback. Simplest: in `main.js` `_loop()` where `itemManager.update()` is called, add a post-pickup callback that calls `this.music.playSFX('itemPickup')`.

**Step 4: Verify in browser**
- Open game, start a battle
- Listen for: hit sounds on attacks, higher pitch on super-effective, descending sweep on eliminations, chime on item pickups
- Mute button should silence all SFX

**Step 5: Commit**
```bash
git add js/music.js js/battle.js js/main.js js/items.js
git commit -m "feat: add synthesized sound effects for hits, elims, evolutions, items"
```

---

### Task 2: Mobile Responsive CSS

**Files:**
- Modify: `css/styles.css` (add/extend media queries)
- Modify: `index.html` (add viewport meta — already exists at line 4)

**Step 1: Add mobile breakpoint styles**

Add at end of `css/styles.css`, before the existing `@media (max-width: 768px)` block (which only handles info page sidebar). Add a new block:

```css
/* =========== Mobile Game Layout =========== */
@media (max-width: 900px) {
    .hud-main {
        flex-direction: column;
    }
    .leaderboard {
        width: 100%;
        max-height: 120px;
        border-right: none;
        border-bottom: 3px solid #333;
        order: 2;
    }
    .leaderboard-list {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        padding: 2px 4px;
    }
    .lb-row {
        flex: 1;
        min-width: 120px;
    }
    .arena-wrapper {
        order: 1;
        min-height: 300px;
    }
    .event-log {
        width: 100%;
        max-height: 100px;
        border-left: none;
        border-top: 3px solid #333;
        order: 3;
    }
    .hud-top {
        flex-wrap: wrap;
        gap: 4px;
        font-size: 0.55rem;
    }
    .hud-controls input[type="range"] {
        width: 60px;
    }
    .settings-container {
        padding: 20px 16px;
        max-width: 95%;
    }
    .betting-grid {
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    }
    .betting-card img {
        width: 44px;
        height: 44px;
    }
    .betting-name { font-size: 0.45rem; }
    .betting-actions {
        flex-direction: column;
        gap: 8px;
    }
    .start-button {
        font-size: 0.85rem;
        padding: 12px 24px;
    }
    .victory-container {
        padding: 16px;
        max-height: 90vh;
        overflow-y: auto;
    }
    #winner-sprite {
        width: 128px;
        height: 128px;
    }
    .stats-grid {
        grid-template-columns: 1fr 1fr;
        gap: 4px;
    }
    .features-list {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .title { font-size: 1.25rem; }
    .hud-top { font-size: 0.45rem; }
    .leaderboard { max-height: 80px; font-size: 0.45rem; }
    .event-log { max-height: 70px; font-size: 0.4rem; }
    .lb-sprite { width: 20px; height: 20px; }
    .betting-grid {
        grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
    }
}
```

**Step 2: Verify in browser**
- Open DevTools, toggle device toolbar
- Test at 375px (iPhone SE), 768px (tablet), 1024px+ (desktop)
- Verify: HUD stacks vertically, betting grid reflows, victory screen scrolls, settings fits

**Step 3: Commit**
```bash
git add css/styles.css
git commit -m "feat: add mobile responsive layout for HUD, betting, and victory screens"
```

---

### Task 3: Share Card on Victory Screen

**Files:**
- Modify: `js/ui.js` (add share button + card renderer after victory screen setup)
- Modify: `css/styles.css` (add share button styles)

**Step 1: Add share card renderer to UIManager**

Add method `_renderShareCard(winner, pokemons)` to `UIManager` class in `js/ui.js`:

```js
_renderShareCard(winner, pokemons) {
    const W = 600, H = 400;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, W, H);
    // Border
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, W - 8, H - 8);

    // Title
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 18px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Pokemon Battle Royale', W / 2, 36);

    // Winner label
    ctx.fillStyle = '#f5a623';
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.fillText('Winner', W / 2, 70);

    // Winner name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px "Press Start 2P", monospace';
    ctx.fillText(winner.name, W / 2, 200);

    // Winner sprite (already loaded as Image)
    if (winner.sprite && winner.sprite.complete) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(winner.sprite, W / 2 - 48, 80, 96, 96);
    }

    // Stats
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = '#f5a623';
    ctx.fillText(`${winner.stats.kills} kills`, W / 2, 225);

    // Prediction result
    if (this.predictionState) {
        const correct = winner.originalId === this.predictionState.predictedId;
        ctx.fillStyle = correct ? '#4CAF50' : '#e94560';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText(
            `My pick: ${this.predictionState.predictedName} — ${correct ? 'Correct!' : 'Wrong'}`,
            W / 2, 250
        );
    }

    // Points
    const pointsData = this._loadPoints();
    if (pointsData.totalPoints > 0) {
        ctx.fillStyle = '#f5a623';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText(`${pointsData.totalPoints} total pts`, W / 2, 275);
    }

    // Battle stats row
    if (pokemons && pokemons.length > 0) {
        const mvp = [...pokemons].sort((a, b) => b.stats.kills - a.stats.kills)[0];
        ctx.fillStyle = '#a0a0c0';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText(`MVP: ${mvp.name} (${mvp.stats.kills} kills) | ${pokemons.length} Pokemon`, W / 2, 310);
    }

    // Footer
    ctx.fillStyle = '#555';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText('pokemon-battle-royale-tau.vercel.app', W / 2, H - 16);

    return canvas;
}
```

**Step 2: Add share button to showVictory**

In `showVictory()`, after inserting the battle stats div and before `this.playAgainBtn`, add:

```js
// Share button
const oldShare = this.victoryScreen.querySelector('.share-btn');
if (oldShare) oldShare.remove();
const shareBtn = document.createElement('button');
shareBtn.className = 'start-button share-btn';
shareBtn.textContent = 'Share Result';
shareBtn.addEventListener('click', async () => {
    const card = this._renderShareCard(winner, pokemons);
    card.toBlob(async (blob) => {
        if (navigator.share && navigator.canShare) {
            try {
                const file = new File([blob], 'battle-result.png', { type: 'image/png' });
                await navigator.share({ files: [file], title: 'Pokemon Battle Royale' });
            } catch (e) {
                this._downloadBlob(blob, 'battle-result.png');
            }
        } else {
            this._downloadBlob(blob, 'battle-result.png');
        }
    }, 'image/png');
});
this.playAgainBtn.before(shareBtn);
```

Add helper:
```js
_downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
```

**Step 3: Add share button CSS**

```css
.share-btn {
    background: #1a1a2e !important;
    border-color: #f5a623 !important;
    color: #f5a623 !important;
    font-size: 0.7rem !important;
    margin-top: 8px;
}
.share-btn:hover {
    background: #f5a623 !important;
    color: #000 !important;
}
```

**Step 4: Verify in browser**
- Win a battle, click "Share Result"
- On desktop: downloads `battle-result.png`
- Open the PNG: should show retro styled card with winner, stats, prediction

**Step 5: Commit**
```bash
git add js/ui.js css/styles.css
git commit -m "feat: add share card with downloadable/shareable battle result image"
```

---

### Task 4: Phase 1 Integration Test & Deploy

**Step 1: Full verification**
- Fresh page load, no console errors
- Start battle with 10 Pokemon at 3x speed
- Hear hit sounds, elimination sounds
- Win battle, see points, click Share, verify PNG
- Resize window to mobile width, verify HUD stacks properly
- Test tournament mode still works

**Step 2: Commit & push & deploy**
```bash
git push origin master
vercel --prod --yes
```

---

## Phase 2: Spectator & Animations

### Task 5: Camera System in Arena

**Files:**
- Modify: `js/arena.js` (add Camera object, modify beginFrame/endFrame)
- Modify: `js/main.js` (update camera target each frame, add minimap drawing)
- Modify: `js/ui.js` (add auto-cam toggle button)
- Modify: `css/styles.css` (auto-cam button style)

**Step 1: Add camera state to Arena**

In `js/arena.js`, add to constructor:
```js
this.camera = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
this.autoCam = true;
```

Modify `beginFrame(shakeX, shakeY)`:
```js
beginFrame(shakeX, shakeY) {
    this.ctx.save();
    // Apply camera transform
    const cx = this.width / 2;
    const cy = this.height / 2;
    this.ctx.translate(cx, cy);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-this.camera.x - cx, -this.camera.y - cy);
    // Screen shake
    if (shakeX || shakeY) this.ctx.translate(shakeX, shakeY);
    this._drawBackground();
}
```

Add method `updateCamera(dt)`:
```js
updateCamera(dt) {
    const lerp = Math.min(1, dt * 0.002);
    this.camera.x += (this.camera.targetX - this.camera.x) * lerp;
    this.camera.y += (this.camera.targetY - this.camera.y) * lerp;
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * lerp;
}

resetCamera() {
    this.camera = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
}
```

**Step 2: Add focus scoring in main.js**

In `_loop()`, before rendering, add camera focus logic:
```js
if (this.arena.autoCam && alivePokemons.length > 1) {
    // Find most exciting cluster
    let bestScore = -1, bestX = this.arena.width / 2, bestY = this.arena.height / 2;
    for (const p of alivePokemons) {
        let score = p.stats.kills * 10;
        score += (1 - p.hp / p.maxHp) * 30; // Low HP = exciting
        const nearby = alivePokemons.filter(o => o !== p && p.distanceTo(o) < 150).length;
        score += nearby * 15;
        if (score > bestScore) {
            bestScore = score;
            bestX = p.x;
            bestY = p.y;
        }
    }
    this.arena.camera.targetX = bestX - this.arena.width / 2;
    this.arena.camera.targetY = bestY - this.arena.height / 2;
    this.arena.camera.targetZoom = alivePokemons.length <= 5 ? 1.0 : 1.2;
} else {
    this.arena.camera.targetX = 0;
    this.arena.camera.targetY = 0;
    this.arena.camera.targetZoom = 1;
}
this.arena.updateCamera(dt);
```

**Step 3: Add minimap**

After `this.arena.endFrame()` in `_loop()`, draw minimap:
```js
if (this.arena.autoCam && this.arena.camera.zoom > 1.05) {
    const mw = 140, mh = 90, mx = this.arena.ctx.canvas.width - mw - 8, my = 8;
    const ctx = this.arena.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(mx, my, mw, mh);
    const sx = mw / this.arena.width, sy = mh / this.arena.height;
    for (const p of this.pokemons) {
        if (!p.alive) continue;
        ctx.fillStyle = p.alive && !p.eliminating ? '#4CAF50' : '#555';
        ctx.fillRect(mx + p.x * sx - 2, my + p.y * sy - 2, 4, 4);
    }
    // Camera viewport box
    ctx.strokeStyle = '#f5a623';
    ctx.lineWidth = 1;
    const vw = this.arena.width / this.arena.camera.zoom;
    const vh = this.arena.height / this.arena.camera.zoom;
    const vx = this.arena.camera.x + (this.arena.width - vw) / 2;
    const vy = this.arena.camera.y + (this.arena.height - vh) / 2;
    ctx.strokeRect(mx + vx * sx, my + vy * sy, vw * sx, vh * sy);
    ctx.globalAlpha = 1;
    ctx.restore();
}
```

**Step 4: Add "Your Pick" highlight**

In `js/pokemon.js` `draw()`, add a pulsing golden ring if this Pokemon is the predicted one. The `ui.predictionState.predictedId` needs to be accessible. Simplest: in `main.js`, after betting confirm, set a flag on the matching Pokemon object:
```js
// In _startBattle(), after creating pokemons array:
if (this.ui.predictionState) {
    const pick = this.pokemons.find(p => p.originalId === this.ui.predictionState.predictedId);
    if (pick) pick.isPlayerPick = true;
}
```

In `pokemon.js` `draw()`, before name label, add:
```js
if (this.isPlayerPick && this.alive) {
    ctx.save();
    ctx.strokeStyle = '#f5a623';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 + Math.sin(timestamp * 0.005) * 0.3;
    ctx.beginPath();
    ctx.arc(this.x, this.y - 8, 28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}
```

**Step 5: Add auto-cam toggle to HUD**

In `index.html`, add after mute-btn:
```html
<button id="cam-btn">Auto-Cam</button>
```

In `js/ui.js` constructor, add:
```js
this.camBtn = document.getElementById('cam-btn');
```

In `_setupEventListeners()`:
```js
this.camBtn?.addEventListener('click', () => {
    if (this.onCamToggle) this.onCamToggle();
});
```

In `js/main.js` constructor:
```js
this.ui.onCamToggle = () => {
    this.arena.autoCam = !this.arena.autoCam;
    if (!this.arena.autoCam) this.arena.resetCamera();
    this.ui.camBtn.textContent = this.arena.autoCam ? 'Auto-Cam' : 'Free View';
};
```

Style in `css/styles.css`:
```css
#cam-btn {
    padding: 5px 14px;
    border: 2px solid #f5a623;
    background: transparent;
    color: #f5a623;
    cursor: pointer;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.55rem;
    transition: background 0.1s;
}
#cam-btn:hover {
    background: #f5a623;
    color: #000;
}
```

**Step 6: Reset camera on battle end/new game**

In `main.js` `_onElimination()` when winner found, and in `onPlayAgain`, call `this.arena.resetCamera()`.

**Step 7: Verify**
- Start battle, watch camera auto-pan to action
- See minimap in corner when zoomed
- Toggle Auto-Cam button, verify free view works
- Predicted Pokemon should have golden pulsing ring

**Step 8: Commit**
```bash
git add js/arena.js js/main.js js/pokemon.js js/ui.js index.html css/styles.css
git commit -m "feat: add auto-camera spectator system with minimap and pick highlight"
```

---

### Task 6: Enhanced Animations

**Files:**
- Modify: `js/effects.js` (larger particles, kill streak aura, last-3 spotlight)
- Modify: `js/pokemon.js` (smooth HP bars, kill streak aura rendering)
- Modify: `js/main.js` (slow-mo on crits, last-3 spotlight)
- Modify: `js/battle.js` (trigger slow-mo flag on crits)

**Step 1: Smooth HP bars**

In `js/pokemon.js`, add to constructor: `this.displayHp = this.hp;`

In `update()`, add:
```js
// Smooth HP bar
const hpLerp = Math.min(1, dt * 0.008);
this.displayHp += (this.hp - this.displayHp) * hpLerp;
```

In `draw()`, replace `this.hp / this.maxHp` with `this.displayHp / this.maxHp` for the HP bar rendering.

**Step 2: Kill streak aura**

In `js/pokemon.js` `draw()`, before the sprite, add:
```js
if (this.alive && this.stats.kills >= 3) {
    ctx.save();
    const intensity = Math.min(this.stats.kills, 7) / 7;
    const pulse = 0.5 + Math.sin(timestamp * 0.004) * 0.3;
    ctx.globalAlpha = intensity * pulse * 0.4;
    ctx.fillStyle = this.stats.kills >= 5 ? '#ffd700' : '#f5a623';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 8, 30 + intensity * 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}
```

**Step 3: Larger attack particles**

In `js/effects.js` `spawnAttackEffect()`, increase particle count from 12-24 to 18-36. Add a secondary color layer by spawning half the particles with `secondaryColor` from TYPE_COLORS.

**Step 4: Last-3 spotlight**

In `js/main.js` `_loop()`, before rendering Pokemon, add:
```js
// Last 3 spotlight
if (alivePokemons.length <= 3 && alivePokemons.length > 1) {
    this.arena.ctx.save();
    this.arena.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.arena.ctx.fillRect(0, 0, this.arena.width, this.arena.height);
    for (const p of alivePokemons) {
        this.arena.ctx.save();
        this.arena.ctx.globalCompositeOperation = 'destination-out';
        this.arena.ctx.beginPath();
        this.arena.ctx.arc(p.x, p.y - 8, 50, 0, Math.PI * 2);
        this.arena.ctx.fill();
        this.arena.ctx.restore();
    }
    this.arena.ctx.restore();
}
```

**Step 5: Crit slow-mo**

In `js/main.js`, add: `this.slowMoFrames = 0;`

In `_loop()`, at top of update section:
```js
if (this.slowMoFrames > 0) {
    dt *= 0.3;
    this.slowMoFrames--;
}
```

In `js/battle.js`, when crit occurs in `_executeDamagingMove()`, call a callback. Add `onSlowMo` callback to constructor params. In `main.js`:
```js
this.battleEngine.onSlowMo = () => { this.slowMoFrames = 4; };
```

**Step 6: Verify**
- Watch HP bars drain smoothly
- Pokemon with 3+ kills shows golden aura
- Last 3 standing have spotlight effect
- Crits cause brief slow-motion

**Step 7: Commit**
```bash
git add js/effects.js js/pokemon.js js/main.js js/battle.js
git commit -m "feat: add enhanced animations (smooth HP, kill aura, spotlight, crit slow-mo)"
```

---

### Task 7: Phase 2 Integration Test & Deploy

Same as Task 4: full verification, push, deploy.

---

## Phase 3: Leaderboard & Shop

### Task 8: All-Time Leaderboard Page

**Files:**
- Create: `leaderboard.html`
- Modify: `css/styles.css` (leaderboard page styles)
- Modify: `index.html` (add nav link)

**Step 1: Create leaderboard.html**

Follow the same structure as `credits.html` — page-body, page-container, back-btn, section-cards. Content:

- **Species Rankings**: Table built from `pokemonBRHistory` localStorage. On page load, aggregate: per species → wins, total appearances (count in history), avg kills.
- **Personal Records**: Read from `pokemonBRPoints` and `pokemonBRPredictions`.
- **Type Analysis**: Map each winner to their types from `POKEMON_DATA`, count wins per type, render CSS bar chart.

All logic in an inline `<script type="module">` that imports from `js/data.js`.

**Step 2: Add nav link**

In `index.html` nav-links div:
```html
<a href="leaderboard.html">Leaderboard</a>
```

In `leaderboard.html` nav-links back to index.

**Step 3: Add leaderboard-specific styles**

```css
.lb-table { width: 100%; border-collapse: collapse; font-size: 0.45rem; }
.lb-table th { color: #f5a623; text-align: left; padding: 6px 8px; border-bottom: 2px solid #333; }
.lb-table td { padding: 5px 8px; border-bottom: 1px solid #222; color: #ccc; }
.lb-table tr:hover td { background: #1a1a2e; }
.type-bar { height: 16px; background: #e94560; display: inline-block; min-width: 2px; }
.record-card { display: flex; flex-direction: column; gap: 4px; padding: 12px; background: #12121e; border: 2px solid #222; }
.record-value { font-size: 1rem; color: #f5a623; font-weight: bold; }
.record-label { font-size: 0.4rem; color: #a0a0c0; }
```

**Step 4: Verify**
- Play 2-3 battles, then visit leaderboard.html
- Verify species table shows winners with correct counts
- Verify type bars render proportionally

**Step 5: Commit**
```bash
git add leaderboard.html css/styles.css index.html
git commit -m "feat: add all-time leaderboard page with species rankings and type analysis"
```

---

### Task 9: Points Shop (Arena Themes)

**Files:**
- Modify: `js/ui.js` (add shop section to settings, theme selection)
- Modify: `js/arena.js` (add theme color palettes, apply selected theme)
- Modify: `css/styles.css` (shop UI styles)

**Step 1: Add theme palettes to Arena**

In `js/arena.js`, add constant:
```js
const CUSTOM_THEMES = {
    'neon-night': { bg: '#0a001a', tile1: '#1a0033', tile2: '#0d001a', border: '#ff00ff', accent: '#00ffff', line: '#330066' },
    'classic-green': { bg: '#0a2a0a', tile1: '#0d3d0d', tile2: '#082808', border: '#00ff00', accent: '#88ff88', line: '#1a4a1a' },
    'lava-caves': { bg: '#1a0800', tile1: '#2d0f00', tile2: '#1a0800', border: '#ff4400', accent: '#ff8800', line: '#331100' },
    'frozen-tundra': { bg: '#001a2a', tile1: '#002244', tile2: '#001a33', border: '#44aaff', accent: '#88ccff', line: '#003355' },
};
```

Add method `setTheme(themeId)` that stores `this.customTheme = CUSTOM_THEMES[themeId] || null` and re-renders the offscreen background.

In `_renderOffscreenBg()`, if `this.customTheme` is set, use its colors instead of the tileset-specific colors.

**Step 2: Add shop UI to settings**

In `js/ui.js`, add `_displayShop()` called from `showSettings()`:

```js
_displayShop() {
    let el = document.getElementById('points-shop');
    if (!el) return;
    const shopData = JSON.parse(localStorage.getItem('pokemonBRShop') || '{"owned":[],"selected":null}');
    const pointsData = this._loadPoints();
    const themes = [
        { id: 'neon-night', name: 'Neon Night', cost: 200, color: '#ff00ff' },
        { id: 'classic-green', name: 'Classic Green', cost: 300, color: '#00ff00' },
        { id: 'lava-caves', name: 'Lava Caves', cost: 400, color: '#ff4400' },
        { id: 'frozen-tundra', name: 'Frozen Tundra', cost: 500, color: '#44aaff' },
    ];
    // ... render theme cards with buy/select buttons
}
```

**Step 3: Add shop container to index.html**

After `battle-history` div:
```html
<div id="points-shop" class="points-shop"></div>
```

**Step 4: Wire theme selection to Arena**

In `main.js`, on game start, load selected theme and call `this.arena.setTheme(themeId)`.

**Step 5: Add shop CSS**

```css
.points-shop { margin-bottom: 12px; }
.shop-title { font-size: 0.55rem; color: #f5a623; display: block; margin-bottom: 6px; }
.shop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.shop-card { padding: 8px; background: #12121e; border: 2px solid #222; text-align: center; }
.shop-card-name { font-size: 0.45rem; color: #ccc; }
.shop-card-cost { font-size: 0.4rem; color: #f5a623; }
.shop-buy-btn { /* small button styles */ }
.shop-card.owned { border-color: #4CAF50; }
.shop-card.selected { border-color: #f5a623; outline: 2px solid #f5a623; }
```

**Step 6: Verify**
- Earn enough points (200+), see shop on settings
- Buy "Neon Night" theme — points deducted
- Select it, start battle — arena uses neon colors
- Refresh page — theme persists

**Step 7: Commit**
```bash
git add js/arena.js js/ui.js css/styles.css index.html
git commit -m "feat: add points shop with 4 unlockable arena themes"
```

---

### Task 10: Phase 3 Integration Test & Final Deploy

**Step 1: Full regression test**
- All Phase 1 features (SFX, mobile, share)
- All Phase 2 features (auto-cam, animations)
- All Phase 3 features (leaderboard, shop)
- Tournament mode still works
- Reset button clears everything including shop

**Step 2: Final push & deploy**
```bash
git push origin master
vercel --prod --yes
```
