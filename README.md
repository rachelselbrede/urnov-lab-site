# Urnov Lab website prototype

A static site with no build step, no dependencies and nothing to install. It runs on GitHub Pages as-is.

```
index.html        the whole site: markup, styles and scripts in one file
404.html          shown for any unknown URL
social/           the link preview card (PNG) and the HTML it is rendered from
logos/            partner wordmarks
photos/           the group photo and the headshots (empty until the lab sends them)
news.json         the latest IGI stories about the lab, written by the news workflow
models/           the Cas9 structure shown beside "What we work on", as a compressed glTF, and its poster image
vendor/           the 3D viewer and the Draco decoder, copied from npm so the site depends on no CDN
scripts/          fetch-news.mjs, which finds those stories, and build-cas9-model.py, which makes the model
.github/          the workflow that runs the news refresh once a day
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
- Lab group photo. It is the first thing a visitor sees: a full-width band right under the headline. Save it as `photos/lab-group.jpg` (landscape, JPEG, at least 2400 px wide) and commit, and it fades in on its own. Until then the band shows a drawn group of grey silhouettes, the same idea as the headshot placeholders, so the space is held and the page still looks finished. The page finds out whether the photo exists by asking for it, so a 404 for that file is expected until it is added. See "The group photo" below for how it is cropped.
- Team names, roles, and photos. Twenty placeholder cards are waiting, each a silhouette over "Team member" and a guessed role; see "Adding people" below. Shoot everyone the same way (same wall, same light, same crop) and the grid will look professional on its own.
- Confirm the mailing address and zip. It appears twice: in the Contact section and in the JSON-LD block in the `<head>`. Both have to change together.
- The research section lists only programs already public in IGI, CZI, and Danaher announcements. Add or remove programs with Fyodor.
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

## The group photo

On a laptop or desktop the band is a wide 12:5 crop (2.4 to 1), so a normal 3:2 photo loses some of its top and bottom. Shoot with a little room above the heads and the crop takes floor and ceiling rather than people. If it does cut someone, steer it with `data-focus` on the `<figure class="group-photo">` near the top of `index.html`, the same way as on a headshot: the second percentage moves the crop up (lower) or down (higher). On a phone the photo is shown whole at its own shape, because a crop there would cut off whoever stands at either end.

The caption under the band reads "The Urnov Lab at the Innovative Genomics Institute, Berkeley." Once there is a real photo it is a good place for the year, or for names from left to right.

For the photo itself: daylight or soft, even light, everyone's face visible, a real place (the lab, the IGI atrium, the courtyard) rather than a plain wall, and no wide-angle lens close in, which stretches the people at the edges. A photo of the lab at work, taken by someone who knows the space, beats a posed lineup if nobody can get everyone together.

## The link preview card

`social/og-image.png` is what Slack, Teams, email and social platforms show when someone posts the link. It is rendered from `social/og-image.html`, which is ordinary HTML using the same palette and fonts as the site. To change the wording, edit that file and re-render it:

```
chrome --headless --screenshot=social/og-image.png --window-size=1200,630 \
       --hide-scrollbars social/og-image.html
