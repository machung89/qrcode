import type { Post } from "@/lib/blog";

export const whatIsAQrCode: Post = {
  id: "what-is-a-qr-code",
  date: "2026-10-12",
  cta: "",
  translations: {
    vi: {
      slug: "ma-qr-la-gi",
      title: "Mã QR là gì? Cấu tạo, cách hoạt động và ứng dụng thực tế",
      description:
        "Tìm hiểu mã QR là gì, mã QR chứa được bao nhiêu dữ liệu, vì sao bị che một phần vẫn quét được và những cách dùng mã QR phổ biến nhất hiện nay.",
      body: `
Mã QR có mặt ở khắp nơi: trên hoá đơn, menu quán cà phê, bao bì sản phẩm, vé tàu và cả màn hình thanh toán. Nhưng mã QR thực chất là gì, chứa được bao nhiêu thông tin và vì sao bị bẩn một góc vẫn quét được? Bài viết này giải thích ngắn gọn, dễ hiểu và đủ để bạn tự tạo một mã QR dùng được ngay.

## Mã QR là gì?

**QR** là viết tắt của **Quick Response** (phản hồi nhanh). Đây là một loại mã vạch hai chiều do Masahiro Hara và công ty Denso Wave (thuộc tập đoàn Toyota, Nhật Bản) phát minh năm 1994 để theo dõi linh kiện ô tô trong nhà máy. Khác với mã vạch một chiều chỉ đọc theo chiều ngang, mã QR lưu dữ liệu theo cả chiều ngang lẫn chiều dọc nên chứa được nhiều thông tin hơn hẳn trên cùng một diện tích.

Ngày nay mã QR là chuẩn quốc tế (ISO/IEC 18004) và miễn phí bản quyền: ai cũng có thể tạo và đọc mã QR mà không phải trả phí.

## Cấu tạo của một mã QR

Nhìn kỹ một mã QR, bạn sẽ thấy các phần có nhiệm vụ riêng:

- **Ba ô vuông lớn ở các góc** (finder pattern): giúp camera nhận ra đây là mã QR và xác định hướng, dù bạn cầm điện thoại nghiêng hay ngược.
- **Ô vuông nhỏ căn chỉnh** (alignment pattern): giúp đọc đúng khi mã bị cong hoặc chụp xiên.
- **Đường định thời** (timing pattern): hàng ô đen trắng xen kẽ giúp máy đếm đúng số ô.
- **Vùng dữ liệu**: phần còn lại chứa nội dung và dữ liệu sửa lỗi.
- **Vùng trống xung quanh** (quiet zone): lề trắng tối thiểu rộng 4 ô, giúp tách mã khỏi hình nền.

## Mã QR chứa được bao nhiêu dữ liệu?

Mã QR có 40 phiên bản (version). Phiên bản 1 nhỏ nhất gồm 21 × 21 ô, phiên bản 40 lớn nhất gồm 177 × 177 ô. Ở mức sửa lỗi thấp nhất, phiên bản 40 chứa tối đa:

| Loại dữ liệu | Dung lượng tối đa |
| --- | --- |
| Chỉ chữ số | 7.089 ký tự |
| Chữ và số (chữ hoa) | 4.296 ký tự |
| Dữ liệu nhị phân (UTF-8) | 2.953 byte |

Trên thực tế, nội dung càng dài thì mã càng dày ô và càng khó quét khi in nhỏ. Một đường link ngắn hoặc một [mã QR động](/vi/blog/ma-qr-tinh-va-ma-qr-dong) sẽ cho mã thoáng và dễ quét hơn nhiều.

## Vì sao mã QR bị che một phần vẫn quét được?

Mã QR dùng thuật toán sửa lỗi Reed–Solomon. Bạn có thể chọn một trong bốn mức:

| Mức | Khôi phục được khoảng | Khi nào dùng |
| --- | --- | --- |
| L (Low) | 7% dữ liệu | Màn hình, môi trường sạch |
| M (Medium) | 15% dữ liệu | Mặc định cho đa số trường hợp |
| Q (Quartile) | 25% dữ liệu | In ấn ngoài trời, dễ trầy xước |
| H (High) | 30% dữ liệu | Có chèn logo giữa mã |

Nhờ đó bạn có thể đặt logo vào giữa mã QR mà vẫn quét được, miễn là chọn mức H và logo không quá lớn.

> **Mẹo:** Trên [trình tạo mã QR](/vi) của chúng tôi, khi bạn tải logo lên, mức sửa lỗi sẽ tự chuyển sang H để mã vẫn đọc tốt.

## Mã QR dùng để làm gì?

Mã QR có thể chứa nhiều loại nội dung, mỗi loại khiến điện thoại làm một việc khác nhau khi quét:

- **Mở trang web**: [mã QR link](/vi/qr/url) cho website, trang bán hàng, khảo sát.
- **Kết nối WiFi**: khách quét là vào mạng, không cần gõ mật khẩu. Xem hướng dẫn [tạo mã QR WiFi](/vi/blog/tao-ma-qr-wifi).
- **Chuyển khoản ngân hàng**: [mã VietQR](/vi/qr/bank) điền sẵn số tài khoản, số tiền và nội dung.
- **Lưu danh bạ**: [mã QR vCard](/vi/qr/vcard) trên danh thiếp.
- **Gọi điện, nhắn tin, gửi email, mở Zalo hoặc WhatsApp**.
- **Chỉ đường**: [mã QR vị trí](/vi/qr/location) mở Google Maps.
- **Mở trang mạng xã hội, tải ứng dụng, thêm sự kiện vào lịch**.

## Mã QR có an toàn không?

Bản thân mã QR chỉ là cách lưu dữ liệu, không chứa virus. Rủi ro nằm ở **đường link bên trong**: kẻ gian có thể dán đè mã QR giả lên mã thật ở bãi xe, cây ATM hay quán ăn để dẫn bạn tới trang lừa đảo. Hãy luôn đọc địa chỉ trang hiện ra trước khi bấm mở, đặc biệt khi được yêu cầu đăng nhập hay thanh toán. Xem thêm [cách quét mã QR an toàn](/vi/blog/cach-quet-ma-qr).

## Tự tạo mã QR trong 1 phút

1. Mở [trình tạo mã QR miễn phí](/vi).
2. Chọn loại mã: link, WiFi, chuyển khoản, vCard...
3. Nhập nội dung, đổi màu, chọn khung và chèn logo nếu muốn.
4. Tải về dạng PNG để dùng trên web hoặc SVG để in sắc nét.

Trước khi in số lượng lớn, đừng quên đọc [các mẹo in mã QR để luôn quét được](/vi/blog/meo-in-ma-qr).
`,
    },
    en: {
      slug: "what-is-a-qr-code",
      title: "What Is a QR Code? How It Works and What You Can Use It For",
      description:
        "Learn what a QR code is, how much data it can hold, why it still scans when partly damaged, and the most popular ways businesses use QR codes today.",
      body: `
QR codes are everywhere: on receipts, café menus, product packaging, train tickets and payment terminals. But what exactly is a QR code, how much information can it hold, and why does it still work when a corner is scratched? This guide explains it in plain language, so you can create a code that works the first time.

## What is a QR code?

**QR** stands for **Quick Response**. It is a two-dimensional barcode invented in 1994 by Masahiro Hara at Denso Wave, a Toyota group company in Japan, to track car parts in factories. A classic barcode is read in one direction only; a QR code stores data both horizontally and vertically, so it holds far more information in the same space.

Today the QR code is an international standard (ISO/IEC 18004) and royalty-free: anyone can create and read QR codes without paying a licence fee.

## The anatomy of a QR code

Look closely and you will see several parts, each with its own job:

- **Three large squares in the corners** (finder patterns) tell the camera it is looking at a QR code and which way is up, even if you hold the phone at an angle.
- **A small alignment square** helps the reader cope with curved surfaces and skewed photos.
- **Timing patterns**, rows of alternating black and white modules, let the reader count the grid correctly.
- **The data area** contains your content plus error-correction data.
- **The quiet zone**, a blank margin at least four modules wide, separates the code from its surroundings.

## How much data can a QR code hold?

There are 40 QR code versions. Version 1 is the smallest at 21 × 21 modules; version 40 is the largest at 177 × 177. At the lowest error-correction level, version 40 can store up to:

| Data type | Maximum capacity |
| --- | --- |
| Numeric only | 7,089 characters |
| Alphanumeric (upper case) | 4,296 characters |
| Binary (UTF-8) | 2,953 bytes |

In practice, the longer the content, the denser the code and the harder it is to scan when printed small. A short link or a [dynamic QR code](/en/blog/static-vs-dynamic-qr-codes) keeps the pattern open and easy to read.

## Why does a damaged QR code still scan?

QR codes use Reed–Solomon error correction, with four levels to choose from:

| Level | Recovers roughly | Best for |
| --- | --- | --- |
| L (Low) | 7% of the data | Screens, clean environments |
| M (Medium) | 15% of the data | The default for most uses |
| Q (Quartile) | 25% of the data | Outdoor print, scuffed surfaces |
| H (High) | 30% of the data | Codes with a logo in the middle |

That is why you can place a logo in the centre of a QR code and it still works, as long as you choose level H and keep the logo reasonably small.

> **Tip:** In our [QR code generator](/en), uploading a logo automatically switches error correction to H so your code stays readable.

## What can you use QR codes for?

A QR code can hold different kinds of content, and each one makes the phone do something different:

- **Open a website**: a [URL QR code](/en/qr/url) for your homepage, online shop or survey.
- **Join WiFi**: guests scan and connect without typing a password. See our guide to [WiFi QR codes](/en/blog/wifi-qr-code).
- **Save a contact**: a [vCard QR code](/en/qr/vcard) on your business card.
- **Call, text, email or start a WhatsApp chat**.
- **Get directions**: a [location QR code](/en/qr/location) opens Google Maps.
- **Get paid**: [PayPal](/en/qr/paypal) or [crypto wallet](/en/qr/crypto) QR codes.
- **Follow you on social media, download your app, or add an event to the calendar**.

## Are QR codes safe?

A QR code is just a way of storing data; it cannot contain a virus by itself. The risk is **the link inside it**. Scammers sometimes stick fake QR codes over real ones on parking meters or restaurant tables to send people to phishing pages. Always check the address your phone shows before opening it, especially if the page asks you to log in or pay. Read more in [how to scan a QR code safely](/en/blog/how-to-scan-a-qr-code).

## Create your own QR code in one minute

1. Open the [free QR code generator](/en).
2. Choose a type: link, WiFi, vCard, location and more.
3. Enter your content, change the colours, pick a frame and add your logo if you like.
4. Download a PNG for the web or an SVG for sharp printing.

Before printing in bulk, read our [QR code printing tips](/en/blog/qr-code-printing-tips) so every code scans first time.
`,
    },
  },
};
