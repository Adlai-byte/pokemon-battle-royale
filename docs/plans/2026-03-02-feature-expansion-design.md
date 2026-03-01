# Pokemon Battle Royale - Feature Expansion Design

## Scope

7 new features across 3 phases (Gen expansion deferred). Shipped incrementally.

---

## Phase 1: Quick Polish

### 1a. Sound Effects (`js/music.js`)
Synthesized SFX using existing Web Audio API — no audio files.

| SFX | Trigger | Sound |
|-----|---------|-------|
| Hit | Auto-attack lands | Short noise burst, 80ms |
| Super-effective | Type advantage hit | Higher pitch impact + ring |
| Elimination | Pokemon eliminated | Descending tone sweep, 300ms |
| Evolution | Pokemon evolves | Ascending 3-note arpeggio, 500ms |
| Item pickup | Item collected | Quick chime, 100ms |
| Critical hit | Crit damage | Sharp crack + bass thud |

All methods added to `MusicManager`. Called from `battle.js` and `items.js`.

### 1b. Mobile Responsive (`css/styles.css`)
Target: playable on 375px+ screens.

- **HUD**: Stack leaderboard + event log below arena at `max-width: 900px`
- **Leaderboard**: Horizontal scrollable row instead of sidebar
- **Event log**: Collapsed by default, expand on tap
- **Betting grid**: 2-column on mobile, larger touch targets
- **Victory screen**: Scrollable container
- **Settings**: Already mostly works, just tweak padding/font sizes
- **Canvas**: Already scales via `arena.resize()`

### 1c. Share Card (`js/ui.js`)
"Share" button on victory screen.

- Render 600x400 offscreen canvas with: game logo, winner sprite, name, kill count, prediction result, points earned, top 4 battle stats
- Retro styling: dark background, pixel font, colored borders
- `canvas.toBlob()` → `navigator.share({ files })` on mobile
- Fallback: download as PNG on desktop
- Button text: "Share Result"

---

## Phase 2: Spectator & Animations

### 2a. Auto-Camera (`js/arena.js`, `js/main.js`)
Smart viewport system on the existing canvas.

**Focus scoring** (per frame):
- Pokemon with active fights (in combat range) weighted by: combined kill count, low HP tension, recent kills
- Highest-scoring cluster becomes camera target
- Smooth lerp pan (2s transition), zoom 1.0x-1.3x

**Components:**
- `Camera` object in `arena.js`: `{ x, y, zoom, targetX, targetY, targetZoom }`
- `arena.beginFrame()` applies camera transform (`ctx.translate`, `ctx.scale`)
- All rendering automatically respects camera (positions already use canvas coords)
- Mini-map: 120x80px overlay in top-right corner when zoomed, shows full arena + dots for Pokemon
- "Your Pick" highlight: pulsing golden ring around predicted Pokemon
- HUD toggle: "Auto-Cam" button, default On

**Edge cases:**
- Zoom out to 1.0x when < 5 Pokemon remain (endgame needs full view)
- Never zoom into empty space — require at least 2 Pokemon in frame

### 2b. Enhanced Animations (`js/effects.js`, `js/pokemon.js`)

| Feature | Implementation |
|---------|---------------|
| Larger attack particles | Scale existing `spawnAttackEffect()` particle count 2x, add secondary color layer |
| Evolution flash | White overlay fade (200ms) before existing effect, scale burst 2x |
| Critical hit | 3-frame slow-mo via `main.js` loop, white screen flash overlay |
| Last 3 spotlight | Dim canvas overlay (0.3 alpha), spotlight circles on survivors |
| Smooth HP bars | `pokemon.js` display HP lerps toward actual HP at 5%/frame |
| Kill streak aura | Golden particle ring on 3+ kills, brighter at 5+ |

---

## Phase 3: Leaderboard & Shop

### 3a. All-Time Leaderboard (`leaderboard.html`)
New page linked from settings nav.

**Data source:** Expanded `pokemonBRHistory` localStorage (already stores 50 battles). Add per-species aggregation on page load.

**Sections:**
1. **Species Rankings** — Table: Name, Wins, Win Rate, Avg Kills, Avg Placement, Appearances. Sortable columns.
2. **Personal Records** — Cards: Most kills (single game), longest correct streak, highest single-game points, total points earned.
3. **Type Analysis** — Bar chart (CSS-only): win count per type.

**Styling:** Same retro theme as info.html/credits.html (sidebar nav, section cards).

**Data changes:** `_saveBattleHistory()` already stores enough. Species aggregation computed client-side on page load from history array.

### 3b. Points Shop (`js/ui.js`, `js/arena.js`)
Section on settings screen, below battle history.

**Unlockable themes (4):**

| Theme | Cost | Effect |
|-------|------|--------|
| Neon Night | 200 | Dark purple bg, neon pink/cyan borders, glow effects |
| Classic Green | 300 | Game Boy green monochrome tint on arena |
| Lava Caves | 400 | Red/orange palette, ember particles |
| Frozen Tundra | 500 | Blue/ice palette, snowflake ambient particles |

**Implementation:**
- `localStorage.pokemonBRShop = { owned: ["neon-night"], selected: "neon-night" }`
- Arena themes applied via color palette override in `arena.js` `_renderOffscreenBg()`
- Shop UI: grid of 4 theme cards with preview color swatch, price or "Owned/Selected" badge
- Buy button deducts points via `_awardPoints(-cost, "Bought theme")`

---

## Architecture Notes

- No new JS files — all features extend existing modules
- Exception: `leaderboard.html` is a new page (like credits.html)
- All data persisted in localStorage (no backend)
- All audio synthesized (no asset files)
- Share card rendered client-side (no server)

## Phases & Estimated File Changes

| Phase | Files Modified | New Files |
|-------|---------------|-----------|
| 1 | music.js, battle.js, items.js, ui.js, styles.css | — |
| 2 | arena.js, main.js, effects.js, pokemon.js, ui.js, styles.css | — |
| 3 | ui.js, arena.js, styles.css | leaderboard.html |
