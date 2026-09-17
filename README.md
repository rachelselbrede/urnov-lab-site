# Urnov Lab website prototype

A static site with no build step, no dependencies and nothing to install. It runs on GitHub Pages as-is.

```
index.html        the whole site: markup, styles and scripts in one file
404.html          shown for any unknown URL
social/           the link preview card (PNG) and the HTML it is rendered from
logos/            partner wordmarks
photos/           team and group photos (mostly empty for now)
news.json         the latest IGI stories about the lab, written by the news workflow
scripts/          fetch-news.mjs, which finds those stories
.github/          the workflow that runs it once a day
robots.txt        points crawlers at the sitemap
sitemap.xml       the one page
.nojekyll         tells GitHub Pages to serve the files as they are
```

## Put it online (about 10 minutes)

1. On github.com, create a new public repository named `urnov-lab-site` (under your own account for now).
2. Upload everything in this folder to the repo, keeping the folder structure (drag and drop on the repo page works).
3. In the repo, open Settings, then Pages. Under Build and deployment, set Source to "Deploy from a branch", pick `main` and `/ (root)`, and save.
4. Wait a minute or two. The site is live at `https://YOUR-USERNAME.github.io/urnov-lab-site/`.

Every later change is an edit to `index.html` and a commit. Pages redeploys on its own.

## Fill in before you show it

- Lab email in the Contact section (currently `lab@example.edu`). It is deliberately left out of the structured data until it is real.
- The PI portrait. `index.html` already points at `photos/fyodor-urnov.jpg`, so saving the file under that name is the whole job. `photos/README.txt` has the URL of the portrait on the UC Berkeley VC for Research faculty page and a note to clear its reuse with IGI communications.
- Lab group photo. Save it as `photos/lab-group.jpg` (landscape, at least 1600 px wide, JPEG) and commit. The hero swaps the sequence panel for the photo automatically when the file exists. Until then the page asks for that file and gets a 404, which is how it knows the photo is not there yet.
- Team names, roles, and photos. Twenty placeholder cards are waiting, each a silhouette over "Team member" and a guessed role; see "Adding people" below. Shoot everyone the same way (same wall, same light, same crop) and the grid will look professional on its own.
- Confirm the mailing address and zip. It appears twice: in the Contact section and in the JSON-LD block in the `<head>`. Both have to change together.
- The research section lists only programs already public in IGI, CZI, and Danaher announcements. Add or remove programs with Fyodor.
- The "Openings at the IGI" button links to the IGI homepage. Swap in the real jobs page.
- Partner logos. The "Partners and supporters" strip uses files in `logos/`, pulled from each organization's own website (IGI, UC Berkeley, UCSF, CZI) or from public-domain vector copies of the official marks on Wikimedia Commons (Danaher, Penn Medicine), plus CHOP's own PNG. Logos are trademarks of their owners: confirm usage with each organization's communications office before a public launch, and prune the list to the partners the lab wants named. To change a logo, replace the file and adjust the `--h` height on its `<li>` so it sits at a similar visual weight.
- Videos. The Watch section embeds YouTube videos through youtube-nocookie.com and loads the player only when someone clicks a card. To add one, copy a `.video` card and change the video id, title, and duration.

## Adding people

The PI card sits on its own above the roster, because it carries a bio and a wider portrait. Everyone else is one `<li>` in the list below it:

```html
<li class="person">
  <div class="portrait"></div>
  <h3 class="name">Jane Doe</h3>
  <p class="role">Staff scientist</p>
</li>
```

Copy it, change the two lines of text, done. Until a photo is named, the frame shows a silhouette placeholder drawn by the CSS, so a card without its headshot yet still looks deliberate. Add a `<p class="bio">` if someone needs a paragraph, the way the PI card has one. The order on the page is the order of the `<li>` elements.

Twenty placeholder cards are laid out below the PI, each one a silhouette over "Team member" and a guessed role:

```html
<li class="person">
  <div class="portrait"></div>
  <h3 class="name">Team member</h3>
  <p class="role">Staff scientist</p>
</li>
```

Filling a slot is overwriting those two lines with the real name and role. Nothing else marks a card as a placeholder, so there is no flag to remember to take out.

There is nothing special about twenty. The grid keeps adding rows as you add `<li>` elements, so take it well past twenty or cut it back without touching any CSS. The roles on the slots are a guess at the shape of the lab and are meant to be overwritten.

The grid runs five across on a wide screen, four from 1000px, three from 760px and two from 480px, so cards stay between about 130px and 215px wide at every size. To split the roster into groups, close the `<ul>`, add an `<h3>` heading, and open another one; the CSS does not care how many lists there are.

For a headshot, save it in `photos/` and name the file on the person's `<li>`:

```html
<li class="person" data-photo="photos/jane-doe.jpg">
```

The photo replaces the silhouette only once it has actually loaded, so a misspelled filename leaves the silhouette in place rather than a broken image icon.

Portraits are cropped to fill a 4:5 frame, the PI's included, so an upright headshot around 600 px wide drops straight in. A landscape photo, or one where the subject is off to one side, gets a slice taken out of its middle and the sides thrown away, which can cut the subject in half. Steer the crop instead of re-cropping the file:

```html
<li class="person" data-photo="photos/jane-doe.jpg" data-focus="69% 40%">
```

