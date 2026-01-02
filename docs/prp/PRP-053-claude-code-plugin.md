# PRP-053: TypeBit8 Claude Code Plugin

**Status**: IN PROGRESS (Phase 1-3 Complete)
**Author**: Claude + Anton
**Date**: 2026-01-02
**Priority**: HIGH
**Progress**: ~90% complete

| Phase | Status |
|-------|--------|
| Phase 1: Core Plugin | ✅ Complete |
| Phase 2: Terminal Mode | ✅ Complete |
| Phase 3: Account Linking | ✅ Complete |
| Phase 4: Auto Triggers | ⏸️ Deferred |
| Phase 5: Launch | ⏳ Pending |

---

## Executive Summary

Create a TypeBit8 plugin for Claude Code that enables developers to practice typing directly within their coding sessions. The plugin offers two modes: **Browser mode (free)** opens typebit8.com in the default browser, while **Terminal mode (premium)** provides an inline ASCII-based typing test without leaving the terminal. The plugin can be triggered manually via slash command or automatically during long-running operations like agent tasks, builds, or test runs.

**Key Value Proposition**: Developers stay in flow - no context switching to practice typing during natural idle moments.

---

## Problem Statement

### Current State

1. **Context switching kills practice**: Developers must leave their IDE/terminal to practice typing
2. **Natural idle moments wasted**: Builds, test runs, and agent tasks create waiting time that could be productive
3. **No acquisition channel from developer tools**: TypeBit8 has no presence where developers already spend time

### Opportunity

Claude Code has 100,000+ active users (estimated). The plugin ecosystem is new - early presence = first-mover advantage in developer typing tools.

### Success Criteria

- [ ] Plugin published to Claude Code plugin registry
- [ ] 500+ installs in first month
- [ ] 10% of plugin users complete at least one typing test
- [ ] 5% of plugin users create/link TypeBit8 account
- [ ] 2% conversion from plugin users to premium (terminal mode)

---

## Technical Architecture

### Plugin Structure

```
typebit8-claude-plugin/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── commands/
│   └── speed-test.md            # /typebit8:speed-test command
├── skills/
│   └── typing-break/
│       └── SKILL.md             # Auto-invoked during long operations
├── hooks/
│   └── hooks.json               # Event handlers for automatic triggers
├── .mcp.json                    # MCP server for typing test tools
├── servers/
│   └── typebit8-mcp/
│       ├── index.ts             # MCP server implementation
│       └── package.json
└── README.md
```

### Plugin Manifest (`plugin.json`)

```json
{
  "name": "typebit8",
  "version": "1.0.0",
  "description": "Practice typing during builds, tests, and agent runs",
  "author": {
    "name": "TypeBit8",
    "email": "hello@typebit8.com",
    "url": "https://typebit8.com"
  },
  "homepage": "https://typebit8.com/claude-plugin",
  "repository": "https://github.com/typebit8/claude-code-plugin",
  "license": "MIT",
  "keywords": ["typing", "productivity", "practice", "wpm", "speed-test"],
  "commands": ["./commands/speed-test.md"],
  "skills": "./skills/",
  "hooks": "./hooks/hooks.json",
  "mcpServers": "./.mcp.json"
}
```

---

## Component Details

### 1. Slash Command: `/typebit8:speed-test`

**File**: `commands/speed-test.md`

```markdown
---
description: Start a typing speed test (browser or terminal mode)
allowed-tools:
  - mcp__typebit8__*
  - Bash
  - WebFetch
---

# TypeBit8 Speed Test

Start a typing speed test for the user.

## Mode Selection

Check if the user has premium access by calling the typebit8_check_premium MCP tool.

If premium:
- Ask: "Terminal mode (inline) or Browser mode?"
- Default to terminal if user doesn't specify

If not premium:
- Inform user: "Opening TypeBit8 in your browser. Terminal mode is available with Premium."
- Open browser to typebit8.com/speed-test

## Terminal Mode (Premium Only)

Use the typebit8_terminal_test MCP tool to run an inline typing test.
Display results when complete.
Sync results to TypeBit8 account if authenticated.

## Browser Mode (Free)

Open the default browser to: https://typebit8.com/speed-test?utm_source=claude-code&utm_medium=plugin

## Arguments

$ARGUMENTS can include:
- `--duration 30|60|120` - Test duration in seconds (default: 60)
- `--mode terminal|browser` - Force specific mode
- `--type code|prose` - Content type (default: code)
```

### 2. Skill: Typing Break

**File**: `skills/typing-break/SKILL.md`

