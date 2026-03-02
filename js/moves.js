// js/moves.js - Real Pokemon moves database and per-Pokemon movesets

// Move categories
export const MOVE_CAT = {
    PHYSICAL: 'physical',   // Uses Attack vs Defense
    SPECIAL: 'special',     // Uses SpAtk vs SpDef
    DEFENSE: 'defense',     // Raises defense or reduces damage
    ENHANCE: 'enhance',     // Boosts own stats
    STATUS: 'status',       // Inflicts status or debuffs opponent
};

// All moves used in Gen 1 movesets
// power: 0 for non-damaging, otherwise base power
// cat: move category
// type: elemental type
// effect: optional effect description for the engine
// aoe: true if the move hits nearby Pokemon in a radius
// anim: animation style - 'projectile', 'beam', 'explosion', 'self', 'wave', 'strike'
export const MOVES_DB = {
    // === NORMAL ===
    tackle:        { name: "Tackle",        type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 40 },
    bodySlam:      { name: "Body Slam",     type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 85 },
    hyperBeam:     { name: "Hyper Beam",    type: "normal",   cat: MOVE_CAT.SPECIAL,  power: 150, anim: 'beam' },
    extremeSpeed:  { name: "Extreme Speed", type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 80, effect: "priority" },
    rapidSpin:     { name: "Rapid Spin",   type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 50 },
    return:        { name: "Return",       type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 102 },
    quickAttack:   { name: "Quick Attack",  type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 40, effect: "priority" },
    slash:         { name: "Slash",         type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 70, effect: "highCrit", anim: 'slash' },
    headbutt:      { name: "Headbutt",      type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 70 },
    strength:      { name: "Strength",      type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 80 },
    megaPunch:     { name: "Mega Punch",    type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 80, anim: 'punch' },
    megaKick:      { name: "Mega Kick",     type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 120, anim: 'punch' },
    selfDestruct:  { name: "Self-Destruct", type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 200, effect: "selfKO", aoe: true, anim: 'explosion' },
    explosion:     { name: "Explosion",     type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 250, effect: "selfKO", aoe: true, anim: 'explosion' },
    triAttack:     { name: "Tri Attack",    type: "normal",   cat: MOVE_CAT.SPECIAL,  power: 80, anim: 'beam' },
    hyperFang:     { name: "Hyper Fang",    type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 80 },
    pound:         { name: "Pound",         type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 40 },
    doubleSlap:    { name: "Double Slap",   type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 55 },
    wrap:          { name: "Wrap",          type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 35 },
    slam:          { name: "Slam",          type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 80 },
    furyAttack:    { name: "Fury Attack",   type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 55 },
    rage:          { name: "Rage",          type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 50, effect: "rageBoost" },
    takeDown:      { name: "Take Down",     type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 90, effect: "recoil" },
    doubleEdge:    { name: "Double-Edge",   type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 120, effect: "recoil" },
    lick:          { name: "Lick",          type: "ghost",    cat: MOVE_CAT.PHYSICAL, power: 30 },
    bind:          { name: "Bind",          type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 35 },
    cometPunch:    { name: "Comet Punch",   type: "normal",   cat: MOVE_CAT.PHYSICAL, power: 54 },

    // === FIRE ===
    sacredFire:    { name: "Sacred Fire",   type: "fire",     cat: MOVE_CAT.PHYSICAL, power: 100, anim: 'explosion' },
    ember:         { name: "Ember",         type: "fire",     cat: MOVE_CAT.SPECIAL,  power: 40, anim: 'projectile' },
    flamethrower:  { name: "Flamethrower",  type: "fire",     cat: MOVE_CAT.SPECIAL,  power: 90, anim: 'beam' },
    fireBlast:     { name: "Fire Blast",    type: "fire",     cat: MOVE_CAT.SPECIAL,  power: 110, anim: 'explosion' },
    fireSpin:      { name: "Fire Spin",     type: "fire",     cat: MOVE_CAT.SPECIAL,  power: 35 },
    firePunch:     { name: "Fire Punch",    type: "fire",     cat: MOVE_CAT.PHYSICAL, power: 75, anim: 'punch' },

    // === WATER ===
    octazooka:     { name: "Octazooka",     type: "water",    cat: MOVE_CAT.SPECIAL,  power: 65, anim: 'projectile' },
    waterGun:      { name: "Water Gun",     type: "water",    cat: MOVE_CAT.SPECIAL,  power: 40, anim: 'projectile' },
    surf:          { name: "Surf",          type: "water",    cat: MOVE_CAT.SPECIAL,  power: 90, aoe: true, anim: 'wave' },
    hydroPump:     { name: "Hydro Pump",    type: "water",    cat: MOVE_CAT.SPECIAL,  power: 110, anim: 'beam' },
    bubbleBeam:    { name: "Bubble Beam",   type: "water",    cat: MOVE_CAT.SPECIAL,  power: 65, anim: 'projectile' },
    waterfall:     { name: "Waterfall",     type: "water",    cat: MOVE_CAT.PHYSICAL, power: 80 },
    clamp:         { name: "Clamp",         type: "water",    cat: MOVE_CAT.PHYSICAL, power: 55 },
    crabhammer:    { name: "Crabhammer",    type: "water",    cat: MOVE_CAT.PHYSICAL, power: 100, effect: "highCrit" },

    // === ELECTRIC ===
    thunderShock:  { name: "Thunder Shock", type: "electric", cat: MOVE_CAT.SPECIAL,  power: 40, anim: 'projectile' },
    thunderbolt:   { name: "Thunderbolt",   type: "electric", cat: MOVE_CAT.SPECIAL,  power: 90, anim: 'beam' },
    thunder:       { name: "Thunder",       type: "electric", cat: MOVE_CAT.SPECIAL,  power: 110, anim: 'explosion' },
    thunderPunch:  { name: "Thunder Punch", type: "electric", cat: MOVE_CAT.PHYSICAL, power: 75, anim: 'punch' },
    spark:         { name: "Spark",         type: "electric", cat: MOVE_CAT.PHYSICAL, power: 65 },
    zapCannon:     { name: "Zap Cannon",    type: "electric", cat: MOVE_CAT.SPECIAL,  power: 120, anim: 'beam' },

    // === GRASS ===
    gigaDrain:     { name: "Giga Drain",    type: "grass",    cat: MOVE_CAT.SPECIAL,  power: 75, effect: "drain", anim: 'beam' },
    synthesis:     { name: "Synthesis",      type: "grass",    cat: MOVE_CAT.DEFENSE,  power: 0, effect: "heal" },
    vineWhip:      { name: "Vine Whip",     type: "grass",    cat: MOVE_CAT.PHYSICAL, power: 45 },
    razorLeaf:     { name: "Razor Leaf",    type: "grass",    cat: MOVE_CAT.PHYSICAL, power: 55, effect: "highCrit", anim: 'slash' },
    solarBeam:     { name: "Solar Beam",    type: "grass",    cat: MOVE_CAT.SPECIAL,  power: 120, anim: 'beam' },
    megaDrain:     { name: "Mega Drain",    type: "grass",    cat: MOVE_CAT.SPECIAL,  power: 40, effect: "drain", anim: 'drain' },
    absorb:        { name: "Absorb",        type: "grass",    cat: MOVE_CAT.SPECIAL,  power: 20, effect: "drain", anim: 'drain' },
    petalDance:    { name: "Petal Dance",   type: "grass",    cat: MOVE_CAT.SPECIAL,  power: 120, anim: 'wave' },
    sleepPowder:   { name: "Sleep Powder",  type: "grass",    cat: MOVE_CAT.STATUS,   power: 0, effect: "sleep" },
    stunSpore:     { name: "Stun Spore",    type: "grass",    cat: MOVE_CAT.STATUS,   power: 0, effect: "paralyze" },
    spore:         { name: "Spore",         type: "grass",    cat: MOVE_CAT.STATUS,   power: 0, effect: "sleep" },
    leechSeed:     { name: "Leech Seed",    type: "grass",    cat: MOVE_CAT.STATUS,   power: 0, effect: "leechSeed" },

    // === ICE ===
    powderSnow:    { name: "Powder Snow",   type: "ice",      cat: MOVE_CAT.SPECIAL,  power: 40, anim: 'projectile' },
    icyWind:       { name: "Icy Wind",      type: "ice",      cat: MOVE_CAT.SPECIAL,  power: 55, anim: 'wave' },
    iceBeam:       { name: "Ice Beam",      type: "ice",      cat: MOVE_CAT.SPECIAL,  power: 90, anim: 'beam' },
    blizzard:      { name: "Blizzard",      type: "ice",      cat: MOVE_CAT.SPECIAL,  power: 110, aoe: true, anim: 'wave' },
    icePunch:      { name: "Ice Punch",     type: "ice",      cat: MOVE_CAT.PHYSICAL, power: 75, anim: 'punch' },
    auroraBeam:    { name: "Aurora Beam",   type: "ice",      cat: MOVE_CAT.SPECIAL,  power: 65, anim: 'beam' },

    // === FIGHTING ===
    karateChop:    { name: "Karate Chop",   type: "fighting", cat: MOVE_CAT.PHYSICAL, power: 50, effect: "highCrit", anim: 'punch' },
    lowKick:       { name: "Low Kick",      type: "fighting", cat: MOVE_CAT.PHYSICAL, power: 60 },
    highJumpKick:  { name: "High Jump Kick",type: "fighting", cat: MOVE_CAT.PHYSICAL, power: 130, anim: 'punch' },
    submission:    { name: "Submission",     type: "fighting", cat: MOVE_CAT.PHYSICAL, power: 80, effect: "recoil" },
    seismicToss:   { name: "Seismic Toss",  type: "fighting", cat: MOVE_CAT.PHYSICAL, power: 75 },
    crossChop:     { name: "Cross Chop",    type: "fighting", cat: MOVE_CAT.PHYSICAL, power: 100, effect: "highCrit" },
    closeCombat:   { name: "Close Combat",  type: "fighting", cat: MOVE_CAT.PHYSICAL, power: 120, anim: 'punch' },
    machPunch:     { name: "Mach Punch",   type: "fighting", cat: MOVE_CAT.PHYSICAL, power: 40, effect: "priority", anim: 'punch' },
    tripleKick:    { name: "Triple Kick",  type: "fighting", cat: MOVE_CAT.PHYSICAL, power: 60, anim: 'punch' },

    // === POISON ===
    poisonSting:   { name: "Poison Sting",  type: "poison",   cat: MOVE_CAT.PHYSICAL, power: 35, anim: 'projectile' },
    sludgeBomb:    { name: "Sludge Bomb",   type: "poison",   cat: MOVE_CAT.SPECIAL,  power: 90, anim: 'projectile' },
    sludge:        { name: "Sludge",        type: "poison",   cat: MOVE_CAT.SPECIAL,  power: 65, anim: 'projectile' },
    acid:          { name: "Acid",          type: "poison",   cat: MOVE_CAT.SPECIAL,  power: 40, anim: 'projectile' },
    toxic:         { name: "Toxic",         type: "poison",   cat: MOVE_CAT.STATUS,   power: 0, effect: "toxic" },
    poisonPowder:  { name: "Poison Powder", type: "poison",   cat: MOVE_CAT.STATUS,   power: 0, effect: "poison" },
    smog:          { name: "Smog",          type: "poison",   cat: MOVE_CAT.SPECIAL,  power: 30, anim: 'explosion' },

    // === GROUND ===
    mudSlap:       { name: "Mud-Slap",      type: "ground",   cat: MOVE_CAT.SPECIAL,  power: 20, anim: 'projectile' },
    earthquake:    { name: "Earthquake",    type: "ground",   cat: MOVE_CAT.PHYSICAL, power: 100, aoe: true, anim: 'wave' },
    dig:           { name: "Dig",           type: "ground",   cat: MOVE_CAT.PHYSICAL, power: 80 },
    mudSlap:       { name: "Mud-Slap",      type: "ground",   cat: MOVE_CAT.SPECIAL,  power: 40, anim: 'projectile' },
    boneClub:      { name: "Bone Club",     type: "ground",   cat: MOVE_CAT.PHYSICAL, power: 65 },
    bonemerang:    { name: "Bonemerang",     type: "ground",   cat: MOVE_CAT.PHYSICAL, power: 100 },
    fissure:       { name: "Fissure",       type: "ground",   cat: MOVE_CAT.PHYSICAL, power: 150, effect: "ohko" },
    sandAttack:    { name: "Sand Attack",   type: "ground",   cat: MOVE_CAT.STATUS,   power: 0, effect: "accDown" },

    // === FLYING ===
    aeroblast:     { name: "Aeroblast",     type: "flying",   cat: MOVE_CAT.SPECIAL,  power: 100, effect: "highCrit", anim: 'beam' },
    gust:          { name: "Gust",          type: "flying",   cat: MOVE_CAT.SPECIAL,  power: 40 },
    wingAttack:    { name: "Wing Attack",   type: "flying",   cat: MOVE_CAT.PHYSICAL, power: 60 },
    drillPeck:     { name: "Drill Peck",    type: "flying",   cat: MOVE_CAT.PHYSICAL, power: 80, anim: 'fly' },
    skyAttack:     { name: "Sky Attack",    type: "flying",   cat: MOVE_CAT.PHYSICAL, power: 140, anim: 'fly' },
    aerialAce:     { name: "Aerial Ace",    type: "flying",   cat: MOVE_CAT.PHYSICAL, power: 60, anim: 'fly' },
    fly:           { name: "Fly",           type: "flying",   cat: MOVE_CAT.PHYSICAL, power: 90, anim: 'fly' },
    mirrorMove:    { name: "Mirror Move",   type: "flying",   cat: MOVE_CAT.STATUS,   power: 0 },
    peck:          { name: "Peck",          type: "flying",   cat: MOVE_CAT.PHYSICAL, power: 35 },

    // === PSYCHIC ===
    futureSight:   { name: "Future Sight",  type: "psychic",  cat: MOVE_CAT.SPECIAL,  power: 120, anim: 'beam' },
    confusion:     { name: "Confusion",     type: "psychic",  cat: MOVE_CAT.SPECIAL,  power: 50, anim: 'projectile' },
    psychic:       { name: "Psychic",       type: "psychic",  cat: MOVE_CAT.SPECIAL,  power: 90, anim: 'explosion' },
    psybeam:       { name: "Psybeam",       type: "psychic",  cat: MOVE_CAT.SPECIAL,  power: 65, anim: 'beam' },
    dreamEater:    { name: "Dream Eater",   type: "psychic",  cat: MOVE_CAT.SPECIAL,  power: 100, effect: "drain", anim: 'drain' },
    hypnosis:      { name: "Hypnosis",      type: "psychic",  cat: MOVE_CAT.STATUS,   power: 0, effect: "sleep" },

    // === BUG ===
    megahorn:      { name: "Megahorn",      type: "bug",      cat: MOVE_CAT.PHYSICAL, power: 120 },
    bugBite:       { name: "Bug Bite",      type: "bug",      cat: MOVE_CAT.PHYSICAL, power: 60 },
    pinMissile:    { name: "Pin Missile",   type: "bug",      cat: MOVE_CAT.PHYSICAL, power: 62 },
    twineedle:     { name: "Twineedle",     type: "bug",      cat: MOVE_CAT.PHYSICAL, power: 75 },
    signalBeam:    { name: "Signal Beam",   type: "bug",      cat: MOVE_CAT.SPECIAL,  power: 75, anim: 'beam' },
    stringShot:    { name: "String Shot",   type: "bug",      cat: MOVE_CAT.STATUS,   power: 0, effect: "speedDown" },
    leechLife:     { name: "Leech Life",    type: "bug",      cat: MOVE_CAT.PHYSICAL, power: 80, effect: "drain", anim: 'drain' },
    xScissor:      { name: "X-Scissor",     type: "bug",      cat: MOVE_CAT.PHYSICAL, power: 80, anim: 'slash' },
    furySwipes:    { name: "Fury Cutter",   type: "bug",      cat: MOVE_CAT.PHYSICAL, power: 55, anim: 'slash' },

    // === ROCK ===
    rollout:       { name: "Rollout",       type: "rock",     cat: MOVE_CAT.PHYSICAL, power: 30 },
    rockSlide:     { name: "Rock Slide",    type: "rock",     cat: MOVE_CAT.PHYSICAL, power: 75, anim: 'projectile' },
    rockThrow:     { name: "Rock Throw",    type: "rock",     cat: MOVE_CAT.PHYSICAL, power: 50, anim: 'projectile' },
    ancientPower:  { name: "Ancient Power", type: "rock",     cat: MOVE_CAT.SPECIAL,  power: 60, effect: "allBoost", anim: 'projectile' },

    // === GHOST ===
    shadowPunch:   { name: "Shadow Punch",  type: "ghost",    cat: MOVE_CAT.PHYSICAL, power: 60, anim: 'punch' },
    shadowBall:    { name: "Shadow Ball",   type: "ghost",    cat: MOVE_CAT.SPECIAL,  power: 80, anim: 'projectile' },
    nightShade:    { name: "Night Shade",   type: "ghost",    cat: MOVE_CAT.SPECIAL,  power: 65, anim: 'projectile' },
    confuseRay:    { name: "Confuse Ray",   type: "ghost",    cat: MOVE_CAT.STATUS,   power: 0, effect: "confuse" },

    // === DRAGON ===
    dragonRage:    { name: "Dragon Rage",   type: "dragon",   cat: MOVE_CAT.SPECIAL,  power: 60, anim: 'projectile' },
    dragonClaw:    { name: "Dragon Claw",   type: "dragon",   cat: MOVE_CAT.PHYSICAL, power: 80, anim: 'slash' },
    outrage:       { name: "Outrage",       type: "dragon",   cat: MOVE_CAT.PHYSICAL, power: 120 },
    dragonBreath:  { name: "Dragon Breath", type: "dragon",   cat: MOVE_CAT.SPECIAL,  power: 60, anim: 'beam' },

    // === DARK ===
    crunch:        { name: "Crunch",        type: "dark",     cat: MOVE_CAT.PHYSICAL, power: 80 },
    bite:          { name: "Bite",          type: "dark",     cat: MOVE_CAT.PHYSICAL, power: 60 },
    pursuit:       { name: "Pursuit",       type: "dark",     cat: MOVE_CAT.PHYSICAL, power: 40 },
    faintAttack:   { name: "Faint Attack",  type: "dark",     cat: MOVE_CAT.PHYSICAL, power: 60 },
    darkPulse:     { name: "Dark Pulse",    type: "dark",     cat: MOVE_CAT.SPECIAL,  power: 80, anim: 'beam' },

    // === STEEL ===
    ironTail:      { name: "Iron Tail",     type: "steel",    cat: MOVE_CAT.PHYSICAL, power: 100, anim: 'slash' },
    flashCannon:   { name: "Flash Cannon",  type: "steel",    cat: MOVE_CAT.SPECIAL,  power: 80, anim: 'beam' },
    metalClaw:     { name: "Metal Claw",    type: "steel",    cat: MOVE_CAT.PHYSICAL, power: 50 },
    steelWing:     { name: "Steel Wing",    type: "steel",    cat: MOVE_CAT.PHYSICAL, power: 70 },

    // === FAIRY ===
    moonblast:     { name: "Moonblast",     type: "fairy",    cat: MOVE_CAT.SPECIAL,  power: 95, anim: 'projectile' },
    playRough:     { name: "Play Rough",    type: "fairy",    cat: MOVE_CAT.PHYSICAL, power: 90 },
    dazzleGleam:   { name: "Dazzling Gleam",type: "fairy",    cat: MOVE_CAT.SPECIAL,  power: 80, anim: 'explosion' },
    disarmVoice:   { name: "Disarming Voice",type: "fairy",   cat: MOVE_CAT.SPECIAL,  power: 60, anim: 'wave' },

    // === DEFENSE MOVES ===
    withdraw:      { name: "Withdraw",      type: "water",    cat: MOVE_CAT.DEFENSE,  power: 0, effect: "defUp" },
    harden:        { name: "Harden",        type: "normal",   cat: MOVE_CAT.DEFENSE,  power: 0, effect: "defUp" },
    protect:       { name: "Protect",       type: "normal",   cat: MOVE_CAT.DEFENSE,  power: 0, effect: "shield" },
    lightScreen:   { name: "Light Screen",  type: "psychic",  cat: MOVE_CAT.DEFENSE,  power: 0, effect: "spDefUp" },
    reflect:       { name: "Reflect",       type: "psychic",  cat: MOVE_CAT.DEFENSE,  power: 0, effect: "defUp" },
    barrier:       { name: "Barrier",       type: "psychic",  cat: MOVE_CAT.DEFENSE,  power: 0, effect: "defUp2" },
    acidArmor:     { name: "Acid Armor",    type: "poison",   cat: MOVE_CAT.DEFENSE,  power: 0, effect: "defUp2" },
    rest:          { name: "Rest",          type: "psychic",  cat: MOVE_CAT.DEFENSE,  power: 0, effect: "heal" },
    recover:       { name: "Recover",       type: "normal",   cat: MOVE_CAT.DEFENSE,  power: 0, effect: "heal" },
    softboiled:    { name: "Softboiled",    type: "normal",   cat: MOVE_CAT.DEFENSE,  power: 0, effect: "heal" },
    substitute:    { name: "Substitute",    type: "normal",   cat: MOVE_CAT.DEFENSE,  power: 0, effect: "shield" },
    minimize:      { name: "Minimize",      type: "normal",   cat: MOVE_CAT.DEFENSE,  power: 0, effect: "evasionUp" },
    ironDefense:   { name: "Iron Defense",  type: "steel",    cat: MOVE_CAT.DEFENSE,  power: 0, effect: "defUp2" },
    amnesia:       { name: "Amnesia",       type: "psychic",  cat: MOVE_CAT.DEFENSE,  power: 0, effect: "spDefUp2" },

    // === ENHANCE MOVES ===
    swordsDance:   { name: "Swords Dance",  type: "normal",   cat: MOVE_CAT.ENHANCE,  power: 0, effect: "atkUp2" },
    dragonDance:   { name: "Dragon Dance",  type: "dragon",   cat: MOVE_CAT.ENHANCE,  power: 0, effect: "atkSpdUp" },
    agility:       { name: "Agility",       type: "psychic",  cat: MOVE_CAT.ENHANCE,  power: 0, effect: "spdUp2" },
    nastyPlot:     { name: "Nasty Plot",    type: "dark",     cat: MOVE_CAT.ENHANCE,  power: 0, effect: "spAtkUp2" },
    growl:         { name: "Growl",         type: "normal",   cat: MOVE_CAT.ENHANCE,  power: 0, effect: "atkDown" },
    tailWhip:      { name: "Tail Whip",     type: "normal",   cat: MOVE_CAT.ENHANCE,  power: 0, effect: "defDown" },
    leer:          { name: "Leer",          type: "normal",   cat: MOVE_CAT.ENHANCE,  power: 0, effect: "defDown" },
    growth:        { name: "Growth",        type: "normal",   cat: MOVE_CAT.ENHANCE,  power: 0, effect: "atkSpAtkUp" },
    bulkUp:        { name: "Bulk Up",       type: "fighting",  cat: MOVE_CAT.ENHANCE,  power: 0, effect: "atkDefUp" },
    calmMind:      { name: "Calm Mind",     type: "psychic",  cat: MOVE_CAT.ENHANCE,  power: 0, effect: "spAtkSpDefUp" },
    focusEnergy:   { name: "Focus Energy",  type: "normal",   cat: MOVE_CAT.ENHANCE,  power: 0, effect: "critUp" },
    meditate:      { name: "Meditate",      type: "psychic",  cat: MOVE_CAT.ENHANCE,  power: 0, effect: "atkUp" },
    sharpen:       { name: "Sharpen",       type: "normal",   cat: MOVE_CAT.ENHANCE,  power: 0, effect: "atkUp" },
    screech:       { name: "Screech",       type: "normal",   cat: MOVE_CAT.ENHANCE,  power: 0, effect: "defDown2" },
    conversion:    { name: "Conversion",    type: "normal",   cat: MOVE_CAT.ENHANCE,  power: 0, effect: "atkSpAtkUp" },
    tailGlow:      { name: "Tail Glow",     type: "bug",      cat: MOVE_CAT.ENHANCE,  power: 0, effect: "spAtkUp2" },
};

