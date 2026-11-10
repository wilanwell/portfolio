import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const exists=async file=>{try{await access(file);return true;}catch{return false;}};
const files=await readdir(dist,{recursive:true});
const htmlFiles=files.filter(f=>f.endsWith('.html'));
assert.equal(htmlFiles.length,4,'Expected home, two projects and a 404 page.');
let checked=0;
for(const f of htmlFiles){
 const content=await readFile(path.join(dist,f),'utf8');
 assert.equal((content.match(/<h1(?:\s[^>]*)?>/g)||[]).length,1,`One h1 required: ${f}`);
 assert.match(content,/<html lang="en">/);
 assert.match(content,/<meta name="description" content="[^"]+">/);
 assert.match(content,/<main[^>]*id="main"/);
 assert.doesNotMatch(content,/window\.openai|globalThis\.Tweak|Choose photo|onclick=/);
 for(const script of content.matchAll(/<script\b([^>]*)>/g))assert.match(script[1],/\bsrc="[^"]+"/,`Inline script conflicts with the HTTP content policy: ${f}`);
 for(const match of content.matchAll(/<(?:a|img|script|link)\b[^>]*\b(?:href|src)="([^"]+)"/g)){
  const target=match[1].replaceAll('&amp;','&');
  if(/^https:\/\//.test(target)){const u=new URL(target);assert.ok(!u.username&&!u.password);continue;}
  if(target.startsWith('mailto:'))continue;
  assert.ok(target.startsWith('/')||target.startsWith('#'),`Unexpected URL: ${target}`);
  const [route,fragment]=target.split('#');
  const destination=route?path.join(dist,route,route.endsWith('/')?'index.html':''):path.join(dist,f);
  assert.ok(await exists(destination),`Missing target ${target} in ${f}`);
  if(fragment){const markup=await readFile(destination,'utf8');assert.ok(markup.includes(`id="${fragment}"`),`Missing anchor ${target}`);}
  checked++;
 }
 for(const image of content.matchAll(/<img\b[^>]*>/g))assert.match(image[0],/alt="[^"]+"/);
}
const cssFiles=files.filter(file=>file.endsWith('.css'));
assert.ok(cssFiles.length,'Expected compiled CSS assets.');
for(const cssFile of cssFiles){
 const css=await readFile(path.join(dist,cssFile),'utf8');
 for(const match of css.matchAll(/url\((['"]?)([^)'"\s]+)\1\)/g)){
  if(match[2].startsWith('data:'))continue;
  const assetPath=new URL(match[2],'https://portfolio.local/'+cssFile.replaceAll('\\','/')).pathname;
  assert.ok(await exists(path.join(dist,assetPath)),`Missing CSS asset ${match[2]}`);
 }
}
const profile=JSON.parse(await readFile(path.join(root,'content/profile.json'),'utf8'));
const projects=JSON.parse(await readFile(path.join(root,'content/projects.json'),'utf8'));
const plain=html=>html.replace(/<[^>]+>/g,' ').replace(/&(?:#x([\da-f]+)|#(\d+)|([a-z]+));/gi,(_,hex,num,name)=>hex?String.fromCodePoint(parseInt(hex,16)):num?String.fromCodePoint(Number(num)):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[name]||_)).replace(/\s+/g,' ').trim();
const home=plain(await readFile(path.join(dist,'index.html'),'utf8'));
for(const value of [profile.name,profile.university,profile.programmeName,profile.faculty,profile.programmeCode,profile.email,...profile.about])assert.ok(home.includes(value.replace(/\s+/g,' ')),`Profile content missing: ${value}`);
for(const project of projects){
 const text=plain(await readFile(path.join(dist,'projects',project.slug,'index.html'),'utf8'));
 const values=[project.name,project.problem,project.solution,...(project.inspiration?.paragraphs||[]),...project.contributions,...project.features.flatMap(feature=>[feature.title,feature.text,feature.note]),...project.challenges.flatMap(challenge=>[challenge.title,challenge.problem,challenge.solution]),project.validation,project.reflection];
 for(const value of values.filter(Boolean))assert.ok(text.includes(value.replace(/\s+/g,' ')),`Project content missing: ${project.slug}: ${value}`);
}
if(profile.draft){
 for(const f of htmlFiles)assert.match(await readFile(path.join(dist,f),'utf8'),/noindex, nofollow/);
 assert.match(await readFile(path.join(dist,'robots.txt'),'utf8'),/Disallow: \//);
}
console.log(`Checked ${htmlFiles.length} pages, ${checked} local references, ${cssFiles.length} compiled stylesheet(s), image descriptions and draft indexing rules.`);