```markdown
---
description: Suggest typing practice during long-running operations. Use when the user is waiting for builds, tests, agent tasks, or deployments.
allowed-tools:
  - mcp__typebit8__*
  - Bash
  - AskUserQuestion
---

# Typing Break Skill

This skill suggests typing practice when the user has natural idle time.

## When to Activate

Suggest a typing break when:
1. An agent task is running and expected to take >2 minutes
2. A build, test, or deployment is in progress
3. The user explicitly mentions waiting or being idle

## How to Suggest

Use a non-intrusive prompt:

"While you wait, want to do a quick typing warmup?
[Y] 30-second sprint  [N] Skip  [D] Don't ask again this session"

If user declines with [D], remember this preference for the session.

## Execution

If user accepts:
1. Check premium status via typebit8_check_premium
2. If premium: Run inline terminal test
3. If free: Open browser to typebit8.com/speed-test

## After Test

Show brief results:
- WPM achieved
- Comparison to previous (if available)
- Encouragement message

Resume normal assistant behavior.
```

### 3. Hooks: Automatic Detection

**File**: `hooks/hooks.json`

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/check-long-task.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "If this command is a long-running build (npm run build, cargo build, go build, pytest, jest, etc.) and will take more than 60 seconds, consider suggesting a typing break using the typing-break skill. Only suggest once per session unless the user wants more."
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/session-init.sh"
          }
        ]
      }
    ]
  }
}
```

### 4. MCP Server: TypeBit8 Tools

**File**: `.mcp.json`

```json
{
  "mcpServers": {
    "typebit8": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/servers/typebit8-mcp/dist/index.js"],
      "env": {
        "TYPEBIT8_API_URL": "https://api.typebit8.com",
        "TYPEBIT8_API_KEY": "${TYPEBIT8_API_KEY}"
      }
    }
  }
}
```

**MCP Server Tools**:

| Tool | Description | Premium |
|------|-------------|---------|
| `typebit8_check_premium` | Check if user has premium access | No |
| `typebit8_auth_status` | Check authentication status | No |
| `typebit8_auth_link` | Generate auth link for account linking | No |
| `typebit8_terminal_test` | Run inline terminal typing test | Yes |
| `typebit8_get_snippet` | Get typing snippet (code/prose) | No |
| `typebit8_submit_result` | Submit test result to account | No |
| `typebit8_get_stats` | Get user's typing statistics | No |

---

## User Flows

### Flow 1: Manual Invocation (Free User)

```
User: /typebit8:speed-test

Claude: Opening TypeBit8 in your browser...

        [Browser opens to typebit8.com/speed-test]

        Terminal mode (inline tests without leaving Claude)
        is available with TypeBit8 Premium.

        Want to link your TypeBit8 account? [Y/N]
```

### Flow 2: Manual Invocation (Premium User)

```
User: /typebit8:speed-test

