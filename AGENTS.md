# 💼 China Career Board (china-jobs) - `AGENTS.md`

This directory houses the Careers and Job Board application of the **China Suite** ecosystem—an ultra-premium, interactive client-side web directory allowing professionals to search for employment openings, apply to listings, and track application progress under a unified offline tracker dashboard.

---

## 🎯 Purpose & Capabilities
- **Curated Job Catalog**: Displays professional jobs within tech, AI/semiconductors, logistics, academies, and business consulting in China.
- **Applicant Tracking System (ATS)**: Fully client-side application log dashboard where users can submit simulated applications, modify progression states, and bookmark jobs.
- **Visual Design**: Uses Tailwind CSS v4 glassmorphic card grids, custom slider filter sliders, and interactive detail inspection overlays.

---

## 🛠️ Technology Stack
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4.0.0 (vanilla import syntax)
- **Deployment Endpoint:** GitHub Pages subdirectory `/china-jobs/`

---

## 📂 Key Directory Structures
```text
china-jobs/
├── src/
│   ├── components/
│   │   ├── applications/    # ATS tracker dashboard overlays and application forms
│   │   ├── jobs/            # Job card grids, sector lists, and inspector cards
│   │   └── layout/          # SuiteSwitcher integration layout header/footer
│   ├── constants/
│   │   └── jobs.ts          # Central seed database of jobs and company details
│   ├── hooks/
│   │   └── useTheme.ts      # localstorage sync theme listener hook
│   ├── types/
│   │   └── index.ts         # Type descriptors for Job, Company, and Application
│   ├── App.tsx              # Application layout assembler and filtering views
│   └── main.tsx             # DOM entry point
```

---

## 🔑 Shared Design & Implementation Patterns

### 1. Job Database Configuration (`src/constants/jobs.ts`)
- Contains all pre-seeded companies (e.g. tech, trade, semiconductors) and their respective job openings.
- Always add/modify listing entries directly here using the TypeScript `Job` and `Company` types to keep the central directory up-to-date.

### 2. Client-Side ATS State
- Applications submitted via the modal overlay are handled inside React state context and saved to local storage to maintain persistence.
- Progression steps for candidate trackers are: `applied` ➔ `interviewing` ➔ `offered` ➔ `rejected`.

### 3. Suite Theme Synchronization
- Links to standard `localStorage` tab listening hooks to match background styling changes triggered in other China Suite sub-apps instantly.

---

## 💻 Operations Reference
- **Local Dev Server:**
  ```bash
  npm install
  npm run dev
  ```
- **Compiling Production Build:**
  ```bash
  npm run build
  ```
  *Bundles standard minified client assets compiled inside local `dist/` directory.*
