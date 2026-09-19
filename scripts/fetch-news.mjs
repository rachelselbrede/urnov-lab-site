#!/usr/bin/env node
/* Refreshes news.json with the latest IGI stories that mention the Urnov Lab.

   Run once a day by .github/workflows/news.yml, or by hand:  node scripts/fetch-news.mjs
   No dependencies. Needs Node 18 or newer.

   Sources, in order: the IGI website's WordPress API, which searches the full text of every
   story, so one that only mentions the lab in its body still counts; then the site's RSS feed
   as a fallback, which only carries recent stories. Everything that comes back is checked
   again here against TERMS, because the API's own search also matches loosely. */

import { readFileSync, writeFileSync } from 'node:fs';

const BASE = (process.env.NEWS_BASE_URL || 'https://innovativegenomics.org').replace(/\/$/, '');
const OUT = process.env.NEWS_OUT || 'news.json';
const KEEP = 6;                        /* stored in news.json; the page shows the first three */
const TIMEOUT = 20000;
const UA = 'urnov-lab-site news refresh (+https://github.com/rachelselbrede/urnov-lab-site)';

/* What counts as news about the lab. A story is kept when its title or text contains any of
   these, in any letter case. Add a line to widen the net, remove one to narrow it. Keep the
   terms specific: the IGI describes its whole mission as "CRISPR cures", so that phrase on
   its own matches nearly every story on the site. The run log shows which term each kept
   story matched and the sentence around it, which is the place to look when tuning. */
const TERMS = [
  'Urnov',
  'CRISPR Cures Core',
  'Pediatric CRISPR Cures',     /* the Center for Pediatric CRISPR Cures */
  'Beacon for CRISPR Cures',    /* the Danaher-IGI Beacon for CRISPR Cures */
  'CPS1',                       /* the first personalized therapy, for a newborn with CPS1 deficiency */
];

/* WordPress post types to search. "posts" is the standard one; "news" is tried in case the
   site keeps its stories in a type of their own. A type the site does not have is skipped. */
const TYPES = ['posts', 'news'];
const FEEDS = ['/feed/', '/news/feed/'];

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const matchers = TERMS.map(t => new RegExp('(^|[^a-z0-9])(' + esc(t) + ')(?![a-z0-9])', 'i'));
/* The term a text matches, with the words around the match, or null when it matches none */
function mention(s){
  for (const re of matchers){
    const m = re.exec(s);
    if (!m) continue;
    const at = m.index + m[1].length;
    const around = s.slice(Math.max(0, at - 70), at + m[2].length + 70).trim();
    return { term: m[2], around: (at > 70 ? '…' : '') + around + (at + m[2].length + 70 < s.length ? '…' : '') };
  }
  return null;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…',
  ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
const codePoint = n => (n > 0 && n < 0x110000) ? String.fromCodePoint(n) : '';

/* HTML in, plain text out */
function text(html){
  return String(html || '')
    .replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => codePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => codePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

/* One or two sentences of the excerpt, about 200 characters at most, ending cleanly */
function summary(html){
  let t = text(html).replace(/\s*(\[…\]|\[\.\.\.\]|…|\.\.\.)\s*$/, '').trim();
  if (!t) return '';
  const sentences = t.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  if (sentences){
    let out = '';
    for (const s of sentences){
      if (out && (out + s).trim().length > 200) break;
      out += s;
    }
    if (out.trim()) t = out.trim();
  }
  if (t.length > 220) t = t.slice(0, 200).replace(/\s+\S*$/, '') + '…';
  return t;
}

function isoDate(s){
  const m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(s);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
}

const pause = ms => new Promise(res => setTimeout(res, ms));

async function once(url){
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': UA,
      accept: 'application/json, application/rss+xml, application/xml;q=0.9, */*;q=0.5' } });
    return { ok: r.ok, status: r.status, body: await r.text() };
  } catch (e) {
    return { ok: false, status: 0, body: '', error: e.name === 'AbortError' ? 'timed out' : e.message };
  } finally {
    clearTimeout(timer);
  }
}

/* One request, retried once after a short pause when the site says no or falls over: the
   first request of a run has been refused before while the rest went through. */
