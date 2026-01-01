/**
 * PRP-046: Email System via Resend
 * PRP-051: New Year 2026 Promotion Emails
 *
 * Sends transactional emails for welcome, referral notifications, etc.
 * Uses Resend API for delivery.
 *
 * Environment Variables Required:
 * - RESEND_API_KEY: Resend API key
 */

declare const process: { env: Record<string, string | undefined> };

import { v } from "convex/values";
import { action, internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Resend API endpoint
const RESEND_API_URL = "https://api.resend.com/emails";

// Using typebit8.com domain (verified in Resend)
const FROM_EMAIL = "typebit8 <hello@typebit8.com>";
const REPLY_TO = "info@typebit8.com";

interface ResendResponse {
  id?: string;
  message?: string;
}

/**
 * Send email via Resend API
 */
async function sendViaResend(args: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("[Email] RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: args.to,
        reply_to: REPLY_TO,
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });

    const data = (await response.json()) as ResendResponse;

    if (response.ok && data.id) {
      console.log(`[Email] Sent successfully to ${args.to}, messageId: ${data.id}`);
      return { success: true, messageId: data.id };
    } else {
      console.error(`[Email] Failed to send to ${args.to}:`, data.message);
      return { success: false, error: data.message || "Unknown error" };
    }
  } catch (e) {
    console.error("[Email] Error sending:", e);
    return { success: false, error: String(e) };
  }
}

/**
 * Email template: Welcome after speed test
 */
function welcomeEmailTemplate(args: { wpm: number; accuracy: number }): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `🎮 Your typing speed: ${args.wpm} WPM — Let's improve it!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to typebit8</title>
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 2px solid #3bceac; padding: 30px;">
    <h1 style="color: #ffd93d; font-size: 24px; margin-bottom: 20px;">🎮 TYPEBIT8</h1>

    <p style="font-size: 16px; line-height: 1.6;">Your speed test results are in!</p>

    <div style="background-color: #0f0f23; border: 2px solid #ffd93d; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="font-size: 32px; color: #3bceac; margin: 0;">${args.wpm} WPM</p>
      <p style="font-size: 14px; color: #9a9ab0; margin: 5px 0 0 0;">Accuracy: ${args.accuracy}%</p>
    </div>

    <p style="font-size: 14px; line-height: 1.8;">
      Want to level up? Our gamified typing lessons can help you reach 80+ WPM while having fun!
    </p>

    <a href="https://typebit8.com?utm_source=email&utm_medium=welcome&utm_campaign=speed_test"
       style="display: inline-block; background-color: #3bceac; color: #0f0f23; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 20px 0;">
      START TRAINING →
    </a>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      You received this because you completed a speed test on typebit8.com<br>
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a>
    </p>
  </div>
</body>
</html>`;

  const text = `TYPEBIT8 - Your Speed Test Results

Your typing speed: ${args.wpm} WPM
Accuracy: ${args.accuracy}%

Want to level up? Our gamified typing lessons can help you reach 80+ WPM while having fun!

Start training: https://typebit8.com

---
You received this because you completed a speed test on typebit8.com`;

  return { subject, html, text };
}

/**
 * Email template: Referral reward notification
 */
function referralRewardTemplate(args: { creditAmount: number }): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `🎉 You earned ${args.creditAmount}% off — Your friend subscribed!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 2px solid #3bceac; padding: 30px;">
    <h1 style="color: #ffd93d; font-size: 24px; margin-bottom: 20px;">🎮 TYPEBIT8</h1>

    <p style="font-size: 18px; color: #3bceac; margin-bottom: 20px;">Great news!</p>

    <p style="font-size: 16px; line-height: 1.6;">
      A friend you referred just subscribed to typebit8 Premium!
    </p>

    <div style="background-color: #0f0f23; border: 2px solid #ffd93d; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="font-size: 32px; color: #ffd93d; margin: 0;">${args.creditAmount}% OFF</p>
      <p style="font-size: 14px; color: #9a9ab0; margin: 5px 0 0 0;">Applied to your next billing cycle</p>
    </div>

    <p style="font-size: 14px; line-height: 1.8;">
      Keep sharing your referral code to earn more rewards!
    </p>

    <a href="https://typebit8.com/premium?utm_source=email&utm_medium=referral&utm_campaign=reward"
       style="display: inline-block; background-color: #3bceac; color: #0f0f23; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 20px 0;">
      VIEW MY REFERRALS →
    </a>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a>
    </p>
  </div>
</body>
</html>`;

  const text = `TYPEBIT8 - Referral Reward!

Great news! A friend you referred just subscribed to typebit8 Premium!

You earned: ${args.creditAmount}% OFF
Applied to your next billing cycle

Keep sharing your referral code to earn more rewards!

View your referrals: https://typebit8.com/premium`;

  return { subject, html, text };
}

/**
 * Send welcome email after speed test
 */
export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    wpm: v.number(),
    accuracy: v.number(),
  },
  handler: async (ctx, args) => {
    const template = welcomeEmailTemplate({ wpm: args.wpm, accuracy: args.accuracy });
    const result = await sendViaResend({
      to: args.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    // Update lead record with email sent timestamp
    if (result.success) {
      await ctx.runMutation(internal.emails.updateLeadEmailSent, { email: args.email });
    }

    return result;
  },
});

