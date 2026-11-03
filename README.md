# Urnov Lab website prototype

A static site with no build step, no dependencies and nothing to install. It runs on GitHub Pages as-is.

```
index.html        the whole site: markup, styles and scripts in one file
404.html          shown for any unknown URL
social/           the link preview card (PNG) and the HTML it is rendered from
logos/            partner wordmarks
photos/           the group photo and the headshots (empty until the lab sends them)
news.json         the latest IGI stories about the lab, written by the news workflow
icons/            the browser tab and home screen icons: the site's U, drawn as a path
scripts/          fetch-news.mjs, which finds those stories, and check-domain.mjs, which checks the lab's domain before the site moves to it
.github/          two workflows: the news refresh, once a day, and the one-time switch to www.urlab.bio
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

To put it on the lab's own address, see "Moving to www.urlab.bio" below.

## Fill in before you show it

- Lab email. The page has none for now: the Contact section shows only the postal address. Once there is a real address, add it under Contact (and to the structured data if wanted).
- The PI portrait is in place: `photos/fyodor-urnov.jpg`, from the UC Berkeley VC for Research faculty page. Confirm its reuse with IGI communications before launch.
- Lab group photo. It is the first thing a visitor sees: it fills the top of the window, under a see-through menu with the IGI mark in the middle, with "Urnov Lab" set in white over its lower left. Save it as `photos/lab-group.jpg` (landscape, JPEG, at least 2400 px wide) and commit, and it fades in on its own. Until then the frame shows a drawn group of silhouettes on a dark ground, the same idea as the headshot placeholders, so the space is held and the page still looks finished. The page finds out whether the photo exists by asking for it, so a 404 for that file is expected until it is added. See "The group photo" below for how it is cropped.
- Confirm the mailing address and zip. It appears twice: in the Contact section and in the JSON-LD block in the `<head>`. Both have to change together.
- The research section lists only programs already public in IGI, CZI, and Danaher announcements. Add or remove programs with Fyodor.
- Partner logos. The "Partners and supporters" strip uses files in `logos/`, pulled from each organization's own website (IGI, UC Berkeley, UCSF, CZI, ARPA-H) or from vector copies of the official marks on Wikimedia Commons (Danaher, Stanford, UCLA, UC San Diego). ARPA-H publishes its mark with white lettering for dark backgrounds; `logos/arpa-h.svg` has those letters recoloured to the mark's own navy. Logos are trademarks of their owners: confirm usage with each organization's communications office before a public launch, and prune the list to the partners the lab wants named. To change a logo, replace the file and adjust the `--h` height on its `<li>` so it sits at a similar visual weight.
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

The grid keeps adding rows as you add `<li>` elements, so add or remove people without touching any CSS.

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

Raise the first percentage to move the crop right, lower it to move left; the second does the same vertically. Leave `data-focus` off and the crop comes from dead centre, which is right for most headshots. A full roster of headshots is a real amount of weight on the page, so they are lazy-loaded and only fetched as the section comes into view. Still save them around 600 px wide rather than straight off the camera.

The `alt` on these photos is set to empty on purpose. The person's name is on the very next line, and a screen reader announcing it twice in a row helps nobody.

Two escape hatches, if you ever need them. Writing an `<img>` into `.portrait` by hand overrides everything above and is left alone. And if you forget the `<div class="portrait"></div>` line when copying a card, it gets added for you, so the card still lines up with the others.

With scripting turned off the names, roles, portrait frames and silhouettes all still render; only the headshots are missing. That is why the roster lives in the markup rather than in a list inside the script: it keeps the team in the page source, where search engines and anything that reads the HTML directly can see it.

## The group photo

On a laptop or desktop the photo fills the window, so its shape follows the screen: a normal 3:2 photo loses a little at the sides on most screens and some top and bottom on very wide ones. Keep the faces out of the bottom fifth, where the title sits, and leave some room above the heads. If it does cut someone, steer it with `data-focus` on the `<figure class="group-photo">` near the top of `index.html`, the same way as on a headshot: the second percentage moves the crop up (lower) or down (higher). On a phone the frame is 4:5, which keeps the middle of the group, so stand the people the lab most wants seen near the centre.

The photo has no caption; the lab's name and the UC Berkeley logo sit over its lower left instead. The logo is the official Berkeley lockup (`logos/berkeley-lockup.svg`), shown reversed to white straight on the photo like the name above it, and its B is set to line up with the first stroke of the U in "Urnov Lab" at every screen size.

For the photo itself: daylight or soft, even light, everyone's face visible, a real place (the lab, the IGI atrium, the courtyard) rather than a plain wall, and no wide-angle lens close in, which stretches the people at the edges. A photo of the lab at work, taken by someone who knows the space, beats a posed lineup if nobody can get everyone together.

## The first-cure timeline

Under the six steps in "How we make a cure" is a dated account of the first personalized CRISPR therapy, from August 2024 to July 2025. Every date and role in it comes from the NEJM report (Musunuru et al. 2025), UC Berkeley News and the Children's Hospital of Philadelphia, and the sources are linked under the list. The IGI's part was the safety and efficacy testing, and the entry says exactly that. It is the one place on the page where the lab's claims are checkable to the month, so change an entry only with a source in hand.

## The link preview card

`social/og-image.png` is what Slack, Teams, email and social platforms show when someone posts the link. It is rendered from `social/og-image.html`, which is ordinary HTML using the same palette and fonts as the site. To change the wording, edit that file and re-render it:

```
chrome --headless --screenshot=social/og-image.png --window-size=1200,630 \
       --hide-scrollbars social/og-image.html
