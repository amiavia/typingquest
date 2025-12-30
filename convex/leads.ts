/**
 * PRP-046: Leads / Email Capture System
 *
 * Captures email leads from speed test, landing pages, etc.
 * Supports marketing consent for GDPR compliance.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Capture a new lead
 */
export const captureLead = mutation({
  args: {
    email: v.string(),
    source: v.string(),
    speedTestResult: v.optional(
      v.object({
        wpm: v.number(),
        accuracy: v.number(),
      })
    ),
    referralCode: v.optional(v.string()),
    country: v.optional(v.string()),
    marketingConsent: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existingLead = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingLead) {
      // Update existing lead with new speed test result if provided
      if (args.speedTestResult) {
        await ctx.db.patch(existingLead._id, {
          speedTestResult: args.speedTestResult,
          // Update marketing consent only if they explicitly consent again
          marketingConsent: args.marketingConsent || existingLead.marketingConsent,
        });
      }
      return { success: true, isNew: false, leadId: existingLead._id };
    }

    // Create new lead
    const leadId = await ctx.db.insert("leads", {
      email: args.email.toLowerCase(),
      source: args.source,
      speedTestResult: args.speedTestResult,
      referralCode: args.referralCode,
      country: args.country,
      marketingConsent: args.marketingConsent,
      convertedToUser: false,
      createdAt: Date.now(),
    });

    return { success: true, isNew: true, leadId };
  },
});

/**
 * Check if email is already captured
 */
export const checkEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    return { exists: !!lead };
  },
});

/**
 * Mark a lead as converted to user
 */
export const markConverted = mutation({
  args: {
    email: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (lead) {
      await ctx.db.patch(lead._id, {
        convertedToUser: true,
        clerkId: args.clerkId,
      });
      return { success: true };
    }

    return { success: false, error: "Lead not found" };
  },
});

/**
 * Get leads stats (for admin dashboard)
 */
export const getLeadsStats = query({
  args: {},
  handler: async (ctx) => {
    const allLeads = await ctx.db.query("leads").collect();

    const totalLeads = allLeads.length;
    const convertedLeads = allLeads.filter((l) => l.convertedToUser).length;
    const speedTestLeads = allLeads.filter((l) => l.source === "speed_test").length;
    const withConsent = allLeads.filter((l) => l.marketingConsent).length;

    return {
      totalLeads,
      convertedLeads,
      conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
      speedTestLeads,
      withConsent,
      consentRate: totalLeads > 0 ? (withConsent / totalLeads) * 100 : 0,
    };
  },
});
