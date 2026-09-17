# Working in this repo

A single static page (`index.html`) served by GitHub Pages from `main`. No build step.

- The owner wants changes pushed straight to `main`. Do not open pull requests or leave
  finished work on a side branch: verify the change, then push it to `main`. Pages redeploys
  on its own within a minute or two.
- Verify before pushing: serve the folder locally and load `index.html` in a headless browser,
  checking the section you changed. The README explains every self-updating part.
- `news.json` is written by the "Refresh news" workflow. Do not edit it by hand; change the
  `TERMS` list in `scripts/fetch-news.mjs` instead.
- Keep the writing style of the page and README: plain sentences, no em dashes.
