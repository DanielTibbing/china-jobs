# Project Status: China-Nordic Jobs Aggregator
**Last Updated**: Saturday, May 23, 2026

## 🚀 Technical Architecture
- **Frontend**: React 19 (Vite) + Tailwind CSS v4.
- **Routing**: SPA Routing using `HashRouter` (GitHub Pages compatible).
- **Architecture**: Modular component structure (`src/components`, `src/constants`, `src/types`).
- **Data Pipeline**: Node.js scraper (`scripts/fetch_jobs.js`) running daily via GitHub Actions.
- **Branding**: Dynamic company logos via Clearbit Logo API with UI Avatar fallbacks.

## 📊 Scraper Statistics
- **Tracked Companies**: 44
- **Active Technical Roles**: 307
- **Target Regions**: 
  - 🇨🇳 China: 117 roles
  - 🇸🇬 Singapore: 135 roles
  - 🇸🇪 Sweden: 35 roles
  - 🇭🇰 Hong Kong: 20 roles

## ✅ Recently Completed
- **Volvo Group Migration**: Moved from HTML scraping to direct XML feed integration (`jobs.volvogroup.com/feed/361555`).
- **Atlas Copco Integration**: Implemented Algolia API search for high-precision technical role fetching.
- **Strict Filtering**: Enforced region-based discarding of non-target jobs to reduce dashboard noise.
- **Modular Refactor**: Split monolithic `App.tsx` into clean, maintainable components.
- **Dual View Layout**: Implemented swappable Grid (Cards) and Table views for both Jobs and Companies.

## 📋 Pending Integrations
- [ ] **Fintech**: Stripe, Ant Group.
- [ ] **E-commerce**: Lazada, Shopee (Sea Group).
- [ ] **Gaming**: EA (Electronic Arts).
- [ ] **Logistics**: Lalamove.
- [ ] **Retail/Tech**: Philips, Zalando, Jabra.

## 🔧 Maintenance Notes
- Scraper uses hardened Workday V2 pagination (locking total from first call).
- SuccessFactors RMK sites (Assa Abloy, Scania) are tracked via targeted HTML regex scraping.
- Clearbit Logo API handles brand assets; check `logoDomain` in `src/constants/companies.ts` if a logo is missing.
