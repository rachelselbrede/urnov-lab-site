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
- Partner logos. The "Partners and supporters" strip uses files in `logos/`, pulled from each organization's own website (IGI, UC Berkeley, UCSF, CZI) or from public-domain vector copies of the official marks on Wikimedia Commons (Danaher, Penn Medicine), plus CHOP's own PNG. Logos are trademarks of their owners: confirm usage with each organization's communications office before a public launch, and prune the list to the partners the lab wants named. To change a logo, replace the file and adjust the `--h` height on its `<li>` so it sits at a similar visual weight.
- Videos. The Watch section embeds YouTube videos through youtube-nocookie.com and loads the player only when someone clicks a card. To add one, copy a `.video` card and change the video id, title, and duration.

## What updates itself

The Publications section pulls recent papers from Europe PMC in the browser every time the page loads (author query on Urnov F / Urnov FD, 2020 onward, PubMed records only, newest first, eight shown). Nobody has to maintain it. The "See all publications on PubMed" link covers everything else. Adjust the query in the `<script>` block at the bottom if you want a different date range or count.

## If it gets approved

- Move the repo to a GitHub organization owned by the lab so it does not depend on one person's account.
- Decide on the address. Options are a `berkeley.edu` subdomain through campus IT, an IGI subdomain through IGI comms, or a purchased domain (about $10 to $20 a year) pointed at GitHub Pages.
- The palette follows the IGI brand guidelines (innovativegenomics.org/resources/member-resources/brand-guidelines/): IGI Deep Blue for text and dark panels, IGI Blue for links and the corrected base, Slate Grey for rules, Human Health Red for the disease-causing variant. Official tints are used where the true colors would fail contrast on dark panels. Fonts are Source Serif 4 and Inter, the pairing UC Berkeley's own site uses. All tokens are at the top of the CSS in `:root`. Ask IGI comms for headshots and to confirm logo and color usage before launch.
- Check accessibility once real content is in (UC expects WCAG AA). The page already has a skip link, visible focus states, reduced-motion support, and readable contrast.
