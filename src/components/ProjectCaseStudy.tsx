import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { projects, projectPath } from "../lib/content";
import type { Project } from "../lib/content";
import { ActionLink, Contact, ProjectVisual, Tags } from "./ui";

function CaseSection({
  id,
  index,
  label,
  title,
  children,
}: {
  id: string;
  index: number;
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id}>
      <div className="eyebrow">
        {String(index).padStart(2, "0")} / {label}
      </div>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Features({ project }: { project: Project }) {
  return (
    <div className="feature-list">
      {project.features.map((feature, index) => (
        <div key={feature.title}>
          <span className="feature-number">0{index + 1}</span>
          <div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
            {feature.note && <p className="feature-note">{feature.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
function Contribution({ project }: { project: Project }) {
  return (
    <>
      {project.contributionIntro && <p>{project.contributionIntro}</p>}
      {project.contributions.length ? (
        <ul>
          {project.contributions.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      ) : (
        <p className="pending">
          Individual responsibilities and project ownership are being confirmed
          for this portfolio.
        </p>
      )}
    </>
  );
}
function Challenges({ project }: { project: Project }) {
  return (
    <>
      {project.challenges.map((challenge) => (
        <article className="challenge" key={challenge.title}>
          <h3>{challenge.title}</h3>
          <div className="challenge-label">The challenge</div>
          <p>{challenge.problem}</p>
          <div className="challenge-label">The approach</div>
          <p>{challenge.solution}</p>
        </article>
      ))}
    </>
  );
}

export default function ProjectCaseStudy({ project }: { project: Project }) {
  const concise = project.conciseCaseStudy === true;
  const sections = concise
    ? [
        ["overview", "Overview"],
        ["contribution", "My contribution"],
        ["features", "Key features"],
        ["challenges", "Engineering challenge"],
        ["validation", "Testing & validation"],
      ]
    : [
        ["overview", "Overview"],
        ["features", "Key features"],
        ["contribution", "My contribution"],
        ["architecture", "Technology & architecture"],
        ["challenges", "Engineering challenges"],
        ["validation", "Testing & validation"],
        ["reflection", "Reflection & next steps"],
      ];
  const nextProject =
    projects[(projects.indexOf(project) + 1) % projects.length];
  return (
    <>
      <div className="wrap">
        <a className="back-link" href="/#projects">
          <ArrowLeft size={15} />
          Back to selected projects
        </a>
        <section className="project-intro">
          <div className="case-eyebrow">
            <span className="eyebrow">{project.category}</span>
            <span className="project-status">
              <span className="status-dot" />
              {project.status}
            </span>
          </div>
          <h1>
            {project.name}
            <span className="accent">.</span>
          </h1>
          <p className="lead">{concise ? project.overview : project.summary}</p>
          <Tags items={project.technologies} />
          {(project.demo || project.github || project.store) && (
            <div className="actions">
              {project.demo && (
                <ActionLink href={project.demo} primary>
                  Watch demo
                </ActionLink>
              )}
              {project.github && (
                <ActionLink href={project.github}>View source</ActionLink>
              )}
              {project.store && (
                <ActionLink href={project.store}>Google Play</ActionLink>
              )}
            </div>
          )}
          <dl className="facts">
            <div>
              <dt>Platform</dt>
              <dd>{project.platform}</dd>
            </div>
            {project.projectType && (
              <div>
                <dt>Project type</dt>
                <dd>{project.projectType}</dd>
              </div>
            )}
            <div>
              <dt>My role</dt>
              <dd>{project.role || "To be confirmed"}</dd>
            </div>
            {project.targetUsers && (
              <div>
                <dt>Target users</dt>
                <dd>{project.targetUsers}</dd>
              </div>
            )}
            <div>
              <dt>{project.startDate ? "Start date" : "Period"}</dt>
              <dd>{project.period || "Ongoing development"}</dd>
            </div>
            {project.currentVersion ? (
              <div>
                <dt>Current release</dt>
                <dd>
                  v{project.currentVersion}
                  {project.downloads && ` · ${project.downloads} downloads`}
                </dd>
              </div>
            ) : (
              project.releaseMilestone && (
                <div>
                  <dt>Release reference</dt>
                  <dd>v{project.releaseMilestone.version}</dd>
                </div>
              )
            )}
          </dl>
          <ProjectVisual project={project} large />
        </section>
        <div className="case-layout">
          <aside className="case-nav">
            <div className="eyebrow">Inside this project</div>
            <nav aria-label="Project sections">
              {sections.map(([id, title]) => (
                <a href={`#${id}`} key={id}>
                  {title}
                </a>
              ))}
            </nav>
          </aside>
          <div className="case-content">
            <CaseSection
              id="overview"
              index={1}
              label="The context"
              title="Project overview"
            >
              {!concise && <p>{project.overview}</p>}
              <h3>{project.solution ? "The Problem" : "The problem"}</h3>
              <p>{project.problem}</p>
              {project.solution ? (
                <>
                  <h3>The Solution</h3>
                  <p>{project.solution}</p>
                </>
              ) : (
                <ul>
                  {project.objectives.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              )}
              {project.inspiration && (
                <div className="inspiration-note" id="inspiration">
                  <h3>{project.inspiration.title}</h3>
                  {project.inspiration.paragraphs.map((text) => (
                    <p key={text}>{text}</p>
                  ))}
                </div>
              )}
            </CaseSection>
            {concise ? (
              <>
                <CaseSection
                  id="contribution"
                  index={2}
                  label="The contribution"
                  title="My contribution"
                >
                  <Contribution project={project} />
                </CaseSection>
                <CaseSection
                  id="features"
                  index={3}
                  label="The experience"
                  title="Key features"
                >
                  <Features project={project} />
                </CaseSection>
                <CaseSection
                  id="challenges"
                  index={4}
                  label="The decision"
                  title="Engineering challenge"
                >
                  <Challenges project={project} />
                  <p className="reflection-note">{project.reflection}</p>
                </CaseSection>
                <CaseSection
                  id="validation"
                  index={5}
                  label="The checks"
                  title="Testing & validation"
                >
                  {project.releaseMilestone && (
                    <h3 className="release-reference">
                      v{project.releaseMilestone.version} ·{" "}
                      {project.releaseMilestone.date}
                    </h3>
                  )}
                  <p>{project.validation}</p>
                </CaseSection>
              </>
            ) : (
              <>
                <CaseSection
                  id="features"
                  index={2}
                  label="The experience"
                  title="Key features"
                >
                  <Features project={project} />
                </CaseSection>
                <CaseSection
                  id="contribution"
                  index={3}
                  label="The contribution"
                  title="My contribution"
                >
                  <Contribution project={project} />
                </CaseSection>
                <CaseSection
                  id="architecture"
                  index={4}
                  label="The foundations"
                  title="Technology & architecture"
                >
                  <p>{project.architecture}</p>
                  <Tags items={project.technologies} />
                </CaseSection>
                <CaseSection
                  id="challenges"
                  index={5}
                  label="The decisions"
                  title="Engineering challenges"
                >
                  <Challenges project={project} />
                </CaseSection>
                <CaseSection
                  id="validation"
                  index={6}
                  label="The checks"
                  title="Testing & validation"
                >
                  <p>{project.validation}</p>
                  <p className="status-reference">
                    Project status reference: {project.statusAsOf}.
                  </p>
                </CaseSection>
                <CaseSection
                  id="reflection"
                  index={7}
                  label="The learning"
                  title="Reflection & next steps"
                >
                  <p>{project.reflection}</p>
                  <h3>What’s next</h3>
                  <p>{project.next}</p>
                </CaseSection>
              </>
            )}
          </div>
        </div>
        {nextProject !== project && (
          <section className="case-next">
            <div>
              <div className="eyebrow">Keep exploring</div>
              <h2>{nextProject.name}</h2>
            </div>
            <ActionLink href={projectPath(nextProject)} primary>
              Explore project
            </ActionLink>
          </section>
        )}
      </div>
      <Contact />
    </>
  );
}
