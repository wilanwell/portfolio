# Welljoel Ali @ Walter — Portfolio

A Software Engineering internship portfolio built with React 19, TypeScript, Tailwind CSS 4 and Vite 8. Motion powers the interactive profile card and background parallax; an original Three.js wave surface adds luminous points, fine contours and interactive ripples over soft violet lighting. The design uses violet-black surfaces, white text, lavender gradients and purple accents, with locally hosted Plus Jakarta Sans and Fira Code.

## Local development

Use Node.js 22.23.4 or later. Development was verified with Node.js 24.14.1. Direct dependency versions and the package lock are included.

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:4173/. Stop the existing preview on this port before starting the development server.

To review the production build with deployment headers:

```powershell
npm run build
npm run check
npm run preview
```

## Architecture

```text
content/
  profile.json                   Personal details, portrait, education and contact
  projects.json                  Confirmed project content and release evidence
src/
  App.tsx                        Shared shell and route selection
  entry-client.tsx               React hydration and global styles
  entry-server.tsx               Build-time page rendering and metadata
  components/
    HomePortfolio.tsx            Introduction, projects, about, toolkit and education
    ProfileCard.tsx              Accessible tilt/flip card powered by Motion
    ProjectCaseStudy.tsx          Concise and full project case studies
    AmbientBackground.tsx        Lazy WebGL loading, SVG fallback and pointer lighting
    ui.tsx                       Shared navigation, actions, visuals and contact
  effects/wave.ts                Sparse Three.js wave, pointer displacement and click ripples
  effects/field.ts               Previous full-screen field, retained but not loaded
  lib/content.ts                 Typed content models and date formatting
  styles.css                     Tailwind entry, design tokens and responsive styles
scripts/
  prerender.mjs                  Writes four complete HTML pages and crawler files
  validate-content.mjs           Content and release-readiness validation
  check.mjs                     Type-independent HTML, content, asset and link checks
  serve.mjs                     Production preview with deployment headers
public/assets/                  Portrait, application images and licensed fonts
vite.config.ts                  React and Tailwind build integration
vercel.json                     Vercel build and HTTP headers
```

Each route has its own prerendered HTML, title and description. Internal links use normal browser navigation and preserve the existing project URLs. Content, images and native navigation remain available without JavaScript. React hydrates the markup for the interactive card and other enhancements.

The background loads an original Three.js wave surface after the useful page content renders. Its 1,408 desktop points (420 on phones) occupy a folded ribbon instead of a full-screen dot grid. Fine lines connect selected rows; pointer movement displaces nearby points and clicks or taps generate up to three fading light ripples. Rendering is capped near 30 fps on desktop and 20 fps on phones, with a capped pixel ratio and no postprocessing. Hidden tabs pause the render loop. Reduced-motion preferences skip WebGL and retain the static SVG/CSS composition. That fallback also remains if WebGL fails or its context is lost. Generation checks prevent late imports from creating orphan canvases; cleanup cancels frames and disposes graphics resources and listeners. Case studies dim the graphics for reading. All decorative layers stay clipped within a fixed, non-interactive container. The earlier full-screen field remains in source but is not imported.

The portrait is used as supplied; display framing and overlay effects are CSS only. Its card uses unified pointer events for mouse, touch and stylus input, with tilt, reflection, parallax, tap-to-flip and horizontal drag-to-turn. Vertical gestures yield to page scrolling. Pointer capture keeps releases outside the card from leaving it stuck, and drag release does not trigger a second flip. Enter/Space work as native button activation. The Pengajian AM cover is rendered from Flutter widgets. No third-party portfolio source or personal assets were copied.

## Content and verification

Edit the JSON files in `content/`. To keep a project unpublished, either set `"hidden": true` on it (it stays in the public repository but is left out of the site and its bundle) or keep it in `content/private/`, which is git-ignored. To publish a project from `content/private/`, add its entry back to `content/projects.json` and move its cover image into `public/assets/`. Empty CV, LinkedIn and project URLs are omitted. Add a CV PDF under `public/assets/` and set the `cv` path when ready.

- `npm run build`: validates content, builds browser assets and prerenders the pages.
- `npm run typecheck`: checks React components, shared models and Vite configuration.
- `npm test`: checks gesture intent, swipe thresholds, flicks and cancelled turns using Node's built-in test runner.
- `npm run check`: typechecks and checks page structure, preserved content, anchors, local assets and draft indexing. Build first.
- `npm run build:release`: additionally requires a completed profile, CV and confirmed project contributions.

The site remains a draft until the owner completes the missing information. Draft output carries `noindex` and disallows crawlers. Configure a public HTTPS `siteUrl` and set `draft` to false when ready; canonical metadata and the sitemap then use that origin.

## Vercel

Import the GitHub repository into Vercel. If importing the parent workspace, use `portfolio-site` as Root Directory. The Vite preset uses `npm run build:release` and serves `dist`. Prerendered project directories support direct navigation and refresh without an SPA rewrite. Unknown paths use the generated 404 page.

No backend credentials are needed. All scripts and fonts are served locally. Motion needs style attributes for transforms; the content policy permits style attributes while retaining same-origin scripts and stylesheets. No contact-form backend, analytics or database was added. Contact links use email and the existing social profiles.

Plus Jakarta Sans and Fira Code are self-hosted with their SIL Open Font Licenses. The previous Manrope and Inter files and licences are retained among the assets. Application images belong to their respective projects.
