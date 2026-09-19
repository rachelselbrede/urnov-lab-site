#!/bin/sh
# towebp.sh IN.png OUT.webp [quality] [scale]
set -e
DIR=$(cd "$(dirname "$0")" && pwd)
IN=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --use-angle=metal \
  --allow-file-access-from-files --virtual-time-budget=60000 --dump-dom \
  "file://$DIR/towebp.html?src=file://$IN&q=${3:-0.9}&scale=${4:-1}" 2>/dev/null > /tmp/w_$$.html
OUT="$2" python3 -c "
import re,base64,pathlib,os,sys
d=open('/tmp/w_$$.html',encoding='utf-8',errors='replace').read()
m=re.search(r'id=\"out\"[^>]*>(data:image/webp;base64,[A-Za-z0-9+/=]+)<',d)
if not m: print('NO WEBP'); sys.exit(1)
b=base64.b64decode(m.group(1).split(',',1)[1])
pathlib.Path(os.environ['OUT']).write_bytes(b)
print(' ',os.environ['OUT'], f'{len(b)/1024:.0f} KB')"
rm -f /tmp/w_$$.html