Claude: Starting 60-second typing test...

        Type the following code:
        ┌────────────────────────────────────────────────────┐
        │ async function fetchUser(id: string) {            │
        │   const response = await fetch(`/api/users/${id}`);│
        │   return response.json();                         │
        │ }                                                 │
        └────────────────────────────────────────────────────┘

        Your input:
        > async function fetchUser(id: string) {_

        ⏱️ 45s remaining | 52 WPM | 98% accuracy
```

### Flow 3: Automatic Suggestion (During Agent Task)

```
Claude: I'm starting a comprehensive codebase analysis.
        This will take approximately 3-4 minutes.

        💡 While you wait: Quick typing warmup?
           [Y] 30-second sprint  [N] Skip  [D] Don't ask again

User: y

Claude: Starting 30-second sprint...

        [Terminal typing test runs]

        ✅ Nice! 67 WPM with 96% accuracy
        Your average this week: 63 WPM (+4 WPM improvement!)

        [Agent task completes]

        Analysis complete. Here's what I found...
```

### Flow 4: Account Linking

```
User: /typebit8:speed-test --link

Claude: To sync your results and unlock terminal mode:

        1. Visit: https://typebit8.com/link-claude
        2. Sign in to your TypeBit8 account
        3. Enter this code: ABC-123-XYZ

        Waiting for confirmation... ✓ Linked!

        You're connected as: anton@typebit8.com
        Premium status: Active
        Lifetime WPM: 72 | Tests completed: 234
```

---

## Terminal Mode Implementation

### ASCII Rendering

```
┌─────────────────────────────────────────────────────────────┐
│  ████████╗██╗   ██╗██████╗ ███████╗██████╗ ██╗████████╗     │
│  ╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██║╚══██╔══╝     │
│     ██║    ╚████╔╝ ██████╔╝█████╗  ██████╔╝██║   ██║        │
│     ██║     ╚██╔╝  ██╔═══╝ ██╔══╝  ██╔══██╗██║   ██║        │
│     ██║      ██║   ██║     ███████╗██████╔╝██║   ██║        │
│     ╚═╝      ╚═╝   ╚═╝     ╚══════╝╚═════╝ ╚═╝   ╚═╝        │
├─────────────────────────────────────────────────────────────┤
│  Type the following:                                        │
│                                                             │
│  const handleSubmit = async (data: FormData) => {          │
│    try {                                                    │
│      await api.post('/submit', data);                       │
│    } catch (err) {                                          │
│      console.error('Submit failed:', err);                  │
│    }                                                        │
│  };                                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Your input:                                                │
│  > const handleSubmit = async (data: FormData) => {█       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ⏱️ 42s │ 58 WPM │ 97% accuracy │ ████████░░ 80%           │
└─────────────────────────────────────────────────────────────┘
```

### Input Handling

The MCP server will:
1. Send snippets to Claude for display
2. Claude uses `Bash` tool to read user input character by character
3. Each keystroke is validated and WPM calculated
4. Real-time feedback rendered via Claude's response

**Alternative approach** (simpler but less interactive):
1. Claude displays the snippet
2. User types their response in a single message
3. Claude compares input to target and calculates metrics

### Results Display

```
┌─────────────────────────────────────────────────────────────┐
│                     TEST COMPLETE!                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              ██╗    ██╗██████╗ ███╗   ███╗                  │
│              ██║    ██║██╔══██╗████╗ ████║                  │
│              ██║ █╗ ██║██████╔╝██╔████╔██║                  │
│              ██║███╗██║██╔═══╝ ██║╚██╔╝██║                  │
│              ╚███╔███╔╝██║     ██║ ╚═╝ ██║                  │
│               ╚══╝╚══╝ ╚═╝     ╚═╝     ╚═╝                  │
│                        67                                   │
│                                                             │
│  Accuracy: 96%  │  Characters: 234  │  Errors: 9           │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│  Your Progress:                                             │
│  Today: 67 WPM (▲ +5 from yesterday)                        │
│  This Week: 64 WPM average                                  │
│  All-time Best: 78 WPM                                      │
│                                                             │
│  [Result synced to typebit8.com]                            │
└─────────────────────────────────────────────────────────────┘
```

---

## API Design

### TypeBit8 API Endpoints (New)

```
POST /api/claude-plugin/auth/init
  → Returns { linkCode, expiresAt }

POST /api/claude-plugin/auth/verify
  Body: { linkCode }
  → Returns { success, apiKey, user }

GET /api/claude-plugin/premium-status
  Header: Authorization: Bearer {apiKey}
  → Returns { isPremium, plan, expiresAt }

GET /api/claude-plugin/snippet
  Query: type=code|prose, duration=30|60|120
  Header: Authorization: Bearer {apiKey}
  → Returns { id, text, difficulty, category }

POST /api/claude-plugin/result
  Header: Authorization: Bearer {apiKey}
  Body: { snippetId, wpm, accuracy, duration, errors }
  → Returns { saved, newStats }

GET /api/claude-plugin/stats
  Header: Authorization: Bearer {apiKey}
  → Returns { todayWpm, weekAvg, allTimeBest, testsCompleted }
```

### Authentication Flow

1. **First Use**: User runs `/typebit8:speed-test`
2. **No Linked Account**: Plugin offers to link
3. **Link Initiation**:
   - Plugin calls `/auth/init` to get a 6-character code
   - User visits typebit8.com/link-claude and enters code
   - TypeBit8 website verifies code and creates API key
4. **Verification**:
   - Plugin polls `/auth/verify` with linkCode
   - On success, stores API key in Claude Code config
5. **Subsequent Uses**: API key used for all requests

### API Key Storage

The plugin stores the API key in Claude Code's settings:

```bash
# User runs this once after linking
claude config set typebit8.api_key "tb8_xxxxx"
```

Or the plugin can prompt Claude to run this automatically after successful linking.

---

## Monetization Strategy

### Free Tier

- Browser mode (opens typebit8.com)
- Account linking for stat syncing
- View basic stats (total tests, average WPM)
- Code and prose snippets

### Premium Tier ($4.99/mo or $49.99/yr)

- **Terminal mode** (inline tests, no context switch)
- Real-time WPM display
- Advanced statistics (daily trends, problem keys)
- Custom snippets (paste your own code)
- Priority API access
- Badge: "Terminal Typist" on leaderboard

### Conversion Funnel

```
                        Plugin Install (Free)
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Uses Browser         Links Account
              Mode (Free)             (Free)
                    │                   │
                    │         ┌─────────┴─────────┐
                    │         │                   │
                    │    Views Stats         Sees "Terminal
                    │    (Free)              Mode" prompt
                    │         │                   │
                    └─────────┴─────────┬─────────┘
                                        │
                              Tries to use Terminal
                              Mode → Paywall
                                        │
                                        ▼
                              Converts to Premium
```

---

## Implementation Phases

### Phase 1: Core Plugin ✅ COMPLETE

- [x] Create plugin structure and manifest (`claude-plugin/.claude-plugin/plugin.json`)
- [x] Implement `/typebit8:speed-test` slash command (`claude-plugin/commands/speed-test.md`)
- [x] Build MCP server with all tools (`claude-plugin/servers/typebit8-mcp/`)
- [x] Implement MCP tools:
  - [x] `auth_status` - Check if account linked
  - [x] `auth_link` - Generate 6-char link code
  - [x] `auth_verify` - Verify link code
  - [x] `check_premium` - Check premium status (currently returns true for all)
  - [x] `get_snippet` - Get typing snippet
  - [x] `submit_result` - Submit test result with WPM calculation
  - [x] `get_stats` - Get user statistics
  - [x] `set_preference` / `get_preference` - Session preferences
- [x] Create TypeBit8 API endpoints (`convex/claudePlugin.ts`)
- [x] Add HTTP routes (`convex/http.ts`)
- [x] Add database tables (`convex/schema.ts`):
  - [x] `pluginLinkCodes` - Pending link codes
  - [x] `pluginApiKeys` - User API keys
  - [x] `pluginTestResults` - Test results from plugin
- [x] Test basic flow end-to-end

### Phase 2: Terminal Mode ✅ COMPLETE

- [x] Design ASCII rendering system (box drawing in command prompt)
- [x] Build snippet delivery and validation
- [x] Add post-hoc WPM calculation (user types, Claude calculates)
- [x] Implement result submission
- [x] Add stats display after test
- [x] Terminal mode available for everyone (no premium gate for launch)

### Phase 3: Account Linking ✅ COMPLETE

- [x] Backend API for link code generation (`initAuthLink`)
- [x] Backend API for code claiming (`claimLinkCode`)
- [x] Backend API for verification (`verifyLinkCode`)
- [x] **Create `/link-claude` frontend page** (`src/pages/LinkClaudePage.tsx`):
  - [x] Route at `/link-claude`
  - [x] Input field for 6-character code (auto-formats as ABC-123)
  - [x] Requires user authentication (Clerk SignedIn/SignedOut)
  - [x] Calls `claimLinkCode` mutation with code + clerkId
  - [x] Shows success/error/loading states
  - [x] Shows confirmation with linked email
- [x] Deploy Convex backend (`npx convex deploy`)
- [x] Update MCP server to use production API URL
- [x] Test full account linking flow

### Phase 4: Automatic Triggers (Optional - Future)

- [x] Implement typing-break skill (`claude-plugin/skills/typing-break/SKILL.md`)
- [x] Add hooks for SubagentStart and PostToolUse (`claude-plugin/hooks/hooks.json`)
- [ ] Create session preference storage (don't ask again)
- [ ] Test automatic suggestion during agent tasks
- [ ] Test suggestion during builds
- [ ] Polish messaging and UX

### Phase 5: Launch & Distribution

- [x] Write plugin README with installation instructions
- [ ] Create marketing page: typebit8.com/claude-plugin
- [ ] Create install script to simplify setup
- [ ] Submit to Claude Code plugin registry (when available)
- [ ] Announce on X, Product Hunt, Reddit
- [ ] Monitor adoption and gather feedback

---

## Files Created

### Plugin (`claude-plugin/`)

| File | Purpose |
|------|---------|
| `.claude-plugin/plugin.json` | Plugin manifest |
| `commands/speed-test.md` | `/typebit8:speed-test` command |
| `skills/typing-break/SKILL.md` | Auto-suggestion skill |
| `hooks/hooks.json` | Event handlers |
| `.mcp.json` | MCP server configuration |
| `servers/typebit8-mcp/src/index.ts` | MCP server implementation |
| `README.md` | Installation guide |

### Backend (`convex/`)

| File | Purpose |
|------|---------|
| `claudePlugin.ts` | API mutations/queries for plugin |
| `http.ts` | HTTP routes for plugin API |
| `schema.ts` | Database tables (3 new) |

### Frontend ✅

| File | Purpose |
|------|---------|
| `src/pages/LinkClaudePage.tsx` | Account linking page |
| `src/router.tsx` | Route added at `/link-claude` |

---

## Technical Considerations

### Input Handling Challenge

Claude Code doesn't have a native "live keystroke capture" mode. Two approaches:

**Approach A: Post-hoc Validation**
1. Claude shows the snippet
2. User types response in a single message
3. Claude calculates WPM based on time between display and submission
4. Simpler but less "game-like"

**Approach B: Timed Input**
1. Claude starts a Bash process that reads input with timeout
2. User types into the terminal
3. Input captured and validated
4. More interactive but more complex

**Recommendation**: Start with Approach A for MVP, iterate to B if users want more interactivity.

### State Management

The plugin needs to track:
- Session preferences (don't ask again)
- API key (for authenticated users)
- Last suggestion time (avoid spamming)

Store in:
```bash
~/.config/claude-code/typebit8/
├── config.json      # API key, preferences
└── session.json     # Temporary session state
```

### Error Handling

| Scenario | Handling |
|----------|----------|
| API unreachable | Fall back to browser mode |
| Invalid API key | Prompt re-authentication |
| Premium expired | Graceful degradation to browser mode |
| Snippet fetch fails | Use cached snippets |
| Result submission fails | Queue for retry |

---

## Metrics & Analytics

### Plugin Events (Send to TypeBit8)

```typescript
// Track in TypeBit8 analytics
trackPluginEvent('install', { version });
trackPluginEvent('command_used', { command: 'speed-test', mode: 'browser' });
trackPluginEvent('skill_triggered', { skill: 'typing-break', accepted: true });
trackPluginEvent('test_completed', { wpm, accuracy, mode: 'terminal' });
trackPluginEvent('account_linked', { userId });
trackPluginEvent('premium_upsell_shown', {});
trackPluginEvent('premium_upsell_clicked', {});
```

### Success Metrics Dashboard

| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| Plugin installs | 500 | 2,000 |
| Active users (weekly) | 200 | 800 |
| Tests completed | 1,000 | 10,000 |
| Account links | 100 | 500 |
| Premium conversions | 10 | 100 |
| Premium revenue | $50 | $500 |

---

## Competitive Analysis

No direct competitors in Claude Code plugin space for typing practice.

**Related tools:**
- `typing.io` - Web-based, code typing practice
- `speedtyper.dev` - Web-based, developer-focused
- `monkeytype` - Web-based, general typing

**Differentiation**: Only typing practice that integrates directly into the development workflow without browser context switching.

---

## Open Questions

1. ~~**Plugin Registry**: Is there a public Claude Code plugin registry yet, or is distribution manual?~~ → Manual installation for now
2. **Real-time Input**: Can we capture keystrokes in real-time, or only post-submission? → Post-submission for MVP
3. **API Rate Limits**: What limits should we set for the plugin API?
4. **Offline Mode**: Should terminal mode work offline with cached snippets? → Yes, implemented with DEFAULT_SNIPPETS
5. **Team/Enterprise**: Should we offer team features (shared leaderboards)?

## Installation Requirements (Discovered)

For local plugin installation, users must:

1. Copy plugin to `~/.claude/plugins/typebit8/`
2. Add entry to `~/.claude/plugins/installed_plugins.json`
3. Enable in `~/.claude/settings.json` under `enabledPlugins`
4. Add permissions in `~/.claude/settings.json`:
   ```json
   "permissions": {
     "allow": ["mcp__plugin_typebit8_typebit8__*"]
   }
   ```
5. Build MCP server: `npm install && npm run build`
6. Restart Claude Code

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low plugin adoption | High | Partner with typing influencers, feature on PH |
| Claude Code plugin API changes | Medium | Design for graceful degradation |
| Real-time input not feasible | Medium | Post-hoc approach still provides value |
| Premium conversion too low | Medium | Experiment with trial periods |
| API costs too high | Low | Aggressive caching, rate limiting |

---

## Appendix: Sample Code Snippets

### JavaScript/TypeScript
```typescript
async function fetchData(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
}
```

### Python
```python
def process_items(items: list[dict]) -> list[str]:
    return [
        item["name"].upper()
        for item in items
        if item.get("active", False)
    ]
```

### Go
```go
func (s *Server) handleRequest(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }
    // Process request
}
```

### Rust
```rust
impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        self.count += 1;
        if self.count < 6 {
            Some(self.count)
        } else {
            None
        }
    }
}
```

---

## References

- [Claude Code Plugins Documentation](https://code.claude.com/docs/en/plugins.md)
- [Claude Code Skills Guide](https://code.claude.com/docs/en/skills.md)
- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide.md)
- [MCP (Model Context Protocol) Specification](https://modelcontextprotocol.io)