Raise the first percentage to move the crop right, lower it to move left; the second does the same vertically. Leave `data-focus` off and the crop comes from dead centre, which is right for most headshots. Twenty headshots is a real amount of weight on the page, so they are lazy-loaded and only fetched as the section comes into view. Still save them around 600 px wide rather than straight off the camera.

The `alt` on these photos is set to empty on purpose. The person's name is on the very next line, and a screen reader announcing it twice in a row helps nobody.

Two escape hatches, if you ever need them. Writing an `<img>` into `.portrait` by hand overrides everything above and is left alone. And if you forget the `<div class="portrait"></div>` line when copying a card, it gets added for you, so the card still lines up with the others.

With scripting turned off the names, roles, portrait frames and silhouettes all still render; only the headshots are missing. That is why the roster lives in the markup rather than in a list inside the script: it keeps the team in the page source, where search engines and anything that reads the HTML directly can see it.

## The link preview card

`social/og-image.png` is what Slack, Teams, email and social platforms show when someone posts the link. It is rendered from `social/og-image.html`, which is ordinary HTML using the same palette and fonts as the site. To change the wording, edit that file and re-render it:

```
chrome --headless --screenshot=social/og-image.png --window-size=1200,630 \
       --hide-scrollbars social/og-image.html
```

Check the result is exactly 1200x630. Some headless builds report a shorter viewport than the window size and silently leave the bottom of the card unpainted; if that happens, render taller and crop the top 1200x630.

The card is entirely type, with no IGI or partner marks on it, so it does not need a logo usage sign-off the way the partners strip does.

## What updates itself

The Publications section pulls recent papers from Europe PMC in the browser (author query on Urnov F / Urnov FD, 2020 onward, PubMed records only, newest first, eight shown), skipping news pieces, interviews and errata by publication type. Nobody has to maintain it. Adjust the query or the skip list in the `<script>` block at the bottom for a different date range, count or filter. If you change the filter, also bump `PUBS_KEY`, or visitors keep the old cached list for a day.

A successful result is kept in the visitor's browser and reused for a day, so most visits do not call the API at all, and a Europe PMC outage leaves the last known list on the page rather than an empty section. A first-time visitor during an outage gets one line pointing at the PubMed link below.

The News section refreshes itself once a day. The "Refresh news" workflow in `.github/workflows/news.yml` runs `scripts/fetch-news.mjs`, which asks the IGI website for stories that mention the lab, writes the newest six to `news.json`, and commits the file when something changed. GitHub Pages redeploys on its own after that commit. The page shows the first three, and falls back to the three cards written into `index.html` if `news.json` is missing or empty. The "More news from the IGI" link under the cards covers everything else.

What counts as "about the lab" is the `TERMS` list at the top of the script: Urnov, CRISPR Cures Core, Pediatric CRISPR Cures, Beacon for CRISPR Cures, and CPS1. A story is kept when its title or text contains any of them. Add or remove lines there to widen or narrow the net, and keep them specific: the IGI describes its whole mission as "CRISPR cures", so that phrase alone matches nearly every story on the site. Each run's log in the Actions tab shows which term every kept story matched and the sentence around it, which is the place to look when a story seems out of place.

To refresh by hand, open the repo's Actions tab, pick "Refresh news" on the left, and press "Run workflow". It also runs on its own whenever the script or the workflow file changes, so a new search term shows its effect within a minute of being committed. Two things worth knowing. GitHub switches off scheduled workflows in a repo that has had no commits for 60 days and emails a warning; the Actions tab has a one-click button to switch it back on. And a run fails, with an email, only when the IGI website could not be reached at all; a day with no new stories is a normal, quiet run.

## If the site moves to another address

Several files spell the site URL out in full, because link scrapers and crawlers do not resolve relative paths. Change them together with a find and replace across the repo. To see every copy first:

```
grep -rn 'https://rachelselbrede.github.io/urnov-lab-site' .
```

- `index.html`: `canonical`, `og:url`, `og:image`, `twitter:image`, and `url` in the JSON-LD block
- `sitemap.xml`: the `<loc>`
- `robots.txt`: the `Sitemap:` line
- `404.html`: the home page button and the section links

## If it gets approved

- Move the repo to a GitHub organization owned by the lab so it does not depend on one person's account.
- Decide on the address. Options are a `berkeley.edu` subdomain through campus IT, an IGI subdomain through IGI comms, or a purchased domain (about $10 to $20 a year) pointed at GitHub Pages.
- The palette follows the IGI brand guidelines (innovativegenomics.org/resources/member-resources/brand-guidelines/): IGI Deep Blue for text and dark panels, IGI Blue for links and the corrected base, Slate Grey for rules, Human Health Red for the disease-causing variant. Official tints are used where the true colors would fail contrast on dark panels. Fonts are Source Serif 4 and Inter, the pairing UC Berkeley's own site uses. All tokens are at the top of the CSS in `:root`. Ask IGI comms for headshots and to confirm logo and color usage before launch.
- Check accessibility once real content is in (UC expects WCAG AA). The page has a skip link, visible focus states that hold up on both light and dark backgrounds, reduced-motion support, readable contrast, and keyboard support for every control: the pipeline is a tab set with arrow-key navigation, the sequence panel has a Replay button, videos can be closed with Escape and return focus to the card they came from, and the mobile menu closes with Escape.
