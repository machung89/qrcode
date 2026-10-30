# QR Code Generator (Next.js 16)

Website tạo mã QR miễn phí: đa ngôn ngữ, chuẩn SEO, có trang quản trị để gắn mã quảng cáo của bất kỳ mạng nào.

## Tính năng

- **10 loại mã QR**: URL, văn bản, email, điện thoại, SMS, WiFi, vCard, vị trí (Google Maps), sự kiện (lịch), WhatsApp.
- **Tùy chỉnh thiết kế**: màu, gradient, nền trong suốt, kiểu chấm, kiểu góc, màu góc, lề, mức sửa lỗi, chèn logo.
- **Tải xuống** PNG / JPG / WEBP (300–2000 px) hoặc SVG vector.
- **Quét mã QR** từ ảnh (tải lên, kéo thả, dán) hoặc camera.
- Mã QR được tạo hoàn toàn trên trình duyệt, không gửi dữ liệu về server.

### Đa ngôn ngữ
8 ngôn ngữ: `en, vi, es, fr, de, pt, ja, ko`, URL dạng `/vi/qr/wifi`. Truy cập `/` sẽ tự chuyển theo cookie hoặc ngôn ngữ trình duyệt.

Thêm ngôn ngữ: tạo `src/i18n/dictionaries/xx.json` (khóa nào thiếu sẽ tự dùng tiếng Anh), rồi thêm `xx` vào `src/i18n/config.ts` và `src/i18n/get-dictionary.ts`.

### SEO
- 112 trang được prerender tĩnh (8 ngôn ngữ × trang chủ, 10 trang loại QR, trang quét, chính sách, điều khoản).
- Mỗi trang có title/description riêng, canonical, `hreflang` cho mọi ngôn ngữ + `x-default`, Open Graph, Twitter card.
- JSON-LD: `WebApplication`, `FAQPage`, `BreadcrumbList`.
- `/sitemap.xml` (kèm hreflang), `/robots.txt`, `/ads.txt`, trang 404 trả đúng mã 404.

### Tài khoản người dùng & mã QR động
- **Đăng ký / đăng nhập bằng email + mật khẩu** (`/{ngôn ngữ}/register`, `/{ngôn ngữ}/login`): mật khẩu băm bằng scrypt, giới hạn 8 lần đăng nhập sai / 15 phút.
- **Đăng nhập bằng Google** (OAuth 2.0 + PKCE, không dùng thư viện bên thứ ba). Phiên đăng nhập lưu 30 ngày.
  Nếu email Google trùng với tài khoản đã đăng ký bằng mật khẩu, hai tài khoản được gộp; mật khẩu của tài khoản chưa xác minh email sẽ bị vô hiệu để chống chiếm tài khoản.
  Khi chưa cấu hình Google, nút Google được ẩn và chỉ còn đăng ký bằng email.
- **Bảng điều khiển** `/{ngôn ngữ}/dashboard`: danh sách mã, tổng lượt quét / hôm nay / 30 ngày.
- **Mã QR động**: mã chứa link ngắn `/r/{mã}`; đổi link đích, thay file, tạm dừng hoặc xoá bất cứ lúc nào mà không cần in lại.
- **Mã QR cho file PDF**: tải PDF tối đa 10 MB, quét mã sẽ mở PDF (`/f/{id}`). Có thể thay file sau này.
- **Thống kê lượt quét**: tổng, người dùng duy nhất, lần quét gần nhất, biểu đồ 30 ngày, phân theo thiết bị, hệ điều hành, trình duyệt, quốc gia. Bot/link preview (Facebook, Zalo, Telegram...) không được tính. IP chỉ lưu dạng băm.
- Thiết kế (mẫu, khung, logo...) của từng mã được lưu lại.

## Cài đặt

Yêu cầu **Node.js 22 hoặc 24 LTS** (Node 20 đã hết hạn hỗ trợ; thư viện SQLite không có bản dựng sẵn cho Node 20).
Nếu đã chạy `npm install` bằng phiên bản Node khác, chạy lại `npm rebuild better-sqlite3` sau khi đổi Node.

```bash
npm install
cp .env.example .env.local   # rồi sửa các giá trị
npm run dev                  # http://localhost:3000
```

Bản production:

```bash
npm run build
npm start
```

### Biến môi trường

| Biến | Ý nghĩa |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Domain chính, vd `https://qr.example.com` (dùng cho canonical, sitemap). **Phải đặt trước khi build.** |
| `NEXT_PUBLIC_SITE_NAME` | Tên website |
| `ADMIN_PASSWORD` | Mật khẩu vào `/admin` |
| `ADMIN_SECRET` | Chuỗi ngẫu nhiên dài để ký cookie đăng nhập |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth client của Google để người dùng đăng nhập |
| `DATA_DIR` | (tùy chọn) Thư mục lưu dữ liệu, mặc định `./data` (`ads.json`, CSDL `app.db`, file PDF trong `uploads/`) |

