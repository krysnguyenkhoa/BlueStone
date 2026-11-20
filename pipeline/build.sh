#!/usr/bin/env bash
# Dựng dashboard từ thư mục dữ liệu Drive đã đồng bộ (mặc định ../data) ra ../docs/index.html
set -euo pipefail
cd "$(dirname "$0")"
export BS_HOME="$PWD"
export BS_DATA="${BS_DATA:-$PWD/../data}"
mkdir -p work etl/out
python3 prep.py
source work/env.sh
( cd etl && for s in cost core kpi sku onsite tiktok2 assets_core; do echo "== $s"; node "$s.js" | tail -2; done )
python3 hero_etl.py | tail -3
python3 weekly_etl.py "$BS_HOME/work/WEEKLY.json"
python3 - <<'PY'
import os
h=os.environ['BS_HOME']+'/rb/'
s=open(h+'hero2.js',encoding='utf8').read()
css=open(h+'hero_css_part.js',encoding='utf8').read().replace('  HR_CSS() {','  HR_CSS0() {',1)
open(h+'hero.js','w',encoding='utf8').write(s.replace('/*HR_CSS0*/',css))
PY
python3 rb/run.py
python3 finalize.py
