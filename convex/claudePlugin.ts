/**
 * PRP-053: Claude Code Plugin API
 *
 * API endpoints for the TypeBit8 Claude Code plugin.
 * Handles authentication, premium checks, snippet delivery, and result submission.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

// Link codes expire after 2 minutes
const LINK_CODE_EXPIRY_MS = 2 * 60 * 1000;

// Default code snippets for typing practice
const CODE_SNIPPETS = [
  {
    id: "ts-fetch-1",
    text: `async function fetchUser(id: string) {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`,
    difficulty: "easy" as const,
    category: "typescript",
    language: "typescript",
    charCount: 108,
  },
  {
    id: "ts-submit-1",
    text: `const handleSubmit = async (data: FormData) => {
  try {
    await api.post('/submit', data);
  } catch (err) {
    console.error('Submit failed:', err);
  }
};`,
    difficulty: "medium" as const,
    category: "typescript",
    language: "typescript",
    charCount: 145,
  },
  {
    id: "ts-debounce-1",
    text: `function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}`,
    difficulty: "hard" as const,
    category: "typescript",
    language: "typescript",
    charCount: 252,
  },
  {
    id: "py-process-1",
    text: `def process_items(items: list[dict]) -> list[str]:
    return [
        item["name"].upper()
        for item in items
        if item.get("active", False)
    ]`,
    difficulty: "easy" as const,
    category: "python",
    language: "python",
    charCount: 138,
  },
  {
    id: "go-handler-1",
    text: `func (s *Server) handleRequest(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }
}`,
    difficulty: "medium" as const,
    category: "go",
    language: "go",
    charCount: 186,
  },
  {
    id: "rust-iter-1",
    text: `impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        self.count += 1;
        if self.count < 6 {
            Some(self.count)
        } else {
            None
        }
    }
}`,
    difficulty: "medium" as const,
    category: "rust",
    language: "rust",
    charCount: 195,
  },
  {
    id: "ts-component-1",
    text: `export function Button({ onClick, children }: ButtonProps) {
  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded"
      onClick={onClick}
    >
      {children}
    </button>
  );
}`,
    difficulty: "easy" as const,
    category: "typescript",
    language: "tsx",
    charCount: 203,
  },
  {
    id: "ts-hook-1",
    text: `export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
    difficulty: "hard" as const,
    category: "typescript",
    language: "typescript",
    charCount: 345,
  },
];

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function generateLinkCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code.slice(0, 3) + "-" + code.slice(3);
}

function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "tb8_";
  for (let i = 0; i < 32; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

// ═══════════════════════════════════════════════════════════════════
// AUTH: INIT LINK CODE
// ═══════════════════════════════════════════════════════════════════

/**
 * Initialize a link code for connecting Claude plugin to TypeBit8 account.
 * Called from the plugin when user wants to link their account.
 */
