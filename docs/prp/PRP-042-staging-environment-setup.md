# PRP-042: Staging Environment Setup

## Status: Implemented

## Summary

Establish a complete staging environment mirroring production across Convex, Clerk, and Vercel. This enables a proper development workflow where all changes are developed and tested on staging before being manually reviewed and promoted to production.

## Problem Statement

Currently:
- Development happens directly against production or with inconsistent local setups
- No safe environment to test features before they reach users
- Database changes risk affecting live user data
- Authentication flows can't be tested without impacting production Clerk
- No clear separation between "in development" and "live" code

## Goals

1. **Mirror production** - Create staging instances for Convex, Clerk, and Vercel
2. **Data isolation** - Staging has its own database, auth, and deployments
3. **Simple workflow** - Clear process: develop -> staging -> review -> production
4. **Environment parity** - Staging behaves identically to production
5. **Safe testing** - Test migrations, new features, and breaking changes without risk

## Non-Goals

- Automated CI/CD pipelines (manual promotion is intentional for now)
- Multiple staging environments (one staging is sufficient)
- Staging-to-production data sync (fresh seed data for staging)
- Load testing infrastructure

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT WORKFLOW                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   LOCAL DEV          STAGING               PRODUCTION                │
│   ─────────          ───────               ──────────                │
│                                                                      │
│   ┌─────────┐       ┌─────────────┐       ┌─────────────┐           │
│   │ VS Code │──────>│ Vercel      │──────>│ Vercel      │           │
│   │ + Local │  git  │ Preview     │ manual│ Production  │           │
│   │ Convex  │ push  │ (staging)   │promote│             │           │
│   └─────────┘       └─────────────┘       └─────────────┘           │
│        │                   │                     │                   │
│        v                   v                     v                   │
│   ┌─────────┐       ┌─────────────┐       ┌─────────────┐           │
│   │ Convex  │       │ Convex      │       │ Convex      │           │
│   │ Dev     │       │ Dev         │       │ Prod        │           │
│   │ (local) │       │ (staging)   │       │ (live)      │           │
│   └─────────┘       └─────────────┘       └─────────────┘           │
│        │                   │                     │                   │
│        v                   v                     v                   │
│   ┌─────────┐       ┌─────────────┐       ┌─────────────┐           │
│   │ Clerk   │       │ Clerk       │       │ Clerk       │           │
│   │ Test    │       │ Test Mode   │       │ Live Mode   │           │
│   └─────────┘       └─────────────┘       └─────────────┘           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation Details (Actual Setup)

### 1. Convex

Using the same `typebit8` project with separate deployments:
- **Dev deployment** (`academic-vole-305`) → Used for staging/preview
- **Prod deployment** (`exuberant-otter-37`) → Used for production

**Vercel Environment Variables:**

| Variable | Environment | Value |
|----------|-------------|-------|
| `VITE_CONVEX_URL` | Production | `https://exuberant-otter-37.convex.cloud` |
| `VITE_CONVEX_URL` | Preview | `https://academic-vole-305.convex.cloud` |

### 2. Clerk

Using the same Clerk application with different modes:
- **Test mode** (`pk_test_...`) → Used for staging/preview deployments
- **Live mode** (`pk_live_...`) → Used for production

**Vercel Environment Variables:**

| Variable | Environment | Value |
|----------|-------------|-------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Production | `pk_live_Y2xlcmsudHlwZWJpdDguY29tJA` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Preview | `pk_test_Y3J1Y2lhbC1vcnl4LTkyLmNsZXJrLmFjY291bnRzLmRldiQ` |

**Important Notes:**
- Clerk test mode has separate user database from live mode
- Test mode doesn't send real emails
- Clerk Billing works in test mode with Stripe test mode internally

### 3. Vercel

Using branch-based deployments:
- `main` branch → Production deployment (typebit8.com)
- `staging` branch → Preview deployment (uses staging env vars)

**Vercel Configuration:**
- Environment variables split by Production vs Preview
- Staging branch auto-deploys to preview URL

## Environment Variables Matrix (Actual)

| Variable | Preview (Staging) | Production |
|----------|-------------------|------------|
| `VITE_CONVEX_URL` | `https://academic-vole-305.convex.cloud` | `https://exuberant-otter-37.convex.cloud` |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_Y3J1Y2lhbC1vcnl4LTkyLmNsZXJrLmFjY291bnRzLmRldiQ` | `pk_live_Y2xlcmsudHlwZWJpdDguY29tJA` |

## Workflow

### Daily Development

```
1. Work locally on feature branch
   └── Uses local Convex dev, Clerk test keys

2. Push to staging branch
   └── Vercel creates preview deployment
   └── Uses Convex dev + Clerk test mode

3. Test on staging
   └── Manual QA, verify features work
   └── Test with staging database (Convex dev)

4. Merge staging → main
   └── Auto-deploys to typebit8.com
   └── Uses Convex prod + Clerk live mode
```

### Deployment Commands

```bash
# Local development
npm run dev                    # Uses .env.local

# Push to staging
git checkout staging
git merge feature/my-feature
git push origin staging        # Auto-deploys to preview

# Promote to production
git checkout main
git merge staging
git push origin main           # Auto-deploys to production
```

## Git Branches

| Branch | Deploys To | Environment |
|--------|------------|-------------|
| `main` | Production (typebit8.com) | Production env vars |
| `staging` | Preview | Preview env vars (staging) |
| `feature/*` | Preview | Preview env vars (staging) |

## Rollback Procedures

### Frontend Rollback
```bash
# Revert main to previous commit
git checkout main
git revert HEAD
git push origin main
```

### Convex Rollback
- Use Convex dashboard to view deployment history
- Redeploy previous version if needed

## Success Criteria

| Criteria | Status |
|----------|--------|
| Environment isolation | ✅ Staging uses different Convex deployment and Clerk mode |
| Deployment speed | ✅ Auto-deploys on push |
| Parity | ✅ Same codebase, different env vars |
| Workflow clarity | ✅ staging → main promotion |
| Data safety | ✅ Separate Convex dev deployment for staging |

## Decisions Made

1. **Single Convex project**: Use existing `typebit8` project's dev deployment for staging instead of creating separate project
2. **Single Clerk app**: Use test mode for staging, live mode for production
3. **Vercel Preview**: Use branch-based environment variable separation
4. **No custom staging domain**: Preview URLs are sufficient