/**
 * Send referral reward notification to referrer
 */
export const sendReferralRewardEmail = internalAction({
  args: {
    email: v.string(),
    creditAmount: v.number(),
  },
  handler: async (_, args) => {
    const template = referralRewardTemplate({ creditAmount: args.creditAmount });
    return sendViaResend({
      to: args.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },
});

/**
 * Public action to send welcome email (called from client)
 */
export const triggerWelcomeEmail = action({
  args: {
    email: v.string(),
    wpm: v.number(),
    accuracy: v.number(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    // Call the internal action
    return ctx.runAction(internal.emails.sendWelcomeEmail, args);
  },
});

/**
 * Internal mutation to update lead email sent timestamp
 */
export const updateLeadEmailSent = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (lead) {
      await ctx.db.patch(lead._id, {
        lastEmailSent: Date.now(),
      });
    }
  },
});

/**
 * Test email action (for debugging)
 */
export const testEmail = action({
  args: {
    email: v.string(),
  },
  handler: async (_, args) => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    return sendViaResend({
      to: args.email,
      subject: "🎮 typebit8 Email Test",
      html: `<h1>Email service is working!</h1><p>This is a test from typebit8.</p>`,
      text: "Email service is working! This is a test from typebit8.",
    });
  },
});

// ═══════════════════════════════════════════════════════════════════
// NURTURE EMAIL SEQUENCE
// ═══════════════════════════════════════════════════════════════════

/**
 * Nurture sequence schedule (days after signup)
 */
const NURTURE_SCHEDULE = [
  { step: 1, daysAfter: 2, template: "improve10wpm" },
  { step: 2, daysAfter: 5, template: "tenFingerTechnique" },
  { step: 3, daysAfter: 7, template: "readyToLevelUp" },
  { step: 4, daysAfter: 14, template: "specialOffer" },
  { step: 5, daysAfter: 21, template: "finalReminder" },
] as const;

/**
 * Email template: Day 2 - How to improve 10 WPM
 */
function improve10wpmTemplate(email: string): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `https://typebit8.com/unsubscribe?email=${encodeURIComponent(email)}`;
  const subject = "⌨️ How to improve 10 WPM in just 1 week";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 2px solid #3bceac; padding: 30px;">
    <h1 style="color: #ffd93d; font-size: 24px; margin-bottom: 20px;">🎮 TYPEBIT8</h1>

    <h2 style="color: #3bceac; font-size: 18px;">How to Improve 10 WPM in 1 Week</h2>

    <p style="font-size: 14px; line-height: 1.8;">
      Here's the secret: <strong style="color: #ffd93d;">consistency beats intensity</strong>.
    </p>

    <p style="font-size: 14px; line-height: 1.8;">
      15 minutes of daily practice is better than 2 hours once a week. Here's your 7-day plan:
    </p>

    <div style="background-color: #0f0f23; border: 2px solid #3bceac; padding: 20px; margin: 20px 0;">
      <p style="font-size: 12px; color: #3bceac; margin: 0 0 10px 0;"><strong>DAY 1-2:</strong> Home row only (ASDF JKL;)</p>
      <p style="font-size: 12px; color: #3bceac; margin: 0 0 10px 0;"><strong>DAY 3-4:</strong> Add top row (QWERTY)</p>
      <p style="font-size: 12px; color: #3bceac; margin: 0 0 10px 0;"><strong>DAY 5-6:</strong> Mix both rows</p>
      <p style="font-size: 12px; color: #3bceac; margin: 0;"><strong>DAY 7:</strong> Speed test yourself!</p>
    </div>

    <p style="font-size: 14px; line-height: 1.8;">
      <strong style="color: #ffd93d;">Pro tip:</strong> Focus on accuracy first. Speed naturally follows when you stop making mistakes.
    </p>

    <a href="https://typebit8.com/lessons?utm_source=email&utm_medium=nurture&utm_campaign=day2"
       style="display: inline-block; background-color: #3bceac; color: #0f0f23; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 20px 0;">
      START DAY 1 →
    </a>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a> •
      <a href="${unsubscribeUrl}" style="color: #3bceac;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

  const text = `TYPEBIT8 - How to Improve 10 WPM in 1 Week

Here's the secret: consistency beats intensity.

15 minutes of daily practice is better than 2 hours once a week.

7-DAY PLAN:
- Day 1-2: Home row only (ASDF JKL;)
- Day 3-4: Add top row (QWERTY)
- Day 5-6: Mix both rows
- Day 7: Speed test yourself!

Pro tip: Focus on accuracy first. Speed naturally follows.

Start Day 1: https://typebit8.com/lessons`;

  return { subject, html, text };
}

/**
 * Email template: Day 5 - The 10-finger technique
 */
