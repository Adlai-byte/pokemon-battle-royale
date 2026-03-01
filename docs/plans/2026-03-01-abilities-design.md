# Pokemon Abilities — Design Document

## Overview

Add game-accurate passive abilities to all 151 Gen 1 Pokemon. Each Pokemon gets one ability that triggers automatically during battle. Abilities replace the existing hardcoded type traits (ghost dodge, steel damage reduction, grass regen, poison DOT reduction).

## Architecture

### New file: `js/abilities.js`

Exports:
- `POKEMON_ABILITIES`: Map of Pokemon ID → ability name string
- `ABILITY_EFFECTS`: Map of ability name → `{ trigger, description, apply() }`
- Helper functions called by the battle engine at hook points

### Trigger types

| Trigger | When it fires | Examples |
|---------|--------------|---------|
| `onBattleStart` | Once when battle begins | Intimidate |
| `onTakeDamage` | After receiving damage, before lethal check | Sturdy, Static, Poison Point, Flame Body |
| `onDealDamage` | When calculating outgoing damage (multiplier) | Overgrow, Blaze, Torrent, Guts, Adaptability, Flash Fire |
| `onTick` | Every update tick | Speed Boost, Chlorophyll, Swift Swim, Pressure |
| `onStatusApplied` | When a status would be applied | Limber, Insomnia, Own Tempo, Natural Cure |
| `onBeforeHit` | Before damage is applied to this Pokemon | Thick Fat, Shell Armor, Levitate |
| `passive` | Constant modifier, checked inline | Rock Head, Compound Eyes, Keen Eye, Hyper Cutter |

### Integration with battle engine (`js/battle.js`)

Add thin hook calls at existing decision points:

```
_basicAttack / _executeDamagingMove:
  → onBeforeHit(defender, move) — can modify damage or nullify
  → onDealDamage(attacker, defender, move) — can modify damage multiplier
  → onTakeDamage(defender, attacker, damage) — can trigger contact effects

_applyDOT:
  → Remove grass regen (replaced by ability system)
  → Remove poison DOT reduction (replaced by abilities)

_checkLethal:
  → Check Sturdy before elimination

_canAct:
  → No changes needed (status immunities prevent status from being applied)
```

### Remove existing type traits

- `GHOST_DODGE_CHANCE` — replaced by Levitate/Cursed Body
- `STEEL_DAMAGE_REDUCTION` — replaced by Sturdy/Shell Armor per-Pokemon
- `GRASS_REGEN_RATE` + grass regen block — replaced by Overgrow/Chlorophyll
- `POISON_DOT_REDUCTION` — removed (Poison types get Poison Point instead)

## Complete Ability Assignments

### Starter abilities (boost at low HP)

| ID | Pokemon | Ability |
|----|---------|---------|
| 1-3 | Bulbasaur/Ivysaur/Venusaur | Overgrow |
| 4-6 | Charmander/Charmeleon/Charizard | Blaze |
| 7-9 | Squirtle/Wartortle/Blastoise | Torrent |

### Contact-punish abilities

| ID | Pokemon | Ability |
|----|---------|---------|
| 25-26 | Pikachu/Raichu | Static |
| 100-101 | Voltorb/Electrode | Static |
| 125 | Electabuzz | Static |
| 29-31 | Nidoran F/Nidorina/Nidoqueen | Poison Point |
| 32-34 | Nidoran M/Nidorino/Nidoking | Poison Point |
| 72-73 | Tentacool/Tentacruel | Poison Point |
| 126 | Magmar | Flame Body |
| 146 | Moltres | Flame Body |

### Immunities & absorb

| ID | Pokemon | Ability |
|----|---------|---------|
| 92-94 | Gastly/Haunter/Gengar | Levitate |
| 134 | Vaporeon | Water Absorb |
| 131 | Lapras | Water Absorb |
| 60-62 | Poliwag/Poliwhirl/Poliwrath | Water Absorb |
| 37-38 | Vulpix/Ninetales | Flash Fire |
| 77-78 | Ponyta/Rapidash | Flash Fire |
| 136 | Flareon | Flash Fire |
| 58-59 | Growlithe/Arcanine | Flash Fire |

