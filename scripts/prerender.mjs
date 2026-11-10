import { readFile, writeFile, mkdir } from "node:fs/promises";
import { render, routes } from "../.build/entry-server.js";
const profile = JSON.parse(
  await readFile(new URL("../content/profile.json", import.meta.url), "utf8"),
);
const template = await readFile(
  new URL("../dist/index.html", import.meta.url),
  "utf8",
);
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
if (!template.includes("<!--app-html-->"))
  throw new Error("Missing prerender placeholder.");
const origin = profile.siteUrl.replace(/\/$/, "");
for (const route of routes) {
  const page = render(route);
  const canonical = origin && route !== "/404.html" ? origin + route : "";
  const meta = `<meta property="og:type" content="website"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta name="twitter:card" content="summary_large_image">${canonical ? `<link rel="canonical" href="${escape(canonical)}"><meta property="og:url" content="${escape(canonical)}">` : ""}${origin && page.image ? `<meta property="og:image" content="${escape(origin + page.image)}">` : ""}`;
  const html = template
    .replace("<!--app-html-->", () => page.html)
    .replace(
      /<title>[^<]*<\/title>/,
      () => `<title>${escape(page.title)}</title>`,
    )
    .replace(
      /<meta name="description" content="[^"]*">/,
      () => `<meta name="description" content="${escape(page.description)}">`,
    )
    .replace(
      /<meta name="robots" content="[^"]*">/,
      `<meta name="robots" content="${page.noindex ? "noindex, nofollow" : "index, follow"}">`,
    )
    .replace("<!--page-meta-->", () => meta);
  const destination =
    route === "/404.html" ? "../dist/404.html" : `../dist${route}index.html`;
  const url = new URL(destination, import.meta.url);
  await mkdir(new URL("./", url), { recursive: true });
  await writeFile(url, html);
}
await writeFile(
  new URL("../dist/robots.txt", import.meta.url),
  profile.draft
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ""}`,
);
await writeFile(
  new URL("../dist/sitemap.xml", import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${
    origin && !profile.draft
      ? routes
          .filter((route) => route !== "/404.html")
          .map((route) => `<url><loc>${escape(origin + route)}</loc></url>`)
          .join("")
      : ""
  }</urlset>`,
);
console.log(
  `Prerendered ${routes.length} React pages with metadata and crawler rules.`,
);