function tenFingerTechniqueTemplate(email: string): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `https://typebit8.com/unsubscribe?email=${encodeURIComponent(email)}`;
  const subject = "🖐️ The 10-finger technique explained (with pictures)";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 2px solid #3bceac; padding: 30px;">
    <h1 style="color: #ffd93d; font-size: 24px; margin-bottom: 20px;">🎮 TYPEBIT8</h1>

    <h2 style="color: #3bceac; font-size: 18px;">The 10-Finger Technique</h2>

    <p style="font-size: 14px; line-height: 1.8;">
      Most people use 2-4 fingers and look at the keyboard. Touch typists use all 10 fingers and never look down.
    </p>

    <div style="background-color: #0f0f23; border: 2px solid #ffd93d; padding: 20px; margin: 20px 0;">
      <p style="font-size: 14px; color: #ffd93d; margin: 0 0 15px 0; text-align: center;"><strong>HOME ROW POSITION</strong></p>
      <p style="font-size: 12px; color: #eef5db; margin: 0; text-align: center; font-family: monospace;">
        Left hand: A S D F (pinky to index)<br>
        Right hand: J K L ; (index to pinky)<br><br>
        <span style="color: #3bceac;">Your index fingers rest on F and J</span><br>
        <span style="color: #9a9ab0;">(Feel the bumps? That's how you find home!)</span>
      </p>
    </div>

    <p style="font-size: 14px; line-height: 1.8;">
      <strong style="color: #ffd93d;">Each finger has assigned keys:</strong>
    </p>
    <ul style="font-size: 12px; line-height: 2; color: #eef5db;">
      <li>Pinkies: Q, A, Z and P, ;, /</li>
      <li>Ring fingers: W, S, X and O, L, .</li>
      <li>Middle fingers: E, D, C and I, K, ,</li>
      <li>Index fingers: R, T, F, G, V, B and Y, U, H, J, N, M</li>
      <li>Thumbs: Spacebar</li>
    </ul>

    <a href="https://typebit8.com/lessons?utm_source=email&utm_medium=nurture&utm_campaign=day5"
       style="display: inline-block; background-color: #3bceac; color: #0f0f23; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 20px 0;">
      PRACTICE HOME ROW →
    </a>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a> •
      <a href="${unsubscribeUrl}" style="color: #3bceac;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

  const text = `TYPEBIT8 - The 10-Finger Technique

Most people use 2-4 fingers. Touch typists use all 10.

HOME ROW POSITION:
- Left hand: A S D F (pinky to index)
- Right hand: J K L ; (index to pinky)
- Index fingers on F and J (feel the bumps!)

FINGER ASSIGNMENTS:
- Pinkies: Q, A, Z and P, ;, /
- Ring fingers: W, S, X and O, L, .
- Middle fingers: E, D, C and I, K, ,
- Index fingers: R, T, F, G, V, B and Y, U, H, J, N, M
- Thumbs: Spacebar

Practice: https://typebit8.com/lessons`;

  return { subject, html, text };
}

/**
 * Email template: Day 7 - Ready to level up?
 */
function readyToLevelUpTemplate(email: string): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `https://typebit8.com/unsubscribe?email=${encodeURIComponent(email)}`;
  const subject = "🚀 Ready to level up your typing?";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 2px solid #3bceac; padding: 30px;">
    <h1 style="color: #ffd93d; font-size: 24px; margin-bottom: 20px;">🎮 TYPEBIT8</h1>

    <h2 style="color: #3bceac; font-size: 18px;">One Week In — How's It Going?</h2>

    <p style="font-size: 14px; line-height: 1.8;">
      You've had a week to practice. Have you noticed any improvement?
    </p>

    <p style="font-size: 14px; line-height: 1.8;">
      Most people see <strong style="color: #ffd93d;">5-15 WPM improvement</strong> in the first week of focused practice.
    </p>

    <div style="background-color: #0f0f23; border: 2px solid #3bceac; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="font-size: 14px; color: #3bceac; margin: 0;">Take another speed test to see your progress!</p>
    </div>

    <a href="https://typebit8.com/speed-test?utm_source=email&utm_medium=nurture&utm_campaign=day7"
       style="display: inline-block; background-color: #ffd93d; color: #0f0f23; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 20px 0;">
      TEST MY SPEED →
    </a>

    <p style="font-size: 14px; line-height: 1.8;">
      Want to go further? Our <strong style="color: #3bceac;">Premium lessons</strong> cover:
    </p>
    <ul style="font-size: 12px; line-height: 2; color: #eef5db;">
      <li>Numbers & symbols mastery</li>
      <li>Programmer-specific patterns</li>
      <li>Advanced speed drills</li>
      <li>44 additional levels</li>
    </ul>

    <a href="https://typebit8.com/premium?utm_source=email&utm_medium=nurture&utm_campaign=day7"
       style="display: inline-block; background-color: #3bceac; color: #0f0f23; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 10px 0;">
      VIEW PREMIUM →
    </a>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a> •
      <a href="${unsubscribeUrl}" style="color: #3bceac;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

  const text = `TYPEBIT8 - One Week In

How's your typing practice going?

Most people see 5-15 WPM improvement in the first week.

Take a speed test to check your progress:
https://typebit8.com/speed-test

Want to go further? Premium includes:
- Numbers & symbols mastery
- Programmer-specific patterns
- Advanced speed drills
- 44 additional levels

View Premium: https://typebit8.com/premium`;

  return { subject, html, text };
}

/**
 * Email template: Day 14 - Special offer
 */
