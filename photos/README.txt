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

Getting the files in, without a checkout: on github.com open this photos folder,
pick "Add file", then "Upload files", drop the JPEGs in and commit. Names have
to match exactly, lower case with a .jpg ending, because GitHub Pages treats
Fyodor-Urnov.JPG and fyodor-urnov.jpg as different files. The site is served
from main, so a file committed on another branch shows up once that branch is
merged.

The PI portrait on the UC Berkeley VC for Research faculty page is:

  https://vcresearch.berkeley.edu/sites/default/files/styles/faculty_photo_large/public/2024-08/Fyodor%20Urnov.7_0.jpg

Save it as fyodor-urnov.jpg.

That photo is landscape, about 2:1, and he stands right of centre. The portrait
frame is 4:5, so it keeps a tall slice and throws the sides away. Left to itself
the slice comes from the middle of the frame and cuts him in half, so the PI card
carries data-focus="69% 40%" to move the slice right and centre him instead.

That number is an estimate made by eye and is meant to be nudged. Raise the first
percentage to move the crop right, lower it to move left; the second does the same
vertically. Reload and look. A photo that is already upright and centred needs no
data-focus at all.

Check with IGI communications before launch that the lab may reuse it, the same
way the partner logos need confirming.
