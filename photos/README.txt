Photos for the site. Nothing here is committed yet except this note.

  lab-group.jpg       the hero photo. Landscape, at least 1600 px wide.
                      The hero swaps the sequence panel for it once it exists.

  fyodor-urnov.jpg    the PI portrait. Portrait orientation, 4:5, about 600 px wide.
                      index.html already points at this filename, so the portrait
                      fills in as soon as the file is here.

  <first>-<last>.jpg  everyone else. Same shape. Add
                      data-photo="photos/<first>-<last>.jpg" to that person's <li>.

Until a file exists the page asks for it, gets a 404 and quietly keeps the
initials. That is the detection mechanism, not a fault.

The PI portrait on the UC Berkeley VC for Research faculty page is:

  https://vcresearch.berkeley.edu/sites/default/files/styles/faculty_photo_large/public/2024-08/Fyodor%20Urnov.7_0.jpg

Save it as fyodor-urnov.jpg. It does not need cropping to exact proportions: the
portrait frame crops to fill, so any reasonably upright photo sits correctly.

Check with IGI communications before launch that the lab may reuse it, the same
way the partner logos need confirming.