function specialOfferTemplate(email: string): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `https://typebit8.com/unsubscribe?email=${encodeURIComponent(email)}`;
  const subject = "🎁 Special offer: 20% off typebit8 Premium";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 2px solid #ffd93d; padding: 30px;">
    <h1 style="color: #ffd93d; font-size: 24px; margin-bottom: 20px;">🎮 TYPEBIT8</h1>

    <div style="background-color: #ffd93d; color: #0f0f23; padding: 15px; margin-bottom: 20px; text-align: center;">
      <p style="font-size: 18px; margin: 0; font-weight: bold;">SPECIAL OFFER: 20% OFF</p>
    </div>

    <p style="font-size: 14px; line-height: 1.8;">
      You've been practicing for two weeks now. Time to unlock the full experience!
    </p>

    <div style="background-color: #0f0f23; border: 2px solid #3bceac; padding: 20px; margin: 20px 0;">
      <p style="font-size: 16px; color: #3bceac; margin: 0 0 15px 0; text-align: center;"><strong>PREMIUM INCLUDES:</strong></p>
      <ul style="font-size: 12px; line-height: 2; color: #eef5db; margin: 0; padding-left: 20px;">
        <li>50 total lessons (44 more!)</li>
        <li>Numbers, symbols & shortcuts</li>
        <li>Programmer-specific drills</li>
        <li>Unlimited daily challenges</li>
        <li>Priority support</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 14px; color: #9a9ab0; margin: 0;">Use code at checkout:</p>
      <p style="font-size: 24px; color: #ffd93d; margin: 10px 0; font-weight: bold;">WELCOME20</p>
      <p style="font-size: 12px; color: #9a9ab0; margin: 0;">Expires in 7 days</p>
    </div>

    <a href="https://typebit8.com/premium?utm_source=email&utm_medium=nurture&utm_campaign=day14&code=WELCOME20"
       style="display: inline-block; background-color: #ffd93d; color: #0f0f23; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 20px 0; width: 100%; text-align: center; box-sizing: border-box;">
      CLAIM 20% OFF →
    </a>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a> •
      <a href="${unsubscribeUrl}" style="color: #3bceac;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

  const text = `TYPEBIT8 - Special Offer: 20% OFF

You've been practicing for two weeks. Time to unlock the full experience!

PREMIUM INCLUDES:
- 50 total lessons (44 more!)
- Numbers, symbols & shortcuts
- Programmer-specific drills
- Unlimited daily challenges
- Priority support

Use code: WELCOME20
(Expires in 7 days)

Claim 20% off: https://typebit8.com/premium`;

  return { subject, html, text };
}

/**
 * Email template: Day 21 - Final reminder
 */
function finalReminderTemplate(email: string): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `https://typebit8.com/unsubscribe?email=${encodeURIComponent(email)}`;
  const subject = "⏰ Last chance: Your typing journey awaits";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 2px solid #3bceac; padding: 30px;">
    <h1 style="color: #ffd93d; font-size: 24px; margin-bottom: 20px;">🎮 TYPEBIT8</h1>

    <h2 style="color: #3bceac; font-size: 18px;">Still thinking about it?</h2>

    <p style="font-size: 14px; line-height: 1.8;">
      It's been 3 weeks since you tested your typing speed. Are you still practicing?
    </p>

    <p style="font-size: 14px; line-height: 1.8;">
      <strong style="color: #ffd93d;">Here's the thing:</strong> typing is a skill you use every single day. An extra 20 WPM saves you hours over a year.
    </p>

    <div style="background-color: #0f0f23; border: 2px solid #ffd93d; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="font-size: 14px; color: #ffd93d; margin: 0;">At 40 WPM → At 60 WPM</p>
      <p style="font-size: 24px; color: #3bceac; margin: 10px 0;">50% faster</p>
      <p style="font-size: 12px; color: #9a9ab0; margin: 0;">That's 2+ hours saved per week</p>
    </div>

    <p style="font-size: 14px; line-height: 1.8;">
      This is our last email unless you come back. But we'll be here when you're ready.
    </p>

    <a href="https://typebit8.com?utm_source=email&utm_medium=nurture&utm_campaign=day21"
       style="display: inline-block; background-color: #3bceac; color: #0f0f23; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 20px 0;">
      CONTINUE PRACTICING →
    </a>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      This is the final email in our welcome series.<br>
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a> •
      <a href="${unsubscribeUrl}" style="color: #3bceac;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

  const text = `TYPEBIT8 - Last Chance

It's been 3 weeks since you tested your typing speed.

Here's the thing: typing is a skill you use every day.
An extra 20 WPM saves you hours over a year.

At 40 WPM → At 60 WPM = 50% faster
That's 2+ hours saved per week

This is our last email. But we'll be here when you're ready.

Continue practicing: https://typebit8.com`;

  return { subject, html, text };
}

/**
 * Get nurture template by step number
 */
function getNurtureTemplate(step: number, email: string): { subject: string; html: string; text: string } | null {
  switch (step) {
    case 1:
      return improve10wpmTemplate(email);
    case 2:
      return tenFingerTechniqueTemplate(email);
    case 3:
      return readyToLevelUpTemplate(email);
    case 4:
      return specialOfferTemplate(email);
    case 5:
      return finalReminderTemplate(email);
    default:
      return null;
  }
}

