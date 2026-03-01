# Spectator Betting / Predictions — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a prediction system where players guess the battle winner before it starts, with BST-based tier display and persistent score tracking via localStorage.

**Architecture:** New betting screen overlay inserted between champion select and battle countdown. BST calculated from POKEMON_DATA stats to assign tier labels/colors. Prediction state stored on Game object; localStorage tracks cumulative stats across sessions.

**Tech Stack:** Vanilla JS ES modules, CSS, localStorage

---

### Task 1: Add BST tier helper to `js/ui.js`

**Files:**
- Modify: `js/ui.js:2` (add import for POKEMON_DATA)
- Modify: `js/ui.js` (add helper function)

**Step 1: Add POKEMON_DATA import and BST tier helper**

At the top of `js/ui.js`, change line 2 from:
```javascript
import { getAbility, getAbilityEffect } from './abilities.js';
```
to:
```javascript
import { getAbility, getAbilityEffect } from './abilities.js';
import { POKEMON_DATA } from './data.js';
```

Then add this helper function inside the UIManager class, right before the `_shortNum` method (~line 251):

```javascript
_getBSTTier(pokemonId) {
    const data = POKEMON_DATA.find(d => d.id === pokemonId);
    if (!data) return { label: 'Unknown', cls: 'tier-longshot' };
    const s = data.stats;
    const bst = s.hp + s.attack + s.defense + s.spAtk + s.spDef + s.speed;
    if (bst >= 500) return { label: 'Favorite', cls: 'tier-favorite' };
    if (bst >= 400) return { label: 'Contender', cls: 'tier-contender' };
    if (bst >= 300) return { label: 'Underdog', cls: 'tier-underdog' };
    return { label: 'Longshot', cls: 'tier-longshot' };
}
```

---

### Task 2: Add prediction stats load/save and display on landing page

**Files:**
- Modify: `index.html:29-30` (add prediction stats container)
- Modify: `js/ui.js` constructor (get new DOM elements)
- Modify: `js/ui.js` (add load/save/display methods)

**Step 1: Add prediction stats container to `index.html`**

After the closing `</div>` of `.how-it-works` (line 29) and before the first `.setting-group` (line 31), insert:

```html
<div id="prediction-stats" class="prediction-stats"></div>
```

**Step 2: Add DOM refs and init in UIManager constructor**

In the constructor, after the `this.lbSortKey = 'kills';` line (~line 38), add:

```javascript
this.predictionStatsEl = document.getElementById('prediction-stats');
this.predictionState = null; // set per-battle: { predictedId, predictedName }
```

**Step 3: Add prediction localStorage methods**

Add these methods to UIManager, after `_getBSTTier`:

```javascript
_loadPredictionStats() {
    try {
        const raw = localStorage.getItem('pokemonBRPredictions');
        if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return { totalPredictions: 0, correctPredictions: 0, currentStreak: 0, bestStreak: 0 };
}

_savePredictionStats(stats) {
    localStorage.setItem('pokemonBRPredictions', JSON.stringify(stats));
}

_displayPredictionStats() {
    const stats = this._loadPredictionStats();
    if (stats.totalPredictions === 0) {
        this.predictionStatsEl.innerHTML = '';
        return;
    }
    this.predictionStatsEl.innerHTML = `
        <span class="prediction-stats-text">
            Predictions: ${stats.correctPredictions}/${stats.totalPredictions} correct
            | Streak: ${stats.currentStreak}
            | Best: ${stats.bestStreak}
        </span>
        <button class="prediction-reset-btn" id="reset-predictions-btn">Reset</button>
    `;
    document.getElementById('reset-predictions-btn').addEventListener('click', () => {
        localStorage.removeItem('pokemonBRPredictions');
        this._displayPredictionStats();
    });
}
```

**Step 4: Call `_displayPredictionStats()` in `showSettings()`**

In the `showSettings()` method, after `this.championId = null;` (line 108), add:

```javascript
this.predictionState = null;
this._displayPredictionStats();
```

---

### Task 3: Add the betting screen (`showBettingScreen`)

**Files:**
- Modify: `js/ui.js` (add new callback + showBettingScreen method)

**Step 1: Add callback property**

In the constructor, after `this.onMuteToggle = null;` (~line 44), add:

```javascript
this.onBettingConfirm = null;
```

**Step 2: Add `showBettingScreen(roster)` method**

Add this method after `showChampionSelect`:

