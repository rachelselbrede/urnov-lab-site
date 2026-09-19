# Rendering the base-editor figure

`images/abe8e-dna.webp` is not clip art: it is a render of the experimental
structure of ABE8e bound to DNA (PDB 6VPC, Lapinaite, Knott et al., Science
2020 — the Doudna lab's own structure), coloured to the IGI palette.

Nothing here is needed to run or deploy the site. The site ships the finished
`.webp` files; this folder only exists to regenerate them.

    ./shoot.sh /tmp/out.png "w=2000&h=1400&rot=60&elev=-10"
    ./towebp.sh /tmp/out.png ../images/abe8e-dna@2x.webp 0.88 1
    ./towebp.sh /tmp/out.png ../images/abe8e-dna.webp    0.90 0.5

`rot` and `elev` turn the structure in degrees; `w`/`h` set the render size.
To compare orientations, render several and stitch them into one sheet:

    for r in 0 60 120 180 240 300; do ./shoot.sh /tmp/s_$r.png "w=560&h=460&rot=$r&elev=-10"; done
    python3 sheet.py /tmp/sheet.png 3 /tmp/s_*.png

Three things about this pipeline are non-obvious and worth not rediscovering:

- Do **not** pass `--disable-gpu` to Chrome. Headless reaches the real GPU
  through ANGLE/Metal; forcing SwiftShader makes a render take minutes and
  blocks the page's main thread.
- The image is pulled out of the DOM, not from `--screenshot`. Under
  `--virtual-time-budget` the WebGL canvas never composites into the page
  surface, so a page screenshot comes back empty. Mol*'s own screenshot
  helper does its own readPixels, and handles transparency and supersampling.
- Orientation is a transform on the **structure**, not a camera move. The
  screenshot helper renders through its own cached camera, so
  `camera.setState` never reaches the output.

`vendor/` holds the Mol* bundle and the cached structure, fetched with:

    curl -L -o vendor/molstar.js  https://cdn.jsdelivr.net/npm/molstar@5.11.0/build/viewer/molstar.js
    curl -L -o vendor/molstar.css https://cdn.jsdelivr.net/npm/molstar@5.11.0/build/viewer/molstar.css
    curl -L -o vendor/6vpc.bcif   https://models.rcsb.org/6vpc.bcif

PDB entries are freely redistributable, but confirm with IGI communications
before launch that the lab is happy to present this structure as its own figure.
