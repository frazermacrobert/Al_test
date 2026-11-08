# Playtest Report

## Session Info
- **Date**: 2026-11-08
- **Build**: v4 (commit d7b4523)
- **Duration**: Full automated run + manual code review
- **Tester**: Automated Playwright + Code Analysis
- **Platform**: Mobile (390×844 viewport)
- **Input Method**: Touch
- **Session Type**: First time (fresh localStorage)

## Test Focus
Full playtest of Blue Manor — evaluate core loop, moment-to-moment engagement, room experience, player agency, progression hooks, and mobile UX. Compared against Ticket to Earth, Ticket to Ride, and successful mobile roguelikes.

## First Impressions (First 5 minutes)
- **Understood the goal?** Partially — "explore rooms" is clear, but WHY is unclear
- **Understood the controls?** Partially — door tapping is intuitive, but the draft screen, resources, and blue streak are unexplained
- **Emotional response**: Confused → Bored
- **Notes**: Title screen is atmospheric (manor silhouette, fog, moonlight). Intro text is evocative but brief. The Foyer loads with 3 unexplored doors and 1 blocked — good first moment. But after tapping a door and picking a blueprint, the new room is... just text. An emoji, a name, a description, and maybe an auto-collected coin. There is nothing to DO in the room. The moment-to-moment loop is: tap door → pick card → read text → tap next door. No decisions, no tension, no delight.

## Gameplay Flow

### What worked well
- Draft mechanic (picking 1 of 3 blueprints) creates a real decision point
- Resource system exists (steps, gems, coins, keys) with clear trade-offs
- Blue streak concept is thematic and creates a strategic goal
- Room lore/descriptions are well-written and atmospheric
- Synergy system (Nursery+Bedrooms, Ballroom+wide rooms) rewards planning
- Dead-end rooms with guaranteed entry door prevent soft-locks
- Daily seed creates shared experience potential

### Pain points
- **Rooms are empty** — Severity: **CRITICAL**. Every room is just emoji + text + auto-item-pickup. No gameplay happens inside rooms. ~38 of 45 rooms have zero interaction. The 7 that have an interact button offer a single one-time click ("Study Stained Glass" → "Puzzle solved!") with no actual puzzle.
- **No End Day button** — Severity: **HIGH**. The day ends ONLY when steps reach 0. Players have zero agency over run timing. Cannot bank resources, cannot choose to end early for a bonus, cannot strategize around day length. This is a fundamental missing mechanic.
- **No in-room decisions** — Severity: **CRITICAL**. After the draft pick, the player makes zero meaningful decisions until the next door tap. Rooms should be where the game happens, but they're purely decorative.
- **No sense of building anything** — Severity: **HIGH**. You place rooms on a grid but there's no reward for spatial arrangement, no combo for adjacency, no visual payoff for your mansion layout. The grid is invisible during play.
- **Progression is nearly invisible** — Severity: **HIGH**. Starting allowance only increases from one specific puzzle (Chapel: +1 key forever). Room unlocks happen silently after X runs. There's no progression screen, no skill tree, no visible meta-game.
- **No story or goal** — Severity: **HIGH**. "Explore Room 46" is mentioned in one intro line. During play, there's no narrative thread, no quest log, no sense of approaching something. The Vault needs 5 secrets, but that requirement is hidden until you find it.