/**
 * Send nurture email to a lead
 */
export const sendNurtureEmail = internalAction({
  args: {
    email: v.string(),
    step: v.number(),
  },
  handler: async (ctx, args) => {
    const template = getNurtureTemplate(args.step, args.email);
    if (!template) {
      return { success: false, error: `Invalid nurture step: ${args.step}` };
    }

    const result = await sendViaResend({
      to: args.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (result.success) {
      await ctx.runMutation(internal.emails.updateLeadNurtureStep, {
        email: args.email,
        step: args.step,
      });
    }

    return result;
  },
});

/**
 * Update lead nurture step
 */
export const updateLeadNurtureStep = internalMutation({
  args: {
    email: v.string(),
    step: v.number(),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (lead) {
      await ctx.db.patch(lead._id, {
        emailSequenceStep: args.step,
        lastEmailSent: Date.now(),
      });
    }
  },
});

/**
 * Process nurture queue - called by cron job
 * Sends next nurture email to leads who are due
 */
export const processNurtureQueue = internalAction({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.runQuery(internal.emails.getLeadsDueForNurture, {});

    let sent = 0;
    let errors = 0;

    for (const lead of leads) {
      const nextStep = (lead.emailSequenceStep ?? 0) + 1;
      const schedule = NURTURE_SCHEDULE.find((s) => s.step === nextStep);

      if (!schedule) continue;

      // Check if enough days have passed
      const daysSinceCreated = Math.floor(
        (Date.now() - lead.createdAt) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceCreated >= schedule.daysAfter) {
        const result = await ctx.runAction(internal.emails.sendNurtureEmail, {
          email: lead.email,
          step: nextStep,
        });

        if (result.success) {
          sent++;
        } else {
          errors++;
          console.error(`[Nurture] Failed to send to ${lead.email}:`, result.error);
        }
      }
    }

    console.log(`[Nurture] Processed: ${sent} sent, ${errors} errors`);
    return { sent, errors };
  },
});

/**
 * Query to get leads due for nurture emails
 */
import { internalQuery } from "./_generated/server";

export const getLeadsDueForNurture = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Get leads who:
    // - Have marketing consent
    // - Haven't converted to users
    // - Haven't unsubscribed
    // - Haven't completed the nurture sequence (step < 5)
    const leads = await ctx.db
      .query("leads")
      .filter((q) =>
        q.and(
          q.eq(q.field("marketingConsent"), true),
          q.eq(q.field("convertedToUser"), false),
          q.neq(q.field("unsubscribed"), true)
        )
      )
      .collect();

    // Filter to those who haven't completed sequence
    return leads.filter((lead) => (lead.emailSequenceStep ?? 0) < 5);
  },
});

// ═══════════════════════════════════════════════════════════════════
// PRP-051: NEW YEAR 2026 PROMOTION EMAILS
// ═══════════════════════════════════════════════════════════════════

const NEW_YEAR_PROMO_CODE = "NEWYEAR26";
const NEW_YEAR_PROMO_END = "January 14, 2026";

/**
 * Email template: New Year Launch (Jan 1)
 */
function newYearLaunchTemplate(email: string): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `https://typebit8.com/unsubscribe?email=${encodeURIComponent(email)}`;
  const subject = "🎉 2026 Deal: 50% Off TypeBit8 Premium";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 2px solid #ffd93d; padding: 30px;">
    <h1 style="color: #ffd93d; font-size: 24px; margin-bottom: 20px; text-align: center;">🎉 HAPPY NEW YEAR! 🎉</h1>

    <div style="background-color: #ffd93d; color: #0f0f23; padding: 20px; margin-bottom: 20px; text-align: center;">
      <p style="font-size: 24px; margin: 0; font-weight: bold;">50% OFF PREMIUM</p>
      <p style="font-size: 14px; margin: 10px 0 0 0;">New Year Sale • Ends ${NEW_YEAR_PROMO_END}</p>
    </div>

    <p style="font-size: 14px; line-height: 1.8;">
      Start 2026 with a superpower: <strong style="color: #3bceac;">touch typing</strong>.
    </p>

    <p style="font-size: 14px; line-height: 1.8;">
      While everyone else is hunt-and-pecking their ChatGPT prompts, you could be typing at <strong style="color: #ffd93d;">80+ WPM</strong> — literally 2x faster.
    </p>

    <div style="background-color: #0f0f23; border: 2px solid #3bceac; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="font-size: 14px; color: #9a9ab0; margin: 0 0 10px 0;">Use code at checkout:</p>
      <p style="font-size: 32px; color: #3bceac; margin: 0; font-weight: bold;">${NEW_YEAR_PROMO_CODE}</p>
      <p style="font-size: 12px; color: #ffd93d; margin: 10px 0 0 0;">Yearly: $39.99 → $19.99</p>
    </div>

    <a href="https://typebit8.com/premium?utm_source=email&utm_medium=promo&utm_campaign=newyear2025_launch"
       style="display: inline-block; background-color: #ffd93d; color: #0f0f23; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 20px 0; width: 100%; text-align: center; box-sizing: border-box;">
      CLAIM 50% OFF →
    </a>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a> •
      <a href="${unsubscribeUrl}" style="color: #3bceac;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

  const text = `🎉 HAPPY NEW YEAR FROM TYPEBIT8!

50% OFF PREMIUM
New Year Sale • Ends ${NEW_YEAR_PROMO_END}

Start 2026 with a superpower: touch typing.

Use code: ${NEW_YEAR_PROMO_CODE}
Yearly: $39.99 → $19.99

Claim 50% off: https://typebit8.com/premium`;

  return { subject, html, text };
}

