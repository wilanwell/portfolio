import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const profile = JSON.parse(await readFile(path.join(root, 'content/profile.json'), 'utf8'));
const projects = JSON.parse(await readFile(path.join(root, 'content/projects.json'), 'utf8'));
const exists = async file => { try { await access(file); return true; } catch { return false; } };

function validateUrl(value) {
  if (!value) return;
  if (/^\/(?!\/)[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..')) return;
  const parsed = new URL(value);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Use an HTTPS URL without credentials.');
}
if (profile.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(profile.email)) throw new Error('Invalid email address.');
for (const key of ['github','linkedin','portrait','cv']) validateUrl(profile[key]);
if (profile.siteUrl && (!profile.siteUrl.startsWith('https://') || new URL(profile.siteUrl).origin !== profile.siteUrl.replace(/\/$/, ''))) throw new Error('siteUrl must be an HTTPS origin without a path.');
for (const key of ['portrait', 'cv']) {
  if (profile[key] && (!profile[key].startsWith('/assets/') || !await exists(path.join(root, 'public', profile[key])))) throw new Error(`${key} must point to an existing file under public/assets.`);
}
const slugs = new Set();
for (const project of projects) {
  if (!/^[a-z][a-z0-9-]+$/.test(project.slug) || slugs.has(project.slug)) throw new Error('Project slugs must be unique and URL-safe.');
  slugs.add(project.slug);
  if (!['brand', 'screen'].includes(project.coverKind)) throw new Error('Unsupported project image kind.');
  for (const key of ['cover','github','demo','store']) validateUrl(project[key]);
  if (!await exists(path.join(root, 'public', project.cover))) throw new Error(`Missing project image: ${project.cover}`);
}
if (process.argv.includes('--release')) {
  const missing = ['name','university','internshipStart','internshipEnd','email','portrait','cv'].filter(key => !profile[key]);
  if (missing.length || profile.draft || projects.some(project => !project.role || !project.contributions.length)) {
    throw new Error(`Release is not ready. Complete profile fields: ${missing.join(', ') || 'none'}; set draft=false and confirm project roles/contributions. Use npm run build for local review.`);
  }
}
console.log(`Content validated: ${projects.length} projects; ${profile.draft ? 'draft' : 'public'} mode.`);