async function get(path){
  let r = await once(BASE + path);
  if (!r.ok && r.status !== 404){
    await pause(2500);
    r = await once(BASE + path);
  }
  await pause(400);                   /* leave a gap between requests */
  return r;
}

const log = (path, note) => console.log(`  ${path}\n      ${note}`);

async function fromApi(){
  const items = [];
  let reached = false;
  for (const type of TYPES){
    for (const term of TERMS){
      /* Quoted so a two-word term is searched as a phrase. Sorted by date, because with a
         search term WordPress otherwise sorts by relevance. */
      const path = `/wp-json/wp/v2/${type}?search=${encodeURIComponent('"' + term + '"')}`
        + '&per_page=10&orderby=date&order=desc&_fields=date,date_gmt,link,title,excerpt,content';
      const r = await get(path);
      if (r.status === 404){ log(path, 'not there, skipping this type'); break; }
      if (!r.ok){ log(path, r.error || `HTTP ${r.status}`); continue; }
      let posts;
      try { posts = JSON.parse(r.body); } catch { log(path, 'not JSON'); continue; }
      if (!Array.isArray(posts)){ log(path, 'unexpected shape'); continue; }
      reached = true;
      let kept = 0;
      for (const p of posts){
        const title = text(p.title && p.title.rendered != null ? p.title.rendered : p.title);
        const excerpt = p.excerpt ? p.excerpt.rendered : '';
        const content = p.content ? p.content.rendered : '';
        const why = p.link && title ? mention(`${title} ${text(excerpt)} ${text(content)}`) : null;
        if (!why) continue;
        items.push({ title, url: p.link, date: isoDate(p.date_gmt || p.date), summary: summary(excerpt) || summary(content), why });
        kept++;
      }
      log(path, `${posts.length} stories, ${kept} about the lab`);
    }
  }
  return { items, reached };
}

async function fromFeeds(){
  const items = [];
  let reached = false;
  for (const path of FEEDS){
    const r = await get(path);
    if (!r.ok){ log(path, r.error || `HTTP ${r.status}`); continue; }
    const entries = r.body.match(/<item\b[\s\S]*?<\/item>/gi) || [];
    if (!entries.length){ log(path, 'no items in the feed'); continue; }
    reached = true;
    let kept = 0;
    for (const e of entries){
      const field = name => {
        const m = e.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
        return m ? m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1') : '';
      };
      const title = text(field('title'));
      const link = text(field('link'));
      const desc = field('description');
      const content = field('content:encoded');
      const why = link && title ? mention(`${title} ${text(desc)} ${text(content)}`) : null;
      if (!why) continue;
      items.push({ title, url: link, date: isoDate(text(field('pubDate'))), summary: summary(desc) || summary(content), why });
      kept++;
    }
    log(path, `${entries.length} stories, ${kept} about the lab`);
  }
  return { items, reached };
}

/* One entry per story, newest first, the first KEEP of them */
function tidy(items){
  const seen = new Set();
  const out = [];
  for (const it of items){
    const key = it.url.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  out.sort((a, b) => b.date.localeCompare(a.date));
  return out.slice(0, KEEP);
}

console.log(`Looking for Urnov Lab news on ${BASE}`);
const api = await fromApi();
let items = tidy(api.items);
let reached = api.reached;
let source = 'WordPress API';
if (!items.length){
  const feeds = await fromFeeds();
  items = tidy(feeds.items);
  reached = reached || feeds.reached;
  source = 'RSS feed';
}
if (!items.length){
  if (!reached){
    console.error(`Could not get an answer from ${BASE}. ${OUT} left as it was.`);
    process.exit(1);
  }
  console.log(`${BASE} answered, but no story matched TERMS. ${OUT} left as it was.`);
  process.exit(0);
}

const next = JSON.stringify({ source: `${BASE} (${source})`,
  items: items.map(({ why, ...it }) => it) }, null, 2) + '\n';
let prev = '';
try { prev = readFileSync(OUT, 'utf8'); } catch {}
if (prev === next){
  console.log(`${OUT} already has these ${items.length} stories, nothing to write.`);
} else {
  writeFileSync(OUT, next);
  console.log(`Wrote ${items.length} stories to ${OUT}:`);
}
for (const it of items){
  console.log(`  ${it.date}  ${it.title}`);
  console.log(`              matched "${it.why.term}": ${it.why.around}`);
}