/**
 * Email template: Value proposition (Jan 4)
 */
function newYearValueTemplate(email: string): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `https://typebit8.com/unsubscribe?email=${encodeURIComponent(email)}`;
  const subject = "⌨️ The one skill that will 2x your AI output in 2026";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 2px solid #3bceac; padding: 30px;">
    <h1 style="color: #ffd93d; font-size: 24px; margin-bottom: 20px;">🎮 TYPEBIT8</h1>

    <h2 style="color: #3bceac; font-size: 18px;">The Math Is Simple</h2>

    <p style="font-size: 14px; line-height: 1.8;">
      You type prompts to ChatGPT, Claude, and Copilot every day. But here's what most people don't realize:
    </p>

    <div style="background-color: #0f0f23; border: 2px solid #ffd93d; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="font-size: 14px; color: #9a9ab0; margin: 0;">40 WPM → 80 WPM =</p>
      <p style="font-size: 32px; color: #ffd93d; margin: 10px 0;">2X FASTER</p>
      <p style="font-size: 12px; color: #3bceac; margin: 0;">at communicating with AI</p>
    </div>

    <p style="font-size: 14px; line-height: 1.8;">
      Your <strong style="color: #ffd93d;">typing speed is your bottleneck</strong>. Every prompt, every refinement, every follow-up — faster typing means faster results.
    </p>

    <p style="font-size: 14px; line-height: 1.8;">
      In 2026, the people who win are the ones who can <strong style="color: #3bceac;">think at the speed they type</strong>.
    </p>

    <div style="background-color: #0f0f23; border: 2px solid #3bceac; padding: 15px; margin: 20px 0; text-align: center;">
      <p style="font-size: 12px; color: #9a9ab0; margin: 0;">New Year Sale: 50% OFF with code</p>
      <p style="font-size: 18px; color: #3bceac; margin: 5px 0; font-weight: bold;">${NEW_YEAR_PROMO_CODE}</p>
    </div>

    <a href="https://typebit8.com/premium?utm_source=email&utm_medium=promo&utm_campaign=newyear2025_value"
       style="display: inline-block; background-color: #3bceac; color: #0f0f23; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 20px 0;">
      START TYPING FASTER →
    </a>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a> •
      <a href="${unsubscribeUrl}" style="color: #3bceac;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

  const text = `THE MATH IS SIMPLE

You type prompts to ChatGPT and Claude every day.

40 WPM → 80 WPM = 2X FASTER at communicating with AI

Your typing speed is your bottleneck.

New Year Sale: 50% OFF with code ${NEW_YEAR_PROMO_CODE}

Start typing faster: https://typebit8.com/premium`;

  return { subject, html, text };
}

/**
 * Email template: 1 Week Left (Jan 7)
 */
function newYearWeekLeftTemplate(email: string): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `https://typebit8.com/unsubscribe?email=${encodeURIComponent(email)}`;
  const subject = "⏰ 1 Week Left: 50% Off Premium";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 2px solid #ff6b9d; padding: 30px;">
    <h1 style="color: #ffd93d; font-size: 24px; margin-bottom: 20px;">🎮 TYPEBIT8</h1>

    <div style="background-color: #ff6b9d; color: #0f0f23; padding: 15px; margin-bottom: 20px; text-align: center;">
      <p style="font-size: 18px; margin: 0; font-weight: bold;">⏰ 1 WEEK LEFT</p>
    </div>

    <p style="font-size: 14px; line-height: 1.8;">
      The New Year sale ends on <strong style="color: #ffd93d;">${NEW_YEAR_PROMO_END}</strong>.
    </p>

    <p style="font-size: 14px; line-height: 1.8;">
      After that, Premium goes back to full price. This is your chance to lock in 50% off for the entire year.
    </p>

    <div style="background-color: #0f0f23; border: 2px solid #ffd93d; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="font-size: 14px; color: #9a9ab0; margin: 0 0 5px 0; text-decoration: line-through;">$39.99/year</p>
      <p style="font-size: 32px; color: #0ead69; margin: 0;">$19.99/year</p>
      <p style="font-size: 12px; color: #ff6b9d; margin: 10px 0 0 0;">Code: ${NEW_YEAR_PROMO_CODE}</p>
    </div>

    <a href="https://typebit8.com/premium?utm_source=email&utm_medium=promo&utm_campaign=newyear2025_week"
       style="display: inline-block; background-color: #ffd93d; color: #0f0f23; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 20px 0; width: 100%; text-align: center; box-sizing: border-box;">
      CLAIM 50% OFF →
    </a>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a> •
      <a href="${unsubscribeUrl}" style="color: #3bceac;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

  const text = `⏰ 1 WEEK LEFT

The New Year sale ends on ${NEW_YEAR_PROMO_END}.

$39.99/year → $19.99/year
Code: ${NEW_YEAR_PROMO_CODE}

Claim 50% off: https://typebit8.com/premium`;

  return { subject, html, text };
}

