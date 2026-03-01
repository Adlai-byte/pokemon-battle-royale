// js/main.js - App entry point, game loop, state management
import { POKEMON_DATA, EVOLUTION_CHAINS } from './data.js';
import { Pokemon } from './pokemon.js';
import { BattleEngine } from './battle.js';
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

        this.roster = [];

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
            (text, type) => this.ui.showCommentaryBanner(text, type)
        );

        this.battleEngine.weatherManager = this.weather;

        this.ui.onStart = (rosterSize) => this._prepareRoster(rosterSize);
        this.ui.onBettingConfirm = () => this._startBattle();
        this.ui.onPlayAgain = () => {
            this.music.playTrack('menu');
            this.tournamentMode = false;
            this.tournamentRound = 0;
            this.tournamentGroups = [];
            this.tournamentResults = [];
            this.tournamentAdvancers = [];
            // Move canvas back to body for settings screen background
            document.body.insertBefore(this.canvasEl, document.body.firstChild);
            this.arena.resize();
            this.ui.showSettings();
        };
        this.ui.onMuteToggle = () => this.music.toggleMute();

        this.ui.showSettings();
        this.music.playTrack('menu');
        this._loop(0);
    }

    _prepareRoster(rosterSize) {
        // Only base-form Pokemon, no duplicates
        const clamped = Math.min(rosterSize, BASE_FORM_POKEMON.length);
        const shuffled = [...BASE_FORM_POKEMON].sort(() => Math.random() - 0.5);
        this.roster = shuffled.slice(0, clamped);

        this.tournamentMode = this.ui.selectedMode === 'tournament';
        this.tournamentMaxRounds = this.ui.selectedTournamentRounds;
        this.tournamentRound = 0;
        this.tournamentResults = [];
        this.tournamentAdvancers = [];

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

        this.ui.showBattle(this.totalCount);
        this.ui.showCountdown(() => {
            this.running = true;
            this.lastTime = performance.now();
            this.music.playTrack('battle');
            this.battleEngine.triggerEntryAbilities(this.pokemons);
        });
    }

    _onElimination(attacker, defender) {
        if (this.tournamentMode) {
            this._onTournamentElimination(attacker, defender);
            return;
        }

        const remaining = this.pokemons.filter(p => p.alive && !p.eliminating).length;
        this.ui.updateRemaining(remaining, this.totalCount);

        this.ui.addEvent(`${defender.name} eliminated by ${attacker.name}!`, true);
        this.ui.showEliminationBanner(attacker.name, defender.name);

        // Spawn item drop
        this.itemManager.spawnItem(defender.x, defender.y);

        if (remaining <= 1) {
            setTimeout(() => {
                const survivor = this.pokemons.find(p => p.alive && !p.eliminating) || attacker;
                this.winner = survivor;
                this.running = false;
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
        this.itemManager.spawnItem(defender.x, defender.y);

        if (remaining <= 1) {
            setTimeout(() => {
                const survivor = this.pokemons.find(p => p.alive && !p.eliminating) || attacker;
                this.running = false;

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
                if (this.currentGroupIndex < this.tournamentGroups.length) {
                    // More groups to play
                    setTimeout(() => this._startTournamentGroupBattle(), 1500);
                } else {
                    // All groups done, show bracket
                    this.music.playTrack('menu');
                    this._showBracketResults();
                }
            }, 1000);
        }
    }

    _showBracketResults() {
        const isFinalRound = (this.tournamentMaxRounds === 2 && this.tournamentRound >= 2)
            || (this.tournamentMaxRounds === 3 && this.tournamentRound >= 3);

        this.ui.showBracketScreen({
            title: isFinalRound ? 'Grand Finals Complete!' : `Round ${this.tournamentRound} Complete`,
            groups: this.tournamentResults,
            isFinal: isFinalRound
        });

        if (isFinalRound) {
            this.ui.onNextRound = () => {
                this.ui.hideBracketScreen();
                // Find the winner from the last group
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
        } else {
            this.ui.onNextRound = () => {
                this.ui.hideBracketScreen();
                this._advanceToNextRound();
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
        const dt = Math.min(rawDt, 50) * this.ui.speed;

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
        });

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

        this.arena.beginFrame(this.effects.screenShake.x, this.effects.screenShake.y);
        // Draw weather (storm circle, weather overlay, heal zones) on arena
        this.weather.draw(this.arena.ctx, this.arena.width, this.arena.height, timestamp);
        // Draw items BEFORE Pokemon (underneath)
        this.itemManager.draw(this.arena.ctx, timestamp);
        for (const p of this.pokemons) p.draw(this.arena.ctx, timestamp);
        this.effects.draw(this.arena.ctx);
        this.arena.endFrame();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
