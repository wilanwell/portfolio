import { renderToString } from "react-dom/server";
import App from "./App";
import { identity, profile, projects, projectPath } from "./lib/content";

export const routes = ["/", ...projects.map(projectPath), "/404.html"];
export function render(path: string) {
  const project = projects.find((project) => projectPath(project) === path);
  const notFound = path !== "/" && !project;
  return {
    html: renderToString(<App path={path} />),
    title: `${project?.name || (notFound ? "Page not found" : identity)} | ${project || notFound ? identity : "Software Engineering"}`,
    description:
      project?.summary ||
      (notFound
        ? "The requested portfolio page could not be found."
        : profile.intro),
    image: project?.cover || profile.portrait,
    noindex: profile.draft || notFound,
  };
}
