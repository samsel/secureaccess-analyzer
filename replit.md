# SecureAccess Analyzer

## Overview
A single-page React web app for IT security leaders to evaluate their SaaS application landscape and get optimized AWS WorkSpaces access tier recommendations. All processing happens client-side - no data leaves the browser.

## Architecture
- **Frontend-only SPA** - All logic runs in the browser (privacy by design)
- React + TypeScript + Tailwind CSS + Shadcn UI
- Recharts for data visualization
- Wouter for client-side routing
- Context API for state management between pages

## Key Features
1. **Input Wizard** - Organization profile, SaaS app selection (60+ apps), access context configuration
2. **Risk Heatmap** - App x user-context matrix with color-coded risk scores
3. **Policy Table** - Detailed policy decisions with DLP controls and reasoning
4. **Financial Dashboard** - Cost comparison charts (optimized mix vs blanket VDI)
5. **Blueprint Export** - Print-ready summary document for CISO approval

## File Structure
```
client/src/
  lib/
    saasApps.ts          - 60+ curated SaaS app database with exfiltration vectors
    policyEngine.ts      - Risk scoring algorithm and tier recommendation logic
    analysisContext.tsx   - React context for analysis state management
  components/
    app-sidebar.tsx      - Navigation sidebar
  pages/
    input-wizard.tsx     - Multi-step assessment input (org, apps, context)
    risk-heatmap.tsx     - Risk heatmap visualization
    policy-table.tsx     - Sortable/filterable policy table
    financial-dashboard.tsx - Cost comparison and savings charts
    blueprint.tsx        - Exportable blueprint document
shared/
  schema.ts              - TypeScript types and interfaces
```

## Policy Engine
- Risk score = weighted sum of: exfiltration vectors (x3) + data classification (x4) + user trust (x3) + device trust (x3) + location risk (x2)
- Score 0-20: Native Access ($0/mo)
- Score 21-45: Secure Browser ($7/mo)
- Score 46+: Full DaaS ($35/mo)
- Overrides for restricted data, unmanaged devices, HIPAA/PCI-DSS compliance

## Demo Scenarios
Three pre-built scenarios for quick testing:
1. Fintech Startup (100 users, high compliance)
2. Healthcare System (5,000 users, HIPAA)
3. Tech Company (500 users, remote-first)
