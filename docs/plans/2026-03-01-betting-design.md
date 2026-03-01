# Spectator Betting / Predictions — Design Document

## Overview

Add a prediction system where players guess the battle winner before it starts. Show Pokemon grouped by BST-based tiers on a dedicated betting screen after champion select. Track prediction accuracy across sessions with localStorage.

## Flow

1. Settings screen (shows prediction stats)
2. Champion select (existing)
3. **NEW: Betting screen** — pick predicted winner from tier-grouped roster
4. Countdown → Battle → Victory (shows prediction result + updated stats)

## Betting Screen

- Separate overlay screen after champion select, before countdown
- Full roster grid, cards color-coded by BST tier:
  - **Favorite** (500+ BST): gold border
  - **Contender** (400-499 BST): silver border
  - **Underdog** (300-399 BST): bronze border
  - **Longshot** (<300 BST): red border
- Each card shows Pokemon sprite, name, tier label
- Click to select prediction (highlighted with checkmark)
- "Skip" button to skip betting
- "Confirm" button to lock in prediction and start battle

## Tier Calculation

BST = hp + attack + defense + spAtk + spDef + speed (from POKEMON_DATA stats).

Only base forms are in the roster, so tiers reflect starting strength. Evolved forms are stronger but require kills to reach.

## Score Tracker

localStorage key: `pokemonBRPredictions`

```json
{
  "totalPredictions": 12,
  "correctPredictions": 5,
  "currentStreak": 2,
  "bestStreak": 4
}
```

Shown on landing page below "how it works" section:
- "Predictions: 5/12 correct | Streak: 2 | Best: 4"
- Small reset button to clear stats

## Victory Screen Changes

- Below winner name: "Your prediction: [name]" with Correct/Wrong badge
- If correct: green text, streak update
- If skipped: "No prediction made" in gray

## Files Modified

1. `js/ui.js` — new `showBettingScreen(roster, onConfirm)`, modify `showVictory()`, prediction stats display, load/save localStorage
2. `js/main.js` — betting step between champion select and battle, store prediction state
3. `css/styles.css` — betting screen styles, tier colors, prediction result styling
4. `index.html` — prediction stats container on landing page
