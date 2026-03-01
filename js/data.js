// js/data.js - Gen 1 Pokemon data with types, base stats, type chart, and type colors

export const TYPE_CHART = {
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
    { id: 29, name: "Nidoran F", types: ["poison"], stats: { hp: 55, attack: 47, defense: 52, spAtk: 40, spDef: 40, speed: 41 }},
    { id: 30, name: "Nidorina", types: ["poison"], stats: { hp: 70, attack: 62, defense: 67, spAtk: 55, spDef: 55, speed: 56 }},
    { id: 31, name: "Nidoqueen", types: ["poison","ground"], stats: { hp: 90, attack: 92, defense: 87, spAtk: 75, spDef: 85, speed: 76 }},
    { id: 32, name: "Nidoran M", types: ["poison"], stats: { hp: 46, attack: 57, defense: 40, spAtk: 40, spDef: 40, speed: 50 }},
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
    { id: 83, name: "Farfetchd", types: ["normal","flying"], stats: { hp: 52, attack: 90, defense: 55, spAtk: 58, spDef: 62, speed: 60 }},
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

// Evolution chains: pokemonId -> { nextId, killsNeeded }
// 3-stage: first evo at 1 kill, second at 3 total kills
// 2-stage: evo at 1 kill
export const EVOLUTION_CHAINS = {
    1:  { nextId: 2, killsNeeded: 1 },    // Bulbasaur -> Ivysaur
    2:  { nextId: 3, killsNeeded: 3 },    // Ivysaur -> Venusaur
    4:  { nextId: 5, killsNeeded: 1 },    // Charmander -> Charmeleon
    5:  { nextId: 6, killsNeeded: 3 },    // Charmeleon -> Charizard
    7:  { nextId: 8, killsNeeded: 1 },    // Squirtle -> Wartortle
    8:  { nextId: 9, killsNeeded: 3 },    // Wartortle -> Blastoise
    10: { nextId: 11, killsNeeded: 1 },   // Caterpie -> Metapod
    11: { nextId: 12, killsNeeded: 3 },   // Metapod -> Butterfree
    13: { nextId: 14, killsNeeded: 1 },   // Weedle -> Kakuna
    14: { nextId: 15, killsNeeded: 3 },   // Kakuna -> Beedrill
    16: { nextId: 17, killsNeeded: 1 },   // Pidgey -> Pidgeotto
    17: { nextId: 18, killsNeeded: 3 },   // Pidgeotto -> Pidgeot
    19: { nextId: 20, killsNeeded: 1 },   // Rattata -> Raticate
    21: { nextId: 22, killsNeeded: 1 },   // Spearow -> Fearow
    23: { nextId: 24, killsNeeded: 1 },   // Ekans -> Arbok
    25: { nextId: 26, killsNeeded: 1 },   // Pikachu -> Raichu
    27: { nextId: 28, killsNeeded: 1 },   // Sandshrew -> Sandslash
    29: { nextId: 30, killsNeeded: 1 },   // Nidoran F -> Nidorina
    30: { nextId: 31, killsNeeded: 3 },   // Nidorina -> Nidoqueen
    32: { nextId: 33, killsNeeded: 1 },   // Nidoran M -> Nidorino
    33: { nextId: 34, killsNeeded: 3 },   // Nidorino -> Nidoking
    35: { nextId: 36, killsNeeded: 1 },   // Clefairy -> Clefable
    37: { nextId: 38, killsNeeded: 1 },   // Vulpix -> Ninetales
    39: { nextId: 40, killsNeeded: 1 },   // Jigglypuff -> Wigglytuff
    41: { nextId: 42, killsNeeded: 1 },   // Zubat -> Golbat
    43: { nextId: 44, killsNeeded: 1 },   // Oddish -> Gloom
    44: { nextId: 45, killsNeeded: 3 },   // Gloom -> Vileplume
    46: { nextId: 47, killsNeeded: 1 },   // Paras -> Parasect
    48: { nextId: 49, killsNeeded: 1 },   // Venonat -> Venomoth
    50: { nextId: 51, killsNeeded: 1 },   // Diglett -> Dugtrio
    52: { nextId: 53, killsNeeded: 1 },   // Meowth -> Persian
    54: { nextId: 55, killsNeeded: 1 },   // Psyduck -> Golduck
    56: { nextId: 57, killsNeeded: 1 },   // Mankey -> Primeape
    58: { nextId: 59, killsNeeded: 1 },   // Growlithe -> Arcanine
    60: { nextId: 61, killsNeeded: 1 },   // Poliwag -> Poliwhirl
    61: { nextId: 62, killsNeeded: 3 },   // Poliwhirl -> Poliwrath
    63: { nextId: 64, killsNeeded: 1 },   // Abra -> Kadabra
    64: { nextId: 65, killsNeeded: 3 },   // Kadabra -> Alakazam
    66: { nextId: 67, killsNeeded: 1 },   // Machop -> Machoke
    67: { nextId: 68, killsNeeded: 3 },   // Machoke -> Machamp
    69: { nextId: 70, killsNeeded: 1 },   // Bellsprout -> Weepinbell
    70: { nextId: 71, killsNeeded: 3 },   // Weepinbell -> Victreebel
    72: { nextId: 73, killsNeeded: 1 },   // Tentacool -> Tentacruel
    74: { nextId: 75, killsNeeded: 1 },   // Geodude -> Graveler
    75: { nextId: 76, killsNeeded: 3 },   // Graveler -> Golem
    77: { nextId: 78, killsNeeded: 1 },   // Ponyta -> Rapidash
    79: { nextId: 80, killsNeeded: 1 },   // Slowpoke -> Slowbro
    81: { nextId: 82, killsNeeded: 1 },   // Magnemite -> Magneton
    84: { nextId: 85, killsNeeded: 1 },   // Doduo -> Dodrio
    86: { nextId: 87, killsNeeded: 1 },   // Seel -> Dewgong
    88: { nextId: 89, killsNeeded: 1 },   // Grimer -> Muk
    90: { nextId: 91, killsNeeded: 1 },   // Shellder -> Cloyster
    92: { nextId: 93, killsNeeded: 1 },   // Gastly -> Haunter
    93: { nextId: 94, killsNeeded: 3 },   // Haunter -> Gengar
    96: { nextId: 97, killsNeeded: 1 },   // Drowzee -> Hypno
    98: { nextId: 99, killsNeeded: 1 },   // Krabby -> Kingler
    100: { nextId: 101, killsNeeded: 1 }, // Voltorb -> Electrode
    102: { nextId: 103, killsNeeded: 1 }, // Exeggcute -> Exeggutor
    104: { nextId: 105, killsNeeded: 1 }, // Cubone -> Marowak
    109: { nextId: 110, killsNeeded: 1 }, // Koffing -> Weezing
    111: { nextId: 112, killsNeeded: 1 }, // Rhyhorn -> Rhydon
    116: { nextId: 117, killsNeeded: 1 }, // Horsea -> Seadra
    118: { nextId: 119, killsNeeded: 1 }, // Goldeen -> Seaking
    120: { nextId: 121, killsNeeded: 1 }, // Staryu -> Starmie
    129: { nextId: 130, killsNeeded: 1 }, // Magikarp -> Gyarados
    133: { nextId: 134, killsNeeded: 1 }, // Eevee -> Vaporeon
    138: { nextId: 139, killsNeeded: 1 }, // Omanyte -> Omastar
    140: { nextId: 141, killsNeeded: 1 }, // Kabuto -> Kabutops
    147: { nextId: 148, killsNeeded: 1 }, // Dratini -> Dragonair
    148: { nextId: 149, killsNeeded: 3 }, // Dragonair -> Dragonite
};

export function getSpriteUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

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