### Stat modification

| ID | Pokemon | Ability |
|----|---------|---------|
| 23-24 | Ekans/Arbok | Intimidate |
| 128 | Tauros | Intimidate |
| 130 | Gyarados | Intimidate |
| 63-65 | Abra/Kadabra/Alakazam | Synchronize |
| 151 | Mew | Synchronize |
| 150 | Mewtwo | Pressure |
| 144 | Articuno | Pressure |
| 145 | Zapdos | Pressure |

### Damage reduction / survivability

| ID | Pokemon | Ability |
|----|---------|---------|
| 74-76 | Geodude/Graveler/Golem | Sturdy |
| 95 | Onix | Sturdy |
| 81-82 | Magnemite/Magneton | Sturdy |
| 143 | Snorlax | Thick Fat |
| 87 | Dewgong | Thick Fat |
| 39-40 | Jigglypuff/Wigglytuff | Thick Fat |
| 86 | Seel | Thick Fat |
| 90-91 | Shellder/Cloyster | Shell Armor |
| 98-99 | Krabby/Kingler | Shell Armor |
| 147-148 | Dratini/Dragonair | Marvel Scale |

### Speed / weather

| ID | Pokemon | Ability |
|----|---------|---------|
| 43-45 | Oddish/Gloom/Vileplume | Chlorophyll |
| 69-71 | Bellsprout/Weepinbell/Victreebel | Chlorophyll |
| 102-103 | Exeggcute/Exeggutor | Chlorophyll |
| 114 | Tangela | Chlorophyll |
| 46-47 | Paras/Parasect | Chlorophyll |
| 116-117 | Horsea/Seadra | Swift Swim |
| 118-119 | Goldeen/Seaking | Swift Swim |
| 138-139 | Omanyte/Omastar | Swift Swim |
| 140-141 | Kabuto/Kabutops | Swift Swim |

### Offensive passives

| ID | Pokemon | Ability |
|----|---------|---------|
| 19-20 | Rattata/Raticate | Guts |
| 66-68 | Machop/Machoke/Machamp | Guts |
| 56-57 | Mankey/Primeape | Guts |
| 133 | Eevee | Adaptability |
| 137 | Porygon | Adaptability |
| 127 | Pinsir | Hyper Cutter |
| 111-112 | Rhyhorn/Rhydon | Rock Head |
| 142 | Aerodactyl | Rock Head |
| 104-105 | Cubone/Marowak | Rock Head |

### Status immunities

| ID | Pokemon | Ability |
|----|---------|---------|
| 96-97 | Drowzee/Hypno | Insomnia |
| 52-53 | Meowth/Persian | Limber |
| 106 | Hitmonlee | Limber |
| 79-80 | Slowpoke/Slowbro | Own Tempo |
| 108 | Lickitung | Own Tempo |
| 113 | Chansey | Natural Cure |
| 120-121 | Staryu/Starmie | Natural Cure |

### Accuracy / crit protection

| ID | Pokemon | Ability |
|----|---------|---------|
| 10-12 | Caterpie/Metapod/Butterfree | Compound Eyes |
| 48-49 | Venonat/Venomoth | Compound Eyes |
| 16-18 | Pidgey/Pidgeotto/Pidgeot | Keen Eye |
| 21-22 | Spearow/Fearow | Keen Eye |
| 83 | Farfetchd | Keen Eye |
| 84-85 | Doduo/Dodrio | Keen Eye |

### Other

| ID | Pokemon | Ability |
|----|---------|---------|
| 149 | Dragonite | Inner Focus |
| 107 | Hitmonchan | Inner Focus |
| 54-55 | Psyduck/Golduck | Damp |
| 41-42 | Zubat/Golbat | Inner Focus |
| 88-89 | Grimer/Muk | Sticky Hold |
| 109-110 | Koffing/Weezing | Levitate |
| 35-36 | Clefairy/Clefable | Magic Guard |
| 122 | Mr. Mime | Soundproof |
| 123 | Scyther | Technician |
| 124 | Jynx | Oblivious |
| 115 | Kangaskhan | Scrappy |
| 129 | Magikarp | Swift Swim |
| 132 | Ditto | Imposter |
| 27-28 | Sandshrew/Sandslash | Sand Veil |
| 50-51 | Diglett/Dugtrio | Arena Trap |
| 135 | Jolteon | Volt Absorb |