```

Check the result is exactly 1200x630. Some headless builds report a shorter viewport than the window size and silently leave the bottom of the card unpainted; if that happens, render taller and crop the top 1200x630.

The card is entirely type, with no IGI or partner marks on it, so it does not need a logo usage sign-off the way the partners strip does.

## The Our Mission illustration

`images/crispr-cas9-igi.jpg`, beside "Our Mission", is from the IGI's downloadable photos and illustrations. IGI asks that its images carry the attribution given with the download, or "Innovative Genomics Institute, UC Berkeley" when none is given, so the caption under it ends with that credit. Keep the credit if the image is swapped for another IGI one.

## What updates itself

The Publications section pulls recent papers from Europe PMC in the browser (author query on Urnov F / Urnov FD, 2020 onward, PubMed records only, newest first, eight shown), skipping news pieces, interviews and errata by publication type. Nobody has to maintain it. Adjust the query or the skip list in the `<script>` block at the bottom for a different date range, count or filter. If you change the filter, also bump `PUBS_KEY`, or visitors keep the old cached list for a day.

A successful result is kept in the visitor's browser and reused for a day, so most visits do not call the API at all, and a Europe PMC outage leaves the last known list on the page rather than an empty section. A first-time visitor during an outage gets one line pointing at the PubMed link below.

The News section refreshes itself once a day. The "Refresh news" workflow in `.github/workflows/news.yml` runs `scripts/fetch-news.mjs`, which asks the IGI website for stories that mention the lab, writes the newest six to `news.json`, and commits the file when something changed. GitHub Pages redeploys on its own after that commit. The page shows the first three, and falls back to the three cards written into `index.html` if `news.json` is missing or empty. The "More news from the IGI" link under the cards covers everything else.

What counts as "about the lab" is the `TERMS` list at the top of the script: Urnov, CRISPR Cures Core, Pediatric CRISPR Cures, Beacon for CRISPR Cures, and CPS1. A story is kept when its title or text contains any of them. Add or remove lines there to widen or narrow the net, and keep them specific: the IGI describes its whole mission as "CRISPR cures", so that phrase alone matches nearly every story on the site. Each run's log in the Actions tab shows which term every kept story matched and the sentence around it, which is the place to look when a story seems out of place.

To refresh by hand, open the repo's Actions tab, pick "Refresh news" on the left, and press "Run workflow". It also runs on its own whenever the script or the workflow file changes, so a new search term shows its effect within a minute of being committed. Two things worth knowing. GitHub switches off scheduled workflows in a public repo that has had no commits for 60 days, so the workflow looks after that itself: when the last commit is 45 days old it leaves a one-line commit (the date in `.github/last-check`), which resets the clock. Nobody has to touch the repo to keep it running. And a run fails, with an email, only when the IGI website could not be reached at all; a day with no new stories is a normal, quiet run.

## Moving to www.urlab.bio

The lab owns `urlab.bio` through Squarespace. Squarespace only has to hold the domain and answer DNS for it; the site stays on GitHub Pages and nothing about how it is edited changes. There are three steps. The first is ten minutes of clicking at Squarespace, the second is one button in this repo, the third is one tick at GitHub.

### 1. Point the domain at GitHub (at Squarespace)

Log in at account.squarespace.com, open **Domains**, pick `urlab.bio`, then **DNS** (or **DNS settings**).

Take out the records that point the domain at Squarespace itself. They are usually grouped as **Squarespace Defaults**: A records on `@` and a CNAME on `www`. Delete them. If Squarespace will not let you, the domain is still connected to a Squarespace website; disconnect it first, under the domain's settings. Leave MX records, and any TXT records you did not add, exactly as they are: they carry email for the domain.

Then add these under **Custom Records**:

| Host | Type | Data |
|---|---|---|
| `www` | CNAME | `rachelselbrede.github.io` |
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |

Recommended, two more minutes: prove to GitHub that the lab owns the domain, so that no other GitHub user can ever point a Pages site at it. Signed in as the account that owns this repo, open your profile **Settings** (not the repo's), then **Pages**, then **Add a domain**, and enter `urlab.bio`. GitHub shows a TXT record: a host that starts `_github-pages-challenge-` and a value to go with it. Add it at Squarespace as one more custom record, the host without `.urlab.bio` on the end, wait a little, and press **Verify**. If it fails, the record has not spread yet; try again in an hour. Keep that record in place afterwards.

### 2. Run the switch (in this repo)

Open the repo's **Actions** tab, pick **Switch to www.urlab.bio** on the left, press **Run workflow**, and run it on `main`.

It first checks that the records above have reached the internet, which can take from a few minutes to a day. If they have not, it stops with a plain report of what is still missing, changes nothing, and can be run again later. If they have, it writes the `CNAME` file that tells GitHub Pages the address, changes every copy of the site URL in the files, and commits to `main`. Pages redeploys on its own within a minute or two. The run's summary page lists what to do next. Running the workflow a second time is harmless.

To see the same DNS report without switching anything, run `node scripts/check-domain.mjs` on any computer.

### 3. Turn on HTTPS (at GitHub)

Open the repo's **Settings**, then **Pages**. "Custom domain" now reads `www.urlab.bio`, with a DNS check under it. When that check is green, tick **Enforce HTTPS**. The box stays greyed out until GitHub has issued the certificate, which can take from a few minutes to an hour, so come back if it is grey.

From then on `urlab.bio`, `www.urlab.bio` and the old github.io address all lead to the same site. Keep the domain renewing at Squarespace; a Squarespace website plan is not needed for any of this. If the repo ever moves to a lab organization, the `www` CNAME at Squarespace changes to that organization's `.github.io` name, and so do `PAGES_HOST` in `scripts/check-domain.mjs` and `OLD_URL` in the workflow.

## If the site moves to another address

Several files spell the site URL out in full, because link scrapers and crawlers do not resolve relative paths. For the move to `www.urlab.bio` the workflow above does this. For any other address, change them together with a find and replace across the repo. To see every copy first:

```
grep -rn 'https://rachelselbrede.github.io/urnov-lab-site' .
```

For the move to `www.urlab.bio`, replace the prefix without its trailing slash, so `/urnov-lab-site/sitemap.xml` becomes `/sitemap.xml` on the new domain:

```
grep -rl 'https://rachelselbrede.github.io/urnov-lab-site' --exclude-dir=.git . \
  | xargs sed -i 's#https://rachelselbrede.github.io/urnov-lab-site#https://www.urlab.bio#g'
