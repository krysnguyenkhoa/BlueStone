"""Quét thư mục Drive BlueStone, phát hiện file mới/đổi và tải về ../data khi có thay đổi.

Biến môi trường:
  GDRIVE_SA_JSON  nội dung file key JSON của service account (lưu trong GitHub Secrets)
  DRIVE_ROOT_ID   ID thư mục gốc trên Drive (mặc định thư mục BlueStone)
  FORCE           'true' để luôn tải và dựng lại
Ghi `changed=true|false` vào GITHUB_OUTPUT.
"""
import os, io, json, sys, time
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

HOME = os.path.dirname(os.path.abspath(__file__))
DATA = os.environ.get('BS_DATA', os.path.join(HOME, '..', 'data'))
STATE = os.path.join(HOME, 'state', 'drive_state.json')
ROOT = os.environ.get('DRIVE_ROOT_ID') or '1_m_w3myggK6fXT4xdEnD8Jr5FAjuLCUk'
FORCE = os.environ.get('FORCE', '').lower() == 'true'
CHECK_ONLY = os.environ.get('CHECK_ONLY', '').lower() == 'true'  # chỉ so sánh, không tải
FOLDER = 'application/vnd.google-apps.folder'

key = os.environ.get('GDRIVE_SA_JSON')
if not key:
    print('::warning::Chưa có secret GDRIVE_SA_JSON (key JSON của service account). Bỏ qua lượt quét này, xem README để cài đặt.')
    if os.environ.get('GITHUB_OUTPUT'):
        open(os.environ['GITHUB_OUTPUT'], 'a').write('changed=false\n')
    sys.exit(0)
creds = service_account.Credentials.from_service_account_info(json.loads(key), scopes=['https://www.googleapis.com/auth/drive.readonly'])
svc = build('drive', 'v3', credentials=creds, cache_discovery=False)


def children(fid):
    out, tok = [], None
    while True:
        r = svc.files().list(q=f"'{fid}' in parents and trashed = false", pageSize=1000, pageToken=tok,
                             fields='nextPageToken, files(id,name,mimeType,modifiedTime,md5Checksum,size)',
                             supportsAllDrives=True, includeItemsFromAllDrives=True).execute()
        out += r.get('files', [])
        tok = r.get('nextPageToken')
        if not tok:
            return out


def walk(fid, prefix=''):
    files = {}
    for f in children(fid):
        p = f"{prefix}{f['name']}"
        if f['mimeType'] == FOLDER:
            files.update(walk(f['id'], p + '/'))
        elif not f['mimeType'].startswith('application/vnd.google-apps'):  # bỏ Google Docs/Sheets gốc
            files[p] = [f['id'], f['modifiedTime'], f.get('md5Checksum', ''), int(f.get('size', 0))]
    return files


t0 = time.time()
cur = walk(ROOT)
old = json.load(open(STATE)) if os.path.exists(STATE) else {}
changed = FORCE or cur != old
added = sorted(set(cur) - set(old)); removed = sorted(set(old) - set(cur))
edited = sorted(p for p in set(cur) & set(old) if cur[p] != old[p])
print(f'Drive: {len(cur)} file, mới {len(added)}, sửa {len(edited)}, xóa {len(removed)} ({time.time() - t0:.1f}s)')
for p in (added + edited)[:30]:
    print('  +', p)

if changed and not CHECK_ONLY:
    for p, (fid, *_r) in sorted(cur.items()):
        dst = os.path.join(DATA, p)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        req = svc.files().get_media(fileId=fid, supportsAllDrives=True)
        with io.FileIO(dst, 'wb') as fh:
            dl = MediaIoBaseDownload(fh, req, chunksize=8 * 1024 * 1024)
            done = False
            while not done:
                _, done = dl.next_chunk()
    print(f'Đã tải {len(cur)} file vào {DATA} ({time.time() - t0:.1f}s)')
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    json.dump(cur, open(STATE, 'w'), ensure_ascii=False, indent=0, sort_keys=True)

if changed and not CHECK_ONLY:
    json.dump({'added': added, 'edited': edited, 'removed': removed}, open(os.path.join(HOME, 'state', 'last_changes.json'), 'w'), ensure_ascii=False, indent=1)
if os.environ.get('GITHUB_OUTPUT'):
    with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
        fh.write(f"changed={'true' if changed else 'false'}\n")
print('changed =', changed)
