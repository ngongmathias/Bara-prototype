# BaraAfrika — Future Resource & Operations Plan (Short)

## Purpose
Plan the people, tools, and upgrades needed to keep BaraAfrika stable, secure, and scalable as traffic and features grow.

## Current State (Now)
- Deployed web app
- Key core surfaces: Events, Listings, Marketplace, Countries
- Supabase used for database/storage/edge functions (and likely scheduled jobs)
- Payments not implemented yet

---

## What “Maintenance” Means (Ongoing)
- **Bug fixes & UX polishing**
- **Security**
  - Dependency updates
  - Auth rules reviews (RLS policies, admin operations)
  - Vulnerability response
- **Reliability**
  - Uptime monitoring
  - Error triage and incident response
- **Performance**
  - Page load time and image optimization
  - Query performance and caching
- **Data operations**
  - Backups
  - Schema migrations
  - Data quality monitoring (feeds, listings, events)

---

## Scaling With More Traffic (What Changes)
### 1) Frontend / Delivery
- **CDN & caching** become more important (static assets and images)
- **Image performance**
  - Move to aggressively cached, resized images (thumbnails)
  - Lazy loading everywhere + responsive `srcset`
- **Bundle size**
  - Code-splitting and route-level lazy loading

### 2) Backend / Supabase
As traffic grows, most issues show up as:
- **More DB reads/writes** (Listings search, Events list, filters)
- **Slow queries** (missing indexes, unbounded queries)
- **Higher connection usage**
- **More storage bandwidth** (images)

Key future upgrades:
- Add/optimize **indexes** and review query patterns
- Add **caching layer** (edge caching / Redis-like cache) if needed
- Consider **read replicas** or stronger Postgres resources

### 3) Observability (Must-have as you scale)
- Centralized **error tracking** (frontend + backend)
- Basic **APM metrics**: slow routes, slow DB queries
- **Logging** for critical workflows (payments, claims, admin actions)

---

## Supabase Upgrades — What To Expect
(Exact pricing changes over time, but the *types of costs* are predictable.)

### Typical reasons you “upgrade Supabase”
- You hit limits on:
  - **Database compute** (CPU/RAM)
  - **Storage** (images)
  - **Bandwidth / egress**
  - **Edge Function execution / scheduled jobs**
  - **Concurrent connections**

### Budget categories to plan for (not numbers)
- **Supabase plan tier** (base monthly)
- **Postgres compute upgrades** (vertical scaling)
- **Storage** (GB/month)
- **Bandwidth egress** (GB/month)
- **Backups / PITR** (if enabled)

### Operational expectation
- You do **not** need a full-time engineer just to “watch Supabase” early.
- You **do** need consistent part-time ownership (see roles) and alerting.

---

## Roadmap Items Not Yet Implemented (and what they require)
### Payments (Stripe recommended)
Operational needs:
- Webhook handling + retries
- Secure server-side verification
- Customer support flows: refunds, disputes, chargebacks
- Finance reporting exports

Engineering needs:
- Payment architecture (Products, subscriptions, one-time purchases)
- Admin workflows (plans, pricing, promo codes)
- Database tables for payment state (idempotency, receipts)

### Higher-Traffic Search
If traffic and catalog size increase:
- Add optimized database search (indexes, full-text search)
- Consider external search (Algolia/Meilisearch) only if needed

### Media / Images at Scale
- Thumbnail generation (edge function or external service)
- Separate public image CDN strategy

---

## Recommended Team Roles (No Salaries)
You can start lean and expand as usage grows.

### 1) Product Engineer (Full-stack)
- **Background**: React/TypeScript, Node/edge functions, SQL, basic DevOps
- **Responsibilities**:
  - Feature delivery (Listings/Events/Marketplace)
  - Fix bugs, improve performance
  - Implement payments
  - Own code quality, reviews, and release process

### 2) Platform/DevOps Engineer (Part-time to start; scale to more later)
- **Background**: CI/CD, monitoring, CDN, Postgres performance, security
- **Responsibilities**:
  - Monitoring/alerting + incident response process
  - Performance tuning (bundle + DB queries)
  - Environments, secrets management
  - Backups and recovery drills

### 3) Data/Content Ops (Part-time)
- **Background**: admin tooling, content QA, basic analytics
- **Responsibilities**:
  - Ensure listings/events quality
  - Operate RSS/news sources (if used)
  - Report bad data, coordinate fixes

### 4) Support/Community (As usage grows)
- **Background**: user support, community management
- **Responsibilities**:
  - Handle user issues (claims, payments, disputes)
  - Triage bug reports to engineering

---

## Monitoring & Ownership (Minimal Setup)
### Alerts you want early
- **Uptime** (site down)
- **API errors** (5xx, edge function failures)
- **Slow pages** (LCP/TTFB regression)
- **Database** (slow query spikes, CPU/memory)
- **Storage/bandwidth** approaching limits

### Review cadence
- **Weekly**: error dashboard + performance + key metrics
- **Monthly**: dependency upgrades + security checks
- **Quarterly**: schema/index review + load testing + capacity plan refresh

---

## Capacity Planning Triggers (When to upgrade)
Upgrade and/or add people when you see:
- **Page loads > 3s** at p75 consistently
- **DB timeouts / slow query warnings**
- **Support tickets rising** faster than you can respond
- **High egress/storage growth** from images
- **Payments launched** (requires stronger ops discipline)

---

## Near-Term Recommendations (Next 30–60 days)
- Implement end-to-end **observability** (errors + basic performance)
- Implement **image optimization strategy** (thumbnails, caching)
- Design & build **payments** (Stripe + webhooks + admin tools)
- Add **load testing** for top pages (Listings search, Events filters)

---

## Summary
- Early stage: 1 strong full-stack engineer + part-time DevOps ownership is enough.
- As traffic grows: invest in observability, DB performance, image/CDN strategy.
- Payments is the next major operational step (webhooks, support, dispute handling).
- Supabase upgrades are usually driven by DB compute + storage/bandwidth—plan by category, monitor triggers, upgrade when needed.