```javascript
showBettingScreen(roster) {
    this.settingsScreen.classList.add('hidden');
    this.championScreen.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');

    // Create betting overlay if not exists
    let screen = document.getElementById('betting-screen');
    if (!screen) {
        screen = document.createElement('div');
        screen.id = 'betting-screen';
        screen.className = 'overlay';
        document.body.appendChild(screen);
    }
    screen.classList.remove('hidden');

    let selectedId = null;
    let selectedName = null;

    screen.innerHTML = `
        <div class="betting-container">
            <h1 class="title">Place Your Prediction</h1>
            <p class="betting-subtitle">Who will win the battle royale?</p>
            <div class="betting-grid" id="betting-grid"></div>
            <div class="betting-actions">
                <button class="start-button betting-skip-btn" id="betting-skip">Skip</button>
                <button class="start-button betting-confirm-btn" id="betting-confirm" disabled>Confirm Prediction</button>
            </div>
        </div>
    `;

    const grid = document.getElementById('betting-grid');
    const confirmBtn = document.getElementById('betting-confirm');
    const skipBtn = document.getElementById('betting-skip');

    for (const poke of roster) {
        const tier = this._getBSTTier(poke.id);
        const card = document.createElement('div');
        card.className = `betting-card ${tier.cls}`;
        card.dataset.id = poke.id;

        const img = document.createElement('img');
        img.src = getSpriteUrl(poke.id);
        img.alt = poke.name;

        const name = document.createElement('span');
        name.className = 'betting-name';
        name.textContent = poke.name;

        const tierLabel = document.createElement('span');
        tierLabel.className = 'betting-tier';
        tierLabel.textContent = tier.label;

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(tierLabel);

        card.addEventListener('click', () => {
            grid.querySelectorAll('.betting-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedId = poke.id;
            selectedName = poke.name;
            confirmBtn.disabled = false;
        });

        grid.appendChild(card);
    }

    confirmBtn.addEventListener('click', () => {
        if (selectedId !== null) {
            this.predictionState = { predictedId: selectedId, predictedName: selectedName };
            screen.classList.add('hidden');
            if (this.onBettingConfirm) this.onBettingConfirm();
        }
    });

    skipBtn.addEventListener('click', () => {
        this.predictionState = null;
        screen.classList.add('hidden');
        if (this.onBettingConfirm) this.onBettingConfirm();
    });
}
```

---

### Task 4: Add betting screen CSS

**Files:**
- Modify: `css/styles.css` (add betting screen + tier styles + prediction stats styles)

**Step 1: Add all betting-related CSS**

Append before the `/* =========== Elimination Banner =========== */` section (~line 592):

```css
/* =========== Betting / Predictions =========== */
#betting-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.9);
    pointer-events: auto;
}

.betting-container {
    text-align: center;
    max-width: 900px;
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 30px;
}

.betting-container::-webkit-scrollbar {
    width: 6px;
}

.betting-container::-webkit-scrollbar-thumb {
    background: #f5a623;
    border-radius: 3px;
}

.betting-subtitle {
    color: #a0a0c0;
    font-size: 1.1rem;
    margin-bottom: 20px;
}

.betting-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
    gap: 8px;
    padding: 8px;
    margin-bottom: 20px;
}

.betting-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;
    border: 2px solid #333;
    border-radius: 10px;
    background: rgba(10, 10, 30, 0.8);
    cursor: pointer;
    transition: all 0.2s;
}

.betting-card:hover {
    transform: scale(1.08);
}

.betting-card img {
    width: 48px;
    height: 48px;
    image-rendering: pixelated;
}

.betting-name {
    font-size: 0.65rem;
    color: #ccc;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 80px;
}

.betting-tier {
    font-size: 0.55rem;
    font-weight: bold;
    margin-top: 1px;
}

/* Tier border colors */
.tier-favorite {
    border-color: #ffd700;
}
.tier-favorite:hover {
    border-color: #ffe44d;
    background: rgba(80, 60, 0, 0.6);
}
.tier-favorite .betting-tier { color: #ffd700; }

.tier-contender {
    border-color: #c0c0c0;
}
.tier-contender:hover {
    border-color: #e0e0e0;
    background: rgba(60, 60, 60, 0.6);
}
.tier-contender .betting-tier { color: #c0c0c0; }

.tier-underdog {
    border-color: #cd7f32;
}
.tier-underdog:hover {
    border-color: #e09040;
    background: rgba(60, 40, 10, 0.6);
}
.tier-underdog .betting-tier { color: #cd7f32; }

.tier-longshot {
    border-color: #e94560;
}
.tier-longshot:hover {
    border-color: #ff5577;
    background: rgba(80, 10, 20, 0.6);
}
.tier-longshot .betting-tier { color: #e94560; }

/* Selected card */
.betting-card.selected {
    box-shadow: 0 0 12px rgba(245, 166, 35, 0.6);
    background: rgba(50, 40, 10, 0.8);
    transform: scale(1.08);
}
.betting-card.selected::after {
    content: '\2713';
    position: absolute;
    top: 2px;
    right: 4px;
    color: #4CAF50;
    font-size: 0.9rem;
    font-weight: bold;
}
.betting-card {
    position: relative;
}

/* Action buttons */
.betting-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
}

.betting-skip-btn {
    background: linear-gradient(135deg, #555, #333) !important;
}

.betting-confirm-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
}

/* Prediction stats on landing page */
.prediction-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 16px;
    min-height: 24px;
}

.prediction-stats-text {
    font-size: 0.85rem;
    color: #a0a0c0;
}

.prediction-reset-btn {
    padding: 2px 10px;
    border: 1px solid #555;
    border-radius: 4px;
    background: transparent;
    color: #888;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.2s;
}

.prediction-reset-btn:hover {
    border-color: #e94560;
    color: #e94560;
}

/* Victory prediction result */
.prediction-result {
    font-size: 1.2rem;
    margin-bottom: 16px;
}

.prediction-correct {
    color: #4CAF50;
}

.prediction-wrong {
    color: #e94560;
}

.prediction-skipped {
    color: #888;
    font-size: 1rem;
}
```

