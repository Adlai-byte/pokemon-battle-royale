// js/ui.js - Settings panel, HUD, event log, elimination banners, betting
import { getSpriteUrl, TYPE_COLORS } from './data.js';
import { POKEMON_DATA } from './data.js';
import { ROLES, ROLE_CONFIG } from './battle.js';

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
        this.selectedRosterType = 'random';
        this.rosterTypeButtons = document.querySelectorAll('#roster-type-buttons button');
        this.rosterTypeGroup = document.getElementById('roster-type-group');
        this.rosterSizeGroup = document.getElementById('roster-size-group');
        this.endlessFormatGroup = document.getElementById('endless-format-group');
        this.teamSizeButtons = document.querySelectorAll('#team-size-buttons button');
        this.selectedTeamSize = 3;

        this.onStart = null;
        this.onPlayAgain = null;
        this.onMuteToggle = null;
        this.onBettingConfirm = null;
        this.onNextRound = null;
        this.onCustomRosterConfirm = null;
        this.onMusicVolume = null;
        this.onSfxVolume = null;

        // Text size & volume controls
        this.textSizeButtons = document.querySelectorAll('#text-size-buttons button');
        this.musicVolumeSlider = document.getElementById('music-volume');
        this.sfxVolumeSlider = document.getElementById('sfx-volume');
        this.hudMusicSlider = document.getElementById('hud-music-volume');
        this.hudSfxSlider = document.getElementById('hud-sfx-volume');

        // Custom battle rules
        this.customRules = {
            itemsEnabled: true,
            weatherEnabled: true,
            arenaEventsEnabled: true,
            weatherLock: 'random',
            typeFilter: new Set(), // stores DISABLED types; empty = all allowed
        };

        this._setupEventListeners();
    }

    _setupEventListeners() {
        this.rosterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.rosterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedRosterSize = btn.dataset.count === 'all' ? 9999 : parseInt(btn.dataset.count);
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

        // Text size buttons
        this.textSizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.textSizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._applyTextSize(btn.dataset.size);
            });
        });

        // Music volume sliders (settings + HUD sync)
        this.musicVolumeSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.hudMusicSlider.value = val;
            if (this.onMusicVolume) this.onMusicVolume(val / 100);
            localStorage.setItem('pokemonBRMusicVolume', val);
        });
        this.hudMusicSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.musicVolumeSlider.value = val;
            if (this.onMusicVolume) this.onMusicVolume(val / 100);
            localStorage.setItem('pokemonBRMusicVolume', val);
        });

        // SFX volume sliders (settings + HUD sync)
        this.sfxVolumeSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.hudSfxSlider.value = val;
            if (this.onSfxVolume) this.onSfxVolume(val / 100);
            localStorage.setItem('pokemonBRSfxVolume', val);
        });
        this.hudSfxSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.sfxVolumeSlider.value = val;
            if (this.onSfxVolume) this.onSfxVolume(val / 100);
            localStorage.setItem('pokemonBRSfxVolume', val);
        });

        // Load persisted text size
        const savedSize = localStorage.getItem('pokemonBRTextSize') || 'normal';
        this._applyTextSize(savedSize);
        this.textSizeButtons.forEach(b => {
            b.classList.toggle('active', b.dataset.size === savedSize);
        });

        // Load persisted volume levels
        const savedMusic = localStorage.getItem('pokemonBRMusicVolume');
        if (savedMusic !== null) {
            this.musicVolumeSlider.value = savedMusic;
            this.hudMusicSlider.value = savedMusic;
        }
        const savedSfx = localStorage.getItem('pokemonBRSfxVolume');
        if (savedSfx !== null) {
            this.sfxVolumeSlider.value = savedSfx;
            this.hudSfxSlider.value = savedSfx;
        }

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
                this.tournamentFormatGroup.classList.toggle('hidden', this.selectedMode !== 'tournament');
                this.endlessFormatGroup.classList.toggle('hidden', this.selectedMode !== 'endless');
                this.rosterTypeGroup.classList.toggle('hidden', this.selectedMode === 'endless');
                this.rosterSizeGroup.classList.toggle('hidden', this.selectedMode === 'endless');
            });
        });

        this.formatButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.formatButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTournamentRounds = parseInt(btn.dataset.rounds);
            });
        });

        this.rosterTypeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.rosterTypeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedRosterType = btn.dataset.type;
            });
        });

        this.teamSizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.teamSizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTeamSize = parseInt(btn.dataset.size);
            });
        });

        this.bracketNextBtn.addEventListener('click', () => {
            if (this.onNextRound) this.onNextRound();
        });

        // --- Custom Rules ---
        const rulesToggle = document.getElementById('custom-rules-toggle');
        const rulesBody = document.getElementById('custom-rules-body');
        const collapseArrow = document.getElementById('collapse-arrow');
        if (rulesToggle && rulesBody) {
            // Start collapsed
            rulesBody.classList.add('collapsed');
            collapseArrow.classList.add('collapsed');
            rulesToggle.addEventListener('click', () => {
                rulesBody.classList.toggle('collapsed');
                collapseArrow.classList.toggle('collapsed');
            });
        }

        const ruleItems = document.getElementById('rule-items');
        if (ruleItems) {
            ruleItems.addEventListener('change', () => {
                this.customRules.itemsEnabled = ruleItems.checked;
            });
        }

        const ruleWeather = document.getElementById('rule-weather');
        const weatherLockRow = document.getElementById('weather-lock-row');
        if (ruleWeather) {
            ruleWeather.addEventListener('change', () => {
                this.customRules.weatherEnabled = ruleWeather.checked;
                if (weatherLockRow) weatherLockRow.style.display = ruleWeather.checked ? '' : 'none';
            });
        }

        const ruleWeatherLock = document.getElementById('rule-weather-lock');
        if (ruleWeatherLock) {
            ruleWeatherLock.addEventListener('change', () => {
                this.customRules.weatherLock = ruleWeatherLock.value;
            });
        }

        const ruleEvents = document.getElementById('rule-events');
        if (ruleEvents) {
            ruleEvents.addEventListener('change', () => {
                this.customRules.arenaEventsEnabled = ruleEvents.checked;
            });
        }

        // Generate type badges dynamically
        const typeBadgesContainer = document.getElementById('type-badges');
        if (typeBadgesContainer) {
            for (const typeName of Object.keys(TYPE_COLORS)) {
                const badge = document.createElement('span');
                badge.className = 'type-badge';
                badge.textContent = typeName;
                badge.style.backgroundColor = TYPE_COLORS[typeName].primary;
                badge.dataset.type = typeName;
                badge.addEventListener('click', () => {
                    if (this.customRules.typeFilter.has(typeName)) {
                        this.customRules.typeFilter.delete(typeName);
                        badge.classList.remove('disabled');
                    } else {
                        this.customRules.typeFilter.add(typeName);
                        badge.classList.add('disabled');
                    }
                });
                typeBadgesContainer.appendChild(badge);
            }
        }
    }

    _applyTextSize(size) {
        const scales = { small: 0.85, normal: 1.0, large: 1.2 };
        const scale = scales[size] || 1.0;
        document.documentElement.style.setProperty('--text-scale', scale);
        localStorage.setItem('pokemonBRTextSize', size);
    }

    showSettings() {
        this.settingsScreen.classList.remove('hidden');
        this.hud.classList.add('hidden');
        this.victoryScreen.classList.add('hidden');
        this.bracketScreen.classList.add('hidden');
        const betting = document.getElementById('betting-screen');
        if (betting) betting.classList.add('hidden');
        const customRoster = document.getElementById('custom-roster-screen');
        if (customRoster) customRoster.classList.add('hidden');
        const draftScreen = document.getElementById('draft-screen');
        if (draftScreen) draftScreen.classList.add('hidden');
        const upgradeScreen = document.getElementById('upgrade-screen');
        if (upgradeScreen) upgradeScreen.classList.add('hidden');
        const endlessGo = document.getElementById('endless-gameover');
        if (endlessGo) endlessGo.classList.add('hidden');
        this.hideWaveIndicator();
        this.eventLog.innerHTML = '';
        this.paused = false;
        this.pauseBtn.textContent = 'Pause';
        this.predictionState = null;
        // Restore settings group visibility based on current mode
        this.tournamentFormatGroup.classList.toggle('hidden', this.selectedMode !== 'tournament');
        this.endlessFormatGroup.classList.toggle('hidden', this.selectedMode !== 'endless');
        this.rosterTypeGroup.classList.toggle('hidden', this.selectedMode === 'endless');
        this.rosterSizeGroup.classList.toggle('hidden', this.selectedMode === 'endless');
        this._displayPredictionStats();
        this._displayTopSpecies();
        this._displayBattleHistory();
        this._displayShop();
    }

    showBattle(total) {
        this.settingsScreen.classList.add('hidden');
        const betting = document.getElementById('betting-screen');
        if (betting) betting.classList.add('hidden');
        const draftScreen = document.getElementById('draft-screen');
        if (draftScreen) draftScreen.classList.add('hidden');
        const upgradeScreen = document.getElementById('upgrade-screen');
        if (upgradeScreen) upgradeScreen.classList.add('hidden');
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
            localStorage.removeItem('pokemonBRShop');
            this._displayPredictionStats();
            this._displayTopSpecies();
            this._displayBattleHistory();
            this._displayShop();
            if (this.onThemeChange) this.onThemeChange(null);
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

    _displayShop() {
        const el = document.getElementById('points-shop');
        if (!el) return;
        const shopData = JSON.parse(localStorage.getItem('pokemonBRShop') || '{"owned":[],"selected":null}');
        const pointsData = this._loadPoints();
        const themes = [
            { id: 'neon-night', name: 'Neon Night', cost: 200, color: '#ff00ff' },
            { id: 'classic-green', name: 'Classic Green', cost: 300, color: '#00ff00' },
            { id: 'lava-caves', name: 'Lava Caves', cost: 400, color: '#ff4400' },
            { id: 'frozen-tundra', name: 'Frozen Tundra', cost: 500, color: '#44aaff' },
        ];

        let html = '<span class="shop-title">Arena Themes</span>';
        html += '<div class="shop-grid">';
        themes.forEach(theme => {
            const owned = shopData.owned.includes(theme.id);
            const selected = shopData.selected === theme.id;
            const canAfford = pointsData.totalPoints >= theme.cost;

            html += `<div class="shop-card ${owned ? 'owned' : ''} ${selected ? 'selected' : ''}">`;
            html += `<div class="shop-card-preview" style="background:linear-gradient(135deg, ${theme.color}22, ${theme.color}44); border: 1px solid ${theme.color};height:30px;margin-bottom:4px;"></div>`;
            html += `<div class="shop-card-name">${theme.name}</div>`;

            if (selected) {
                html += `<button class="shop-action-btn shop-deselect" data-theme="${theme.id}">Unequip</button>`;
            } else if (owned) {
                html += `<button class="shop-action-btn shop-select" data-theme="${theme.id}">Equip</button>`;
            } else {
                html += `<button class="shop-action-btn shop-buy ${canAfford ? '' : 'disabled'}" data-theme="${theme.id}" data-cost="${theme.cost}" ${canAfford ? '' : 'disabled'}>${theme.cost} pts</button>`;
            }
            html += '</div>';
        });
        html += '</div>';
        el.innerHTML = html;

        // Wire up button events
        el.querySelectorAll('.shop-buy:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                const themeId = btn.dataset.theme;
                const cost = parseInt(btn.dataset.cost);
                const pd = this._loadPoints();
                if (pd.totalPoints >= cost) {
                    pd.totalPoints -= cost;
                    this._savePoints(pd);
                    shopData.owned.push(themeId);
                    shopData.selected = themeId;
                    localStorage.setItem('pokemonBRShop', JSON.stringify(shopData));
                    if (this.onThemeChange) this.onThemeChange(themeId);
                    this._displayShop();
                    this._displayPredictionStats();
                }
            });
        });
        el.querySelectorAll('.shop-select').forEach(btn => {
            btn.addEventListener('click', () => {
                const themeId = btn.dataset.theme;
                shopData.selected = themeId;
                localStorage.setItem('pokemonBRShop', JSON.stringify(shopData));
                if (this.onThemeChange) this.onThemeChange(themeId);
                this._displayShop();
            });
        });
        el.querySelectorAll('.shop-deselect').forEach(btn => {
            btn.addEventListener('click', () => {
                shopData.selected = null;
                localStorage.setItem('pokemonBRShop', JSON.stringify(shopData));
                if (this.onThemeChange) this.onThemeChange(null);
                this._displayShop();
            });
        });
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

        const lastIdx = roundData.lastCompletedIndex ?? -1;
        let html = '';

        // Render completed groups
        for (let gi = 0; gi < roundData.groups.length; gi++) {
            const group = roundData.groups[gi];
            const isLatest = gi === lastIdx;
            html += `<div class="bracket-group">`;
            html += `<div class="bracket-group-title">${group.name}</div>`;

            let crushCount = 0;
            for (const p of group.pokemon) {
                if (isLatest) {
                    if (p.advanced) {
                        const advDelay = (crushCount * 0.15 + 0.3).toFixed(2);
                        html += `<div class="bracket-pokemon advanced advance-animate" style="--advance-delay: ${advDelay}s">
                            <img src="${getSpriteUrl(p.id)}" class="bracket-sprite" alt="${p.name}">
                            <span class="bracket-poke-name">${p.name}</span>
                            <span class="bracket-poke-stat">${p.kills || 0} kills</span>
                        </div>`;
                    } else {
                        const crushDelay = (crushCount * 0.15).toFixed(2);
                        crushCount++;
                        html += `<div class="bracket-pokemon eliminated crush-animate" style="--crush-delay: ${crushDelay}s">
                            <img src="${getSpriteUrl(p.id)}" class="bracket-sprite" alt="${p.name}">
                            <span class="bracket-poke-name">${p.name}</span>
                            <span class="bracket-poke-stat">${p.kills || 0} kills</span>
                        </div>`;
                    }
                } else {
                    const cls = p.advanced ? 'bracket-pokemon advanced' : 'bracket-pokemon eliminated';
                    html += `<div class="${cls}">
                        <img src="${getSpriteUrl(p.id)}" class="bracket-sprite" alt="${p.name}">
                        <span class="bracket-poke-name">${p.name}</span>
                        <span class="bracket-poke-stat">${p.kills || 0} kills</span>
                    </div>`;
                }
            }
            html += `</div>`;
        }

        // Render upcoming group placeholders
        const totalGroups = roundData.totalGroups || roundData.groups.length;
        const completedCount = roundData.completedCount || roundData.groups.length;
        for (let i = completedCount; i < totalGroups; i++) {
            html += `<div class="bracket-group upcoming">`;
            html += `<div class="bracket-group-title">Group ${i + 1}</div>`;
            html += `<div class="bracket-upcoming-label">Upcoming...</div>`;
            html += `</div>`;
        }

        this.bracketContent.innerHTML = html;
        this.bracketNextBtn.textContent = roundData.buttonLabel || (roundData.isFinal ? 'View Winner' : 'Next Round');
    }

    hideBracketScreen() {
        this.bracketScreen.classList.add('hidden');
    }

    showDraftScreen(options, teamSoFar, teamSize, onPick, allowSkip = false) {
        let screen = document.getElementById('draft-screen');
        if (!screen) {
            screen = document.createElement('div');
            screen.id = 'draft-screen';
            screen.className = 'overlay';
            document.body.appendChild(screen);
        }
        screen.classList.remove('hidden');
        this.hud.classList.add('hidden');

        const teamLabel = allowSkip ? 'Replace a Lost Teammate?' : 'Build Your Team';
        screen.innerHTML = `
            <div class="draft-container">
                <h1 class="title">${teamLabel}</h1>
                <p class="draft-subtitle">Pick ${teamSoFar.length + 1} / ${teamSize}</p>
                <div class="draft-options" id="draft-options"></div>
                <div class="draft-team" id="draft-team"></div>
                ${allowSkip ? '<button class="start-button draft-skip-btn" id="draft-skip">Skip</button>' : ''}
            </div>
        `;

        const optionsEl = document.getElementById('draft-options');
        for (const data of options) {
            const card = document.createElement('div');
            card.className = 'draft-card';
            const s = data.stats;
            const bst = s.hp + s.attack + s.defense + s.spAtk + s.spDef + s.speed;
            card.innerHTML = `
                <img src="${getSpriteUrl(data.id)}" alt="${data.name}">
                <span class="draft-card-name">${data.name}</span>
                <span class="draft-card-types">${data.types.join(' / ')}</span>
                <span class="draft-card-bst">BST: ${bst}</span>
            `;
            card.addEventListener('click', () => {
                screen.classList.add('hidden');
                onPick(data);
            });
            optionsEl.appendChild(card);
        }

        // Show current team
        const teamEl = document.getElementById('draft-team');
        if (teamSoFar.length > 0) {
            for (const t of teamSoFar) {
                const mini = document.createElement('div');
                mini.className = 'draft-team-member';
                mini.innerHTML = `<img src="${getSpriteUrl(t.id)}" alt="${t.name}"><span>${t.name}</span>`;
                teamEl.appendChild(mini);
            }
        }

        if (allowSkip) {
            document.getElementById('draft-skip').addEventListener('click', () => {
                screen.classList.add('hidden');
                onPick(null);
            });
        }
    }

    showUpgradeScreen(upgrades, team, onSelect, onStrategy) {
        let screen = document.getElementById('upgrade-screen');
        if (!screen) {
            screen = document.createElement('div');
            screen.id = 'upgrade-screen';
            screen.className = 'overlay';
            document.body.appendChild(screen);
        }
        screen.classList.remove('hidden');
        this.hud.classList.add('hidden');

        const strategyBtn = onStrategy
            ? '<button class="start-button" id="reassign-roles-btn" style="margin-top:12px;font-size:0.45rem;padding:6px 14px;">Reassign Roles</button>'
            : '';

        screen.innerHTML = `
            <div class="upgrade-container">
                <h1 class="title">Choose an Upgrade</h1>
                <div class="upgrade-options" id="upgrade-options"></div>
                <div class="upgrade-team" id="upgrade-team"></div>
                ${strategyBtn}
            </div>
        `;

        if (onStrategy) {
            document.getElementById('reassign-roles-btn').addEventListener('click', () => {
                screen.classList.add('hidden');
                onStrategy();
            });
        }

        const optionsEl = document.getElementById('upgrade-options');
        let selectedUpgrade = null;

        for (const upg of upgrades) {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.innerHTML = `
                <span class="upgrade-icon">${upg.icon}</span>
                <span class="upgrade-name">${upg.name}</span>
                <span class="upgrade-desc">${upg.description}</span>
            `;
            card.addEventListener('click', () => {
                if (upg.targetAll) {
                    screen.classList.add('hidden');
                    onSelect(upg, null);
                } else {
                    selectedUpgrade = upg;
                    optionsEl.querySelectorAll('.upgrade-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    teamEl.querySelectorAll('.upgrade-team-member').forEach(m => m.classList.add('selectable'));
                }
            });
            optionsEl.appendChild(card);
        }

        const teamEl = document.getElementById('upgrade-team');
        for (const p of team) {
            const member = document.createElement('div');
            member.className = 'upgrade-team-member';
            const hpPct = Math.round((p.hp / p.maxHp) * 100);
            member.innerHTML = `
                <img src="${p.sprite.src}" alt="${p.name}">
                <span class="upgrade-member-name">${p.name}</span>
                <div class="upgrade-hp-bar"><div class="upgrade-hp-fill" style="width:${hpPct}%"></div></div>
            `;
            member.addEventListener('click', () => {
                if (selectedUpgrade && !selectedUpgrade.targetAll) {
                    screen.classList.add('hidden');
                    onSelect(selectedUpgrade, p);
                }
            });
            teamEl.appendChild(member);
        }
    }

    showStrategyScreen(teamData, suggestRoleFn, onConfirm) {
        let screen = document.getElementById('strategy-screen');
        if (!screen) {
            screen = document.createElement('div');
            screen.id = 'strategy-screen';
            screen.className = 'overlay';
            document.body.appendChild(screen);
        }
        screen.classList.remove('hidden');
        this.hud.classList.add('hidden');

        const roleAssignments = {};
        // Auto-suggest roles
        for (let i = 0; i < teamData.length; i++) {
            roleAssignments[i] = teamData[i]._role || suggestRoleFn(teamData[i]);
        }

        const render = () => {
            screen.innerHTML = `
                <div class="strategy-container">
                    <h1 class="title">Team Strategy</h1>
                    <div id="strategy-members"></div>
                    <button class="start-button strategy-confirm-btn" id="strategy-confirm">Begin Wave</button>
                </div>
            `;

            const membersEl = document.getElementById('strategy-members');
            for (let i = 0; i < teamData.length; i++) {
                const data = teamData[i];
                const row = document.createElement('div');
                row.className = 'strategy-member';

                row.innerHTML = `
                    <img src="${getSpriteUrl(data.id)}" alt="${data.name}">
                    <div class="strategy-member-info">
                        <span class="strategy-member-name">${data.name}</span>
                        <span class="strategy-member-types">${data.types.join(' / ')}</span>
                    </div>
                    <div class="strategy-roles" data-idx="${i}"></div>
                `;

                const rolesEl = row.querySelector('.strategy-roles');
                for (const roleKey of Object.values(ROLES)) {
                    const cfg = ROLE_CONFIG[roleKey];
                    const btn = document.createElement('button');
                    btn.className = 'strategy-role-btn';
                    btn.style.setProperty('--role-color', cfg.color);
                    btn.textContent = cfg.label;
                    if (roleAssignments[i] === roleKey) btn.classList.add('active');

                    btn.addEventListener('click', () => {
                        roleAssignments[i] = roleKey;
                        rolesEl.querySelectorAll('.strategy-role-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    });
                    rolesEl.appendChild(btn);
                }

                membersEl.appendChild(row);
            }

            document.getElementById('strategy-confirm').addEventListener('click', () => {
                screen.classList.add('hidden');
                onConfirm(roleAssignments);
            });
        };

        render();
    }

    showEndlessGameOver(wave, score, team) {
        let screen = document.getElementById('endless-gameover');
        if (!screen) {
            screen = document.createElement('div');
            screen.id = 'endless-gameover';
            screen.className = 'overlay';
            document.body.appendChild(screen);
        }
        screen.classList.remove('hidden');
        this.hud.classList.add('hidden');

        screen.innerHTML = `
            <div class="endless-go-container">
                <h1 class="endless-go-title">Game Over</h1>
                <div class="endless-go-stats">
                    <div class="endless-go-stat"><span class="endless-go-label">Wave</span><span class="endless-go-value">${wave}</span></div>
                    <div class="endless-go-stat"><span class="endless-go-label">Score</span><span class="endless-go-value">${score}</span></div>
                </div>
                <div class="endless-go-team" id="ego-team"></div>
                <button class="start-button" id="ego-play-again">Play Again</button>
            </div>
        `;

        const teamEl = document.getElementById('ego-team');
        for (const p of team) {
            const m = document.createElement('div');
            m.className = 'endless-go-member ' + (p.alive ? 'alive' : 'fainted');
            m.innerHTML = `<img src="${p.sprite.src}" alt="${p.name}"><span>${p.name}</span>`;
            teamEl.appendChild(m);
        }

        document.getElementById('ego-play-again').addEventListener('click', () => {
            screen.classList.add('hidden');
            if (this.onPlayAgain) this.onPlayAgain();
        });
    }

    updateWaveIndicator(wave) {
        let el = document.getElementById('wave-indicator');
        if (!el) {
            el = document.createElement('span');
            el.id = 'wave-indicator';
            el.className = 'wave-indicator';
            const top = document.querySelector('.hud-top');
            if (top) top.insertBefore(el, top.firstChild.nextSibling);
        }
        el.textContent = `Wave ${wave}`;
        el.classList.remove('hidden');
    }

    hideWaveIndicator() {
        const el = document.getElementById('wave-indicator');
        if (el) el.classList.add('hidden');
    }

    showCustomRosterScreen(allBaseForms, requiredCount) {
        this.settingsScreen.classList.add('hidden');

        let screen = document.getElementById('custom-roster-screen');
        if (!screen) {
            screen = document.createElement('div');
            screen.id = 'custom-roster-screen';
            screen.className = 'overlay';
            document.body.appendChild(screen);
        }
        screen.classList.remove('hidden');

        const selected = new Set();

        const render = () => {
            screen.innerHTML = `
                <div class="custom-roster-container">
                    <h1 class="title">Choose Your Roster</h1>
                    <p class="custom-roster-subtitle">Select ${requiredCount} Pokemon</p>
                    <div class="custom-roster-counter" id="cr-counter">Selected: 0 / ${requiredCount}</div>
                    <div class="custom-roster-grid" id="cr-grid"></div>
                    <div class="custom-roster-actions">
                        <button class="start-button betting-skip-btn" id="cr-back">Back</button>
                        <button class="start-button" id="cr-random">Randomize</button>
                        <button class="start-button betting-confirm-btn" id="cr-confirm" disabled>Confirm Roster</button>
                    </div>
                </div>
            `;

            const grid = document.getElementById('cr-grid');
            const counter = document.getElementById('cr-counter');
            const confirmBtn = document.getElementById('cr-confirm');
            const randomBtn = document.getElementById('cr-random');
            const backBtn = document.getElementById('cr-back');

            for (const poke of allBaseForms) {
                const card = document.createElement('div');
                card.className = 'custom-roster-card';
                if (selected.has(poke.id)) card.classList.add('selected');
                if (selected.size >= requiredCount && !selected.has(poke.id)) card.classList.add('maxed');
                card.dataset.id = poke.id;

                const img = document.createElement('img');
                img.src = getSpriteUrl(poke.id);
                img.alt = poke.name;

                const name = document.createElement('span');
                name.className = 'cr-name';
                name.textContent = poke.name;

                const types = document.createElement('span');
                types.className = 'cr-types';
                types.textContent = poke.types.join('/');

                card.appendChild(img);
                card.appendChild(name);
                card.appendChild(types);

                card.addEventListener('click', () => {
                    if (selected.has(poke.id)) {
                        selected.delete(poke.id);
                    } else if (selected.size < requiredCount) {
                        selected.add(poke.id);
                    }
                    updateCards();
                });

                grid.appendChild(card);
            }

            const updateCards = () => {
                const cards = grid.querySelectorAll('.custom-roster-card');
                cards.forEach(c => {
                    const id = parseInt(c.dataset.id);
                    c.classList.toggle('selected', selected.has(id));
                    c.classList.toggle('maxed', selected.size >= requiredCount && !selected.has(id));
                });
                counter.textContent = `Selected: ${selected.size} / ${requiredCount}`;
                confirmBtn.disabled = selected.size !== requiredCount;
            };

            confirmBtn.addEventListener('click', () => {
                if (selected.size === requiredCount) {
                    const roster = allBaseForms.filter(p => selected.has(p.id));
                    screen.classList.add('hidden');
                    if (this.onCustomRosterConfirm) this.onCustomRosterConfirm(roster);
                }
            });

            randomBtn.addEventListener('click', () => {
                selected.clear();
                const shuffled = [...allBaseForms].sort(() => Math.random() - 0.5);
                for (let i = 0; i < requiredCount && i < shuffled.length; i++) {
                    selected.add(shuffled[i].id);
                }
                updateCards();
            });

            backBtn.addEventListener('click', () => {
                screen.classList.add('hidden');
                this.showSettings();
            });
        };

        render();
    }

    showCommentaryBanner(text, type) {
        const banner = document.createElement('div');
        banner.className = `commentary-banner commentary-${type || 'hype'}`;
        banner.textContent = text;
        document.body.appendChild(banner);
        setTimeout(() => banner.remove(), 3000);
    }
}
