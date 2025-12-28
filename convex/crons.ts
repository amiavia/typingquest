/**
 * Convex Cron Jobs
 *
 * Scheduled tasks that run automatically.
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Daily analytics report at 7:00 UTC (8:00 AM Zurich winter / 9:00 AM Zurich summer)
crons.daily(
  "daily-analytics-report",
  { hourUTC: 7, minuteUTC: 0 },
  internal.analytics.sendDailyReport
);

export default crons;
