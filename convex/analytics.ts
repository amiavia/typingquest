/**
 * Daily Analytics Report Action
 *
 * Fetches GA4 data and sends a condensed WhatsApp report.
 * Triggered by Convex cron job daily at 8:00 AM Zurich time.
 *
 * Environment Variables Required:
 * - GA4_PROPERTY_ID: Google Analytics 4 property ID (e.g., "487654293")
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email for GA4 API
 * - GOOGLE_PRIVATE_KEY: Service account private key (PEM format)
 * - REPORT_RECIPIENT: Phone number to receive reports (e.g., "+41791381038")
 */

// Declare process.env for TypeScript (Convex runtime provides this)
declare const process: { env: Record<string, string | undefined> };

import { action, internalAction } from "./_generated/server";

// WhatsApp Bridge (same as HITL in draiv-monorepo)
const WHATSAPP_BRIDGE_URL = "https://preprod.draiv.ch/whatsapp-proxy/send";

/**
 * Generate a JWT for Google Service Account authentication
 */
async function generateGoogleJWT(
  email: string,
  privateKey: string,
  scope: string
): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: email,
    scope: scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600, // 1 hour
  };

  const base64Header = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  const base64Payload = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const signatureInput = `${base64Header}.${base64Payload}`;

  // Import the private key and sign
  const pemContents = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${signatureInput}.${base64Signature}`;
}

/**
 * Exchange JWT for Google OAuth2 access token
 */
async function getGoogleAccessToken(
  email: string,
  privateKey: string
): Promise<string> {
  const jwt = await generateGoogleJWT(
    email,
    privateKey,
    "https://www.googleapis.com/auth/analytics.readonly"
  );

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${await response.text()}`);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

/**
 * Fetch daily metrics from GA4
 */
async function fetchGA4Metrics(
  propertyId: string,
  accessToken: string,
  date?: string
): Promise<{
  date: string;
  visitors: number;
  sessions: number;
  pageviews: number;
  newUsers: number;
  avgSessionDuration: number;
  bounceRate: number;
}> {
  const targetDate = date || new Date().toISOString().split("T")[0];

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: targetDate, endDate: targetDate }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "newUsers" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`GA4 API error: ${await response.text()}`);
  }

  const data = await response.json() as { rows?: Array<{ metricValues?: Array<{ value?: string }> }> };
  const row = data.rows?.[0]?.metricValues || [];

  return {
    date: targetDate,
    visitors: parseInt(row[0]?.value || "0"),
    sessions: parseInt(row[1]?.value || "0"),
    pageviews: parseInt(row[2]?.value || "0"),
    newUsers: parseInt(row[3]?.value || "0"),
    avgSessionDuration: parseFloat(row[4]?.value || "0"),
    bounceRate: parseFloat(row[5]?.value || "0") * 100,
  };
}

/**
 * Fetch weekly comparison from GA4
 */
async function fetchGA4WeeklyComparison(
  propertyId: string,
  accessToken: string
): Promise<{
  thisWeek: { users: number; sessions: number; newUsers: number };
  lastWeek: { users: number; sessions: number; newUsers: number };
  change: { users: number; sessions: number; newUsers: number };
}> {
  const today = new Date();
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - 6);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [
          { startDate: formatDate(thisWeekStart), endDate: formatDate(today) },
          { startDate: formatDate(lastWeekStart), endDate: formatDate(lastWeekEnd) },
        ],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "newUsers" },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`GA4 API error: ${await response.text()}`);
  }

  const data = await response.json() as { rows?: Array<{ metricValues?: Array<{ value?: string }> }> };
  const rows = data.rows || [];

  const thisWeek = {
    users: parseInt(rows[0]?.metricValues?.[0]?.value || "0"),
    sessions: parseInt(rows[0]?.metricValues?.[1]?.value || "0"),
    newUsers: parseInt(rows[0]?.metricValues?.[2]?.value || "0"),
  };

  const lastWeek = {
    users: parseInt(rows[0]?.metricValues?.[3]?.value || "0"),
    sessions: parseInt(rows[0]?.metricValues?.[4]?.value || "0"),
    newUsers: parseInt(rows[0]?.metricValues?.[5]?.value || "0"),
  };

  const calcChange = (current: number, previous: number) =>
    previous > 0 ? ((current - previous) / previous) * 100 : 0;

  return {
    thisWeek,
    lastWeek,
    change: {
      users: calcChange(thisWeek.users, lastWeek.users),
      sessions: calcChange(thisWeek.sessions, lastWeek.sessions),
      newUsers: calcChange(thisWeek.newUsers, lastWeek.newUsers),
    },
  };
}

/**
 * Format metrics into a WhatsApp report
 */
