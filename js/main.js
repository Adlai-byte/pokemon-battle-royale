// js/main.js - App entry point, game loop, state management
import { POKEMON_DATA, EVOLUTION_CHAINS } from './data.js';
import { Pokemon } from './pokemon.js';
import { BattleEngine, ROLE_CONFIG, ROLES, suggestRole } from './battle.js';
import { EffectsManager } from './effects.js';
import { Arena } from './arena.js';
import { UIManager } from './ui.js';
import { ItemManager } from './items.js';
import { MusicManager } from './music.js';
import { WeatherManager } from './weather.js';

// Build set of base-form Pokemon IDs (exclude any that are an evolution target)
const EVOLVED_IDS = new Set(Object.values(EVOLUTION_CHAINS).map(c => c.nextId));
const BASE_FORM_POKEMON = POKEMON_DATA.filter(d => !EVOLVED_IDS.has(d.id));

class Game {
    constructor() {
        this.canvasEl = document.getElementById('arena');
        this.arena = new Arena(this.canvasEl);
        this.effects = new EffectsManager();
        this.ui = new UIManager();
        this.itemManager = new ItemManager();
        this.music = new MusicManager();
        this.weather = new WeatherManager();
        this.pokemons = [];
        this.totalCount = 0;
        this.running = false;
        this.lastTime = 0;
        this.winner = null;
        this.slowMoFrames = 0;

        this.roster = [];

        // Endless state
        this.endlessMode = false;
        this.endlessWave = 0;
        this.endlessTeamSize = 3;
        this.endlessTeamData = [];
        this.endlessTeamPokemon = [];
        this.endlessScore = 0;

        // Tournament state
        this.tournamentMode = false;
        this.tournamentRound = 0;
        this.tournamentMaxRounds = 2;
        this.tournamentGroups = [];
        this.tournamentResults = [];
        this.tournamentAdvancers = [];
        this.currentGroupIndex = 0;

        this.battleEngine = new BattleEngine(
            this.effects,
            (attacker, defender) => this._onElimination(attacker, defender),
            (text) => this.ui.addEvent(text),
            (text, type) => this.ui.showCommentaryBanner(text, type),
            this.music
        );

        this.battleEngine.weatherManager = this.weather;
        this.battleEngine.onSlowMo = () => { this.slowMoFrames = 4; };

        this.ui.onStart = (rosterSize) => {
            if (this.ui.selectedMode === 'endless') {
                this._startEndlessMode();
            } else {
                this._prepareRoster(rosterSize);
            }
        };
        this.ui.onBettingConfirm = () => this._startBattle();
        this.ui.onPlayAgain = () => {
            this.arena.resetCamera();
            this.music.playTrack('menu');
            this.tournamentMode = false;
            this.tournamentRound = 0;
            this.tournamentGroups = [];
            this.tournamentResults = [];
            this.tournamentAdvancers = [];
            this.endlessMode = false;
            this.endlessWave = 0;
            this.endlessTeamData = [];
            this.endlessTeamPokemon = [];
            this.endlessScore = 0;
            this.ui.hideWaveIndicator();
            // Move canvas back to body for settings screen background
            document.body.insertBefore(this.canvasEl, document.body.firstChild);
            this.arena.resize();
            this.ui.showSettings();
        };
        this.ui.onMuteToggle = () => this.music.toggleMute();
        this.ui.onMusicVolume = (v) => this.music.setMusicVolume(v);
        this.ui.onSfxVolume = (v) => this.music.setSfxVolume(v);
        this.ui.onCamToggle = () => {
            this.arena.autoCam = !this.arena.autoCam;
            if (!this.arena.autoCam) this.arena.resetCamera();
            this.ui.camBtn.textContent = this.arena.autoCam ? 'Auto-Cam' : 'Free View';
        };

        this.ui.onThemeChange = (themeId) => {
            this.arena.setTheme(themeId);
        };

        // Load saved arena theme from shop
        const shopData = JSON.parse(localStorage.getItem('pokemonBRShop') || '{}');
        if (shopData.selected) {
            this.arena.setTheme(shopData.selected);
        }

        // Set "All" button label to actual base-form count
        const allBtn = document.getElementById('all-roster-btn');
        if (allBtn) allBtn.textContent = `All (${BASE_FORM_POKEMON.length})`;

        this.ui.showSettings();
        this.music.playTrack('menu');

        // Apply persisted volume levels
        const savedMusic = localStorage.getItem('pokemonBRMusicVolume');
        if (savedMusic !== null) this.music.setMusicVolume(parseInt(savedMusic) / 100);
        const savedSfx = localStorage.getItem('pokemonBRSfxVolume');
        if (savedSfx !== null) this.music.setSfxVolume(parseInt(savedSfx) / 100);

        this._loop(0);
    }