## Ability Effect Definitions

### Damage boost abilities
- **Overgrow/Blaze/Torrent**: When HP < 33%, moves matching type deal 1.5x damage
- **Guts**: When statused, physical attacks deal 1.5x damage
- **Adaptability**: STAB bonus is 2.0x instead of 1.5x
- **Technician**: Moves with power <= 60 deal 1.5x damage
- **Hyper Cutter**: Attack stat cannot be lowered by enemy debuffs

### Immunity/absorb abilities
- **Levitate**: Immune to ground-type damage
- **Flash Fire**: Immune to fire damage; after being hit by fire, own fire moves deal 1.5x
- **Water Absorb**: Immune to water damage; heals 10% maxHP instead
- **Volt Absorb**: Immune to electric damage; heals 10% maxHP instead
- **Damp**: Nullifies self-destruct/explosion moves in AOE range
- **Soundproof**: Immune to sound-based status moves (Sing, Screech, etc.) — treated as 50% chance to resist status

### Contact-punish abilities
- **Static**: 30% chance to paralyze attacker when hit by physical attack
- **Poison Point**: 30% chance to poison attacker when hit by physical attack
- **Flame Body**: 30% chance to burn attacker when hit by physical attack

### Damage reduction
- **Thick Fat**: Fire and ice damage taken is halved
- **Shell Armor**: Cannot be critically hit
- **Sturdy**: First lethal hit leaves at 1 HP (once per battle, like Focus Sash)
- **Marvel Scale**: +50% defense when statused
- **Magic Guard**: Immune to DOT (poison/burn/toxic damage)
- **Sand Veil**: 20% dodge chance during sandstorm weather (10% otherwise)

### Status immunity
- **Insomnia**: Immune to sleep
- **Limber**: Immune to paralysis
- **Own Tempo**: Immune to confusion
- **Oblivious**: Immune to confusion and sleep
- **Natural Cure**: Remove status effect when HP drops below 50%

### Speed / weather
- **Chlorophyll**: Double speed during sun weather
- **Swift Swim**: Double speed during rain weather
- **Speed Boost**: Not used (not Gen 1 canonical)

### Stat / battle control
- **Intimidate**: On battle start, -1 attack to all enemies within 150px range
- **Synchronize**: When inflicted with a status, 50% chance to inflict same on attacker
- **Pressure**: Enemies targeting this Pokemon have 20% longer attack cooldowns
- **Keen Eye**: Immune to accuracy/evasion stat reductions
- **Inner Focus**: Immune to confusion; +10% energy gain rate
- **Arena Trap**: Enemies within combat range move 30% slower

### Other
- **Rock Head**: No recoil damage from recoil moves
- **Compound Eyes**: Moves bypass accuracy checks (status moves always land)
- **Sticky Hold**: Immune to stat debuffs (stat mods cannot be lowered by enemies)
- **Scrappy**: Normal/Fighting moves hit Ghost types neutrally (ignore ghost immunity)
- **Imposter (Ditto)**: Copies the types and base stats of the first target it encounters
- **Adaptability**: STAB is 2.0x instead of 1.5x

## UI Changes

### Champion select (`index.html` / `ui.js`)
- Show ability name in small text on each champion card

### Battle HUD — Pokemon sprite label (`pokemon.js` draw())
- Below the name label, render ability name in smaller dim text

### Event log (`ui.js`)
- Log ability activations: "Arcanine's Flash Fire absorbed the attack!"
- First activation only for one-time abilities: "Geodude's Sturdy held on!"

## Files Modified

1. **New: `js/abilities.js`** — ability data + effect functions
2. **`js/data.js`** — add `ability` field to each POKEMON_DATA entry
3. **`js/pokemon.js`** — store ability, ability state, draw ability name
4. **`js/battle.js`** — remove type traits, add ability hooks
5. **`js/ui.js`** — show ability on champion cards
6. **`css/styles.css`** — ability label styling