---

### Task 5: Wire betting screen into game flow (`js/main.js`)

**Files:**
- Modify: `js/main.js:46` (change champion selected callback)
- Modify: `js/main.js:74` (modify `_startBattle` to not take championId)

**Step 1: Change `onChampionSelected` to show betting screen**

Replace line 46:
```javascript
this.ui.onChampionSelected = (championId) => this._startBattle(championId);
```
with:
```javascript
this.ui.onChampionSelected = (championId) => {
    this.championId = championId;
    this.ui.showBettingScreen(this.roster);
};
this.ui.onBettingConfirm = () => this._startBattle();
```

**Step 2: Modify `_startBattle` to not take a parameter**

Change the `_startBattle` method signature from:
```javascript
_startBattle(championId) {
    this.championId = championId;
```
to:
```javascript
_startBattle() {
```

(Remove the `this.championId = championId;` line — it's now set in `onChampionSelected`.)

---

### Task 6: Show prediction result on victory screen

**Files:**
- Modify: `js/ui.js` `showVictory` method (~line 169)

**Step 1: Update `showVictory` to show prediction result + update stats**

Replace the entire `showVictory` method with:

```javascript
showVictory(winner, isChampionWin = false) {
    this.hud.classList.add('hidden');
    this.victoryScreen.classList.remove('hidden');
    this.winnerSprite.src = winner.sprite.src;
    this.winnerName.textContent = winner.name;

    // Remove old dynamic elements
    const oldChamp = this.victoryScreen.querySelector('.champion-victory-text');
    if (oldChamp) oldChamp.remove();
    const oldPred = this.victoryScreen.querySelector('.prediction-result');
    if (oldPred) oldPred.remove();

    if (isChampionWin) {
        const champText = document.createElement('p');
        champText.className = 'champion-victory-text';
        champText.textContent = 'Your Champion is victorious!';
        this.winnerName.after(champText);
    }

    // Prediction result
    const predDiv = document.createElement('p');
    predDiv.className = 'prediction-result';

    if (this.predictionState) {
        const correct = winner.originalId === this.predictionState.predictedId;
        const stats = this._loadPredictionStats();
        stats.totalPredictions++;
        if (correct) {
            stats.correctPredictions++;
            stats.currentStreak++;
            if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
            predDiv.classList.add('prediction-correct');
            predDiv.textContent = `Your prediction: ${this.predictionState.predictedName} — Correct!`;
        } else {
            stats.currentStreak = 0;
            predDiv.classList.add('prediction-wrong');
            predDiv.textContent = `Your prediction: ${this.predictionState.predictedName} — Wrong`;
        }
        this._savePredictionStats(stats);
    } else {
        predDiv.classList.add('prediction-skipped');
        predDiv.textContent = 'No prediction made';
    }

    // Insert prediction result before the play-again button
    this.playAgainBtn.before(predDiv);
}
```

---

### Task 7: Hide betting screen on other screen transitions

**Files:**
- Modify: `js/ui.js` `showSettings` method
- Modify: `js/ui.js` `showBattle` method

**Step 1: Hide betting screen in `showSettings` and `showBattle`**

In `showSettings()`, after `this.championScreen.classList.add('hidden');` (line 104), add:
```javascript
const betting = document.getElementById('betting-screen');
if (betting) betting.classList.add('hidden');
```

In `showBattle()`, after `this.championScreen.classList.add('hidden');` (line 113), add:
```javascript
const betting = document.getElementById('betting-screen');
if (betting) betting.classList.add('hidden');
```

---

### Verification

1. Start game → landing page shows (no prediction stats if first time)
2. Click Start → champion select → pick champion → **betting screen appears**
3. Betting screen shows all Pokemon with tier-colored borders (gold/silver/bronze/red)
4. Click a Pokemon → highlighted with checkmark, Confirm enabled
5. Click Confirm → countdown starts → battle runs
6. Winner declared → victory screen shows "Your prediction: [name] — Correct/Wrong"
7. Play Again → landing page now shows "Predictions: 1/1 correct | Streak: 1 | Best: 1"
8. Click Skip on betting screen → battle starts, victory shows "No prediction made"
9. Reset button clears all stats
10. Zero console errors
