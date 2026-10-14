#!/usr/bin/env bash
# Builds dist/Year9-Revision.html: the whole Year 9 app in ONE file that works
# offline when opened from disk (no website needed).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p dist
npx --yes esbuild@0.24.0 year9/js/app.js --bundle --format=iife --minify --outfile=dist/app.bundle.js --log-level=error
python3 - <<'PY'
import base64, re
s = open('year9/index.html').read()
css = open('year9/styles.css').read()
js = open('dist/app.bundle.js').read().replace('</script', '<\\/script')
icon = base64.b64encode(open('year9/icon.svg').read().encode()).decode()
s = re.sub(r'\s*<link rel="(manifest|apple-touch-icon)"[^>]*>', '', s)
s = s.replace('<link rel="icon" href="icon.svg" type="image/svg+xml">', f'<link rel="icon" href="data:image/svg+xml;base64,{icon}">')
s = s.replace('<link rel="stylesheet" href="styles.css">', f'<style>\n{css}\n</style>')
s = s.replace('<script type="module" src="js/app.js"></script>', f'<script>\n{js}\n</script>')
open('dist/Year9-Revision.html', 'w').write(s)
PY
rm dist/app.bundle.js
echo "Built dist/Year9-Revision.html ($(du -k dist/Year9-Revision.html | cut -f1) KB)"
