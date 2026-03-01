// js/ui.js - Settings panel, HUD, event log, elimination banners, betting
import { getSpriteUrl } from './data.js';
import { POKEMON_DATA } from './data.js';

export class UIManager {
    constructor() {
        this.settingsScreen = document.getElementById('settings-screen');
        this.hud = document.getElementById('hud');
        this.victoryScreen = document.getElementById('victory-screen');

        this.rosterButtons = document.querySelectorAll('#roster-buttons button');
        this.speedSlider = document.getElementById('speed-slider');
        this.speedLabel = document.getElementById('speed-label');
        this.startBtn = document.getElementById('start-btn');

        this.remainingCount = document.getElementById('remaining-count');
        this.hudSpeedSlider = document.getElementById('hud-speed-slider');
        this.hudSpeedLabel = document.getElementById('hud-speed-label');
        this.pauseBtn = document.getElementById('pause-btn');
        this.eventLog = document.getElementById('event-log');

        this.winnerSprite = document.getElementById('winner-sprite');
        this.winnerName = document.getElementById('winner-name');
        this.playAgainBtn = document.getElementById('play-again-btn');

        this.selectedRosterSize = 40;
        this.speed = 1;
        this.paused = false;

        this.muteBtn = document.getElementById('mute-btn');
        this.weatherIndicator = document.getElementById('weather-indicator');
        this.leaderboard = document.getElementById('leaderboard');
        this.leaderboardList = document.getElementById('leaderboard-list');
        this.lbTabs = document.querySelectorAll('.lb-tab');
        this.lbSortKey = 'kills';

        this.predictionStatsEl = document.getElementById('prediction-stats');
        this.predictionState = null;

        this.modeButtons = document.querySelectorAll('#mode-buttons button');
        this.formatButtons = document.querySelectorAll('#format-buttons button');
        this.tournamentFormatGroup = document.getElementById('tournament-format-group');
        this.bracketScreen = document.getElementById('bracket-screen');
        this.bracketTitle = document.getElementById('bracket-title');
        this.bracketContent = document.getElementById('bracket-content');
        this.bracketNextBtn = document.getElementById('bracket-next-btn');

        this.selectedMode = 'normal';
        this.selectedTournamentRounds = 2;

        this.onStart = null;
        this.onPlayAgain = null;
        this.onMuteToggle = null;
        this.onBettingConfirm = null;
        this.onNextRound = null;

        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.rosterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.rosterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedRosterSize = parseInt(btn.dataset.count);
            });
        });

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

        this.startBtn.addEventListener('click', () => {
            if (this.onStart) this.onStart(this.selectedRosterSize, this.speed);
        });

        this.pauseBtn.addEventListener('click', () => {
            this.paused = !this.paused;
            this.pauseBtn.textContent = this.paused ? 'Resume' : 'Pause';
        });

        this.playAgainBtn.addEventListener('click', () => {
            if (this.onPlayAgain) this.onPlayAgain();
        });

        this.muteBtn.addEventListener('click', () => {
            if (this.onMuteToggle) {
                const muted = this.onMuteToggle();
                this.muteBtn.textContent = muted ? 'Unmute' : 'Mute';
            }
        });

        this.lbTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.lbTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.lbSortKey = tab.dataset.sort;
            });
        });

        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedMode = btn.dataset.mode;
                if (this.selectedMode === 'tournament') {
                    this.tournamentFormatGroup.classList.remove('hidden');
                } else {
                    this.tournamentFormatGroup.classList.add('hidden');
                }
            });
        });

        this.formatButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.formatButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTournamentRounds = parseInt(btn.dataset.rounds);
            });
        });

        this.bracketNextBtn.addEventListener('click', () => {
            if (this.onNextRound) this.onNextRound();
        });
    }

    showSettings() {
        this.settingsScreen.classList.remove('hidden');
        this.hud.classList.add('hidden');
        this.victoryScreen.classList.add('hidden');
        this.bracketScreen.classList.add('hidden');
        const betting = document.getElementById('betting-screen');
        if (betting) betting.classList.add('hidden');
        this.eventLog.innerHTML = '';
        this.paused = false;
        this.pauseBtn.textContent = 'Pause';
        this.predictionState = null;
        this._displayPredictionStats();
        this._displayTopSpecies();
    }

    showBattle(total) {
        this.settingsScreen.classList.add('hidden');
        const betting = document.getElementById('betting-screen');
        if (betting) betting.classList.add('hidden');
        this.bracketScreen.classList.add('hidden');
        this.hud.classList.remove('hidden');
        this.victoryScreen.classList.add('hidden');
        this.updateRemaining(total, total);
    }

    showBettingScreen(roster) {
        this.settingsScreen.classList.add('hidden');
        this.hud.classList.add('hidden');
        this.victoryScreen.classList.add('hidden');

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

    showVictory(winner, pokemons) {
        this.hud.classList.add('hidden');
        this.victoryScreen.classList.remove('hidden');
        this.winnerSprite.src = winner.sprite.src;
        this.winnerName.textContent = winner.name;

        const oldPred = this.victoryScreen.querySelector('.prediction-result');
        if (oldPred) oldPred.remove();
        const oldStats = this.victoryScreen.querySelector('.battle-stats');
        if (oldStats) oldStats.remove();

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

        this.playAgainBtn.before(predDiv);

        // Render battle stats awards
        if (pokemons && pokemons.length > 0) {
            const statsDiv = this._renderBattleStats(pokemons, winner);
            this.playAgainBtn.before(statsDiv);
            this._saveBattleHistory(winner, pokemons);
        }
    }

    updateRemaining(remaining, total) {
        this.remainingCount.textContent = `Remaining: ${remaining} / ${total}`;
    }

    addEvent(text, isElimination = false) {
        const div = document.createElement('div');
        let cls = 'event';
        if (isElimination) cls += ' elimination';
        div.className = cls;
        div.textContent = text;
        this.eventLog.appendChild(div);
        this.eventLog.scrollTop = this.eventLog.scrollHeight;

        while (this.eventLog.children.length > 50) {
            this.eventLog.removeChild(this.eventLog.firstChild);
        }
    }

    updateWeather(weather) {
        if (weather.name === 'Clear') {
            this.weatherIndicator.textContent = '';
        } else {
            this.weatherIndicator.textContent = `${weather.icon} ${weather.name}`;
        }
    }

    updateLeaderboard(pokemons) {
        const sorted = [...pokemons].sort((a, b) => {
            // Alive first, then by sort key
            if (a.alive !== b.alive) return b.alive - a.alive;
            return (b.stats[this.lbSortKey] || 0) - (a.stats[this.lbSortKey] || 0);
        });

        // Show top 10
        const top = sorted.slice(0, 10);
        this.leaderboardList.innerHTML = '';

        for (let i = 0; i < top.length; i++) {
            const p = top[i];
            const row = document.createElement('div');
            row.className = 'lb-row';
            if (!p.alive) row.classList.add('eliminated');

            const hpPercent = Math.max(0, Math.round((p.hp / p.maxHp) * 100));
            const hpColor = hpPercent > 50 ? '#4CAF50' : hpPercent > 20 ? '#f5a623' : '#ff4444';

            const val = p.stats[this.lbSortKey] || 0;
            const label = this.lbSortKey === 'kills' ? val :
                          this.lbSortKey === 'damageDealt' ? this._shortNum(val) :
                          this._shortNum(val);

            row.innerHTML = `
                <span class="lb-rank">${i + 1}</span>
                <img class="lb-sprite" src="${p.sprite.src}" alt="">
                <span class="lb-name">${p.name}</span>
                <span class="lb-value">${label}</span>
                <div class="lb-hp-bar"><div class="lb-hp-fill" style="width:${hpPercent}%;background:${hpColor}"></div></div>
            `;
            this.leaderboardList.appendChild(row);
        }
    }

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

    _shortNum(n) {
        if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
        return Math.round(n).toString();
    }

    showCountdown(onComplete) {
        const overlay = document.createElement('div');
        overlay.className = 'countdown-overlay';
        document.body.appendChild(overlay);

        const steps = ['3', '2', '1', 'GO!'];
        let i = 0;

        const showNext = () => {
            if (i >= steps.length) {
                overlay.remove();
                if (onComplete) onComplete();
                return;
            }
            const num = document.createElement('div');
            num.className = 'countdown-number';
            num.textContent = steps[i];
            overlay.innerHTML = '';
            overlay.appendChild(num);
            i++;
            setTimeout(showNext, 850);
        };

        showNext();
    }

    showEliminationBanner(attackerName, defenderName) {
        const banner = document.createElement('div');
        banner.className = 'elimination-banner';
        banner.innerHTML = `<strong>${defenderName}</strong> was eliminated by <strong>${attackerName}</strong>!`;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 2000);
    }

    _renderBattleStats(pokemons, winner) {
        const container = document.createElement('div');
        container.className = 'battle-stats';

        // Find award winners
        const mvp = [...pokemons].sort((a, b) => b.stats.kills - a.stats.kills)[0];
        const mostDmg = [...pokemons].sort((a, b) => b.stats.damageDealt - a.stats.damageDealt)[0];
        const longestSurvivor = [...pokemons].sort((a, b) => b.stats.survivalTime - a.stats.survivalTime)[0];
        const biggestHitter = [...pokemons].sort((a, b) => b.stats.biggestHit - a.stats.biggestHit)[0];

        const awards = [
            { label: 'MVP', pokemon: mvp, value: `${mvp.stats.kills} kills`, icon: '⚔️' },
            { label: 'Most Damage', pokemon: mostDmg, value: this._shortNum(mostDmg.stats.damageDealt), icon: '💥' },
            { label: 'Longest Survival', pokemon: longestSurvivor, value: `${Math.round(longestSurvivor.stats.survivalTime / 1000)}s`, icon: '🛡️' },
            { label: 'Biggest Hit', pokemon: biggestHitter, value: `${biggestHitter.stats.biggestHit} dmg`, icon: '🎯' },
        ];

        container.innerHTML = `<div class="stats-grid">${awards.map(a => `
            <div class="stat-award">
                <span class="stat-icon">${a.icon}</span>
                <img class="stat-sprite" src="${a.pokemon.sprite.src}" alt="${a.pokemon.name}">
                <span class="stat-label">${a.label}</span>
                <span class="stat-name">${a.pokemon.name}</span>
                <span class="stat-value">${a.value}</span>
            </div>
        `).join('')}</div>`;

        return container;
    }

    _saveBattleHistory(winner, pokemons) {
        try {
            // Win counts
            const winCounts = JSON.parse(localStorage.getItem('pokemonBRWinCounts') || '{}');
            const species = winner.name;
            winCounts[species] = (winCounts[species] || 0) + 1;
            localStorage.setItem('pokemonBRWinCounts', JSON.stringify(winCounts));

            // Battle history (last 50)
            const history = JSON.parse(localStorage.getItem('pokemonBRHistory') || '[]');
            history.unshift({
                winner: winner.name,
                winnerId: winner.originalId,
                kills: winner.stats.kills,
                participants: pokemons.length,
                date: Date.now()
            });
            if (history.length > 50) history.length = 50;
            localStorage.setItem('pokemonBRHistory', JSON.stringify(history));
        } catch (e) { /* localStorage may be full */ }
    }

    _displayTopSpecies() {
        const el = document.getElementById('top-species');
        if (!el) return;
        try {
            const winCounts = JSON.parse(localStorage.getItem('pokemonBRWinCounts') || '{}');
            const entries = Object.entries(winCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
            if (entries.length === 0) {
                el.innerHTML = '';
                return;
            }
            const medals = ['🥇', '🥈', '🥉'];
            el.innerHTML = `
                <span class="top-species-title">Top Winners</span>
                <div class="top-species-list">
                    ${entries.map(([name, count], i) =>
                        `<span class="top-species-entry">${medals[i]} ${name}: ${count}</span>`
                    ).join('')}
                </div>
            `;
        } catch (e) { el.innerHTML = ''; }
    }

    showBracketScreen(roundData) {
        this.hud.classList.add('hidden');
        this.victoryScreen.classList.add('hidden');
        this.bracketScreen.classList.remove('hidden');
        this.bracketTitle.textContent = roundData.title || 'Round Results';

        let html = '';
        for (const group of roundData.groups) {
            html += `<div class="bracket-group">`;
            html += `<div class="bracket-group-title">${group.name}</div>`;
            for (const p of group.pokemon) {
                const cls = p.advanced ? 'bracket-pokemon advanced' : 'bracket-pokemon eliminated';
                html += `<div class="${cls}">
                    <img src="${getSpriteUrl(p.id)}" class="bracket-sprite" alt="${p.name}">
                    <span class="bracket-poke-name">${p.name}</span>
                    <span class="bracket-poke-stat">${p.kills || 0} kills</span>
                </div>`;
            }
            html += `</div>`;
        }
        this.bracketContent.innerHTML = html;

        if (roundData.isFinal) {
            this.bracketNextBtn.textContent = 'View Winner';
        } else {
            this.bracketNextBtn.textContent = 'Next Round';
        }
    }

    hideBracketScreen() {
        this.bracketScreen.classList.add('hidden');
    }

    showCommentaryBanner(text, type) {
        const banner = document.createElement('div');
        banner.className = `commentary-banner commentary-${type || 'hype'}`;
        banner.textContent = text;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 3000);
    }
}