    _filterByType(pool) {
        const disabled = this.ui.customRules.typeFilter;
        if (disabled.size === 0) return pool;
        const filtered = pool.filter(p =>
            !p.types.every(t => disabled.has(t))
        );
        // Guard: if filtered pool has < 2, ignore filter
        return filtered.length >= 2 ? filtered : pool;
    }

    _prepareRoster(rosterSize) {
        const clamped = Math.min(rosterSize, BASE_FORM_POKEMON.length);

        this.tournamentMode = this.ui.selectedMode === 'tournament';
        this.tournamentMaxRounds = this.ui.selectedTournamentRounds;
        this.tournamentRound = 0;
        this.tournamentResults = [];
        this.tournamentAdvancers = [];

        // Custom roster pick
        if (this.ui.selectedRosterType === 'custom' && this.ui.selectedMode !== 'endless') {
            this.ui.onCustomRosterConfirm = (roster) => {
                this.roster = roster;
                if (this.tournamentMode) {
                    this._prepareTournament(roster.length);
                } else {
                    this.music.playTrack('betting');
                    this.ui.showBettingScreen(this.roster);
                }
            };
            this.ui.showCustomRosterScreen(this._filterByType(BASE_FORM_POKEMON), clamped);
            return;
        }

        // Random roster (default)
        const filteredPool = this._filterByType(BASE_FORM_POKEMON);
        const shuffled = [...filteredPool].sort(() => Math.random() - 0.5);
        this.roster = shuffled.slice(0, Math.min(clamped, filteredPool.length));

        if (this.tournamentMode) {
            this._prepareTournament(clamped);
        } else {
            this.music.playTrack('betting');
            this.ui.showBettingScreen(this.roster);
        }
    }

    _startBattle() {
        // Pick a random arena tileset
        this.arena.selectRandomArena();

        // Move canvas into the arena-wrapper inside the HUD layout
        const wrapper = document.querySelector('.arena-wrapper');
        if (wrapper) {
            wrapper.appendChild(this.canvasEl);
            // Need a small delay for the container to have dimensions
            requestAnimationFrame(() => this.arena.resize());
        }

        this.pokemons = this.roster.map(data =>
            new Pokemon(data, this.arena.width, this.arena.height)
        );

        this.totalCount = this.roster.length;
        this.winner = null;
        this.running = false; // Frozen until countdown finishes
        this.lastTime = performance.now();
        this.itemManager.clear();
        this.weather.reset();
        this.weather.weatherEnabled = this.ui.customRules.weatherEnabled;
        this.weather.arenaEventsEnabled = this.ui.customRules.arenaEventsEnabled;
        this.weather.weatherLock = this.ui.customRules.weatherLock;

        // Mark predicted Pokemon with golden ring
        if (this.ui.predictionState) {
            const pick = this.pokemons.find(p => p.originalId === this.ui.predictionState.predictedId);
            if (pick) pick.isPlayerPick = true;
        }

        this.ui.showBattle(this.totalCount);
        this.ui.showCountdown(() => {
            this.running = true;
            this.lastTime = performance.now();
            this.music.playTrack('battle');
            this.battleEngine.triggerEntryAbilities(this.pokemons);
        });
    }

    _onElimination(attacker, defender) {
        if (this.endlessMode) {
            this._onEndlessElimination(attacker, defender);
            return;
        }
        if (this.tournamentMode) {
            this._onTournamentElimination(attacker, defender);
            return;
        }

        const remaining = this.pokemons.filter(p => p.alive && !p.eliminating).length;
        this.ui.updateRemaining(remaining, this.totalCount);

        this.ui.addEvent(`${defender.name} eliminated by ${attacker.name}!`, true);
        this.ui.showEliminationBanner(attacker.name, defender.name);

        // Spawn item drop
        if (this.ui.customRules.itemsEnabled) {
            this.itemManager.spawnItem(defender.x, defender.y);
        }

        if (remaining <= 1) {
            setTimeout(() => {
                const survivor = this.pokemons.find(p => p.alive && !p.eliminating) || attacker;
                this.winner = survivor;
                this.running = false;
                this.arena.resetCamera();
                this.music.playTrack('victory');
                this.effects.spawnConfetti(survivor.x, survivor.y);
                this.ui.showVictory(survivor, this.pokemons);
            }, 1000);
        }
    }

