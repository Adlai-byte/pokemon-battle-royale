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
        this.camBtn = document.getElementById('cam-btn');
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

        this.camBtn?.addEventListener('click', () => {
            if (this.onCamToggle) this.onCamToggle();
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
        this._displayBattleHistory();
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

        let selectedTier = null;
        for (const poke of roster) {
            const tier = this._getDynamicTier(poke.id);
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

            const ptsLabel = document.createElement('span');
            ptsLabel.className = 'betting-points';
            ptsLabel.textContent = `${tier.points} pts`;

            card.appendChild(img);
            card.appendChild(name);
            card.appendChild(tierLabel);
            card.appendChild(ptsLabel);

            if (tier.winCount > 0 && tier.isPromoted) {
                const hot = document.createElement('span');
                hot.className = 'betting-hot';
                hot.textContent = `Won ${tier.winCount}x`;
                card.appendChild(hot);
            }

            card.addEventListener('click', () => {
                grid.querySelectorAll('.betting-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedId = poke.id;
                selectedName = poke.name;
                selectedTier = tier;
                confirmBtn.disabled = false;
            });

            grid.appendChild(card);
        }

        confirmBtn.addEventListener('click', () => {
            if (selectedId !== null) {
                this.predictionState = {
                    predictedId: selectedId,
                    predictedName: selectedName,
                    tierAtPrediction: selectedTier ? selectedTier.label : 'Unknown',
                    pointValue: selectedTier ? selectedTier.points : 0,
                    top5PointValue: selectedTier ? selectedTier.top5Points : 0
                };
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
        const oldPts = this.victoryScreen.querySelector('.victory-points');
        if (oldPts) oldPts.remove();
        const oldStats = this.victoryScreen.querySelector('.battle-stats');
        if (oldStats) oldStats.remove();

        const predDiv = document.createElement('p');
        predDiv.className = 'prediction-result';

        let pointsEarned = 0;
        let pointsBreakdown = '';

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

                const basePoints = this.predictionState.pointValue || 0;
                const multiplier = this._getStreakMultiplier(stats.currentStreak);
                pointsEarned = Math.round(basePoints * multiplier);
                pointsBreakdown = multiplier > 1
                    ? `${basePoints} base x${multiplier} streak`
                    : `${this.predictionState.tierAtPrediction || 'Pick'}`;
            } else {
                stats.currentStreak = 0;
                predDiv.classList.add('prediction-wrong');
                predDiv.textContent = `Your prediction: ${this.predictionState.predictedName} — Wrong`;

                // Check top 5 placement
                if (pokemons && pokemons.length > 5) {
                    const placement = this._getPlacement(this.predictionState.predictedId, pokemons);
                    if (placement <= 5) {
                        pointsEarned = this.predictionState.top5PointValue || 0;
                        pointsBreakdown = `Top 5 (placed #${placement})`;
                    }
                }
            }
            this._savePredictionStats(stats);
        } else {
            predDiv.classList.add('prediction-skipped');
            predDiv.textContent = 'No prediction made';
        }

        this.playAgainBtn.before(predDiv);

        // Show points earned
        if (pointsEarned > 0) {
            const total = this._awardPoints(pointsEarned, pointsBreakdown);
            const ptsDiv = document.createElement('div');
            ptsDiv.className = 'victory-points';
            ptsDiv.innerHTML = `
                <span class="victory-points-value">+${pointsEarned} pts</span>
                <span class="victory-points-breakdown">${pointsBreakdown}</span>
                <span class="victory-points-total">Total: ${total} pts</span>
            `;
            this.playAgainBtn.before(ptsDiv);
        }

        // Render battle stats awards
        if (pokemons && pokemons.length > 0) {
            const statsDiv = this._renderBattleStats(pokemons, winner);
            this.playAgainBtn.before(statsDiv);
            this._saveBattleHistory(winner, pokemons);
        }

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

    _getStaticBSTTier(pokemonId) {
        const data = POKEMON_DATA.find(d => d.id === pokemonId);
        if (!data) return { label: 'Unknown', cls: 'tier-longshot' };
        const s = data.stats;
        const bst = s.hp + s.attack + s.defense + s.spAtk + s.spDef + s.speed;
        if (bst >= 500) return { label: 'Favorite', cls: 'tier-favorite' };
        if (bst >= 400) return { label: 'Contender', cls: 'tier-contender' };
        if (bst >= 300) return { label: 'Underdog', cls: 'tier-underdog' };
        return { label: 'Longshot', cls: 'tier-longshot' };
    }

    _getDynamicTier(pokemonId) {
        const data = POKEMON_DATA.find(d => d.id === pokemonId);
        if (!data) return { label: 'Unknown', cls: 'tier-longshot', points: 50, top5Points: 10, winCount: 0, isPromoted: false };
        const s = data.stats;
        const baseBST = s.hp + s.attack + s.defense + s.spAtk + s.spDef + s.speed;

        // Load win counts and boost effective BST
        const winCounts = JSON.parse(localStorage.getItem('pokemonBRWinCounts') || '{}');
        const winCount = winCounts[data.name] || 0;
        const boost = Math.min(winCount * 50, 200);
        const effectiveBST = baseBST + boost;

        const staticTier = this._getStaticBSTTier(pokemonId);
        let tier;
        if (effectiveBST >= 500) tier = { label: 'Favorite', cls: 'tier-favorite', points: 10, top5Points: 2 };
        else if (effectiveBST >= 400) tier = { label: 'Contender', cls: 'tier-contender', points: 20, top5Points: 4 };
        else if (effectiveBST >= 300) tier = { label: 'Underdog', cls: 'tier-underdog', points: 35, top5Points: 7 };
        else tier = { label: 'Longshot', cls: 'tier-longshot', points: 50, top5Points: 10 };

        const isPromoted = tier.label !== staticTier.label;
        return { ...tier, winCount, isPromoted };
    }

    _getStreakMultiplier(streak) {
        if (streak >= 5) return 2.0;
        if (streak >= 4) return 1.75;
        if (streak >= 3) return 1.5;
        if (streak >= 2) return 1.25;
        return 1.0;
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

    _loadPoints() {
        try {
            const raw = localStorage.getItem('pokemonBRPoints');
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        return { totalPoints: 0, pointsHistory: [] };
    }

    _savePoints(data) {
        localStorage.setItem('pokemonBRPoints', JSON.stringify(data));
    }

    _awardPoints(earned, reason) {
        const data = this._loadPoints();
        data.totalPoints += earned;
        data.pointsHistory.unshift({ date: Date.now(), earned, reason });
        if (data.pointsHistory.length > 100) data.pointsHistory.length = 100;
        this._savePoints(data);
        return data.totalPoints;
    }

    _getPlacement(pokemonId, pokemons) {
        const sorted = [...pokemons].sort((a, b) => (b.stats.survivalTime || 0) - (a.stats.survivalTime || 0));
        const idx = sorted.findIndex(p => p.originalId === pokemonId);
        return idx === -1 ? pokemons.length : idx + 1;
    }

    _displayPredictionStats() {
        const stats = this._loadPredictionStats();
        const pointsData = this._loadPoints();
        if (stats.totalPredictions === 0 && pointsData.totalPoints === 0) {
            this.predictionStatsEl.innerHTML = '';
            return;
        }
        const pointsBadge = pointsData.totalPoints > 0
            ? `<span class="points-badge">${pointsData.totalPoints} pts</span>`
            : '';
        const statsText = stats.totalPredictions > 0
            ? `<span class="prediction-stats-text">
                Predictions: ${stats.correctPredictions}/${stats.totalPredictions} correct
                | Streak: ${stats.currentStreak}
                | Best: ${stats.bestStreak}
            </span>`
            : '';
        this.predictionStatsEl.innerHTML = `
            ${pointsBadge}
            ${statsText}
            <button class="prediction-reset-btn" id="reset-predictions-btn">Reset</button>
        `;
        document.getElementById('reset-predictions-btn').addEventListener('click', () => {
            localStorage.removeItem('pokemonBRPredictions');
            localStorage.removeItem('pokemonBRPoints');
            localStorage.removeItem('pokemonBRHistory');
            localStorage.removeItem('pokemonBRWinCounts');
            this._displayPredictionStats();
            this._displayTopSpecies();
            this._displayBattleHistory();
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

    _downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
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

            // Top 5 by survival time
            const sorted = [...pokemons].sort((a, b) => (b.stats.survivalTime || 0) - (a.stats.survivalTime || 0));
            const top5 = sorted.slice(0, 5).map(p => ({ name: p.name, id: p.originalId }));

            // Battle history (last 50)
            const history = JSON.parse(localStorage.getItem('pokemonBRHistory') || '[]');
            history.unshift({
                winner: winner.name,
                winnerId: winner.originalId,
                kills: winner.stats.kills,
                participants: pokemons.length,
                top5,
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

    _displayBattleHistory() {
        const el = document.getElementById('battle-history');
        if (!el) return;
        try {
            const history = JSON.parse(localStorage.getItem('pokemonBRHistory') || '[]');
            if (history.length === 0) {
                el.innerHTML = '';
                return;
            }
            const entries = history.slice(0, 50);
            el.innerHTML = `
                <span class="history-title">Battle History</span>
                <div class="history-list">
                    ${entries.map(h => `
                        <div class="history-entry">
                            <img class="history-sprite" src="${getSpriteUrl(h.winnerId)}" alt="${h.winner}">
                            <span class="history-name">${h.winner}</span>
                            <span class="history-kills">${h.kills} kills</span>
                            <span class="history-participants">${h.participants}P</span>
                            <span class="history-time">${this._formatRelativeDate(h.date)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (e) { el.innerHTML = ''; }
    }

    _formatRelativeDate(timestamp) {
        const diff = Date.now() - timestamp;
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
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
