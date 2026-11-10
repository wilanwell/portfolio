import profileData from '../../content/profile.json';
import projectData from '../../content/projects.json';

export interface Profile {
  draft: boolean;
  name: string;
  university: string;
  degree: string;
  programmeName: string;
  programmeCode: string;
  faculty: string;
  campus: string;
  specialisation: string;
  studyPeriod: string;
  graduation: string;
  location: string;
  internshipStart: string;
  internshipEnd: string;
  email: string;
  github: string;
  linkedin: string;
  portrait: string;
  cv: string;
  siteUrl: string;
  intro: string;
  about: string[];
}

export interface Project {
  slug: string;
  conciseCaseStudy?: boolean;
  name: string;
  category: string;
  summary: string;
  tagline: string;
  status: string;
  statusAsOf: string;
  platform: string;
  period: string;
  startDate?: string;
  projectType?: string;
  targetUsers?: string;
  role: string;
  contributions: string[];
  contributionIntro?: string;
  technologies: string[];
  cover: string;
  coverAlt: string;
  coverCaption: string;
  coverLabel?: string;
  coverKind: string;
  github: string;
  demo: string;
  store: string;
  overview: string;
  inspiration?: { title: string; paragraphs: string[] };
  problem: string;
  solution?: string;
  objectives: string[];
  features: { title: string; text: string; note?: string }[];
  supportingFeatures?: string;
  learningFlow?: string[];
  architecture: string;
  technologyDetails?: { name: string; purpose: string }[];
  challenges: { title: string; problem: string; solution: string }[];
  validation: string;
  testingScenarios?: string[];
  releaseMilestone?: { version: string; date: string; checks: string[]; scope: string };
  aiDevelopment?: { overview: string; practices: string[]; productBoundary: string };
  next: string;
  nextSteps?: string[];
  reflection: string;
}

export const profile: Profile = profileData;
export const projects: Project[] = projectData;
export const projectPath = (project: Project) => `/projects/${project.slug}/`;
export const identity = profile.name || 'Software Engineering Portfolio';
export const availability = `${profile.internshipStart} – ${profile.internshipEnd}`;

export function monthYear(value: string): string {
  // Calendar dates have no timezone. Preserve the supplied day rather than
  // parsing a local midnight and moving it to the previous day in UTC.
  const humanDate = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(value);
  if (humanDate) return `${Number(humanDate[1])} ${humanDate[2].slice(0, 3)} ${humanDate[3]}`;
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!isoDate) return value;
  const date = new Date(Date.UTC(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3])));
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export const shortAvailability = `${monthYear(profile.internshipStart)} – ${monthYear(profile.internshipEnd)}`;