    _prepareTournament(rosterSize) {
        // Split roster into groups
        const numGroups = this.tournamentMaxRounds === 3 ? 6 : 4;
        const perGroup = Math.ceil(this.roster.length / numGroups);
        this.tournamentGroups = [];
        for (let i = 0; i < numGroups; i++) {
            this.tournamentGroups.push(this.roster.slice(i * perGroup, (i + 1) * perGroup));
        }
        this.tournamentRound = 1;
        this.currentGroupIndex = 0;
        this.tournamentResults = [];
        this.tournamentAdvancers = [];
        this.music.playTrack('betting');
        // In tournament mode, skip betting and go straight to first group battle
        this.ui.predictionState = null;
        this._startTournamentGroupBattle();
    }

    _startTournamentGroupBattle() {
        const group = this.tournamentGroups[this.currentGroupIndex];
        if (!group || group.length === 0) {
            this._showBracketResults();
            return;
        }

        // Solo Pokemon gets an automatic bye
        if (group.length === 1) {
            const byeData = group[0];
            this.tournamentResults.push({
                groupIndex: this.currentGroupIndex,
                name: `Group ${this.currentGroupIndex + 1}`,
                pokemon: [{ id: byeData.id, name: byeData.name, kills: 0, advanced: true, bye: true }]
            });
            this.tournamentAdvancers.push(byeData);
            this.ui.addEvent(`${byeData.name} gets a bye!`);
            this.currentGroupIndex++;
            if (this.currentGroupIndex < this.tournamentGroups.length) {
                this._startTournamentGroupBattle();
            } else {
                this.music.playTrack('menu');
                this._showBracketResults();
            }
            return;
        }

        // Pick a random arena tileset
        this.arena.selectRandomArena();

        const wrapper = document.querySelector('.arena-wrapper');
        if (wrapper) {
            wrapper.appendChild(this.canvasEl);
            requestAnimationFrame(() => this.arena.resize());
        }

        this.pokemons = group.map(data =>
            new Pokemon(data, this.arena.width, this.arena.height)
        );

        this.totalCount = group.length;
        this.winner = null;
        this.running = false;
        this.lastTime = performance.now();
        this.itemManager.clear();
        this.weather.reset();
        this.weather.weatherEnabled = this.ui.customRules.weatherEnabled;
        this.weather.arenaEventsEnabled = this.ui.customRules.arenaEventsEnabled;
        this.weather.weatherLock = this.ui.customRules.weatherLock;

        const groupLabel = `Round ${this.tournamentRound} - Group ${this.currentGroupIndex + 1}/${this.tournamentGroups.length}`;
        this.ui.showBattle(this.totalCount);
        this.ui.addEvent(`--- ${groupLabel} ---`);
        this.ui.showCountdown(() => {
            this.running = true;
            this.lastTime = performance.now();
            this.music.playTrack('battle');
            this.battleEngine.triggerEntryAbilities(this.pokemons);
        });
    }

    _onTournamentElimination(attacker, defender) {
        const remaining = this.pokemons.filter(p => p.alive && !p.eliminating).length;
        this.ui.updateRemaining(remaining, this.totalCount);
        this.ui.addEvent(`${defender.name} eliminated by ${attacker.name}!`, true);
        this.ui.showEliminationBanner(attacker.name, defender.name);
        if (this.ui.customRules.itemsEnabled) {
            this.itemManager.spawnItem(defender.x, defender.y);
        }

        if (remaining <= 1) {
            setTimeout(() => {
                const survivor = this.pokemons.find(p => p.alive && !p.eliminating) || attacker;
                this.running = false;
                this.arena.resetCamera();

                // Record results for this group: sort by elimination order (alive first, then by kills)
                const sorted = [...this.pokemons].sort((a, b) => {
                    if (a.alive !== b.alive) return b.alive - a.alive;
                    return b.stats.kills - a.stats.kills;
                });

                // How many advance per group
                const advanceCount = this.tournamentMaxRounds === 3
                    ? (this.tournamentRound === 1 ? 3 : 4)
                    : Math.min(3, Math.ceil(sorted.length / 2));

                const groupResult = sorted.map((p, i) => ({
                    id: p.originalId,
                    name: p.name,
                    kills: p.stats.kills,
                    advanced: i < advanceCount
                }));

                this.tournamentResults.push({
                    groupIndex: this.currentGroupIndex,
                    name: `Group ${this.currentGroupIndex + 1}`,
                    pokemon: groupResult
                });

                // Collect advancers (use original data from roster for re-instantiation)
                const advancerIds = new Set(groupResult.filter(p => p.advanced).map(p => p.id));
                const groupRoster = this.tournamentGroups[this.currentGroupIndex];
                for (const data of groupRoster) {
                    if (advancerIds.has(data.id)) {
                        this.tournamentAdvancers.push(data);
                    }
                }

                this.currentGroupIndex++;
                this.music.playTrack('menu');
                this._showBracketResults();
            }, 1000);
        }
    }

