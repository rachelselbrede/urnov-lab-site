#!/usr/bin/env node
/* Checks that the lab's domain points at GitHub Pages, before the site is switched over to it.

   Run by .github/workflows/go-live.yml, or by hand:  node scripts/check-domain.mjs
   No dependencies. Needs Node 18 or newer.

   Exit code 0 means every required record is in place and the switch is safe to make.
   Exit code 1 means something is missing, and the report says exactly which record. */

import { promises as dns } from 'node:dns';

const DOMAIN = process.env.SITE_DOMAIN || 'www.urlab.bio';
const APEX = DOMAIN.replace(/^www\./, '');
const PAGES_HOST = process.env.PAGES_HOST || 'rachelselbrede.github.io';
const OWNER = PAGES_HOST.split('.')[0];

/* GitHub Pages' addresses, from docs.github.com, "Managing a custom domain for your GitHub Pages site" */
const GITHUB_A = ['185.199.108.153', '185.199.109.153', '185.199.110.153', '185.199.111.153'];
const GITHUB_AAAA = ['2606:50c0:8000::153', '2606:50c0:8001::153', '2606:50c0:8002::153', '2606:50c0:8003::153'];

let ok = true;
const good = (what, detail) => console.log(`  ok    ${what}${detail ? ': ' + detail : ''}`);
const bad = (what, detail) => { ok = false; console.log(`  FIX   ${what}${detail ? ': ' + detail : ''}`); };
const note = (what, detail) => console.log(`  note  ${what}${detail ? ': ' + detail : ''}`);

/* The records of one type for one name, or [] when there are none. A resolver that cannot
   answer at all is a different thing from an empty answer, so that is reported and fails. */
async function lookup(fn, name, type){
  try { return await fn(name); }
  catch (e) {
    if (e.code === 'ENODATA' || e.code === 'ENOTFOUND') return [];
    bad(`${name} ${type}`, `the DNS lookup itself failed (${e.code || e.message}). Is this computer able to resolve names?`);
    return null;
  }
}
const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

console.log(`Checking that ${DOMAIN} points at GitHub Pages (${PAGES_HOST})\n`);

/* www: a CNAME to the Pages host. Some DNS hosts flatten a CNAME into A records, which is
   fine as long as the addresses are GitHub's. */
const wwwCnameRaw = await lookup(dns.resolveCname, DOMAIN, 'CNAME');
const wwwA = wwwCnameRaw === null ? null : await lookup(dns.resolve4, DOMAIN, 'A');
const wwwCname = (wwwCnameRaw || []).map(s => s.replace(/\.$/, '').toLowerCase());
if (wwwCnameRaw === null || wwwA === null) { /* already reported */ }
else if (wwwCname.includes(PAGES_HOST.toLowerCase())) good(`${DOMAIN} CNAME`, PAGES_HOST);
else if (wwwA.length && wwwA.every(ip => GITHUB_A.includes(ip))) good(`${DOMAIN} A`, wwwA.join(', '));
else if (wwwCname.length) bad(`${DOMAIN} CNAME`, `points at ${wwwCname.join(', ')}, should be ${PAGES_HOST}`);
else if (wwwA.length) bad(`${DOMAIN} A`, `points at ${wwwA.join(', ')}, should be a CNAME to ${PAGES_HOST}`);
else bad(`${DOMAIN}`, `no record found. Add a CNAME record: host "www", data "${PAGES_HOST}"`);

/* apex: the four A records, so urlab.bio redirects to www.urlab.bio */
const apexA = await lookup(dns.resolve4, APEX, 'A');
const missingA = GITHUB_A.filter(ip => !(apexA || []).includes(ip));
const strayA = (apexA || []).filter(ip => !GITHUB_A.includes(ip));
if (apexA === null) { /* already reported */ }
else if (apexA.length && !missingA.length && !strayA.length) good(`${APEX} A`, apexA.join(', '));
else {
  if (!apexA.length) bad(`${APEX} A`, `no A records found. Add four A records on host "@": ${GITHUB_A.join(', ')}`);
  if (missingA.length && apexA.length) bad(`${APEX} A`, `missing ${missingA.join(', ')}`);
  if (strayA.length) bad(`${APEX} A`, `still points at ${strayA.join(', ')}, which is not GitHub. Delete those records (they are usually the Squarespace defaults)`);
}

/* apex AAAA: optional, IPv6 visitors only */
const apexAAAARaw = await lookup(dns.resolve6, APEX, 'AAAA');
const apexAAAA = (apexAAAARaw || []).map(s => s.toLowerCase());
if (apexAAAARaw === null) { /* already reported */ }
else if (!apexAAAA.length) note(`${APEX} AAAA`, 'none, which is fine (IPv6 is optional)');
else if (sameSet(apexAAAA, GITHUB_AAAA)) good(`${APEX} AAAA`, 'all four GitHub addresses');
else bad(`${APEX} AAAA`, `found ${apexAAAA.join(', ')}; either remove them or use exactly ${GITHUB_AAAA.join(', ')}`);

/* The verification record is optional for the switch but is what stops anyone else from
   claiming the domain on GitHub Pages, so say whether it is there. */
const challenge = `_github-pages-challenge-${OWNER}.${APEX}`;
const txt = await lookup(dns.resolveTxt, challenge, 'TXT');
if (txt === null) { /* already reported */ }
else if (txt.length) good(`${challenge} TXT`, 'present (domain verification record)');
else note(`${challenge} TXT`, 'not found. Verifying the domain on GitHub is recommended; see the README');

console.log('');
if (ok) {
  console.log(`DNS is ready: ${DOMAIN} points at GitHub Pages.`);
} else {
  console.log(`Not ready yet. Fix the lines marked FIX at the DNS host (Squarespace), then run this again.`);
  console.log(`New records can take from a few minutes to a day to show up.`);
  process.exit(1);
}
