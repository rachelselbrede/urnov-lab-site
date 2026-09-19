#!/bin/sh
# shoot.sh OUT.png "query string"  -- render the Mol* scene headlessly.
# Chrome renders offscreen via Mol*'s screenshot helper; the PNG comes back
# through the DOM because a page screenshot does not capture the WebGL canvas.
set -e
OUT="$1"; QS="$2"
DIR=$(cd "$(dirname "$0")" && pwd)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --use-angle=metal \
  --allow-file-access-from-files --hide-scrollbars --window-size=1600,1200 \
  --virtual-time-budget=180000 --dump-dom "file://$DIR/scene.html?$QS" 2>/dev/null > /tmp/dom_$$.html
grep -o 'SCENE\[.*\]' /tmp/dom_$$.html | head -1 | python3 -c "
import sys,json
s=sys.stdin.read()
print('\n'.join('    '+l for l in json.loads(s[5:])) if s.strip() else '    (no log)')" >&2
OUT="$OUT" python3 -c "
import re,base64,pathlib,os,sys
d=open('/tmp/dom_$$.html',encoding='utf-8',errors='replace').read()
m=re.search(r'id=\"png\"[^>]*>(data:image/png;base64,[A-Za-z0-9+/=]+)<',d)
if not m: print('NO PNG'); sys.exit(1)
b=base64.b64decode(m.group(1).split(',',1)[1])
pathlib.Path(os.environ['OUT']).write_bytes(b)
print('  ->',os.environ['OUT'],len(b),'bytes')"
rm -f /tmp/dom_$$.html