/**
 * Email template: 3 Days Left (Jan 11)
 */
function newYear3DaysTemplate(email: string): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `https://typebit8.com/unsubscribe?email=${encodeURIComponent(email)}`;
  const subject = "⚡ 3 Days Left to Save 50%";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 2px solid #f97316; padding: 30px;">
    <h1 style="color: #ffd93d; font-size: 24px; margin-bottom: 20px;">🎮 TYPEBIT8</h1>

    <div style="background-color: #f97316; color: #0f0f23; padding: 20px; margin-bottom: 20px; text-align: center;">
      <p style="font-size: 24px; margin: 0; font-weight: bold;">3 DAYS LEFT</p>
      <p style="font-size: 12px; margin: 5px 0 0 0;">Sale ends ${NEW_YEAR_PROMO_END} at midnight</p>
    </div>

    <p style="font-size: 14px; line-height: 1.8;">
      This is it. 72 hours until the 50% discount disappears.
    </p>

    <p style="font-size: 14px; line-height: 1.8;">
      <strong style="color: #ffd93d;">What you get with Premium:</strong>
    </p>

    <ul style="font-size: 12px; line-height: 2; color: #3bceac; margin: 15px 0;">
      <li>50 total lessons (44 premium-exclusive)</li>
      <li>AI prompt typing practice</li>
      <li>Developer & business themes</li>
      <li>2X coin earnings</li>
      <li>Monthly streak freezes</li>
    </ul>

    <div style="background-color: #0f0f23; border: 2px solid #0ead69; padding: 15px; margin: 20px 0; text-align: center;">
      <p style="font-size: 24px; color: #0ead69; margin: 0; font-weight: bold;">$19.99/year</p>
      <p style="font-size: 12px; color: #9a9ab0; margin: 5px 0 0 0;">That's $1.67/month</p>
    </div>

    <a href="https://typebit8.com/premium?utm_source=email&utm_medium=promo&utm_campaign=newyear2025_3days"
       style="display: inline-block; background-color: #f97316; color: #0f0f23; padding: 15px 30px; text-decoration: none; font-weight: bold; margin: 20px 0; width: 100%; text-align: center; box-sizing: border-box;">
      GET 50% OFF NOW →
    </a>

    <p style="font-size: 10px; color: #9a9ab0; text-align: center; margin-top: 15px;">
      Code: ${NEW_YEAR_PROMO_CODE}
    </p>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a> •
      <a href="${unsubscribeUrl}" style="color: #3bceac;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

  const text = `⚡ 3 DAYS LEFT

Sale ends ${NEW_YEAR_PROMO_END} at midnight.

WHAT YOU GET WITH PREMIUM:
- 50 total lessons (44 premium-exclusive)
- AI prompt typing practice
- Developer & business themes
- 2X coin earnings
- Monthly streak freezes

$19.99/year (that's $1.67/month)
Code: ${NEW_YEAR_PROMO_CODE}

Get 50% off: https://typebit8.com/premium`;

  return { subject, html, text };
}

/**
 * Email template: Last Day (Jan 13)
 */
function newYearLastDayTemplate(email: string): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `https://typebit8.com/unsubscribe?email=${encodeURIComponent(email)}`;
  const subject = "⚠️ LAST DAY: 50% Off Ends Tomorrow";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 3px solid #e63946; padding: 30px;">
    <h1 style="color: #ffd93d; font-size: 24px; margin-bottom: 20px;">🎮 TYPEBIT8</h1>

    <div style="background-color: #e63946; color: #eef5db; padding: 20px; margin-bottom: 20px; text-align: center;">
      <p style="font-size: 24px; margin: 0; font-weight: bold;">⚠️ LAST DAY</p>
      <p style="font-size: 14px; margin: 5px 0 0 0;">Sale ends tomorrow at midnight</p>
    </div>

    <p style="font-size: 16px; line-height: 1.8; text-align: center;">
      After tomorrow, this deal is <strong style="color: #e63946;">gone</strong>.
    </p>

    <div style="background-color: #0f0f23; border: 2px solid #ffd93d; padding: 25px; margin: 25px 0; text-align: center;">
      <p style="font-size: 18px; color: #9a9ab0; margin: 0 0 10px 0; text-decoration: line-through;">$39.99/year</p>
      <p style="font-size: 48px; color: #0ead69; margin: 0; font-weight: bold;">$19.99</p>
      <p style="font-size: 14px; color: #ffd93d; margin: 10px 0 0 0;">Code: ${NEW_YEAR_PROMO_CODE}</p>
    </div>

    <a href="https://typebit8.com/premium?utm_source=email&utm_medium=promo&utm_campaign=newyear2025_lastday"
       style="display: inline-block; background-color: #e63946; color: #eef5db; padding: 20px 30px; text-decoration: none; font-weight: bold; margin: 20px 0; width: 100%; text-align: center; box-sizing: border-box; font-size: 16px;">
      CLAIM 50% OFF BEFORE IT'S GONE →
    </a>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a> •
      <a href="${unsubscribeUrl}" style="color: #3bceac;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

  const text = `⚠️ LAST DAY - SALE ENDS TOMORROW

After tomorrow, this deal is GONE.

$39.99/year → $19.99/year
Code: ${NEW_YEAR_PROMO_CODE}

Claim 50% off: https://typebit8.com/premium`;

  return { subject, html, text };
}