    _showBracketResults() {
        const isFinalRound = (this.tournamentMaxRounds === 2 && this.tournamentRound >= 2)
            || (this.tournamentMaxRounds === 3 && this.tournamentRound >= 3);
        const moreGroupsThisRound = this.currentGroupIndex < this.tournamentGroups.length;
        const allGroupsDone = !moreGroupsThisRound;

        let title, buttonLabel;
        if (isFinalRound && allGroupsDone) {
            title = 'Grand Finals Complete!';
            buttonLabel = 'View Winner';
        } else if (allGroupsDone) {
            title = `Round ${this.tournamentRound} Complete`;
            buttonLabel = 'Next Round';
        } else {
            title = `Round ${this.tournamentRound} - Group ${this.currentGroupIndex} / ${this.tournamentGroups.length}`;
            buttonLabel = 'Next Match';
        }

        this.ui.showBracketScreen({
            title,
            groups: this.tournamentResults,
            isFinal: isFinalRound && allGroupsDone,
            buttonLabel,
            totalGroups: this.tournamentGroups.length,
            completedCount: this.currentGroupIndex,
            lastCompletedIndex: this.tournamentResults.length - 1
        });

        if (isFinalRound && allGroupsDone) {
            this.ui.onNextRound = () => {
                this.ui.hideBracketScreen();
                const lastGroup = this.tournamentResults[this.tournamentResults.length - 1];
                const winnerId = lastGroup?.pokemon?.[0]?.id;
                const winnerPoke = this.pokemons.find(p => p.originalId === winnerId) || this.pokemons.find(p => p.alive);
                if (winnerPoke) {
                    this.effects.spawnConfetti(winnerPoke.x, winnerPoke.y);
                    this.music.playTrack('victory');
                    this.ui.showVictory(winnerPoke, this.pokemons);
                } else {
                    this.ui.showSettings();
                }
            };
        } else if (allGroupsDone) {
            this.ui.onNextRound = () => {
                this.ui.hideBracketScreen();
                this._advanceToNextRound();
            };
        } else {
            this.ui.onNextRound = () => {
                this.ui.hideBracketScreen();
                this._startTournamentGroupBattle();
            };
        }
    }

    _advanceToNextRound() {
        this.tournamentRound++;
        // Form new groups from advancers
        const advancers = [...this.tournamentAdvancers].sort(() => Math.random() - 0.5);
        this.tournamentAdvancers = [];
        this.tournamentResults = [];

        let numGroups;
        if (this.tournamentMaxRounds === 3 && this.tournamentRound === 2) {
            numGroups = 2; // Semifinals
        } else {
            numGroups = 1; // Finals
        }

        const perGroup = Math.ceil(advancers.length / numGroups);
        this.tournamentGroups = [];
        for (let i = 0; i < numGroups; i++) {
            this.tournamentGroups.push(advancers.slice(i * perGroup, (i + 1) * perGroup));
        }

        this.currentGroupIndex = 0;
        this._startTournamentGroupBattle();
    }

    // =========== Endless Mode ===========

    _startEndlessMode() {
        this.endlessMode = true;
        this.endlessWave = 0;
        this.endlessTeamSize = this.ui.selectedTeamSize;
        this.endlessTeamData = [];
        this.endlessTeamPokemon = [];
        this.endlessScore = 0;
        this.tournamentMode = false;
        this._showEndlessDraft();
    }

    _showEndlessDraft() {
        // Pick 3 random base-form options not already on team
        const teamIds = new Set(this.endlessTeamData.map(d => d.id));
        const pool = this._filterByType(BASE_FORM_POKEMON).filter(d => !teamIds.has(d.id));
        const shuffled = pool.sort(() => Math.random() - 0.5);
        const options = shuffled.slice(0, 3);

        this.ui.showDraftScreen(options, this.endlessTeamData, this.endlessTeamSize, (picked) => {
            if (picked) {
                this.endlessTeamData.push(picked);
            }
            if (this.endlessTeamData.length < this.endlessTeamSize) {
                this._showEndlessDraft();
            } else {
                this._showStrategyScreen();
            }
        });
    }

