# SWS Operations Platform

Full-stack operations platform for Southwest Stucco, Inc. — managing the complete project lifecycle from bid/proposal through final payment and lien release.

## Quick Start (Docker)

```bash
docker-compose up --build
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000
- **Demo Login:** aaron@swsstucco.com / password123!

## Setup (Without Docker)

### API (Rails)
```bash
cd api
bundle install
rails db:create db:migrate db:seed
rails s
```

### Web (React)
```bash
cd web
npm install
npm run dev
```

## Architecture

- **Backend:** Ruby on Rails 7.1 (API-only) + PostgreSQL + Redis + Sidekiq
- **Frontend:** React 18 + TypeScript + Tailwind CSS + TanStack Query
- **Auth:** Devise + JWT

## Modules

1. **Project Management** — Dashboard, phase tracking, financials
2. **Estimating & Proposals** — Takeoff calculator, proposal generation
3. **Billing & AR** — AIA G702/G703 pay apps, payment tracking
4. **Change Orders** — Full CO lifecycle with DocuSign integration
5. **Subcontractor Management** — Vendor database, sub invoice tracking
6. **Lien Release Tracking** — CA-compliant conditional/unconditional releases
7. **Insurance & Compliance** — Policy vault, COI generation, expiry alerts
8. **Document Management** — S3 storage, version control, search
9. **Job Cost & Profitability** — Budget vs. actual, margin analysis

## Hartford Project (Seed Data)

- **Project:** 495 Hartford Apartments, 1441 W. 5th St., LA 90017
- **GC:** Fassberg Construction Company
- **Contract:** $865,000 (original) → $1,133,005.20 (with 12 COs)
- **Billed:** $1,157,965.20 | **Paid:** $966,182.81
- **Scope:** 15,518 sq yds (walls + ceilings)

## License

Proprietary — Southwest Stucco, Inc.
