# Agent Context — China Career Board (china-jobs)

This repository serves as the Career and Employment Board for the **China Suite** ecosystem, allowing users to discover employment openings, apply to listings, track progress, and search by category/location.

---

## 🗺️ Suite Ecosystem Architecture

The Career Board operates as a sub-app under the path `/china-jobs/` of the main portal:
1. **Switcher Portal**: `https://danieltibbing.github.io/`
2. **Career Board (This Repo)**: `https://danieltibbing.github.io/china-jobs/`
3. **Study Hub (`chinese-practice`)**: `https://danieltibbing.github.io/chinese-practice/`
4. **Podcast Hub (`china-pods`)**: `https://danieltibbing.github.io/china-pods/`

---

## 🛠️ Technical Stack & Configurations

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4.0.0
- **Build Configurations**:
  - `vite.config.ts`: Base is `/china-jobs/` to ensure assets resolve properly on GitHub Pages subdirectories.
  - `tsconfig.json` & `tsconfig.app.json`: Strict TypeScript compiler rules, utilizing `verbatimModuleSyntax: true` to guarantee clean type imports.
- **Routing**: `HashRouter` is integrated inside `src/App.tsx` to handle nested routes (e.g. details pages, applications) without throwing 404s on GitHub Pages.

---

## 🎨 Design Rules & Aesthetics

- **Accents & Colors**: Deep corporate blue-gray (`#1e293b` / `bg-slate-800`) coupled with rich accents. Uses transparent glassmorphic cards and crisp typography.
- **Theme Synchronization**:
  - Bound directly to sibling repositories using the global `theme` key in `localStorage`.
  - Implements a FOUC-guard `<script>` inside `index.html` to inject the dark class immediately upon head parser evaluation.
  - Real-time tab sync: A `storage` event listener listens for local storage mutations, converting themes seamlessly without page reloads.

---

## 📂 Codebase Organization

- `src/constants/jobs.ts`: Stores the seeded job directory data.
- `src/types/index.ts`: Strict TypeScript type definitions for Jobs, Companies, and Applications.
- `src/hooks/useTheme.ts`: Manages system/user theme switches.
- `src/components/layout/Header.tsx`: Houses the top-level Global Switcher Navigation bar that cross-links all 4 apps.
- `src/components/jobs/`: JobGrid, JobCard, JobDetail, and filtering panels.
- `src/components/applications/`: Application form overlays and tracking dashboards.
- `.github/workflows/deploy.yml`: Deploys compiled assets straight to the `/china-jobs/` subdirectory on the `gh-pages` branch on push.

---

## 💻 Useful Operations

- Run development server: `npm run dev`
- Build project: `npm run build` (runs `tsc -b && vite build`)
- Deployment: Commit and push to `main` branch to automatically trigger the pipeline.
