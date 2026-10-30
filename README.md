# QR Code Generator (Next.js 16 trên Cloudflare Workers)

Website tạo mã QR miễn phí: đa ngôn ngữ, chuẩn SEO, có trang quản trị để gắn mã quảng cáo của bất kỳ mạng nào,
tài khoản Google, mã QR động có thống kê lượt quét và mã QR cho file PDF.
Chạy trên **Cloudflare Workers** (qua [OpenNext](https://opennext.js.org/cloudflare)), dữ liệu ở **D1**, file PDF ở **R2**.

## Tính năng

- **10 loại mã QR**: URL, văn bản, email, điện thoại, SMS, WiFi, vCard, vị trí (Google Maps), sự kiện (lịch), WhatsApp.
- **Thiết kế**: 8 mẫu có sẵn, 6 kiểu khung có chữ, màu, gradient, nền trong suốt, kiểu chấm/góc, mức sửa lỗi, chèn logo.
- **Tải xuống** PNG / JPG / WEBP (300–2000 px) hoặc SVG vector. Mã QR tĩnh được tạo hoàn toàn trên trình duyệt.
- **Quét mã QR** từ ảnh (tải lên, kéo thả, dán) hoặc camera.

### Đa ngôn ngữ
8 ngôn ngữ: `en, vi, es, fr, de, pt, ja, ko`, URL dạng `/vi/qr/wifi`. Truy cập `/` sẽ tự chuyển theo cookie hoặc ngôn ngữ trình duyệt.

Thêm ngôn ngữ: tạo `src/i18n/dictionaries/xx.json` (khóa nào thiếu sẽ tự dùng tiếng Anh), rồi thêm `xx` vào `src/i18n/config.ts` và `src/i18n/get-dictionary.ts`.

### SEO
- 112 trang dựng sẵn lúc build (8 ngôn ngữ × trang chủ, 10 trang loại QR, trang quét, chính sách, điều khoản), phát thẳng từ static assets của Cloudflare.
- Mỗi trang có title/description riêng, canonical, `hreflang` cho mọi ngôn ngữ + `x-default`, Open Graph, Twitter card.
- JSON-LD: `WebApplication`, `FAQPage`, `BreadcrumbList`.
- `/sitemap.xml` (kèm hreflang), `/robots.txt`, `/ads.txt`, trang 404 trả đúng mã 404.

### Tài khoản & mã QR động
- **Đăng nhập bằng Google** (OAuth 2.0 + PKCE). Lần đăng nhập đầu tiên tự tạo tài khoản; không dùng mật khẩu. Phiên lưu 30 ngày.
- **Bảng điều khiển** `/{ngôn ngữ}/dashboard`: danh sách mã, tổng lượt quét / hôm nay / 30 ngày.
- **Mã QR động**: mã chứa link ngắn `/r/{mã}`; đổi link đích, thay file, tạm dừng hoặc xoá mà không cần in lại.
- **Mã QR cho file PDF**: tải PDF tối đa 10 MB (lưu ở R2), quét mã sẽ mở PDF (`/f/{id}`).
- **Thống kê**: tổng lượt, người dùng duy nhất, lần quét gần nhất, biểu đồ 30 ngày, thiết bị, hệ điều hành, trình duyệt, quốc gia
  (lấy từ Cloudflare). Bot/link preview không được tính. IP chỉ lưu dạng băm.

### Trang quản trị quảng cáo: `/admin`
Đăng nhập bằng `ADMIN_PASSWORD`. Thêm/sửa/xoá/bật-tắt mã quảng cáo HTML/JS của bất kỳ mạng nào, chọn vị trí
(`<head>`, cuối `<body>`, banner dưới menu, dưới công cụ, cột bên, giữa nội dung, trên footer, thanh dính đáy),
lọc theo thiết bị và ngôn ngữ, sửa `/ads.txt`.

Quảng cáo được trình duyệt tải qua `/api/ads` nên **lưu là có hiệu lực ngay** (bộ nhớ đệm trình duyệt tối đa 60 giây), trang tĩnh không phải dựng lại.
Riêng **thẻ `<meta>` xác minh website** (vd `google-adsense-account`) phải nằm sẵn trong HTML: khai báo ở biến `SITE_META_TAGS` rồi deploy lại.

## Chạy trên máy

Yêu cầu **Node.js 22 hoặc 24 LTS** (công cụ `wrangler` của Cloudflare cần Node ≥ 22).

```bash
npm install
cp .env.example .env.local     # rồi sửa các giá trị
npm run db:migrate:local       # tạo bảng trong D1 giả lập (lưu ở .wrangler/)
npm run dev                    # http://localhost:3000
```

`npm run preview` build bằng OpenNext và chạy thử trong `workerd` (đúng môi trường của Cloudflare) tại http://localhost:8787.

## Deploy lên Cloudflare

Gói **Workers Free** là đủ để bắt đầu (worker nén ~1,4 MiB, dưới giới hạn 3 MiB). Nếu bảng điều khiển Cloudflare báo
nhiều lỗi *1102 Worker exceeded resource limits* thì nâng lên Workers Paid.

1. **Tên miền**: Cloudflare → *Add a domain* → nhập tên miền, gói Free → đổi nameserver ở nơi mua tên miền.
2. **Tạo D1 và R2** (chạy ở thư mục dự án):
   ```bash
   npx wrangler login
   npx wrangler d1 create qrcode-db          # chép database_id vào wrangler.jsonc
   npx wrangler r2 bucket create qrcode-files
   npm run db:migrate:remote                 # tạo bảng trên D1 thật
   ```
3. **Nối GitHub**: *Workers & Pages → Create → Import a repository* → chọn repo.
   - Build command: `npx @opennextjs/cloudflare build`
   - Deploy command: `npx @opennextjs/cloudflare deploy`
   - Build variables: `NEXT_PUBLIC_SITE_URL=https://ten-mien-cua-ban`, `NEXT_PUBLIC_SITE_NAME=...`, (tuỳ chọn) `SITE_META_TAGS=...`
4. **Bí mật** (nhập trực tiếp, không lưu vào code):
   ```bash
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put ADMIN_SECRET
   npx wrangler secret put GOOGLE_CLIENT_ID
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   ```
5. **Tên miền cho Worker**: Worker → *Settings → Domains & Routes → Add → Custom domain*.
6. **Google OAuth**: thêm redirect URI `https://ten-mien-cua-ban/api/auth/google/callback`.

Từ đó, mỗi lần `git push` lên nhánh `main` Cloudflare tự build và deploy.
Nên deploy qua GitHub thay vì `npm run deploy` trên máy: build trên máy sẽ đóng gói cả giá trị trong `.env.local` vào worker.

Khi thay đổi cấu trúc CSDL: thêm file `migrations/000X_ten.sql` rồi chạy `npm run db:migrate:remote`.

### Biến môi trường

| Biến | Đặt ở đâu | Ý nghĩa |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Build variables | Domain chính (canonical, sitemap, link QR động). **Phải đúng trước khi build.** |
| `NEXT_PUBLIC_SITE_NAME` | Build variables | Tên website |
| `SITE_META_TAGS` | Build variables | (Tuỳ chọn) thẻ meta xác minh, dạng `ten=gia-tri;ten2=gia-tri2` |
| `ADMIN_PASSWORD` | Secret | Mật khẩu vào `/admin` |
| `ADMIN_SECRET` | Secret | Chuỗi ngẫu nhiên dài, ký cookie admin và băm IP lượt quét |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Secret | OAuth client của Google |

### Cấu hình đăng nhập Google
1. [Google Cloud Console](https://console.cloud.google.com/) → tạo project → **APIs & Services → OAuth consent screen**: *External*, tên app, email hỗ trợ, scope `email`, `profile`, `openid`.
2. **Credentials → Create credentials → OAuth client ID** → *Web application*.
3. **Authorized redirect URIs**: `http://localhost:3000/api/auth/google/callback` (máy dev) và `https://ten-mien-cua-ban/api/auth/google/callback`.
4. Bấm **Publish app** trong OAuth consent screen trước khi cho người ngoài đăng nhập (chế độ *Testing* chỉ cho email test).

## Cấu trúc chính

```
wrangler.jsonc              # Cấu hình Worker + binding D1 (DB) và R2 (FILES)
open-next.config.ts         # OpenNext: trang tĩnh phát từ static assets
migrations/                 # Cấu trúc bảng D1
src/
  middleware.ts             # Tự chuyển hướng sang /{ngôn ngữ} (Edge runtime)
  app/[locale]/             # Trang công khai, login/register, dashboard (+ server actions)
  app/admin/                # Trang quản trị quảng cáo
  app/api/                  # ads, auth (Google OAuth, đăng xuất, me)
  app/r/[slug]/route.ts     # Link QR động: ghi lượt quét rồi chuyển hướng
  app/f/[id]/route.ts       # Phát file PDF từ R2
  app/sitemap.ts, robots.ts, ads.txt/route.ts
  components/               # QrGenerator, QrScanner, dashboard/, ads/, auth/
  i18n/                     # Cấu hình ngôn ngữ + từ điển JSON
  lib/db.ts                 # Lấy binding D1 / R2
  lib/user-auth.ts          # Phiên người dùng + Google OAuth
  lib/dynamic-qr.ts         # Mã QR động, PDF, lượt quét, thống kê
  lib/ads/                  # Cấu hình quảng cáo (D1) + thẻ meta xác minh
  lib/auth.ts               # Phiên đăng nhập admin (cookie ký HMAC)
```