    _showStrategyScreen() {
        this.ui.showStrategyScreen(this.endlessTeamData, suggestRole, (roleAssignments) => {
            // Store role assignments on team data
            for (let i = 0; i < this.endlessTeamData.length; i++) {
                this.endlessTeamData[i]._role = roleAssignments[i];
            }
            this._startEndlessWave();
        });
    }

    _startEndlessWave() {
        this.endlessWave++;
        this.endlessScore += this.endlessWave;

        this.arena.selectRandomArena();
        const wrapper = document.querySelector('.arena-wrapper');
        if (wrapper) {
            wrapper.appendChild(this.canvasEl);
            requestAnimationFrame(() => this.arena.resize());
        }

        // Create team Pokemon from data
        const teamCount = this.endlessTeamData.length;
        this.endlessTeamPokemon = this.endlessTeamData.map((data, idx) => {
            const p = new Pokemon(data, this.arena.width, this.arena.height);
            p._endlessExp = data._endlessExp || 0;
            p._isPlayerTeam = true;
            // Assign role
            if (data._role) {
                p.role = data._role;
            }
            // Restore HP from previous wave
            if (data._savedHpRatio !== undefined && data._savedHpRatio > 0) {
                p.hp = Math.max(1, Math.round(p.maxHp * data._savedHpRatio));
                p.displayHp = p.hp;
            }
            // Role-based spawn X, distribute Y evenly
            const roleCfg = p.role && ROLE_CONFIG[p.role];
            const spawnX = roleCfg ? roleCfg.spawnXBase + Math.random() * 40 : 100 + Math.random() * 100;
            const ySpread = this.arena.height * 0.6;
            const yStart = (this.arena.height - ySpread) / 2;
            p.x = spawnX;
            p.y = teamCount > 1 ? yStart + (idx / (teamCount - 1)) * ySpread : this.arena.height / 2;
            return p;
        });

        // Generate enemies
        const enemies = this._generateEndlessEnemies();

        // Combine into battle roster
        this.pokemons = [...this.endlessTeamPokemon, ...enemies];
        this.roster = this.pokemons.map(p => ({ id: p.id, name: p.name, types: p.types, stats: p.baseStats }));
        this.totalCount = this.pokemons.length;
        this.winner = null;
        this.running = false;
        this.lastTime = performance.now();
        this.itemManager.clear();
        this.weather.reset();
        this.weather.weatherEnabled = this.ui.customRules.weatherEnabled;
        this.weather.arenaEventsEnabled = this.ui.customRules.arenaEventsEnabled;
        this.weather.weatherLock = this.ui.customRules.weatherLock;

        this.ui.showBattle(this.totalCount);
        this.ui.updateWaveIndicator(this.endlessWave);
        this.ui.addEvent(`--- Wave ${this.endlessWave} ---`);
        this.ui.predictionState = null;

        this.ui.showCountdown(() => {
            this.running = true;
            this.lastTime = performance.now();
            this.music.playTrack('battle');
            this.battleEngine.triggerEntryAbilities(this.pokemons);
        });
    }

    _generateEndlessEnemies() {
        const count = this.endlessTeamSize;
        const wave = this.endlessWave;
        const statMult = 0.9 + 0.1 * wave;

        const enemies = [];
        const allPokemon = [...POKEMON_DATA];
        const shuffled = allPokemon.sort(() => Math.random() - 0.5);

        let picked = 0;
        for (const data of shuffled) {
            if (picked >= count) break;

            // Filter by wave difficulty
            const isEvolved = EVOLUTION_CHAINS[data.id] === undefined &&
                Object.values(EVOLUTION_CHAINS).some(c => c.nextId === data.id);
            const isFinalStage = !EVOLUTION_CHAINS[data.id] && isEvolved;
            const isBaseForm = !isEvolved;
            const isMidStage = isEvolved && EVOLUTION_CHAINS[data.id];

            if (wave <= 2 && !isBaseForm) continue;
            if (wave <= 4 && isFinalStage && Math.random() > 0.3) continue;
            if (wave >= 5 && isBaseForm && Math.random() > 0.6) continue;

            // Create enemy with scaled stats
            const scaledData = {
                ...data,
                stats: {
                    hp: Math.round(data.stats.hp * statMult),
                    attack: Math.round(data.stats.attack * statMult),
                    defense: Math.round(data.stats.defense * statMult),
                    spAtk: Math.round(data.stats.spAtk * statMult),
                    spDef: Math.round(data.stats.spDef * statMult),
                    speed: Math.round(data.stats.speed * statMult),
                }
            };

            const p = new Pokemon(scaledData, this.arena.width, this.arena.height);
            p._isPlayerTeam = false;
            // Place on right side
            p.x = this.arena.width - 100 - Math.random() * 100;
            p.y = this.arena.height / 2 + (Math.random() - 0.5) * 200;
            enemies.push(p);
            picked++;
        }

        return enemies;
    }

