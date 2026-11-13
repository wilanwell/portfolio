import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  Download,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { identity, profile, availability } from "../lib/content";
import type { Project } from "../lib/content";

export function ActionLink({
  children,
  primary = false,
  icon = "arrow",
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  primary?: boolean;
  icon?: "arrow" | "mail" | "download" | "down";
  children: ReactNode;
}) {
  const Icon =
    icon === "mail"
      ? Mail
      : icon === "download"
        ? Download
        : icon === "down"
          ? ArrowDown
          : ArrowUpRight;
  return (
    <a
      {...props}
      className={`button ${primary ? "button-primary" : "button-secondary"} ${className}`}
    >
      {children}
      <Icon size={16} aria-hidden="true" />
    </a>
  );
}

const links = [
  ["Work", "/#projects"],
  ["About", "/#about"],
  ["Skills", "/#skills"],
  ["Education", "/#education"],
];

export const initials = identity
  .split(" @ ")[0]
  .split(/\s+/)
  .map((word) => word[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

export function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

export function Header() {
  const menu = useRef<HTMLDetailsElement>(null);
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Highlight the section that occupies the middle of the viewport.
    const sections = [...links.map(([, href]) => href.split("#")[1]), "contact"]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);
  const close = () => {
    if (menu.current) menu.current.open = false;
  };
  return (
    <header className="topbar" data-scrolled={scrolled || undefined}>
      <div className="topbar-inner wrap">
        <a className="topbar-brand" href="/" aria-label={`${identity} — home`}>
          <span className="monogram" aria-hidden="true">
            {initials}
          </span>
          <span className="topbar-name">
            {identity}
            <small>Software Engineering Student</small>
          </span>
        </a>
        <nav className="topbar-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              data-active={active === href.split("#")[1] || undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="topbar-actions">
          {profile.github && (
            <a
              className="icon-button"
              href={profile.github}
              aria-label="GitHub profile"
            >
              <GithubIcon size={17} />
            </a>
          )}
          {profile.cv && (
            <a className="topbar-link" href={profile.cv} download>
              Résumé
            </a>
          )}
          <a className="button button-primary button-sm" href="/#contact">
            Contact
          </a>
        </div>
        <details ref={menu} className="topbar-menu">
          <summary aria-label="Menu">
            <Menu size={18} className="menu-open" aria-hidden="true" />
            <X size={18} className="menu-close" aria-hidden="true" />
          </summary>
          <nav aria-label="Mobile navigation">
            {[...links, ["Contact", "/#contact"]].map(([label, href]) => (
              <a key={label} href={href} onClick={close}>
                {label}
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            ))}
            {profile.cv && (
              <a href={profile.cv} download onClick={close}>
                Download CV
                <Download size={16} aria-hidden="true" />
              </a>
            )}
          </nav>
        </details>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid wrap">
        <div className="footer-brand">
          <span className="monogram" aria-hidden="true">
            {initials}
          </span>
          <p>
            <strong>{identity}</strong>
            Software Engineering student at {profile.university}, building
            mobile applications with Flutter.
          </p>
        </div>
        <div className="footer-col">
          <p className="footer-title">Navigate</p>
          {links.map(([label, href]) => (
            <a key={label} href={href}>
              {label}
            </a>
          ))}
        </div>
        <div className="footer-col">
          <p className="footer-title">Connect</p>
          <a href={`mailto:${profile.email}`}>Email</a>
          {profile.github && <a href={profile.github}>GitHub</a>}
          {profile.linkedin && <a href={profile.linkedin}>LinkedIn</a>}
          {profile.cv && (
            <a href={profile.cv} download>
              Download CV
            </a>
          )}
        </div>
      </div>
      <div className="footer-bottom wrap">
        <span>© 2026 {identity}. All rights reserved.</span>
        <a href="#top">
          Back to top <ArrowUp size={13} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}

export function Contact() {
  return (
    <section className="cta wrap" id="contact" aria-labelledby="contact-heading">
      <div className="cta-card">
        <div className="cta-grid" aria-hidden="true" />
        <div className="cta-copy">
          <p className="sec-label">
            <span className="status-dot" />
            Open to internship opportunities
          </p>
          <h2 id="contact-heading">Looking for a Software Engineering intern?</h2>
          <p>
            I’m available from {availability}. I’d welcome the chance to
            contribute to your team, learn from experienced engineers and grow
            through real work.
          </p>
        </div>
        <div className="cta-actions">
          <div className="actions">
            <ActionLink href={`mailto:${profile.email}`} primary icon="mail">
              Email me
            </ActionLink>
            {profile.cv ? (
              <ActionLink href={profile.cv} download icon="download">
                Download CV
              </ActionLink>
            ) : (
              profile.github && (
                <ActionLink href={profile.github}>View GitHub</ActionLink>
              )
            )}
          </div>
          <a className="cta-email" href={`mailto:${profile.email}`}>
            <Mail size={14} aria-hidden="true" />
            {profile.email}
          </a>
          {profile.linkedin && (
            <a className="cta-email" href={profile.linkedin}>
              LinkedIn <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export function Tags({ items }: { items: string[] }) {
  return (
    <div className="tags">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

export function ProjectVisual({
  project,
  large = false,
}: {
  project: Project;
  large?: boolean;
}) {
  const screen = project.coverKind === "screen";
  return (
    <figure className={`project-figure ${large ? "large-visual" : ""}`}>
      <div
        className={`project-visual ${screen ? "study-visual" : "brand-visual"}`}
      >
        <span className="visual-category">
          {screen
            ? "Learning, made mobile."
            : project.tagline}
        </span>
        <div className="visual-rings" aria-hidden="true" />
        {screen ? (
          <div className="screen-frame">
            <img
              src={project.cover}
              alt={project.coverAlt}
              width="864"
              height="1800"
              loading="lazy"
            />
          </div>
        ) : (
          <img
            className="brand-asset"
            src={project.cover}
            alt={project.coverAlt}
            width="1254"
            height="1254"
            loading="lazy"
          />
        )}
        <span className="visual-label">
          {project.coverLabel ||
            (screen ? "Flutter interface render" : "Application identity")}
        </span>
      </div>
      {large && (
        <figcaption className="visual-caption">
          {project.coverCaption} ·{" "}
          <a href={project.cover}>
            View full image <ArrowUpRight size={12} />
          </a>
        </figcaption>
      )}
    </figure>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>
          {title}
          <span className="accent">.</span>
        </h2>
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}

export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li>
      <Check size={14} aria-hidden="true" />
      {children}
    </li>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a className="text-link" href={href}>
      {children}
      <ArrowRight size={16} />
    </a>
  );
}
