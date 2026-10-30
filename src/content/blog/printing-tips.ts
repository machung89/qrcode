import type { Post } from "@/lib/blog";

export const printingTips: Post = {
  id: "printing-tips",
  date: "2026-10-29",
  cta: "",
  translations: {
    vi: {
      slug: "meo-in-ma-qr",
      title: "10 mẹo in mã QR để luôn quét được: kích thước, màu sắc, logo",
      description:
        "Mã QR nên in kích thước bao nhiêu? Màu nào dễ quét? Chèn logo thế nào cho an toàn? 10 mẹo thiết kế và in mã QR cho tờ rơi, bao bì, poster và danh thiếp.",
      body: `
Một mã QR đẹp mà không quét được thì vô dụng, và thường chỉ phát hiện ra khi đã in xong hàng nghìn bản. Dưới đây là 10 mẹo thực tế giúp mã QR của bạn quét nhạy trên mọi điện thoại, từ danh thiếp nhỏ tới băng rôn ngoài trời.

## 1. Chọn đúng kích thước

Quy tắc dễ nhớ: **khoảng cách quét chia 10 bằng cạnh mã QR**. Khách đứng cách 1 m thì mã nên rộng ít nhất 10 cm.

| Vị trí | Khoảng cách quét | Kích thước tối thiểu |
| --- | --- | --- |
| Danh thiếp, nhãn sản phẩm | 10–20 cm | 2 × 2 cm |
| Tờ rơi, menu để bàn | 20–30 cm | 3 × 3 cm |
| Poster A3 trên tường | 1 m | 10 × 10 cm |
| Băng rôn, biển hiệu | 3–5 m | 30–50 cm |

## 2. Giữ nội dung ngắn

Nội dung càng dài, mã càng nhiều ô nhỏ và càng khó quét khi in nhỏ. Dùng link ngắn, hoặc dùng [mã QR động](/vi/blog/ma-qr-tinh-va-ma-qr-dong): mã động luôn chỉ chứa một link rất ngắn nên luôn thoáng.

## 3. Màu mã tối trên nền sáng

Camera đọc mã dựa vào độ chênh sáng tối. Mã **đen, xanh đậm, nâu đậm** trên nền **trắng, kem, vàng nhạt** là an toàn nhất. Tránh:

- Màu mã và màu nền gần nhau (xám trên xám, đỏ trên cam).
- **Đảo màu** (mã sáng trên nền tối): nhiều camera và app cũ không đọc được.
- Dải màu chuyển quá gắt từ đậm sang nhạt bên trong mã.

## 4. Chừa lề trắng xung quanh

Mã cần một **vùng trống rộng ít nhất bằng 4 ô** ở cả bốn phía. Đừng để chữ, hình ảnh hay mép giấy sát vào mã. Trình tạo mã của chúng tôi có thanh chỉnh **lề (vùng trống)** để bạn điều chỉnh.

## 5. Chèn logo đúng cách

- Bật mức sửa lỗi **H (30%)** khi có logo. Công cụ của chúng tôi tự chuyển sang H khi bạn tải logo lên.
- Logo chỉ nên chiếm **tối đa khoảng 20–25%** diện tích mã và đặt ở giữa.
- Không che ba ô vuông lớn ở các góc.

## 6. Thêm lời kêu gọi hành động

Một dòng chữ ngắn như **"Quét để xem menu"**, **"Quét để kết nối WiFi"** hay **"Quét để thanh toán"** làm tăng đáng kể số người quét. Dùng tính năng **Khung** để thêm chữ ngay sát mã.

## 7. Xuất file vector cho bản in

Tải mã dạng **SVG** khi gửi nhà in: phóng to bao nhiêu cũng không vỡ nét. PNG phù hợp cho web, mạng xã hội và in nhỏ; nếu dùng PNG để in, chọn kích thước 2000 px.

## 8. Chú ý chất liệu và bề mặt

- Bề mặt **bóng** dễ bị chói đèn: ưu tiên giấy mờ hoặc cán màng mờ.
- Bề mặt **cong** như chai, cốc: in mã nhỏ lại hoặc đặt theo chiều dọc của thân chai.
- Ngoài trời: dùng chất liệu chống nước, chống phai và mức sửa lỗi Q hoặc H.

## 9. Đặt mã ở nơi dễ quét

Ngang tầm mắt, đủ sáng, có chỗ cho người đứng quét. Tránh đặt mã trên biển quảng cáo ven đường cao tốc, trong toa tàu điện ngầm không có sóng, hoặc trên màn hình chạy quá nhanh.

## 10. Luôn quét thử trước khi in hàng loạt

In thử một bản đúng kích thước thật, quét bằng ít nhất **một iPhone và một điện thoại Android**, ở khoảng cách thật và ánh sáng thật. Đừng chỉ thử trên màn hình máy tính.

> **Mẹo:** Dùng mã QR động cho bản in số lượng lớn. Nếu lỡ sai link, bạn chỉ cần sửa trong bảng điều khiển thay vì in lại.

Sẵn sàng thiết kế? Mở [trình tạo mã QR](/vi), chọn mẫu có sẵn, tuỳ chỉnh màu, khung, logo rồi tải về.
`,
    },
    en: {
      slug: "qr-code-printing-tips",
      title: "10 QR Code Printing Tips So Every Code Scans: Size, Colour and Logo",
      description:
        "What size should a printed QR code be? Which colours scan best? How big can the logo be? Ten tips for QR codes on flyers, packaging and posters.",
      body: `
A beautiful QR code that nobody can scan is worthless, and you usually find out after printing thousands of copies. Here are ten practical tips that keep your codes readable on every phone, from tiny business cards to outdoor banners.

## 1. Choose the right size

An easy rule: **scanning distance divided by 10 equals the code's width**. If people stand 1 m away, the code should be at least 10 cm wide.

| Placement | Scanning distance | Minimum size |
| --- | --- | --- |
| Business card, product label | 10–20 cm | 2 × 2 cm |
| Flyer, table menu | 20–30 cm | 3 × 3 cm |
| A3 poster on a wall | 1 m | 10 × 10 cm |
| Banner, shop sign | 3–5 m | 30–50 cm |

## 2. Keep the content short

The longer the content, the more and smaller the modules, and the harder the code is to scan when printed small. Use a short link, or a [dynamic QR code](/en/blog/static-vs-dynamic-qr-codes), which always contains a very short link and stays clean.

## 3. Dark code on a light background

Cameras read QR codes by contrast. **Black, dark blue or dark brown** on **white, cream or pale yellow** is the safest choice. Avoid:

- Similar colours for code and background (grey on grey, red on orange).
- **Inverted codes** (light code on dark background): many cameras and older apps cannot read them.
- Gradients that fade from dark to light inside the code.

## 4. Leave a white margin

A QR code needs a **quiet zone at least four modules wide** on all sides. Do not let text, images or the paper edge touch the code. Our generator has a **quiet zone** slider to adjust it.

## 5. Add your logo the right way

- Use error correction level **H (30%)** with a logo. Our tool switches to H automatically when you upload one.
- Keep the logo to **about 20–25% of the code area** at most, centred.
- Never cover the three large squares in the corners.

## 6. Add a call to action

A short line such as **"Scan for the menu"**, **"Scan to join WiFi"** or **"Scan to pay"** noticeably increases scans. Use the **Frame** feature to put the text right next to the code.

## 7. Export vector files for print

Download **SVG** for your printer: it stays sharp at any size. PNG is fine for the web, social media and small prints; if you print a PNG, choose 2000 px.

## 8. Mind the material and surface

- **Glossy** surfaces cause glare: prefer matte paper or matte lamination.
- **Curved** surfaces such as bottles and cups: make the code smaller or place it vertically along the bottle.
- Outdoors: use waterproof, fade-resistant materials and error correction Q or H.

## 9. Place it where people can scan

At eye level, in good light, with room to stand. Avoid motorway billboards, underground trains with no signal, or screens that change too quickly.

## 10. Always test before printing in bulk

Print one copy at the real size and scan it with at least **one iPhone and one Android phone**, at the real distance and in real lighting. Testing on a computer screen is not enough.

> **Tip:** Use dynamic QR codes for large print runs. If a link is wrong, fix it in the dashboard instead of reprinting.

Ready to design? Open the [QR code generator](/en), pick a template, customise colours, frame and logo, then download.
`,
    },
  },
};
