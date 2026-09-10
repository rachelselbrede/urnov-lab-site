# Urnov Lab website prototype

A single-file static site (`index.html`). No build step, no dependencies, nothing to install. It runs on GitHub Pages as-is.

## Put it online (about 10 minutes)

1. On github.com, create a new public repository named `urnov-lab-site` (under your own account for now).
2. Upload `index.html`, `README.md`, and `.nojekyll` to the repo (drag and drop on the repo page works).
3. In the repo, open Settings, then Pages. Under Build and deployment, set Source to "Deploy from a branch", pick `main` and `/ (root)`, and save.
4. Wait a minute or two. The site is live at `https://YOUR-USERNAME.github.io/urnov-lab-site/`.

Every later change is an edit to `index.html` and a commit. Pages redeploys on its own.

## Fill in before you show it

- Lab email in the Contact section (currently `lab@example.edu`).
- Team names, roles, and photos. Replace the `<span class="initials">` placeholder inside each `.portrait` with `<img src="photos/name.jpg" alt="Name">`. Shoot everyone the same way (same wall, same light, same crop) and the grid will look professional on its own.
- Confirm the mailing address and zip.
- The research section lists only programs already public in IGI, CZI, and Danaher announcements. Add or remove programs with Fyodor.
- The "Openings at the IGI" button links to the IGI homepage. Swap in the real jobs page.
- Add a social preview image (`og:image` in the head) once IGI comms can share one.

## What updates itself

The Publications section pulls recent papers from Europe PMC in the browser every time the page loads (author query on Urnov F / Urnov FD, 2020 onward, PubMed records only, newest first, eight shown). Nobody has to maintain it. The "See all publications on PubMed" link covers everything else. Adjust the query in the `<script>` block at the bottom if you want a different date range or count.

## If it gets approved

- Move the repo to a GitHub organization owned by the lab so it does not depend on one person's account.
- Decide on the address. Options are a `berkeley.edu` subdomain through campus IT, an IGI subdomain through IGI comms, or a purchased domain (about $10 to $20 a year) pointed at GitHub Pages.
- Ask IGI comms for brand colors, the logo, and headshots. The color and font tokens are at the top of the CSS in `:root`, so restyling is a handful of lines.
- Check accessibility once real content is in (UC expects WCAG AA). The page already has a skip link, visible focus states, reduced-motion support, and readable contrast.