function formatReport(
  metrics: Awaited<ReturnType<typeof fetchGA4Metrics>>,
  weekly?: Awaited<ReturnType<typeof fetchGA4WeeklyComparison>>
): string {
  const durationMins = Math.floor(metrics.avgSessionDuration / 60);
  const durationSecs = Math.floor(metrics.avgSessionDuration % 60);

  const trend = (val: number) => (val > 10 ? "+" : val < -10 ? "-" : "~");

  let report = `*typebit8 Daily Report*
_${metrics.date}_

*Traffic*
- Visitors: ${metrics.visitors.toLocaleString()}
- Sessions: ${metrics.sessions.toLocaleString()}
- Pageviews: ${metrics.pageviews.toLocaleString()}
- New Users: ${metrics.newUsers.toLocaleString()}

*Engagement*
- Avg Duration: ${durationMins}m ${durationSecs}s
- Bounce Rate: ${metrics.bounceRate.toFixed(1)}%`;

  if (weekly) {
    report += `

*Week over Week*
- Users: ${trend(weekly.change.users)}${weekly.change.users >= 0 ? "+" : ""}${weekly.change.users.toFixed(1)}%
- Sessions: ${trend(weekly.change.sessions)}${weekly.change.sessions >= 0 ? "+" : ""}${weekly.change.sessions.toFixed(1)}%
- New Users: ${trend(weekly.change.newUsers)}${weekly.change.newUsers >= 0 ? "+" : ""}${weekly.change.newUsers.toFixed(1)}%`;
  }

  return report;
}

/**
 * Send WhatsApp message via bridge
 */
async function sendWhatsApp(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const recipient = phone.replace("+", "").replace(/\s/g, "");

  try {
    const response = await fetch(WHATSAPP_BRIDGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient, message }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: await response.text() };
    }
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

/**
 * Main action: Send daily analytics report via WhatsApp
 * Called by cron job daily
 */
export const sendDailyReport = internalAction({
  args: {},
  handler: async (): Promise<{
    success: boolean;
    error?: string;
    date?: string;
  }> => {
    try {
      // Get environment variables
      const propertyId = process.env.GA4_PROPERTY_ID;
      const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
      const recipient = process.env.REPORT_RECIPIENT || "+41791381038";

      if (!propertyId || !serviceEmail || !privateKey) {
        return {
          success: false,
          error: "Missing required environment variables (GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY)",
        };
      }

      // Get Google access token
      console.log("Getting Google access token...");
      const accessToken = await getGoogleAccessToken(serviceEmail, privateKey);

      // Fetch metrics
      console.log("Fetching GA4 metrics...");
      const dailyMetrics = await fetchGA4Metrics(propertyId, accessToken);
      const weeklyComparison = await fetchGA4WeeklyComparison(propertyId, accessToken);

      // Format report
      const report = formatReport(dailyMetrics, weeklyComparison);
      console.log("Report generated:", report);

      // Send via WhatsApp
      console.log(`Sending to ${recipient}...`);
      const result = await sendWhatsApp(recipient, report);

      if (result.success) {
        console.log("Report sent successfully");
        return { success: true, date: dailyMetrics.date };
      } else {
        console.error("Failed to send:", result.error);
        return { success: false, error: result.error };
      }
    } catch (e) {
      console.error("Error in sendDailyReport:", e);
      return { success: false, error: String(e) };
    }
  },
});

/**
 * Public action for manual trigger (e.g., from dashboard or HTTP endpoint)
 */
export const triggerDailyReport = action({
  args: {},
  handler: async (): Promise<{
    success: boolean;
    error?: string;
    date?: string;
  }> => {
    try {
      const propertyId = process.env.GA4_PROPERTY_ID;
      const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
      const recipient = process.env.REPORT_RECIPIENT || "+41791381038";

      if (!propertyId || !serviceEmail || !privateKey) {
        return {
          success: false,
          error: "Missing required environment variables",
        };
      }

      const accessToken = await getGoogleAccessToken(serviceEmail, privateKey);
      const dailyMetrics = await fetchGA4Metrics(propertyId, accessToken);
      const weeklyComparison = await fetchGA4WeeklyComparison(propertyId, accessToken);
      const report = formatReport(dailyMetrics, weeklyComparison);

      const result = await sendWhatsApp(recipient, report);

      return result.success
        ? { success: true, date: dailyMetrics.date }
        : { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: String(e) };
    }
  },
});

/**
 * Test action: Check configuration without sending
 */
export const testAnalyticsConfig = action({
  args: {},
  handler: async (): Promise<{
    ga4Configured: boolean;
    whatsappConfigured: boolean;
    recipient: string;
    error?: string;
  }> => {
    const propertyId = process.env.GA4_PROPERTY_ID;
    const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const recipient = process.env.REPORT_RECIPIENT || "+41791381038";

    return {
      ga4Configured: !!(propertyId && serviceEmail && privateKey),
      whatsappConfigured: true, // Bridge is hardcoded
      recipient,
      error: !propertyId
        ? "Missing GA4_PROPERTY_ID"
        : !serviceEmail
          ? "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL"
          : !privateKey
            ? "Missing GOOGLE_PRIVATE_KEY"
            : undefined,
    };
  },
});