    _onEndlessElimination(attacker, defender) {
        const remaining = this.pokemons.filter(p => p.alive && !p.eliminating).length;
        this.ui.updateRemaining(remaining, this.totalCount);
        this.ui.addEvent(`${defender.name} eliminated by ${attacker.name}!`, true);
        this.ui.showEliminationBanner(attacker.name, defender.name);
        if (this.ui.customRules.itemsEnabled) {
            this.itemManager.spawnItem(defender.x, defender.y);
        }

        const teamAlive = this.endlessTeamPokemon.filter(p => p.alive && !p.eliminating);
        const enemiesAlive = this.pokemons.filter(p => p.alive && !p.eliminating && !p._isPlayerTeam);

        if (teamAlive.length === 0) {
            // All player team dead — game over
            setTimeout(() => {
                this.running = false;
                this.arena.resetCamera();
                this.music.playTrack('menu');
                this.ui.showEndlessGameOver(this.endlessWave, this.endlessScore, this.endlessTeamPokemon);
            }, 1000);
        } else if (enemiesAlive.length === 0) {
            // All enemies dead — wave clear!
            setTimeout(() => {
                this.running = false;
                this.arena.resetCamera();
                this._endlessWaveClear();
            }, 1000);
        }
    }

    _endlessWaveClear() {
        this.music.playTrack('menu');

        // 30% heal for surviving team members
        const alive = this.endlessTeamPokemon.filter(p => p.alive);
        for (const p of alive) {
            p.heal(0.3);
        }

        // Grant EXP and check evolution
        for (const p of alive) {
            p._endlessExp = (p._endlessExp || 0) + this.endlessWave;

            // Check evolution
            const chain = EVOLUTION_CHAINS[p.id];
            if (chain) {
                const needsFirst = p._endlessExp >= 3;
                const needsSecond = p._endlessExp >= 8;
                const evoData = POKEMON_DATA.find(d => d.id === chain.nextId);
                if (evoData && (needsFirst || needsSecond)) {
                    const oldName = p.name;
                    // Store EXP and role before evolve (evolve resets some state)
                    const savedExp = p._endlessExp;
                    const savedRole = p.role;
                    p.killCount = chain.killsNeeded; // Force evolution eligibility
                    p.evolve(evoData);
                    p._endlessExp = savedExp;
                    p.role = savedRole;
                    this.ui.addEvent(`${oldName} evolved into ${p.name}!`);

                    // Update team data to match evolved form
                    const idx = this.endlessTeamData.findIndex(d => d.id !== p.id && d.name !== p.name);
                    for (let i = 0; i < this.endlessTeamData.length; i++) {
                        if (this.endlessTeamPokemon[i] === p) {
                            this.endlessTeamData[i] = { ...evoData, _endlessExp: savedExp, _role: savedRole };
                            break;
                        }
                    }
                }
            }
        }

        // Sync surviving team data back (HP state is in Pokemon objects)
        for (let i = 0; i < this.endlessTeamData.length; i++) {
            const p = this.endlessTeamPokemon[i];
            if (p) {
                this.endlessTeamData[i] = {
                    ...POKEMON_DATA.find(d => d.id === p.id) || this.endlessTeamData[i],
                    _endlessExp: p._endlessExp || 0,
                    _savedHpRatio: p.alive ? p.hp / p.maxHp : 0,
                    _role: p.role || this.endlessTeamData[i]._role || null,
                };
            }
        }

        // Show upgrade screen
        this._showEndlessUpgrade();
    }

