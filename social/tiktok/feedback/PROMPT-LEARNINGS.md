# TikTok Video Generation - Prompt Learnings

## Review Date: 2025-12-27

### Summary
- **Approved**: 5/7 videos
- **Needs Work**: 1 (Day 3 - ASMR)
- **Pending**: 1 (Day 5 - Challenge)

---

## Key Learnings

### 1. Contrast in Slow vs Fast Typing
**Feedback**: "Day 1 could be even slower typing" / "Slow typing could be even slower"

**Learning**: When showing slow/bad typing, make it MORE exaggerated:
- Use "painfully slow hunt-and-peck" instead of just "slow"
- Add "long pauses between keystrokes"
- Include "visible frustration and sighing"
- Specify "one finger hovering, searching for keys"

**Improved prompt pattern**:
```
SLOW/BAD typing: Single index finger hunting for each key one at a time,
long 2-3 second pauses between keystrokes, person looking down at keyboard
with confused expression, visibly frustrated sighing
```

### 2. Object Consistency (CRITICAL)
**Feedback**: Day 3 - "The keyboard keys keep disappearing"

**Learning**: AI video generation struggles with object permanence. Need explicit stability instructions:
- Add "consistent keyboard throughout entire video"
- Add "keycaps remain stable and visible at all times"
- Add "no morphing or disappearing elements"
- Avoid extreme close-ups that might confuse the AI

**Improved prompt pattern**:
```
IMPORTANT: Keyboard must remain completely stable and consistent throughout
the entire video. All keycaps visible and unchanged. No morphing, warping,
or disappearing elements.
```

### 3. Time References
**Feedback**: "We are still in 2025 and just about to enter 2026 hence reference could be useful"

**Learning**: Time-based references (like "2025") create relevance and urgency. Keep using current year references for educational content.

---

## Videos Needing Regeneration

### Day 3: Satisfying ASMR
**Issue**: Keyboard keys keep disappearing

**Original Prompt**:
```
Vertical 9:16 TikTok ASMR video. Extreme close-up macro shot of fingers typing
on a high-end mechanical keyboard with Cherry MX switches...
```

**Improved Prompt**:
```
Vertical 9:16 TikTok ASMR video. Medium close-up shot (not extreme macro) of
fingers typing on a high-end mechanical keyboard. CRITICAL: The keyboard must
remain completely stable and consistent throughout - all keycaps visible and
unchanged, no morphing or disappearing elements. Keycaps are backlit with cyan
and yellow RGB lighting creating beautiful color gradient. Each keypress shows
satisfying tactile movement - keys pressing down smoothly and springing back up.
Fingers positioned correctly on home row, typing in a steady rhythmic pattern.
Dark moody background with soft bokeh lights. Camera angle stays fixed - no
movement or zooming that could cause rendering issues. No face visible, just
hands and stable keyboard. Cinematic feel, premium aesthetic, extremely
satisfying to watch.
```

---

## Prompt Template (Updated)

Based on learnings, here's the improved template:

```
Vertical 9:16 TikTok format. [SCENE DESCRIPTION]

VISUAL CONSISTENCY: All objects (especially keyboards) must remain stable
and consistent throughout. No morphing, warping, or disappearing elements.

TYPING CONTRAST (if showing before/after):
- SLOW/BAD: Single index finger hunt-and-peck, 2-3 second pauses between
  keys, confused expression looking down at keyboard, visible frustration
- FAST/GOOD: All 10 fingers on home row ASDF JKL, fluid rapid motion,
  confident expression, not looking at keyboard

BRAND ELEMENTS:
- Cyan and yellow RGB keyboard backlighting
- Dark room with retro gaming monitors in background
- Moody cinematic lighting

[SPECIFIC SCENE DETAILS]
```

---

## Next Actions
1. Regenerate Day 3 with improved prompt (add stability instructions)
2. Download Day 5 from Grok history
3. Apply learnings to future video prompts
