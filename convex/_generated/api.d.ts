/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as coins from "../coins.js";
import type * as dailyChallenges from "../dailyChallenges.js";
import type * as gameState from "../gameState.js";
import type * as http from "../http.js";
import type * as leaderboard from "../leaderboard.js";
import type * as lessonProgress from "../lessonProgress.js";
import type * as migrations from "../migrations.js";
import type * as nicknameWords from "../nicknameWords.js";
import type * as nicknames from "../nicknames.js";
import type * as powerups from "../powerups.js";
import type * as premium from "../premium.js";
import type * as seedShopItems from "../seedShopItems.js";
import type * as settings from "../settings.js";
import type * as shop from "../shop.js";
import type * as streaks from "../streaks.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  coins: typeof coins;
  dailyChallenges: typeof dailyChallenges;
  gameState: typeof gameState;
  http: typeof http;
  leaderboard: typeof leaderboard;
  lessonProgress: typeof lessonProgress;
  migrations: typeof migrations;
  nicknameWords: typeof nicknameWords;
  nicknames: typeof nicknames;
  powerups: typeof powerups;
  premium: typeof premium;
  seedShopItems: typeof seedShopItems;
  settings: typeof settings;
  shop: typeof shop;
  streaks: typeof streaks;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