/**
 * Email template: Final Hours (Jan 14)
 */
function newYearFinalHoursTemplate(email: string): { subject: string; html: string; text: string } {
  const unsubscribeUrl = `https://typebit8.com/unsubscribe?email=${encodeURIComponent(email)}`;
  const subject = "🚨 HOURS LEFT: Your 50% Discount Expires Tonight";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Courier New', monospace; background-color: #0f0f23; color: #eef5db; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border: 4px solid #e63946; padding: 30px;">
    <div style="background-color: #e63946; color: #eef5db; padding: 25px; margin: -30px -30px 30px -30px; text-align: center;">
      <p style="font-size: 28px; margin: 0; font-weight: bold;">🚨 FINAL HOURS 🚨</p>
      <p style="font-size: 14px; margin: 10px 0 0 0;">Sale ends at midnight tonight</p>
    </div>

    <p style="font-size: 16px; line-height: 1.8; text-align: center;">
      This is your <strong style="color: #ffd93d;">last chance</strong> to get TypeBit8 Premium at 50% off.
    </p>

    <p style="font-size: 14px; line-height: 1.8; text-align: center; color: #9a9ab0;">
      At midnight, the price goes back up. No exceptions.
    </p>

    <div style="background-color: #0f0f23; border: 3px solid #0ead69; padding: 30px; margin: 25px 0; text-align: center;">
      <p style="font-size: 14px; color: #9a9ab0; margin: 0 0 5px 0; text-decoration: line-through;">$39.99</p>
      <p style="font-size: 56px; color: #0ead69; margin: 0; font-weight: bold;">$19.99</p>
      <p style="font-size: 16px; color: #ffd93d; margin: 15px 0 0 0; font-weight: bold;">${NEW_YEAR_PROMO_CODE}</p>
    </div>

    <a href="https://typebit8.com/premium?utm_source=email&utm_medium=promo&utm_campaign=newyear2025_final"
       style="display: inline-block; background-color: #0ead69; color: #0f0f23; padding: 20px 30px; text-decoration: none; font-weight: bold; margin: 20px 0; width: 100%; text-align: center; box-sizing: border-box; font-size: 18px;">
      GET 50% OFF NOW →
    </a>

    <p style="font-size: 11px; color: #9a9ab0; text-align: center; margin-top: 20px;">
      This is our final email about this sale. Good luck on your typing journey!
    </p>

    <p style="font-size: 12px; color: #9a9ab0; margin-top: 30px; border-top: 1px solid #3bceac; padding-top: 20px;">
      <a href="https://typebit8.com/privacy" style="color: #3bceac;">Privacy Policy</a> •
      <a href="${unsubscribeUrl}" style="color: #3bceac;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;

  const text = `🚨 FINAL HOURS - SALE ENDS TONIGHT

This is your LAST CHANCE to get TypeBit8 Premium at 50% off.

At midnight, the price goes back up. No exceptions.

$39.99 → $19.99
Code: ${NEW_YEAR_PROMO_CODE}

Get 50% off: https://typebit8.com/premium`;

  return { subject, html, text };
}

/**
 * Get New Year promo template by campaign type
 */
export function getNewYearTemplate(
  campaign: "launch" | "value" | "week" | "3days" | "lastday" | "final",
  email: string
): { subject: string; html: string; text: string } {
  switch (campaign) {
    case "launch":
      return newYearLaunchTemplate(email);
    case "value":
      return newYearValueTemplate(email);
    case "week":
      return newYearWeekLeftTemplate(email);
    case "3days":
      return newYear3DaysTemplate(email);
    case "lastday":
      return newYearLastDayTemplate(email);
    case "final":
      return newYearFinalHoursTemplate(email);
  }
}

/**
 * Send New Year promo email
 */
export const sendNewYearPromoEmail = internalAction({
  args: {
    email: v.string(),
    campaign: v.union(
      v.literal("launch"),
      v.literal("value"),
      v.literal("week"),
      v.literal("3days"),
      v.literal("lastday"),
      v.literal("final")
    ),
  },
  handler: async (_, args) => {
    const template = getNewYearTemplate(args.campaign, args.email);
    return sendViaResend({
      to: args.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },
});

/**
 * Public action to send New Year promo email (for CLI/dashboard use)
 */
export const sendNewYearPromo = action({
  args: {
    email: v.string(),
    campaign: v.union(
      v.literal("launch"),
      v.literal("value"),
      v.literal("week"),
      v.literal("3days"),
      v.literal("lastday"),
      v.literal("final")
    ),
  },
  handler: async (_, args) => {
    const template = getNewYearTemplate(args.campaign, args.email);
    return sendViaResend({
      to: args.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  },
});
