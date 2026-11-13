import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCheck,
  Compass,
  Database,
  Hammer,
  PenTool,
  Quote,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import {
  profile,
  projects,
  shortAvailability,
  projectPath,
} from "../lib/content";
import {
  ActionLink,
  CheckItem,
  Contact,
  GithubIcon,
  ProjectVisual,
  Tags,
} from "./ui";
import ProfileCard from "./ProfileCard";

function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={{ y: [12, 0], opacity: [0.6, 1] }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionIntro({
  index,
  label,
  title,
  id,
  description,
}: {
  index: string;
  label: string;
  title: string;
  id: string;
  description?: ReactNode;
}) {
  return (
    <Reveal className="sec-head">
      <div>
        <p className="sec-label">
          <span className="sec-index">{index}</span>
          {label}
        </p>
        <h2 id={id}>{title}</h2>
      </div>
      {description && <p className="sec-desc">{description}</p>}
    </Reveal>
  );
}

const toolkit = [
  {
    icon: Smartphone,
    title: "Mobile development",
    text: "Cross-platform Flutter applications with structured state management and feature-based code organisation.",
    items: ["Flutter", "Dart", "Riverpod"],
  },
  {
    icon: Database,
    title: "Backend & data",
    text: "Supabase services, PostgreSQL data and file storage behind the application experience.",
    items: ["Supabase", "PostgreSQL", "Storage"],
  },
  {
    icon: CheckCheck,
    title: "Testing & delivery",
    text: "Automated Flutter tests, version control with Git and releases on Google Play, from testing tracks to production.",
    items: ["Flutter Test", "Git", "Google Play release"],
  },
];

const stack = [
  ...new Set([
    ...toolkit.flatMap((group) => group.items),
    ...projects.flatMap((project) => project.technologies),
  ]),
];

const process = [
  {
    icon: Compass,
    title: "Understand",
    text: "Start with the user, the problem and the requirements.",
  },
  {
    icon: PenTool,
    title: "Design",
    text: "Map the flow, including the states in between.",
  },
  {
    icon: Hammer,
    title: "Build",
    text: "Connect the interface, application logic and data.",
  },
  {
    icon: RefreshCw,
    title: "Improve",
    text: "Test behaviour, investigate issues and refine.",
  },
];

export default function HomePortfolio() {
  const [firstName, lastName] = profile.name.split(" @ ");
  const liveCount = projects.filter((project) => project.store).length;
  return (
    <>
      <section className="landing wrap" aria-labelledby="intro-heading">
        <div className="intro-copy">
          <a className="pill" href="/#contact">
            <span className="status-dot" />
            Open to internship
            <span className="pill-divider" aria-hidden="true" />
            {shortAvailability}
            <ArrowRight size={14} aria-hidden="true" />
          </a>
          <p className="intro-kicker">
            Software Engineering Student · {profile.university}
          </p>
          <h1 id="intro-heading" aria-label={profile.name}>
            {firstName}
            {lastName && <span className="intro-accent"> @ {lastName}</span>}
          </h1>
          <p className="intro-statement">{profile.summary || profile.intro}</p>
          <div className="actions">
            <ActionLink href="/#projects" primary icon="down">
              View selected work
            </ActionLink>
            {profile.cv ? (
              <ActionLink href={profile.cv} download icon="download">
                Download CV
              </ActionLink>
            ) : (
              <ActionLink href="/#contact" icon="mail">
                Get in touch
              </ActionLink>
            )}
            {profile.github && (
              <a className="ghost-link" href={profile.github}>
                <GithubIcon size={16} />
                GitHub
              </a>
            )}
          </div>
          <dl className="intro-facts">
            <div>
              <dt>Focus</dt>
              <dd>Mobile development</dd>
            </div>
            <div>
              <dt>Programme</dt>
              <dd>{profile.specialisation || profile.degree}</dd>
            </div>
            <div>
              <dt>Projects</dt>
              <dd>
                {[
                  liveCount && `${liveCount} live on Google Play`,
                  projects.length - liveCount &&
                    `${projects.length - liveCount} in development`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </dd>
            </div>
          </dl>
        </div>
        <ProfileCard />
      </section>

      <section className="stack-strip" aria-label="Technologies I work with">
        <div className="wrap stack-inner">
          <p>Technologies I work with</p>
          <ul>
            {stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec wrap" id="projects" aria-labelledby="work-heading">
        <SectionIntro
          index="01"
          label="Selected work"
          id="work-heading"
          title="Ideas turned into working applications"
          description="What I’m building, how it works and what I’m learning along the way."
        />
        <div className="work-list">
          {projects.map((project, index) => (
            <Reveal key={project.slug}>
              <article className="work-card">
                <div className="work-visual">
                  <ProjectVisual project={project} />
                </div>
                <div className="work-body">
                  <div className="work-top">
                    <span className="work-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="work-category">{project.category}</span>
                  </div>
                  <h3>
                    <a href={projectPath(project)}>{project.name}</a>
                  </h3>
                  <p className="work-summary">{project.summary}</p>
                  <ul className="work-features">
                    {project.features.slice(0, 3).map((feature) => (
                      <CheckItem key={feature.title}>{feature.title}</CheckItem>
                    ))}
                  </ul>
                  <dl className="work-meta">
                    <div>
                      <dt>Platform</dt>
                      <dd>{project.platform}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>
                        <span className="status-dot" />
                        {project.status}
                      </dd>
                    </div>
                    {project.downloads && (
                      <div>
                        <dt>Downloads</dt>
                        <dd>{project.downloads} on Google Play</dd>
                      </div>
                    )}
                  </dl>
                  <Tags items={project.technologies} />
                  <div className="work-actions">
                    <span className="work-cta" aria-hidden="true">
                      Read case study <ArrowRight size={16} />
                    </span>
                    {project.store && (
                      <a className="work-store" href={project.store}>
                        Get it on Google Play
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="sec wrap" id="about" aria-labelledby="about-heading">
        <SectionIntro
          index="02"
          label="About"
          id="about-heading"
          title="The person behind the work"
        />
        <div className="about-layout">
          <Reveal className="about-text">
            {profile.headline && (
              <h3 className="about-lead">{profile.headline}</h3>
            )}
            {profile.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {profile.philosophy && (
              <figure className="philosophy">
                <figcaption>
                  <Quote size={16} aria-hidden="true" />
                  Work philosophy
                </figcaption>
                <blockquote>{profile.philosophy}</blockquote>
              </figure>
            )}
          </Reveal>
          <Reveal className="glance">
            <p className="glance-title">At a glance</p>
            <dl>
              <div>
                <dt>Studying</dt>
                <dd>
                  {profile.degree}, {profile.specialisation}
                </dd>
              </div>
              <div>
                <dt>University</dt>
                <dd>{profile.university}</dd>
              </div>
              {profile.campus && (
                <div>
                  <dt>Campus</dt>
                  <dd>{profile.campus}</dd>
                </div>
              )}
              <div>
                <dt>Internship</dt>
                <dd>{shortAvailability}</dd>
              </div>
              {profile.location && (
                <div>
                  <dt>Location</dt>
                  <dd>{profile.location}</dd>
                </div>
              )}
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="sec wrap" id="skills" aria-labelledby="skills-heading">
        <SectionIntro
          index="03"
          label="Skills"
          id="skills-heading"
          title="Toolkit and capabilities"
          description="Applied across my current mobile projects, from the interface to the data layer."
        />
        <div className="skill-grid">
          {toolkit.map(({ icon: Icon, title, text, items }) => (
            <Reveal className="skill-card" key={title}>
              <span className="skill-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
              <Tags items={items} />
            </Reveal>
          ))}
        </div>
        <div className="process-block">
          <p className="process-title">How I approach a project</p>
          <ol className="process-list">
            {process.map(({ icon: Icon, title, text }, index) => (
              <li key={title}>
                <span className="process-step">
                  <Icon size={16} aria-hidden="true" />
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Education />
      <Contact />
    </>
  );
}

function Education() {
  return (
    <section
      className="sec wrap"
      id="education"
      aria-labelledby="education-heading"
    >
      <SectionIntro
          index="04"
          label="Education"
          id="education-heading"
          title="Academic foundation"
        />
      <Reveal className="edu-card">
        <span className="edu-icon">
          <BookOpen size={22} aria-hidden="true" />
        </span>
        <div className="edu-body">
          <div className="edu-top">
            <p className="edu-university">{profile.university}</p>
            {(profile.studyPeriod || profile.graduation) && (
              <p className="edu-period">
                {profile.studyPeriod}
                {profile.graduation &&
                  `${profile.studyPeriod ? " · " : ""}Expected graduation ${profile.graduation}`}
              </p>
            )}
          </div>
          <h3>{profile.programmeName || profile.degree}</h3>
          <dl className="edu-facts">
            {profile.faculty && (
              <div>
                <dt>Faculty</dt>
                <dd>{profile.faculty}</dd>
              </div>
            )}
            {profile.programmeCode && (
              <div>
                <dt>Programme code</dt>
                <dd>{profile.programmeCode}</dd>
              </div>
            )}
            {profile.campus && (
              <div>
                <dt>Campus</dt>
                <dd>{profile.campus}</dd>
              </div>
            )}
            {profile.specialisation && (
              <div>
                <dt>Specialisation</dt>
                <dd>{profile.specialisation}</dd>
              </div>
            )}
          </dl>
        </div>
      </Reveal>
    </section>
  );
}