### Cấu hình đăng nhập Google

1. Vào [Google Cloud Console](https://console.cloud.google.com/) → tạo project → **APIs & Services → OAuth consent screen**: chọn *External*, điền tên app, email hỗ trợ, scope `email`, `profile`, `openid`.
2. **Credentials → Create credentials → OAuth client ID** → loại *Web application*.
3. **Authorized redirect URIs** thêm:
   - `http://localhost:3000/api/auth/google/callback` (khi phát triển)
   - `https://ten-mien-cua-ban/api/auth/google/callback` (khi chạy thật)
4. Chép Client ID / Client secret vào `.env.local` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) rồi khởi động lại server.
5. Trước khi cho người ngoài đăng nhập, bấm **Publish app** trong OAuth consent screen (chế độ *Testing* chỉ cho các email test).

### Thống kê quốc gia
Quốc gia được lấy từ header của CDN: `CF-IPCountry` (Cloudflare) hoặc `x-vercel-ip-country`. Nếu đặt website sau Cloudflare thì có sẵn; nếu không, cột quốc gia hiện "—".

## Trang quản trị quảng cáo: `/admin`

Đăng nhập bằng `ADMIN_PASSWORD`. Tại đây có thể:

- Thêm / sửa / nhân bản / xóa / bật-tắt từng mẫu quảng cáo; công tắc tổng để tắt toàn bộ quảng cáo.
- Dán **mã HTML/JS bất kỳ** (AdSense, Ad Manager, Adsterra, PropellerAds, Monetag, Media.net, Ezoic, banner tự bán...). Có sẵn mẫu cho AdSense, Adsterra, script chung và banner ảnh.
- Chọn **vị trí**: `<head>`, cuối `<body>`, banner dưới menu, dưới công cụ tạo QR, cột bên, giữa nội dung, trên footer, thanh dính đáy màn hình.
- Lọc theo **thiết bị** (mọi thiết bị / desktop / di động) và theo **ngôn ngữ**.
- Sửa nội dung **`/ads.txt`**.

Khi bấm lưu, các trang tĩnh được tạo lại ngay (on-demand revalidation), không cần build lại.
Thẻ `<meta>` đặt ở vị trí `<head>` (vd `google-adsense-account`) được render sẵn từ server để mạng quảng cáo xác minh được website.

## Lưu ý khi deploy

Dữ liệu (cấu hình quảng cáo `data/ads.json`, CSDL SQLite `data/app.db`, file PDF `data/uploads/`) được lưu trên ổ đĩa,
nên cần server có **ổ đĩa ghi được và lưu lâu dài** và chạy **1 tiến trình**: VPS, Docker (mount volume cho `data/`),
Railway, Render (có disk)... Không chạy được trên Vercel/Netlify (serverless, file system chỉ đọc).

**Sao lưu**: chỉ cần sao lưu thư mục `data/` (với SQLite đang chạy, dùng `sqlite3 data/app.db ".backup backup.db"`).

Nếu server đặt sau Nginx/Cloudflare, nhớ chuyển tiếp header `X-Forwarded-For` để đếm người dùng duy nhất chính xác.

## Cấu trúc chính

```
src/
  proxy.ts                  # Tự chuyển hướng sang /{ngôn ngữ}
  app/[locale]/             # Trang public (layout, trang chủ, qr/[type], scanner, privacy, terms)
  app/admin/                # Đăng nhập + dashboard quảng cáo + server actions
  app/sitemap.ts, robots.ts, ads.txt/route.ts
  components/QrGenerator.tsx, QrScanner.tsx
  components/ads/           # AdsProvider, AdSlot, AdScripts (chèn và chạy mã quảng cáo)
  i18n/                     # Cấu hình ngôn ngữ + từ điển JSON
  lib/qr-types.ts           # Định nghĩa trường + tạo nội dung mã QR
  lib/ads/                  # Kiểu dữ liệu và lưu trữ quảng cáo
  lib/auth.ts               # Phiên đăng nhập admin (cookie ký HMAC)
  app/[locale]/login, dashboard/   # Đăng nhập + bảng điều khiển người dùng + server actions
  app/api/auth/             # Google OAuth, đăng xuất, /api/auth/me
  app/r/[slug]/route.ts     # Link QR động: ghi lượt quét rồi chuyển hướng
  app/f/[id]/route.ts       # Phát file PDF đã tải lên
  components/dashboard/     # Form tạo/sửa mã, biểu đồ, thống kê
  lib/db.ts                 # SQLite (tự tạo bảng khi chạy lần đầu)
  lib/user-auth.ts          # Phiên người dùng + Google OAuth
  lib/dynamic-qr.ts         # Mã QR động, file PDF, lượt quét, thống kê
```