### Confusion points
- Blue streak dots in HUD have no tooltip or explanation
- Gem cost on draft cards is unclear (what happens if I can't afford any?)
- "Reroll" button exists but dice/reroll concept is never taught
- Map shows rooms but connections are hard to see on dark background
- Step cost for actions is inconsistent (moving = 1, drafting = 1, but some rooms give/take steps on draft vs on enter)

### Moments of delight
- The Conservatory's "next draft: 4 options" is a genuine "ooh" moment
- Finding the Shelter and knowing red rooms are neutralized feels powerful
- The lore text for each room is genuinely good writing
- Blue streak building up (dots filling) has visual satisfaction
- The concept of Room 46 as an ultimate goal is compelling

## Bugs Encountered
| # | Description | Severity | Reproducible |
|---|-------------|----------|-------------|
| 1 | MAP button clips on narrow viewports — HUD row too crowded | Medium | Yes |
| 2 | Map overlay too dark — rooms and connections hard to see | Medium | Yes |
| 3 | Draft can show all disabled cards (all cost gems, player has 0) with no escape except reroll (which also costs gems) | High | Yes |
| 4 | Door click targets overlap with room-scene, causing Playwright click interception (pointer-events issue) | Low | Yes |
| 5 | `moveTo` window function conflicts with `window.moveTo` (browser built-in) | Low | Yes |
| 6 | No check for grid boundary in door exploration — blocked doors at edges show ✕ but no explanation | Low | Yes |
| 7 | Starting allowance display on title shows "💎0 🪙0 🔑0 starting" — misleading when all zero | Low | Yes |

## Feature-Specific Feedback

### Room Experience
- **Understood purpose?** No — rooms feel like labels, not places
- **Found engaging?** No — nothing to do in them
- **Suggestions**: Each room needs at minimum one interactive element. Puzzles, choices, risk/reward decisions, mini-games, or branching events. "Enter room → read text → leave" is not gameplay.

### Draft System
- **Understood purpose?** Yes — pick a room to build
- **Found engaging?** Partially — the decision is interesting but happens too fast
- **Suggestions**: Show more info about draft impact. Preview where the room connects. Show how it affects your blue streak or route options. Make it feel like a real architectural decision.

### Resource Economy
- **Understood purpose?** Partially — 4 resources is a lot to track with no tutorial
- **Found engaging?** No — coins and keys accumulate with no reliable outlet
- **Suggestions**: Resources need more sinks. Shops are too rare. Keys have almost no use. Steps are the only resource that creates tension.

### Blue Streak
- **Understood purpose?** No — dots fill up but nothing explains why or what happens at 8
- **Found engaging?** Not yet — too hidden
- **Suggestions**: Make blue streak a front-and-center mechanic. Show the reward (seal, throne). Make blue room chains feel like combos with visual and audio feedback.

### Map
- **Understood purpose?** Yes
- **Found engaging?** No — too dark, too small, no interactivity
- **Suggestions**: Map should be a key strategic tool. Show available routes, highlight objectives, reward spatial planning.

### Meta-Progression
- **Understood purpose?** No — barely visible
- **Found engaging?** No — nothing to work toward between runs
- **Suggestions**: Need a progression screen between runs. Unlock tree. Story chapters. Permanent upgrades. Something that says "play again because next time you'll have X."

## Quantitative Data
- **Steps per room**: ~1.5 (1 to draft + potential entry costs)
- **Average rooms per run**: ~15-20 (with 30 steps)
- **Rooms with interactions**: 7 of 45 (15.5%)
- **Rooms with zero gameplay**: 38 of 45 (84.5%)
- **Decisions per room**: Draft: 1 (pick card). In-room: 0 for 85% of rooms.
- **Time per decision**: ~3 seconds (glance at 3 cards, pick one)
- **Shop encounters per run**: ~0-1 (only 2 shop rooms in deck, rare)
- **Secrets discoverable per run**: ~0-2 (requires specific rooms + interact)
- **Blue streak feasibility**: Very low (~5% chance of 8 consecutive blue rooms)

## Overall Assessment
- **Would play again?** No — there's nothing to come back for
- **Difficulty**: Too Easy (no failure states, no challenge within rooms)
- **Pacing**: Too Fast (rooms fly by with no engagement)
- **Session length preference**: Shorter (nothing sustains interest)

## Top 3 Priorities from this session
1. **Rooms must offer experiences** — Every room needs interactive gameplay: choices, puzzles, risk/reward events, mini-encounters. The room is where the game should happen.
2. **Player agency over run timing** — Add "End Day" / "Rest at Camp" mechanic with strategic trade-offs (bank resources, get bonuses, but sacrifice remaining exploration).
3. **Visible progression and goals** — Between-run progression screen with unlocks, a story arc told through discoveries, clear milestones the player can see and work toward.

## Action Routing

### Design changes needed
- Rooms need in-room gameplay (events, choices, puzzles, mini-encounters)
- "End Day" mechanic with strategic depth
- Progression system between runs (unlock tree, story chapters, permanent upgrades)
- Blue streak needs to be a front-and-center combo system
- Spatial layout should matter (adjacency bonuses, route planning)
- Clear goal presentation from the start
- Tutorial/onboarding flow for new players

### Balance adjustments
- 30 steps may be too generous for the simplicity of current rooms
- Blue streak of 8 is nearly impossible to achieve naturally
- Coin/key economy needs more sinks and sources
- Shop rarity means coins often go unspent
- Red room penalties are too mild (Shelter trivializes them)

### Bug reports
- MAP button clipping in HUD
- Map overlay too dark
- Draft can deadlock (all cards cost gems, 0 gems, 0 rerolls)
- window.moveTo naming conflict

### Polish items
- Room scene decorations are too subtle (barely visible CSS shapes)
- Missing visual feedback for resource changes
- No sound design whatsoever
- No animation when entering rooms
- Toast notifications are too brief and easy to miss
- Journal has no useful content on first play
