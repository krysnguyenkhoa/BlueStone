# BlueStone Ecom Dashboard

Dashboard eCom của BlueStone (Overview, Overview KPI, Daily Tracking, Onsite Shopee, Top Super Hero SKU, Onsite TikTok Shop, Product Performance, Data Raw), tự dựng lại từ thư mục dữ liệu trên Google Drive.

**Xem báo cáo:** https://krysnguyenkhoa.github.io/BlueStone/

## Cách hoạt động

1. **Mỗi 5 phút**, GitHub Actions quét thư mục Drive BlueStone. Bước này chỉ so tên, ngày sửa và checksum của file nên mất vài giây.
2. **Khi có file mới hoặc file bị sửa**, workflow tải toàn bộ dữ liệu, chạy bộ xử lý (`pipeline/build.sh`), rồi xuất bản `index.html` lên GitHub Pages.
3. **Trang đang mở** tự kiểm tra `version.json` mỗi 5 phút. Khi có bản mới, trang hiện thanh "Đã có dữ liệu mới" và tự tải lại sau 60 giây (bấm "Để sau" để giữ màn hình đang xem).

Lịch 5 phút của GitHub không chính xác tuyệt đối: lúc hệ thống bận, lượt chạy có thể trễ 5–15 phút. Cập nhật thường hiện sau khoảng 5–20 phút kể từ lúc bỏ file lên Drive.

## Cài đặt lần đầu (làm một lần)

### 1. Tạo service account Google để GitHub đọc được Drive

1. Vào https://console.cloud.google.com/ và tạo một project (ví dụ `bluestone-dashboard`).
2. Vào **APIs & Services → Library**, tìm **Google Drive API** và bấm **Enable**.
3. Vào **IAM & Admin → Service Accounts → Create service account**. Đặt tên (ví dụ `dashboard-reader`), bỏ qua phần cấp quyền, rồi bấm **Done**.
4. Bấm vào service account vừa tạo, mở tab **Keys → Add key → Create new key → JSON**. Một file `.json` sẽ được tải về máy.
5. Mở thư mục BlueStone gốc trên Drive, bấm **Share**, dán email của service account (dạng `dashboard-reader@...iam.gserviceaccount.com`) và chọn quyền **Viewer**.

### 2. Đưa key vào GitHub

1. Vào repo → **Settings → Secrets and variables → Actions → New repository secret**.
2. **Name:** `GDRIVE_SA_JSON`. **Secret:** dán toàn bộ nội dung file `.json` ở bước 1.4.
3. (Không bắt buộc) Nếu đổi thư mục gốc trên Drive: vào tab **Variables**, tạo biến `DRIVE_ROOT_ID` bằng ID của thư mục mới. Mặc định là `1_m_w3myggK6fXT4xdEnD8Jr5FAjuLCUk`.

### 3. Bật GitHub Pages

Vào **Settings → Pages**, mục **Build and deployment → Source**, chọn **GitHub Actions**.

### 4. Chạy lần đầu

Vào tab **Actions → Cập nhật dashboard từ Drive → Run workflow**, tick **Dựng lại kể cả khi Drive không đổi**, rồi bấm **Run workflow**. Khoảng 2–3 phút sau, báo cáo có ở link phía trên.

## Quy ước thư mục trên Drive

| Thư mục | Nội dung | Tên file |
|---|---|---|
| `Order_data` | Đơn hàng, một file phủ từ 01/01/2026 đến ngày mới nhất | `01012026.18112026.xlsx` (file có ngày kết thúc mới nhất được dùng) |
| `Cost/Cost_Shopee/Onsite` | Sổ giao dịch ví Shopee | `ddmmyyyy.ddmmyyyy.xlsx` |
| `Cost/Cost_Shopee/Offsite` | Quảng cáo ngoài sàn Shopee | `ddmmyyyy.ddmmyyyy.xlsx` |
| `Cost/Cost_Tiktok` | Chi tiêu TikTok Ads. File phủ lại kỳ cũ sẽ ghi đè số theo ngày × campaign | `ddmmyyyy.ddmmyyyy.xlsx` |
| `Cost/Cost_Facebook`, `Cost/Cost_Google` | Chi phí Facebook, Google | `ddmmyyyy.ddmmyyyy.xlsx` |
| `KPI` | `KPI Monthly Plan 2026.xlsx` | giữ nguyên tên |
| `Onsite_Shopee` | `Total_Shopee_T1..T12.xlsx`. File có số tháng lớn nhất là tháng đang chạy | `Total_Shopee_T<tháng>.xlsx` |
| `Onsite_Tiktok Shop` | GMV, đơn, phễu TikTok Shop | `ddmmyyyy.ddmmyyyy.xlsx` |
| `SKU Shopee Performance` | Hiệu quả SKU Shopee theo tháng (tab Top Super Hero SKU) | `parentskudetail.YYYYMMDD_YYYYMMDD.xlsx` |
| `Product_images` | Ảnh sản phẩm | `<mã SKU>.png` hoặc 4 số model, ví dụ `5851.webp` |

Ngày cắt dữ liệu lấy từ file Order_data mới nhất. Nếu ngày cuối mới xuất được một phần (ít hơn 25% số đơn của một ngày bình thường), ngày đó bị bỏ qua.

## Cấu trúc repo

```
.github/workflows/refresh.yml   lịch quét 5 phút + dựng + xuất bản Pages
pipeline/sync_drive.py          quét và tải dữ liệu Drive (service account)
pipeline/prep.py                chuẩn bị dữ liệu: chọn file, mốc ngày, ảnh mới
pipeline/etl/*.js               xử lý Excel thành dữ liệu dashboard
pipeline/hero_etl.py            dữ liệu tab Top Super Hero SKU
pipeline/rb/                    dựng các trang dashboard vào một file HTML
pipeline/finalize.py            gắn bộ tự kiểm tra bản mới, xuất docs/
pipeline/state/                 trạng thái Drive của lần dựng gần nhất
```

Chạy trên máy: `cd pipeline && npm ci && pip install -r requirements.txt && BS_DATA=/đường/dẫn/thư-mục-drive bash build.sh`, kết quả nằm ở `docs/index.html`.

## Lưu ý

- **Repo public:** ai có link Pages đều xem được doanh thu, KPI và chi phí. File Excel gốc trên Drive không được đưa lên repo.
- **Năm 2026:** bộ xử lý đang gắn với năm 2026. Sang năm 2027 cần chỉnh lại (file KPI, mốc năm trong Order_data).
- **Tạm dừng:** GitHub tự tắt lịch chạy nếu repo không có hoạt động trong 60 ngày. Mỗi lần dữ liệu đổi, workflow tự commit trạng thái nên lịch vẫn chạy khi Drive còn được cập nhật. Nếu bị tắt, vào tab Actions để bật lại.