    _showEndlessUpgrade() {
        const UPGRADE_POOL = [
            { name: 'Vitality', icon: '\u2764', description: '+20% Max HP, full heal', effect: (p) => { p.maxHp = Math.round(p.maxHp * 1.2); p.hp = p.maxHp; } },
            { name: 'Power Crystal', icon: '\u2694', description: '+25% Attack', effect: (p) => { p.attack = Math.round(p.attack * 1.25); } },
            { name: 'Iron Shell', icon: '\uD83D\uDEE1', description: '+25% Defense', effect: (p) => { p.defense = Math.round(p.defense * 1.25); } },
            { name: 'Mystic Lens', icon: '\uD83D\uDD2E', description: '+25% Sp. Attack', effect: (p) => { p.spAtk = Math.round(p.spAtk * 1.25); } },
            { name: 'Spirit Cloak', icon: '\uD83D\uDC7B', description: '+25% Sp. Defense', effect: (p) => { p.spDef = Math.round(p.spDef * 1.25); } },
            { name: 'Quick Claw', icon: '\u26A1', description: '+25% Speed', effect: (p) => { p.speed = Math.round(p.speed * 1.25); } },
            { name: 'Full Restore', icon: '\uD83D\uDC8A', description: 'Fully heal all team', targetAll: true, effect: (team) => { for (const p of team) if (p.alive) p.hp = p.maxHp; } },
            { name: 'Focus Band', icon: '\uD83C\uDF1F', description: 'Survive one lethal hit', effect: (p) => { p.focusSash = true; } },
            { name: 'Rare Candy', icon: '\uD83C\uDF6C', description: '+10% all stats', effect: (p) => { p.maxHp = Math.round(p.maxHp * 1.1); p.hp = Math.min(p.hp, p.maxHp); p.attack = Math.round(p.attack * 1.1); p.defense = Math.round(p.defense * 1.1); p.spAtk = Math.round(p.spAtk * 1.1); p.spDef = Math.round(p.spDef * 1.1); p.speed = Math.round(p.speed * 1.1); } },
        ];

        const shuffled = [...UPGRADE_POOL].sort(() => Math.random() - 0.5);
        const options = shuffled.slice(0, 3);
        const aliveTeam = this.endlessTeamPokemon.filter(p => p.alive);

        this.ui.showUpgradeScreen(options, aliveTeam, (upgrade, target) => {
            if (upgrade.targetAll) {
                upgrade.effect(aliveTeam);
                this.ui.addEvent(`Used ${upgrade.name} on the whole team!`);
            } else if (target) {
                upgrade.effect(target);
                this.ui.addEvent(`${target.name} received ${upgrade.name}!`);
            }

            // Check if any team members were lost
            const deadCount = this.endlessTeamPokemon.filter(p => !p.alive).length;
            if (deadCount > 0) {
                this._showEndlessReplacementDraft();
            } else {
                this._startEndlessWave();
            }
        }, () => {
            // "Reassign Roles" callback
            this._showStrategyScreen();
        });
    }

    _showEndlessReplacementDraft() {
        // Remove dead team members from data (only once, before any picks)
        const aliveData = [];
        const alivePokemon = [];
        for (let i = 0; i < this.endlessTeamPokemon.length; i++) {
            const p = this.endlessTeamPokemon[i];
            if (p && p.alive) {
                aliveData.push(this.endlessTeamData[i]);
                alivePokemon.push(p);
            }
        }
        this.endlessTeamData = aliveData;
        this.endlessTeamPokemon = alivePokemon;

        this._showEndlessReplacementPick();
    }

    _showEndlessReplacementPick() {
        if (this.endlessTeamData.length >= this.endlessTeamSize) {
            this._startEndlessWave();
            return;
        }

        const teamIds = new Set(this.endlessTeamData.map(d => d.id));
        const pool = this._filterByType(BASE_FORM_POKEMON).filter(d => !teamIds.has(d.id));
        const shuffled = pool.sort(() => Math.random() - 0.5);
        const options = shuffled.slice(0, 3);

        this.ui.showDraftScreen(options, this.endlessTeamData, this.endlessTeamSize, (picked) => {
            if (picked) {
                picked._role = suggestRole(picked);
                this.endlessTeamData.push(picked);
            }
            if (this.endlessTeamData.length < this.endlessTeamSize && picked) {
                this._showEndlessReplacementPick(); // No cleanup on recursion
            } else {
                this._startEndlessWave();
            }
        }, true);
    }

    // =========== End Endless Mode ===========