// Movesets for all 151 Gen 1 Pokemon
// Each Pokemon gets 4 moves: mix of attacking, defensive, and enhancement
export const POKEMON_MOVESETS = {
    1:   ["vineWhip", "sludge", "leechSeed", "growth"],                  // Bulbasaur
    2:   ["razorLeaf", "sludgeBomb", "sleepPowder", "growth"],           // Ivysaur
    3:   ["solarBeam", "sludgeBomb", "sleepPowder", "growth"],           // Venusaur
    4:   ["ember", "slash", "smokescreen", "swordsDance"],               // Charmander - smokescreen mapped below
    5:   ["flamethrower", "slash", "fireSpin", "swordsDance"],           // Charmeleon
    6:   ["flamethrower", "fly", "fireBlast", "dragonDance"],            // Charizard
    7:   ["waterGun", "tackle", "withdraw", "tailWhip"],                 // Squirtle
    8:   ["waterGun", "bubbleBeam", "withdraw", "protect"],              // Wartortle
    9:   ["hydroPump", "iceBeam", "withdraw", "protect"],                // Blastoise
    10:  ["bugBite", "tackle", "stringShot", "harden"],                  // Caterpie
    11:  ["bugBite", "tackle", "harden", "harden"],                      // Metapod
    12:  ["signalBeam", "psychic", "sleepPowder", "agility"],            // Butterfree
    13:  ["poisonSting", "bugBite", "stringShot", "focusEnergy"],        // Weedle
    14:  ["poisonSting", "bugBite", "harden", "harden"],                 // Kakuna
    15:  ["twineedle", "poisonSting", "focusEnergy", "swordsDance"],     // Beedrill
    16:  ["gust", "quickAttack", "sandAttack", "agility"],               // Pidgey
    17:  ["wingAttack", "quickAttack", "sandAttack", "agility"],         // Pidgeotto
    18:  ["fly", "quickAttack", "mirrorMove", "agility"],                // Pidgeot
    19:  ["hyperFang", "quickAttack", "tailWhip", "focusEnergy"],        // Rattata
    20:  ["hyperFang", "bodySlam", "tailWhip", "swordsDance"],           // Raticate
    21:  ["drillPeck", "furyAttack", "leer", "agility"],                 // Spearow
    22:  ["drillPeck", "fly", "leer", "agility"],                        // Fearow
    23:  ["acid", "poisonSting", "leer", "growl"],                       // Ekans
    24:  ["sludgeBomb", "earthquake", "leer", "growl"],                  // Arbok
    25:  ["thunderbolt", "quickAttack", "agility", "tailWhip"],          // Pikachu
    26:  ["thunder", "thunderbolt", "agility", "focusEnergy"],           // Raichu
    27:  ["earthquake", "slash", "sandAttack", "swordsDance"],           // Sandshrew
    28:  ["earthquake", "slash", "sandAttack", "swordsDance"],           // Sandslash
    29:  ["poisonSting", "bodySlam", "tailWhip", "growl"],               // Nidoran F
    30:  ["sludge", "bodySlam", "tailWhip", "growl"],                    // Nidorina
    31:  ["earthquake", "sludgeBomb", "bodySlam", "protect"],            // Nidoqueen
    32:  ["poisonSting", "bodySlam", "leer", "focusEnergy"],             // Nidoran M
    33:  ["sludge", "bodySlam", "leer", "focusEnergy"],                  // Nidorino
    34:  ["earthquake", "sludgeBomb", "megaKick", "swordsDance"],        // Nidoking
    35:  ["moonblast", "bodySlam", "lightScreen", "minimize"],           // Clefairy
    36:  ["moonblast", "flamethrower", "lightScreen", "calmMind"],       // Clefable
    37:  ["flamethrower", "quickAttack", "fireSpin", "confuseRay"],      // Vulpix
    38:  ["fireBlast", "flamethrower", "confuseRay", "nastyPlot"],       // Ninetales
    39:  ["bodySlam", "disarmVoice", "rest", "growl"],                   // Jigglypuff
    40:  ["bodySlam", "dazzleGleam", "rest", "growl"],                   // Wigglytuff
    41:  ["wingAttack", "acid", "confuseRay", "agility"],                // Zubat
    42:  ["fly", "sludgeBomb", "confuseRay", "agility"],                 // Golbat
    43:  ["megaDrain", "acid", "sleepPowder", "growth"],                 // Oddish
    44:  ["megaDrain", "sludge", "sleepPowder", "growth"],               // Gloom
    45:  ["petalDance", "sludgeBomb", "sleepPowder", "growth"],          // Vileplume
    46:  ["leechLife", "slash", "spore", "growth"],                      // Paras
    47:  ["xScissor", "slash", "spore", "swordsDance"],                  // Parasect
    48:  ["signalBeam", "psybeam", "sleepPowder", "agility"],            // Venonat
    49:  ["signalBeam", "psychic", "sleepPowder", "agility"],            // Venomoth
    50:  ["earthquake", "slash", "sandAttack", "agility"],               // Diglett
    51:  ["earthquake", "slash", "sandAttack", "swordsDance"],           // Dugtrio
    52:  ["slash", "bodySlam", "screech", "agility"],                    // Meowth
    53:  ["slash", "thunderbolt", "screech", "nastyPlot"],               // Persian
    54:  ["surf", "confusion", "amnesia", "calmMind"],                   // Psyduck
    55:  ["hydroPump", "psychic", "amnesia", "calmMind"],                // Golduck
    56:  ["closeCombat", "karateChop", "leer", "focusEnergy"],           // Mankey
    57:  ["closeCombat", "earthquake", "leer", "bulkUp"],                // Primeape
    58:  ["flamethrower", "bodySlam", "leer", "agility"],                // Growlithe
    59:  ["fireBlast", "bodySlam", "flamethrower", "agility"],           // Arcanine
    60:  ["waterGun", "bodySlam", "hypnosis", "agility"],                // Poliwag
    61:  ["surf", "bodySlam", "hypnosis", "agility"],                    // Poliwhirl
    62:  ["hydroPump", "closeCombat", "hypnosis", "bulkUp"],             // Poliwrath
    63:  ["psychic", "confusion", "reflect", "calmMind"],                // Abra
    64:  ["psychic", "shadowBall", "reflect", "calmMind"],               // Kadabra
    65:  ["psychic", "shadowBall", "reflect", "calmMind"],               // Alakazam
    66:  ["karateChop", "lowKick", "leer", "focusEnergy"],               // Machop
    67:  ["submission", "karateChop", "leer", "bulkUp"],                 // Machoke
    68:  ["closeCombat", "earthquake", "bulkUp", "focusEnergy"],         // Machamp
    69:  ["vineWhip", "acid", "sleepPowder", "growth"],                  // Bellsprout
    70:  ["razorLeaf", "sludge", "sleepPowder", "swordsDance"],          // Weepinbell
    71:  ["solarBeam", "sludgeBomb", "sleepPowder", "swordsDance"],      // Victreebel
    72:  ["bubbleBeam", "acid", "barrier", "agility"],                   // Tentacool
    73:  ["hydroPump", "sludgeBomb", "barrier", "agility"],              // Tentacruel
    74:  ["rockThrow", "earthquake", "harden", "growl"],                 // Geodude
    75:  ["rockSlide", "earthquake", "harden", "growl"],                 // Graveler
    76:  ["earthquake", "rockSlide", "explosion", "protect"],            // Golem
    77:  ["flamethrower", "bodySlam", "agility", "growl"],               // Ponyta
    78:  ["fireBlast", "bodySlam", "agility", "swordsDance"],            // Rapidash
    79:  ["surf", "psychic", "amnesia", "growl"],                        // Slowpoke
    80:  ["surf", "psychic", "amnesia", "calmMind"],                     // Slowbro
    81:  ["thunderbolt", "flashCannon", "lightScreen", "agility"],       // Magnemite
    82:  ["thunder", "flashCannon", "lightScreen", "agility"],           // Magneton
    83:  ["slash", "fly", "swordsDance", "agility"],                     // Farfetch'd
    84:  ["drillPeck", "bodySlam", "agility", "swordsDance"],            // Doduo
    85:  ["drillPeck", "bodySlam", "agility", "swordsDance"],            // Dodrio
    86:  ["surf", "auroraBeam", "rest", "growl"],                        // Seel
    87:  ["surf", "iceBeam", "rest", "agility"],                         // Dewgong
    88:  ["sludgeBomb", "bodySlam", "acidArmor", "screech"],             // Grimer
    89:  ["sludgeBomb", "fireBlast", "acidArmor", "screech"],            // Muk
    90:  ["iceBeam", "clamp", "withdraw", "protect"],                    // Shellder
    91:  ["iceBeam", "hydroPump", "ironDefense", "explosion"],           // Cloyster
    92:  ["shadowBall", "sludge", "confuseRay", "hypnosis"],             // Gastly
    93:  ["shadowBall", "sludgeBomb", "confuseRay", "hypnosis"],         // Haunter
    94:  ["shadowBall", "sludgeBomb", "confuseRay", "nastyPlot"],        // Gengar
    95:  ["rockSlide", "earthquake", "ironDefense", "screech"],          // Onix
    96:  ["psychic", "headbutt", "hypnosis", "calmMind"],                // Drowzee
    97:  ["psychic", "shadowBall", "hypnosis", "calmMind"],              // Hypno
    98:  ["crabhammer", "slam", "leer", "swordsDance"],                  // Krabby
    99:  ["crabhammer", "slam", "leer", "swordsDance"],                  // Kingler
    100: ["thunderbolt", "selfDestruct", "lightScreen", "agility"],      // Voltorb
    101: ["thunder", "explosion", "lightScreen", "agility"],             // Electrode
    102: ["psychic", "solarBeam", "sleepPowder", "reflect"],             // Exeggcute
    103: ["psychic", "solarBeam", "sleepPowder", "reflect"],             // Exeggutor
    104: ["bonemerang", "headbutt", "leer", "focusEnergy"],              // Cubone
    105: ["bonemerang", "bodySlam", "swordsDance", "focusEnergy"],       // Marowak
    106: ["highJumpKick", "megaKick", "focusEnergy", "bulkUp"],          // Hitmonlee
    107: ["closeCombat", "icePunch", "focusEnergy", "bulkUp"],           // Hitmonchan
    108: ["bodySlam", "surf", "swordsDance", "screech"],                 // Lickitung
    109: ["sludgeBomb", "flamethrower", "smokescreen", "harden"],        // Koffing - smokescreen mapped
    110: ["sludgeBomb", "fireBlast", "explosion", "harden"],             // Weezing
    111: ["earthquake", "rockSlide", "leer", "protect"],                 // Rhyhorn
    112: ["earthquake", "rockSlide", "megaKick", "swordsDance"],         // Rhydon
    113: ["bodySlam", "iceBeam", "softboiled", "lightScreen"],           // Chansey
    114: ["solarBeam", "bodySlam", "sleepPowder", "growth"],             // Tangela
    115: ["bodySlam", "earthquake", "rest", "swordsDance"],              // Kangaskhan
    116: ["surf", "iceBeam", "agility", "smokescreen"],                  // Horsea - smokescreen mapped
    117: ["hydroPump", "iceBeam", "agility", "focusEnergy"],             // Seadra
    118: ["waterfall", "megaKick", "agility", "swordsDance"],            // Goldeen
    119: ["waterfall", "megaKick", "agility", "swordsDance"],            // Seaking
    120: ["surf", "psychic", "lightScreen", "agility"],                  // Staryu
    121: ["hydroPump", "psychic", "lightScreen", "calmMind"],            // Starmie
    122: ["psychic", "dazzleGleam", "lightScreen", "calmMind"],          // Mr. Mime
    123: ["xScissor", "wingAttack", "swordsDance", "agility"],           // Scyther
    124: ["iceBeam", "psychic", "nastyPlot", "lightScreen"],             // Jynx
    125: ["thunderbolt", "thunderPunch", "lightScreen", "agility"],      // Electabuzz
    126: ["flamethrower", "firePunch", "lightScreen", "focusEnergy"],    // Magmar
    127: ["xScissor", "closeCombat", "swordsDance", "focusEnergy"],      // Pinsir
    128: ["bodySlam", "earthquake", "leer", "swordsDance"],              // Tauros
    129: ["tackle", "waterGun", "harden", "agility"],                    // Magikarp
    130: ["hydroPump", "bodySlam", "iceBeam", "dragonDance"],            // Gyarados
    131: ["surf", "iceBeam", "bodySlam", "rest"],                        // Lapras
    132: ["bodySlam", "psychic", "swordsDance", "harden"],               // Ditto
    133: ["bodySlam", "quickAttack", "tailWhip", "agility"],             // Eevee
    134: ["hydroPump", "iceBeam", "acidArmor", "calmMind"],              // Vaporeon
    135: ["thunder", "thunderbolt", "agility", "focusEnergy"],           // Jolteon
    136: ["fireBlast", "bodySlam", "swordsDance", "agility"],            // Flareon
    137: ["triAttack", "psychic", "conversion", "agility"],              // Porygon
    138: ["surf", "ancientPower", "withdraw", "protect"],                // Omanyte
    139: ["hydroPump", "ancientPower", "withdraw", "protect"],           // Omastar
    140: ["rockSlide", "surf", "harden", "swordsDance"],                 // Kabuto
    141: ["rockSlide", "surf", "swordsDance", "agility"],                // Kabutops
    142: ["fly", "rockSlide", "agility", "swordsDance"],                 // Aerodactyl
    143: ["bodySlam", "earthquake", "rest", "amnesia"],                  // Snorlax
    144: ["iceBeam", "fly", "lightScreen", "agility"],                   // Articuno
    145: ["thunder", "drillPeck", "lightScreen", "agility"],             // Zapdos
    146: ["fireBlast", "fly", "agility", "swordsDance"],                 // Moltres
    147: ["dragonBreath", "bodySlam", "agility", "leer"],                // Dratini
    148: ["dragonBreath", "bodySlam", "agility", "dragonDance"],         // Dragonair
    149: ["outrage", "fly", "fireBlast", "dragonDance"],                 // Dragonite
    150: ["psychic", "iceBeam", "shadowBall", "calmMind"],               // Mewtwo
    151: ["psychic", "flamethrower", "iceBeam", "swordsDance"],          // Mew
    // Gen 2 Pokemon (152-251)
    152: ["razorLeaf", "bodySlam", "synthesis", "reflect"],             // Chikorita
    153: ["razorLeaf", "bodySlam", "synthesis", "lightScreen"],         // Bayleef
    154: ["solarBeam", "earthquake", "synthesis", "lightScreen"],       // Meganium
    155: ["ember", "quickAttack", "smokescreen", "swordsDance"],        // Cyndaquil
    156: ["flamethrower", "quickAttack", "smokescreen", "swordsDance"], // Quilava
    157: ["fireBlast", "flamethrower", "thunderPunch", "swordsDance"],  // Typhlosion
    158: ["waterGun", "bite", "slash", "swordsDance"],                  // Totodile
    159: ["surf", "bite", "slash", "swordsDance"],                      // Croconaw
    160: ["hydroPump", "crunch", "earthquake", "dragonDance"],          // Feraligatr
    161: ["quickAttack", "slash", "focusEnergy", "agility"],            // Sentret
    162: ["return", "slash", "swordsDance", "agility"],                 // Furret
    163: ["confusion", "gust", "hypnosis", "reflect"],                  // Hoothoot
    164: ["psychic", "fly", "hypnosis", "calmMind"],                    // Noctowl
    165: ["bugBite", "machPunch", "lightScreen", "agility"],            // Ledyba
    166: ["bugBite", "machPunch", "lightScreen", "agility"],            // Ledian
    167: ["poisonSting", "bugBite", "stringShot", "agility"],           // Spinarak
    168: ["xScissor", "sludgeBomb", "agility", "swordsDance"],          // Ariados
    169: ["fly", "sludgeBomb", "confuseRay", "agility"],                // Crobat
    170: ["spark", "bubbleBeam", "confuseRay", "agility"],              // Chinchou
    171: ["thunderbolt", "surf", "confuseRay", "agility"],              // Lanturn
    172: ["thunderShock", "quickAttack", "tailWhip", "agility"],        // Pichu
    173: ["pound", "disarmVoice", "growl", "lightScreen"],              // Cleffa
    174: ["pound", "disarmVoice", "rest", "growl"],                     // Igglybuff
    175: ["disarmVoice", "headbutt", "lightScreen", "growl"],           // Togepi
    176: ["dazzleGleam", "fly", "lightScreen", "calmMind"],             // Togetic
    177: ["psychic", "wingAttack", "lightScreen", "calmMind"],          // Natu
    178: ["psychic", "fly", "lightScreen", "calmMind"],                 // Xatu
    179: ["thunderShock", "tackle", "lightScreen", "agility"],          // Mareep
    180: ["thunderbolt", "bodySlam", "lightScreen", "agility"],         // Flaaffy
    181: ["thunder", "thunderbolt", "lightScreen", "calmMind"],         // Ampharos
    182: ["solarBeam", "sludgeBomb", "sleepPowder", "growth"],          // Bellossom
    183: ["waterGun", "playRough", "rollout", "agility"],               // Marill
    184: ["surf", "playRough", "bodySlam", "bulkUp"],                   // Azumarill
    185: ["rockSlide", "earthquake", "bodySlam", "focusEnergy"],        // Sudowoodo
    186: ["hydroPump", "iceBeam", "hypnosis", "calmMind"],              // Politoed
    187: ["megaDrain", "bodySlam", "sleepPowder", "growth"],            // Hoppip
    188: ["razorLeaf", "bodySlam", "sleepPowder", "agility"],           // Skiploom
    189: ["gigaDrain", "fly", "sleepPowder", "agility"],                // Jumpluff
    190: ["return", "quickAttack", "agility", "swordsDance"],           // Aipom
    191: ["megaDrain", "bodySlam", "growth", "sleepPowder"],            // Sunkern
    192: ["solarBeam", "sludgeBomb", "growth", "synthesis"],            // Sunflora
    193: ["signalBeam", "quickAttack", "agility", "focusEnergy"],       // Yanma
    194: ["waterGun", "mudSlap", "slam", "amnesia"],                    // Wooper
    195: ["earthquake", "surf", "iceBeam", "amnesia"],                  // Quagsire
    196: ["psychic", "shadowBall", "calmMind", "lightScreen"],          // Espeon
    197: ["darkPulse", "bodySlam", "confuseRay", "protect"],            // Umbreon
    198: ["drillPeck", "faintAttack", "confuseRay", "agility"],         // Murkrow
    199: ["psychic", "surf", "iceBeam", "calmMind"],                    // Slowking
    200: ["shadowBall", "darkPulse", "confuseRay", "nastyPlot"],        // Misdreavus
    201: ["psychic", "confusion", "lightScreen", "agility"],            // Unown
    202: ["bodySlam", "psychic", "amnesia", "rest"],                    // Wobbuffet
    203: ["psychic", "crunch", "bodySlam", "agility"],                  // Girafarig
    204: ["bugBite", "rockSlide", "selfDestruct", "harden"],            // Pineco
    205: ["xScissor", "flashCannon", "explosion", "ironDefense"],       // Forretress
    206: ["bodySlam", "rockSlide", "headbutt", "agility"],              // Dunsparce
    207: ["earthquake", "fly", "slash", "swordsDance"],                 // Gligar
    208: ["earthquake", "ironTail", "rockSlide", "ironDefense"],        // Steelix
    209: ["playRough", "bite", "leer", "bulkUp"],                       // Snubbull
    210: ["playRough", "crunch", "closeCombat", "bulkUp"],              // Granbull
    211: ["surf", "sludgeBomb", "poisonSting", "swordsDance"],          // Qwilfish
    212: ["xScissor", "flashCannon", "swordsDance", "agility"],         // Scizor
    213: ["rockSlide", "bugBite", "ironDefense", "rest"],               // Shuckle
    214: ["megahorn", "closeCombat", "rockSlide", "swordsDance"],       // Heracross
    215: ["icePunch", "faintAttack", "swordsDance", "agility"],         // Sneasel
    216: ["slash", "bodySlam", "leer", "swordsDance"],                  // Teddiursa
    217: ["bodySlam", "earthquake", "closeCombat", "swordsDance"],      // Ursaring
    218: ["ember", "rockThrow", "harden", "amnesia"],                   // Slugma
    219: ["flamethrower", "rockSlide", "harden", "amnesia"],            // Magcargo
    220: ["powderSnow", "mudSlap", "tackle", "harden"],                 // Swinub
    221: ["earthquake", "iceBeam", "bodySlam", "amnesia"],              // Piloswine
    222: ["surf", "rockSlide", "lightScreen", "rest"],                  // Corsola
    223: ["waterGun", "iceBeam", "agility", "focusEnergy"],             // Remoraid
    224: ["octazooka", "iceBeam", "fireBlast", "focusEnergy"],          // Octillery
    225: ["icyWind", "fly", "quickAttack", "agility"],                  // Delibird
    226: ["surf", "iceBeam", "fly", "agility"],                         // Mantine
    227: ["steelWing", "drillPeck", "swordsDance", "agility"],          // Skarmory
    228: ["ember", "bite", "leer", "agility"],                          // Houndour
    229: ["fireBlast", "crunch", "darkPulse", "nastyPlot"],             // Houndoom
    230: ["hydroPump", "dragonBreath", "iceBeam", "dragonDance"],       // Kingdra
    231: ["earthquake", "rollout", "bodySlam", "harden"],               // Phanpy
    232: ["earthquake", "rockSlide", "bodySlam", "ironDefense"],        // Donphan
    233: ["triAttack", "iceBeam", "thunderbolt", "calmMind"],           // Porygon2
    234: ["bodySlam", "psychic", "confuseRay", "calmMind"],             // Stantler
    235: ["bodySlam", "quickAttack", "agility", "swordsDance"],         // Smeargle
    236: ["machPunch", "tackle", "focusEnergy", "bulkUp"],              // Tyrogue
    237: ["tripleKick", "closeCombat", "rapidSpin", "bulkUp"],          // Hitmontop
    238: ["icyWind", "confusion", "lightScreen", "calmMind"],           // Smoochum
    239: ["thunderPunch", "quickAttack", "lightScreen", "agility"],     // Elekid
    240: ["firePunch", "bodySlam", "smokescreen", "focusEnergy"],       // Magby
    241: ["bodySlam", "earthquake", "rollout", "rest"],                  // Miltank
    242: ["bodySlam", "iceBeam", "softboiled", "lightScreen"],          // Blissey
    243: ["thunder", "thunderbolt", "extremeSpeed", "calmMind"],        // Raikou
    244: ["sacredFire", "flamethrower", "extremeSpeed", "calmMind"],    // Entei
    245: ["hydroPump", "iceBeam", "calmMind", "rest"],                  // Suicune
    246: ["rockThrow", "bite", "leer", "focusEnergy"],                  // Larvitar
    247: ["rockSlide", "crunch", "earthquake", "harden"],               // Pupitar
    248: ["rockSlide", "crunch", "earthquake", "dragonDance"],          // Tyranitar
    249: ["aeroblast", "psychic", "iceBeam", "calmMind"],               // Lugia
    250: ["sacredFire", "fly", "earthquake", "calmMind"],               // Ho-Oh
    251: ["psychic", "gigaDrain", "calmMind", "synthesis"],             // Celebi
};

// Fallback: some movesets reference "smokescreen" which isn't in MOVES_DB
// Map it to a defense move
MOVES_DB.smokescreen = { name: "Smokescreen", type: "normal", cat: MOVE_CAT.STATUS, power: 0, effect: "accDown" };

// Helper to get a Pokemon's moveset as full move objects
export function getMoveset(pokemonId) {
    const moveKeys = POKEMON_MOVESETS[pokemonId] || ["tackle", "tackle", "harden", "leer"];
    return moveKeys.map(key => {
        const move = MOVES_DB[key];
        if (!move) {
            console.warn(`Move not found: ${key} for Pokemon ${pokemonId}`);
            return MOVES_DB.tackle;
        }
        return { ...move, key };
    });
}