```

- `index.html`: `canonical`, `og:url`, `og:image`, `twitter:image`, and `url` in the JSON-LD block
- `sitemap.xml`: the `<loc>`
- `robots.txt`: the `Sitemap:` line
- `404.html`: the icon links, the home page button and the section links

## If it gets approved

- Move the repo to a GitHub organization owned by the lab so it does not depend on one person's account.
- Switch the address to `www.urlab.bio`, following "Moving to www.urlab.bio" above.
- The palette follows the IGI brand guidelines (innovativegenomics.org/resources/member-resources/brand-guidelines/): IGI Deep Blue for text, the dark figure panels, Watch and the footer; IGI Blue for links, focus rings, the bars over section headings, the strip under the photo and the Join section; Genome Gold, IGI Blue and one teal from outside the palette as rules on the cards; a light IGI Blue tint for the banded sections. Text on IGI Blue is always white, and gold is never used for text on white, because both would fail contrast. The colour accents are gathered in one block at the end of the CSS, headed "Colour". Fonts are Source Serif 4 and Inter, the pairing UC Berkeley's own site uses. All tokens are at the top of the CSS in `:root`. Ask IGI comms for headshots and to confirm logo and color usage before launch.
- Check accessibility once real content is in (UC expects WCAG AA). The page has a skip link, visible focus states that hold up on both light and dark backgrounds, reduced-motion support, readable contrast, and keyboard support for every control: the pipeline is a tab set with arrow-key navigation, the Our Mission illustration has alt text and a credited caption, videos can be closed with Escape and return focus to the card they came from, and the mobile menu closes with Escape.