    _loop(timestamp) {
        requestAnimationFrame((t) => this._loop(t));

        if (!this.running || this.ui.paused) {
            if (this.running) {
                this.arena.beginFrame(this.effects.screenShake.x, this.effects.screenShake.y);
                this.weather.draw(this.arena.ctx, this.arena.width, this.arena.height, timestamp);
                this.itemManager.draw(this.arena.ctx, timestamp);
                for (const p of this.pokemons) p.draw(this.arena.ctx, timestamp);
                this.effects.draw(this.arena.ctx);
                this.arena.endFrame();
            }
            this.lastTime = timestamp;
            return;
        }

        const rawDt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        let dt = Math.min(rawDt, 50) * this.ui.speed;

        if (this.slowMoFrames > 0) {
            dt *= 0.3;
            this.slowMoFrames--;
        }

        const alivePokemons = this.pokemons.filter(p => p.alive && !p.eliminating);
        const remaining = alivePokemons.length;

        // Update weather-based ability speed modifiers
        const weatherName = this.weather.currentWeather?.name || 'Clear';
        for (const p of alivePokemons) {
            if (p.ability === 'Chlorophyll' && weatherName === 'Sun') {
                p.weatherSpeedMult = 2;
            } else if (p.ability === 'Swift Swim' && weatherName === 'Rain') {
                p.weatherSpeedMult = 2;
            } else {
                p.weatherSpeedMult = 1;
            }
        }

        for (const p of this.pokemons) {
            p.update(dt, timestamp, remaining);
            if (p.alive && !p.eliminating) p.stats.survivalTime += dt;
        }

        // Imposter: copy first target's types & stats
        for (const p of alivePokemons) {
            if (p.ability === 'Imposter' && !p.abilityState.imposterUsed && p.target) {
                p.abilityState.imposterUsed = true;
                const t = p.target;
                p.types = [...t.types];
                p.attack = t.attack;
                p.defense = t.defense;
                p.spAtk = t.spAtk;
                p.spDef = t.spDef;
                p.speed = t.speed;
                this.ui.addEvent(`${p.name} transformed into ${t.name}'s likeness!`);
            }
        }

        this.battleEngine.update(this.pokemons, dt);

        // Update items (proximity pickup)
        this.itemManager.update(dt, alivePokemons, this.effects, (text) => {
            this.ui.addEvent(text);
        }, this.music);

        // Update weather, arena events, storm circle
        this.weather.update(dt, this.pokemons, this.arena.width, this.arena.height, this.effects, (text) => {
            this.ui.addEvent(text);
        });

        // Spawn continuous status effect particles
        for (const p of this.pokemons) {
            if (p.alive && !p.eliminating && p.statusEffect) {
                this.effects.spawnStatusParticles(p.x, p.y, p.statusEffect, dt);
            }
        }

        this.effects.update(dt);

        // Update leaderboard + weather indicator every ~250ms (not every frame)
        this._lbTimer = (this._lbTimer || 0) + rawDt;
        if (this._lbTimer > 250) {
            this._lbTimer = 0;
            this.ui.updateLeaderboard(this.pokemons);
            this.ui.updateWeather(this.weather.currentWeather);
        }

        // Camera focus: pick most interesting Pokemon to follow
        if (this.arena.autoCam && alivePokemons.length > 1) {
            let bestScore = -1, bestX = this.arena.width / 2, bestY = this.arena.height / 2;
            for (const p of alivePokemons) {
                let score = p.stats.kills * 10;
                score += (1 - p.hp / p.maxHp) * 30;
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

        this.arena.beginFrame(this.effects.screenShake.x, this.effects.screenShake.y);
        // Draw weather (storm circle, weather overlay, heal zones) on arena
        this.weather.draw(this.arena.ctx, this.arena.width, this.arena.height, timestamp);
        // Draw items BEFORE Pokemon (underneath)
        this.itemManager.draw(this.arena.ctx, timestamp);
        // Last-3 spotlight: darken arena and spotlight remaining Pokemon
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
        for (const p of this.pokemons) p.draw(this.arena.ctx, timestamp);
        this.effects.draw(this.arena.ctx);
        this.arena.endFrame();

        // Minimap (drawn outside camera transform)
        if (this.arena.autoCam && this.arena.camera.zoom > 1.05) {
            const mw = 140, mh = 90, mx = this.arena.ctx.canvas.width - mw - 8, my = 8;
            const ctx = this.arena.ctx;
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#0a0a14';
            ctx.fillRect(mx, my, mw, mh);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(mx, my, mw, mh);
            const sx = mw / this.arena.width, sy = mh / this.arena.height;
            for (const p of this.pokemons) {
                if (!p.alive) continue;
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(mx + p.x * sx - 2, my + p.y * sy - 2, 4, 4);
            }
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
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
