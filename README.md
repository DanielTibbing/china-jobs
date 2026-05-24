# 💼 China Career Board (china-jobs)

The Careers and Job Board application for the **China Suite** ecosystem—an ultra-premium, interactive client-side web directory allowing professionals to search for employment openings, apply to listings, and track application progress under a unified tracker dashboard.

---

## ✨ Features

- **Seeded Job Directories:** Contains a rich preset database of China-related job listings covering tech, logistics, education, translation, and consulting sectors.
- **Dynamic Search & Filtering:** Categorized by industry sectors (*Semiconductors & AI*, *Logistics & Trade*, *Academics & Language*, etc.) with quick search inputs.
- **Interactive Inspection Overlays:** Inspect company profiles, job requirements, salary tiers, and detailed specifications instantly.
- **Applicant Tracking System (ATS):** Submit applications using a responsive form overlay and monitor interview progression, stashes, and application dates under your offline dashboard.
- **Theme Sync Engine:** Binds dark and light modes across all active browser windows instantly using standard shared local storage listeners.
- **SEO & FOUC Prevention:** Structurally optimized SEO tags and head scripts preventing any unstyled flashes on launch.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4.0.0
- **Deployment:** GitHub Pages Subdirectory `/china-jobs/`

---

## 📂 Project Directory Structure

```text
src/
├── components/          # Reactive UI Components
│   ├── applications/    # ATS dashboards and apply overlays
│   ├── jobs/            # Job card grids, filters, and detail sheets
│   └── layout/          # Cross-Navigation Switcher Header & Footer
├── constants/
│   └── jobs.ts          # Central jobs and companies database
├── hooks/
│   └── useTheme.ts      # Dark/light theme switcher hook
├── types/
│   └── index.ts         # TypeScript structures (Job, Company, Application)
├── App.tsx              # Main layout assembler and routing configuration
└── main.tsx             # DOM entry point
```

---

## 💻 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run locally in development mode:**
   ```bash
   npm run dev
   ```
3. **Build the production package:**
   ```bash
   npm run build
   ```
   *This compiles TypeScript strict checking (`tsc -b`) and bundles standard minified files inside `dist/` using Vite.*

---

## 🌐 China Suite Ecosystem

The Career Board operates as a sub-app of the broader **China Suite** family. The switcher header instantly navigates between:
- **Switcher Portal**: [danieltibbing.github.io](https://danieltibbing.github.io/)
- **Career Board (This Repo)**: [china-jobs](https://danieltibbing.github.io/china-jobs/)
- **Study Hub**: [chinese-practice](https://danieltibbing.github.io/chinese-practice/)
- **Podcast Hub**: [china-pods](https://danieltibbing.github.io/china-pods/)
