# Project Roadmap & TODO

A phased roadmap for the Community Hub project. Each phase contains features and tasks to implement. Use this document as a living checklist during development.

## Table of Contents

- [Phase 0 – Setup & Core Architecture](#phase-0-–-setup--core-architecture)
- [Phase 1 – User Management (Basic Auth)](#phase-1-–-user-management-basic-auth)
- [Phase 2 – Basic Backer Features](#phase-2-–-basic-backer-features)
- [Phase 3 – Basic Creator Features](#phase-3-–basic-creator-features)
- [Phase 4 – Basic Admin Features](#phase-4-–basic-admin-features)
- [Phase 5 – Notifications & Communication](#phase-5-–notifications--communication)
- [Phase 6 – Advanced Features (User Experience & Growth)](#phase-6-–advanced-features-user-experience--growth)
- [Phase 7 – Advanced System Features](#phase-7-–advanced-system-features)
- [Phase 8 – Optional / Premium Features](#phase-8-–optional--premium-features)

---

## Phase 0 – Setup & Core Architecture

- [ ] Initialize Node.js + TypeScript backend (Express/NestJS)
- [ ] Initialize React/Next.js frontend with TypeScript
- [ ] Setup PostgreSQL / MongoDB for database
- [ ] Setup Stripe / PayPal sandbox accounts
- [ ] Configure cloud storage (AWS S3 / Cloudinary for media)
- [ ] Setup CI/CD (GitHub Actions → AWS / Vercel deployment)
- [ ] Environment variables management (.env files)

## Phase 1 – User Management (Basic Auth)

- [ ] Roles: Backer / Creator / Admin
- [ ] Sign up / Log in / Logout
- [ ] Role selection (Backer, Creator)
- [ ] Password hashing & secure login
- [ ] Forgot password / Reset password via email
- [ ] Email verification (Backer & Creator)
- [ ] Admin account creation

## Phase 2 – Basic Backer Features

### Discover Projects

- [ ] Homepage grid of campaigns
- [ ] Campaign card info: image, title, goal, progress bar, days left
- [ ] Filters: category, popularity, newest, ending soon
- [ ] Search bar (full-text search)
- [ ] Pagination / Infinite scroll

### Project Details

- [ ] Click to view full campaign page
- [ ] Campaign description, images, intro video
- [ ] Funding goal, amount raised, number of backers, deadline
- [ ] Reward tiers display

### Pledging

- [ ] Select reward tier
- [ ] Checkout form (Stripe / PayPal integration)
- [ ] Confirm pledge
- [ ] Pledge confirmation page

## Phase 3 – Basic Creator Features

### Dashboard & Campaign Creation

- [ ] Creator dashboard overview: total campaigns, funds, backers
- [ ] Create campaign form: title, description, goal, deadline, category
- [ ] Upload images/videos (media optimization)
- [ ] Create reward tiers
- [ ] Submit campaign for admin review

### Campaign Management

- [ ] Edit campaign (before going live)
- [ ] Track funding progress (graph: funds vs time)
- [ ] Backer count per reward tier
- [ ] View backer list (basic info)
- [ ] Share campaign link (social media buttons)

## Phase 4 – Basic Admin Features

### Campaign Approval

- [ ] Approve / Reject campaigns
- [ ] Comment on rejection reason
- [ ] View all campaigns with filters: pending, live, ended

### Refunds & Disputes

- [ ] Automatic refunds if goal not met
- [ ] Manual refund handling for disputes

### Metrics

- [ ] Total funds raised
- [ ] Top campaigns by funds / backers
- [ ] Daily / weekly activity charts

## Phase 5 – Notifications & Communication

### Backers

- [ ] In-app notifications: campaign updates, milestones
- [ ] Email notifications: updates, pledges, refunds
- [ ] Comment section per campaign (threaded)
- [ ] Like / reply to comments

### Creators

- [ ] Notifications when a new pledge is made
- [ ] Notify updates posted to backers
- [ ] Alert when campaign is approved/rejected

### Admins

- [ ] Alerts for campaigns pending review
- [ ] System health notifications (e.g., payment failures)

## Phase 6 – Advanced Features (User Experience & Growth)

### Backers

- [ ] Save/favorite campaigns
- [ ] Personalized recommendations (ML or simple category-based)
- [ ] Follow favorite creators
- [ ] Pledge history & rewards tracking

### Creators

- [ ] Analytics: top referrers, pledge trends, conversion rates
- [ ] Multi-tier reward management
- [ ] Campaign cloning / templates for future campaigns
- [ ] Video preview & media compression

### Admins

- [ ] Advanced analytics dashboard (daily/weekly/monthly stats)
- [ ] Export data (CSV / Excel)
- [ ] Fraud detection for campaigns or pledges
- [ ] Role management for other admins

## Phase 7 – Advanced System Features

- [ ] Real-time funding updates (WebSockets / Pusher)
- [ ] Webhooks for Stripe/PayPal events
- [ ] Campaign countdown timer
- [ ] Mobile-friendly responsive design
- [ ] Multi-language support
- [ ] Caching frequently accessed data (Redis)
- [ ] Rate limiting / security headers
- [ ] Logging & error tracking (Sentry)
- [ ] Automated testing: unit + integration + E2E (Jest + Cypress)
- [ ] CI/CD pipeline with automated tests & deployments

## Phase 8 – Optional / Premium Features

- [ ] Social login (Google, Facebook)
- [ ] Referral system for backers
- [ ] Multi-currency support
- [ ] AI-based campaign summary / preview generator
- [ ] Comment moderation (AI or admin)
- [ ] Dynamic reward pricing (early-bird specials)
- [ ] Campaign trending algorithm
- [ ] Progressive Web App (PWA) support
- [ ] Analytics for campaign performance prediction

---