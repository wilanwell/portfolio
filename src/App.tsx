import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { projects, projectPath, profile } from "./lib/content";
import { ActionLink, Header, Footer } from "./components/ui";
import AmbientBackground from "./components/AmbientBackground";
import HomePortfolio from "./components/HomePortfolio";
import ProjectCaseStudy from "./components/ProjectCaseStudy";

export default function App({ path }: { path: string }) {
  const route = path.endsWith("/") ? path : path + "/";
  const project = projects.find((project) => projectPath(project) === route);
  useEffect(() => {
    // Revisit fragment targets after hydration when opening a direct project URL.
    if (window.location.hash) {
      const id = decodeURIComponent(window.location.hash.slice(1));
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView(),
      );
    }
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <AmbientBackground subtle={route !== "/"} />
      <div className="site-shell" id="top">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {profile.draft && (
          <div className="draft-banner">
            <span className="status-dot" />
            Portfolio preview<span className="draft-separator">/</span>CV &
            project responsibilities pending
          </div>
        )}
        <Header />
        <main id="main">
          {route === "/" ? (
            <HomePortfolio />
          ) : project ? (
            <ProjectCaseStudy project={project} />
          ) : (
            <section className="not-found wrap">
              <div className="eyebrow">404 / Page not found</div>
              <h1>
                Let’s get you back<span className="accent">.</span>
              </h1>
              <p>This page may have moved, or the address may be incorrect.</p>
              <div className="actions">
                <ActionLink href="/" primary>
                  Back to portfolio
                </ActionLink>
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