```

Check the result is exactly 1200x630. Some headless builds report a shorter viewport than the window size and silently leave the bottom of the card unpainted; if that happens, render taller and crop the top 1200x630.

The card is entirely type, with no IGI or partner marks on it, so it does not need a logo usage sign-off the way the partners strip does.

## The Cas9 model

The molecule beside "What we work on" is the real thing: Protein Data Bank entry 4OO8 (Nishimasu et al., Cell 2014), Streptococcus pyogenes Cas9 with its guide RNA and the target DNA strand. The enzyme is white, the guide RNA Genome Gold, the DNA IGI Blue. Visitors can drag it to turn it, and it turns on its own unless they have asked their system for reduced motion. It is rendered by model-viewer 4.3.1, copied from npm into `vendor/` along with the Draco decoder from three.js 0.186, so nothing loads from a third-party CDN. `models/cas9.glb` is about 270 KB and `models/cas9-poster.png` shows while it loads.

To rebuild the model, download a structure from the Protein Data Bank and run the script:

```
python3 scripts/build-cas9-model.py 4oo8.pdb models/cas9.glb
npx gltf-pipeline -i models/cas9.glb -o models/cas9.glb -d --draco.compressionLevel 7
```

The script turns each chain into a smooth molecular surface and needs `pip install numpy scipy scikit-image trimesh fast-simplification`. To show the DNA double helix reaching out of the enzyme, the way the printed models do, use entry 5F9R (Jiang et al., Science 2016) with `--chains A B CD`; the `--help` text explains the chain letters. PDB data is free to reuse; cite the entry if the model appears in print.

## What updates itself

The Publications section pulls recent papers from Europe PMC in the browser (author query on Urnov F / Urnov FD, 2020 onward, PubMed records only, newest first, eight shown), skipping news pieces, interviews and errata by publication type. Nobody has to maintain it. Adjust the query or the skip list in the `<script>` block at the bottom for a different date range, count or filter. If you change the filter, also bump `PUBS_KEY`, or visitors keep the old cached list for a day.

A successful result is kept in the visitor's browser and reused for a day, so most visits do not call the API at all, and a Europe PMC outage leaves the last known list on the page rather than an empty section. A first-time visitor during an outage gets one line pointing at the PubMed link below.

The News section refreshes itself once a day. The "Refresh news" workflow in `.github/workflows/news.yml` runs `scripts/fetch-news.mjs`, which asks the IGI website for stories that mention the lab, writes the newest six to `news.json`, and commits the file when something changed. GitHub Pages redeploys on its own after that commit. The page shows the first three, and falls back to the three cards written into `index.html` if `news.json` is missing or empty. The "More news from the IGI" link under the cards covers everything else.

What counts as "about the lab" is the `TERMS` list at the top of the script: Urnov, CRISPR Cures Core, Pediatric CRISPR Cures, Beacon for CRISPR Cures, and CPS1. A story is kept when its title or text contains any of them. Add or remove lines there to widen or narrow the net, and keep them specific: the IGI describes its whole mission as "CRISPR cures", so that phrase alone matches nearly every story on the site. Each run's log in the Actions tab shows which term every kept story matched and the sentence around it, which is the place to look when a story seems out of place.

To refresh by hand, open the repo's Actions tab, pick "Refresh news" on the left, and press "Run workflow". It also runs on its own whenever the script or the workflow file changes, so a new search term shows its effect within a minute of being committed. Two things worth knowing. GitHub switches off scheduled workflows in a public repo that has had no commits for 60 days, so the workflow looks after that itself: when the last commit is 45 days old it leaves a one-line commit (the date in `.github/last-check`), which resets the clock. Nobody has to touch the repo to keep it running. And a run fails, with an email, only when the IGI website could not be reached at all; a day with no new stories is a normal, quiet run.

## Moving to www.urlab.bio

The lab owns `urlab.bio` through Squarespace. Squarespace only has to hold the domain; the site itself stays on GitHub Pages and nothing about how it is edited changes. The switch is about twenty minutes of clicking, then up to a day of waiting for DNS to spread. Do the steps in this order: a domain pointed at GitHub before GitHub knows who owns it can be claimed by somebody else's Pages site.

1. **Claim the domain on GitHub.** Signed in as the account that owns this repo, open your profile Settings (not the repo's), then Pages, then "Add a domain", and enter `urlab.bio`. GitHub shows a TXT record: a host name that starts `_github-pages-challenge-` and a value to go with it. Keep that page open.
2. **Open the domain's DNS in Squarespace.** Log in at account.squarespace.com, open Domains, pick `urlab.bio`, then DNS (or DNS Settings).
3. **Take out the records that point the domain at a Squarespace website.** These are usually grouped as "Squarespace Defaults": A records on `@` and a CNAME on `www` pointing at `ext-sq.squarespace.com`. Delete those. Leave any MX records, and TXT records you did not add, exactly as they are: they carry email for the domain. If `urlab.bio` shows a Squarespace site today, that site goes offline at this step.
4. **Add the GitHub records** as custom records:

   | Host | Type | Data |
   |---|---|---|
   | the `_github-pages-challenge-` name from step 1, without `.urlab.bio` on the end | TXT | the value from step 1 |
   | `@` | A | `185.199.108.153` |
   | `@` | A | `185.199.109.153` |
   | `@` | A | `185.199.110.153` |
   | `@` | A | `185.199.111.153` |
   | `@` | AAAA | `2606:50c0:8000::153` |
   | `@` | AAAA | `2606:50c0:8001::153` |
   | `@` | AAAA | `2606:50c0:8002::153` |
   | `@` | AAAA | `2606:50c0:8003::153` |
   | `www` | CNAME | `rachelselbrede.github.io` |

   The AAAA records are for visitors on IPv6 and are optional. The CNAME names the account that owns the repo, so it changes if the repo ever moves to a lab organization.
5. **Verify.** Back on the GitHub page from step 1, press Verify. If it fails, the records have not spread yet; try again in an hour.
6. **Point the repo at the domain.** In this repo, open Settings, then Pages, type `www.urlab.bio` under "Custom domain" and save. GitHub commits a one-line file named `CNAME` to `main`. Leave it there: it is how Pages knows the address. From then on `urlab.bio` and the old github.io address both forward to `www.urlab.bio` on their own.
7. **Turn on HTTPS.** When the DNS check on that page turns green, tick "Enforce HTTPS". The certificate can take a while to be issued; until it is, the box stays greyed out.
8. **Change the address written into the files**, as described in the next section. The new prefix is `https://www.urlab.bio`.

Keep the domain itself renewing in Squarespace. A Squarespace website plan is not needed for any of this.

## If the site moves to another address

Several files spell the site URL out in full, because link scrapers and crawlers do not resolve relative paths. Change them together with a find and replace across the repo. To see every copy first:

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
- `404.html`: the home page button and the section links

## If it gets approved

- Move the repo to a GitHub organization owned by the lab so it does not depend on one person's account.
- Switch the address to `www.urlab.bio`, following "Moving to www.urlab.bio" above.
- The palette follows the IGI brand guidelines (innovativegenomics.org/resources/member-resources/brand-guidelines/): IGI Deep Blue for text and the dark figure panels, IGI Blue for links and focus rings, Slate Grey for rules and the photo placeholders, Genome Gold and IGI Blue in the molecular figures. Official tints are used where the true colors would fail contrast on dark panels. Fonts are Source Serif 4 and Inter, the pairing UC Berkeley's own site uses. All tokens are at the top of the CSS in `:root`. Ask IGI comms for headshots and to confirm logo and color usage before launch.
- Check accessibility once real content is in (UC expects WCAG AA). The page has a skip link, visible focus states that hold up on both light and dark backgrounds, reduced-motion support, readable contrast, and keyboard support for every control: the pipeline is a tab set with arrow-key navigation, the Cas9 model has alt text and a caption, turns on its own only when motion is allowed, and can be turned with a drag or with the arrow keys once it has focus, videos can be closed with Escape and return focus to the card they came from, and the mobile menu closes with Escape.