export const initAuthLink = mutation({
  args: {},
  handler: async (ctx) => {
    const linkCode = generateLinkCode();
    const expiresAt = Date.now() + LINK_CODE_EXPIRY_MS;

    // Store the pending link
    await ctx.db.insert("pluginLinkCodes", {
      linkCode,
      expiresAt,
      claimed: false,
      createdAt: Date.now(),
    });

    return {
      linkCode,
      expiresAt,
      linkUrl: `https://typebit8.com/link-claude?code=${linkCode}`,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════
// AUTH: CLAIM LINK CODE (called from web when user enters code)
// ═══════════════════════════════════════════════════════════════════

/**
 * Claim a link code from the website.
 * Called when authenticated user enters the code on typebit8.com/link-claude
 */
export const claimLinkCode = mutation({
  args: {
    linkCode: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, { linkCode, clerkId }) => {
    // Find the pending link code
    const pendingLink = await ctx.db
      .query("pluginLinkCodes")
      .filter((q) => q.eq(q.field("linkCode"), linkCode))
      .first();

    if (!pendingLink) {
      return { success: false, error: "Invalid code" };
    }

    if (pendingLink.claimed) {
      return { success: false, error: "Code already used" };
    }

    if (pendingLink.expiresAt < Date.now()) {
      return { success: false, error: "Code expired" };
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Generate API key for the plugin
    const apiKey = generateApiKey();

    // Create plugin API key record
    await ctx.db.insert("pluginApiKeys", {
      userId: user._id,
      clerkId,
      apiKey,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      isActive: true,
    });

    // Mark link code as claimed
    await ctx.db.patch(pendingLink._id, {
      claimed: true,
      claimedAt: Date.now(),
      claimedByClerkId: clerkId,
    });

    return {
      success: true,
      apiKey,
      email: user.email,
      userId: user._id,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════
// AUTH: VERIFY LINK CODE (polled from plugin)
// ═══════════════════════════════════════════════════════════════════

/**
 * Verify if a link code has been claimed.
 * Polled by the plugin to check if user has completed linking.
 */
export const verifyLinkCode = query({
  args: {
    linkCode: v.string(),
  },
  handler: async (ctx, { linkCode }) => {
    const pendingLink = await ctx.db
      .query("pluginLinkCodes")
      .filter((q) => q.eq(q.field("linkCode"), linkCode))
      .first();

    if (!pendingLink) {
      return { success: false, error: "Invalid code" };
    }

    if (!pendingLink.claimed) {
      return { success: false, pending: true };
    }

    // Get the API key for this claim
    const apiKeyRecord = await ctx.db
      .query("pluginApiKeys")
      .filter((q) => q.eq(q.field("clerkId"), pendingLink.claimedByClerkId))
      .order("desc")
      .first();

    if (!apiKeyRecord) {
      return { success: false, error: "API key not found" };
    }

    // Get user info
    const user = await ctx.db.get(apiKeyRecord.userId);

    return {
      success: true,
      apiKey: apiKeyRecord.apiKey,
      email: user?.email,
      userId: apiKeyRecord.userId,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════
// PREMIUM STATUS CHECK
// ═══════════════════════════════════════════════════════════════════

/**
 * Check if a user has premium access (for terminal mode).
 */
export const checkPremiumByApiKey = query({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, { apiKey }) => {
    const apiKeyRecord = await ctx.db
      .query("pluginApiKeys")
      .filter((q) => q.eq(q.field("apiKey"), apiKey))
      .first();

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      return { isPremium: false, error: "Invalid API key" };
    }

    const user = await ctx.db.get(apiKeyRecord.userId);
    if (!user) {
      return { isPremium: false, error: "User not found" };
    }

    const isPremium = user.isPremium === true &&
      (!user.premiumExpiresAt || user.premiumExpiresAt > Date.now());

    return {
      isPremium,
      plan: isPremium ? "premium" : "free",
      expiresAt: user.premiumExpiresAt,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════
// GET SNIPPET
// ═══════════════════════════════════════════════════════════════════

/**
 * Get a typing snippet for practice.
 */
export const getSnippet = query({
  args: {
    duration: v.optional(v.number()),
    type: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (_ctx, { duration = 60, type: _type = "code", language }) => {
    // Filter snippets by language if specified
    let filtered = CODE_SNIPPETS;
    if (language) {
      filtered = CODE_SNIPPETS.filter((s) => s.language === language);
    }

    // If no matches, use all snippets
    if (filtered.length === 0) {
      filtered = CODE_SNIPPETS;
    }

    // Select appropriate snippet based on duration
    // Shorter durations = shorter snippets
    if (duration <= 30) {
      filtered = filtered.filter((s) => s.charCount < 150);
    } else if (duration <= 60) {
      filtered = filtered.filter((s) => s.charCount < 250);
    }

    // Fallback if filtering removed all options
    if (filtered.length === 0) {
      filtered = CODE_SNIPPETS;
    }

    // Random selection
    const snippet = filtered[Math.floor(Math.random() * filtered.length)];

    return {
      id: snippet.id,
      text: snippet.text,
      difficulty: snippet.difficulty,
      category: snippet.category,
      language: snippet.language,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════
// SUBMIT RESULT
// ═══════════════════════════════════════════════════════════════════

/**
 * Submit a typing test result from the plugin.
 */
export const submitResult = mutation({
  args: {
    apiKey: v.string(),
    snippetId: v.string(),
    wpm: v.number(),
    accuracy: v.number(),
    duration: v.number(),
    characters: v.number(),
    errors: v.number(),
  },
  handler: async (ctx, { apiKey, snippetId, wpm, accuracy, duration, characters, errors }) => {
    // Validate API key
    const apiKeyRecord = await ctx.db
      .query("pluginApiKeys")
      .filter((q) => q.eq(q.field("apiKey"), apiKey))
      .first();

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      return { saved: false, error: "Invalid API key" };
    }

    // Update last used
    await ctx.db.patch(apiKeyRecord._id, {
      lastUsedAt: Date.now(),
    });

    // Save the result
    await ctx.db.insert("pluginTestResults", {
      userId: apiKeyRecord.userId,
      snippetId,
      wpm,
      accuracy,
      duration,
      characters,
      errors,
      source: "claude-plugin",
      createdAt: Date.now(),
    });

    // Get updated stats
    const allResults = await ctx.db
      .query("pluginTestResults")
      .filter((q) => q.eq(q.field("userId"), apiKeyRecord.userId))
      .collect();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const todayResults = allResults.filter((r) => r.createdAt >= todayStart);
    const weekResults = allResults.filter((r) => r.createdAt >= weekAgo);

    const todayWpm = todayResults.length > 0
      ? Math.round(todayResults.reduce((sum, r) => sum + r.wpm, 0) / todayResults.length)
      : null;

    const weekAvg = weekResults.length > 0
      ? Math.round(weekResults.reduce((sum, r) => sum + r.wpm, 0) / weekResults.length)
      : null;

    const allTimeBest = allResults.length > 0
      ? Math.max(...allResults.map((r) => r.wpm))
      : null;

    return {
      saved: true,
      stats: {
        todayWpm,
        weekAvg,
        allTimeBest,
        testsCompleted: allResults.length,
      },
    };
  },
});

// ═══════════════════════════════════════════════════════════════════
// GET STATS
// ═══════════════════════════════════════════════════════════════════

/**
 * Get user's typing statistics from plugin tests.
 */
export const getStats = query({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, { apiKey }) => {
    const apiKeyRecord = await ctx.db
      .query("pluginApiKeys")
      .filter((q) => q.eq(q.field("apiKey"), apiKey))
      .first();

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      return { error: "Invalid API key" };
    }

    const allResults = await ctx.db
      .query("pluginTestResults")
      .filter((q) => q.eq(q.field("userId"), apiKeyRecord.userId))
      .collect();

    if (allResults.length === 0) {
      return {
        todayWpm: null,
        weekAvg: null,
        allTimeBest: null,
        testsCompleted: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const todayResults = allResults.filter((r) => r.createdAt >= todayStart);
    const weekResults = allResults.filter((r) => r.createdAt >= weekAgo);

    const todayWpm = todayResults.length > 0
      ? Math.round(todayResults.reduce((sum, r) => sum + r.wpm, 0) / todayResults.length)
      : null;

    const weekAvg = weekResults.length > 0
      ? Math.round(weekResults.reduce((sum, r) => sum + r.wpm, 0) / weekResults.length)
      : null;

    const allTimeBest = Math.max(...allResults.map((r) => r.wpm));

    return {
      todayWpm,
      weekAvg,
      allTimeBest,
      testsCompleted: allResults.length,
    };
  },
});
